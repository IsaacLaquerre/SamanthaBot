const Discord = require("discord.js");
const fetch = require("node-fetch");
const graveScrape = require("graveyard-scrape").scrapeGraveyard;
const config = require("../config/botConfig.json");

var PREFIX = config.prefix;
var rotmgEmote = "<:rotmg:680087018524377187>";
var eyeEmote = "<:rotmgeye:680089603277062149>";

function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function getCharImage(className) {
    var classes = {
        wizard: "https://www.realmeye.com/s/a/img/wiki/Wizard_0.PNG",
        warrior: "https://www.realmeye.com/s/a/img/wiki/Warrior_1.PNG",
        archer: "https://www.realmeye.com/s/a/img/wiki/Archer_0.PNG",
        priest: "https://www.realmeye.com/s/a/img/wiki/Priest_1.PNG",
        rogue: "https://www.realmeye.com/s/a/img/wiki/Rogue.PNG",
        necromancer: "https://www.realmeye.com/s/a/img/wiki/Necromancer.png",
        assassin: "https://www.realmeye.com/s/a/img/wiki/assassin_0.PNG",
        huntress: "https://www.realmeye.com/s/a/img/wiki/Huntress.png",
        knight: "https://www.realmeye.com/s/a/img/wiki/Knight_1.PNG",
        ninja: "https://i.imgur.com/GTQXxyf.png",
        sorcerer: "https://i.imgur.com/2Xrsz6N.png",
        mystic: "https://www.realmeye.com/s/a/img/wiki/Mystic_0.png",
        trickster: "https://www.realmeye.com/s/a/img/wiki/Trickster_0.PNG",
        paladin: "https://www.realmeye.com/s/a/img/wiki/Paladin.PNG",
        samurai: "https://i.imgur.com/eTHe4hH.png"
    };

    for (Classname in classes) {
        if (Classname === className.toLowerCase()) return classes[Classname];
    }
}

function ability2Level(ability) {
    if (ability.level) return ability.level;
    else return "⠀";
}

function padlock(ability) {
    if (!ability.unlocked) return "🔒";
    else return "🔓";
}

function rank2Star(rank) {
    if (rank < 15) return "<:lightbluestar:680133817960628284>";
    else if (rank >= 15 && rank < 30) return "<:bluestar:680133825300660251>";
    else if (rank >= 30 && rank < 45) return "<:redstar:680133931659821057>";
    else if (rank >= 45 && rank < 60) return "<:orangestar:680133939415089206>";
    else if (rank >= 60 && rank < 75) return "<:yellowstar:680133953340047435>";
    else if (rank === 75) return "<:whitestar:680133960793325568>";
}

