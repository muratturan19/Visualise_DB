"""Mapping utilities between technical and friendly field names."""

# Mapping from technical database names to friendly Turkish labels
TECH_TO_FRIENDLY = {
    # Tables
    "Departmanlar": "Departmanlar",
    "Calisanlar": "Çalışanlar",
    "Urunler": "Ürünler",
    "Musteriler": "Müşteriler",
    "Tedarikciler": "Tedarikçiler",
    "SatinAlma": "Satın Alma",
    "Stoklar": "Stoklar",
    "Satislar": "Satışlar",
    "Uretim": "Üretim",
    "FazlaMesai": "Fazla Mesai",
    "Izinler": "İzinler",
    "KaliteKontrol": "Kalite Kontrol",
    "Finans": "Finans",

    # Common columns
    "id": "ID",
    "isim": "İsim",
    "soyisim": "Soyisim",
    "departman_id": "Departman ID",
    "pozisyon": "Pozisyon",
    "ise_giris": "İşe Giriş",
    "maas": "Maaş",
    "dogum_tarihi": "Doğum Tarihi",
    "email": "E-posta",
    "kategori": "Kategori",
    "birim": "Birim",
    "birim_fiyat": "Birim Fiyat",
    "sektor": "Sektör",
    "lokasyon": "Lokasyon",
    "puan": "Puan",
    "urun_id": "Ürün ID",
    "tedarikci_id": "Tedarikçi ID",
    "tarih": "Tarih",
    "miktar": "Miktar",
    "toplam_tutar": "Toplam Tutar",
    "depo": "Depo",
    "guncelleme_tarihi": "Güncelleme Tarihi",
    "musteri_id": "Müşteri ID",
    "calisan_id": "Çalışan ID",
    "adet": "Adet",
    "toplam_fiyat": "Toplam Fiyat",
    "vardiya": "Vardiya",
    "hata_sayisi": "Hata Sayısı",
    "toplam_saat": "Toplam Saat",
    "neden": "Neden",
    "izin_tipi": "İzin Tipi",
    "baslangic": "Başlangıç",
    "bitis": "Bitiş",
    "toplam_gun": "Toplam Gün",
    "sonuc": "Sonuç",
    "aciklama": "Açıklama",
    "cozulen": "Çözülen",
    "tip": "Tip",
    "tutar": "Tutar",
    "ilgili_tablo": "İlgili Tablo",
    "ilgili_id": "İlgili ID",
}

TRANSLATION_TABLE = str.maketrans("çğıöşü", "cgiosu")

# Build reverse mapping for case-insensitive replacement
FRIENDLY_TO_TECH = {}
for tech, friendly in TECH_TO_FRIENDLY.items():
    cf = friendly.casefold()
    FRIENDLY_TO_TECH[cf] = tech
    ascii_cf = cf.translate(TRANSLATION_TABLE)
    if ascii_cf != cf:
        FRIENDLY_TO_TECH[ascii_cf] = tech


def to_tech(question: str) -> str:
    """Replace friendly labels with technical names in the given question."""
    result = question
    # Longer labels first to avoid partial replacements
    for friendly, tech in sorted(FRIENDLY_TO_TECH.items(), key=lambda x: -len(x[0])):
        result = result.replace(friendly, tech)
    return result


def to_friendly(record: dict) -> dict:
    """Return a copy of ``record`` with keys mapped to friendly labels."""
    return {TECH_TO_FRIENDLY.get(k, k): v for k, v in record.items()}


def friendly_name(name: str) -> str:
    """Return the friendly label for ``name`` if available."""
    return TECH_TO_FRIENDLY.get(name, name)


def apply_friendly_labels(schema: dict) -> dict:
    """Return schema copy with added ``friendly`` keys for tables and columns."""
    result = {"tables": []}
    for table in schema.get("tables", []):
        t_entry = {"name": table["name"], "columns": []}
        tbl_label = TECH_TO_FRIENDLY.get(table["name"])
        if tbl_label and tbl_label != table["name"]:
            t_entry["friendly"] = tbl_label

        for col in table.get("columns", []):
            c_entry = {"name": col["name"], "type": col.get("type")}
            if "fk" in col:
                c_entry["fk"] = col["fk"]
            col_label = TECH_TO_FRIENDLY.get(col["name"])
            if col_label and col_label != col["name"]:
                c_entry["friendly"] = col_label
            t_entry["columns"].append(c_entry)

        result["tables"].append(t_entry)
    return result
