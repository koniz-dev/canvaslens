import { CanvasLens } from '../../dist/index.js';

// Touch CanvasLens so bundlers/tree-shakers register the custom element.
void CanvasLens;

const $ = (id) => document.getElementById(id);
const cl = $('cl');

// ─── Event log ────────────────────────────────────────────────────────────
const eventsEl = $('events');
const MAX_LOG = 200;
let logCount = 0;
function logEvent(name, detail) {
  if (logCount++ > MAX_LOG) {
    while (eventsEl.children.length > MAX_LOG / 2) {
      eventsEl.removeChild(eventsEl.firstChild);
    }
  }
  const row = document.createElement('div');
  const time = new Date().toLocaleTimeString('en-US', { hour12: false }).slice(3);
  row.innerHTML =
    `<span class="ev-time">${time}</span>` +
    `<span class="ev-name">${name}</span> ` +
    `<span class="ev-detail">${formatDetail(detail)}</span>`;
  eventsEl.appendChild(row);
  eventsEl.scrollTop = eventsEl.scrollHeight;
}
function formatDetail(d) {
  if (d === undefined || d === null) return String(d);
  if (typeof d === 'number') return d.toFixed(3);
  if (typeof d === 'string') return JSON.stringify(d);
  if (d instanceof Error) return d.message;
  try {
    return JSON.stringify(d);
  } catch {
    return '[object]';
  }
}

for (const name of [
  'imageLoad',
  'imageLoadError',
  'zoomChange',
  'panChange',
  'annotationAdd',
  'annotationRemove',
  'toolChange',
  'comparisonChange',
  'comparisonModeChange'
]) {
  cl.addEventListener(name, (e) => logEvent(name, e.detail));
}

$('btn-clear-log').addEventListener('click', () => {
  eventsEl.innerHTML = '';
  logCount = 0;
});

// ─── Image source ─────────────────────────────────────────────────────────
$('btn-load-url').addEventListener('click', () => {
  cl.setAttribute('src', $('src-url').value);
});
$('btn-random').addEventListener('click', () => {
  const url = `https://picsum.photos/seed/${Math.random().toString(36).slice(2, 8)}/800/600`;
  $('src-url').value = url;
  cl.setAttribute('src', url);
});
$('file-pick').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) cl.loadImageFromFile(file);
});

// ─── Tools ────────────────────────────────────────────────────────────────
const toolButtons = document.querySelectorAll('.tools-grid .tool');
toolButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tool = btn.dataset.tool;
    if (cl.getActiveTool() === tool) {
      cl.deactivateTool();
    } else {
      cl.activateTool(tool);
    }
  });
});
$('btn-deactivate-tool').addEventListener('click', () => cl.deactivateTool());

// Highlight the active tool button when toolChange fires.
cl.addEventListener('toolChange', (e) => {
  const active = e.detail;
  toolButtons.forEach((b) => b.classList.toggle('active', b.dataset.tool === active));
});

// ─── Style ────────────────────────────────────────────────────────────────
// ─── Canvas background ────────────────────────────────────────────────────
function applyBackground() {
  const on = $('bg-enabled').checked;
  cl.setBackgroundColor(on ? $('bg-color').value : 'transparent');
}
$('bg-enabled').addEventListener('change', applyBackground);
$('bg-color').addEventListener('input', applyBackground);

$('btn-apply-style').addEventListener('click', () => {
  const style = {
    strokeColor: $('stroke-color').value,
    strokeWidth: parseFloat($('stroke-width').value) || 2,
    lineStyle: $('line-style').value
  };
  if ($('fill-enabled').checked) style.fillColor = $('fill-color').value;
  else style.fillColor = undefined;

  // Always update the default style so subsequent drawings inherit it.
  cl.updateTools({
    annotation: {
      rect: true,
      arrow: true,
      text: true,
      circle: true,
      line: true,
      style
    }
  });

  // If an annotation is currently selected, also restyle it in place.
  if (cl.updateSelectedAnnotationStyle(style)) {
    logEvent('updateSelectedAnnotationStyle', JSON.stringify(style));
  } else {
    logEvent('updateTools default style', JSON.stringify(style));
  }
});

