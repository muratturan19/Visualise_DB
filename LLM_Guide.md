# LLM_Guide.md

## 📌 Amaç

Bu rehber, LLM’in ticaret şirketlerinde **doğal dilden gelen karmaşık yönetici raporları ve KPI** isteklerini **doğru iş mantığıyla, adım adım ve güvenli şekilde SQL’e çevirmesi** için hazırlanmıştır.

Özellikle **Satılan Malın Maliyeti (SMM)**, **Genel Gider (GG) dağıtımı**, **w_çarpanı** ve **müşteri/ürün/yıl bazında karlılık** gibi metriklerde, formüllerin “modüler ve adım adım” uygulanması şarttır.

---

## 1. Temel Kavramlar ve Mapping

| Terim            | Açıklama                                                         | SQL Mapping / Alan     |
|------------------|------------------------------------------------------------------|------------------------|
| **w_çarpanı**    | Ürün bazında, GG dağıtımında ağırlık katsayısı                   | `Urunler.w_carpani`    |
| **Toplam GG**    | Belirli bir dönem için toplam genel gider                        | `SUM(Finans.tutar) WHERE Finans.tip = 'Genel Gider'` |
| **Ürün Adedi**   | Toplam ürün sayısı                                               | `SELECT COUNT(*) FROM Urunler` |
| **GG_Unit**      | **Ürün başına GG**: GG'nin, w_çarpanına göre dağıtılmış hali     | (Bkz. formül aşağıda)  |
| **Satınalma Maliyeti** | Her ürünün belirli dönemdeki toplam alış maliyeti          | `SUM(SatinAlma.toplam_tutar)` |
| **SMM**          | Satılan Malın Maliyeti: Her ürün için toplam maliyet             | Satınalma + GG_Unit    |
| **Karlılık**     | Satış - SMM (müşteri/ürün/yıl bazında)                           |                        |

---

## 2. Modüler Hesaplama Zinciri

### 2.1 Ürün Başına Genel Gider (GG_Unit) Formülü

> **Her bir ürünün genel gider payı (GG_Unit):**  
> ```
> GG_Unit = (Toplam GG x ürünün w_çarpanı) / Ürün adedi
> ```
> - *Toplam GG*: Finans tablosunda, dönem (yıl/ay) bazında tip='Genel Gider' olan kayıtların toplamı.
> - *Ürün adedi*: Urunler tablosundaki toplam ürün sayısı.
> - *w_çarpanı*: Urunler tablosunda, ilgili ürünün w_carpani değeri.

### 2.2 Satılan Malın Maliyeti (SMM) Formülü

> **Her ürün için SMM:**  
> ```
> SMM = Satınalma Maliyeti + GG_Unit
> ```
> - Satınalma Maliyeti: Belirli ürün ve dönemdeki toplam alış tutarı (`SatinAlma.toplam_tutar`)
> - GG_Unit: Yukarıdaki gibi hesaplanan, o ürün için genel gider payı

### 2.3 Müşteri/Ürün/Yıl Bazında Karlılık Formülü

> **Her müşteri için (veya ürün/yıl bazında) karlılık:**  
> ```
> Karlılık = Toplam Satış - Toplam SMM
> ```
> - Toplam Satış: İlgili müşteri/ürünün toplam satış tutarı (`Satislar.toplam_fiyat`)
> - Toplam SMM: O müşteri/ürün için, dönem bazında, SMM toplamı

---

## 3. SQL Şablonları

### 3.1 Dönem Bazında Toplam GG ve Ürün Adedi

