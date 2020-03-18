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
var clusterize;
var filterIsOn = false;

var data = [];
var filteredData = [];
var rawConditionValue = '';

$(document).ready(function() {
    clusterize = new Clusterize({
        rows: filteredData,
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
            data.push(obj);

            if (filterIsOn && !isCorrectObject(obj)) {
                return;
            }

            clusterize.append([
                `<div><pre>${syntaxHighlight(
                    JSON.stringify(obj, null, 4)
                )}</pre></div>`
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

    $('#filter-button').click(function() {
        rawConditionValue = $('#filter-box').val();
        var filteredObj = filterData(getRowCondition(), data);
        filteredObj = filteredObj.map((item) => {
            return `<div><pre>${syntaxHighlight(
                JSON.stringify(item, null, 4)
            )}</pre></div>`;
        });
        clusterize.clear();
        clusterize.append(filteredObj);
        filterIsOn = true;
    });

    // 2.) listen for a message from the parent (paremt-main.html)

    publish();
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
            `{"id":${counterA}, "count" : ${
                counterA % 2 === 0 ? 1 : 2
            }, "size" : "one"}`
        );
    }, 1000);
}

function filterData(rawCondition, data) {
    var splittedRawCondition = rawCondition.split('\n');
    var conditionsArray = splittedRawCondition.map((item) => {
        return {
            condition: item,
            key: item.split(' => ')[0]
        };
    });

    var conditions = {};

    conditionsArray.forEach((item) => {
        conditions[item.key] = eval(item.condition);
    });

    const filtered = filterArray(data, conditions);

    return filtered;
}

function filterArray(array, filters) {
    const filterKeys = Object.keys(filters);
    return array.filter((item) => {
        // validates all filter criteria
        return filterKeys.every((key) => {
            // ignores non-function predicates
            if (typeof filters[key] !== 'function') return true;
            return filters[key](item[key]);
        });
    });
}

function isCorrectObject(object) {
    const arrayObj = [object];
    console.log(arrayObj);

    const filtered = filterData(getRowCondition(), arrayObj);
    return filtered.length > 0;
}

function getRowCondition() {
    return rawConditionValue;
}
