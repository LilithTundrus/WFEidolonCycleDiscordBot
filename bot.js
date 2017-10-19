const Discord = require('discord.io');                              //discord API wrapper
const config = require('./config.js');                              //conifg/auth data
var fs = require('fs');
var os = require('os');                                             //os info lib built into node
var bot = new Discord.Client({                                      // Initialize Discord Bot
    token: config.toke,
    autorun: true
});

bot.on('ready', function (evt) {                                    //do some logging and start the WF data check interval
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    bot.setPresence({                                               //make the bot 'play' soemthing
        idle_since: null,
        game: { name: 'Debug Mode' }
    })
    //setInterval(function () {
        //assembleAlertsAlt();
    //}, 600 * 1000);                                               //10 minutes
});


bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.substring(0, 1) == '$') {                   //listen for messages that will start with `!`
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        switch (cmd) {                                      //bot needs to know if it will execute a command
            case 'give':
                bot.sendMessage({
                    to: channelID,
                    message: `thank you for the ${message.substring(6)}`
                });
                break;
            case 'panic':                                   //replaces standard bot 'ping' as a test
                bot.sendMessage({
                    to: channelID,
                    message: `**PANICKING**`
                });
                break;
            case 'help':                                    //display the help file (which is configurable)
                let helpMsg = fs.readFileSync('./helpNotes.txt');
                bot.sendMessage({
                    to: channelID,
                    message: '```' + helpMsg.toString() + '```'
                });
                break;
            case '!EmgStop':                                //stops the bot if user is Lilith Tundrus
                if (user == config.adminUser) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'SHUTTING DOWN AAAAAAAAA'
                    });
                    console.log('Emergency shutdown activated...')
                    setTimeout(function () {                //used for giving the bot time to send message before exiting
                        process.exit(0);
                    }, 2 * 1000);
                } else {
                    bot.sendMessage({
                        to: channelID,
                        message: 'Not authorized, user will be logged'
                    });
                    var errDate = new Date;
                    fs.appendFileSync('authErrors.log', `${user} attempted to stop the bot at ${errDate}\n`);
                }
                break;
            case 'ver':
                bot.sendMessage({
                    to: channelID,
                    message: `Version: ${ver} Running on server: ${os.type()} ${os.hostname()} ${os.platform()} ${os.cpus()[0].model}`
                });
                break;
            default:
                break;
            // Just add any case commands here
        }
    }
});