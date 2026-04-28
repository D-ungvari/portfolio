/**
 * Mail app (B22) — recruiter inbox flavor piece.
 *
 * Three messages: a read LinkedIn digest, an unread interview request
 * (with CTA to /contact), and a promotional npm packages email.
 */
(function () {
  'use strict';

  var messages = [
    {
      id: 'linkedin-1',
      from: 'LinkedIn <noreply@linkedin.com>',
      subject: 'Your weekly network update',
      preview: 'See who viewed your profile this week...',
      body: ['Your weekly digest:',
             '  - 17 people viewed your profile',
             '  - 3 new connections requested',
             '  - 1 endorsement received',
             '',
             '— LinkedIn'],
      read: true
    },
    {
      id: 'interview-1',
      from: 'recruiter@somewhere.dk',
      subject: 'Interview request — Senior Full-Stack',
      preview: 'We saw your portfolio and would love to chat...',
      body: ['Hi Dave,',
             '',
             "We're hiring a Senior Full-Stack Developer in Copenhagen.",
             "Stack matches yours: React/TypeScript front, .NET back.",
             "Hybrid 2 days office. Comp range fits your /availability.",
             '',
             'Could we schedule a 30-min intro this week?',
             '',
             '— Recruiter'],
      read: false,
      cta: { label: 'Reply via /contact', action: 'open-contact' }
    },
    {
      id: 'npm-1',
      from: 'npm-weekly <hello@npmjs.com>',
      subject: 'Trending packages this week',
      preview: 'left-pad just released v2.0...',
      body: ['Trending this week:',
             '  - left-pad@2.0.0',
             '  - is-odd@4.0.0 (now AI-powered!)',
             '  - is-even@1.0.0',
             '',
             'Unsubscribe: never (we lost the link).'],
      read: true
    }
  ];

  var selectedId = null;

  function buildContent() {
    var c = document.createElement('div');
    c.className = 'app-mail app-content';

    var list = document.createElement('div');
    list.className = 'mail-list';

    var detail = document.createElement('div');
    detail.className = 'mail-detail';
    detail.innerHTML = '<div class="mail-empty">Select a message to read.</div>';

    function renderList() {
      list.innerHTML = '';
      var unread = messages.filter(function (m) { return !m.read; }).length;
      var hdr = document.createElement('div');
      hdr.className = 'mail-list-header';
      hdr.textContent = 'INBOX (' + unread + ' unread)';
      list.appendChild(hdr);

      for (var i = 0; i < messages.length; i++) {
        (function (m) {
          var row = document.createElement('div');
          row.className = 'mail-row' + (m.read ? '' : ' unread') + (m.id === selectedId ? ' selected' : '');
          row.innerHTML =
            '<div class="mail-row-from">' + escapeHtml(m.from) + '</div>' +
            '<div class="mail-row-subject">' + escapeHtml(m.subject) + '</div>' +
            '<div class="mail-row-preview">' + escapeHtml(m.preview) + '</div>';
          row.addEventListener('click', function () {
            selectedId = m.id;
            m.read = true;
            renderList();
            renderDetail(m);
          });
          list.appendChild(row);
        })(messages[i]);
      }
    }

    function renderDetail(m) {
      detail.innerHTML = '';
      var subject = document.createElement('div');
      subject.className = 'mail-detail-subject';
      subject.textContent = m.subject;
      var meta = document.createElement('div');
      meta.className = 'mail-detail-meta';
      meta.textContent = 'from: ' + m.from;
      var body = document.createElement('pre');
      body.className = 'mail-detail-body';
      body.textContent = m.body.join('\n');
      detail.appendChild(subject);
      detail.appendChild(meta);
      detail.appendChild(body);
      if (m.cta) {
        var cta = document.createElement('button');
        cta.className = 'app-button mail-cta';
        cta.type = 'button';
        cta.textContent = m.cta.label;
        cta.addEventListener('click', function () {
          if (m.cta.action === 'open-contact') {
            if (window._terminalRef && typeof executeCommand === 'function') {
              executeCommand('/contact', window._terminalRef);
              if (window.PaneToggle && PaneToggle.show) PaneToggle.show('terminal');
            }
          }
        });
        detail.appendChild(cta);
      }
    }

    function escapeHtml(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    renderList();
    c.appendChild(list);
    c.appendChild(detail);
    return c;
  }

  function open() {
    if (!window.WindowManager) return;
    var existing = WindowManager.byApp('mail');
    if (existing && existing.length) {
      WindowManager.bringToFront(existing[0].id);
      return existing[0].id;
    }
    var unread = messages.filter(function (m) { return !m.read; }).length;
    var total = messages.length;
    return WindowManager.open({
      app: 'mail',
      title: 'Mail',
      content: buildContent(),
      w: 720,
      h: 480,
      menubar: [
        { label: 'File', items: [
          { label: 'New message', disabled: true },
          { label: 'Refresh inbox', action: function () {} },
          '---',
          { label: 'Close', shortcut: 'Ctrl+W', action: function () {
            var ex = WindowManager.byApp('mail');
            if (ex.length) WindowManager.close(ex[0].id);
          }}
        ]},
        { label: 'Edit', items: [
          { label: 'Mark all as read', action: function () {
            for (var i = 0; i < messages.length; i++) messages[i].read = true;
            var ex = WindowManager.byApp('mail');
            if (ex.length) { WindowManager.close(ex[0].id); open(); }
          }}
        ]},
        { label: 'View', items: [
          { label: 'Sort by date', disabled: true },
          { label: 'Sort by sender', disabled: true }
        ]},
        { label: 'Help', items: [
          { label: 'About Mail', disabled: true }
        ]}
      ],
      statusbar: total + ' messages, ' + unread + ' unread'
    });
  }

  window.MailApp = { open: open };
})();
