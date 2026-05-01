/**
 * Arch redesign A5 - neofetch renderer.
 */

var T = TestHarness;

function neofetchHTML(cmd) {
  var mock = T.createMockTerminal();
  commandRegistry[cmd].handler(mock);
  T.assert(mock.getHTMLCount() > 0, cmd + ' should render HTML');
  return mock.htmlOutputLog[0].html;
}

T.describe('Arch Neofetch', function() {
  T.it('Neofetch API is exposed', function() {
    T.assertType(window.Neofetch, 'object');
    T.assertType(window.Neofetch.render, 'function');
    T.assertType(window.Neofetch.renderHTML, 'function');
  });

  T.it('/about, /neofetch, and /fastfetch are registered', function() {
    T.assertNotNull(commandRegistry['/about']);
    T.assertNotNull(commandRegistry['/neofetch']);
    T.assertNotNull(commandRegistry['/fastfetch']);
    T.assertFalse(commandRegistry['/about'].hidden);
    T.assertTrue(commandRegistry['/neofetch'].hidden);
    T.assertTrue(commandRegistry['/fastfetch'].hidden);
  });

  T.it('/about renders the Arch logo and info blocks', function() {
    var html = neofetchHTML('/about');
    T.assertContains(html, 'class="neofetch-logo"');
    T.assertContains(html, 'class="neofetch-info"');
    T.assertContains(html, 'david@dave-arch');
    T.assertContains(html, 'Arch Linux x86_64');
  });

  T.it('neofetch includes expected persona and system fields', function() {
    var html = neofetchHTML('/neofetch');
    var fields = ['Kernel', 'Uptime', 'Packages', 'Shell', 'WM', 'Editor', 'Theme', 'CPU', 'Memory', 'Location', 'Role', 'Stack', 'GitHub', 'Email'];
    for (var i = 0; i < fields.length; i++) {
      T.assertContains(html, fields[i]);
    }
    T.assertContains(html, 'Copenhagen, DK');
    T.assertContains(html, 'Full-stack Developer');
  });

  T.it('/fastfetch uses the same renderer as /neofetch', function() {
    var neo = neofetchHTML('/neofetch');
    var fast = neofetchHTML('/fastfetch');
    T.assertContains(fast, 'neofetch-render');
    T.assertContains(neo, 'neofetch-render');
  });

  T.it('boot welcome renders neofetch markup', function() {
    var mock = T.createMockTerminal();
    showWelcome(mock);
    T.assert(mock.getHTMLCount() > 0, 'welcome should include neofetch HTML');
    T.assertContains(mock.htmlOutputLog[0].html, 'neofetch-render');
  });
});
