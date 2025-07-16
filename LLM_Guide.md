LLM Guide
Bu dosya, LLM’in Türkçe yönetim raporları ve KPI taleplerini anladığında hangi alanlara başvuracağını ve nasıl SQL üretmesi gerektiğini açıklar.
Karmaşık hesaplamalar, özellikle “Genel Gider (GG)” ve “w_çarpanı” ile ilgili alanlarda adil ve orantılı dağıtım yapılmasına özen gösterilmelidir.

Yönetim KPI’ları ve İş Sözlüğü
Kullanıcı yönetim raporu veya KPI istediğinde aşağıdaki eşlemeleri ve hesaplama mantıklarını kullan.
Her metrik için aşağıdaki açıklama, formül ve örnek SQL mantığına sadık kal.
Eksik alan varsa hata döndür.

1. Ciro (Toplam Satış)
Açıklama: Tüm dönem toplam satış geliri

Formül: SUM(Satislar.toplam_fiyat)

Alan: Satislar.toplam_fiyat

2. Satılan Malın Maliyeti (SMM)
Açıklama: Al-sat şirketleri için SMM, Satınalma Maliyeti + (Genel Gider * w_çarpanı).
SMM müşteri veya ürün bazında sorgulanırken GG ve w_çarpanı paylaştırılarak dağıtılmalıdır.

Formül:
SMM = Toplam Satınalma Maliyeti + (Yıl bazında Genel Gider toplamı × ürünün w_çarpanı oranı)

Alanlar: SatinAlma.toplam_tutar, Finans.tip, Urunler.w_carpani

Doğru Hesaplama Mantığı:
GG (Genel Gider), toplam yıllık satışlara orantılı şekilde, müşteri veya ürün bazında paylaştırılarak eklenmeli.

Yanlış Uygulama Uyarısı:
Genel Gider’in tamamı, her müşteri/ürün için birden fazla kez veya tüm veri setine topluca eklenemez!

Örnek Doğru SQL:


-- Her yıl ve müşteri için SMM:

SELECT
  m.isim AS Musteri,
  strftime('%Y', s.tarih) AS Yil,
  SUM(s.toplam_fiyat) AS ToplamSatis,
  SUM(sa.toplam_tutar) AS SatinAlmaMaliyeti,
  -- GG payı: (o yılki GG / o yılki toplam satış) * müşterinin yıllık satış tutarı
  (gg_yil.tutar / toplam_satis_yil.toplam) * SUM(s.toplam_fiyat) AS GenelGiderPayi,
  SUM(sa.toplam_tutar) + (gg_yil.tutar / toplam_satis_yil.toplam) * SUM(s.toplam_fiyat) AS SMM
FROM Musteriler m
JOIN Satislar s ON m.id = s.musteri_id
LEFT JOIN SatinAlma sa ON s.urun_id = sa.urun_id AND strftime('%Y', s.tarih) = strftime('%Y', sa.tarih)
LEFT JOIN (
    SELECT strftime('%Y', tarih) AS yil, SUM(tutar) AS tutar FROM Finans WHERE tip = 'Genel Gider' GROUP BY yil
) gg_yil ON strftime('%Y', s.tarih) = gg_yil.yil
LEFT JOIN (
    SELECT strftime('%Y', tarih) AS yil, SUM(toplam_fiyat) AS toplam FROM Satislar GROUP BY yil
) toplam_satis_yil ON strftime('%Y', s.tarih) = toplam_satis_yil.yil
GROUP BY m.id, Yil
Yanlış SQL’e Örnek (Yapma!):


-- GG’yi her müşteri veya ürün için birden fazla kez çarpma/toplama!
SELECT SUM(Finans.tutar) * Urunler.w_carpani FROM Finans, Urunler ...


3. Brüt Kar
Açıklama: Ciro - SMM

Formül: [SUM(Satislar.toplam_fiyat)] - [SMM]

Not: SMM’yi yukarıdaki gibi doğru hesapla.

4. Net Kar
Açıklama: Brüt Kar – Toplam Gider

Formül: Brüt Kar - SUM(Finans.tutar WHERE tip='Gider')

Alanlar: Finans.tutar, Finans.tip

5. Stok Devir Hızı
Açıklama: Satılan malın ortalama stok miktarına oranı

Formül: [SMM] / AVG(Stoklar.miktar)

Alan: Stoklar.miktar

6. Çalışan Verimliliği
Açıklama: Çalışan başına üretim veya satış

Formül: SUM(Satislar.toplam_fiyat) / COUNT(Calisanlar.id)
veya SUM(Uretim.adet) / COUNT(Calisanlar.id)

7. Müşteri Bazında Satış
Açıklama: Her müşteri için toplam satış

Formül: SUM(Satislar.toplam_fiyat) GROUP BY musteri_id

8. Karlılık (Ürün/Müşteri/Bölge)
Açıklama: Satış – SMM, farklı kırılımlarda

