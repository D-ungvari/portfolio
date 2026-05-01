/**
 * Arch redesign A7 and end-to-end identity checks.
 */

var T = TestHarness;

function combinedOutput(mock) {
  return mock.getAllText() + '\n' + mock.htmlOutputLog.map(function (x) { return x.html; }).join('\n');
}

T.describe('Arch Cultural Commands', function() {
  T.it('btw prints the Arch shibboleth in themed HTML', function() {
    var mock = T.createMockTerminal();
    commandRegistry.btw.handler(mock);
    var html = mock.htmlOutputLog[0].html;
    T.assertContains(html, 'var(--color-arch)');
    T.assertContains(html, 'i use arch btw.');
  });

  T.it('/pacman -Syu renders a fake full upgrade transcript', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/pacman -syu'].handler(mock);
    var text = mock.getAllText();
    T.assertContains(text, 'Synchronizing package databases');
    T.assertContains(text, '100%');
    T.assertContains(text, 'Transaction complete');
  });

  T.it('/yay and /paru render AUR transcripts', function() {
    var yay = T.createMockTerminal();
    var paru = T.createMockTerminal();
    commandRegistry['/yay'].handler(yay);
    commandRegistry['/paru'].handler(paru);
    T.assertContains(yay.getAllText(), 'AUR');
    T.assertContains(paru.getAllText(), 'paru');
  });

  T.it('/dotfiles emits the GitHub dotfiles link', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/dotfiles'].handler(mock);
    var html = mock.htmlOutputLog[0].html;
    T.assertContains(html, 'github.com/D-ungvari/dotfiles');
    T.assertContains(html, 'target="_blank"');
    T.assertContains(html, 'rel="noopener"');
  });

  T.it('/aur points users toward paru', function() {
    var mock = T.createMockTerminal();
    commandRegistry['/aur'].handler(mock);
    T.assertContains(mock.getAllText(), 'paru');
  });
});

T.describe('Hash Router', function() {
  T.it('maps #/~/projects to /projects', function() {
    var mock = T.createMockTerminal();
    HashRouter.handle('#/~/projects', mock);
    T.assertContains(combinedOutput(mock), 'projects');
    T.assertContains(document.title, '~/projects');
  });

  T.it('maps config/about route to neofetch about', function() {
    var mock = T.createMockTerminal();
    HashRouter.handle('#/~/.config/about', mock);
    T.assertContains(combinedOutput(mock), 'neofetch-render');
    T.assertContains(document.title, '~/.config/about');
  });

  T.it('unknown filesystem route prints a shell-style error', function() {
    var mock = T.createMockTerminal();
    HashRouter.handle('#/~/missing', mock);
    T.assertContains(mock.getAllText(), 'No such file or directory');
  });

  T.it('routeForCommand maps shareable commands', function() {
    T.assertEqual(HashRouter.routeForCommand('/projects').hash, '#/~/projects');
    T.assertEqual(HashRouter.routeForCommand('/about').hash, '#/~/.config/about');
    T.assertEqual(HashRouter.routeForCommand('/dotfiles').hash, '#/~/dotfiles');
  });
});

T.describe('Arch Visual Identity', function() {
  T.it('brand cyan, workspace pills, neofetch, and powerline prompt are present', function() {
    var arch = getComputedStyle(document.documentElement).getPropertyValue('--color-arch').trim();
    T.assertEqual(arch, '#1793D1');
    Taskbar.init();
    T.assert(document.querySelectorAll('#taskbar-workspaces .workspace-pill').length >= 5);
    T.assertNotNull(document.querySelector('.prompt-top'));
    T.assertNotNull(document.querySelector('.prompt-bottom'));
    var html = Neofetch.renderHTML();
    T.assertContains(html, 'neofetch-logo');
  });
});
