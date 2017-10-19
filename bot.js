//Global vars
const config = require('./config.js');                              //conifg/auth data
const ver = '0.0.173';
const wfURL = 'http://content.warframe.com/dynamic/worldState.php'; //warframe world state URL
var Discord = require('discord.io');                                //discord API wrapper
var request = require('request');                                   //used to make call to WF worldState
var moment = require('moment');                                     //used for better timekeeping
var fs = require('fs');                                             //used to read helpNotes.txt
var os = require('os');                                             //os info lib built into node
//Eidolon cycle vars
var worldState;
var updateTime;
var dayCycle;
var worldCycle;

//TODO: Add a check for day to night rollover and announce it with a 'happy hunting' message

var bot = new Discord.Client({                                      // Initialize Discord Bot with config.token
    token: config.token,
    autorun: true
});

bot.on('ready', function (evt) {                                    //do some logging and start ensure bot is running
    console.log('Connected to Discord...');
    console.log(`Logged in as: ${bot.username} - (${bot.id})`);
    bot.setPresence({                                               //make the bot 'play' soemthing
        idle_since: null,
        game: { name: 'Debug Mode' }
    });
});

bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.substring(0, 1) == '~') {                           //listen for messages that will start with `^`
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        switch (cmd) {                                              //bot needs to know if it will execute a command
            case 'help':                                            //display the help file
                let helpMsg = fs.readFileSync('./helpNotes.txt');
                bot.sendMessage({
                    to: channelID,
                    message: '```' + helpMsg.toString() + '```'     //the ``` is there so discord treats it as monospace
                });
                break;
            case 'ver':
                bot.sendMessage({
                    to: channelID,
                    message: `Version: ${ver} Running on server: ${os.type()} ${os.hostname()} ${os.platform()} ${os.cpus()[0].model}`
                });
                break;
            case 'time':
                return getTime(channelID);
            case 'cycle':
                return getDayOrNight(channelID)
            // Just add any case commands here -- if you run into random crashes on bad commands, add a defualt handler
        }
    }
});

function getTime(channelIDArg) {
    return getURL(wfURL)
        .then((wfData) => {
            worldState = JSON.parse(wfData);
            updateTime = (new Date()).getTime();
            var message = getDayCycle();
            bot.sendMessage({
                to: channelIDArg,
                message: message
            });
        })

}

function getURL(urlArg) {                                   //call WarFrame world state page wrapped as a promise
    return new Promise((resolve, reject) => {
        request.get(urlArg, function (error, response, body) {
            return resolve(body);
        })
    })
}

function getDayCycle() {
    if (dayCycle) {
        dayCycle = null;
    }
    dayCycle = function () {
        var secondsLeft = getSecondsLeft();
        var cycleSeconds = getCurrentCycleSeconds();
        var duration = moment.duration(secondsLeft * 1000, 'milliseconds');
        duration = moment.duration(duration.asMilliseconds() - 1000, 'milliseconds');
        var titleText = getCurrentTitle();
        var formattedDuration = formatDuration(duration);
        return titleText + formattedDuration;
    }
    return dayCycle();
}

function getCurrentCycleSeconds() {
    var cycleSeconds = Math.floor((new Date()).getTime() / 1000 + 780) % 9000; // One cycle = 2.5 hours = 9000 seconds
    return cycleSeconds;
}

function getCurrentTitle() {
    if (getCurrentCycleSeconds() < 3000) {
        return "Time until day: ";
    }
    return "Time until night: ";
}

function getSecondsLeft() {
    var seconds = getCurrentCycleSeconds();
    if (seconds < 3000) {
        return 3000 - seconds;
    }
    return 9000 - seconds;
}

function formatDuration(duration) {
    var timeText = "";
    if (duration.hours()) {
        if (duration.hours() > 1) { timeText += duration.hours() + " hours "; } else { timeText += duration.hours() + " hour "; }
    }
    if (duration.minutes()) {
        if (duration.minutes() > 1) { timeText += duration.minutes() + " minutes "; } else { timeText += duration.minutes() + " minute "; }
    }
    if (duration.seconds() > 1) { timeText += duration.seconds() + " seconds"; } else { timeText += duration.seconds() + " seconds"; }
    return timeText;
}

function getDayOrNight(channelIDArg) {
    if (getCurrentCycleSeconds() < 3000) {
        return bot.sendMessage({
            to: channelIDArg,
            message: 'It is currently Night on Cetus'
        });
    }
    return bot.sendMessage({
        to: channelIDArg,
        message: 'It is currently Day on Cetus'
    });
}

//not currently used
function dayOrNightBool() {
    if (getCurrentCycleSeconds() < 3000) {
        return true;
    }
    return false;
}