```sql
WITH gg_total AS (
  SELECT strftime('%Y', tarih) AS yil, SUM(tutar) AS toplam_gg
  FROM Finans WHERE tip = 'Genel Gider'
  GROUP BY yil
),
urun_adedi AS (
  SELECT COUNT(*) AS urun_sayisi FROM Urunler
)

### 3.2 Her Ürün İçin GG_Unit Hesabı

, urun_gg AS (
  SELECT
    u.id AS Urun_ID,
    u.w_carpani,
    gt.yil,
    (gt.toplam_gg * u.w_carpani / ua.urun_sayisi) AS GG_Unit
  FROM Urunler u
  CROSS JOIN gg_total gt
  CROSS JOIN urun_adedi ua
)

3.3 Her Ürün İçin SMM Hesabı
sql
Kopyala
Düzenle
SELECT
  u.id AS Urun_ID,
  sa.yil,
  SUM(sa.toplam_tutar) AS Satinalma_Maliyeti,
  ug.GG_Unit,
  SUM(sa.toplam_tutar) + ug.GG_Unit AS SMM
FROM Urunler u
LEFT JOIN (
  SELECT urun_id, strftime('%Y', tarih) AS yil, toplam_tutar FROM SatinAlma
) sa ON sa.urun_id = u.id
LEFT JOIN urun_gg ug ON ug.Urun_ID = u.id AND ug.yil = sa.yil
GROUP BY u.id, sa.yil
3.4 Müşteri/Ürün/Yıl Bazında Karlılık
sql
Kopyala
Düzenle
SELECT
  m.id AS Musteri_ID,
  m.isim AS Musteri,
  s.urun_id AS Urun_ID,
  strftime('%Y', s.tarih) AS Yil,
  SUM(s.toplam_fiyat) AS Toplam_Satis,
  smm_tablosu.SMM,
  SUM(s.toplam_fiyat - smm_tablosu.SMM) AS Kar
FROM Musteriler m
JOIN Satislar s ON m.id = s.musteri_id
JOIN (
  -- 3.3'teki SMM tablosu burada "smm_tablosu" olarak kullanılır
  SELECT
    u.id AS Urun_ID,
    sa.yil,
    SUM(sa.toplam_tutar) + ug.GG_Unit AS SMM
  FROM Urunler u
  LEFT JOIN (
    SELECT urun_id, strftime('%Y', tarih) AS yil, toplam_tutar FROM SatinAlma
  ) sa ON sa.urun_id = u.id
  LEFT JOIN urun_gg ug ON ug.Urun_ID = u.id AND ug.yil = sa.yil
  GROUP BY u.id, sa.yil
) smm_tablosu ON s.urun_id = smm_tablosu.Urun_ID AND strftime('%Y', s.tarih) = smm_tablosu.yil
GROUP BY m.id, s.urun_id, Yil
4. Yanlış Yöntemler (Uyarı!)
GG_Unit asla ürün/müşteri/ürün/yıl için tekrar tekrar topluca eklenmemeli.

Subquery ile GG veya w_çarpanı birden fazla çarpılıp, tekrar her satıra uygulanmamalı.

GG’nin tümünü her müşteriye/ürüne yüklemek yerine orantılı dağıt!

SMM, satış, GG ve w_çarpanı için önce alt metrikleri hesapla, sonra ana formülü uygula.

5. Field Mapping Tablosu (Hızlı Referans)
Türkçe İfade	SQL Mapping veya Alan
"genel gider"	Finans.tip = 'Genel Gider'
"gider"	Finans.tip = 'Gider'
"tüm giderler"	Finans.tip IN ('Gider', 'Genel Gider')
"w çarpanı"	Urunler.w_carpani
"smm"	[Satınalma Maliyeti] + [GG_Unit]

6. Debug ve Test Önerisi
Çıkan tablo/raporda satış ve SMM rakamları mantıklı oranda olmalı, kâr veya zarar “satıştan büyük mutlak değer” alamaz.

Her zaman ara metrikleri (GG_Unit, SMM, Satış) de kontrol et.

LLM, karmaşık sorgularda SQL’i alt metrikler üzerinden, JOIN/CTE veya backend birleştirme ile kurmalı.

Eksik veya çelişkili veri varsa hata döndür.

7. Ekstra Not
Kullanıcıya veya LLM’e “GG_Unit” (ürün başına GG) kavramı net şekilde öğretilmeli ve SQL’de de bu terim kullanılmalı.

Her hesap, adım adım, parçalı ve şeffaf şekilde kurulmalı.