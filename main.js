// MTG Proxy Generator: Scryfall search + printable sheet (3×3) + Save/Load
const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const results = $("results");
const sheet = $("sheet");
const printGrid = $("printGrid");

const STORAGE_KEY = "mtg-proxy-sheet-v1";

const state = {
  searchResults: [],
  selected: new Set(),
  sheetCards: [],
};

function setStatus(msg, type = "info") {
  statusEl.textContent = msg || "";
  statusEl.className = "mt-4 text-sm " + (type === "error" ? "text-rose-600" : "text-slate-600");
}

function cardHtml(src, selected = false) {
  return `
    <button class="relative aspect-[63/88] rounded-lg overflow-hidden bg-slate-100 border border-slate-300 ${selected ? "ring-2 ring-emerald-500" : ""}">
      <img src="${src}" alt="Card" class="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
    </button>
  `;
}

function renderResults() {
  results.innerHTML = "";
  state.searchResults.forEach((c, i) => {
    const selected = state.selected.has(i);
    const wrapper = document.createElement("div");
    wrapper.innerHTML = cardHtml(c.thumb, selected);
    const btn = wrapper.firstElementChild;
    btn.addEventListener("click", () => {
      if (state.selected.has(i)) state.selected.delete(i); else state.selected.add(i);
      renderResults();
    });
    results.appendChild(btn);
  });
}

function renderSheet() {
  sheet.innerHTML = "";
  state.sheetCards.forEach((src) => {
    const slot = document.createElement("div");
    slot.className = "aspect-[63/88] rounded-md bg-white border border-slate-300 overflow-hidden";
    slot.innerHTML = `<img src="\${src}" class="w-full h-full object-cover" loading="lazy" />`;
    sheet.appendChild(slot);
  });
}

async function searchScryfall(name, setCode) {
  let q = name.trim();
  if (!q) return [];
  const quoted = /(^".*"$)|(^!)/.test(q) ? q : `"\${q}"`;
  let query = `https://api.scryfall.com/cards/search?q=\${encodeURIComponent(quoted)}&unique=art`;
  if (setCode && setCode.trim()) {
    query += `+set:\${encodeURIComponent(setCode.trim())}`;
  }
  const res = await fetch(query);
  if (!res.ok) {
    throw new Error(`Scryfall error \${res.status}`);
  }
  const json = await res.json();
  const data = json.data || [];
  const cards = data.map((c) => {
    const img = (c.image_uris && (c.image_uris.large || c.image_uris.png || c.image_uris.normal)) || null;
    const thumb = (c.image_uris && (c.image_uris.small || c.image_uris.art_crop)) || null;
    const df = (!img && c.card_faces && c.card_faces.length) ? c.card_faces[0] : null;
    const faceImg = img || (df && (df.image_uris.large || df.image_uris.png || df.image_uris.normal));
    const faceThumb = thumb || (df && (df.image_uris.small || df.image_uris.art_crop)) || faceImg;
    return { img: faceImg, thumb: faceThumb };
  }).filter(c => !!c.img);
  return cards;
}

// Save/Load
$("saveSheet").addEventListener("click", () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.sheetCards));
    setStatus(`Saved ${state.sheetCards.length} card(s) to this browser.`);
  } catch (e) {
    console.error(e);
    setStatus("Failed to save. Storage may be full or disabled.", "error");
  }
});

$("loadSheet").addEventListener("click", () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setStatus("No saved sheet found in this browser.");
      return;
    }
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error("Invalid data");
    state.sheetCards = arr;
    renderSheet();
    setStatus(`Loaded ${state.sheetCards.length} card(s) from this browser.`);
  } catch (e) {
    console.error(e);
    setStatus("Failed to load saved sheet.", "error");
  }
});

// UI events
$("searchBtn").addEventListener("click", async () => {
  const name = $("cardName").value;
  const setCode = $("setCode").value;
  state.selected.clear();
  setStatus("Searching Scryfall…");
  try {
    state.searchResults = await searchScryfall(name, setCode);
    if (!state.searchResults.length) {
      setStatus("No results found. Try a different name or remove the set code.");
    } else {
      setStatus(`Found ${state.searchResults.length} result(s). Tap cards to select.`);
    }
    renderResults();
  } catch (e) {
    console.error(e);
    setStatus("Error contacting Scryfall. Please try again.", "error");
  }
});

$("addToSheet").addEventListener("click", () => {
  if (!state.selected.size) return;
  const toAdd = Array.from(state.selected).map(i => state.searchResults[i].img);
  state.sheetCards.push(...toAdd);
  state.selected.clear();
  renderResults();
  renderSheet();
  setStatus(`${toAdd.length} card(s) added to sheet. Currently ${state.sheetCards.length} total.`);
});

$("clearSheet").addEventListener("click", () => {
  state.sheetCards = [];
  renderSheet();
  setStatus("Sheet cleared.");
});

$("printSheet").addEventListener("click", () => {
  printGrid.innerHTML = "";
  state.sheetCards.forEach((src) => {
    const el = document.createElement("div");
    el.className = "print-card";
    el.innerHTML = `<img src="\${src}" />`;
    printGrid.appendChild(el);
  });
  if (!state.sheetCards.length) {
    setStatus("Add some cards to the sheet before printing.");
    return;
  }
  const printable = document.getElementById("printable");
  printable.classList.remove("hidden");
  window.print();
  setTimeout(() => printable.classList.add("hidden"), 500);
});

// Utilities to render the print grid (shared by print/download)
function populatePrintGrid() {
  printGrid.innerHTML = "";
  state.sheetCards.forEach((src) => {
    const el = document.createElement("div");
    el.className = "print-card";
    el.innerHTML = `<img src="${src}" />`;
    printGrid.appendChild(el);
  });
}

// Download PNG of the sheet (Letter page area with margins)
async function downloadAsPng() {
  if (!state.sheetCards.length) {
    setStatus("Add some cards to the sheet before exporting.");
    return;
  }
  populatePrintGrid();
  const printable = document.getElementById("printable");
  printable.classList.remove("hidden");
  try {
    // html2canvas renders pixels; we grab the printGrid only for a tight PNG
    const node = document.getElementById("printGrid");
    const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2 });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "mtg-proxy-sheet.png";
    a.click();
  } catch (e) {
    console.error(e);
    setStatus("Failed to generate PNG. Try again.", "error");
  } finally {
    printable.classList.add("hidden");
  }
}

// Download PDF (Letter, 0.25in margins) containing the sheet
async function downloadAsPdf() {
  if (!state.sheetCards.length) {
    setStatus("Add some cards to the sheet before exporting.");
    return;
  }
  populatePrintGrid();
  const printable = document.getElementById("printable");
  printable.classList.remove("hidden");
  try {
    const node = document.getElementById("printGrid");
    const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "in", format: "letter", compress: true });

    // Page box
    const pageW = 8.5;
    const pageH = 11.0;
    const margin = 0.25;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    // Image aspect ratio fit
    const imgW = canvas.width;
    const imgH = canvas.height;
    const imgRatio = imgW / imgH;
    let w = maxW;
    let h = w / imgRatio;
    if (h > maxH) {
      h = maxH;
      w = h * imgRatio;
    }

    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;
    doc.addImage(imgData, "PNG", x, y, w, h, "", "FAST");
    doc.save("mtg-proxy-sheet.pdf");
  } catch (e) {
    console.error(e);
    setStatus("Failed to generate PDF. Try again.", "error");
  } finally {
    printable.classList.add("hidden");
  }
}

$("downloadPng").addEventListener("click", downloadAsPng);
$("downloadPdf").addEventListener("click", downloadAsPdf);

