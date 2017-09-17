const gui = require('nw.gui');

const win = gui.Window.get();
const app_version = gui.App.manifest.version;

const ua = require('universal-analytics');

const visitor = ua('UA-67011723-1');

const AutoLaunch = require('auto-launch');

const runatstartup = new AutoLaunch({
  name: 'Hot Gifs',
  isHidden: 'false',
});

const config = require('./config.json');

// Load user settings.
const Configstore = require('configstore');
const pkg = require('./package.json');

const settings = new Configstore(pkg.name, { 'opt-out': false, 'check-for-updates': true });

let keydown = 0;
let showing = 0;

const previewtext = 'Hold enter to preview.';
const skiptext = 'Press tab to skip.';

let startup;

if (process.platform === 'darwin') {
  const nativeMenuBar = new gui.Menu({
    type: 'menubar',
  });
  nativeMenuBar.createMacBuiltin('Hot Gifs');
  win.menu = nativeMenuBar;
}

// Create tray icon.
const tray = new gui.Tray({
  icon: 'assets/img/tray.png',
  iconsAreTemplates: false,
});

// Give it a menu.
const menu = new gui.Menu();
menu.append(new gui.MenuItem({
  label: 'Hot Gifs',
}));
menu.append(new gui.MenuItem({
  type: 'separator',
}));
menu.append(new gui.MenuItem({
  label: `v${app_version}`,
}));

// Run at startup.
if (process.platform === 'darwin') {
  startup = new gui.MenuItem({
    label: 'Run at startup?',
    type: 'checkbox',
    click: startupClicked,
  });
  menu.append(startup);
}

menu.append(new gui.MenuItem({
  label: 'Settings',
  click: settingsClicked,
}));

menu.append(new gui.MenuItem({
  type: 'separator',
}));
menu.append(new gui.MenuItem({
  label: 'Exit',
  click() {
    gui.App.quit();
  },
}));
tray.menu = menu;

// Get clipboard reference.
const clipboard = gui.Clipboard.get();

// Uncomment to show dev tools.
// win.showDevTools();

const translate_endpoint = 'http://api.giphy.com';
const api_version = 'v1';

// Hotkey Stuff
const option = {
  key: 'Ctrl+Alt+G',
  active() {
    showing = 1;
    win.show();

    // Workaround to focus the input after showing.
    setTimeout(() => {
      win.focus();
      $('#s').focus();
    }, 0);

    if (!settings.get('opt-out')) visitor.event('User interaction', 'Window Open').send();
  },
  failed(msg) {
    console.log(msg);
  },
};

const shortcut = new gui.Shortcut(option);

gui.App.registerGlobalHotKey(shortcut);

// Startup check.
runatstartup.isEnabled((found) => {
  if (found) {
    startup.checked = true;
  }
});

$(document).on('ready', () => {
  if (settings.get('check-for-updates')) {
    checkforupdate();
  }

  $('#search').on('click', () => {
    search();
  });

  $('#s').keydown((e) => {
    // If the instruction text isn't showing, and it's the preview instructions, show it.
    if (!instructionsshowing() && $('#instructions').text() == previewtext) { $('#instructions').fadeIn(); }

    // Tab to skip gif.
    if (e.keyCode == 9 && keydown) {
      // Hide skip instructions if they're currently showing.
      if (instructionsshowing()) { $('#instructions').fadeOut(); }

      e.preventDefault();
      search();

      if (!settings.get('opt-out')) visitor.event('User interaction', 'Skip').send();
      return;
    }

    // Enter is currently held down.
    if (keydown) return;

    // Search if enter is pressed down.
    if (e.keyCode == 13) {
      // Show skip instructions.
      $('#instructions').fadeOut(null, () => {
        $('#instructions').text(skiptext);
        $('#instructions').fadeIn();
      });

      keydown = 1;
      search();
    }
  });

  $('#s').keyup((e) => {
    // Hide window if enter is released.
    if (e.keyCode == 13) {
      closeGUI();
    }
  });

  // Double click to center GUI.
  $(document).on('dblclick', () => {
    win.setPosition('center');
  });

  $(document).keyup((e) => {
    // Close the dialog if esc is pressed.
    if (e.keyCode == 27) {
      closeGUI();
    }
  });
});

function search() {
  const keyword = $('#s').val();

  // Time Giphy response.
  const start = new Date().getTime();

  $('#i').attr('src', 'assets/img/load.gif');
  $('#scene').show();
  url = `${translate_endpoint}/${api_version}/gifs/translate?s=${encodeURIComponent(keyword)}&api_key=${config.key}`;
  $.ajax({
    type: 'GET',
    url,
  }).done((res) => {
    const end = new Date().getTime();
    const time = end - start;
    if (!settings.get('opt-out')) visitor.timing('User interaction', 'Time to return Giphy results', time).send();

    // If results are found.
    if (typeof res.data.images !== 'undefined') {
      clipboard.set(res.data.images.original.url, 'text');
      if (showing) {
        win.height = 270;
        $('#i').attr('src', res.data.images.downsized_medium.url);
        if (!settings.get('opt-out')) visitor.event('User interaction', 'Preview').send();
      }
    } else {
      clipboard.set('No Results', 'text');
      if (showing) {
        $('#instructions').fadeOut(null, () => {
          $('#instructions').text('No Results.');
          $('#instructions').fadeIn();
        });
      }
      if (!settings.get('opt-out')) visitor.event('User interaction', 'No Results', keyword).send();
    }
  });
  if (!settings.get('opt-out')) visitor.event('User interaction', 'Search', keyword).send();
}

function closeGUI() {
  keydown = 0;
  showing = 0;
  win.height = 60;
  $('#s').val('');
  $('#scene').hide();
  $('#i').attr('src', '');
  $('#instructions').stop().hide().text(previewtext);
  win.hide();
}

function instructionsshowing() {
  return $('#instructions').css('display') != 'none';
}

function checkforupdate() {
  $.ajax({
    type: 'GET',
    url: 'https://api.github.com/repos/octalmage/hotgifs/releases',
  }).done((releases) => {
    current_version = releases[0].name.substr(1, releases[0].name.length);
    if (current_version != app_version) {
      alert(`Update available! \nInstalled version: ${app_version}.\nLatest version: ${current_version}.`);
      gui.Shell.openExternal('https://github.com/octalmage/HotGifs/releases/latest/');
    }
  });
}

function startupClicked() {
  if (startup.checked) {
    runatstartup.enable();
  } else {
    runatstartup.disable();
  }
}

function settingsClicked() {
  const dialog = gui.Window.open(
    'assets/view/settings.html',
    {
      width: 300,
      height: 100,
      toolbar: false,
    },
  );

  dialog.on('loaded', () => {
    // Load settings.
    for (const x in settings.all) {
      dialog.window.$(`input[name="${x}"]`).prop('checked', settings.all[x]);
    }

    // On submit, save the settings.
    dialog.window.$('form').on('submit', (event) => {
      event.preventDefault();
      dialog.window.$('input:checkbox').map(function () {
        settings.set(this.name, !!this.checked);
      });
      dialog.close();
    });
  });
}
