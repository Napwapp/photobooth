// Element references
const VIDEO = document.getElementById("video");
const COUNTDOWN = document.getElementById("countdown");
const START_AUTO = document.getElementById("startAuto");
const RESET_ALL = document.getElementById("resetAll");
const CHOOSE_TEMPLATE_BTN = document.getElementById("chooseTemplateBtn");
const TEMPLATE_INPUT = document.getElementById("templateInput");
const GENERATE_BTN = document.getElementById("generateBtn");
const DOWNLOAD_BTN = document.getElementById("downloadBtn");
// const DOWNLOAD_PDF_BTN = document.getElementById("downloadPdfBtn");
const PRINT_BTN = document.getElementById("printBtn");
const EVENT_TEXT = document.getElementById("eventText");

// Modal Preview Image
const modalPreviewImage = new bootstrap.Modal(
  document.getElementById("modalPreviewImage")
);
const previewImage = document.getElementById("previewImage");
const photoSidebar = document.getElementById("photoSidebar");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const deletePhotoBtn = document.getElementById("deletePhotoBtn");

const THUMBS = [
  document.getElementById("thumb0"),
  document.getElementById("thumb1"),
  document.getElementById("thumb2"),
];

// Data Templates
const TEMPLATES = [
  {
    id: "1",
    name: "Ombak",
    thumbnail: "assets/templates/tp-blue.png",
    fullSize: "assets/templates/tp-blue.png",
    category: "formal",
  },
  {
    id: "2",
    name: "Brainrot",
    thumbnail: "assets/templates/tp-brainrot.png",
    fullSize: "assets/templates/tp-brainrot.png",
    category: "formal",
  },
  {
    id: "3",
    name: "Template Bebas",
    thumbnail: "assets/templates/tp-freestyle.png",
    fullSize: "assets/templates/tp-freestyle.png",
    category: "formal",
  },
  {
    id: "4",
    name: "Hello Kity",
    thumbnail: "assets/templates/tp-hellokitty.png",
    fullSize: "assets/templates/tp-hellokitty.png",
    category: "formal",
  },
  {
    id: "5",
    name: "My Little Pony",
    thumbnail: "assets/templates/tp-my_litle_pony.png",
    fullSize: "assets/templates/tp-my_litle_pony.png",
    category: "formal",
  },
  {
    id: "6",
    name: "Nailong",
    thumbnail: "assets/templates/tp-nailong.png",
    fullSize: "assets/templates/tp-nailong.png",
    category: "formal",
  },
  {
    id: "7",
    name: "Pink Bunny",
    thumbnail: "assets/templates/tp-pink.png",
    fullSize: "assets/templates/tp-pink.png",
    category: "formal",
  },
  {
    id: "8",
    name: "Vintage",
    thumbnail: "assets/templates/tp-vintage.png",
    fullSize: "assets/templates/tp-vintage.png",
    category: "formal",
  },
  {
    id: "9",
    name: "Template Retro",
    thumbnail: "assets/templates/tp-retro.png",
    fullSize: "assets/templates/tp-retro.png",
    category: "formal",
  },
  {
    id: "10",
    name: "Love",
    thumbnail: "assets/templates/tp-lovepink.png",
    fullSize: "assets/templates/tp-lovepink.png",
    category: "bucin",
  },
  {
    id: "11",
    name: "Spotify",
    thumbnail: "assets/templates/tp-spotify.png",
    fullSize: "assets/templates/tp-spotify.png",
    category: "formal",
  },
];

// Canvas setup
const PRINT_CANVAS = document.getElementById("printCanvas");
const pcx = PRINT_CANVAS.getContext("2d");

const CANVAS_W = 591;
const CANVAS_H = 1772;
const MARGIN = 24;
const GAP = 30;
const FRAME_W = CANVAS_W - 2 * MARGIN;
const FRAME_H = 449;
const TOP_Y = MARGIN + 10;

const FRAME_POS = [
  { x: MARGIN, y: TOP_Y },
  { x: MARGIN, y: TOP_Y + FRAME_H + GAP },
  { x: MARGIN, y: TOP_Y + 2 * (FRAME_H + GAP) },
];

