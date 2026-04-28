/**
 * Boring view (B25) — strips OS chrome and renders a static plain-text
 * CV layout for recruiters who don't want the DavOS experience.
 *
 * Toggleable: BoringView.enable() / .disable() / .toggle().
 * CSS in apps.css hides #os-shell etc. via body.boring-mode.
 */
(function () {
  'use strict';
  var enabled = false;

  function renderInto(container, persona) {
    container.innerHTML =
      '<header class="boring-header">' +
        '<h1>' + persona.name + '</h1>' +
        '<div class="boring-subtitle">' + persona.role + ' · ' + persona.location + '</div>' +
        '<div class="boring-contact">' +
          '<a href="' + persona.contact.github + '" target="_blank" rel="noopener">github</a> · ' +
          '<a href="' + persona.contact.linkedin + '" target="_blank" rel="noopener">linkedin</a> · ' +
          '<a href="mailto:' + persona.contact.email + '">' + persona.contact.email + '</a>' +
        '</div>' +
      '</header>' +
      '<main class="boring-main">' +
        '<section><h2>Summary</h2>' +
          '<p>' + (persona.tagline || 'Full-stack developer in Copenhagen.') + '</p>' +
        '</section>' +
        '<section><h2>Experience</h2>' +
          persona.experience.map(function (e) {
            return '<div class="boring-job">' +
                   '<div class="boring-job-head"><strong>' + e.role + '</strong>, ' + e.company + ' · ' + e.location + ' <span class="boring-dates">(' + e.from + ' – ' + e.to + ')</span></div>' +
                   '<ul>' + e.bullets.map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul>' +
                   '</div>';
          }).join('') +
        '</section>' +
        '<section><h2>Projects</h2>' +
          (typeof projects !== 'undefined' ? projects.map(function (p) {
            return '<div class="boring-project">' +
                   '<strong>' + p.title + '</strong> — ' + p.tagline +
                   '<div class="boring-stack">' + p.stack + '</div>' +
                   '<div><a href="' + p.liveUrl + '" target="_blank" rel="noopener">live</a> · <a href="' + p.sourceUrl + '" target="_blank" rel="noopener">source</a></div>' +
                   '</div>';
          }).join('') : '') +
        '</section>' +
        '<section><h2>Education</h2>' +
          persona.education.map(function (e) {
            return '<div>' + e.degree + ' — ' + e.school + '</div>';
          }).join('') +
        '</section>' +
        '<section><h2>Stack</h2>' +
          '<p><strong>Currently:</strong> ' + persona.currently_shipping.join(', ') + '</p>' +
          '<p><strong>Recently:</strong> ' + persona.recently_shipped.join(', ') + '</p>' +
        '</section>' +
        '<section><h2>Availability</h2>' +
          '<p>' + persona.availability.status + ' · notice ' + persona.availability.notice_period_weeks + ' weeks · ' + persona.availability.remote + '</p>' +
        '</section>' +
      '</main>' +
      '<footer class="boring-footer">' +
        '<button class="boring-back" type="button">← Back to DavOS</button>' +
      '</footer>';
    var back = container.querySelector('.boring-back');
    if (back) back.addEventListener('click', disable);
  }

  function enable() {
    if (enabled) return;
    var persona = (window.Persona && Persona.get) ? Persona.get() : null;
    if (!persona && window.__PERSONA_FALLBACK) persona = window.__PERSONA_FALLBACK;
    if (!persona) return;

    var container = document.createElement('div');
    container.id = 'boring-view';
    document.body.appendChild(container);
    document.body.classList.add('boring-mode');
    renderInto(container, persona);
    enabled = true;
  }

  function disable() {
    if (!enabled) return;
    var c = document.getElementById('boring-view');
    if (c) c.remove();
    document.body.classList.remove('boring-mode');
    enabled = false;
  }

  function toggle() { enabled ? disable() : enable(); }

  window.BoringView = { enable: enable, disable: disable, toggle: toggle };
})();
