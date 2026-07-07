# 🚀 Kendi Bilgisayarında Sınırsız & Ücretsiz Yapay Zeka Kurulum Rehberi

Bu rehber, **Ses Klonlama Stüdyosu**'ndan indirdiğin ses dosyalarını (Ses Bankan) kullanarak **kendi bilgisayarında, hiçbir yere ödeme yapmadan ve internete bağlanmadan** nasıl şarkı söyleyen ve hikaye anlatan yapay zeka kuracağını adım adım anlatır.

---

## 🛠️ Adım 1: Pinokio (Yapay Zeka Tarayıcısı) İndir

Yapay zeka araçlarını tek tıkla kurabilmek için önce bilgisayarımıza **Pinokio** programını indiriyoruz.

1. Tarayıcından **https://pinokio.computer** adresine git.
2. **"Download"** butonuna bas ve bilgisayarının sistemine (Windows veya Mac) uygun olanı indir.
3. İndirdiğin kurulum dosyasını çalıştır ve normal bir program kurar gibi **Next / İleri** diyerek kur.
4. Pinokio'yu açtığında karşına bir "Discover" (Keşfet) mağazası çıkacak. İşte tüm AI programları burada!

---

## 📖 Adım 2: Su Kabağı Videoları İçin Konuşma/Anlatım Kurulumu (OmniVoice / GPT-SoVITS)

Videolarına kendi sesinle sınırsız ve ücretsiz seslendirme yapmak için dünyadaki en iyi açık kaynaklı araç **GPT-SoVITS** tabanlı **OmniVoice Studio**'dur. Sadece 1 dakikalık sesinle mükemmel çalışır!

### Kurulum:
1. Pinokio programında **"Enter URL" (URL Girin)** kısmına şu resmi adresi yapıştır ve indir:
   ```text
   https://github.com/PierrunoYT/OmniVoice-Studio-Pinokio
   ```
2. Açılan sayfada sağdaki **"Download"** (veya Install) butonuna bas.
3. Kurulum bilgisayarının hızına göre 5-15 dakika sürebilir (yapay zeka dosyalarını indirir).
4. Kurulum bitince **"Start"** butonuna bas. Tarayıcında programın arayüzü açılacak!

### Kullanım:
1. Arayüzde **"1-Click TTS"** veya **"Inference"** (Seslendirme) sekmesine gel.
2. **Reference Audio (Referans Ses):** Bizim uygulamamızdan indirdiğin o temiz 1 dakikalık ses kaydını buraya yükle.
3. **Reference Text (Referans Metin):** İndirdiğin ses kaydında ne konuştuysan, kelimesi kelimesine aynısını altındaki kutuya yaz (böylece AI ses tonunu ve harfleri eşleştirir).
4. **Target Text (Hedef Metin):** Artık videon için seslendirmek istediğin yeni anlatım metnini buraya yaz!
5. **"Generate"** (Üret) butonuna bas! Saniyeler içinde kendi sesinle seslendirme hazır! 🎃🎙️

---

## 🎵 Adım 3: Şarkı Söylemek İçin Kurulum (RVC / Applio)

Kendi sesine en sevdiğin şarkıları söyletebilmek (AI Cover) için en popüler araç **RVC** ve **Applio**'dur.

### Kurulum:
1. Pinokio programında **"Enter URL" (URL Girin)** kutusuna aşağıdaki resmi ve %100 çalışan adreslerden birini yapıştır:
   * **RVC Resmi Kurulumu (Cocktailpeanut):**
     ```text
     https://github.com/cocktailpeanut/rvc.pinokio
     ```
   * **Applio (RVC V3 Alternatifi):**
     ```text
     https://github.com/MDShoons/RVC-V3-
     ```
2. Çıkan programda **"Download / Install"** butonuna bas.
3. Kurulum bitince **"Start"** diyerek programı başlat.

### Aşama A: Sesini Eğitme (Train - 1 Kez Yapılır):
Yapay zekanın senin sesinin müzikal notalarını öğrenmesi gerekir.
1. Applio arayüzünde üstten **"Train"** (Eğitim) sekmesine tıkla.
2. **Experiment Name:** Kendi adını yaz (Örn: `Soner_Ses_Modeli`).
3. **Dataset Path:** Bizim uygulamamızdan indirdiğin ve bir klasöre topladığın 5-10 dakikalık tüm ses dosyalarının olduğu klasörün yolunu buraya seç.
4. **"Start Training"** butonuna bas!
   *(Not: Ekran kartının gücüne göre bu işlem 15 dakika ile 1 saat arası sürebilir. Arkada kahveni iç, AI sesini çalışıyor! ☕)*
5. İşlem bitince senin ses modelin `.pth` uzantılı bir dosya olarak hazır olur!

### Aşama B: Şarkı Söyleme (Inference):
1. Üstten **"Inference"** (Dönüştürme) sekmesine geç.
2. **Model:** Az önce eğittiğin kendi ses modelini (`Soner_Ses_Modeli`) seç.
3. **Audio Path:** Söylemesini istediğin şarkının sadece vokal/insan sesi olan mp3 dosyasını yükle.
   *(İpucu: Şarkıların müziği ile sözünü ayırmak için yine Pinokio içindeki "UVR5 - Ultimate Vocal Remover" aracını veya ücretsiz web sitelerini kullanabilirsin).*
4. **"Convert"** butonuna bas! Artık o şarkıyı sen söylüyorsun! 🎤🎶

---

## 💡 Bilgisayar Donanımı Hakkında Küçük Bir İpucu

* Bu programlar, bilgisayarında bir **Nvidia Ekran Kartı (GPU)** varsa çok hızlı (saniyeler içinde) çalışır.
* Eğer ekran kartın yoksa veya sadece işlemci (CPU) varsa yine çalışır ama ses üretmesi biraz daha uzun sürebilir. Panik yapma, sabırla beklemesi yeterlidir!

Takıldığın herhangi bir adımda sorabilirsin. Başarılar! 🎉
