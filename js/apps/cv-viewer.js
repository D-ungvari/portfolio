/**
 * CV viewer app (B23).
 *
 * v1: no real PDF is shipped, so we render a formatted text CV from
 * persona.json directly as the window content. If `assets/cv.pdf` is
 * added later, this app could be extended to prefer an <iframe> that
 * loads the PDF; for now the text fallback IS the v1 view.
 */
(function () {
  'use strict';

  function renderTextCV(persona) {
    var c = document.createElement('div');
    c.className = 'app-cv app-content';
    c.innerHTML =
      '<div class="cv-header">' +
        '<h1>' + persona.name + '</h1>' +
        '<div class="cv-subtitle">' + persona.role + ' · ' + persona.location + '</div>' +
      '</div>' +
      '<section><h3>EXPERIENCE</h3>' +
        persona.experience.map(function (e) {
          return '<div class="cv-job">' +
                 '<div class="cv-job-line"><strong>' + e.role + '</strong> — ' + e.company + ', ' + e.location + ' (' + e.from + ' – ' + e.to + ')</div>' +
                 '<ul>' + e.bullets.map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul>' +
                 '</div>';
        }).join('') +
      '</section>' +
      '<section><h3>STACK</h3>' +
        '<div><strong>Currently:</strong> ' + persona.currently_shipping.join(' · ') + '</div>' +
        '<div><strong>Recently:</strong> ' + persona.recently_shipped.join(' · ') + '</div>' +
      '</section>' +
      '<section><h3>EDUCATION</h3>' +
        persona.education.map(function (e) {
          return '<div>' + e.degree + ' — ' + e.school + ' (' + e.focus + ')</div>';
        }).join('') +
      '</section>' +
      '<section><h3>CONTACT</h3>' +
        '<div><a href="' + persona.contact.github + '" target="_blank" rel="noopener">' + persona.contact.github.replace('https://', '') + '</a></div>' +
        '<div><a href="' + persona.contact.linkedin + '" target="_blank" rel="noopener">' + persona.contact.linkedin.replace('https://', '') + '</a></div>' +
        '<div><a href="mailto:' + persona.contact.email + '">' + persona.contact.email + '</a></div>' +
      '</section>' +
      '<section><h3>AVAILABILITY</h3>' +
        '<div>' + persona.availability.status + ' · notice ' + persona.availability.notice_period_weeks + ' weeks · ' + persona.availability.remote + '</div>' +
      '</section>';
    return c;
  }

  function open() {
    if (!window.WindowManager) return;
    var existing = WindowManager.byApp('cv-viewer');
    if (existing && existing.length) {
      WindowManager.bringToFront(existing[0].id);
      return existing[0].id;
    }

    var persona = (window.Persona && Persona.get) ? Persona.get() : null;
    if (!persona && window.__PERSONA_FALLBACK) persona = window.__PERSONA_FALLBACK;
    if (!persona) return null;

    return WindowManager.open({
      app: 'cv-viewer',
      title: 'CV — ' + persona.name,
      content: renderTextCV(persona),
      w: 640,
      h: 720,
      menubar: [
        { label: 'File', items: [
          { label: 'Print...', shortcut: 'Ctrl+P', action: function () { try { window.print(); } catch (e) {} }},
          { label: 'Save as PDF', disabled: true },
          '---',
          { label: 'Close', shortcut: 'Ctrl+W', action: function () {
            var ex = WindowManager.byApp('cv-viewer');
            if (ex.length) WindowManager.close(ex[0].id);
          }}
        ]},
        { label: 'View', items: [
          { label: 'Zoom in', disabled: true },
          { label: 'Zoom out', disabled: true }
        ]},
        { label: 'Help', items: [
          { label: 'About CV Viewer', disabled: true }
        ]}
      ],
      statusbar: 'Page 1 of 1 · ' + persona.experience.length + ' positions'
    });
  }

  window.CVViewerApp = { open: open };
})();
