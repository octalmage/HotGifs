const { remote } = require('electron');

const win = remote.getCurrentWindow();

const riot = require('riot');
require('../tags/settings.tag');

const update = (settings) => {
  win.settings.set(settings);
  win.close();
};

riot.mount('settings', {
  update,
  settings: win.settings.all,
  labels: win.settingsLabels,
});
