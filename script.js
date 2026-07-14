function saveValue(key, val) {
  try {
    localStorage.setItem(`md_${key}`, JSON.stringify(val));
  } catch (e) {
    console.warn("localStorage unavailable");
  }
}

function getValue(key, fallback = "") {
  try {
    const v = localStorage.getItem(`md_${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}

function notify(msg, type = "success") {
  const n = document.createElement("div");
  n.style.cssText = `position:fixed;top:16px;right:16px;padding:12px 20px;background:${type === "error" ? "#ef4444" : "#059669"};color:white;border-radius:8px;font-weight:600;z-index:10000;animation:slideIn 0.3s ease-out;`;
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => {
    n.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => n.remove(), 300);
  }, 2500);
}

let inputModalResolver = null;

function showInputModal(title, message) {
  return new Promise((resolve) => {
    inputModalResolver = resolve;
    document.getElementById("inputModalTitle").textContent = title;
    document.getElementById("inputModalMessage").textContent = message;
    const input = document.getElementById("inputModalField");
    input.value = "";
    document.getElementById("inputModal").style.display = "flex";
    input.focus();
  });
}

function confirmInputModal() {
  const val = document.getElementById("inputModalField").value;
  document.getElementById("inputModal").style.display = "none";
  if (inputModalResolver) {
    inputModalResolver(val ? parseFloat(val) : null);
    inputModalResolver = null;
  }
}

function cancelInputModal() {
  document.getElementById("inputModal").style.display = "none";
  if (inputModalResolver) {
    inputModalResolver(null);
    inputModalResolver = null;
  }
}

const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
const modKey = isMac ? "⌘" : "Alt";
const modKeyName = isMac ? "Command" : "Alt";

function toggleShortcuts() {
  const modal = document.getElementById("shortcutsModal");
  modal.style.display = modal.style.display === "none" ? "flex" : "none";
}

function populateShortcuts() {
  const list = document.getElementById("shortcutsList");
  const shortcuts = [
    { key: `${modKey}+1`, action: "Dynamisch Tab", desc: "Zone gegevens" },
    { key: `${modKey}+2`, action: "Flow Racks", desc: "Locatie berekenen" },
    { key: `${modKey}+3`, action: "Grote Volumes", desc: "GV zones" },
    { key: `${modKey}+4`, action: "Afmetingen", desc: "Afm berekening" },
    { key: `${modKey}+5`, action: "Receptie", desc: "Lokatie lookup" },
    { key: isMac ? "⌘+T" : "Ctrl+T", action: "Thema", desc: "Licht/Donker" },
    { key: isMac ? "⌘+?" : "Ctrl+?", action: "Hulp", desc: "Dit scherm" },
  ];

  list.innerHTML = shortcuts
    .map(
      (s) => `
    <div style="background:var(--surface-2);padding:14px;border-radius:8px;border:1px solid var(--border);">
      <div style="font-family:monospace;font-weight:700;color:var(--accent);font-size:0.95rem;margin-bottom:4px;">${s.key}</div>
      <div style="font-weight:600;color:var(--text);font-size:0.9rem;">${s.action}</div>
      <div style="font-size:0.8rem;color:var(--text-muted);">${s.desc}</div>
    </div>
  `,
    )
    .join("");

  document.getElementById("helpKeyLabel").textContent = isMac
    ? "⌘+?"
    : "Ctrl+?";
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  html.setAttribute("data-theme", isDark ? "light" : "dark");
  document.getElementById("themeBtn").textContent = isDark ? "☀️" : "🌙";
  saveValue("theme", isDark ? "light" : "dark");
}

function togglePrinter() {
  document.getElementById("printerHub").classList.toggle("active");
}

function toggleHubCollapse() {
  const hubItems = document.getElementById("hubItems");
  const toggleBtn = document.getElementById("toggleHubBtn");
  hubItems.classList.toggle("collapsed");
  toggleBtn.classList.toggle("collapsed");
  saveValue("hubCollapsed", hubItems.classList.contains("collapsed"));
}

function resetPage() {
  // Clear all input fields
  const inputs = document.querySelectorAll("input[type='text'], select");
  inputs.forEach((input) => {
    input.value = "";
    input.style.borderColor = "";
  });

  // Hide all result containers
  document.querySelectorAll(".results").forEach((el) => {
    el.classList.remove("show");
  });

  // Hide progress bars
  document.querySelectorAll(".progress-container").forEach((el) => {
    el.classList.remove("active");
  });

  // Reset to first tab
  switchTab("dyn");

  // Show notification
  notify("✓ Pagina herladen");
}

function resetTab(tabName) {
  // Get the current section
  const section = document.getElementById("sec-" + tabName);
  if (!section) return;

  // Clear all input fields in this section
  const inputs = section.querySelectorAll("input[type='text'], select");
  inputs.forEach((input) => {
    input.value = "";
    input.style.borderColor = "";
  });

  // Hide result container in this section
  const results = section.querySelector(".results");
  if (results) {
    results.classList.remove("show");
  }

  // Hide progress bar in this section
  const progressContainers = section.querySelectorAll(".progress-container");
  progressContainers.forEach((pc) => {
    pc.classList.remove("active");
  });

  // Show notification
  notify("✓ Tablad herladen");
}

document.addEventListener("click", (e) => {
  const hub = document.getElementById("printerHub");
  if (!hub.contains(e.target)) hub.classList.remove("active");
});

function switchTab(tab) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById("sec-" + tab).classList.add("active");
  document.querySelector('[data-tab="' + tab + '"]').classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  saveValue("lastTab", tab);
}

function calcRec1() {
  showLoading("rec1", () => {
    const val = document.getElementById("recLoc1").value.toUpperCase().trim();
    let res = "ONBEKEND";

    const kar5 = [
      "9942B",
      "9300A",
      "9300B",
      "9320B",
      "9340A",
      "9310A",
      "9310B",
      "9330A",
      "9320A",
      "9944B",
    ];
    const kar6 = ["9400A", "9401A", "9400B", "9020A"];

    const palov = [
      "9000A",
      "9000B",
      "9010A",
      "9010B",
      "9050A",
      "9050B",
      "9060B",
      "9060A",
      "9080B",
      "9080A",
      "9710A",
      "9710B",
      "9711A",
      "9712B",
      "9040A",
    ];

    if (kar5.some((prefix) => val.startsWith(prefix))) res = "KAR5";
    else if (kar6.some((prefix) => val.startsWith(prefix))) res = "KAR6";
    else if (palov.some((prefix) => val.startsWith(prefix))) res = "PALOV";

    const cls = res !== "ONBEKEND" ? "badge-green" : "badge-red";
    document.getElementById("res-rec1").innerHTML =
      `<tr><td>${val}</td><td><span class="badge ${cls}">${res}</span></td></tr>`;
    document.getElementById("out-rec1").classList.add("show");
  });
}
function calcRec2() {
  showLoading("rec2", () => {
    const val = document.getElementById("recLoc2").value.toLowerCase().trim();

    if (!val || val.length < 5) {
      document.getElementById("res-rec2").innerHTML =
        `<tr><td colspan="3" style="color:#ef4444;text-align:center;font-weight:700;">Voer minstens 5 tekens in (bv: 3700a)</td></tr>`;
      document.getElementById("out-rec2").classList.add("show");
      return;
    }

    const zoneCode = val.substring(0, 5);
    const mZone = getMasterZone(zoneCode);
    const kar = getKar(mZone);

    let details = "";
    switch (mZone) {
      case "2200A-2700A":
        details = "Blauwe en Rode Bakken";
        break;
      case "2200B-2300B":
        details = "CRT zone";
        break;
      case "2400B-2700B":
        details = "CRT zone";
        break;
      case "3700B-3200B":
        details = "Blauwe en Rode Bakken";
        break;
      case "3700A-3200A":
        details = "Blauwe en Rode Bakken";
        break;
      case "4200A-5200A":
        details = "Blauwe en Rode Bakken";
        break;
      case "AFRAME-LS":
        details = "Lange schacht";
        break;
      case "AFRAME-KS":
        details = "Korte schacht";
        break;
      default:
        details = "Onbekende zone";
    }

    const cls = kar !== "ONBEKEND" ? "badge-green" : "badge-red";
    document.getElementById("res-rec2").innerHTML =
      `<tr><td>${mZone || "Geen Match"}</td><td><span class="badge ${cls}">${kar}</span></td><td>${details}</td></tr>`;
    document.getElementById("out-rec2").classList.add("show");
  });
}

const hdMapping = {
  UNIT: "001",
  SUPCAR: "100",
  RED: "110",
  ROOD: "110",
  BLU: "120",
  BLAUW: "120",
  BLUFRIGO: "130",
  "DEPOT BOX": "270",
  LABEL: "300",
  "APOBOX LAAG": "400",
  "APOBOX HOOG": "450",
  SSL: "510",
  LSL: "520",
  "CRT SSL": "510",
  "CRT LSL": "520",
  PALLET: "900",
  KARTON: "300",
};

const dynData = {
  D420: {
    nee: {
      code: "45",
      type: "450",
      hd: "AB2",
      size: "2A2",
      storage: "016",
      id: "D420NOTBBD",
    },
    ja: {
      code: "45",
      type: "450",
      hd: "AB2",
      size: "2A2",
      storage: "016",
      id: "D420YESBBD",
    },
  },
  D421: {
    nee: {
      code: "40",
      type: "400",
      hd: "AB1",
      size: "2A1",
      storage: "017",
      id: "D421NOTBBD",
    },
    ja: {
      code: "40",
      type: "400",
      hd: "AB1",
      size: "2A1",
      storage: "017",
      id: "D421YESBBD",
    },
  },
  D422: {
    nee: {
      code: "45",
      type: "450",
      hd: "AB2",
      size: "2A2",
      storage: "018",
      id: "D422NOTBBD",
    },
    ja: {
      code: "45",
      type: "450",
      hd: "AB2",
      size: "2A2",
      storage: "018",
      id: "D422YESBBD",
    },
  },
  D423: {
    nee: {
      code: "40",
      type: "400",
      hd: "AB1",
      size: "2A1",
      storage: "019",
      id: "D423NOTBBD",
    },
    ja: {
      code: "40",
      type: "400",
      hd: "AB1",
      size: "2A1",
      storage: "019",
      id: "D423YESBBD",
    },
  },
  R440: {
    nee: {
      code: "27",
      type: "270",
      hd: "DB5",
      size: "7DH",
      storage: "042",
      id: "R440NOTBBD",
    },
    ja: {
      code: "27",
      type: "270",
      hd: "DB5",
      size: "7DH",
      storage: "042",
      id: "R440YESBBD",
    },
  },
  R441: {
    nee: {
      code: "27",
      type: "270",
      hd: "DB5",
      size: "7DL",
      storage: "043",
      id: "R441NOTBBD",
    },
    ja: {
      code: "27",
      type: "270",
      hd: "DB5",
      size: "7DL",
      storage: "043",
      id: "R441YESBBD",
    },
  },
  R442: {
    nee: {
      code: "27",
      type: "270",
      hd: "DB5",
      size: "7DH",
      storage: "044",
      id: "R442NOTBBD",
    },
    ja: {
      code: "27",
      type: "270",
      hd: "DB5",
      size: "7DH",
      storage: "044",
      id: "R442YESBBD",
    },
  },
  R443: {
    nee: {
      code: "27",
      type: "270",
      hd: "DB5",
      size: "7DL",
      storage: "045",
      id: "R443NOTBBD",
    },
    ja: {
      code: "27",
      type: "270",
      hd: "DB5",
      size: "7DL",
      storage: "045",
      id: "R443YESBBD",
    },
  },
  R600: {
    nee: {
      code: "27",
      type: "270",
      hd: "DB5",
      size: "7DH",
      storage: "049",
      id: "R600NOTBBD",
    },

    ja: {
      code: "27",
      type: "270",
      hd: "DB5",
      size: "7DH",
      storage: "049",
      id: "R600YESBBD",
    },
  },
};

const fixData = [
  { z: "2200A-2700A", l: "1", k: "BLAUW", c: 5, s: 8 },
  { z: "2200A-2700A", l: "2", k: "ROOD", c: 6, s: 9 },
  { z: "2200A-2700A", l: "3", k: "ROOD", c: 4, s: 9 },
  { z: "2200A-2700A", l: "4,5,6", k: "ROOD", c: 5, s: 9 },
  { z: "2200B-2300B", l: "1,2,3,4,5,6", k: "CRT", c: 3, s: 6 },
  { z: "2400B-2700B", l: "1,2,3,4,5,6", k: "CRT", c: 3, s: 7 },
  { z: "3700B-3200B", l: "1,2,3,4,5,6,8", k: "BLAUW", c: 3, s: 8 },
  { z: "3700B-3200B", l: "7", k: "ROOD", c: 4, s: 9 },
  { z: "3700A-3200A", l: "1,2", k: "BLAUW", c: 6, s: 10 },
  { z: "3700A-3200A", l: "5", k: "BLAUW", c: 4, s: 10 },
  { z: "3700A-3200A", l: "3,4", k: "ROOD", c: 4, s: 11 },
  { z: "3700A-3200A", l: "6,7", k: "ROOD", c: 5, s: 11 },
  { z: "4200A-5200A", l: "1,5", k: "BLAUW", c: 5, s: 12 },
  { z: "4200A-5200A", l: "3", k: "BLAUW", c: 4, s: 12 },
  { z: "4200A-5200A", l: "2", k: "ROOD", c: 6, s: 11 },
  { z: "4200A-5200A", l: "3,4,5", k: "ROOD", c: 4, s: 11 },
  { z: "4200A-5200A", l: "6,7", k: "ROOD", c: 5, s: 13 },
];

const afmData = {
  "2200A-2700A": { name: "2200A-2700A", liggers: { "1-6": "245" } },
  "3700B-3200B": { name: "3700B-3200B", liggers: { "1-8": "147" } },
  "3700A-3200A": {
    name: "3700A-3200A",
    liggers: { "1, 3, 5": "196", "2, 4, 6, 7": "245" },
  },
  "4200A-5200A": {
    name: "4200A-5200A",
    liggers: { "1, 3, 5": "196", "2, 4, 6, 7": "294" },
  },
  "20DOZEN": {
    name: "20 Dozen Aisle",
    liggers: { 1: "409", "2-5": "394" },
  },
  AFRAME: { name: "Aframe", liggers: { "1-5": "394" } },
};

function getWidthForZoneAndLigger(zone, location) {
  if (location.length < 10) return 147;
  const ligger = parseInt(location.substring(8, 10)).toString();
  let afmZone = zone;
  if (zone === "2200A-2700A") afmZone = "2200A-2700A";
  if (zone === "2200B-2300B" || zone === "2400B-2700B") afmZone = "20DOZEN";
  if (zone === "3700B-3200B") afmZone = "3700B-3200B";
  if (zone === "3700A-3200A") afmZone = "3700A-3200A";
  if (zone === "4200A-5200A") afmZone = "4200A-5200A";

  if (!afmData[afmZone]) return 147;

  const liggers = afmData[afmZone].liggers;

  for (const [liggerRange, width] of Object.entries(liggers)) {
    if (liggerRange.includes(",")) {
      const liggerList = liggerRange.split(",").map((l) => l.trim());
      if (liggerList.includes(ligger)) return parseInt(width);
    } else if (liggerRange.includes("-")) {
      const [start, end] = liggerRange
        .split("-")
        .map((l) => parseInt(l.trim()));
      const liggerNum = parseInt(ligger);
      if (liggerNum >= start && liggerNum <= end) return parseInt(width);
    } else {
      if (parseInt(liggerRange) === parseInt(ligger)) return parseInt(width);
    }
  }

  return 147;
}

function getMasterZone(zoneCode) {
  if (!zoneCode) return "";
  const lowerZone = zoneCode.toLowerCase();
  if (lowerZone.startsWith("1000a")) return "AFRAME-LS";
  if (
    lowerZone.startsWith("1001") ||
    lowerZone.startsWith("1002") ||
    lowerZone.startsWith("1003") ||
    lowerZone.startsWith("1004") ||
    lowerZone.startsWith("1005") ||
    lowerZone.startsWith("1006") ||
    lowerZone.startsWith("1007") ||
    lowerZone.startsWith("1008") ||
    lowerZone.startsWith("1009") ||
    lowerZone.startsWith("101") ||
    lowerZone.startsWith("102")
  )
    return "AFRAME-KS";
  if (lowerZone.startsWith("2") || lowerZone.startsWith("3")) {
    if (lowerZone.startsWith("2")) {
      return lowerZone.includes("b")
        ? parseInt(lowerZone.substring(0, 2)) <= 23
          ? "2200B-2300B"
          : "2400B-2700B"
        : "2200A-2700A";
    }
    return lowerZone.includes("b") ? "3700B-3200B" : "3700A-3200A";
  } else if (
    parseInt(lowerZone.substring(0, 2)) >= 42 &&
    parseInt(lowerZone.substring(0, 2)) <= 52
  ) {
    return lowerZone.includes("b") ? "4200B-5200B" : "4200A-5200A";
  }
  return "";
}

function getKar(mZone) {
  if (mZone === "2200A-2700A") return "KAR2";
  if (mZone === "2200B-2300B" || mZone === "2400B-2700B") return "PAL1";
  if (mZone === "3700B-3200B") return "KAR2";
  if (mZone === "3700A-3200A") return "KAR3";
  if (mZone === "4200A-5200A") return "KAR3";
  if (mZone === "AFRAME-LS") return "PAL1";
  if (mZone === "AFRAME-KS") return "KAR1";
  return "ONBEKEND";
}

function autoSelectKleur() {
  let input = document
    .getElementById("fixZoneManual")
    .value.toLowerCase()
    .trim();
  let kleurSelect = document.getElementById("fixKleurManual");
  if (input.length < 10) return;
  let normalizedInput = normalizeToPickLocation(input);
  let zoneCode = normalizedInput.substring(0, 5);
  if (zoneCode === "6000a") {
    document.getElementById("fixZoneManual").style.borderColor =
      "var(--accent)";
    let rekNum = parseInt(normalizedInput.substring(5, 8));
    if ((rekNum >= 1 && rekNum <= 6) || (rekNum >= 14 && rekNum <= 24))
      document.getElementById("fixTypeManual").value = "BLU FRIGO";
    return;
  }
  let liggerNr = parseInt(normalizedInput.substring(8, 10)).toString();
  let mZone = getMasterZone(zoneCode);
  let match = fixData.find(
    (d) =>
      d.z === mZone &&
      d.l
        .split(",")
        .map((s) => s.trim())
        .includes(liggerNr),
  );
  if (mZone.includes("b") && (mZone.startsWith("22") || mZone.startsWith("24")))
    match = { k: "CRT" };
  if (match) {
    kleurSelect.value = match.k;
    document.getElementById("fixZoneManual").style.borderColor =
      "var(--accent)";
  } else {
    document.getElementById("fixZoneManual").style.borderColor = "#ef4444";
  }
}

function calculateEntryLocation(pickLoc) {
  if (pickLoc.length < 12) return "-";
  let gang = pickLoc.substring(0, 2);
  let type = pickLoc.substring(2, 5).toLowerCase();
  let rest = pickLoc.substring(5);
  let newType = type === "00b" ? "02a" : type === "00a" ? "01b" : type;
  return gang + newType + rest;
}

function getPickLocationFromEntry(entryLoc) {
  if (entryLoc.length < 12) return entryLoc;
  let gang = entryLoc.substring(0, 2);
  let type = entryLoc.substring(2, 5).toLowerCase();
  let rest = entryLoc.substring(5);
  let pickType = type === "02a" ? "00b" : type === "01b" ? "00a" : type;
  return gang + pickType + rest;
}

function normalizeToPickLocation(input) {
  if (input.length < 12) return input;
  let type = input.substring(2, 5).toLowerCase();
  if (type === "01b" || type === "02a") {
    return getPickLocationFromEntry(input);
  }
  return input;
}

function updateAfmLiggers() {
  const zk = document.getElementById("afmZone").value;
  const lSel = document.getElementById("afmLigger");
  lSel.innerHTML = '<option value="">Kies ligger(s)...</option>';
  if (zk && afmData[zk]) {
    Object.keys(afmData[zk].liggers).forEach((l) =>
      lSel.add(new Option("Ligger(s) " + l, l)),
    );
    lSel.disabled = false;
  }
}

function showLoading(type, callback) {
  const container = document.getElementById("prog-" + type);
  const bar = container.querySelector(".progress-bar");
  const results = document.getElementById("out-" + type);
  if (results) results.classList.remove("show");
  container.classList.add("active");
  bar.style.width = "0%";
  setTimeout(() => {
    bar.style.width = "100%";
    setTimeout(() => {
      container.classList.remove("active");
      callback();
    }, 400);
  }, 50);
}

function calcDyn() {
  showLoading("dyn", () => {
    const z = document.getElementById("dynZone").value;
    const b = document.getElementById("dynBBD").value;
    const d = dynData[z][b];
    const cls = b === "ja" ? "badge-green" : "badge-red";
    document.getElementById("res-dyn").innerHTML =
      `<tr><td>${d.code}</td><td>${d.type}</td><td>${d.hd}</td><td>${d.size}</td><td>${d.storage}</td><td>${z === "R600" ? "COO" : "CON"}</td><td><span class="badge ${cls}">${d.id}</span></td></tr>`;
    document.getElementById("out-dyn").classList.add("show");
    saveValue("lastDynZone", z);
    saveValue("lastDynBBD", b);
    notify("✓ Gegevens gegenereerd");
  });
}

function calcFixEfficient() {
  showLoading("fix", async () => {
    let input = document
      .getElementById("fixZoneManual")
      .value.toLowerCase()
      .trim();
    let kleur = document.getElementById("fixKleurManual").value;
    let type = document.getElementById("fixTypeManual").value;

    if (input.length < 10) {
      document.getElementById("table-fix").innerHTML =
        `<tr><td colspan="6" style="color:#ef4444;text-align:center;font-weight:800;padding:20px;">❌ GELDIGE LOCATIE NODIG</td></tr>`;
      document.getElementById("out-fix").classList.add("show");
      notify("Voer geldige locatie in", "error");
      return;
    }

    const table = document.getElementById("table-fix");
    let pickingLocRaw = normalizeToPickLocation(input);
    let entryLocRaw = calculateEntryLocation(pickingLocRaw);
    pickingLocRaw = pickingLocRaw.toUpperCase();
    entryLocRaw = entryLocRaw.toUpperCase();
    const formatLoc = (loc) =>
      loc.length < 12
        ? loc
        : `${loc.substring(0, 4)} ${loc.substring(4, 5)} ${loc.substring(5, 8)} ${loc.substring(8, 10)} ${loc.substring(10, 12)}`;

    if (pickingLocRaw.substring(0, 5) === "6000A") {
      let rekNum = parseInt(pickingLocRaw.substring(5, 8));
      if (rekNum >= 1 && rekNum <= 24) {
        let lvCode, hdDisplay, size, storage, item, ceil, tresh;
        if ((rekNum >= 1 && rekNum <= 6) || (rekNum >= 14 && rekNum <= 24)) {
          lvCode = "13";
          hdDisplay = "BLF / 130";
          size = "CRT";
          storage = "021";
          item = "COO";
          ceil = "3";
          tresh = "1";
        } else {
          let mHd = hdMapping[type] || "300";
          lvCode = mHd.substring(0, 2);
          hdDisplay = `${type === "BLU FRIGO" ? "BLF" : type} / ${mHd}`;
          size = "CRT";
          storage = "021";
          item = "COO";
          ceil = "—";
          tresh = "—";
        }
        renderFixTable(
          table,
          lvCode,
          hdDisplay,
          size,
          storage,
          item,
          ceil,
          tresh,
          pickingLocRaw,
          entryLocRaw,
          formatLoc,
          "COO",
        );
        document.getElementById("out-fix").classList.add("show");
        saveValue("lastFixZone", input);
        notify("✓ Flow Racks berekend");
        return;
      }
    }

    let mZone = getMasterZone(pickingLocRaw.substring(0, 5));
    let match = fixData.find(
      (d) =>
        d.z === mZone &&
        (d.k === kleur || (kleur === "CRT" && d.k === "BLAUW")),
    );
    if (!match)
      table.innerHTML = `<tr><td colspan="6" style="color:#ef4444;text-align:center;font-weight:800;padding:20px;">❌ GEEN MATCH</td></tr>`;
    else {
      let mHd = hdMapping[type] || "300";
      let isV = type.includes("LSL") || type.includes("SSL") || kleur === "CRT";
      let ceil = "—";
      let tresh = "—";

      if (isV) {
        const breedte = await showInputModal(
          "Breedte karton",
          "Voer de breedte van het karton in (cm):",
        );
        if (!breedte || isNaN(breedte)) {
          table.innerHTML = `<tr><td colspan="6" style="color:#ef4444;text-align:center;font-weight:800;padding:20px;">❌ BEREKENING GEANNULEERD</td></tr>`;
          document.getElementById("out-fix").classList.add("show");
          notify("Berekening geannuleerd", "error");
          return;
        }
        const width = getWidthForZoneAndLigger(
          mZone,
          pickingLocRaw.toLowerCase(),
        );
        ceil = Math.floor(width / breedte);
        tresh = Math.ceil(ceil / 3);
      } else {
        ceil = match.c;
        tresh = Math.ceil(match.c / 3);
      }

      renderFixTable(
        table,
        mHd.substring(0, 2),
        `${type} / ${mHd}`,
        kleur === "BLAUW" ? "BLU" : kleur === "ROOD" ? "RED" : "CRT",
        match.s.toString().padStart(3, "0"),
        "CON",
        ceil,
        tresh,
        pickingLocRaw,
        entryLocRaw,
        formatLoc,
        getKar(mZone),
      );
    }
    document.getElementById("out-fix").classList.add("show");
    saveValue("lastFixZone", input);
    if (match) notify("✓ Flow Racks berekend");
  });
}

function transformKar(kar) {
  if (kar === "PAL1") return "PAL1/PALOV";
  if (kar === "KAR1") return "KAR1";
  if (kar === "KAR2") return "KAR2/KAR6";
  if (kar === "KAR3") return "KAR3/KAR5";
  return kar;
}

function renderFixTable(
  table,
  lv,
  hd,
  sz,
  st,
  it,
  ce,
  tr,
  pLoc,
  eLoc,
  fmt,
  kar,
) {
  const transformedKar = transformKar(kar);

  let karDisplay = transformedKar;
  if (transformedKar.includes("/")) {
    const [part1, part2] = transformedKar.split("/");
    karDisplay = `${part1}<span style="font-size:1rem;color:#5ba3d0;font-weight:600;margin-left:4px;">/${part2}</span>`;
  }

  table.innerHTML = `<thead><tr><th>LV</th><th>HD Type</th><th>Loc. Size</th><th>Storage</th><th>Item Group</th><th style="border-left:2px solid var(--border-strong);">Ceiling</th><th>Tresh</th></tr></thead>
          <tbody><tr><td style="font-weight:700;">${lv}</td><td style="font-weight:600;">${hd}</td><td style="font-weight:700;">${sz}</td><td style="font-weight:600;">${st}</td><td style="font-weight:600;">${it}</td><td style="border-left:2px solid var(--border-strong);"><span style="display:inline-block;background:var(--accent-glow);color:var(--accent);font-weight:800;padding:4px 12px;border-radius:6px;font-size:.88rem;border:1.5px solid rgba(0,150,57,.2);">${ce}</span></td><td><span style="display:inline-block;background:var(--accent-glow);color:var(--accent);font-weight:800;padding:4px 12px;border-radius:6px;font-size:.88rem;border:1.5px solid rgba(0,150,57,.2);">${tr}</span></td></tr>
          <tr><td colspan="7" style="padding:15px 20px; background:var(--surface-3); border-top:1.5px solid var(--border); border-bottom:1.5px solid var(--border);"><div style="display:flex; align-items:center; gap:12px;"><span style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Receptie:</span><span class="badge badge-green" style="font-size:1rem; padding:6px 20px;">${karDisplay}</span></div></td></tr>
          <tr><td colspan="7" style="padding:20px;background:var(--surface-2);"><div class="loc-grid"><div style="background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:14px 18px;"><div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:6px;">Picking</div><div style="font-family:'Inter',system-ui,sans-serif;font-size:.9rem;font-weight:600;letter-spacing:3px;color:var(--text);">${fmt(pLoc)}</div></div><div style="background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:14px 18px;"><div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:6px;">Entry</div><div style="font-family:'Inter',system-ui,sans-serif;font-size:.9rem;font-weight:600;letter-spacing:3px;color:var(--text);">${fmt(eLoc)}</div></div></div></td></tr></tbody>`;
}

function calcAfm() {
  showLoading("afm", async () => {
    const zk = document.getElementById("afmZone").value;
    const lk = document.getElementById("afmLigger").value;

    if (!zk || !lk) {
      document.getElementById("res-afm").innerHTML =
        `<tr><td colspan="4" style="color:#ef4444;text-align:center;font-weight:700;">⚠️ Kies zone en ligger</td></tr>`;
      document.getElementById("out-afm").classList.add("show");
      notify("Selecteer zone en ligger", "error");
      return;
    }

    const val = await showInputModal(
      "Breedte karton",
      "Voer de breedte van het karton in (cm):",
    );
    if (!val || isNaN(val)) {
      document.getElementById("res-afm").innerHTML =
        `<tr><td colspan="4" style="color:#ef4444;text-align:center;font-weight:700;">❌ BEREKENING GEANNULEERD</td></tr>`;
      document.getElementById("out-afm").classList.add("show");
      notify("Berekening geannuleerd", "error");
      return;
    }

    const cap = Math.floor(parseInt(afmData[zk].liggers[lk]) / val);
    document.getElementById("res-afm").innerHTML =
      `<tr><td>${afmData[zk].name}</td><td>${lk}</td><td style="color:var(--accent);font-weight:800;">${cap}</td><td>${Math.ceil(cap / 3)}</td></tr>`;
    document.getElementById("out-afm").classList.add("show");
    saveValue("lastAfmZone", zk);
    saveValue("lastAfmLigger", lk);
    notify("✓ Afmetingen berekend");
  });
}

function getGVZone(zoneCode) {
  if (!zoneCode || zoneCode.length < 4) return "";
  const prefix = parseInt(zoneCode.substring(0, 4));
  if (prefix >= 7000 && prefix <= 7010) return "7000-7010";
  if (prefix >= 7050 && prefix <= 7070) return "7050-7070";
  if (prefix >= 7100 && prefix <= 7150) return "7100-7150";
  return "";
}

function calcGV() {
  showLoading("gv", () => {
    let input = document
      .getElementById("gvLocManual")
      .value.toLowerCase()
      .trim();

    let z = "";

    if (input.length >= 4) {
      z = getGVZone(input);
      if (!z) {
        document.getElementById("res-gv").innerHTML =
          `<tr><td colspan="6" style="color:#ef4444;text-align:center;font-weight:700;">❌ GEEN GELDIGE ZONE GEVONDEN</td></tr>`;
        document.getElementById("out-gv").classList.add("show");
        notify("Zone niet gevonden", "error");
        return;
      }
    } else {
      z = document.getElementById("gvZone").value;
      if (!z) {
        document.getElementById("res-gv").innerHTML =
          `<tr><td colspan="6" style="color:#ef4444;text-align:center;font-weight:700;">Voer een locatie in of kies een zone</td></tr>`;
        document.getElementById("out-gv").classList.add("show");
        notify("Voer locatie in of kies zone", "error");
        return;
      }
    }

    let sG = "",
      pZ = "",
      iG = "",
      lS = "CRT";
    if (z === "7000-7010") {
      sG = "023";
      pZ = "GV1";
      iG = "GV1";
    } else if (z === "7050-7070") {
      sG = "074";
      pZ = "GV2";
      iG = "GV2";
    } else if (z === "7100-7150") {
      sG = "062";
      pZ = "GV2";
      iG = "GV2";
    } else if (z === "DISPLAYS") {
      sG = "051";
      pZ = "GV2";
      iG = "GV2";
      lS = "PAL";
    } else if (z === "PLOFKOT") {
      sG = "069";
      pZ = "HAZ";
      iG = "HAZ";
      lS = "PAL";
    }
    document.getElementById("res-gv").innerHTML =
      `<tr><td>30</td><td>LAB / 300</td><td style="font-weight:700;">${lS}</td><td>${sG}</td><td>${iG}</td><td><span class="badge badge-green">${pZ}</span></td></tr>`;
    document.getElementById("out-gv").classList.add("show");
    saveValue("lastGvZone", z);
    notify("✓ Grote Volumes gevonden");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("inputModalField")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmInputModal();
      if (e.key === "Escape") cancelInputModal();
    });

  document.getElementById("inputModal").addEventListener("click", (e) => {
    if (e.target.id === "inputModal") cancelInputModal();
  });

  // Restore hub collapse state
  const hubCollapsed = getValue("hubCollapsed", false);
  if (hubCollapsed) {
    const hubItems = document.getElementById("hubItems");
    const toggleBtn = document.getElementById("toggleHubBtn");
    hubItems.classList.add("collapsed");
    toggleBtn.classList.add("collapsed");
  }

  const savedTheme = getValue("theme", "light");
  document.documentElement.setAttribute("data-theme", savedTheme);
  document.getElementById("themeBtn").textContent =
    savedTheme === "dark" ? "🌙" : "☀️";

  const lastTab = getValue("lastTab", "dyn");
  setTimeout(() => switchTab(lastTab), 50);

  populateShortcuts();

  const modal = document.getElementById("shortcutsModal");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) toggleShortcuts();
  });

  document.addEventListener("keydown", (e) => {
    const isModKey = isMac ? e.metaKey : e.altKey;

    if (isModKey && !e.ctrlKey) {
      if (e.key === "1") {
        e.preventDefault();
        switchTab("dyn");
      }
      if (e.key === "2") {
        e.preventDefault();
        switchTab("fix");
      }
      if (e.key === "3") {
        e.preventDefault();
        switchTab("gv");
      }
      if (e.key === "4") {
        e.preventDefault();
        switchTab("afm");
      }
      if (e.key === "5") {
        e.preventDefault();
        switchTab("rec");
      }
    }

    if (isMac && e.metaKey && e.key === "t") {
      e.preventDefault();
      toggleTheme();
    }
    if (!isMac && e.ctrlKey && e.key === "t") {
      e.preventDefault();
      toggleTheme();
    }

    if (isMac && e.metaKey && e.shiftKey && e.key === "?") {
      e.preventDefault();
      toggleShortcuts();
    }
    if (!isMac && e.ctrlKey && e.shiftKey && e.key === "?") {
      e.preventDefault();
      toggleShortcuts();
    }
  });

  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
  `;
  document.head.appendChild(style);
});
