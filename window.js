$(document).ready(function() {
  const redis = require('redis');
  const Clusterize = require('clusterize.js');

  var firstChannel = '';
  var secondChannel = '';
  var scrollFirst = true;
  var scrollSecond = true;
  var fontSize = 12;

  $('#start-button').click(function() {
    firstChannel = $('#first-channel-input').val() || 'info';
    secondChannel = $('#second-channel-input').val() || 'error';
    $('#first-channel-input').prop('readonly', true);
    $('#second-channel-input').prop('readonly', true);
    $('#host-input').prop('readonly', true);
    $('#port-input').prop('readonly', true);
    startListening();
  });

  var firstChannelCount = 0;
  var secondChannelCount = 0;
  var subscriber;
  var publisher;

  $('#start-button').attr('disabled', false);
  $('#stop-button').attr('disabled', true);

  function startListening() {
    const redisOptions = {
      host: $('#host-input').val() || '127.0.0.1',
      port: $('#port-input').val() || '6379'
    };
    subscriber = redis.createClient(redisOptions);
    publisher = redis.createClient(redisOptions);

    console.log(redisOptions);

    subscriber.subscribe(firstChannel);
    subscriber.subscribe(secondChannel);

    $('#start-button').attr('disabled', true);
    $('#stop-button').attr('disabled', false);

    subscriber.on('subscribe', function(channel, count) {
      if (channel == firstChannel) {
        $('#first-channel-counter')
          .removeClass('alert-secondary')
          .addClass('alert-primary');
      } else if (channel == secondChannel) {
        $('#second-channel-counter')
          .removeClass('alert-secondary')
          .addClass('alert-primary');
      }
    });

    subscriber.on('message', function(channel, message) {
      if (channel == firstChannel) {
        firstChannelCount++;
      } else if (channel == secondChannel) {
        secondChannelCount++;
      }

      hanndleMessage(
        channel,
        message,
        channel == firstChannel ? firstChannelCount : secondChannelCount
      );
    });
  }

  var dataFirst = [];
  var clusterizeFirst = new Clusterize({
    rows: dataFirst,
    rows_in_block: 32,
    scrollId: 'scrollAreaFirst',
    contentId: 'contentAreaFirst'
  });

  var dataSecond = [];
  var clusterizeSecond = new Clusterize({
    rows: dataSecond,
    rows_in_block: 32,
    scrollId: 'scrollAreaSecond',
    contentId: 'contentAreaSecond'
  });

  function hanndleMessage(channel, message, count) {
    var item = firstChannel == channel ? 'first' : 'second';

    var obj = JSON.parse(message);

    if (item == 'first') {
      clusterizeFirst.append([
        `<div><pre>${syntaxHighlight(JSON.stringify(obj, null, 4))}</pre></div>`
      ]);

      if (scrollFirst) {
        const elm = document.getElementById('scrollAreaFirst');
        elm.scrollTop = elm.scrollHeight;
      }
    } else if (item == 'second') {
      clusterizeSecond.append([
        `<div><pre>${syntaxHighlight(JSON.stringify(obj, null, 4))}</pre></div>`
      ]);

      if (scrollSecond) {
        const elm = document.getElementById('scrollAreaSecond');
        elm.scrollTop = elm.scrollHeight;
      }
    }

    $(`#${item}-channel-counter`).html(`${count}`);
  }

  $('#stop-button').click(function() {
    subscriber.unsubscribe('info');
    subscriber.unsubscribe('error');
    $('#first-channel-input').css('color', 'gray');
    $('#second-channel-input').css('color', 'gray');
    $('#first-channel-input').prop('readonly', false);
    $('#second-channel-input').prop('readonly', false);
    $('#host-input').prop('readonly', false);
    $('#port-input').prop('readonly', false);
    $('#first-channel-counter')
      .addClass('alert-secondary')
      .removeClass('alert-primary');
    $('#second-channel-counter')
      .addClass('alert-secondary')
      .removeClass('alert-primary');
    $('#start-button').attr('disabled', false);
    $('#stop-button').attr('disabled', true);
  });

  $('#clear-button').click(function() {
    firstChannelCount = 0;
    secondChannelCount = 0;
    $(`#first-channel-counter`).html(`${firstChannelCount}`);
    $(`#second-channel-counter`).html(`${secondChannelCount}`);
    $(`#first-channel-box`).html('');
    $(`#second-channel-box`).html('');
    clusterizeFirst.clear();
    clusterizeSecond.clear();
  });

  $('#watch-first-button').click(function() {
    scrollFirst = !scrollFirst;
    $('#watch-first-button')
      .addClass(scrollFirst ? 'btn-success' : 'btn-secondary')
      .removeClass(scrollFirst ? 'btn-secondary' : 'btn-success');

    if (scrollFirst) {
      const elm = document.getElementById('scrollAreaFirst');
      elm.scrollTop = elm.scrollHeight;
    }
  });

  $('#watch-second-button').click(function() {
    scrollSecond = !scrollSecond;
    $('#watch-second-button')
      .addClass(scrollSecond ? 'btn-success' : 'btn-secondary')
      .removeClass(scrollSecond ? 'btn-secondary' : 'btn-success');

    if (scrollSecond) {
      const elm = document.getElementById('scrollAreaSecond');
      elm.scrollTop = elm.scrollHeight;
    }
  });

  $('#font-smaller').click(function() {
    fontSize = fontSize - 1 < 0 ? 0 : fontSize - 1;
    document.getElementById('scrollAreaFirst').style.fontSize = `${fontSize}px`;
    document.getElementById(
      'scrollAreaSecond'
    ).style.fontSize = `${fontSize}px`;
  });

  $('#font-bigger').click(function() {
    fontSize = fontSize + 1;
    document.getElementById('scrollAreaFirst').style.fontSize = `${fontSize}px`;
    document.getElementById(
      'scrollAreaSecond'
    ).style.fontSize = `${fontSize}px`;
  });

  // var counterA = 0;
  // var counterB = 0;
  // setInterval(() => {
  //   counterA++;
  //   publisher.publish(
  //     'info',
  //     `{"type":"first candle${counterA}h","message":{"openTime":1584370800000,"open":"4937.43000000","high":"5006.00000000","low":"4917.91000000","close":"4972.22000000","volume":"817.86331000","closeTime":1584374399999,"quoteVolume":"4060250.06674258","trades":7422,"baseAssetVolume":"484.40621700","quoteAssetVolume":"2404511.63890850","macd":50.00217254103427,"sig":-96.264206873922,"adx":20.790110599040272,"diP":23.99818209887909,"diN":22.073495464213103,"k1":80.17,"d1":65.7,"k2":100,"d2":100,"k3":100,"d3":94.71,"k4":100,"d4":100,"k5":86.13,"d5":81.01,"rsi5":59.82,"rsi10":49.37,"rsi14":47.44,"c20":-50.57854584297164,"cc20":-25.17909204889748,"c20State":1,"dAdx":-51.955313882630094,"aoEightState1hr":false,"hrState":"0","s3CrossCount":0,"s2DUnderKCount":1,"stochCrossing":false,"rule1":true,"rule2":false,"rule3":false,"rule4":false,"rule5":false,"rule6":false,"rule7":false,"c20states":"1111","rule8":false,"rule13":false,"rule14":false,"rule15":false,"rule1n1":false,"rule1n2":false,"rule1n3":false,"rule8n1":false,"rule8n2":false,"rule8n3":false,"rule9":false,"rule10":false,"rule11":false,"rule12":true,"signal":true}}`
  //   );
  //   counterB++;
  //   publisher.publish(
  //     'error',
  //     `{"type":"second candle${counterB}h","message":{"openTime":1584370800000,"open":"4937.43000000","high":"5006.00000000","low":"4917.91000000","close":"4972.22000000","volume":"817.86331000","closeTime":1584374399999,"quoteVolume":"4060250.06674258","trades":7422,"baseAssetVolume":"484.40621700","quoteAssetVolume":"2404511.63890850","macd":50.00217254103427,"sig":-96.264206873922,"adx":20.790110599040272,"diP":23.99818209887909,"diN":22.073495464213103,"k1":80.17,"d1":65.7,"k2":100,"d2":100,"k3":100,"d3":94.71,"k4":100,"d4":100,"k5":86.13,"d5":81.01,"rsi5":59.82,"rsi10":49.37,"rsi14":47.44,"c20":-50.57854584297164,"cc20":-25.17909204889748,"c20State":1,"dAdx":-51.955313882630094,"aoEightState1hr":false,"hrState":"0","s3CrossCount":0,"s2DUnderKCount":1,"stochCrossing":false,"rule1":true,"rule2":false,"rule3":false,"rule4":false,"rule5":false,"rule6":false,"rule7":false,"c20states":"1111","rule8":false,"rule13":false,"rule14":false,"rule15":false,"rule1n1":false,"rule1n2":false,"rule1n3":false,"rule8n1":false,"rule8n2":false,"rule8n3":false,"rule9":false,"rule10":false,"rule11":false,"rule12":true,"signal":true}}`
  //   );
  // }, 1000);
});

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
