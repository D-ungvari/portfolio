/**
 * Icon factory — builds one desktop icon DOM element from a project entry.
 */
function createIcon(project, options) {
  options = options || {};
  var el = document.createElement('div');
  el.className = 'desktop-icon';
  el.setAttribute('role', 'gridcell');
  el.setAttribute('tabindex', '-1'); // grid manages focus
  el.setAttribute('data-cmd', project.command);
  el.setAttribute('data-title', project.title);
  el.setAttribute('draggable', 'true');

  var glyph = document.createElement('div');
  glyph.className = 'icon-glyph';
  // Use project.glyph if defined; otherwise fall back to first letter of title.
  glyph.textContent = (project.glyph && project.glyph.length > 0)
    ? project.glyph
    : (project.title || '?').charAt(0).toUpperCase();
  el.setAttribute('data-glyph-len', String(glyph.textContent.length));

  var label = document.createElement('div');
  label.className = 'icon-label';
  // Label = command without leading slash
  label.textContent = (project.command || '').replace(/^\//, '');

  el.appendChild(glyph);
  el.appendChild(label);

  // Store project ref for handlers
  el._project = project;

  return el;
}

if (typeof window !== 'undefined') {
  window.createIcon = createIcon;
}
