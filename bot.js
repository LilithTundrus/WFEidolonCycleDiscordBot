var Discord = require('discord.io');                                //discord API wrapper
var logger = require('winston');                                    //logging -- is this needed?
const config = require('./config.js');                              //conifg/auth data
var fs = require('fs');
var os = require('os');                                             //os info lib built into node
const ver = '0.0.02';
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';


var bot = new Discord.Client({                                      // Initialize Discord Bot
    token: config.token,
    autorun: true
});

bot.on('ready', function (evt) {                                    //do some logging and start the WF data check interval
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    bot.setPresence({                                               //make the bot 'play' soemthing
        idle_since: null,
        game: { name: 'Debug Mode' }
    });
    //setInterval(function () {
    //assembleAlertsAlt();
    //}, 600 * 1000);                                               //10 minutes
});


bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.substring(0, 1) == '~') {                           //listen for messages that will start with `^`
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        switch (cmd) {                                              //bot needs to know if it will execute a command
            case 'panic':                                           //replaces standard bot 'ping' as a test
                bot.sendMessage({
                    to: channelID,
                    message: `**PANICKING**`
                });
                break;
            case 'help':                                            //display the help file (which is configurable)
                let helpMsg = fs.readFileSync('./helpNotes.txt');
                bot.sendMessage({
                    to: channelID,
                    message: '```' + helpMsg.toString() + '```'
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
            default:
                // Do nothing
                break;
            // Just add any case commands here
        }
    }
});

function getTime(channelIDArg) {
    bot.sendMessage({
        to: channelIDArg,
        message: `To: ${channelIDArg} the time is ${new Date().toISOString()}`
    });
}