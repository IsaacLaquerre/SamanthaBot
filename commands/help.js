const Discord = require("discord.js");
const config = require("../config/botConfig.json");

var PREFIX = config.prefix;
var rotmgEmote = "<:rotmg:680087018524377187>";
var eyeEmote = "<:rotmgeye:680089603277062149>";

module.exports.run = (bot, message, args) => {
    if (args[1]) {
        let command = bot.commands.get(args[1].toLowerCase())
        if (command) var commandName = "- " + PREFIX + command.help.name;
        else var commandName = "- Command list";
    }
    else var commandName = "- Command list";
    var embed = new Discord.RichEmbed()
        .setTitle("**Samantha Bot Help " + commandName +  "**")
        .setColor(0x000000)
        .setDescription("Legend: <required argument>, [optional argument]");
    if (args[1]) {
        if (isNaN(args[1])) {
            var command = bot.commands.get(args[1].toLowerCase())
            if (command) {
                embed.addField(PREFIX + command.help.name, command.help.description);
                embed.addField("Usage: ", command.help.usage);
            }
            else {
                bot.commands.forEach(command => {
                    embed.addField(PREFIX + command.help.name, command.help.description);
                });
            }
        }else {
            bot.commands.forEach(command => {
                embed.addField(PREFIX + command.help.name, command.help.description);
            });
        }
    }else {
        bot.commands.forEach(command => {
            embed.addField(PREFIX + command.help.name, command.help.description);
        });
    }
    if (!args[2]) message.channel.send(embed);
    else {
        if (args[1].toLowerCase() === "realmeye") {
            switch(args[2].toLowerCase()) {
                case "user":
                case "u":
                    var embed = new Discord.RichEmbed()
                        .setTitle("**Samantha Bot Help - " + PREFIX + "realmeye user**")
                        .setColor(0x000000)
                        .setDescription("Legend: <required argument>, [optional argument]")
                        .addField(PREFIX + "realmeye user", "Information on a player displayed in an embed")
                        .addField("Usage:", PREFIX + "realmeye user <username>")
                    message.channel.send(embed);
                break;
                case "characters":
                case "char":
                case "c":
                    var embed = new Discord.RichEmbed()
                        .setTitle("**Samantha Bot Help - " + PREFIX + "realmeye characters**")
                        .setColor(0x000000)
                        .setDescription("Legend: <required argument>, [optional argument]")
                        .addField(PREFIX + "realmeye characters", "Information on a player's alive characters displayed in an embed")
                        .addField("Usage:", PREFIX + "realmeye characters <username>")
                    message.channel.send(embed);
                break;
                case "pets":
                case "p":
                    var embed = new Discord.RichEmbed()
                        .setTitle("**Samantha Bot Help - " + PREFIX + "realmeye pets**")
                        .setColor(0x000000)
                        .setDescription("Legend: <required argument>, [optional argument]")
                        .addField(PREFIX + "realmeye pets", "Information on a player's pets displayed in an embed")
                        .addField("Usage:", PREFIX + "realmeye pets <username>")
                    message.channel.send(embed);
                break;
                case "graveyard":
                case "gy":
                    var embed = new Discord.RichEmbed()
                        .setTitle("**Samantha Bot Help - " + PREFIX + "realmeye graveyard**")
                        .setColor(0x000000)
                        .setDescription("Legend: <required argument>, [optional argument]")
                        .addField(PREFIX + "realmeye graveyard", "Information on a player's last 5 graveyard entries displayed in an embed")
                        .addField("Usage:", PREFIX + "realmeye graveyard <username>")
                    message.channel.send(embed);
                break;
                case "wiki":
                case "w":
                    var embed = new Discord.RichEmbed()
                        .setTitle("**Samantha Bot Help - " + PREFIX + "realmeye wiki**")
                        .setColor(0x000000)
                        .setDescription("Legend: <required argument>, [optional argument]")
                        .addField(PREFIX + "realmeye wiki", "Information on a about the provided item/boss/dungeon from the RealmEye Wiki")
                        .addField("Usage:", PREFIX + "realmeye wiki <query>")
                    message.channel.send(embed);
                break;
                default:
                break;
            }
        }
    }
};

module.exports.help = {
    name: "help",
    description: "List of commands",
    usage: PREFIX + "help [command]"
}