Formül: SUM(Satislar.toplam_fiyat) - SUM([SMM]) GROUP BY [X] (X: ürün, müşteri, bölge vs.)

Not: SMM’nin ilgili kırılımda, GG payı orantılı dağıtılmalı.

Alan Eşlemeleri
"genel gider" → Finans.tip = 'Genel Gider'

"gider" → Finans.tip = 'Gider'

"tüm giderler" → Finans.tip IN ('Gider', 'Genel Gider')

"ciro" / "toplam satış" → SUM(Satislar.toplam_fiyat)

"smm" / "satılan malın maliyeti" → [Satınalma Maliyeti] + [Genel Gider * w_çarpanı]
(GG payı, yıl ve satışa orantılı dağıtılır.)

Genel Uyarı ve Yöntem
Bir formül veritabanı şemasından doğrudan hesaplanamıyorsa, hangi alanın eksik olduğunu belirten bir hata döndür.

GG (Genel Gider) ve w_çarpanı, müşteri/ürün/yıl bazında orantılı ve adil şekilde dağıtılmalı, topluca her birime yüklenmemelidir.

Her zaman en doğru iş mantığı ve örnek SQL’e sadık kal.

Yanlış veya hatalı uygulamaları engellemek için guide’daki örnekleri referans al.

Karmaşık KPI’lar için Parçalı/Modüler Guide Örneği

Müşteri/Ürün Bazında Karlılık Hesabı:
Adım 1: Ürün Bazında SMM Hesabı

Her ürün için, her yıl için:

SMM = Satınalma Maliyeti + (o ürünün w_carpani x o yılki Genel Gider payı)

Satınalma Maliyeti: SatinAlma.toplam_tutar

Genel Gider Payı: (GG_Toplam_Yil * w_carpani) / Tüm Ürünlerin w_carpani toplamı (veya satış hacmine göre oran)

SQL örneği:

sql
Kopyala
Düzenle
-- Ürün, yıl bazında SMM
SELECT
  u.id AS Urun_ID,
  strftime('%Y', sa.tarih) AS Yil,
  SUM(sa.toplam_tutar) AS Satinalma_Maliyeti,
  (gg_yil.tutar * u.w_carpani / toplam_w.w_sum) AS GG_Payi,
  SUM(sa.toplam_tutar) + (gg_yil.tutar * u.w_carpani / toplam_w.w_sum) AS SMM
FROM Urunler u
LEFT JOIN SatinAlma sa ON u.id = sa.urun_id
LEFT JOIN (
  SELECT strftime('%Y', tarih) AS yil, SUM(tutar) AS tutar FROM Finans WHERE tip = 'Genel Gider' GROUP BY yil
) gg_yil ON strftime('%Y', sa.tarih) = gg_yil.yil
LEFT JOIN (
  SELECT urun_id, SUM(w_carpani) AS w_sum FROM Urunler GROUP BY urun_id
) toplam_w ON toplam_w.urun_id = u.id
GROUP BY u.id, Yil
Adım 2: Müşteri-Ürün Satışı ile SMM Eşleşmesi

Her müşteri için, sattığı ürünün ilgili yıl ve ürün bazındaki SMM’sini bul.

Ara Hesap:

Müşteri, yıl, ürün bazında satış tutarı: Satislar.toplam_fiyat

Aynı müşteri/yıl/ürün için SMM (yukarıdaki ara tablo ile JOIN)

Adım 3: Müşteri Bazında Karlılık

Her müşteri için:

Karlılık = SUM(Satislar.toplam_fiyat - SMM)

Yani, müşteriye satılan her ürünün “satış tutarı - o ürünün SMM’si”, hepsi toplanır.

SQL Örneği:

sql
Kopyala
Düzenle
-- Müşteri, yıl, ürün bazında karlılık
SELECT
  m.id AS Musteri_ID,
  m.isim AS Musteri_Isim,
  SUM(s.toplam_fiyat) AS Toplam_Satis,
  SUM(s.toplam_fiyat - smm_tablosu.SMM) AS Kar
FROM Musteriler m
JOIN Satislar s ON m.id = s.musteri_id
JOIN (
  -- Adım 1’deki ürün, yıl bazında SMM tablosu burada smm_tablosu olarak kullanılır
  SELECT ...
) smm_tablosu ON s.urun_id = smm_tablosu.Urun_ID AND strftime('%Y', s.tarih) = smm_tablosu.Yil
GROUP BY m.id
Ek Talimatlar
ÖNCE alt metrikleri (satınalma, SMM, GG payı, w_carpani) ayrı sorgular/ara tablolar olarak hesapla.

SONRA asıl KPI formülünü, bu ara tabloları JOIN’leyerek bul.

Hiçbir zaman GG, w_carpani, SMM gibi kalemleri topluca ve tekrarlı biçimde müşteri/ürün/yıla yükleme.

SQL’i sade, anlaşılır ve parça parça kur!

