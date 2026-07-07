"use client";

import { useEffect, useRef, useState } from "react";

type LampStyle = "mistik" | "geometrik" | "doga" | "osmanli" | "hediye";
type VideoType = "reels" | "youtube" | "tanitim" | "yapim";

type UploadedPhoto = {
  id: string;
  url: string;
  imgObj: HTMLImageElement;
  name: string;
};

type ScenePreset = {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  type: "table" | "pendant" | "ambient";
};

const SCENE_PRESETS: ScenePreset[] = [
  {
    id: "restaurant",
    title: "Deniz Kenarı Otantik Restoran",
    emoji: "🌊",
    desc: "Deniz kenarında, dalga sesleri ve 5 masalı otantik balık restoranında tavandan süzülen avize lamba.",
    type: "pendant",
  },
  {
    id: "salon",
    title: "Sıcak Aile Salonu",
    emoji: "🏡",
    desc: "Koltuk takımlı, ahşap sehpalı aile salonunda duvara gölgeler saçan masa lambası.",
    type: "table",
  },
  {
    id: "cafe",
    title: "Otantik Kafe & Şark Köşesi",
    emoji: "☕",
    desc: "Taş duvarlı, otantik ahşap masalar üstünde loş ışık saçan su kabağı lambası.",
    type: "table",
  },
  {
    id: "bedroom",
    title: "Mistik Gece Yatak Odası",
    emoji: "🌙",
    desc: "Gece loşluğunda duvara büyülü gölgeler saçan komodin üstü gece lambası.",
    type: "table",
  },
  {
    id: "veranda",
    title: "Yaz Bahçesi & Veranda",
    emoji: "🌿",
    desc: "Akşam alacasında ahşap bahçe masası üzerinde yanan otantik bahçe lambası.",
    type: "table",
  },
];

const SCRIPT_TEMPLATES: Record<
  LampStyle,
  Record<VideoType, (details: string) => string>
> = {
  mistik: {
    reels: (details) =>
      `Karanlık bir odada, ışığın kabuktan süzüldüğü o büyülü an... Ham bir su kabağı, günler süren sabırla bir gece güneşi haline geldi. ${
        details ? details + " ile bezeli bu eserde" : "Her bir deliğinde"
      } geçmişin ve gölgelerin dansı var. Evinize huzur katacak mistik bir dokunuş.`,
    youtube: (details) =>
      `Merhaba değerli dostlar. Bugün atölyemizde doğanın bize sunduğu ham bir su kabağını mistik bir ışık kaynağına dönüştürüyoruz. ${
        details ? details + " kullanarak hazırladığımız bu çalışmada" : "Uyguladığımız özel desenlerde"
      } gölge oyunlarının duvardaki akışına hayran kalacaksınız. Şimdi adım adım yapım aşamalarına geçelim.`,
    tanitim: (details) =>
      `El emeği göz nuru Su Kabağı Gece Lambası. ${
        details ? details : "Özel işleme desenleri ve renkli boncuk yerleştirmeleri"
      } ile tamamen doğal malzemelerden atölyemizde üretilmiştir. Ahşap kaidesi ve sıcak LED ışığıyla yaşam alanlarınıza ruh katacak benzersiz bir hediye.`,
    yapim: (details) =>
      `Su kabağı lambası yapımının en büyüleyici aşaması, ışığın çıkacağı deliklerin delinmesidir. ${
        details ? details : "İnce matkap uçlarıyla milim milim işlediğimiz"
      } kabuk kurumuş ve sertleşmiş olduğu için büyük bir sabır gerektirir. İşte o sabrın ışıkla buluştuğu an!`,
  },
  geometrik: {
    reels: (details) =>
      `Simetri ve doğallığın kusursuz uyumu! Modern çizgilere sahip su kabağı lambamız hazır. ${
        details ? details : "Geometrik delik dizilimi"
      } sayesinde duvarda muazzam yıldız desenleri oluşturur.`,
    youtube: (details) =>
      `Hoş geldiniz! Bugün geleneksel su kabağını modern geometrik desenlerle harmanlıyoruz. ${
        details ? details : "Çarkıfelek ve yıldız motifleri"
      } kullanarak tasarladığımız bu lamba, açıldığı an odanın tüm havasını değiştiriyor.`,
    tanitim: (details) =>
      `Modern & Geometrik Tasarım Su Kabağı Lamba. ${
        details ? details : "Hassas ölçümlerle çizilen ve delinen desenler"
      } geceye harika bir ışık hüzmesi saçar. Özel sipariş üzerine kişiselleştirilebilir.`,
    yapim: (details) =>
      `Geometrik desenlerde en önemli kural simetridir. Kabağın üzerine pergel ve cetvelle çizim yaptıktan sonra ${
        details ? details : "3mm ve 4mm uçlarla"
      } delme işlemine başlıyoruz.`,
  },
  doga: {
    reels: (details) =>
      `Doğanın bağrından çıkan bir sanat eseri! Çiçek ve sarmaşık motifli su kabağı lambamız. ${
        details ? details : "Işıl ışıl boncuklarıyla"
      } odanızda bahar havası estirecek.`,
    youtube: (details) =>
      `Aramıza hoş geldiniz. Tarladan toplayıp aylarca kuruttuğumuz su kabaklarına doğanın motiflerini işliyoruz. ${
        details ? details : "Yaprak ve çiçek desenlerinin"
      } içinden süzülen ışık huzuru temsil ediyor.`,
    tanitim: (details) =>
      `Doğa Temalı Boncuklu Su Kabağı Lamba. ${
        details ? details : "Renkli kristal boncuklarla süslenmiş"
      } gövdesi, gündüz şık bir dekoratif obje, gece ise muazzam bir ışık kaynağıdır.`,
    yapim: (details) =>
      `Yaprak ve çiçek kıvrımlarını kabuğa yakarak veya oyarak şekillendiriyoruz. ${
        details ? details : "Ardından renkli boncuklarımızı"
      } yuvalarına sıkıca oturtuyoruz.`,
  },
  osmanli: {
    reels: (details) =>
      `Tarihin ışığı evinizde! Osmanlı & Selçuklu tezhip sanatından esinlendiğimiz su kabağı lambamız. ${
        details ? details : "Lale ve palmet motifleriyle"
      } saray zarafetini yaşatın.`,
    youtube: (details) =>
      `Saray zarafetini su kabağına taşıyoruz! Bugün klasik tezhip ve Rumi motiflerini su kabağı kabuğuna işliyoruz. ${
        details ? details : "Geleneksel desenlerimizin"
      } gölgeleri duvarda tarih yazıyor.`,
    tanitim: (details) =>
      `Geleneksel Motifli Osmanlı Tarzı Su Kabağı Lamba. ${
        details ? details : "İnce el işçiliği, ahşap torna kaidesi"
      } ve otantik tasarımıyla koleksiyonluk bir eser.`,
    yapim: (details) =>
      `Klasik motiflerde oyma derinliği çok önemlidir. Kabuğun üst katmanını hafifçe soyup ${
        details ? details : "rölyef kabartma etkisi"
      } veriyoruz.`,
  },
  hediye: {
    reels: (details) =>
      `Sevdiklerinize ömür boyu unutamayacakları kişiye özel bir hediye! ${
        details ? details : "İsim ve özel tarih işlenmiş"
      } su kabağı gece lambamız teslim edilmeye hazır.`,
    youtube: (details) =>
      `Merhaba! Bugün çok özel bir doğum günü hediyesi hazırlıyoruz. Müşterimizin isteği üzerine su kabağının üzerine ${
        details ? details : "isim ve kalpli motifler"
      } işledik. Seri üretimin ötesinde tamamen kişiye özel!`,
    tanitim: (details) =>
      `Kişiye Özel İsimli Su Kabağı Gece Lambası. ${
        details ? details : "İstediğiniz isim, tarih veya mesaj"
      } deliklerle kabağın gövdesine işlenir. Unutulmaz bir doğum günü ve yıldönümü hediyesi.`,
    yapim: (details) =>
      `İsimli lambalarda harflerin okunabilirliği için delik aralıklarını çok dikkatli hesaplıyoruz. ${
        details ? details : "0.8mm ve 1.5mm hassas matkap uçlarıyla"
      } harfleri şekillendiriyoruz.`,
  },
};