const TEXT_AREA_Y = TOP_Y + 3 * FRAME_H + 2 * GAP + 16;
const TEXT_AREA_H = CANVAS_H - TEXT_AREA_Y - MARGIN;

let stream = null;
let photos = [null, null, null];
let templateImg = null;

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: false,
    });
    VIDEO.srcObject = stream;
  } catch (err) {
    alert("Tidak dapat mengakses kamera: " + err.message);
  }
}
startCamera();

function drawCover(ctx, img, w, h, dx = 0, dy = 0) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = img.width * scale;
  const sh = img.height * scale;
  const x = dx + (w - sw) / 2;
  const y = dy + (h - sh) / 2;
  ctx.drawImage(img, x, y, sw, sh);
}

// Logika Thumbnail dan Modal Preview Image

let currentPhotoIndex = 0;

// Render Thumbnail di halaman utama
function renderThumb(index) {
  const canvas = THUMBS[index];
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!photos[index]) {
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px sans-serif";
    ctx.fillText("Empty", 10, 20);
    return;
  }
  const img = new Image();
  img.onload = () => drawCover(ctx, img, canvas.width, canvas.height);
  img.src = photos[index];
}

// Thumbnail click event
THUMBS.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const idx = Number(thumb.dataset.index);

    if (photos[idx]) {
      // Set current photo index dan langsung show modal
      currentPhotoIndex = idx;
      previewImage.src = photos[currentPhotoIndex];

      // Render sidebar dan update carousel
      renderSidebarThumbs();
      updateCarouselButtons();

      // Show modal
      modalPreviewImage.show();
    }
  });
});

// Render sidebar thumbnails di modal
function renderSidebarThumbs() {
  photoSidebar.innerHTML = "";

  photos.forEach((photo, index) => {
    if (photo) {
      const col = document.createElement("div");
      col.className = "col-6";

      const img = document.createElement("img");
      img.src = photo;
      img.alt = `Foto ${index + 1}`;
      img.className = `photo-thumbnail ${
        index === currentPhotoIndex ? "active" : ""
      }`;
      img.dataset.index = index;

      img.addEventListener("click", () => {
        // Update current photo index
        currentPhotoIndex = index;

        // Update main image
        previewImage.src = photos[currentPhotoIndex];

        // Update active state pada sidebar
        document.querySelectorAll(".photo-thumbnail").forEach((thumb) => {
          thumb.classList.remove("active");
        });
        img.classList.add("active");

        // Update carousel buttons
        updateCarouselButtons();
      });

      col.appendChild(img);
      photoSidebar.appendChild(col);
    }
  });
}

// Update carousel buttons visibility
function updateCarouselButtons() {
  // Hide/show prev button
  if (currentPhotoIndex === 0) {
    prevBtn.classList.add("hidden");
  } else {
    prevBtn.classList.remove("hidden");
  }

  // Hide/show next button
  if (
    currentPhotoIndex === photos.length - 1 ||
    !photos[currentPhotoIndex + 1]
  ) {
    nextBtn.classList.add("hidden");
  } else {
    nextBtn.classList.remove("hidden");
  }
}

// Navigate to previous photo
prevBtn.addEventListener("click", () => {
  if (currentPhotoIndex > 0) {
    currentPhotoIndex--;
    previewImage.src = photos[currentPhotoIndex];
    renderSidebarThumbs();
    updateCarouselButtons();
  }
});

// Navigate to next photo
nextBtn.addEventListener("click", () => {
  if (currentPhotoIndex < photos.length - 1 && photos[currentPhotoIndex + 1]) {
    currentPhotoIndex++;
    previewImage.src = photos[currentPhotoIndex];
    renderSidebarThumbs();
    updateCarouselButtons();
  }
});

