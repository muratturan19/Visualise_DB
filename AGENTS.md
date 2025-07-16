# LLM Guide

Bu dosya, LLM'in Türkçe yönetim raporları ve KPI taleplerini anladığında hangi alanlara başvuracağını ve nasıl SQL üretmesi gerektiğini açıklar.

## Yönetim KPI'ları ve İş Sözlüğü
Kullanıcı yönetim raporu veya KPI istediğinde aşağıdaki eşlemeleri ve hesaplama mantıklarını kullan.

1. **Ciro (Toplam Satış)**
   - Açıklama: Tüm dönem toplam satış geliri
   - Formül: `SUM(Satislar.toplam_fiyat)`
   - Alan: `Satislar.toplam_fiyat`

2. **Satılan Malın Maliyeti (SMM)**
   - Açıklama: Al-sat şirketleri için SMM, Satınalma Maliyeti + (Genel Gider * w_çarpanı)
   - Formül: `SUM(SatinAlma.toplam_tutar)` + `(SUM(Finans.tutar WHERE tip='Genel Gider') * Urunler.w_carpani)`
   - Alanlar: `SatinAlma.toplam_tutar`, `Finans.tip`, `Urunler.w_carpani`

3. **Brüt Kar**
   - Açıklama: Ciro - SMM
   - Formül: `[SUM(Satislar.toplam_fiyat)] - [SMM]`

4. **Net Kar**
   - Açıklama: Brüt Kar – Toplam Gider
   - Formül: `Brüt Kar - SUM(Finans.tutar WHERE tip='Gider')`
   - Alanlar: `Finans.tutar`, `Finans.tip`

5. **Stok Devir Hızı**
   - Açıklama: Satılan malın ortalama stok miktarına oranı
   - Formül: `[SMM] / AVG(Stoklar.miktar)`
   - Alan: `Stoklar.miktar`

6. **Çalışan Verimliliği**
   - Açıklama: Çalışan başına üretim veya satış
   - Formül: `SUM(Satislar.toplam_fiyat) / COUNT(Calisanlar.id)` veya `SUM(Uretim.adet) / COUNT(Calisanlar.id)`

7. **Müşteri Bazında Satış**
   - Açıklama: Her müşteri için toplam satış
   - Formül: `SUM(Satislar.toplam_fiyat) GROUP BY musteri_id`

8. **Karlılık (Ürün/Müşteri/Bölge)**
   - Açıklama: Satış – SMM, farklı kırılımlarda
   - Formül: `SUM(Satislar.toplam_fiyat) - SUM([SMM]) GROUP BY [X]` (`X`: ürün, müşteri, bölge vs.)

### Alan Eşlemeleri
- "genel gider" → `Finans.tip = 'Genel Gider'`
- "gider" → `Finans.tip = 'Gider'`
- "tüm giderler" → `Finans.tip IN ('Gider', 'Genel Gider')`
- "ciro" / "toplam satış" → `SUM(Satislar.toplam_fiyat)`
- "smm" / "satılan malın maliyeti" → `[Satınalma Maliyeti] + [Genel Gider * w_çarpanı]`

Bir formül veritabanı şemasından doğrudan hesaplanamıyorsa, hangi alanın eksik olduğunu belirten bir hata döndür.
