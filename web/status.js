var COLOR_SUCCESS_BACKGROUND = Color.fromHex('#00AA00');
var COLOR_SUCCESS_BORDER = Color.fromHex('#006600');

var COLOR_WARNING_BACKGROUND = Color.fromHex('#CCCC00');
var COLOR_WARNING_BORDER = Color.fromHex('#999900');

var versions = [
    'php53',
    'php54',
    'php55',
    'php56',
    'php70',
    'php71',
    'php72'
];

var statuses = {};

function updateStatus(status, json, err) {
    var $badge = status.badge;
    var $text = status.text;

    $badge.removeClass('pending');

    if (err) {
        $badge.addClass('error').attr('title', err.toString());
        $text.text('Error: ' + err.status);
        return;
    }

    $badge.addClass('success');

    var v = (json['active processes'] - 1) / (json['total processes'] - 1);
    var background = COLOR_SUCCESS_BACKGROUND.tween(COLOR_WARNING_BACKGROUND, v);
    var border = COLOR_SUCCESS_BORDER.tween(COLOR_WARNING_BORDER, v);
    $badge.css({
        'background-color': background.toHex(),
        'border-color': border.toHex()
    });

    $text.text(json['active processes'] + '/' + json['total processes']);
}

function formatVersion(version) {
    return version.substr(0, 3).toUpperCase() + ' ' +
        version.substr(3, 1) + '.' +
        version.substr(4, 1);
}

function createStatus(version) {
    var $status = $('<div />').addClass('status');
    var $title = $('<h2 />').text(formatVersion(version));
    var $badge = $('<div />').addClass('status-badge pending');
    var $text = $('<div />').addClass('status-text').text('Pending…');

    $status.append($title);
    $status.append($badge);
    $status.append($text);

    $('#container').append($status);

    var status = {
        badge: $badge,
        text: $text
    };

    statuses[version] = status;
}

function fetchVersion(version, idx) {
    var status = statuses[version];
    setTimeout(function () {
        status.badge.css({
            'background-color': '',
            'border-color': ''
        });
        status.badge.removeClass('success error').addClass('pending');
        status.text.text('Pending…');
    }, Math.random() * 500);

    var url = '/status-' + version + '?full&json';
    $.getJSON(url)
        .done(function (json) {
            setTimeout(function () {
                status.badge.one('animationiteration webkitAnimationIteration MSAnimationIteration', function () {
                    updateStatus(status, json);
                });
            }, 750 + Math.random() * 500);
        })
        .fail(function (e) {
            setTimeout(function () {
                updateStatus(status, null, e);
            }, 750 + Math.random() * 500);
        });
}


function update() {
    versions.forEach(fetchVersion);
}

var nextUpdate;
function tick() {
    var now = Date.now();

    if (!nextUpdate || now >= nextUpdate) {
        nextUpdate = now + 60000;
        update();
    }

    $('#countdown').text('Next update: ' + ((nextUpdate - now) / 1000).toFixed() + 's');
}

$(function () {
    versions.forEach(createStatus);
    setInterval(tick, 1000);
});
