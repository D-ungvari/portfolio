/**
 * Arch redesign A4 - workspaces and opt-in tiling.
 */

var T = TestHarness;

function cleanupWorkspaceWindows() {
  if (window.WindowManager && WindowManager.list) {
    var list = WindowManager.list().slice();
    for (var i = 0; i < list.length; i++) {
      try { WindowManager.close(list[i].id); } catch (e) {}
    }
  }
  if (window.Workspaces && Workspaces.switchTo) Workspaces.switchTo(1);
}

T.describe('Arch Workspaces', function() {
  T.it('Workspaces API is exposed with five slots', function() {
    T.assertType(window.Workspaces, 'object');
    T.assertEqual(Workspaces.count, 5);
    T.assertEqual(Workspaces.currentId(), 1);
    var snap = Workspaces.snapshot();
    T.assertEqual(Object.keys(snap.map).length, 5);
  });

  T.it('Session exposes a workspaces state key', function() {
    var saved = Session.get('workspaces');
    T.assert(saved && saved.map, 'workspaces session state should exist');
    T.assert(saved.map['1'], 'workspace 1 should exist');
  });

  T.it('Taskbar renders five workspace pills', function() {
    Taskbar.init();
    var pills = document.querySelectorAll('#taskbar-workspaces .workspace-pill');
    T.assertEqual(pills.length, 5);
    T.assertNotNull(document.querySelector('#taskbar-workspaces .workspace-pill.active[data-workspace="1"]'));
  });

  T.it('new windows attach to the active workspace', function() {
    cleanupWorkspaceWindows();
    var id = WindowManager.open({ app: 'test', title: 'WS1', content: 'one' });
    var state = WindowManager.get(id);
    T.assertEqual(state.workspaceId, 1);
    var ids = Workspaces.snapshot().map['1'].windowIds;
    T.assert(ids.indexOf(id) !== -1, 'workspace 1 should track the new window');
    cleanupWorkspaceWindows();
  });

  T.it('switching workspaces hides and restores window sets', function() {
    cleanupWorkspaceWindows();
    var id1 = WindowManager.open({ app: 'test', title: 'WS1', content: 'one' });
    Workspaces.switchTo(2);
    var el1 = document.querySelector('[data-window-id="' + id1 + '"]');
    T.assertContains(el1.className, 'workspace-hidden');
    var id2 = WindowManager.open({ app: 'test', title: 'WS2', content: 'two' });
    var el2 = document.querySelector('[data-window-id="' + id2 + '"]');
    T.assertEqual(WindowManager.get(id2).workspaceId, 2);
    T.assert(el2.className.indexOf('workspace-hidden') === -1, 'workspace 2 window should be visible');
    Workspaces.switchTo(1);
    T.assert(el1.className.indexOf('workspace-hidden') === -1, 'workspace 1 window should be visible again');
    T.assertContains(el2.className, 'workspace-hidden');
    cleanupWorkspaceWindows();
  });

  T.it('Ctrl+Alt+number shortcuts switch workspace', function() {
    cleanupWorkspaceWindows();
    document.dispatchEvent(new window.KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: '3',
      ctrlKey: true,
      altKey: true
    }));
    T.assertEqual(Workspaces.currentId(), 3);
    Workspaces.switchTo(1);
  });

  T.it('tiling places two windows in gapped halves', function() {
    cleanupWorkspaceWindows();
    Workspaces.switchTo(1);
    var a = WindowManager.open({ app: 'test', title: 'Tile A', content: 'a' });
    var b = WindowManager.open({ app: 'test', title: 'Tile B', content: 'b' });
    var enabled = Workspaces.toggleTiling(1);
    T.assertTrue(enabled);
    var sa = WindowManager.get(a);
    var sb = WindowManager.get(b);
    T.assertEqual(sa.x, 12);
    T.assertEqual(sa.y, 12);
    T.assert(sb.x > sa.x + sa.w, 'second tile should be to the right of first');
    T.assertEqual(sa.h, sb.h);
    Workspaces.toggleTiling(1);
    cleanupWorkspaceWindows();
  });
});
