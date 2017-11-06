const { remote } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const riot = require('riot');
require('../tags/settings.tag');

const win = remote.getCurrentWindow();

const update = (settings) => {
  win.settings.set(settings);
  win.close();
};

riot.mount('settings', {
  update,
  settings: win.settings.all,
  labels: win.settingsLabels,
});
