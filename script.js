/* ==========================================================================
   TABLA PERIÓDICA INTERACTIVA — script.js
   ========================================================================== */

(() => {
  "use strict";

  /* ---------------------------------------------------------------------
     ESTADO GLOBAL
  --------------------------------------------------------------------- */
  let ELEMENTS = [];
  let deferredInstallPrompt = null;
  const activeFilters = { familia: new Set(), estado: new Set(), bloque: new Set() };

  const FAMILY_CLASS = {
    "Metales alcalinos": "fam-Metales-alcalinos",
    "Metales alcalinotérreos": "fam-Metales-alcalinotérreos",
    "Metales de transición": "fam-Metales-de-transición",
    "Metales postransición": "fam-Metales-postransición",
    "Metaloides": "fam-Metaloides",
    "No metales": "fam-No-metales",
    "Halógenos": "fam-Halógenos",
    "Gases nobles": "fam-Gases-nobles",
    "Lantánidos": "fam-Lantánidos",
    "Actínidos": "fam-Actínidos",
    "Hidrógeno": "fam-Hidrógeno"
  };

  const FAMILY_COLOR_VAR = {
    "Metales alcalinos": "--fam-alcalino",
    "Metales alcalinotérreos": "--fam-alcalinoterreo",
    "Metales de transición": "--fam-transicion",
    "Metales postransición": "--fam-postransicion",
    "Metaloides": "--fam-metaloide",
    "No metales": "--fam-nometal",
    "Halógenos": "--fam-halogeno",
    "Gases nobles": "--fam-noble",
    "Lantánidos": "--fam-lantanido",
    "Actínidos": "--fam-actinido",
    "Hidrógeno": "--fam-hidrogeno"
  };

  const FAMILY_INFO = {
    "Metales alcalinos": "Elementos muy reactivos del grupo 1 (excepto el hidrógeno). Tienen un solo electrón en su capa externa, son blandos, brillantes y reaccionan violentamente con el agua.",
    "Metales alcalinotérreos": "Elementos del grupo 2. Son metales reactivos, aunque menos que los alcalinos, con dos electrones en su capa externa.",
    "Metales de transición": "Grupos 3 al 12. Suelen formar varios estados de oxidación, son buenos conductores y forman compuestos coloridos.",
    "Metales postransición": "Metales más blandos y con puntos de fusión más bajos que los de transición, ubicados a la derecha de la tabla.",
    "Metaloides": "Elementos con propiedades intermedias entre metales y no metales, útiles en semiconductores.",
    "No metales": "Elementos que no conducen bien la electricidad y suelen ser esenciales para la vida (como el carbono, nitrógeno y oxígeno).",
    "Halógenos": "Grupo 17. Son muy reactivos y forman sales al combinarse con metales.",
    "Gases nobles": "Grupo 18. Extremadamente estables y poco reactivos, con sus capas de electrones completas.",
    "Lantánidos": "Serie de 15 elementos de propiedades similares, clave en tecnología (imanes, láseres, pantallas).",
    "Actínidos": "Serie de 15 elementos, en su mayoría radiactivos y sintéticos, incluyendo el uranio y el plutonio.",
    "Hidrógeno": "El elemento más simple y abundante del universo, con propiedades únicas que no encajan totalmente en ninguna otra familia."
  };

  /* ---------------------------------------------------------------------
     CARGA DE DATOS
  --------------------------------------------------------------------- */
  async function loadElements() {
    const res = await fetch("data/elements.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`No se pudo cargar la base de datos (${res.status}).`);

    const data = await res.json();
    if (!Array.isArray(data) || data.length !== 118) {
      throw new Error("La base de datos de elementos está incompleta o tiene un formato incorrecto.");
    }

    const numbers = data.map(e => e.numeroAtomico);
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== 118 || !numbers.every((n, i) => n === i + 1)) {
      throw new Error("La numeración de los elementos no es válida.");
    }

    ELEMENTS = data;
  }

  function byAtomicNumber(n) {
    return ELEMENTS.find(e => e.numeroAtomico === n);
  }

  /* ---------------------------------------------------------------------
     RENDER: TABLA PERIÓDICA
  --------------------------------------------------------------------- */
  function renderTable() {
    const grid = document.getElementById("periodicTable");
    grid.innerHTML = "";

    // 18 columnas x 7 filas principales + fila de nota + 2 filas lantánidos/actínidos
    const cellMap = {}; // "row-col" -> element

    ELEMENTS.forEach(el => {
      if (el.grupo && el.grupo > 0) {
        cellMap[`${el.periodo}-${el.grupo}`] = el;
      }
    });

    // Lantánidos (periodo 6, grupo -1) y actínidos (periodo 7, grupo -1) se ubican en filas 9 y 10
    const lantanidos = ELEMENTS.filter(e => e.familia === "Lantánidos").sort((a,b)=>a.numeroAtomico-b.numeroAtomico);
    const actinidos = ELEMENTS.filter(e => e.familia === "Actínidos").sort((a,b)=>a.numeroAtomico-b.numeroAtomico);

    for (let row = 1; row <= 7; row++) {
      for (let col = 1; col <= 18; col++) {
        const el = cellMap[`${row}-${col}`];
        if (el) {
          grid.appendChild(createCell(el, row, col));
        } else if ((row === 6 || row === 7) && col === 3) {
          // marcador de referencia a la serie f
          const div = document.createElement("div");
          div.className = "el-cell placeholder";
          div.style.gridRow = row;
          div.style.gridColumn = col;
          grid.appendChild(div);
        } else {
          const div = document.createElement("div");
          div.className = "el-cell placeholder";
          div.style.gridRow = row;
          div.style.gridColumn = col;
          grid.appendChild(div);
        }
      }
    }

    // fila separadora
    for (let col = 1; col <= 18; col++) {
      const div = document.createElement("div");
      div.className = "el-cell placeholder";
      div.style.gridRow = 8;
      div.style.gridColumn = col;
      div.style.aspectRatio = "auto";
      div.style.height = "10px";
      grid.appendChild(div);
    }

    lantanidos.forEach((el, i) => grid.appendChild(createCell(el, 9, i + 3)));
    actinidos.forEach((el, i) => grid.appendChild(createCell(el, 10, i + 3)));
  }

  function createCell(el, row, col) {
    const div = document.createElement("div");
    div.className = `el-cell ${FAMILY_CLASS[el.familia] || ""}`;
    div.style.gridRow = row;
    div.style.gridColumn = col;
    div.dataset.z = el.numeroAtomico;
    div.tabIndex = 0;
    div.setAttribute("role", "button");
    div.setAttribute("aria-label", `${el.nombre}, símbolo ${el.simbolo}, número atómico ${el.numeroAtomico}`);
    div.innerHTML = `
      <span class="num">${el.numeroAtomico}</span>
      <span class="sym">${el.simbolo}</span>
      <span class="name">${el.nombre}</span>
      <span class="mass">${el.masaAtomica}</span>
    `;
    div.addEventListener("click", () => openElementPanel(el, div));
    div.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openElementPanel(el, div); }
    });
    return div;
  }

  function renderLegend() {
    const legend = document.getElementById("legend");
    legend.innerHTML = "";
    Object.keys(FAMILY_CLASS).forEach(fam => {
      const item = document.createElement("div");
      item.className = "legend-item";
      item.innerHTML = `<span class="legend-swatch" style="background:var(${FAMILY_COLOR_VAR[fam]})"></span> ${fam}`;
      legend.appendChild(item);
    });
  }

  /* ---------------------------------------------------------------------
     PANEL DE ELEMENTO
  --------------------------------------------------------------------- */
  let lastFocusedElementCell = null;

  function openElementPanel(el, cellNode) {
    lastFocusedElementCell = cellNode || document.activeElement;
    document.getElementById("elementOverlay")?.classList.add("open", "active");
    document.querySelectorAll(".el-cell.highlight").forEach(c => c.classList.remove("highlight"));
    if (cellNode) cellNode.classList.add("highlight");

    document.getElementById("elPanelBadge").style.background = `var(${FAMILY_COLOR_VAR[el.familia]})`;
    document.getElementById("elPanelBadge").textContent = el.simbolo;
    document.getElementById("elPanelName").textContent = `${el.nombre} (${el.simbolo})`;
    document.getElementById("elPanelCategory").textContent = `${el.familia} · Número atómico ${el.numeroAtomico}`;

    fillTabBasica(el);
    fillTabValencia(el);
    fillTabFisicas(el);
    fillTabQuimicas(el);
    fillTabHistoria(el);
    fillTabUsos(el);
    fillTabCuriosidades(el);

    // reset a primera pestaña
    document.querySelectorAll(".el-tab").forEach((t, i) => {
      const active = i === 0;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll(".el-tab-content").forEach((c, i) => c.classList.toggle("active", i === 0));

    const overlay = document.getElementById("elementOverlay");
    overlay.hidden = false;
    document.getElementById("closeElementPanel").focus();
  }

  function closeElementPanel() {
    const overlay = document.getElementById("elementOverlay");
    if (!overlay) return;

    overlay.hidden = true;
    overlay.classList.remove("open", "active");
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";

    if (lastFocusedElementCell && typeof lastFocusedElementCell.focus === "function") {
      lastFocusedElementCell.focus();
    }
  }

  function infoRow(label, value) {
    return `<div class="info-row"><span class="label">${label}</span><span class="value">${value ?? "No disponible"}</span></div>`;
  }

  function fillTabBasica(el) {
    const c = document.querySelector('[data-tab-content="basica"]');
    c.innerHTML = `
      <div class="info-grid">
        ${infoRow("Nombre", el.nombre)}
        ${infoRow("Símbolo", el.simbolo)}
        ${infoRow("Número atómico", el.numeroAtomico)}
        ${infoRow("Masa atómica", el.masaAtomica + " u")}
        ${infoRow("Grupo", el.grupo > 0 ? el.grupo : "No aplica")}
        ${infoRow("Período", el.periodo)}
        ${infoRow("Bloque", el.bloque)}
        ${infoRow("Familia", el.familia)}
        ${infoRow("Categoría", el.categoria)}
      </div>
    `;
  }

  function fillTabValencia(el) {
    const c = document.querySelector('[data-tab-content="valencia"]');
    const valencias = Array.isArray(el.valencias) ? el.valencias.filter(v => v !== "No disponible") : [];
    const tipo = valencias.length > 1 ? "Polivalente (varias valencias posibles)" : valencias.length === 1 ? "Valencia única" : "No disponible";
    const oxid = Array.isArray(el.estadosOxidacion) ? el.estadosOxidacion.join(", ") : "No disponible";
    c.innerHTML = `
      <div class="valence-box">
        <h4>Valencia</h4>
        <div class="big">${valencias.length ? valencias.map(v => (v>0?"+":"")+v).join(", ") : "No disponible"}</div>
        <div class="sub">${tipo}</div>
      </div>
      <div class="valence-box" style="background:linear-gradient(135deg,#0f172a,#334155)">
        <h4>Estados de oxidación comunes</h4>
        <div class="big">${oxid || "No disponible"}</div>
        <div class="sub">Un mismo elemento puede presentar más de un estado de oxidación según el compuesto que forme.</div>
      </div>
      <p style="color:var(--text-muted); font-size:0.85rem; margin-top:14px;">
        <strong>Nota:</strong> la valencia indica la capacidad de combinación de un átomo, mientras que el estado de oxidación
        describe la carga aparente de un átomo dentro de un compuesto específico. No siempre coinciden exactamente.
      </p>
    `;
  }

  function fillTabFisicas(el) {
    const c = document.querySelector('[data-tab-content="fisicas"]');
    c.innerHTML = `
      <div class="info-grid">
        ${infoRow("Estado a temp. ambiente", el.estado)}
        ${infoRow("Densidad", typeof el.densidad === "number" ? el.densidad + " g/cm³" : el.densidad)}
        ${infoRow("Punto de fusión", typeof el.puntoFusion === "number" ? el.puntoFusion + " °C" : el.puntoFusion)}
        ${infoRow("Punto de ebullición", typeof el.puntoEbullicion === "number" ? el.puntoEbullicion + " °C" : el.puntoEbullicion)}
      </div>
    `;
  }

  function fillTabQuimicas(el) {
    const c = document.querySelector('[data-tab-content="quimicas"]');
    const shells = Array.isArray(el.electronesPorNivel) ? el.electronesPorNivel.map(n => `<span class="shell-badge">${n}</span>`).join("") : "";
    c.innerHTML = `
      <div class="info-grid">
        ${infoRow("Electronegatividad", typeof el.electronegatividad === "number" ? el.electronegatividad : el.electronegatividad)}
        ${infoRow("Configuración electrónica", el.configuracionElectronica)}
        ${infoRow("Protones", el.numeroAtomico)}
        ${infoRow("Electrones", el.numeroAtomico)}
        ${infoRow("Neutrones (aprox.)", typeof el.masaAtomica === "number" ? Math.round(el.masaAtomica - el.numeroAtomico) : "No disponible")}
      </div>
      <p class="label" style="margin-top:14px;">Electrones por nivel</p>
      <div class="shells-viz">${shells}</div>
    `;
  }

  function fillTabHistoria(el) {
    const c = document.querySelector('[data-tab-content="historia"]');
    c.innerHTML = `
      <div class="info-grid">
        ${infoRow("Descubridor", el.descubridor)}
        ${infoRow("Año de descubrimiento", el.añoDescubrimiento)}
      </div>
      <div class="info-row" style="margin-top:14px;">
        <span class="label">Origen del nombre</span>
        <span class="value" style="font-weight:400;">${el.origenNombre || "No disponible"}</span>
      </div>
    `;
  }

  function fillTabUsos(el) {
    const c = document.querySelector('[data-tab-content="usos"]');
    const usos = Array.isArray(el.usos) ? el.usos : [];
    c.innerHTML = `<ul class="usos-list">${usos.map(u => `<li>${u}</li>`).join("") || "<li>No disponible</li>"}</ul>`;
  }

  function fillTabCuriosidades(el) {
    const c = document.querySelector('[data-tab-content="curiosidades"]');
    const facts = Array.isArray(el.datosCuriosos) ? el.datosCuriosos : [];
    c.innerHTML = `<ul class="facts-list">${facts.map(f => `<li>${f}</li>`).join("") || "<li>No disponible</li>"}</ul>`;
  }

  /* ---------------------------------------------------------------------
     BÚSQUEDA
  --------------------------------------------------------------------- */
  function normalize(str) {
    return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function applySearchAndFilters() {
    const query = normalize(document.getElementById("searchInput").value.trim());
    const cells = document.querySelectorAll(".el-cell[data-z]");
    let matchCount = 0;

    cells.forEach(cell => {
      const z = Number(cell.dataset.z);
      const el = byAtomicNumber(z);
      if (!el) return;

      const matchesQuery = !query ||
        normalize(el.nombre).includes(query) ||
        normalize(el.simbolo).includes(query) ||
        String(el.numeroAtomico) === query ||
        normalize(el.familia).includes(query) ||
        normalize(el.categoria).includes(query);

      const matchesFilters = matchesActiveFilters(el);

      const matches = matchesQuery && matchesFilters;
      cell.classList.toggle("dim", !matches);
      if (matches) { matchCount++; }
    });

    document.getElementById("noResults").hidden = matchCount !== 0;
  }

  function matchesActiveFilters(el) {
    const famOk = activeFilters.familia.size === 0 || activeFilters.familia.has(el.familia);
    const estadoOk = activeFilters.estado.size === 0 || activeFilters.estado.has(el.estado);
    const bloqueOk = activeFilters.bloque.size === 0 || activeFilters.bloque.has(el.bloque);
    return famOk && estadoOk && bloqueOk;
  }

  /* ---------------------------------------------------------------------
     FILTROS UI
  --------------------------------------------------------------------- */
  function setupFilters() {
    document.querySelectorAll(".filter-chips").forEach(group => {
      const type = group.dataset.filterType;
      group.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
          const value = chip.dataset.value;
          if (activeFilters[type].has(value)) {
            activeFilters[type].delete(value);
            chip.classList.remove("active");
          } else {
            activeFilters[type].add(value);
            chip.classList.add("active");
          }
          applySearchAndFilters();
        });
      });
    });

    document.getElementById("clearFilters").addEventListener("click", () => {
      Object.keys(activeFilters).forEach(k => activeFilters[k].clear());
      document.querySelectorAll(".chip.active").forEach(c => c.classList.remove("active"));
      applySearchAndFilters();
    });

    document.getElementById("filterToggle").addEventListener("click", () => {
      const panel = document.getElementById("filterPanel");
      const expanded = !panel.hidden;
      panel.hidden = expanded;
      document.getElementById("filterToggle").setAttribute("aria-expanded", String(!expanded));
    });
  }

  /* ---------------------------------------------------------------------
     ELEMENTO ALEATORIO
  --------------------------------------------------------------------- */
  function randomElement() {
    const el = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    switchView("tabla");
    const cell = document.querySelector(`.el-cell[data-z="${el.numeroAtomico}"]`);
    if (cell) {
      cell.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      cell.classList.add("flash");
      setTimeout(() => cell.classList.remove("flash"), 1200);
      setTimeout(() => openElementPanel(el, cell), 350);
    }
  }

  /* ---------------------------------------------------------------------
     COMPARAR
  --------------------------------------------------------------------- */
  function setupCompare() {
    const s1 = document.getElementById("compareSelect1");
    const s2 = document.getElementById("compareSelect2");
    const options = ELEMENTS.map(e => `<option value="${e.numeroAtomico}">${e.numeroAtomico}. ${e.nombre} (${e.simbolo})</option>`).join("");
    s1.innerHTML = `<option value="">Selecciona un elemento</option>${options}`;
    s2.innerHTML = `<option value="">Selecciona un elemento</option>${options}`;
    s1.addEventListener("change", renderCompare);
    s2.addEventListener("change", renderCompare);
  }

  function compareRows(el) {
    const rows = [
      ["Número atómico", el.numeroAtomico],
      ["Masa atómica", el.masaAtomica + " u"],
      ["Grupo", el.grupo > 0 ? el.grupo : "No aplica"],
      ["Período", el.periodo],
      ["Familia", el.familia],
      ["Estado físico", el.estado],
      ["Electronegatividad", el.electronegatividad],
      ["Densidad", typeof el.densidad === "number" ? el.densidad + " g/cm³" : el.densidad],
      ["Punto de fusión", typeof el.puntoFusion === "number" ? el.puntoFusion + " °C" : el.puntoFusion],
      ["Punto de ebullición", typeof el.puntoEbullicion === "number" ? el.puntoEbullicion + " °C" : el.puntoEbullicion],
      ["Valencia(s)", Array.isArray(el.valencias) ? el.valencias.map(v=>(v>0?"+":"")+v).join(", ") : "No disponible"],
      ["Estados de oxidación", Array.isArray(el.estadosOxidacion) ? el.estadosOxidacion.join(", ") : "No disponible"],
      ["Config. electrónica", el.configuracionElectronica],
    ];
    return rows;
  }

  function renderCompare() {
    const z1 = document.getElementById("compareSelect1").value;
    const z2 = document.getElementById("compareSelect2").value;
    const result = document.getElementById("compareResult");

    if (!z1 || !z2) {
      result.innerHTML = `<div class="compare-empty">Selecciona dos elementos para comparar sus propiedades.</div>`;
      return;
    }

    const el1 = byAtomicNumber(Number(z1));
    const el2 = byAtomicNumber(Number(z2));
    const rows1 = compareRows(el1);
    const rows2 = compareRows(el2);

    function col(el, rows) {
      return `
        <div class="compare-col">
          <div class="compare-col-header">
            <div class="compare-badge" style="background:var(${FAMILY_COLOR_VAR[el.familia]})">${el.simbolo}</div>
            <div><strong>${el.nombre}</strong><br><span style="color:var(--text-muted); font-size:0.82rem;">${el.familia}</span></div>
          </div>
          ${rows.map(([label, value]) => `<div class="compare-row"><span class="clabel">${label}</span><span>${value}</span></div>`).join("")}
        </div>
      `;
    }

    result.innerHTML = col(el1, rows1) + col(el2, rows2);
  }

  /* ---------------------------------------------------------------------
     FAMILIAS
  --------------------------------------------------------------------- */
  function setupFamilies() {
    const list = document.getElementById("familyList");
    list.innerHTML = "";
    Object.keys(FAMILY_INFO).forEach(fam => {
      const count = ELEMENTS.filter(e => e.familia === fam).length;
      const card = document.createElement("div");
      card.className = "family-card";
      card.style.borderLeftColor = `var(${FAMILY_COLOR_VAR[fam]})`;
      card.innerHTML = `<h4>${fam}</h4><p>${count} elemento${count !== 1 ? "s" : ""}</p>`;
      card.addEventListener("click", () => showFamilyDetail(fam));
      list.appendChild(card);
    });
  }

  function showFamilyDetail(fam) {
    const detail = document.getElementById("familyDetail");
    const members = ELEMENTS.filter(e => e.familia === fam).sort((a,b)=>a.numeroAtomico-b.numeroAtomico);
    detail.hidden = false;
    detail.innerHTML = `
      <h3>${fam}</h3>
      <p>${FAMILY_INFO[fam]}</p>
      <div class="family-elements">
        ${members.map(e => `<span class="family-el-chip" style="background:var(${FAMILY_COLOR_VAR[fam]})">${e.simbolo} · ${e.nombre}</span>`).join("")}
      </div>
    `;
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // resaltar en tabla si el usuario vuelve a la vista de tabla
    document.querySelectorAll(".el-cell[data-z]").forEach(cell => {
      const el = byAtomicNumber(Number(cell.dataset.z));
      cell.classList.toggle("dim", el.familia !== fam);
    });
  }

  /* ---------------------------------------------------------------------
     NAVEGACIÓN ENTRE VISTAS
  --------------------------------------------------------------------- */
  function switchView(view) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(`view-${view}`).classList.add("active");
    document.querySelectorAll(".nav-link").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
    document.querySelector(".main-nav").classList.remove("open");
  }

  function setupNav() {
    document.querySelectorAll(".nav-link").forEach(btn => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });
    document.getElementById("menuToggle").addEventListener("click", () => {
      const nav = document.querySelector(".main-nav");
      const open = nav.classList.toggle("open");
      document.getElementById("menuToggle").setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------------------------------------------------------------------
     MODO OSCURO
  --------------------------------------------------------------------- */
  function setupDarkMode() {
    const stored = localStorage.getItem("tabla-periodica-theme");
    if (stored === "dark") document.documentElement.setAttribute("data-theme", "dark");

    document.getElementById("darkModeToggle").addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("tabla-periodica-theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("tabla-periodica-theme", "dark");
      }
    });
  }

  /* ---------------------------------------------------------------------
     PWA: INSTALACIÓN Y SERVICE WORKER
  --------------------------------------------------------------------- */
  function setupPWA() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      document.getElementById("installBtn").hidden = false;
    });

    document.getElementById("installBtn").addEventListener("click", async () => {
      if (!deferredInstallPrompt) {
        showToast("Para instalar, usa el menú de tu navegador y elige 'Instalar aplicación' o 'Agregar a pantalla de inicio'.");
        return;
      }
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === "accepted") showToast("¡Aplicación instalada correctamente!");
      deferredInstallPrompt = null;
      document.getElementById("installBtn").hidden = true;
    });

    window.addEventListener("appinstalled", () => {
      document.getElementById("installBtn").hidden = true;
    });

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js").catch(() => {});
      });
    }
  }

  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 3800);
  }

  /* ---------------------------------------------------------------------
     PANEL DE ELEMENTO: TABS Y CIERRE
  --------------------------------------------------------------------- */
  function setupElementPanel() {
    const overlay = document.getElementById("elementOverlay");
    const closeButton = overlay?.querySelector('.el-panel-close, .el-close, [data-close], button[aria-label*="Cerrar" i]');
    if (closeButton) {
      closeButton.type = "button";
      closeButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeElementPanel();
      });
    }
    if (overlay) {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeElementPanel();
      });
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay && !overlay.hidden) {
        event.preventDefault();
        closeElementPanel();
      }
    });

    document.getElementById("closeElementPanel").addEventListener("click", closeElementPanel);
    document.getElementById("elementOverlay").addEventListener("click", (e) => {
      if (e.target.id === "elementOverlay") closeElementPanel();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !document.getElementById("elementOverlay").hidden) closeElementPanel();
    });

    document.querySelectorAll(".el-tab").forEach(tab => {
      tab.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const tabs = [...document.querySelectorAll(".el-tab")];
        const index = tabs.indexOf(tab);
        const next = e.key === "ArrowRight"
          ? tabs[(index + 1) % tabs.length]
          : tabs[(index - 1 + tabs.length) % tabs.length];
        next.focus();
        next.click();
      });

      tab.addEventListener("click", () => {
        document.querySelectorAll(".el-tab").forEach(t => {
        const active = t === tab;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
      });
      document.querySelectorAll(".el-tab-content").forEach(c => c.classList.remove("active"));
      document.querySelector(`[data-tab-content="${tab.dataset.tab}"]`).classList.add("active");
      });
    });
  }

  /* ---------------------------------------------------------------------
     INICIALIZACIÓN
  --------------------------------------------------------------------- */
  async function init() {
    try {
      await loadElements();
      renderTable();
      renderLegend();
      setupFilters();
      setupNav();
      setupDarkMode();
      setupPWA();
      setupElementPanel();
      setupCompare();
      setupFamilies();
      setupExtraFeatures();

      document.getElementById("searchInput").addEventListener("input", applySearchAndFilters);
      document.getElementById("randomBtn").addEventListener("click", randomElement);
    } catch (error) {
      console.error(error);
      const grid = document.getElementById("periodicTable");
      grid.innerHTML = `
        <div class="app-error" role="alert">
          <strong>No se pudo cargar la aplicación.</strong>
          <span>Verifica que estés usando un servidor web y que los archivos del proyecto estén completos.</span>
        </div>
      `;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
/* =====================================================================
   MEJORAS ADICIONALES — buscador avanzado y quiz
   Se añaden sin reemplazar las funciones existentes.
===================================================================== */
function setupExtraFeatures() {
  function setupAdvancedSearch() {
    const input = document.getElementById("searchInput");
    const clear = document.getElementById("clearSearch");
    const suggestions = document.getElementById("searchSuggestions");
    const meta = document.getElementById("searchMeta");
    if (!input || !clear || !suggestions) return;

    function updateClear() { clear.hidden = !input.value; }

    function renderSuggestions() {
      const q = normalize(input.value.trim());
      updateClear();
      if (q.length < 1) { suggestions.hidden = true; return; }
      const matches = ELEMENTS.filter(el => {
        const haystack = [el.nombre, el.simbolo, el.numeroAtomico, el.familia, el.categoria, el.bloque, el.estado, el.grupo, el.periodo]
          .map(normalize).join(" ");
        return haystack.includes(q);
      }).slice(0, 8);
      if (!matches.length) { suggestions.hidden = true; return; }
      suggestions.innerHTML = matches.map(el => `
        <button type="button" class="search-suggestion" data-z="${el.numeroAtomico}" role="option">
          <span class="search-suggestion-badge" style="background:var(${FAMILY_COLOR_VAR[el.familia]})">${el.simbolo}</span>
          <span class="search-suggestion-main"><strong>${el.nombre}</strong><span>Z ${el.numeroAtomico} · ${el.familia}</span></span>
        </button>`).join("");
      suggestions.hidden = false;
      suggestions.querySelectorAll(".search-suggestion").forEach(btn => btn.addEventListener("click", () => {
        const el = byAtomicNumber(Number(btn.dataset.z));
        input.value = el.nombre;
        applySearchAndFilters();
        suggestions.hidden = true;
        const cell = document.querySelector(`.el-cell[data-z="${el.numeroAtomico}"]`);
        if (cell) { switchView("tabla"); cell.scrollIntoView({behavior:"smooth", block:"center", inline:"center"}); setTimeout(() => openElementPanel(el, cell), 250); }
      }));
    }

    input.addEventListener("input", () => { renderSuggestions(); updateClear();
      if (meta) {
        const q = normalize(input.value.trim());
        meta.hidden = !q;
        if (q) {
          const count = ELEMENTS.filter(el => [el.nombre,el.simbolo,el.numeroAtomico,el.familia,el.categoria,el.bloque,el.estado,el.grupo,el.periodo].map(normalize).join(" ").includes(q)).length;
          meta.textContent = `${count} resultado${count === 1 ? "" : "s"} encontrado${count === 1 ? "" : "s"}`;
        }
      }
    });
    input.addEventListener("focus", renderSuggestions);
    input.addEventListener("keydown", e => { if (e.key === "Escape") suggestions.hidden = true; });
    clear.addEventListener("click", () => { input.value = ""; suggestions.hidden = true; updateClear(); if (meta) meta.hidden = true; applySearchAndFilters(); input.focus(); });
    document.addEventListener("click", e => { if (!e.target.closest(".search-wrap")) suggestions.hidden = true; });
  }

  function setupQuiz() {
    const start = document.getElementById("quizStartBtn");
    const restart = document.getElementById("quizRestartBtn");
    if (!start || !restart) return;
    let questions = [], index = 0, score = 0, correct = 0, streak = 0, bestStreak = 0;

    const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);
    const valid = v => v !== undefined && v !== null && String(v).trim() !== "" && String(v) !== "No disponible";
    const display = v => Array.isArray(v) ? v.join(", ") : String(v);

    function makeQuestion() {
      const el = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
      const types = [
        { label:"Símbolo", text:`¿Cuál es el símbolo de ${el.nombre}?`, answer:el.simbolo, pool:ELEMENTS.map(e=>e.simbolo) },
        { label:"Nombre", text:`¿Qué elemento corresponde al símbolo ${el.simbolo}?`, answer:el.nombre, pool:ELEMENTS.map(e=>e.nombre) },
        { label:"Número atómico", text:`¿Cuál es el número atómico de ${el.nombre}?`, answer:el.numeroAtomico, pool:ELEMENTS.map(e=>e.numeroAtomico) },
        { label:"Familia", text:`¿A qué familia pertenece ${el.nombre}?`, answer:el.familia, pool:Object.keys(FAMILY_INFO) },
        { label:"Estado físico", text:`¿Cuál es el estado físico de ${el.nombre} a temperatura ambiente?`, answer:el.estado, pool:ELEMENTS.map(e=>e.estado) },
        { label:"Bloque", text:`¿A qué bloque pertenece ${el.nombre}?`, answer:el.bloque, pool:["s","p","d","f"] },
        { label:"Período", text:`¿En qué período se encuentra ${el.nombre}?`, answer:el.periodo, pool:ELEMENTS.map(e=>e.periodo) }
      ];
      const t = types[Math.floor(Math.random() * types.length)];
      const options = shuffle([String(t.answer), ...shuffle(t.pool.map(String).filter(v => v !== String(t.answer))).slice(0,3)]).slice(0,4);
      return { ...t, element:el, options };
    }

    function newRound() {
      questions = []; const seen = new Set();
      while (questions.length < 10) {
        const q = makeQuestion();
        const key = `${q.element.numeroAtomico}-${q.label}`;
        if (!seen.has(key)) { seen.add(key); questions.push(q); }
      }
      index=0; score=0; correct=0; streak=0; bestStreak=0;
      document.getElementById("quizScore").textContent = "0";
      document.getElementById("quizStart").hidden = true;
      document.getElementById("quizResult").hidden = true;
      document.getElementById("quizGame").hidden = false;
      renderQuestion();
    }

    function renderQuestion() {
      const q = questions[index];
      document.getElementById("quizProgressText").textContent = `Pregunta ${index+1} de ${questions.length}`;
      document.getElementById("quizStreak").textContent = `Racha: ${streak}`;
      document.getElementById("quizProgressBar").style.width = `${((index+1)/questions.length)*100}%`;
      document.getElementById("quizQuestionType").textContent = q.label;
      document.getElementById("quizQuestion").textContent = q.text;
      document.getElementById("quizFeedback").textContent = "";
      document.getElementById("quizFeedback").className = "quiz-feedback";
      const next = document.getElementById("quizNextBtn"); next.hidden = true;
      const box = document.getElementById("quizOptions");
      box.innerHTML = q.options.map((option,i)=>`<button type="button" class="quiz-option" data-answer="${option.replace(/"/g,'&quot;')}">${String.fromCharCode(65+i)}. ${option}</button>`).join("");
      box.querySelectorAll(".quiz-option").forEach(btn => btn.addEventListener("click", () => answer(btn)));
    }

    function answer(btn) {
      const q = questions[index];
      const chosen = btn.dataset.answer;
      const isCorrect = chosen === String(q.answer);
      document.querySelectorAll(".quiz-option").forEach(b => b.disabled = true);
      const feedback = document.getElementById("quizFeedback");
      if (isCorrect) {
        correct++; streak++; bestStreak=Math.max(bestStreak,streak); score += 10;
        btn.classList.add("correct"); feedback.textContent = `¡Correcto! +10 puntos. ${q.element.nombre} (${q.element.simbolo}).`; feedback.className="quiz-feedback ok";
      } else {
        streak=0; btn.classList.add("incorrect");
        document.querySelectorAll(".quiz-option").forEach(b=>{ if(b.dataset.answer===String(q.answer)) b.classList.add("correct"); });
        feedback.textContent = `Respuesta correcta: ${q.answer}.`; feedback.className="quiz-feedback bad";
      }
      document.getElementById("quizScore").textContent = String(score);
      document.getElementById("quizStreak").textContent = `Racha: ${streak}`;
      const next=document.getElementById("quizNextBtn"); next.hidden=false; next.textContent=index===questions.length-1?"Ver resultado":"Siguiente pregunta";
    }

    function finish() {
      document.getElementById("quizGame").hidden=true; document.getElementById("quizResult").hidden=false;
      document.getElementById("quizFinalScore").textContent=String(score);
      document.getElementById("quizCorrect").textContent=String(correct);
      document.getElementById("quizBestStreak").textContent=String(bestStreak);
      const title = correct === 10 ? "¡Perfecto!" : correct >= 7 ? "¡Muy buen trabajo!" : correct >= 5 ? "¡Vas bien!" : "¡A seguir practicando!";
      document.getElementById("quizResultTitle").textContent=title;
      document.getElementById("quizResultText").textContent=`Acertaste ${correct} de 10 preguntas y obtuviste ${score} puntos.`;
    }

    document.getElementById("quizNextBtn").addEventListener("click", () => { if(index===questions.length-1) finish(); else { index++; renderQuestion(); } });
    start.addEventListener("click", newRound); restart.addEventListener("click", newRound);
  }

    setupAdvancedSearch();
    setupQuiz();
  }

})();
