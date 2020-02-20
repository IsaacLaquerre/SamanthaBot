const Discord = require("discord.js");
const clear = require("clear-console")
const fs = require("fs");
const config = require("./config/botConfig.json");

var bot = new Discord.Client();
var PREFIX = config.prefix;
var rotmgEmote = "<:rotmg:680087018524377187>";
var eyeEmote = "<:rotmgeye:680089603277062149>";

bot.on("ready", () => {
    clear({ toStart: true });
    bot.user.setActivity("rotmg", { type: "PLAYING" });
    console.log("\n--------------------\n|Samantha Bot ready|\n--------------------");
});

bot.commands = new Discord.Collection();

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    var command = require(`./commands/${file}`);
    bot.commands.set(command.help.name, command);;
}


bot.on("error", (err) => {
    return console.log(err);
});
process.on("uncaughtException", (err) => {
    return console.log(err);
});
process.on("unhandledRejection", (err) => {
    return console.log(err);
});

bot.on("message", (message) => {
    if (message.channel.type == "dm" || message.author.bot || message.author.id === "680064324961960061") return;
    if (message.isMentioned(bot.users.get("680064324961960061"))) return message.channel.send("My prefix is `" + PREFIX + "`");
    if (!message.content.startsWith(PREFIX)) return;
    var args = message.content.slice(PREFIX.length).split(" ");

    //switch(args[0].toLowerCase()) {
    //    default:
            var commandFile = bot.commands.get(args[0]);
            if (commandFile) {
                commandFile.run(bot, message, args);
            }
    //    break;
    //}
});


bot.login(config.token)
