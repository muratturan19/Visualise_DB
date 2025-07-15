import sqlite3
from faker import Faker
import random
from datetime import datetime, timedelta
import os
from nl2sql_app import DB_PATH

fake = Faker('tr_TR')

# Ensure the database directory exists and open a connection using the same
# path as nl2sql_app.DB_PATH.
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Temel tabloları oluştur
cur.execute('''CREATE TABLE IF NOT EXISTS Departmanlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isim TEXT NOT NULL
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS Calisanlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isim TEXT,
    soyisim TEXT,
    departman_id INTEGER,
    pozisyon TEXT,
    ise_giris DATE,
    maas REAL,
    dogum_tarihi DATE,
    email TEXT,
    FOREIGN KEY (departman_id) REFERENCES Departmanlar(id)
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS Urunler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isim TEXT,
    kategori TEXT,
    birim TEXT,
    birim_fiyat REAL
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS Musteriler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isim TEXT,
    sektor TEXT,
    lokasyon TEXT,
    puan INTEGER,
    email TEXT
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS Tedarikciler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isim TEXT,
    kategori TEXT,
    lokasyon TEXT,
    email TEXT
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS SatinAlma (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    urun_id INTEGER,
    tedarikci_id INTEGER,
    tarih DATE,
    miktar INTEGER,
    toplam_tutar REAL,
    FOREIGN KEY (urun_id) REFERENCES Urunler(id),
    FOREIGN KEY (tedarikci_id) REFERENCES Tedarikciler(id)
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS Stoklar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    urun_id INTEGER,
    miktar INTEGER,
    depo TEXT,
    guncelleme_tarihi DATE,
    FOREIGN KEY (urun_id) REFERENCES Urunler(id)
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS Satislar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    urun_id INTEGER,
    musteri_id INTEGER,
    calisan_id INTEGER,
    tarih DATE,
    adet INTEGER,
    toplam_fiyat REAL,
    FOREIGN KEY (urun_id) REFERENCES Urunler(id),
    FOREIGN KEY (musteri_id) REFERENCES Musteriler(id),
    FOREIGN KEY (calisan_id) REFERENCES Calisanlar(id)
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS Uretim (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    urun_id INTEGER,
    tarih DATE,
    calisan_id INTEGER,
    vardiya TEXT,
    adet INTEGER,
    hata_sayisi INTEGER,
    FOREIGN KEY (urun_id) REFERENCES Urunler(id),
    FOREIGN KEY (calisan_id) REFERENCES Calisanlar(id)
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS FazlaMesai (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calisan_id INTEGER,
    tarih DATE,
    toplam_saat REAL,
    neden TEXT,
    FOREIGN KEY (calisan_id) REFERENCES Calisanlar(id)
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS Izinler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calisan_id INTEGER,
    izin_tipi TEXT,
    baslangic DATE,
    bitis DATE,
    toplam_gun INTEGER,
    FOREIGN KEY (calisan_id) REFERENCES Calisanlar(id)
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS KaliteKontrol (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    urun_id INTEGER,
    tarih DATE,
    sonuc TEXT,
    aciklama TEXT,
    hata_sayisi INTEGER,
    cozulen INTEGER,
    FOREIGN KEY (urun_id) REFERENCES Urunler(id)
)''')

cur.execute('''CREATE TABLE IF NOT EXISTS Finans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tip TEXT,
    tarih DATE,
    tutar REAL,
    aciklama TEXT,
    ilgili_tablo TEXT,
    ilgili_id INTEGER
)''')

# --- DEMO VERİ ÜRETİMİ ---

# Departmanlar
departmanlar = ['Üretim', 'Satış', 'İnsan Kaynakları', 'Finans', 'Satınalma', 'Kalite', 'Lojistik', 'Bakım']
for isim in departmanlar:
    cur.execute('INSERT INTO Departmanlar (isim) VALUES (?)', (isim,))

# Ürünler
urun_list = []
for _ in range(250):
    isim = fake.word().capitalize() + ' ' + fake.word().capitalize() + ' ' + str(random.randint(100, 9999))
    kategori = fake.word().capitalize()
    birim = random.choice(['Adet', 'Kg', 'Litre', 'Koli', 'Paket'])
    birim_fiyat = round(random.uniform(10, 500), 2)
    cur.execute('INSERT INTO Urunler (isim, kategori, birim, birim_fiyat) VALUES (?, ?, ?, ?)',
                (isim, kategori, birim, birim_fiyat))
    urun_list.append(cur.lastrowid)

# Müşteriler
for _ in range(2000):
    isim = fake.company()
    sektor = fake.job()
    lokasyon = fake.city()
    puan = random.randint(1, 10)
    email = fake.company_email()
    cur.execute('INSERT INTO Musteriler (isim, sektor, lokasyon, puan, email) VALUES (?, ?, ?, ?, ?)',
                (isim, sektor, lokasyon, puan, email))

# Tedarikçiler
for _ in range(300):
    isim = fake.company()
    kategori = fake.word().capitalize()
    lokasyon = fake.city()
    email = fake.company_email()
    cur.execute('INSERT INTO Tedarikciler (isim, kategori, lokasyon, email) VALUES (?, ?, ?, ?)',
                (isim, kategori, lokasyon, email))

