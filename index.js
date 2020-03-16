var CIDR = require('cidr-js');
var cidr = new CIDR();
var fs = require('fs');

const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let window = null;

app.once('ready', () => {
  window = new BrowserWindow({
    width: 1000,
    height: 600,
    backgroundColor: '#D6D8DC',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    },
    icon: __dirname + '/icon.png'
  });

  window.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  const iconUrl = url.format({
    pathname: path.join(__dirname, '/icon.png'),
    protocol: 'file:',
    slashes: true
  });

  window.once('ready-to-show', () => {
    window.show();
  });
});
