const Discord = require("discord.js");
const config = require("../config/botConfig.json");

var PREFIX = config.prefix;
var rotmgEmote = "<:rotmg:680087018524377187>";
var eyeEmote = "<:rotmgeye:680089603277062149>";

module.exports.run = (bot, message, args) => {
    var embed = new Discord.RichEmbed()
        .setTitle("**Samantha Bot Help - Command list**")
        .setColor(0x000000)
        .setDescription("Legend: <required argument>, [optional argument]");
    bot.commands.forEach(command => {
        embed.addField(command.help.name + " - " + command.help.usage, command.help.description);
    });
    message.channel.send(embed);
};

module.exports.help = {
    name: "help",
    description: "List of commands",
    usage: PREFIX + "help [command]"
}