const { ipcRenderer } = require('electron');
const redis = require('redis');
const Clusterize = require('clusterize.js');

var tabId;
var tabSessionId;
var timeout;

var channelName = '';
var scroll = true;
var fontSize = 12;

var channelCount = 0;
var subscriber;
var publisher;

var data = [];

$(document).ready(function() {
  var clusterize = new Clusterize({
    rows: data,
    rows_in_block: 32,
    scrollId: 'scrollArea',
    contentId: 'contentArea'
  });

  $('#channel-input').prop('readonly', true);
  $('#start-button').attr('disabled', false);
  $('#stop-button').attr('disabled', true);

  $('#start-button').click(function() {
    channelName = $('#channel-input').val() || 'info';
    $('#channel-input').prop('readonly', true);
    $('#host-input').prop('readonly', true);
    $('#port-input').prop('readonly', true);
    startListening();
  });

  function startListening() {
    const redisOptions = {
      host: $('#host-input').val() || '127.0.0.1',
      port: $('#port-input').val() || '6379'
    };
    subscriber = redis.createClient(redisOptions);
    publisher = redis.createClient(redisOptions);

    subscriber.subscribe(getChannelName());

    $('#start-button').attr('disabled', true);
    $('#stop-button').attr('disabled', false);

    subscriber.on('subscribe', function(channel, count) {
      $('#channel-counter')
        .removeClass('alert-secondary')
        .addClass('alert-primary');
    });

    subscriber.on('message', function(channel, message) {
      channelCount++;

      hanndleMessage(channel, message, channelCount);
    });
  }

  function hanndleMessage(channel, message, count) {
    if (getChannelName()) {
      var obj = JSON.parse(message);

      clusterize.append([
        `<div><pre>${syntaxHighlight(JSON.stringify(obj, null, 4))}</pre></div>`
      ]);

      if (scroll) {
        const elm = document.getElementById('scrollArea');
        elm.scrollTop = elm.scrollHeight;
      }

      $(`#channel-counter`).html(`${count}`);
    }
  }

  $('#stop-button').click(function() {
    subscriber.unsubscribe('info');
    subscriber.unsubscribe('error');
    $('#channel-input').css('color', 'gray');
    $('#channel-input').prop('readonly', false);
    $('#host-input').prop('readonly', false);
    $('#port-input').prop('readonly', false);
    $('#channel-counter')
      .addClass('alert-secondary')
      .removeClass('alert-primary');
    $('#start-button').attr('disabled', false);
    $('#stop-button').attr('disabled', true);
  });

  $('#clear-button').click(function() {
    channelCount = 0;
    $(`#channel-counter`).html(`${channelCount}`);
    $(`#channel-box`).html('');
    clusterize.clear();
  });

  $('#watch-button').click(function() {
    scroll = !scroll;
    $('#watch-button')
      .addClass(scroll ? 'btn-success' : 'btn-secondary')
      .removeClass(scroll ? 'btn-secondary' : 'btn-success');

    if (scroll) {
      const elm = document.getElementById('scrollArea');
      elm.scrollTop = elm.scrollHeight;
    }
  });

  $('#font-smaller').click(function() {
    fontSize = fontSize - 1 < 0 ? 0 : fontSize - 1;
    document.getElementById('scrollArea').style.fontSize = `${fontSize}px`;
  });

  $('#font-bigger').click(function() {
    fontSize = fontSize + 1;
    document.getElementById('scrollArea').style.fontSize = `${fontSize}px`;
  });

  $(function() {
    $('form').submit(function() {
      return false;
    });
  });

  $('#channel-input').keyup(function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      ipcRenderer.sendToHost('updateTitle', {
        tabSessionId: tabSessionId,
        title: getChannelName()
      });
    }, 1000);
  });

  // 2.) listen for a message from the parent (paremt-main.html)
});

ipcRenderer.on('initial', (event, data) => {
  let params = data[0];
  tabId = params.id;
  tabSessionId = params.id.replace('tab-', '');
  $('#channel-input').prop('readonly', false);
});

function getChannelName() {
  return (
    $('#channel-input')
      .val()
      .trim() || 'info'
  );
}

function syntaxHighlight(json) {
  json = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function(match) {
      var cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    }
  );
}

function publish() {
  var counterA = 0;
  setInterval(() => {
    counterA++;
    publisher.publish(
      'info',
      `{"type":" candle${counterA}h","message":{"openTime":1584370800000,"open":"4937.43000000","high":"5006.00000000","low":"4917.91000000","close":"4972.22000000","volume":"817.86331000","closeTime":1584374399999,"quoteVolume":"4060250.06674258","trades":7422,"baseAssetVolume":"484.40621700","quoteAssetVolume":"2404511.63890850","macd":50.00217254103427,"sig":-96.264206873922,"adx":20.790110599040272,"diP":23.99818209887909,"diN":22.073495464213103,"k1":80.17,"d1":65.7,"k2":100,"d2":100,"k3":100,"d3":94.71,"k4":100,"d4":100,"k5":86.13,"d5":81.01,"rsi5":59.82,"rsi10":49.37,"rsi14":47.44,"c20":-50.57854584297164,"cc20":-25.17909204889748,"c20State":1,"dAdx":-51.955313882630094,"aoEightState1hr":false,"hrState":"0","s3CrossCount":0,"s2DUnderKCount":1,"stochCrossing":false,"rule1":true,"rule2":false,"rule3":false,"rule4":false,"rule5":false,"rule6":false,"rule7":false,"c20states":"1111","rule8":false,"rule13":false,"rule14":false,"rule15":false,"rule1n1":false,"rule1n2":false,"rule1n3":false,"rule8n1":false,"rule8n2":false,"rule8n3":false,"rule9":false,"rule10":false,"rule11":false,"rule12":true,"signal":true}}`
    );
  }, 1000);
}
