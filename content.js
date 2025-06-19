console.log('ServiceNow After-Dark enabled');

// Cache trackers
const styledFilters = new WeakSet();
const styledTabs = new WeakSet();

// Apply styles to filter containers inside shadow DOM
function styleFilterContainers() {
  document.querySelectorAll("sn-record-list-column-filter").forEach(panel => {
    try {
      const shadow1 = panel.shadowRoot;
      const nested = shadow1?.querySelector("div > sn-record-list-column-filter-value, div > sn-record-list-column-filter-choice");
      const shadow2 = nested?.shadowRoot;
      const container = shadow2?.querySelector(".filter-container");

      if (container && !styledFilters.has(container)) {
        container.style.backgroundColor = "rgb(35, 65, 85)";
        container.style.color = "white";
        container.style.border = "1px solid rgb(93, 118, 134)";
        container.style.padding = "0.5em";
        container.style.borderRadius = "6px";
        styledFilters.add(container);
        console.log("Styled .filter-container");
      }
    } catch (e) {
      console.warn("Filter styling error:", e);
    }
  });
}

// Style tab-name text
function styleTabNames() {
  document.querySelectorAll(".tab-name").forEach(tab => {
    if (!styledTabs.has(tab)) {
      tab.style.setProperty("color", "white", "important");
      tab.style.setProperty("-webkit-text-fill-color", "white", "important");
      tab.style.setProperty("background", "none", "important");
      tab.style.setProperty("-webkit-background-clip", "border-box", "important");
      tab.style.setProperty("background-clip", "border-box", "important");
      styledTabs.add(tab);
    }
  });
}

// Draw background on canvas once it exists
function tryInjectCanvasBackground() {
  const canvas = document.querySelector("canvas[width='1706'][height='1165']");
  if (canvas && !canvas.dataset.afterDarkStyled) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = "#0d1f2d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    canvas.dataset.afterDarkStyled = "true";
    console.log("Canvas background injected.");
    return true;
  }
  return false;
}

// Throttle execution with requestIdleCallback or fallback to setInterval
function loop() {
  styleFilterContainers();
  styleTabNames();
  requestIdleCallback(loop, { timeout: 100 });
}

loop();

// Poll canvas until styled
const canvasInterval = setInterval(() => {
  if (tryInjectCanvasBackground()) clearInterval(canvasInterval);
}, 300);
