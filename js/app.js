$(document).ready(function() {
  const enav = new (require('electron-navigation'))({
    showBackButton: false,
    showForwardButton: false,
    showReloadButton: false,
    showUrlBar: false,
    contextMenu: true,
    webviewAttributes: {},
    newTabParams: () => {
      createNewTab();
    }
  });

  var tabSessionId = 1;

  function createNewTab() {
    const tab = enav.newTab(`file:///${__dirname}/channel.html`, {
      id: `tab-${tabSessionId}`,
      title: 'New Channel',
      node: true
    });

    setTimeout(() => {
      enav.send(tab.id, 'initial', [
        {
          id: tab.id
        }
      ]);
    }, 1000);

    enav.listen(`tab-${tabSessionId}`, (messageKey, args, respond) => {
      var params = args[0];

      if (messageKey == 'updateTitle') {
        $(
          '.nav-tabs-tab[data-session="' +
            params.tabSessionId +
            '"] .nav-tabs-title'
        ).html(params.title);
      }
    });

    tabSessionId++;
  }

  createNewTab();
});
