# 🎤 Ses Klonlama Stüdyosu — Kolay Kurulum Rehberi (Vercel + Neon)

Merhaba! 👋 Bu rehber, uygulamayı internete yükleyip **kendine ait bir web
adresinden** kullanabilmen için hazırlandı. Hiç kod bilmene gerek yok — sadece
adımları sırayla takip et. Baştan sona yaklaşık **20-30 dakika** sürer.

Sonunda elinde şöyle bir şey olacak:
`https://ses-klonlama.vercel.app` gibi bir adres → istediğin cihazdan, sadece
internetle girip kullanacaksın. 🎉

---

## 🧩 Neye ihtiyacın var? (Hepsi ÜCRETSİZ)

Kuruluma başlamadan önce şu 4 hesabı açacaksın. Hepsi ücretsiz:

1. **GitHub** — kodun saklanacağı yer → https://github.com
2. **Vercel** — uygulamanın çalışacağı yer → https://vercel.com
3. **Neon** — veritabanının duracağı yer → https://neon.tech
4. **ElevenLabs** — ses klonlamayı yapan yapay zeka → https://elevenlabs.io
   (Bunu zaten yaptın ve anahtarını aldın ✅)

> 💡 **İpucu:** GitHub, Vercel ve Neon'a kaydolurken "Continue with Google"
> (Google ile devam et) seçeneğini kullanırsan çok daha hızlı olur.

---

## 📦 BÖLÜM 1 — Kodu GitHub'a Yükleme

Uygulamanın kodunu önce bir "depoya" (repository) koyacağız.

### Adım 1.1 — GitHub hesabı aç
- https://github.com adresine git → **"Sign up"** ile kaydol.

### Adım 1.2 — Yeni bir depo (repository) oluştur
- Sağ üstteki **"+"** işaretine tıkla → **"New repository"** seç.
- **Repository name:** `ses-klonlama-studyosu` yaz.
- **Public** (herkese açık) veya **Private** (özel) seçebilirsin — Private öneririm.
- **"Create repository"** butonuna bas.

### Adım 1.3 — Kod dosyalarını yükle
Elindeki proje dosyalarını bu depoya yüklemen gerekiyor. En kolay yol:
- Depon açıldığında **"uploading an existing file"** bağlantısına tıkla.
- Bilgisayarındaki tüm proje dosyalarını sürükleyip bırak.
- Aşağıda **"Commit changes"** butonuna bas.

> ⚠️ **Önemli:** `.env` dosyasını ve `node_modules` klasörünü YÜKLEME.
> (`.env` içinde gizli bilgiler var, `node_modules` ise çok büyük ve gereksiz.)

---

## 🐘 BÖLÜM 2 — Veritabanını Hazırlama (Neon)

Uygulama, klonladığın sesleri ve geçmişi saklamak için bir veritabanı kullanıyor.
Neon bunu ücretsiz sağlıyor.

### Adım 2.1 — Neon hesabı aç
- https://neon.tech adresine git → **"Sign up"** (Google ile hızlıca yapabilirsin).

### Adım 2.2 — Yeni proje oluştur
- Giriş yapınca otomatik olarak bir proje oluşturman istenir.
- **Project name:** `ses-klonlama` yaz.
- **Region (bölge):** Sana en yakın olanı seç (örn. Europe/Frankfurt).
- **"Create project"** de.

### Adım 2.3 — Bağlantı adresini (connection string) kopyala
- Proje açılınca ekranda **"Connection string"** başlıklı bir kutu göreceksin.
- Şuna benzer uzun bir metindir:
  ```
  postgresql://kullanici:sifre@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
  ```
- 📋 **Bu metnin tamamını kopyala ve bir kenara not et.** Birazdan lazım olacak.

> 💡 "Connection string" kutusunu bulamazsan: soldaki menüden **"Dashboard"** →
> **"Connection Details"** bölümüne bak.

---

## ▲ BÖLÜM 3 — Uygulamayı Vercel'e Yükleme

Şimdi asıl sihir burada. Vercel, kodunu alıp internette çalışır hale getirecek.

### Adım 3.1 — Vercel hesabı aç
- https://vercel.com adresine git → **"Sign Up"**.
- **"Continue with GitHub"** seç (GitHub hesabınla bağla — çok önemli!).

### Adım 3.2 — Projeyi içeri aktar (import)
- Vercel panelinde **"Add New..."** → **"Project"** tıkla.
- Az önce oluşturduğun `ses-klonlama-studyosu` deposunu listede göreceksin.
- Yanındaki **"Import"** butonuna bas.

