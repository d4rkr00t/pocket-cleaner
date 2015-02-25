var superagent = require('superagent'),
    co = require('co'),
    chalk = require('chalk'),
    moment = require('moment'),

    keys = require('./config').keys,
    maxDays = require('./config').maxDays;

var _removeEntry = function (keys, id) {
    var url = 'http://getpocket.com/v3/send?actions=[{' +
            '"action":"delete",' +
            '"time":' + (Date.now() / 1000) + ',' +
            '"item_id":' + id +
        '}]&access_token=' + keys.access_token +
        '&consumer_key=' + keys.consumer_key;

    superagent.get(url)
        .send()
        .end(function (res) {
            if (!res.body.action_results[0]) {
                console.error(res);
            }
        });
};

var _getEntries = function (keys) {
    return new Promise(function (resolve) {
        superagent.post('http://getpocket.com/v3/get')
            .send({
                consumer_key: keys.consumer_key,
                access_token: keys.access_token,
                detailType: 'complete',
                state: 'all'
            })
            .end(function (err, data) {
                resolve(JSON.parse(data.text).list);
            });
    });
};

var _dateDiff = function (timeAdded) {
    return moment().diff(timeAdded, 'days');
};

var _currentTimeMsg = function () {
    return  chalk.grey('[') +
                chalk.blue(moment().format('HH:mm:ss')) +
            chalk.grey(']') + ' ';
};

var _startMsg = function () {
    console.log('');
    console.log(
        _currentTimeMsg() +
        chalk.yellow('Cleaning started')
    );
    console.log('');
};

var _endMsg = function (deletedCount) {
    console.log('');
    console.log(
        _currentTimeMsg() +
        chalk.grey('Cleaning finished. ') +
        chalk.yellow('Total deleted: ') +
        chalk.green('[') +
            chalk.green(deletedCount) +
        chalk.green(']')
    );
};

var deleteEntryMsg = function (entry, timeAdded) {
    var ago = moment(timeAdded).from(moment());

    console.log(
        _currentTimeMsg() +
        chalk.magenta('(deleted)') + ' ' +
        chalk.cyan(entry.given_title || entry.resolved_title)  + ' ' +
        chalk.grey('—') + ' ' +
        chalk.green('was added') +
        chalk.green('[') +
            chalk.green(ago) +
        chalk.green(']')
    );
};

var cleaner = co.wrap(function* (keys, maxDays) {
    _startMsg();

    var entries = yield _getEntries(keys),
        deletedCount = 0;

    Object.keys(entries).forEach(function (key) {
        var entry = entries[key],
            timeAdded = parseInt(entry.time_added, 10) * 1000,
            diff = _dateDiff(timeAdded);

        // maxDays
        if (diff >= maxDays) {
            deletedCount++;
            deleteEntryMsg(entry, timeAdded);
            _removeEntry(keys, entry.item_id);
        }
    });

    _endMsg(deletedCount);
});

cleaner(keys, maxDays);
