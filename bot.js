'use strict';

// Config file that has the private variables needed
const config = require('./config.js');
const ver = '2.0.0';

// This is 
let parser = require('./wfTimeParseNew');


// Node requires
var fs = require('fs');
var os = require('os');

// Initialize the Discord bot using discord.js
const Discord = require('discord.js');
const client = new Discord.Client();

client.login(config.token);

client.on('ready', () => {
    console.log(`Connected to Discord.\nLogged in as ${client.user.username} (${client.user.id})`);

    client.user.setActivity(`Warframe (Cetus - Level 10-30)`);
});


bot.on('message', function(user, userID, channelID, message, evt) {
    if (message.substring(0, 1) == '~') {                           // listen for messages that will start with `~`
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        // log any messages sent to the bot for debugging
        fs.appendFileSync('discordMessagelog.log', `${user} sent: ${message} at ${Date.now()}`);
        console.log(`${user} sent: ${message} at ${Date.now()}`);
        args = args.splice(1);
        switch (cmd) {                                              // bot needs to know if it will execute a command
            case 'help':                                            // display the help file
                let helpMsg = fs.readFileSync('./helpNotes.txt');
                bot.sendMessage({
                    to: channelID,
                    message: '```' + helpMsg.toString() + '```'     // the ``` is there so discord treats it as monospace
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
        }
    }
});

// This will send the message after the parser creates the string
function getTime(channelIDArg) {
    parser.updateTime()
        .then((response) => {
            bot.sendMessage({
                to: channelIDArg,
                message: response
            });
        })

}