module.exports.run = async (bot, message, args) => {
    switch(args[1].toLowerCase()) {
        case "user":
        case "u":
            if (!args[2]) return message.channel.send(":x: **No username given**");
            else {
                fetch("http://www.tiffit.net/RealmInfo/api/user?u=" + args[2].toLowerCase()).then(res => res.json()).then(body => {
                    if (body.error) return message.channel.send(":x: **No user matched the query \"" + args[2] + "\"** " + eyeEmote);

                    var name = body.name
                    var fame = body.fame;
                    var accountFame = body.account_fame;
                    var guild = body.guild.replace(/N\/A/g, "Not in a guild");
                    var xp = body.xp;
                    var rank = body.rank;
                    var created = body.created;
                    var lastSeen = body.last_seen;

                    var embed = new Discord.RichEmbed()
                        .setTitle(rotmgEmote + " **RotMG Player Card - " + name + "**")
                        .setColor(0xDA3118)
                        .addField("Rank:", rank2Star(rank) + " " + rank, true)
                        .addField("Exp:", numberWithSpaces(xp), true)
                        .addBlankField(true)
                        .addField("Fame:", numberWithSpaces(fame), true)
                        .addField("Account fame:", numberWithSpaces(accountFame), true)
                        .addBlankField(true)
                        .addField("Guild:", guild, true)
                        .addBlankField(true)
                        .addBlankField(true)
                        .addField("Joined:", created, true)
                        .addField("Last seen:", lastSeen, true)
                        .addBlankField(true)
                    message.channel.send(embed);
                });
            }
        break;
        case "characters":
        case "char":
        case "c":
            if (!args[2]) return message.channel.send(":x: **No username given**");
            else {
                fetch("http://www.tiffit.net/RealmInfo/api/user?u=" + args[2].toLowerCase()).then(res => res.json()).then(body => {
                    if (body.error) return message.channel.send(":x: **No user matched the query \"" + args[2] + "\"** " + eyeEmote);

                    var name = body.name;
                    var characterCount = body.characterCount;
                    var characters = body.characters;

                    if (characters.length <= 0) return message.channel.send(":x: **This user has no characters**");

                    if (args[3]) {
                        if (args[3] < characterCount && !isNaN(args[3])) {
                            var index = args[3];
                            index--;
                        }
                        else var index = 0;
                    }else var index = 0;

                    var embed = new Discord.RichEmbed()
                        .setTitle(rotmgEmote + "** RotMG Player Card - " + name + " (Characters)**")
                        .setColor(0xDA3118)
                        .setThumbnail(getCharImage(characters[index].class.toLowerCase()))
                        .addField("Class:", characters[index].class + " (" + characters[index].level + ")", true)
                        .addField("Class quests:", characters[index].class_quests_completed, true)
                        .addBlankField(true)
                        .addField("Fame:", numberWithSpaces(characters[index].fame), true)
                        .addField("Exp:", numberWithSpaces(characters[index].xp), true)
                        .addBlankField(true)
                        .addField("⠀", "-----   -----", true)
                        .addField("⠀", "EQUIPMENT", true)
                        .addField("⠀", "-----   -----", true)
                        .addField("Weapon:", characters[index].equipment[0], true)
                        .addField("Ability:", characters[index].equipment[1], true)
                        .addField("Armor & Ring:", characters[index].equipment.slice(2).join(", ").replace(/Backpack/g, ""), true)
                        .addField("⠀", "-----   -----", true)
                        .addField("⠀", "STATS (" + characters[index].stats_maxed + ")", true)
                        .addField("⠀", "-----   -----", true)
                        .addField("HP", characters[index].stats.hp, true)
                        .addField("MP", characters[index].stats.mp, true)
                        .addField("ATT", characters[index].stats.attack, true)
                        .addField("DEF", characters[index].stats.defense, true)
                        .addField("SPD", characters[index].stats.speed, true)
                        .addField("VIT", characters[index].stats.vitality, true)
                        .addField("WIS", characters[index].stats.wisdom, true)
                        .addField("DEX", characters[index].stats.dexterity, true)
                        .addBlankField(true)
                        .setFooter("Page " + (index + 1) + "/" + characterCount);
                    message.channel.send(embed).then(messageEmbed => {
                        messageEmbed.react("◀").then(() => {
                            messageEmbed.react("❌").then(() => {
                                messageEmbed.react("▶").then(() => {
                                    var lArrowFilter = (reaction, user) => reaction.emoji.name === "◀" && user.id != bot.user.id;
                                    var xFilter = (reaction, user) => reaction.emoji.name === "❌" && user.id != bot.user.id;
                                    var rArrowFilter = (reaction, user) => reaction.emoji.name === "▶" && user.id != bot.user.id;
                                    var left = messageEmbed.createReactionCollector(lArrowFilter);
                                    var x = messageEmbed.createReactionCollector(xFilter);
                                    var right = messageEmbed.createReactionCollector(rArrowFilter);

                                    left.on("collect", () => {
                                        messageEmbed.clearReactions().then(() => {
                                            messageEmbed.react("◀").then(() => {
                                                messageEmbed.react("❌").then(() => {
                                                    messageEmbed.react("▶");
                                                });
                                            });
                                        });
                                        if (index === 0) index = (characterCount - 1);
                                        else index--;
                                        var Lembed = new Discord.RichEmbed()
                                            .setTitle(rotmgEmote + "** RotMG Player Card - " + name + " (Characters)**")
                                            .setColor(0xDA3118)
                                            .setThumbnail(getCharImage(characters[index].class.toLowerCase()))
                                            .addField("Class:", characters[index].class + " (" + characters[index].level + ")", true)
                                            .addField("Class quests:", characters[index].class_quests_completed, true)
                                            .addBlankField(true)
                                            .addField("Fame:", numberWithSpaces(characters[index].fame), true)
                                            .addField("Exp:", numberWithSpaces(characters[index].xp), true)
                                            .addBlankField(true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("⠀", "EQUIPMENT", true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("Weapon:", characters[index].equipment[0], true)
                                            .addField("Ability:", characters[index].equipment[1], true)
                                            .addField("Armor & Ring:", characters[index].equipment.slice(2).join(", ").replace(/Backpack/g, ""), true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("⠀", "STATS (" + characters[index].stats_maxed + ")", true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("HP", characters[index].stats.hp, true)
                                            .addField("MP", characters[index].stats.mp, true)
                                            .addField("ATT", characters[index].stats.attack, true)
                                            .addField("DEF", characters[index].stats.defense, true)
                                            .addField("SPD", characters[index].stats.speed, true)
                                            .addField("VIT", characters[index].stats.vitality, true)
                                            .addField("WIS", characters[index].stats.wisdom, true)
                                            .addField("DEX", characters[index].stats.dexterity, true)
                                            .addBlankField(true)
                                            .setFooter("Page " + (index + 1) + "/" + characterCount);
                                        messageEmbed.edit(Lembed);
                                    });
                                    x.on("collect", () => {
                                        messageEmbed.clearReactions().then(() => {
                                            messageEmbed.delete().then(() => {
                                                message.delete();
                                            });
                                        });
                                    });
                                    right.on("collect", () => {
                                        messageEmbed.clearReactions().then(() => {
                                            messageEmbed.react("◀").then(() => {
                                                messageEmbed.react("❌").then(() => {
                                                    messageEmbed.react("▶");
                                                });
                                            });
                                        });
                                        if (index === (characterCount - 1)) index = 0;
                                        else index++;
                                        var Rembed = new Discord.RichEmbed()
                                            .setTitle(rotmgEmote + "** RotMG Player Card - " + name + " (Characters)**")
                                            .setColor(0xDA3118)
                                            .setThumbnail(getCharImage(characters[index].class.toLowerCase()))
                                            .addField("Class:", characters[index].class + " (" + characters[index].level + ")", true)
                                            .addField("Class quests:", characters[index].class_quests_completed, true)
                                            .addBlankField(true)
                                            .addField("Fame:", numberWithSpaces(characters[index].fame), true)
                                            .addField("Exp:", numberWithSpaces(characters[index].xp), true)
                                            .addBlankField(true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("⠀", "EQUIPMENT", true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("Weapon:", characters[index].equipment[0], true)
                                            .addField("Ability:", characters[index].equipment[1], true)
                                            .addField("Armor & Ring:", characters[index].equipment.slice(2).join(", ").replace(/Backpack/g, ""), true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("⠀", "STATS (" + characters[index].stats_maxed + ")", true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("HP", characters[index].stats.hp, true)
                                            .addField("MP", characters[index].stats.mp, true)
                                            .addField("ATT", characters[index].stats.attack, true)
                                            .addField("DEF", characters[index].stats.defense, true)
                                            .addField("SPD", characters[index].stats.speed, true)
                                            .addField("VIT", characters[index].stats.vitality, true)
                                            .addField("WIS", characters[index].stats.wisdom, true)
                                            .addField("DEX", characters[index].stats.dexterity, true)
                                            .addBlankField(true)
                                            .setFooter("Page " + (index + 1) + "/" + characterCount);
                                        messageEmbed.edit(Rembed);
                                    });
                                });
                            });
                        });
                    });
                });
            }
        break;
        case "pets":
        case "p":
            if (!args[2]) return message.channel.send(":x: **No username given**");
            else {
                fetch("http://www.tiffit.net/RealmInfo/api/pets-of?u=" + args[2].toLowerCase()).then(res => res.json()).then(body => {
                    if (body.error) return message.channel.send(":x: **No user matched the query \"" + args[2] + "\"** " + eyeEmote);

                    var name = args[2];
                    var petCount = body.number_of_pets;
                    var pets = body.pets;

                    if (pets.length <= 0) return message.channel.send(":x: **This user has no pets**");

                    if (args[3]) {
                        if (args[3] < petCount && !isNaN(args[3])) {
                            var index = args[3];
                            index--;
                        }
                        else var index = 0;
                    }else var index = 0;

                    var embed = new Discord.RichEmbed()
                        .setTitle(rotmgEmote + "** RotMG Player Card - " + name + " (Pets)**")
                        .setColor(0xDA3118)
                        .addField("Name: ", body.pets[index].name, true)
                        .addField("Type: ", body.pets[index].rarity + " " + body.pets[index].family, true)
                        .addBlankField(true)
                        .addField("⠀", "-----   -----", true)
                        .addField("⠀", "ABILITY 1", true)
                        .addField("⠀", "-----   -----", true)
                        .addField("Type: ", body.pets[index].ability1.type, true)
                        .addField("Level: ", ability2Level(body.pets[index].ability1), true)
                        .addField("⠀", padlock(body.pets[index].ability1), true)
                        .addField("⠀", "-----   -----", true)
                        .addField("⠀", "ABILITY 2", true)
                        .addField("⠀", "-----   -----", true)
                        .addField("Type: ", body.pets[index].ability2.type, true)
                        .addField("Level: ", ability2Level(body.pets[index].ability2), true)
                        .addField("⠀", padlock(body.pets[index].ability2), true)
                        .addField("⠀", "-----   -----", true)
                        .addField("⠀", "ABILITY 3", true)
                        .addField("⠀", "-----   -----", true)
                        .addField("Type: ", body.pets[index].ability3.type, true)
                        .addField("Level: ", ability2Level(body.pets[index].ability3), true)
                        .addField("⠀", padlock(body.pets[index].ability3), true)
                        .addBlankField(true)
                        .setFooter("Page " + (index + 1) + "/" + petCount);
                    message.channel.send(embed).then(messageEmbed => {
                        messageEmbed.react("◀").then(() => {
                            messageEmbed.react("❌").then(() => {
                                messageEmbed.react("▶").then(() => {
                                    var lArrowFilter = (reaction, user) => reaction.emoji.name === "◀" && user.id != bot.user.id;
                                    var xFilter = (reaction, user) => reaction.emoji.name === "❌" && user.id != bot.user.id;
                                    var rArrowFilter = (reaction, user) => reaction.emoji.name === "▶" && user.id != bot.user.id;
                                    var left = messageEmbed.createReactionCollector(lArrowFilter);
                                    var x = messageEmbed.createReactionCollector(xFilter);
                                    var right = messageEmbed.createReactionCollector(rArrowFilter);

                                    left.on("collect", () => {
                                        messageEmbed.clearReactions().then(() => {
                                            messageEmbed.react("◀").then(() => {
                                                messageEmbed.react("❌").then(() => {
                                                    messageEmbed.react("▶");
                                                });
                                            });
                                        });
                                        if (index === 0) index = (petCount - 1);
                                        else index--;
                                        var Lembed = new Discord.RichEmbed()
                                            .setTitle(rotmgEmote + "** RotMG Player Card - " + name + " (Pets)**")
                                            .setColor(0xDA3118)
                                            .addField("Name: ", body.pets[index].name, true)
                                            .addField("Type: ", body.pets[index].rarity + " " + body.pets[index].family, true)
                                            .addBlankField(true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("⠀", "ABILITY 1", true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("Type: ", body.pets[index].ability1.type, true)
                                            .addField("Level: ", ability2Level(body.pets[index].ability1), true)
                                            .addField("⠀", padlock(body.pets[index].ability1), true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("⠀", "ABILITY 2", true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("Type: ", body.pets[index].ability2.type, true)
                                            .addField("Level: ", ability2Level(body.pets[index].ability2), true)
                                            .addField("⠀", padlock(body.pets[index].ability2), true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("⠀", "ABILITY 3", true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("Type: ", body.pets[index].ability3.type, true)
                                            .addField("Level: ", ability2Level(body.pets[index].ability3), true)
                                            .addField("⠀", padlock(body.pets[index].ability3), true)
                                            .addBlankField(true)
                                            .setFooter("Page " + (index + 1) + "/" + petCount);
                                        messageEmbed.edit(Lembed);
                                    });
                                    x.on("collect", () => {
                                        messageEmbed.clearReactions().then(() => {
                                            messageEmbed.delete().then(() => {
                                                message.delete();
                                            });
                                        });
                                    });
                                    right.on("collect", () => {
                                        messageEmbed.clearReactions().then(() => {
                                            messageEmbed.react("◀").then(() => {
                                                messageEmbed.react("❌").then(() => {
                                                    messageEmbed.react("▶");
                                                });
                                            });
                                        });
                                        if (index === (petCount - 1)) index = 0;
                                        else index++;
                                        var Rembed = new Discord.RichEmbed()
                                            .setTitle(rotmgEmote + "** RotMG Player Card - " + name + " (Pets)**")
                                            .setColor(0xDA3118)
                                            .addField("Name: ", body.pets[index].name, true)
                                            .addField("Type: ", body.pets[index].rarity + " " + body.pets[index].family, true)
                                            .addBlankField(true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("⠀", "ABILITY 1", true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("Type: ", body.pets[index].ability1.type, true)
                                            .addField("Level: ", ability2Level(body.pets[index].ability1), true)
                                            .addField("⠀", padlock(body.pets[index].ability1), true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("⠀", "ABILITY 2", true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("Type: ", body.pets[index].ability2.type, true)
                                            .addField("Level: ", ability2Level(body.pets[index].ability2), true)
                                            .addField("⠀", padlock(body.pets[index].ability2), true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("⠀", "ABILITY 3", true)
                                            .addField("⠀", "-----   -----", true)
                                            .addField("Type: ", body.pets[index].ability3.type, true)
                                            .addField("Level: ", ability2Level(body.pets[index].ability3), true)
                                            .addField("⠀", padlock(body.pets[index].ability3), true)
                                            .addBlankField(true)
                                            .setFooter("Page " + (index + 1) + "/" + petCount);
                                        messageEmbed.edit(Rembed);
                                    });
                                });
                            });
                        });
                    });
                });
            }
        break;
        case "graveyard":
        case "gy":
            if (!args[2]) return message.channel.send(":x: **No username given**");
            else {
                graveScrape(args[2].toLowerCase(), 5).then(graveYard => {

                    if (args[3]) {
                        if (args[3] < graveYard.length && !isNaN(args[3])) {
                            var index = args[3];
                            index--;
                        }
                        else var index = 0;
                    }else var index = 0;

                    var date = graveYard[index].death_date;
                    var className = graveYard[index].class;
                    var level = graveYard[index].level;
                    var fame = graveYard[index].total_fame;
                    var xp = graveYard[index].experience;
                    var stats = graveYard[index].death_stats;
                    var killedBy = graveYard[index].killed_by;
                    var name = args[2];

                    var embed = new Discord.RichEmbed()
                        .setTitle(rotmgEmote + "** RotMG Player Card - " + name + " (Graveyard)**")
                        .setColor(0xDA3118)
                        .setThumbnail(getCharImage(className))
                        .addField("Class:", className + " (level " + level + ") - " + stats, true)
                        .addBlankField(true)
                        .addBlankField(true)
                        .addField("Fame:", numberWithSpaces(fame), true)
                        .addField("Exp:", numberWithSpaces(xp), true)
                        .addBlankField(true)
                        .addField("Killed by:", killedBy, true)
                        .addField("On:", date, true)
                        .addBlankField(true)
                        .setFooter("Page " + (index + 1) + "/" + graveYard.length);
                    message.channel.send(embed).then(messageEmbed => {
                        messageEmbed.react("◀").then(() => {
                            messageEmbed.react("❌").then(() => {
                                messageEmbed.react("▶").then(() => {
                                    var lArrowFilter = (reaction, user) => reaction.emoji.name === "◀" && user.id != bot.user.id;
                                    var xFilter = (reaction, user) => reaction.emoji.name === "❌" && user.id != bot.user.id;
                                    var rArrowFilter = (reaction, user) => reaction.emoji.name === "▶" && user.id != bot.user.id;
                                    var left = messageEmbed.createReactionCollector(lArrowFilter);
                                    var x = messageEmbed.createReactionCollector(xFilter);
                                    var right = messageEmbed.createReactionCollector(rArrowFilter);

                                    left.on("collect", () => {
                                        messageEmbed.clearReactions().then(() => {
                                            messageEmbed.react("◀").then(() => {
                                                messageEmbed.react("❌").then(() => {
                                                    messageEmbed.react("▶");
                                                });
                                            });
                                        });
                                        if (index === 0) index = (graveYard.length - 1);
                                        else index--;

                                        var date = graveYard[index].death_date;
                                        var className = graveYard[index].class;
                                        var level = graveYard[index].level;
                                        var fame = graveYard[index].total_fame;
                                        var xp = graveYard[index].experience;
                                        var stats = graveYard[index].death_stats;
                                        var killedBy = graveYard[index].killed_by;

                                        var Lembed = new Discord.RichEmbed()
                                            .setTitle(rotmgEmote + "** RotMG Player Card - " + name + " (Graveyard)**")
                                            .setColor(0xDA3118)
                                            .setThumbnail(getCharImage(className))
                                            .addField("Class:", className + " (level " + level + ") - " + stats, true)
                                            .addBlankField(true)
                                            .addBlankField(true)
                                            .addField("Fame:", numberWithSpaces(fame), true)
                                            .addField("Exp:", numberWithSpaces(xp), true)
                                            .addBlankField(true)
                                            .addField("Killed by:", killedBy, true)
                                            .addField("On:", date, true)
                                            .addBlankField(true)
                                            .setFooter("Page " + (index + 1) + "/" + graveYard.length);
                                        messageEmbed.edit(Lembed);
                                    });
                                    x.on("collect", () => {
                                        messageEmbed.clearReactions().then(() => {
                                            messageEmbed.delete().then(() => {
                                                message.delete();
                                            });
                                        });
                                    });
                                    right.on("collect", () => {
                                        messageEmbed.clearReactions().then(() => {
                                            messageEmbed.react("◀").then(() => {
                                                messageEmbed.react("❌").then(() => {
                                                    messageEmbed.react("▶");
                                                });
                                            });
                                        });
                                        if (index === (graveYard.length - 1)) index = 0;
                                        else index++;

                                        var date = graveYard[index].death_date;
                                        var className = graveYard[index].class;
                                        var level = graveYard[index].level;
                                        var fame = graveYard[index].total_fame;
                                        var xp = graveYard[index].experience;
                                        var stats = graveYard[index].death_stats;
                                        var killedBy = graveYard[index].killed_by;

                                        var Rembed = new Discord.RichEmbed()
                                            .setTitle(rotmgEmote + "** RotMG Player Card - " + name + " (Graveyard)**")
                                            .setColor(0xDA3118)
                                            .setThumbnail(getCharImage(className))
                                            .addField("Class:", className + " (level " + level + ") - " + stats, true)
                                            .addBlankField(true)
                                            .addBlankField(true)
                                            .addField("Fame:", numberWithSpaces(fame), true)
                                            .addField("Exp:", numberWithSpaces(xp), true)
                                            .addBlankField(true)
                                            .addField("Killed by:", killedBy, true)
                                            .addField("On:", date, true)
                                            .addBlankField(true)
                                            .setFooter("Page " + (index + 1) + "/" + graveYard.length);
                                        messageEmbed.edit(Rembed);
                                    });
                                });
                            });
                        });
                    });
                }).catch(err => {
                    if (err) message.channel.send(":x: **Error:\n" + err.message + "**");
                });
            }
        break;
    }
};

module.exports.help = {
    name: "realmeye",
    description: "Fetch information about a player on the RealmEye website",
    usage: PREFIX + "realmeye <user/characters/pets/graveyard> <username>"
};
