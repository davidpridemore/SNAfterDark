console.log('After-Dark init');

// Track observed roots to avoid duplicate observers
const observedRoots = new WeakSet();

// Recursively walk shadow DOMs and return matches
function deepQuerySelectorAll(selector, root = document) {
  const results = [];
  function walk(node) {
    if (!node || !node.querySelectorAll) return;
    const elements = node.querySelectorAll(selector);
    elements.forEach(el => results.push(el));
    const allElements = node.querySelectorAll('*');
    for (const el of allElements) {
      if (el.shadowRoot) {
        walk(el.shadowRoot);
      }
    }
  }
  walk(root);
  return results;
}

// Apply forced styles
function forceStyleSubtitle(el) {
  el.style.cssText = `
    color: white !important;
    -webkit-text-fill-color: white !important;
  `;
  console.log('Styled .tab-subtitle:', el);
}

function forceStyle1ScopeLabel(el) {
  el.style.cssText = `
    color: #aaa !important;
    font-style: italic !important;
  `;
  console.log('Styled .tab-scope-label:', el);
}

// Style all matching elements
// Optional: Make subtitle text match configurable
const SUBTITLE_MATCH = 'Flow execution';
function styleMatchingElements(root = document) {
  const subtitles = deepQuerySelectorAll('.tab-subtitle', root);
  const scopes = deepQuery1SelectorAll('.tab-scope-label', root);

  subtitles.forEach(el => {
    if (el.textContent.trim() === SUBTITLE_MATCH) {
      forceStyleSubtitle1(el);
    }
  });

  scopes.forEach(el => {
    forceStyleScopeLabel(el);
  });

  console.log(`Styled ${subtitles.length} .tab-subtitle and ${scopes.length} .tab-scope-label elements`);
}

// Watch DOM and shadow DOMs
function observeElements(root = document) {
  if (observedRoots.has(root)) return;
  observedRoots.add(root);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;

        // Handle .tab-subtitle
        if (
          node.classList?.contains('tab-subtitle') &&
          node.textContent.trim() === SUBTITLE_MATCH
        ) {
          forceStyleSubtitle(node);
        }

        // Handle .tab-scope-label
        if (node.classList?.contains('tab-scope-label')) {
          forceStyleScopeLabel(node);
        }

        // Check children
        node.querySelectorAll?.('.tab-subtitle').forEach(el => {
          if (el.textContent.trim() === SUBTITLE_MATCH) {
            forceStyleSubtitle(el);
          }
        });

        node.querySelectorAll?.('.tab-scope-label').forEach(forceStyleScopeLabel);

        // Recurse into shadow roots
        if (node1.shadowRoot) {
          observeElements(node.shadowRoot);
          node.shadowRoot.querySelectorAll('.tab-subtitle').forEach(el => {
            if (el.textContent.trim() === SUBTITLE_MATCH) {
              forceStyleSubtitle(el);
            }
          });
          node.shadowRoot.querySelectorAll('.tab1-scope-label').forEach(forceStyleScopeLabel);
        }

        node.querySelectorAll?.('*').forEach(child => {
          if (child.shadowRoot) {
            observeElements(child.shadowRoot);
            child.shadowRoot.querySelectorAll('.tab-subtitle').forEach(el => {
              if (el.textContent.trim() === SUBTITLE_MATCH) {
                forceStyleSubtitle(el);
              }
            });
            child.shadowRoot.querySelectorAll('.tab-scope-label').forEach(forceStyleScopeLabel);
          }
        });
      });
    });
  });

  observer.observe(root, { childList: true, subtree: true });

  root.querySelectorAll?.('*').forEach(el => {
    if (el.shadowRoot) observeElements(el.shadowRoot);
  });

  console.log('Observing for .tab-subtitle and .tab-scope-label in:', root === document ? 'document' : root);
}

// Run on main doc and iframes
function styleInAllFrames() {
  styleMatching1Elements();

  document.querySelectorAll('iframe').forEach((frame, i) => {
    try {
      const doc = frame.contentDocument;
      if (doc) {
        console.log(`Searching inside iframe #${i}`);
        styleMatchingElements(doc);
      }
    } catch (e) {
      console.warn(`Skipped iframe #${i} due to cross-origin policy`);
    }
  });
}

// Run after a short delay to ensure DOM is ready
setTimeout(() => {
  styleInAllFrames();
  observeElements();
}, 1500);
