const UPDATE_INTERVAL = 60000;

const COLOR_SUCCESS_BACKGROUND = Color.fromHex('#00AA00');
const COLOR_SUCCESS_BORDER = Color.fromHex('#006600');

const COLOR_WARNING_BACKGROUND = Color.fromHex('#CCCC00');
const COLOR_WARNING_BORDER = Color.fromHex('#999900');

const STATE = {
    IDLE: 0,
    UPDATING: 1,
    WAITING: 2
};

let $container;
let $countdown;

let currentState = STATE.IDLE;

let versions = [
    'php53',
    'php54',
    'php55',
    'php56',
    'php70',
    'php71',
    'php72'
];

let statuses = {};
let nextUpdate;

function updateStatus(status, json, err) {
    let $badge = status.badge;
    let $text = status.text;

    $badge.removeClass('status__badge--pending status__badge--success status__badge--error');

    if (!json && !err) {
        $badge.addClass('status__badge--pending');
        $text.text('Pending…');
        return;
    }

    if (err) {
        $badge.addClass('status__badge--error').attr('title', err.toString());
        $text.text('Error: ' + err.status);
        return;
    }

    $badge.addClass('status__badge--success');

    let v = (json['active processes'] - 1) / (json['total processes'] - 1);
    let background = COLOR_SUCCESS_BACKGROUND.tween(COLOR_WARNING_BACKGROUND, v);
    let border = COLOR_SUCCESS_BORDER.tween(COLOR_WARNING_BORDER, v);
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
    let $status = $('<div />').addClass('status');
    let $title = $('<h2 />').addClass('status__version').text(formatVersion(version));
    let $badge = $('<div />').addClass('status__badge status__badge--pending');
    let $text = $('<div />').addClass('status__text').text('Pending…');

    $status.append($title);
    $status.append($badge);
    $status.append($text);

    $container.append($status);

    let status = {
        badge: $badge,
        text: $text
    };

    statuses[version] = status;
}

function fetchVersion(version, idx) {
    let status = statuses[version];

    status.badge.css({
        'background-color': '',
        'border-color': ''
    });
    updateStatus(status);

    let url = '/status-' + version + '?full&json';
    return new Promise((resolve, reject) => {
        $.getJSON(url)
            .done((json) => {
                status.badge.one('animationiteration webkitAnimationIteration MSAnimationIteration', () => {
                    updateStatus(status, json);
                });
                resolve();
            })
            .fail((e) => {
                updateStatus(status, null, e);
                reject();
            });
    });
}


function update() {
    currentState = STATE.UPDATING;

    let finished = () => {
        currentState = STATE.WAITING;
        nextUpdate = Date.now() + UPDATE_INTERVAL;
    };

    return Promise.all(versions.map(fetchVersion))
        .then(finished)
        .catch(finished);
}

function tick() {
    let now = Date.now();

    if (currentState === STATE.IDLE || (currentState === STATE.WAITING && now >= nextUpdate)) {
        update();
    }

    if (currentState === STATE.UPDATING) {
        $countdown.text('Updating…');
    } else {
        $countdown.text('Next update: ' + ((nextUpdate - now) / 1000).toFixed() + 's');
    }
}

$(() => {
    $container = $('.container');
    $countdown = $('.countdown');

    versions.forEach(createStatus);
    setInterval(tick, 1000);
    tick();
});