// Delete current photo
deletePhotoBtn.addEventListener("click", () => {
  const confirmDelete = confirm(
    `Apakah Anda yakin ingin menghapus Foto ${currentPhotoIndex + 1}?`
  );

  if (confirmDelete) {
    photos[currentPhotoIndex] = null;

    // Render ulang thumbnail di halaman utama
    renderThumb(currentPhotoIndex);

    // Find next available photo
    let nextIndex = -1;
    for (let i = currentPhotoIndex + 1; i < photos.length; i++) {
      if (photos[i]) {
        nextIndex = i;
        break;
      }
    }

    if (nextIndex === -1) {
      for (let i = currentPhotoIndex - 1; i >= 0; i--) {
        if (photos[i]) {
          nextIndex = i;
          break;
        }
      }
    }

    if (nextIndex !== -1) {
      currentPhotoIndex = nextIndex;
      previewImage.src = photos[currentPhotoIndex];
      renderSidebarThumbs();
      updateCarouselButtons();
    } else {
      // No photos left, close modal
      modalPreviewImage.hide();
    }
  }
});

// Initialize - render semua thumbnail di halaman utama
THUMBS.forEach((thumb, index) => {
  renderThumb(index);
});

async function countdownTimer(seconds) {
  COUNTDOWN.style.display = "block";
  let rem = seconds;
  COUNTDOWN.textContent = rem;
  while (rem > 0) {
    await new Promise((r) => setTimeout(r, 1000));
    rem--;
    COUNTDOWN.textContent = rem > 0 ? rem : "0";
  }
  COUNTDOWN.style.display = "none";
}

async function autoCapture() {
  photos = [null, null, null];
  THUMBS.forEach((c) => c.getContext("2d").clearRect(0, 0, c.width, c.height));
  for (let i = 0; i < 3; i++) {
    await countdownTimer(10);
    const c = document.createElement("canvas");
    c.width = VIDEO.videoWidth || 1280;
    c.height = VIDEO.videoHeight || 720;
    const ctx = c.getContext("2d");
    ctx.drawImage(VIDEO, 0, 0, c.width, c.height);
    photos[i] = c.toDataURL("image/png");
    renderThumb(i);
  }
  alert("Semua foto telah diambil.");
}

function drawTextArea() {
  const text = EVENT_TEXT.value || "";
  pcx.fillStyle = "#0f172a";
  pcx.font = "28px Inter, sans-serif";
  pcx.textAlign = "center";
  let fontSize = 28;
  const maxWidth = CANVAS_W - 2 * (MARGIN + 8);
  while (pcx.measureText(text).width > maxWidth && fontSize > 12) {
    fontSize -= 2;
    pcx.font = `${fontSize}px Inter, sans-serif`;
  }
  pcx.fillText(text, CANVAS_W / 2, TEXT_AREA_Y + Math.floor(TEXT_AREA_H / 2));
}

// Generate print canvas
function generatePrintCanvas() {
  pcx.fillStyle = "#ffffff";
  pcx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Draw photos
  for (let i = 0; i < 3; i++) {
    const pos = FRAME_POS[i];
    pcx.fillStyle = "#fafafa";
    pcx.fillRect(pos.x, pos.y, FRAME_W, FRAME_H);

    if (photos[i]) {
      const img = new Image();
      img.onload = () => {
        drawCover(pcx, img, FRAME_W, FRAME_H, pos.x, pos.y);

        // Draw template setelah semua foto selesai load
        if (i === 2) {
          if (window.templateImg) {
            pcx.drawImage(window.templateImg, 0, 0, CANVAS_W, CANVAS_H);
          }
          drawTextArea();
        }
      };
      img.src = photos[i];
    }
  }
}

// CHOOSE_TEMPLATE_BTN.addEventListener("click", () => TEMPLATE_INPUT.click());
// TEMPLATE_INPUT.addEventListener("change", (e) => {
//   const f = e.target.files[0];
//   if (!f) return;
//   const url = URL.createObjectURL(f);
//   const img = new Image();
//   img.onload = () => {
//     templateImg = img;
//     URL.revokeObjectURL(url);
//     alert("Template berhasil dimuat.");
//   };
//   img.src = url;
// });

