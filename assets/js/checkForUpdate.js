const { Notification, shell } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const fetch = require('node-fetch');

module.exports = function checkforupdate(appVersion) {
  fetch('https://api.github.com/repos/octalmage/hotgifs/releases')
    .then(response => response.json())
    .then((releases) => {
      const currentVersion = releases[0].name.substr(1, releases[0].name.length);
      if (currentVersion !== appVersion) {
        const updateNotification = new Notification({
          title: 'Hot Gifs',
          body: `Update available! \nInstalled version: ${appVersion}.\nLatest version: ${currentVersion}.`,
        });
        updateNotification.on('click', () => {
          shell.openExternal('https://github.com/octalmage/HotGifs/releases/latest/');
        });
        updateNotification.show();
      }
    });
};
