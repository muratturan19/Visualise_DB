# LLM Guide

## 📌 Purpose

Bu rehber, ticaret şirketlerinde doğal dilden gelen karmaşık rapor ve KPI isteklerini doğru iş mantığıyla SQL'e dönüştürmek için hazırlanmıştır. Özellikle **Satılan Malın Maliyeti (SMM)**, **Genel Gider (GG)** dağıtımı, **w_çarpanı** ve **müşteri/ürün/yıl bazında karlılık** hesaplarında formüllerin adım adım uygulanması önemlidir.

---

## 1. Temel Kavramlar ve Mapping

| Terim | Açıklama | SQL Mapping / Alan |
|-------|----------|--------------------|
| **w_çarpanı** | Ürün bazında GG dağıtım katsayısı | `Urunler.w_carpani` |
| **Toplam GG** | Belirli bir dönem için genel gider toplamı | `SUM(Finans.tutar)` where `Finans.tip = 'Genel Gider'` |
| **Ürün Adedi** | Toplam ürün sayısı | `SELECT COUNT(*) FROM Urunler` |
| **GG_Unit** | Ürün başına GG, w_çarpanına göre dağıtılmış | (aşağıdaki formül) |
| **Satınalma Maliyeti** | Dönemdeki toplam alış maliyeti | `SUM(SatinAlma.toplam_tutar)` |
| **SMM** | Satılan Malın Maliyeti | `Satınalma Maliyeti + GG_Unit` |
| **Karlılık** | Satış - SMM | |

---

## 2. Modüler Hesaplama Zinciri

### 2.1 Ürün Başına Genel Gider (GG_Unit)

```text
GG_Unit = (Toplam GG × w_çarpanı) / Ürün Adedi
```
- **Toplam GG:** Finans tablosunda dönem bazında `tip='Genel Gider'` kayıtlarının toplamı.
- **Ürün Adedi:** `Urunler` tablosundaki ürün sayısı.
- **w_çarpanı:** `Urunler` tablosundaki ilgili değer.

### 2.2 Satılan Malın Maliyeti (SMM)

```text
SMM = Satınalma Maliyeti + GG_Unit
```
- **Satınalma Maliyeti:** `SatinAlma.toplam_tutar` değerlerinin toplamı.
- **GG_Unit:** Yukarıdaki formülle hesaplanan değer.

### 2.3 Müşteri/Ürün/Yıl Bazında Karlılık

```text
Karlılık = Toplam Satış - Toplam SMM
```
- **Toplam Satış:** `Satislar.toplam_fiyat` değerlerinin toplamı.
- **Toplam SMM:** İlgili müşteri/ürün/dönem için hesaplanan SMM toplamı.

---

## 3. SQL Şablonları

Aşağıdaki örnekler, GG dağıtımı, SMM ve karlılık hesapları için temel SQL şablonlarını gösterir.

```sql
WITH gg_total AS (
  SELECT strftime('%Y', tarih) AS yil, SUM(tutar) AS toplam_gg
  FROM Finans
  WHERE tip = 'Genel Gider'
  GROUP BY yil
),
urun_adedi AS (
  SELECT COUNT(*) AS urun_sayisi FROM Urunler
),
urun_gg AS (
  SELECT
    u.id AS Urun_ID,
    u.w_carpani,
    gt.yil,
    (gt.toplam_gg * u.w_carpani / ua.urun_sayisi) AS GG_Unit
  FROM Urunler u
  CROSS JOIN gg_total gt
  CROSS JOIN urun_adedi ua
)
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
GROUP BY u.id, sa.yil;
```

Karlılık hesaplaması için:

```sql
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
) smm_tablosu ON s.urun_id = smm_tablosu.Urun_ID
  AND strftime('%Y', s.tarih) = smm_tablosu.yil
GROUP BY m.id, s.urun_id, Yil;
```

---

## 4. Yanlış Yöntemler (Uyarı!)

- GG_Unit değeri, ürün/müşteri/yıl için tekrar tekrar eklenmemelidir.
- GG veya w_çarpanı alt sorgularda gereksiz yere çoğaltılıp her satıra uygulanmamalıdır.
- GG'nin tümü her müşteriye yüklenmemeli, orantılı dağıtılmalıdır.
- SMM hesaplanırken alt metrikler önce hesaplanmalı, sonra nihai formül uygulanmalıdır.

---

## 5. Field Mapping Tablosu (Hızlı Referans)

| Türkçe İfade | SQL Mapping veya Alan |
|--------------|-----------------------|
| "genel gider" | `Finans.tip = 'Genel Gider'` |
| "gider" | `Finans.tip = 'Gider'` |
| "tüm giderler" | `Finans.tip IN ('Gider', 'Genel Gider')` |
| "w çarpanı" | `Urunler.w_carpani` |
| "smm" | `[Satınalma Maliyeti] + [GG_Unit]` |

---

## 6. Debug ve Test Önerisi

- Çıkan raporlarda satış ve SMM rakamları mantıklı olmalı; kâr veya zarar satıştan büyük mutlak değere sahip olamaz.
- Ara metrikler (GG_Unit, SMM, Satış) mutlaka kontrol edilmelidir.
- Karmaşık sorgularda LLM, alt metrikleri JOIN/CTE kullanarak birleştirmelidir.
- Eksik veya çelişkili veri varsa hata döndürülmelidir.

---

## 7. Ekstra Not

"GG_Unit" kavramı kullanıcıya net şekilde öğretilmeli ve SQL sorgularında aynı isimle kullanılmalıdır. Tüm hesaplamalar adım adım ve şeffaf şekilde kurulmalıdır.
