console.log('ServiceNow After-Dark enabled');

// Trackers
const styledFilters = new WeakSet();
const styledTabs = new WeakSet();
const observedRoots = new WeakSet();

// Config
const SUBTITLE_MATCH = 'Flow execution';

// === Utility: deep shadow traversal ===
function deepQuerySelectorAll(selector, root = document) {
  const results = [];

  function walk(node) {
    if (!node || !node.querySelectorAll) return;
    const elements = node.querySelectorAll(selector);
    elements.forEach(el => results.push(el));
    node.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) walk(el.shadowRoot);
    });
  }

  walk(root);
  return results;
}

// === Filters ===
function styleFilterContainers() {
  document.querySelectorAll('sn-record-list-column-filter').forEach(panel => {
    try {
      const shadow1 = panel.shadowRoot;
      const nested = shadow1?.querySelector('div > sn-record-list-column-filter-value, div > sn-record-list-column-filter-choice');
      const shadow2 = nested?.shadowRoot;
      const container = shadow2?.querySelector('.filter-container');

      if (container && !styledFilters.has(container)) {
        container.style.backgroundColor = 'rgb(35, 65, 85)';
        container.style.color = 'white';
        container.style.border = '1px solid rgb(93, 118, 134)';
        container.style.padding = '0.5em';
        container.style.borderRadius = '6px';
        styledFilters.add(container);
        console.log('Styled .filter-container');
      }
    } catch (e) {
      console.warn('Filter styling error:', e);
    }
  });
}

// Style bare button labels in filter drop downs
function styleBareButtonLabels(root = document) {
  const labels = root.querySelectorAll('span.now-button-bare-label');
  labels.forEach(label => {
    label.style.color = 'rgb(165, 214, 167)'; // mint-0
  });
}

// === Tab Name ===
function styleTabNames() {
  document.querySelectorAll('.tab-name').forEach(tab => {
    if (!styledTabs.has(tab)) {
      tab.style.setProperty('color', 'white', 'important');
      tab.style.setProperty('-webkit-text-fill-color', 'white', 'important');
      tab.style.setProperty('background', 'none', 'important');
      tab.style.setProperty('-webkit-background-clip', 'border-box', 'important');
      tab.style.setProperty('background-clip', 'border-box', 'important');
      styledTabs.add(tab);
    }
  });
}

// === Subtitle & Scope Label ===
function forceStyleSubtitle(el) {
  el.style.cssText = `
    color: white !important;
    -webkit-text-fill-color: white !important;
  `;
  console.log('Styled .tab-subtitle:', el);
}

function forceStyleScopeLabel(el) {
  el.style.cssText = `
    color: #aaa !important;
  `;
  console.log('Styled .tab-scope-label:', el);
}

function styleMatchingElements(root = document) {
  const subtitles = deepQuerySelectorAll('.tab-subtitle', root);
  const scopes = deepQuerySelectorAll('.tab-scope-label', root);

  subtitles.forEach(el => {
    if (el.textContent.trim() === SUBTITLE_MATCH) {
      forceStyleSubtitle(el);
    }
  });

  scopes.forEach(forceStyleScopeLabel);

  console.log(`Styled ${subtitles.length} .tab-subtitle and ${scopes.length} .tab-scope-label elements`);
}

// === Canvas ===
function tryInjectCanvasBackground() {
  const canvas = document.querySelector("canvas[width='1706'][height='1165']");
  if (canvas && !canvas.dataset.afterDarkStyled) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#0d1f2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    canvas.dataset.afterDarkStyled = 'true';
    console.log('Canvas background injected.');
    return true;
  }
  return false;
}

// === Observer ===
function observeElements(root = document) {
  if (observedRoots.has(root)) return;
  observedRoots.add(root);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;

        // Handle tab subtitle
        if (node.classList?.contains('tab-subtitle') && node.textContent.trim() === SUBTITLE_MATCH) {
          forceStyleSubtitle(node);
        }

        // Handle scope label
        if (node.classList?.contains('tab-scope-label')) {
          forceStyleScopeLabel(node);
        }

        // Handle tab name
        if (node.classList?.contains('tab-name') && !styledTabs.has(node)) {
          styleTabNames();
        }

        // Handle filter containers
        if (node.tagName === 'SN-RECORD-LIST-COLUMN-FILTER') {
          styleFilterContainers();
        }

        // Handle now-button-bare-label
        if (node.classList?.contains('now-button-bare-label')) {
          node.style.color = 'rgb(165, 214, 167)';
        }

        // Search inside node
        node.querySelectorAll?.('.tab-subtitle').forEach(el => {
          if (el.textContent.trim() === SUBTITLE_MATCH) {
            forceStyleSubtitle(el);
          }
        });

        node.querySelectorAll?.('.tab-scope-label').forEach(forceStyleScopeLabel);

        node.querySelectorAll?.('.tab-name').forEach(tab => {
          if (!styledTabs.has(tab)) styleTabNames();
        });

        node.querySelectorAll?.('.now-button-bare-label').forEach(label => {
          label.style.color = 'rgb(165, 214, 167)';
        });

        // Recursively observe shadow roots
        if (node.shadowRoot) {
          observeElements(node.shadowRoot);
        }

        node.querySelectorAll?.('*').forEach(child => {
          if (child.shadowRoot) observeElements(child.shadowRoot);
        });
      });
    });
  });

  observer.observe(root, { childList: true, subtree: true });

  root.querySelectorAll?.('*').forEach(el => {
    if (el.shadowRoot) observeElements(el.shadowRoot);
  });

  console.log('Observing elements in:', root === document ? 'document' : root);
}


// === Main loop + canvas
function loop() {
  styleFilterContainers();
  styleTabNames();
  requestIdleCallback(loop, { timeout: 100 });
}

loop();

const canvasInterval = setInterval(() => {
  if (tryInjectCanvasBackground()) clearInterval(canvasInterval);
}, 300);

// === Initial trigger
setTimeout(() => {
  styleMatchingElements();
  observeElements();
}, 1500);