### Adım 3.3 — Ortam değişkenlerini (Environment Variables) ekle
Bu, işte o merak ettiğin "gizli bilgiler" bölümü! 🔑
Import ekranında aşağıya inince **"Environment Variables"** bölümünü göreceksin.
Buraya şu 2 satırı ekle:

| Name (İsim)           | Value (Değer)                                      |
|-----------------------|----------------------------------------------------|
| `DATABASE_URL`        | (Bölüm 2'de kopyaladığın Neon bağlantı adresi)     |
| `ELEVENLABS_API_KEY`  | (ElevenLabs'ten aldığın `sk_...` ile başlayan anahtar) |

İstersen parola korumasını da özelleştirebilirsin (opsiyonel):

| Name (İsim)     | Value (Değer)                          |
|-----------------|----------------------------------------|
| `APP_PASSWORD`  | (uygulamaya girişte kullanacağın parola) |
| `APP_SECRET`    | (rastgele uzun bir metin, örn. `gizli-anahtar-12345`) |

> ⚠️ İsimleri **birebir aynı** yaz (büyük harf ve alt çizgiler dahil).
> Her satırı ekledikten sonra **"Add"** demeyi unutma.

### Adım 3.4 — Deploy et!
- **"Deploy"** butonuna bas. 🚀
- Vercel birkaç dakika çalışacak (kahveni al ☕).
- Bittiğinde 🎉 konfeti göreceksin ve sana bir adres verilecek:
  `https://ses-klonlama-studyosu.vercel.app` gibi.

---

## 🗄️ BÖLÜM 4 — Veritabanı Tablolarını Oluşturma

Uygulama ilk kez çalışırken veritabanında "tablolar" olması gerekiyor.
Bunu bir kez yapman yeterli.

### En kolay yol: Neon SQL Editor
- Neon panelinde soldaki menüden **"SQL Editor"** aç.
- Aşağıdaki komutu yapıştır ve **"Run"** de:

```sql
CREATE TABLE IF NOT EXISTS voices (
  id SERIAL PRIMARY KEY,
  eleven_labs_voice_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sample_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generations (
  id SERIAL PRIMARY KEY,
  voice_id INTEGER NOT NULL REFERENCES voices(id) ON DELETE CASCADE,
  voice_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

- "Success" (başarılı) yazısını görürsen tablolar hazır demektir. ✅

---

## 🎉 BÖLÜM 5 — Kullanmaya Başla!

1. Vercel'in verdiği adrese gir (örn. `https://ses-klonlama-studyosu.vercel.app`).
2. **Parola ekranı** çıkacak → parolanı yaz.
   - `APP_PASSWORD` ayarladıysan onu, ayarlamadıysan varsayılan: `sesklon123`
3. **"Ses Klonla"** sekmesinden sesini kaydet veya dosya yükle → klonla.
4. **"Konuşma Üret"** sekmesinden anlatım metnini yaz → seslendir → mp3 indir.
5. İndirdiğin mp3'ü video düzenleme programına ekle. 🎬🎃

Artık istediğin cihazdan, sadece internetle bu adrese girip kullanabilirsin! 🌍

---

## ❓ Sorun mu çıktı? (Sık karşılaşılan durumlar)

**"Sesi Klonla dedim ama uyarı çıkıyor / çalışmıyor"**
→ `ELEVENLABS_API_KEY` doğru eklenmemiş olabilir. Vercel'de
**Project → Settings → Environment Variables** bölümünden kontrol et.
Değiştirdikten sonra **Deployments → en üstteki → "Redeploy"** demen gerekir.

**"Sayfa açılıyor ama hata veriyor"**
→ Muhtemelen `DATABASE_URL` eksik/yanlış ya da tabloları oluşturmadın.
Bölüm 2 ve Bölüm 4'ü tekrar kontrol et.

**"Parolamı unuttum"**
→ Vercel'de `APP_PASSWORD` değerini değiştir → Redeploy et.

**"Ayar değiştirdim ama etki etmedi"**
→ Vercel'de her ayar değişikliğinden sonra **Redeploy** (yeniden yayınla)
yapman gerekir. Deployments sekmesinden yapılır.

---

## 💰 Ücretler hakkında

- **Vercel, Neon, GitHub:** Kişisel kullanımda ücretsiz planlar fazlasıyla yeterli.
- **ElevenLabs:** Ücretsiz planın aylık karakter limiti var. Çok yoğun
  kullanırsan ücretli plana geçmen gerekebilir. Su kabağı videoları için
  başlangıçta ücretsiz plan büyük ihtimalle yeter. 👍

---

Kolay gelsin! Takıldığın her adımda sorabilirsin. Bir adımı geçtikçe
"tamam, buradayım" dersen, bir sonrakine birlikte geçeriz. 😊