RESET_ALL.addEventListener("click", () => {
  if (confirm("Reset semua foto?")) {
    photos = [null, null, null];
    THUMBS.forEach((t) => {
      const ctx = t.getContext("2d");
      ctx.clearRect(0, 0, t.width, t.height);
    });
    pcx.fillStyle = "#ffffff";
    pcx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
});

START_AUTO.addEventListener("click", async () => {
  START_AUTO.disabled = true;
  await autoCapture();
  START_AUTO.disabled = false;
});

GENERATE_BTN.addEventListener("click", () => {
  generatePrintCanvas();
  alert("Render selesai — cek preview hasil di kanan layar.");
});

DOWNLOAD_BTN.addEventListener("click", () => {
  const downloadText = document.getElementById("downloadText");
  const loadingSpinner = document.getElementById("loadingSpinner");

  // Show loading state
  downloadText.textContent = "Menyiapkan Download";
  loadingSpinner.classList.remove("d-none");
  DOWNLOAD_BTN.disabled = true;

  generatePrintCanvas();

  // Delay untuk memastikan gambar terload
  setTimeout(() => {
    const link = document.createElement("a");
    link.download = "photostrip-5x15.png";
    link.href = PRINT_CANVAS.toDataURL("image/png");
    link.click();

    // Reset button state
    downloadText.textContent = "Download PNG";
    loadingSpinner.classList.add("d-none");
    DOWNLOAD_BTN.disabled = false;
  }, 1500);
});

// DOWNLOAD_PDF_BTN.addEventListener("click", async () => {
//   generatePrintCanvas();
//   setTimeout(async () => {
//     const imgData = PRINT_CANVAS.toDataURL("image/png");
//     const pdf = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: [50, 150],
//     });
//     pdf.addImage(imgData, "PNG", 0, 0, 50, 150);
//     pdf.save("photostrip-5x15.pdf");
//   }, 500);
// });

PRINT_BTN.addEventListener("click", () => {
  generatePrintCanvas();
  setTimeout(() => window.print(), 300);
});

(function init() {
  pcx.fillStyle = "#ffffff";
  pcx.fillRect(0, 0, CANVAS_W, CANVAS_H);
})();

// Logic Change Template
class TemplateManager {
  constructor() {
    this.currentTemplate = null;
    this.templates = TEMPLATES;
    this.initializeModals();
  }

  // Modal elements
  initializeModals() {
    this.templateListModal = document.getElementById("templateListModal");
    this.allTemplatesModal = document.getElementById("allTemplatesModal");
    this.mainPreview = document.getElementById("mainPreview");
    this.templateName = document.getElementById("templateName");
    this.templateGrid = document.getElementById("templateGrid");
    this.allTemplatesGrid = document.getElementById("allTemplatesGrid");

    // Buttons
    this.chooseTemplateBtn = document.getElementById("chooseTemplateBtn");
    this.useTemplateBtn = document.getElementById("useTemplateBtn");
    this.viewAllTemplatesBtn = document.getElementById("viewAllTemplatesBtn");

    this.bindEvents();
    this.loadTemplateGrid();
    this.loadAllTemplatesGrid();
  }

  bindEvents() {
    // Buka template list modal
    this.chooseTemplateBtn.addEventListener("click", () => {
      this.openTemplateListModal();
    });

    // Use selected template
    this.useTemplateBtn.addEventListener("click", () => {
      this.applyTemplate();
    });

    // Buka modal semua templates
    this.viewAllTemplatesBtn.addEventListener("click", () => {
      this.openAllTemplatesModal();
    });

    // Button close modal
    document.querySelectorAll(".close-modal").forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        // Jika modal daftar template sedang terbuka, tutup hanya modal tersebut
        if (
          this.templateListModal &&
          this.templateListModal.style.display === "block"
        ) {
          this.closeTemplateListModal();
          return;
        }

        // Jika modal semua template sedang terbuka, tutup semua modal
        if (
          this.allTemplatesModal &&
          this.allTemplatesModal.style.display === "block"
        ) {
          this.closeAllModals();
          return;
        }

        // Fallback: tutup semua modal
        this.closeAllModals();
      });
    });

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === this.templateListModal) {
        this.closeTemplateListModal();
      }
      if (e.target === this.allTemplatesModal) {
        this.closeAllModals();
      }
    });
  }

  // Buka atau Tutup Template List Modal
  openTemplateListModal(templateId = null) {
    // Jika ada templateId, set sebagai preview utama
    if (templateId) {
      const template = this.templates.find((t) => t.id === templateId);
      if (template) {
        this.setMainPreview(template);
      }
    } else if (this.currentTemplate) {
      // Jika sedang ada template aktif, preview template tersebut
      this.setMainPreview(this.currentTemplate);
    } else {
      // Default preview template pertama
      this.setMainPreview(this.templates[0]);
    }

    this.templateListModal.style.display = "block";
    this.highlightActiveTemplate();
  }

  closeTemplateListModal() {
    this.templateListModal.style.display = "none";
  }

  // Buka atau Tutup All Templates Modal
  openAllTemplatesModal() {
    // Tutup template list modal jika terbuka
    if (
      this.templateListModal &&
      this.templateListModal.style.display === "block"
    ) {
      this.closeTemplateListModal();
    }
    this.allTemplatesModal.style.display = "block";
  }

  closeAllModals() {
    this.allTemplatesModal.style.display = "none";
  }

  loadTemplateGrid() {
    const featuredTemplates = this.templates;

    this.templateGrid.innerHTML = featuredTemplates
      .map(
        (template) => `
            <img src="${template.thumbnail}" 
                 alt="${template.name}" 
                 class="template-thumbnail" 
                 data-id="${template.id}"
                 onclick="templateManager.setMainPreviewFromId('${template.id}')">
        `
      )
      .join("");
  }

  loadAllTemplatesGrid() {
    this.allTemplatesGrid.innerHTML = this.templates
      .map(
        (template) => `
            <div class="all-template-item" onclick="templateManager.selectTemplateFromAll('${template.id}')">
                <img src="${template.thumbnail}" 
                     alt="${template.name}" 
                     class="all-template-thumb w-100">
                <div class="all-template-name">${template.name}</div>
            </div>
        `
      )
      .join("");
  }

  setMainPreviewFromId(templateId) {
    const template = this.templates.find((t) => t.id === templateId);
    if (template) {
      this.setMainPreview(template);
      this.highlightActiveTemplate();
    }
  }

  setMainPreview(template) {
    this.mainPreview.src = template.fullSize;
    this.templateName.textContent = template.name;
    this.currentPreviewTemplate = template;
  }

  highlightActiveTemplate() {
    // Remove active class dari semua thumbnails
    document.querySelectorAll(".template-thumbnail").forEach((thumb) => {
      thumb.classList.remove("active");
    });

    // Add active class ke thumbnail yang sedang dipreview
    if (this.currentPreviewTemplate) {
      const activeThumb = document.querySelector(
        `[data-id="${this.currentPreviewTemplate.id}"]`
      );
      if (activeThumb) {
        activeThumb.classList.add("active");
      }
    }
  }

  selectTemplateFromAll(templateId) {
    this.closeAllModals();
    setTimeout(() => {
      this.openTemplateListModal(templateId);
    }, 300);
  }

  applyTemplate() {
    if (this.currentPreviewTemplate) {
      this.currentTemplate = this.currentPreviewTemplate;

      // apply template ke photobooth
      this.applyTemplateToPhotobooth(this.currentPreviewTemplate);

      this.closeTemplateListModal();
      alert(
        `Template "${this.currentPreviewTemplate.name}" berhasil diterapkan!`
      );
    }
  }

  // Fungsi untuk menerapkan template ke photobooth
  //  {{ Mungkin disini letak masalah nya (dimana template menutupi gambar) }} //
  applyTemplateToPhotobooth(template) {
    const img = new Image();
    img.onload = () => {
      // Simpan template image ke variabel global yang digunakan generatePrintCanvas
      window.templateImg = img; // atau this.templateImg jika menggunakan class

      // Generate ulang canvas dengan template baru
      if (typeof generatePrintCanvas === "function") {
        generatePrintCanvas();
      }
    };

    img.onerror = () => {
      console.error("Failed to load template:", template.fullSize);
      alert(
        "Gagal memuat template. Pastikan file template ada di folder yang benar."
      );
    };

    img.src = template.fullSize;
  }
}

// Initialize template manager
const templateManager = new TemplateManager();
