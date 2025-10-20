const VIDEO = document.getElementById("video");
const COUNTDOWN = document.getElementById("countdown");
const START_AUTO = document.getElementById("startAuto");
const RESET_ALL = document.getElementById("resetAll");
const CHOOSE_TEMPLATE_BTN = document.getElementById("chooseTemplateBtn");
const TEMPLATE_INPUT = document.getElementById("templateInput");
const GENERATE_BTN = document.getElementById("generateBtn");
const DOWNLOAD_BTN = document.getElementById("downloadBtn");
const PRINT_BTN = document.getElementById("printBtn");
const EVENT_TEXT = document.getElementById("eventText");

const THUMBS = [
  document.getElementById("thumb0"),
  document.getElementById("thumb1"),
  document.getElementById("thumb2"),
];

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

THUMBS.forEach((c) => {
  c.addEventListener("click", () => {
    const idx = Number(c.dataset.index);
    if (photos[idx]) {
      if (confirm("Hapus foto ke-" + (idx + 1) + "?")) {
        photos[idx] = null;
        renderThumb(idx);
      }
    }
  });
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

function generatePrintCanvas() {
  pcx.fillStyle = "#ffffff";
  pcx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  for (let i = 0; i < 3; i++) {
    const pos = FRAME_POS[i];
    pcx.fillStyle = "#fafafa";
    pcx.fillRect(pos.x, pos.y, FRAME_W, FRAME_H);
    if (photos[i]) {
      const img = new Image();
      img.onload = () => {
        drawCover(pcx, img, FRAME_W, FRAME_H, pos.x, pos.y);
        if (i === 2) {
          if (templateImg) pcx.drawImage(templateImg, 0, 0, CANVAS_W, CANVAS_H);
          drawTextArea();
        }
      };
      img.src = photos[i];
    }
  }
  drawTextArea();
}

CHOOSE_TEMPLATE_BTN.addEventListener("click", () => TEMPLATE_INPUT.click());
TEMPLATE_INPUT.addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  const img = new Image();
  img.onload = () => {
    templateImg = img;
    URL.revokeObjectURL(url);
    alert("Template berhasil dimuat.");
  };
  img.src = url;
});

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
  generatePrintCanvas();
  const link = document.createElement("a");
  link.download = "photostrip-5x15.png";
  link.href = PRINT_CANVAS.toDataURL("image/png");
  link.click();
});

PRINT_BTN.addEventListener("click", () => {
  generatePrintCanvas();
  setTimeout(() => window.print(), 300);
});

(function init() {
  pcx.fillStyle = "#ffffff";
  pcx.fillRect(0, 0, CANVAS_W, CANVAS_H);
})();