export default function GourdWorkshopAssistant({
  onTransferScriptToSpeech,
}: {
  onTransferScriptToSpeech: (scriptText: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "photo_video" | "scene_ai" | "script" | "beads" | "cost"
  >("photo_video");

  // Fotoğraf & Sinematik Video Düzenleyici Durumları
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // Fotoğraf İnce Ayarları
  const [brightness, setBrightness] = useState<number>(115);
  const [contrast, setContrast] = useState<number>(120);
  const [saturate, setSaturate] = useState<number>(130);
  const [lampGlow, setLampGlow] = useState<number>(40);
  const [vignette, setVignette] = useState<number>(30);
  const [autoEnhancedMsg, setAutoEnhancedMsg] = useState<string>("");

  // AI Sahne & Arka Plan Yerleştirici Durumları
  const [selectedSceneId, setSelectedSceneId] = useState<string>("restaurant");
  const [customScenePrompt, setCustomScenePrompt] = useState<string>("");
  const [lampPlacement, setLampPlacement] = useState<"table" | "pendant">("pendant");
  const [bgRemovalSensitivity, setBgRemovalSensitivity] = useState<number>(40);
  const [compositedImageUrl, setCompositedImageUrl] = useState<string | null>(null);

  // Video Oluşturucu Durumları
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(
    null
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Senaryo Yazar Durumları
  const [lampStyle, setLampStyle] = useState<LampStyle>("mistik");
  const [videoType, setVideoType] = useState<VideoType>("reels");
  const [customDetails, setCustomDetails] = useState<string>("");
  const [generatedScript, setGeneratedScript] = useState<string>("");

  // Maliyet & Satış Fiyatı Durumları
  const [gourdCost, setGourdCost] = useState<number>(150);
  const [beadPaintCost, setBeadPaintCost] = useState<number>(100);
  const [ledBaseCost, setLedBaseCost] = useState<number>(120);
  const [laborHours, setLaborHours] = useState<number>(4);
  const [hourlyRate, setHourlyRate] = useState<number>(150);

  const activePhoto = photos.find((p) => p.id === selectedPhotoId) || photos[0];
  const activeScenePreset = SCENE_PRESETS.find((s) => s.id === selectedSceneId) || SCENE_PRESETS[0];

  useEffect(() => {
    if (activeScenePreset) {
      setLampPlacement(activeScenePreset.type === "pendant" ? "pendant" : "table");
    }
  }, [selectedSceneId, activeScenePreset]);

  // Otomatik AI Fotoğraf İyileştirme
  function handleAutoEnhancePhoto() {
    setBrightness(130);
    setContrast(135);
    setSaturate(145);
    setLampGlow(50);
    setVignette(35);
    setAutoEnhancedMsg("⚡ AI Otomatik Işık & Görsel İyileştirme Uygulandı! (Parlaklık: %130, Kontrast: %135, Boncuk Canlılığı: %145, Işık Halesi: %50)");
    setTimeout(() => setAutoEnhancedMsg(""), 6000);
  }

  // Fotoğraf Yükleme
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const newPhoto: UploadedPhoto = {
            id: `img_${Date.now()}_${Math.random()}`,
            url: event.target?.result as string,
            imgObj: img,
            name: file.name,
          };
          setPhotos((prev) => [...prev, newPhoto]);
          if (!selectedPhotoId) {
            setSelectedPhotoId(newPhoto.id);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  // Fotoğraf Silme
  function handleDeletePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedPhotoId === id) {
      setSelectedPhotoId(null);
    }
  }

  // AI Arka Plan Temizleme & Gerçekçi Zengin Sahne Dekoru Çizimi
  function handleRenderAIScene() {
    if (!activePhoto || !activePhoto.imgObj) {
      alert("Lütfen önce bir su kabağı lambası fotoğrafı yükleyin.");
      return;
    }

    const canvas = sceneCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1350; // Instagram 4:5 Dikey Görsel Formatı

    // 1. ZENGİN VE DETAYLI GERÇEKÇİ SAHNE ÇİZİMİ (Restoran, Deniz, Salon, Kafe vb.)
    if (selectedSceneId === "restaurant") {
      // 🌊 DENİZ KENARI OTANTİK BALIK RESTORANI
      // A) Gece Gökyüzü & Dolunay
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.45);
      skyGrad.addColorStop(0, "#020617");
      skyGrad.addColorStop(0.6, "#0f172a");
      skyGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.45);

      // Dolunay
      ctx.fillStyle = "rgba(254, 243, 199, 0.9)";
      ctx.beginPath();
      ctx.arc(canvas.width * 0.8, 140, 45, 0, Math.PI * 2);
      ctx.fill();

      // Yıldızlar
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      for (let i = 0; i < 35; i++) {
        const sx = (i * 37) % canvas.width;
        const sy = (i * 19) % 250;
        ctx.fillRect(sx, sy, (i % 3) + 1, (i % 3) + 1);
      }

      // B) Gece Denizi & Mehtap Yansıması
      const seaGrad = ctx.createLinearGradient(0, canvas.height * 0.45, 0, canvas.height * 0.7);
      seaGrad.addColorStop(0, "#0f172a");
      seaGrad.addColorStop(0.5, "#030712");
      seaGrad.addColorStop(1, "#0f172a");
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, canvas.height * 0.45, canvas.width, canvas.height * 0.25);

      // Deniz Dalgaları & Yansıma
      ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
      for (let y = canvas.height * 0.46; y < canvas.height * 0.68; y += 14) {
        ctx.fillRect(canvas.width * 0.65 - (y % 40), y, 300, 3);
      }

      // C) Restoran Ahşap İskelesi & Zemin
      ctx.fillStyle = "#1c120c";
      ctx.fillRect(0, canvas.height * 0.68, canvas.width, canvas.height * 0.32);

      // Ahşap Tahta Çizgileri
      ctx.strokeStyle = "#0d0a07";
      ctx.lineWidth = 4;
      for (let x = 0; x < canvas.width; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, canvas.height * 0.68);
        ctx.lineTo(x - 80, canvas.height);
        ctx.stroke();
      }

      // D) 5 Adet Masalı Restoran Düzeni (Sıralı Beyaz Örtülü Masalar & Mumlar)
      const tablePositions = [100, 280, 800, 960]; // Yan masalar
      tablePositions.forEach((tx) => {
        // Masa bacağı
        ctx.fillStyle = "#0f0b07";
        ctx.fillRect(tx + 30, canvas.height * 0.76, 20, 90);

        // Örtülü Masa
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(tx, canvas.height * 0.73, 80, 35);

        // Masa Üstü Mum & Kadeh Light
        ctx.fillStyle = "rgba(245, 158, 11, 0.8)";
        ctx.beginPath();
        ctx.arc(tx + 40, canvas.height * 0.71, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // E) Restoran Ahşap Tavan Kirişleri & Otantik İp Işıkları
      ctx.fillStyle = "#2e1c14";
      ctx.fillRect(0, 0, canvas.width, 100);

      ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 80);
      ctx.quadraticCurveTo(canvas.width / 2, 140, canvas.width, 80);
      ctx.stroke();

    } else if (selectedSceneId === "salon") {
      // 🏡 SICAK AİLE SALONU
      // A) Salon Duvarı & Sıcak Duvar Kağıdı
      const wallGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      wallGrad.addColorStop(0, "#111827");
      wallGrad.addColorStop(0.6, "#1f2937");
      wallGrad.addColorStop(1, "#111827");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // B) Salon Penceresi (Gece Gökyüzü Görünümü)
      ctx.fillStyle = "#030712";
      ctx.fillRect(canvas.width * 0.68, 120, 260, 380);
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 12;
      ctx.strokeRect(canvas.width * 0.68, 120, 260, 380);

      // Pencereden Yıldızlar
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      for (let i = 0; i < 15; i++) {
        ctx.fillRect(canvas.width * 0.7 + (i * 15) % 220, 140 + (i * 23) % 330, 2, 2);
      }

      // Salon Tül Perdeleri
      ctx.fillStyle = "rgba(241, 245, 249, 0.15)";
      ctx.fillRect(canvas.width * 0.66, 120, 60, 380);
      ctx.fillRect(canvas.width * 0.88, 120, 60, 380);

      // C) Salon Tablosu / Çerçevesi
      ctx.fillStyle = "#27170f";
      ctx.fillRect(120, 150, 200, 150);
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 6;
      ctx.strokeRect(120, 150, 200, 150);

      // D) Konforlu Koltuk / Kanepe
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(80, canvas.height * 0.52, 450, 180, [30, 30, 0, 0]);
      ctx.fill();

      // Koltuk Yastıkları
      ctx.fillStyle = "#b45309";
      ctx.roundRect(110, canvas.height * 0.55, 100, 90, [15]);
      ctx.fill();

      // E) Salon Cilalı Ahşap Sehpa & Halı
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(100, canvas.height * 0.78, 880, canvas.height * 0.22); // Halı

      ctx.fillStyle = "#3a2012";
      ctx.fillRect(150, canvas.height * 0.68, 780, canvas.height * 0.12); // Ahşap Sehpa
      ctx.fillStyle = "#1c1008";
      ctx.fillRect(180, canvas.height * 0.8, 40, 120); // Bacaklar
      ctx.fillRect(860, canvas.height * 0.8, 40, 120);

    } else if (selectedSceneId === "cafe") {
      // ☕ OTANTİK KAFE & TAŞ DUVAR ŞARK KÖŞESİ
      ctx.fillStyle = "#130d0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Taş Duvar Desenleri
      ctx.strokeStyle = "rgba(180, 83, 9, 0.15)";
      ctx.lineWidth = 3;
      for (let y = 60; y < canvas.height * 0.65; y += 70) {
        for (let x = 20; x < canvas.width; x += 150) {
          const shift = (Math.floor(y / 70) % 2) * 75;
          ctx.strokeRect(x + shift, y, 140, 60);
        }
      }

      // Şark Köşesi Otantik Minderler & Halı
      ctx.fillStyle = "#881337";
      ctx.fillRect(80, canvas.height * 0.58, 920, 80); // Şark köşesi minderi

      ctx.fillStyle = "#2e1208";
      ctx.fillRect(120, canvas.height * 0.68, 840, canvas.height * 0.32); // Ahşap masa

    } else if (selectedSceneId === "bedroom") {
      // 🌙 MİSTİK GECE YATAK ODASI
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Yatak Başlığı
      ctx.fillStyle = "#1e1b4b";
      ctx.roundRect(80, canvas.height * 0.4, 600, 300, [20, 20, 0, 0]);
      ctx.fill();

      // Ahşap Komodin
      ctx.fillStyle = "#2e1a0e";
      ctx.fillRect(720, canvas.height * 0.62, 280, canvas.height * 0.38);

    } else {
      // 🌿 YAZ BAHÇESİ & VERANDA
      const gardenGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gardenGrad.addColorStop(0, "#020617");
      gardenGrad.addColorStop(0.5, "#064e3b");
      gardenGrad.addColorStop(1, "#022c22");
      ctx.fillStyle = gardenGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bahçe Ağaçları / Sarmaşıklar
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.beginPath();
      ctx.arc(150, 200, 180, 0, Math.PI * 2);
      ctx.arc(920, 250, 220, 0, Math.PI * 2);
      ctx.fill();

      // Bahçe Ahşap Masası
      ctx.fillStyle = "#27170f";
      ctx.fillRect(120, canvas.height * 0.66, 840, canvas.height * 0.34);
    }

    // 2. DÜZEN: Kullanıcının Lambasını Arka Plandan Temizleyerek Sahneye Koyma
    const img = activePhoto.imgObj;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext("2d");

    if (tempCtx) {
      tempCtx.drawImage(img, 0, 0);
      const imgData = tempCtx.getImageData(0, 0, img.width, img.height);
      const data = imgData.data;

      const thresh = (bgRemovalSensitivity / 100) * 85;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightnessVal = (r + g + b) / 3;

        if (brightnessVal < thresh && r < 55 && g < 55 && b < 55) {
          data[i + 3] = Math.max(0, Math.round((brightnessVal / thresh) * 255));
        }
      }
      tempCtx.putImageData(imgData, 0, 0);
    }

    // 3. DÜZEN: Lambayı Sahneye Doğru Konumlandırma
    let lampW, lampH, lampX, lampY;

    if (lampPlacement === "pendant") {
      lampH = canvas.height * 0.44;
      lampW = (lampH * img.width) / img.height;
      lampX = (canvas.width - lampW) / 2;
      lampY = 110;

      // Avize İpi / Halat Çizimi
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, lampY + 30);
      ctx.stroke();
    } else {
      lampH = canvas.height * 0.46;
      lampW = (lampH * img.width) / img.height;
      lampX = (canvas.width - lampW) / 2;
      lampY = canvas.height * 0.66 - lampH + 30;

      // Masa Üstü Gölge
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.beginPath();
      ctx.ellipse(
        canvas.width / 2,
        canvas.height * 0.66 + 10,
        lampW * 0.42,
        22,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Lambayı Çiz
    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
    ctx.drawImage(tempCanvas, lampX, lampY, lampW, lampH);
    ctx.restore();

    // 4. DÜZEN: Lambadan Odaya Yayılan Işık Halesi & Duvara Düşen Büyülü Gölge Oyunları
    const centerX = canvas.width / 2;
    const centerY = lampY + lampH / 2;

    // A) Duvara Yansıyan Gölge/Işık Işınları
    ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, canvas.width * 0.8, angle - 0.1, angle + 0.1);
      ctx.fill();
    }

    // B) Sıcak Işık Halesi
    const roomGlow = ctx.createRadialGradient(
      centerX,
      centerY,
      40,
      centerX,
      centerY,
      canvas.width * 0.75
    );
    roomGlow.addColorStop(0, "rgba(245, 158, 11, 0.5)");
    roomGlow.addColorStop(0.5, "rgba(217, 119, 6, 0.22)");
    roomGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = roomGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vignette Karanlık Katman
    const vigGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      canvas.width * 0.35,
      centerX,
      centerY,
      canvas.width * 0.85
    );
    vigGrad.addColorStop(0, "rgba(0,0,0,0)");
    vigGrad.addColorStop(1, "rgba(2, 6, 23, 0.8)");
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Senaryo Başlığı Filigranı
    const displayTitle = customScenePrompt.trim()
      ? customScenePrompt.trim()
      : activeScenePreset.title;

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(displayTitle, canvas.width / 2, canvas.height - 70);

    ctx.fillStyle = "rgba(245, 158, 11, 0.9)";
    ctx.font = "18px sans-serif";
    ctx.fillText(
      "El Emeği Su Kabağı Lamba Dekoru 🎃",
      canvas.width / 2,
      canvas.height - 35
    );

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCompositedImageUrl(dataUrl);
  }

  // Sinematik Video Oluşturma (Canvas Stream & MediaRecorder)
  async function handleCreateCinematicVideo() {
    if (photos.length === 0) {
      alert("Lütfen en az 1 adet su kabağı lambası fotoğrafı yükleyin.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGeneratingVideo(true);
    setVideoProgress(0);
    setGeneratedVideoUrl(null);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 720;
    canvas.height = 1280;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setGeneratedVideoUrl(url);
      setIsGeneratingVideo(false);
    };

    mediaRecorder.start();

    const secondsPerPhoto = 3.5;
    const totalDurationSec = photos.length * secondsPerPhoto;
    const fps = 30;
    const totalFrames = totalDurationSec * fps;

    let frame = 0;

    const animInterval = setInterval(() => {
      frame++;
      const currentProgress = Math.round((frame / totalFrames) * 100);
      setVideoProgress(currentProgress);

      const currentTime = frame / fps;
      const photoIndex = Math.min(
        Math.floor(currentTime / secondsPerPhoto),
        photos.length - 1
      );
      const currentPhoto = photos[photoIndex];

      if (currentPhoto && currentPhoto.imgObj) {
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const photoTime = currentTime % secondsPerPhoto;
        const zoomProgress = photoTime / secondsPerPhoto;
        const scale = 1.0 + zoomProgress * 0.08;

        ctx.save();
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;

        const img = currentPhoto.imgObj;
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;

        let drawW, drawH, drawX, drawY;
        if (imgAspect > canvasAspect) {
          drawH = canvas.height * scale;
          drawW = drawH * imgAspect;
        } else {
          drawW = canvas.width * scale;
          drawH = drawW / imgAspect;
        }
        drawX = (canvas.width - drawW) / 2;
        drawY = (canvas.height - drawH) / 2;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();

        if (lampGlow > 0) {
          const grad = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            50,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.7
          );
          grad.addColorStop(
            0,
            `rgba(245, 158, 11, ${(lampGlow / 100) * 0.35})`
          );
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (vignette > 0) {
          const vigGrad = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.3,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.75
          );
          vigGrad.addColorStop(0, "rgba(0,0,0,0)");
          vigGrad.addColorStop(1, `rgba(2, 6, 23, ${(vignette / 100) * 0.85})`);
          ctx.fillStyle = vigGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "El Emeği Su Kabağı Lambası 🎃",
          canvas.width / 2,
          canvas.height - 120
        );

        ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
        ctx.font = "20px sans-serif";
        ctx.fillText(
          "Özel Tasarım & Işık Gösterisi",
          canvas.width / 2,
          canvas.height - 80
        );
      }

      if (frame >= totalFrames) {
        clearInterval(animInterval);
        mediaRecorder.stop();
      }
    }, 1000 / fps);
  }

  // Senaryo Üret
  function handleGenerateScript() {
    const templateFn = SCRIPT_TEMPLATES[lampStyle][videoType];
    const script = templateFn(customDetails.trim());
    setGeneratedScript(script);
  }

  // Maliyet Hesaplamaları
  const materialCost = gourdCost + beadPaintCost + ledBaseCost;
  const laborCost = laborHours * hourlyRate;
  const totalCost = materialCost + laborCost;

  const price30 = Math.round(totalCost * 1.3);
  const price50 = Math.round(totalCost * 1.5);
  const price100 = Math.round(totalCost * 2.0);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-slate-900 via-orange-950/30 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <span>🎃</span> Su Kabağı Lamba Atölyesi & Foto-Video Stüdyosu
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Lambanın arka planını temizle, salona veya restorana yerleştir, Reels videoları üret ve maliyet hesapla!
            </p>
          </div>
        </div>

        {/* İç Sekmeler */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab("scene_ai")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "scene_ai"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            🏞️ AI Arka Plan & Sahne Dekoru (Salona/Restorana Yerleştir)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("photo_video")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "photo_video"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            📸 Fotoğraf Işıklandırıcı & Sinematik Video
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("script")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "script"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            🎬 AI Video Senaryo Yazar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("beads")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "beads"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            💎 Matkap Ucu & Boncuk Rehberi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cost")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "cost"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            📊 Lamba Maliyet & Satış Fiyatı
          </button>
        </div>
      </div>

      {/* YENİ SEKME: AI Arka Plan Temizleme & Sahne Dekoru Yerleştirici */}
      {activeTab === "scene_ai" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🏞️</span> Lambayı Temizle ve İstediğin Sahneye / Restorana Yerleştir
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Çektiğin lambanın arka planını temizler; salona, kafe masasına veya deniz kenarındaki restorana otantik olarak yerleştirir.
              </p>
            </div>

            <label className="cursor-pointer rounded-xl bg-orange-600/30 border border-orange-500/50 px-4 py-2.5 text-xs font-bold text-orange-200 hover:bg-orange-600/50 transition flex items-center justify-center gap-2 shrink-0">
              <span>🖼️</span> Lamba Fotoğrafı Yükle
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>

          {photos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center space-y-2">
              <p className="text-4xl">🎃</p>
              <p className="text-sm font-bold text-slate-300">
                Henüz hiç su kabağı lambası fotoğrafı yüklemediniz
              </p>
              <p className="text-xs text-slate-500">
                Yukarıdaki &quot;Lamba Fotoğrafı Yükle&quot; butonuna basarak kabağınızın fotoğrafını seçin.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-12">
              {/* Sol: Senaryo & Konum Ayarları */}
              <div className="md:col-span-5 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-2">
                    1. Sahne Senaryosunu Seçin
                  </label>
                  <div className="space-y-2">
                    {SCENE_PRESETS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSceneId(s.id)}
                        className={`w-full text-left rounded-xl border p-3 transition ${
                          selectedSceneId === s.id
                            ? "border-orange-500 bg-orange-600/20 text-white shadow-md ring-1 ring-orange-500"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{s.emoji}</span>
                          <span className="text-xs font-bold text-slate-100">
                            {s.title}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400 leading-normal">
                          {s.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Özel Senaryo Metni */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Veya Özel Sahne Senaryosu Yazın
                  </label>
                  <input
                    type="text"
                    value={customScenePrompt}
                    onChange={(e) => setCustomScenePrompt(e.target.value)}
                    placeholder="Örn: Deniz kenarında 5 masalı restoranda ahşap tavanlı otantik avize..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>

                {/* Lamba Konum Tipi */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    2. Lambanın Sahnedeki Konumu
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLampPlacement("table")}
                      className={`rounded-lg py-2 px-3 text-xs font-bold transition text-center ${
                        lampPlacement === "table"
                          ? "bg-orange-600 text-white shadow"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      🪑 Masa / Sehpa Üstü
                    </button>
                    <button
                      type="button"
                      onClick={() => setLampPlacement("pendant")}
                      className={`rounded-lg py-2 px-3 text-xs font-bold transition text-center ${
                        lampPlacement === "pendant"
                          ? "bg-orange-600 text-white shadow"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      🏮 Tavandan Asılı Avize
                    </button>
                  </div>
                </div>

                {/* Arka Plan Temizleme Hassasiyeti */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>Arka Plan Temizleme Hassasiyeti</span>
                    <span className="text-orange-400 font-mono">%{bgRemovalSensitivity}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    value={bgRemovalSensitivity}
                    onChange={(e) => setBgRemovalSensitivity(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">
                    Koyu kısımları temizler, lambanın parlayan deliklerini korur.
                  </p>
                </div>

                {/* Sahneye Yerleştir Butonu */}
                <button
                  type="button"
                  onClick={handleRenderAIScene}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3.5 text-sm font-bold text-white hover:from-orange-500 hover:to-amber-500 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <span>🖼️</span> Lambayı Sahneye Dekore Et & Yerleştir
                </button>
              </div>

              {/* Sağ: Sahneye Yerleştirilmiş Canlı Görsel */}
              <div className="md:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-slate-300">
                  Sahneye Yerleştirilmiş Sanatsal Fotoğraf
                </h4>

                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center min-h-[420px] p-2">
                  <canvas ref={sceneCanvasRef} className="hidden" />

                  {compositedImageUrl ? (
                    <div className="w-full space-y-3 text-center">
                      <img
                        src={compositedImageUrl}
                        alt="Sahne Dekoru"
                        className="max-h-[480px] w-auto mx-auto rounded-xl shadow-2xl border border-slate-800 object-contain"
                      />
                      <a
                        href={compositedImageUrl}
                        download="su-kabagi-sahne-dekoru.jpg"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg"
                      >
                        <span>⬇️</span> Dekore Edilmiş Yüksek Kaliteli Fotoğrafı İndir (JPG)
                      </a>
                    </div>
                  ) : (
                    <div className="text-center p-8 space-y-3">
                      <span className="text-5xl">🏝️</span>
                      <p className="text-sm font-bold text-slate-300">
                        Henüz sahneye yerleştirme yapılmadı
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Soldan senaryonuzu seçin (Aile Salonu, Deniz Kenarı Restoran vb.) ve <b>&quot;Lambayı Sahneye Dekore Et&quot;</b> butonuna basın!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEKME 0: Fotoğraf Işıklandırıcı & Sinematik Video Yapıcı */}
      {activeTab === "photo_video" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📸</span> Lamba Fotoğraflarını Işıklandır & Sinematik Video Yap
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Lambalarının fotoğraflarını yükle, ışık/gece efektini ayarla ve Instagram Reels/Shorts için sinematik video oluştur!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoEnhancePhoto}
                className="rounded-xl bg-amber-600/30 border border-amber-500/50 px-3.5 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-600/50 transition flex items-center gap-1.5 shadow"
              >
                <span>⚡</span> Otomatik AI Işık & Görsel İyileştir
              </button>

              <label className="cursor-pointer rounded-xl bg-orange-600/30 border border-orange-500/50 px-4 py-2.5 text-xs font-bold text-orange-200 hover:bg-orange-600/50 transition flex items-center justify-center gap-2 shrink-0">
                <span>🖼️</span> Lamba Fotoğrafları Yükle
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </div>

          {autoEnhancedMsg && (
            <p className="text-xs font-semibold text-emerald-300 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/30 animate-pulse">
              {autoEnhancedMsg}
            </p>
          )}

          {photos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center space-y-2">
              <p className="text-4xl">🎃</p>
              <p className="text-sm font-bold text-slate-300">
                Henüz hiç su kabağı lambası fotoğrafı yüklemediniz
              </p>
              <p className="text-xs text-slate-500">
                Yukarıdaki &quot;Lamba Fotoğrafları Yükle&quot; butonuna basarak atölyenizden çektiğiniz fotoğrafları seçin.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300">
                  Yüklenen Fotoğraflar ({photos.length} Adet)
                </h4>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPhotoId(p.id)}
                      className={`relative cursor-pointer shrink-0 rounded-lg overflow-hidden border-2 transition h-20 w-20 ${
                        selectedPhotoId === p.id || (!selectedPhotoId && photos[0].id === p.id)
                          ? "border-orange-500 ring-2 ring-orange-500"
                          : "border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(p.id);
                        }}
                        className="absolute top-0.5 right-0.5 rounded bg-slate-950/80 text-rose-400 p-0.5 text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-orange-300">
                    🎛️ Fotoğraf Işık & Atmosfer Teknikleri
                  </h4>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>💡 Işık & Parlaklık (Gece Görünümü)</span>
                      <span className="font-bold text-orange-400">%{brightness}</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={180}
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>🔍 Kontrast & Gölge Keskinliği</span>
                      <span className="font-bold text-orange-400">%{contrast}</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={180}
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>🎨 Boncuk Renk Canlılığı (Saturate)</span>
                      <span className="font-bold text-orange-400">%{saturate}</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={200}
                      value={saturate}
                      onChange={(e) => setSaturate(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>🌟 Sıcak Lamba Halesi & Işıltı</span>
                      <span className="font-bold text-amber-400">%{lampGlow}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={lampGlow}
                      onChange={(e) => setLampGlow(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>🌙 Mistik Gece Karanlığı (Vignette)</span>
                      <span className="font-bold text-indigo-400">%{vignette}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={vignette}
                      onChange={(e) => setVignette(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateCinematicVideo}
                  disabled={isGeneratingVideo}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3.5 text-sm font-bold text-white hover:from-orange-500 hover:to-amber-500 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <span>🎥</span> {isGeneratingVideo ? `Sinematik Video Üretiliyor (%${videoProgress})...` : "Sinematik Reel Videosu Oluştur"}
                </button>
              </div>

              <div className="md:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-slate-300">
                  Canlı Fotoğraf & Sinematik Video Önizlemesi
                </h4>

                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[380px] p-2">
                  {activePhoto && !isGeneratingVideo && !generatedVideoUrl && (
                    <div className="relative max-h-[420px] overflow-hidden rounded-xl flex items-center justify-center">
                      <img
                        src={activePhoto.url}
                        alt={activePhoto.name}
                        style={{
                          filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`,
                        }}
                        className="max-h-[400px] w-auto object-contain rounded-xl"
                      />

                      {lampGlow > 0 && (
                        <div
                          className="absolute inset-0 pointer-events-none rounded-xl transition-all"
                          style={{
                            background: `radial-gradient(circle at center, rgba(245, 158, 11, ${(lampGlow / 100) * 0.4}) 0%, rgba(0,0,0,0) 70%)`,
                          }}
                        />
                      )}

                      {vignette > 0 && (
                        <div
                          className="absolute inset-0 pointer-events-none rounded-xl transition-all"
                          style={{
                            background: `radial-gradient(circle at center, rgba(0,0,0,0) 30%, rgba(2, 6, 23, ${(vignette / 100) * 0.85}) 100%)`,
                          }}
                        />
                      )}
                    </div>
                  )}

                  <canvas
                    ref={canvasRef}
                    className={`max-h-[400px] w-auto object-contain rounded-xl ${
                      isGeneratingVideo ? "block" : "hidden"
                    }`}
                  />

                  {generatedVideoUrl && !isGeneratingVideo && (
                    <div className="w-full space-y-3 text-center p-4">
                      <p className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-2">
                        <span>🎉</span> Sinematik Su Kabağı Reels Videonuz Hazır!
                      </p>
                      <video
                        controls
                        autoPlay
                        loop
                        src={generatedVideoUrl}
                        className="max-h-[380px] mx-auto rounded-xl border border-slate-800 shadow-2xl"
                      />
                      <a
                        href={generatedVideoUrl}
                        download="sinematik-su-kabagi-lamba-video.webm"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg"
                      >
                        <span>⬇️</span> Sinematik Videoyu Bilgisayara İndir (.webm)
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEKME 1: Yapay Zeka Video Senaryo Yazar */}
      {activeTab === "script" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>✍️</span> Videoların İçin Etkileyici Anlatım Metni Üret
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Lambanın tarzını seç, yapay zeka akıcı Türkçe anlatım metnini üretsin!
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                1. Lambanın Tarzı & Konsepti
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "mistik", label: "Mistik & Gölgeli 🔮" },
                  { id: "geometrik", label: "Geometrik & Modern 📐" },
                  { id: "doga", label: "Doğa & Çiçekli 🌿" },
                  { id: "osmanli", label: "Osmanlı & Selçuklu 🕌" },
                  { id: "hediye", label: "Kişiye Özel Hediye 🎁" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setLampStyle(s.id as LampStyle)}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition text-left ${
                      lampStyle === s.id
                        ? "border-orange-500 bg-orange-600/20 text-orange-200"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                2. Video Formatı
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "reels", label: "Reels / Shorts (30 sn) 📱" },
                  { id: "youtube", label: "YouTube / Anlatım (2 dk) 🎥" },
                  { id: "tanitim", label: "Ürün Satış Tanıtımı 🛍️" },
                  { id: "yapim", label: "Atölye Yapım Aşaması 🛠️" },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVideoType(v.id as VideoType)}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition text-left ${
                      videoType === v.id
                        ? "border-orange-500 bg-orange-600/20 text-orange-200"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              3. Özel Detaylar (İsteğe Bağlı)
            </label>
            <input
              type="text"
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              placeholder="Örn: yeşil kehribar boncuklar, ceviz ahşap kaide, 800 delik..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateScript}
            className="w-full rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-500 transition shadow-lg flex items-center justify-center gap-2"
          >
            <span>✨</span> Yapay Zeka Video Senaryosunu Üret
          </button>

          {generatedScript && (
            <div className="rounded-xl border border-orange-500/30 bg-slate-950 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-orange-300 flex items-center gap-1">
                  <span>📜</span> Hazır Video Senaryosu
                </span>
                <span className="text-[11px] text-slate-500">
                  {generatedScript.length} Karakter
                </span>
              </div>
              <p className="text-sm font-medium text-slate-100 leading-relaxed select-all">
                &quot;{generatedScript}&quot;
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onTransferScriptToSpeech(generatedScript)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition flex items-center gap-2 shadow-md"
                >
                  <span>🔊</span> Bu Senaryoyu Emel & Ahmet AI ile Seslendir ➔
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEKME 2: Matkap Ucu & Boncuk Rehberi */}
      {activeTab === "beads" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>💎</span> Su Kabağı Delme & Boncuk Eşleşme Rehberi
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Işığı en kırılgan ve şık yansıtan matkap ucu - boncuk çapı eşleşmeleri.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                drill: "2.0 mm Matkap Ucu",
                bead: "2mm Kılcal / Küçük Boncuk",
                desc: "Çok ince detaylar, kontür çizgileri ve yıldız tozları için.",
                color: "Açık Sarı & Şeffaf",
              },
              {
                drill: "3.0 mm Matkap Ucu",
                bead: "3mm Standart Boncuk",
                desc: "Çiçek yaprakları, geometrik çizgiler ve ana kontürler.",
                color: "Kehribar & Yakut Kırmızı",
              },
              {
                drill: "4.0 mm Matkap Ucu",
                bead: "4mm Orta Boy Boncuk",
                desc: "Yoğun ışık çıkış noktaları ve merkez motifler.",
                color: "Zümrüt Yeşil & Safir Mavi",
              },
              {
                drill: "5.0 mm Matkap Ucu",
                bead: "5mm Büyük Odak Boncuk",
                desc: "Lambanın en parlak ve vurgulu ana göz noktaları.",
                color: "Kristal Mor & Turkuaz",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2"
              >
                <span className="rounded bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                  Uç #{idx + 1}
                </span>
                <h4 className="text-sm font-bold text-white">{item.drill}</h4>
                <p className="text-xs font-semibold text-amber-300">
                  🔗 {item.bead}
                </p>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {item.desc}
                </p>
                <p className="text-[10px] font-medium text-emerald-400 pt-1 border-t border-slate-900">
                  🎨 Önerilen Renk: {item.color}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEKME 3: Maliyet & Satış Fiyatı Hesaplayıcı */}
      {activeTab === "cost" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>📊</span> Su Kabağı Lamba Maliyet & Satış Fiyatı Hesaplayıcı
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Malzeme maliyeti ve harcadığın işçilik saatine göre lambanın ideal satış fiyatını hesapla.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="text-xs font-bold text-orange-300 uppercase tracking-wider">
                1. Malzeme & İşçilik Girdileri
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ham Kabak Maliyeti (TL)
                </label>
                <input
                  type="number"
                  value={gourdCost}
                  onChange={(e) => setGourdCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Boncuk, Boya & Vernik Maliyeti (TL)
                </label>
                <input
                  type="number"
                  value={beadPaintCost}
                  onChange={(e) => setBeadPaintCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ahşap Kaide, Duy, Kablo & LED Maliyeti (TL)
                </label>
                <input
                  type="number"
                  value={ledBaseCost}
                  onChange={(e) => setLedBaseCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    İşçilik Saati
                  </label>
                  <input
                    type="number"
                    value={laborHours}
                    onChange={(e) => setLaborHours(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Saatlik Ücret (TL)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-orange-500/30 bg-slate-950 p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-orange-300 uppercase tracking-wider mb-3">
                  2. Önerilen Satış Fiyatları
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-slate-900">
                    <span className="text-slate-400">Toplam Malzeme Maliyeti:</span>
                    <span className="font-bold text-white">{materialCost} TL</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900">
                    <span className="text-slate-400">Toplam İşçilik Değeri:</span>
                    <span className="font-bold text-white">{laborCost} TL</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-900 border border-slate-800 font-bold text-slate-200">
                    <span>Maliyet Toplamı:</span>
                    <span className="text-orange-400">{totalCost} TL</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-emerald-300 block">
                        Standart Satış Fiyatı (%30 Kâr)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Hızlı satış ve standart pazarlar için
                      </span>
                    </div>
                    <span className="text-lg font-black text-emerald-300">
                      {price30} TL
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-950/20 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">
                        Özel Tasarım Fiyatı (%50 Kâr - Önerilen)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Özel boncuklu ve detaylı işçilikli ürünler
                      </span>
                    </div>
                    <span className="text-lg font-black text-amber-300">
                      {price50} TL
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-purple-500/30 bg-purple-950/20 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-purple-300 block">
                        Koleksiyon / Galeri Fiyatı (%100 Kâr)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Sanatsal, benzersiz ve kişiye özel hediyeler
                      </span>
                    </div>
                    <span className="text-lg font-black text-purple-300">
                      {price100} TL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