// ─── View ─────────────────────────────────────────────────────────────────
$('btn-zoom-in').addEventListener('click', () => cl.zoomIn());
$('btn-zoom-out').addEventListener('click', () => cl.zoomOut());
$('btn-fit').addEventListener('click', () => cl.fitToView());
$('btn-reset').addEventListener('click', () => cl.resetView());
$('btn-zoom-to').addEventListener('click', () => {
  const v = parseFloat($('zoom-to').value);
  if (!isNaN(v)) cl.zoomTo(v);
});

function refreshViewStatus() {
  $('status-zoom').textContent = `zoom ${cl.getZoomLevel().toFixed(3)}×`;
  const p = cl.getPanOffset();
  $('status-pan').textContent = `pan (${Math.round(p.x)},${Math.round(p.y)})`;
}
cl.addEventListener('zoomChange', refreshViewStatus);
cl.addEventListener('panChange', refreshViewStatus);
cl.addEventListener('imageLoad', refreshViewStatus);

// ─── Modes ────────────────────────────────────────────────────────────────
$('btn-comparison').addEventListener('click', () => {
  cl.toggleComparisonMode();
  $('status-comparison').textContent = cl.isComparisonMode() ? 'on' : 'off';
});
$('btn-overlay-open').addEventListener('click', () => {
  const useFrame = $('overlay-frame-bg').checked;
  cl.openOverlay({ background: useFrame ? 'white' : 'transparent' });
});
$('btn-overlay-close').addEventListener('click', () => cl.closeOverlay());

// ─── Annotation list ──────────────────────────────────────────────────────
const listEl = $('annotation-list');
function refreshAnnotationList() {
  const list = cl.getAnnotations();
  listEl.innerHTML = '';
  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No annotations yet.';
    listEl.appendChild(empty);
    return;
  }
  list.forEach((a) => {
    const item = document.createElement('div');
    item.className = 'item';
    const label = document.createElement('span');
    label.textContent = `${a.type} · ${a.id.slice(-6)}`;
    item.appendChild(label);
    const btn = document.createElement('button');
    btn.textContent = '✕';
    btn.title = 'Remove';
    btn.addEventListener('click', () => cl.removeAnnotation(a.id));
    item.appendChild(btn);
    listEl.appendChild(item);
  });
}
cl.addEventListener('annotationAdd', refreshAnnotationList);
cl.addEventListener('annotationRemove', refreshAnnotationList);
cl.addEventListener('imageLoad', refreshAnnotationList);
refreshAnnotationList();

$('btn-clear').addEventListener('click', () => cl.clearAnnotations());

$('btn-export').addEventListener('click', () => {
  const count = cl.getAnnotations().length;
  if (count === 0) {
    logEvent('export', 'no annotations to export');
    return;
  }
  // Pretty-print for human readability when opening the file.
  const raw = cl.exportAnnotations();
  const pretty = JSON.stringify(JSON.parse(raw), null, 2);
  const blob = new Blob([pretty], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  // Some browsers (Safari) require the link to be in the DOM for click()
  // to trigger a download. Revoke after a small delay so the download
  // actually starts.
  const a = document.createElement('a');
  a.href = url;
  a.download = 'annotations.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 0);
  logEvent('export', `${count} annotation${count === 1 ? '' : 's'}`);
});

$('btn-import').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.style.display = 'none';
  document.body.appendChild(input);

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) {
      input.remove();
      return;
    }
    try {
      const text = await file.text();
      const before = cl.getAnnotations().length;
      cl.importAnnotations(text);
      const after = cl.getAnnotations().length;
      logEvent('import', `${after} loaded (was ${before})`);
    } catch (err) {
      logEvent('importError', err.message ?? String(err));
    } finally {
      input.remove();
    }
  });

  input.click();
});

// Periodically refresh view status to catch pan changes from dragging.
setInterval(refreshViewStatus, 200);
