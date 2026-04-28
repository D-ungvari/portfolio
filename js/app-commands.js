/**
 * App-launcher commands for the Phase B5 native apps.
 *
 * Avoids colliding with existing /apps (lists app projects), /cv
 * (alias to /resume), and /grid is unused in commands.js so we use it
 * for the apps grid window.
 */
(function () {
  'use strict';

  if (typeof registerCommand !== 'function') return;

  registerCommand('/settings', 'open settings app', function (terminal) {
    if (window.SettingsApp) {
      SettingsApp.open();
      terminal.output('> opening settings...', 'accent');
    } else {
      terminal.output('settings unavailable.', 'error');
    }
  });

  registerCommand('/mail', 'open mail app', function (terminal) {
    if (window.MailApp) {
      MailApp.open();
      terminal.output('> opening mail...', 'accent');
    } else {
      terminal.output('mail unavailable.', 'error');
    }
  });

  registerCommand('/cv-window', 'open CV viewer', function (terminal) {
    if (window.CVViewerApp) {
      CVViewerApp.open();
      terminal.output('> opening CV viewer...', 'accent');
    } else {
      terminal.output('cv viewer unavailable.', 'error');
    }
  });

  registerCommand('/grid', 'open apps grid view', function (terminal) {
    if (window.AppsGridApp) {
      AppsGridApp.open();
      terminal.output('> opening apps grid...', 'accent');
    } else {
      terminal.output('apps grid unavailable.', 'error');
    }
  });

  registerCommand('/boring', 'toggle boring CV view', function (terminal) {
    if (window.BoringView) {
      BoringView.toggle();
      terminal.output('> boring view toggled', 'accent');
    } else {
      terminal.output('boring view unavailable.', 'error');
    }
  });
})();