# Çalışanlar
for _ in range(1000):
    isim = fake.first_name()
    soyisim = fake.last_name()
    departman_id = random.randint(1, len(departmanlar))
    pozisyon = fake.job()
    ise_giris = fake.date_between(start_date='-15y', end_date='-1d')
    maas = round(random.uniform(20000, 80000), 2)
    dogum_tarihi = fake.date_of_birth(minimum_age=20, maximum_age=60)
    email = fake.email()
    cur.execute('INSERT INTO Calisanlar (isim, soyisim, departman_id, pozisyon, ise_giris, maas, dogum_tarihi, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                (isim, soyisim, departman_id, pozisyon, ise_giris, maas, dogum_tarihi, email))

# Satışlar
for _ in range(12000):
    urun_id = random.randint(1, 250)
    musteri_id = random.randint(1, 2000)
    calisan_id = random.randint(1, 1000)
    tarih = fake.date_between(start_date='-4y', end_date='today')
    adet = random.randint(1, 100)
    toplam_fiyat = adet * float(random.uniform(10, 500))
    cur.execute('INSERT INTO Satislar (urun_id, musteri_id, calisan_id, tarih, adet, toplam_fiyat) VALUES (?, ?, ?, ?, ?, ?)',
                (urun_id, musteri_id, calisan_id, tarih, adet, toplam_fiyat))

# Üretim
vardiyalar = ['Gündüz', 'Gece', 'Akşam']
for _ in range(14000):
    urun_id = random.randint(1, 250)
    tarih = fake.date_between(start_date='-4y', end_date='today')
    calisan_id = random.randint(1, 1000)
    vardiya = random.choice(vardiyalar)
    adet = random.randint(10, 1000)
    hata_sayisi = random.randint(0, 10)
    cur.execute('INSERT INTO Uretim (urun_id, tarih, calisan_id, vardiya, adet, hata_sayisi) VALUES (?, ?, ?, ?, ?, ?)',
                (urun_id, tarih, calisan_id, vardiya, adet, hata_sayisi))

# Satınalma
for _ in range(4000):
    urun_id = random.randint(1, 250)
    tedarikci_id = random.randint(1, 300)
    tarih = fake.date_between(start_date='-4y', end_date='today')
    miktar = random.randint(10, 1000)
    toplam_tutar = miktar * float(random.uniform(10, 500))
    cur.execute('INSERT INTO SatinAlma (urun_id, tedarikci_id, tarih, miktar, toplam_tutar) VALUES (?, ?, ?, ?, ?)',
                (urun_id, tedarikci_id, tarih, miktar, toplam_tutar))

# Stoklar
for urun_id in range(1, 251):
    miktar = random.randint(0, 5000)
    depo = fake.city()
    guncelleme_tarihi = fake.date_between(start_date='-1y', end_date='today')
    cur.execute('INSERT INTO Stoklar (urun_id, miktar, depo, guncelleme_tarihi) VALUES (?, ?, ?, ?)',
                (urun_id, miktar, depo, guncelleme_tarihi))

# Fazla Mesai
nedenler = ['Üretim Artışı', 'Arıza', 'Yıllık Stok', 'Acil Sipariş', 'Proje Teslimi']
for _ in range(3500):
    calisan_id = random.randint(1, 1000)
    tarih = fake.date_between(start_date='-4y', end_date='today')
    toplam_saat = round(random.uniform(2, 10), 1)
    neden = random.choice(nedenler)
    cur.execute('INSERT INTO FazlaMesai (calisan_id, tarih, toplam_saat, neden) VALUES (?, ?, ?, ?)',
                (calisan_id, tarih, toplam_saat, neden))

# İzinler
izinler = ['Yıllık', 'Sağlık', 'Mazeret', 'Doğum', 'Ücretsiz']
for _ in range(2200):
    calisan_id = random.randint(1, 1000)
    izin_tipi = random.choice(izinler)
    baslangic = fake.date_between(start_date='-4y', end_date='today')
    bitis = baslangic + timedelta(days=random.randint(1, 14))
    toplam_gun = (bitis - baslangic).days
    cur.execute('INSERT INTO Izinler (calisan_id, izin_tipi, baslangic, bitis, toplam_gun) VALUES (?, ?, ?, ?, ?)',
                (calisan_id, izin_tipi, baslangic, bitis, toplam_gun))

# Kalite Kontrol
sonuclar = ['Geçti', 'Kaldı', 'Kısmen']
for _ in range(3000):
    urun_id = random.randint(1, 250)
    tarih = fake.date_between(start_date='-4y', end_date='today')
    sonuc = random.choice(sonuclar)
    aciklama = fake.sentence(nb_words=8)
    hata_sayisi = random.randint(0, 5)
    cozulen = random.randint(0, 1)
    cur.execute('INSERT INTO KaliteKontrol (urun_id, tarih, sonuc, aciklama, hata_sayisi, cozulen) VALUES (?, ?, ?, ?, ?, ?)',
                (urun_id, tarih, sonuc, aciklama, hata_sayisi, cozulen))

# Finans
tipler = ['Gelir', 'Gider']
for _ in range(8000):
    tip = random.choice(tipler)
    tarih = fake.date_between(start_date='-4y', end_date='today')
    tutar = round(random.uniform(1000, 100000), 2)
    aciklama = fake.sentence(nb_words=6)
    ilgili_tablo = random.choice(['Satislar', 'SatinAlma', 'Maas', 'Genel'])
    ilgili_id = random.randint(1, 1000)
    cur.execute('INSERT INTO Finans (tip, tarih, tutar, aciklama, ilgili_tablo, ilgili_id) VALUES (?, ?, ?, ?, ?, ?)',
                (tip, tarih, tutar, aciklama, ilgili_tablo, ilgili_id))

conn.commit()
conn.close()

print(f"Veritabanı başarıyla oluşturuldu: {DB_PATH}")
