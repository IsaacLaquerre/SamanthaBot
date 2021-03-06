const Discord = require("discord.js");
const fetch = require("node-fetch");
const graveScrape = require("graveyard-scrape").scrapeGraveyard;
const request = require("request");
const cheerio = require("cheerio");
const config = require("../config/botConfig.json");

var PREFIX = config.prefix;
var rotmgEmote = "<:rotmg:680087018524377187>";
var eyeEmote = "<:rotmgeye:680089603277062149>";



function requestItems() {
    return new Promise(function(resolve, reject) {
        request({
            url: "https://www.realmeye.com/s/dw/js/definition.js",
            headers: {
                "user-agent": config.USER_AGENT
            }
        }, (err, res, body) => {
            if (!err) {
                if (res.statusCode === 200) {
                    item = body.replace("items=", "").replace(/;/g, "").replace(/e3/g, "0000");
                    item = item.replace(/-?\d+:/g, function(n) {
                        if (item[item.indexOf(n) - 1] === "\"") return n.replace(/:/g, "");
                        return "\"" + n.replace(/:/g, "") + "\":";
                    });
                    resolve(JSON.parse(item));
                }else reject("Error: " + res.statusCode);
            }else reject(err);
        });
    });
}

function wiki(result, message, bot, args) {
    url = "https://www.realmeye.com" + result;
    request({
        url: url,
        headers: {
            "user-agent": config.USER_AGENT
        }
    }, (err, res, body) => {
        if (!err && res.statusCode === 200) {
            var $ = cheerio.load(body);
            var image = "https:" + $("#d > div > img").attr("src");
            if (image) image.replace(/ /g, "%20");
            if (image === "https:undefined") image = "https:" + $(".row > div > div > div > table > tbody > tr > td > img").attr("src");
            if (image === "https:undefined") image = "https://brandslogo.net/wp-content/themes/logolove/images/not-available.jpg";
            image = image.replace(/ /g, "%20");
            var name = $(".row > div > h1").text();

            var description = [];
            description.push($(".table-responsive > table > tbody").text());

            var info = description.join("\n").split("\n").filter(function(el) {
                return el.replace(/ /g, "") != '' && el != null && el != '' && el != ' ' && !el.includes("Equip") && !el.includes("+") && !el.includes("On Self");
            });

            if (!info[0] || info[0] == undefined) return message.channel.send(":x: **Couldn't get information on this item. Feel free to visit the link yourself; https://www.realmeye.com" + result + "** " + eyeEmote);

            var pageDesc = info[0].split(".")[0];

            var tier = info[info.indexOf("Tier") + 1];
            var shots = info[info.indexOf("Shots") + 1];
            var damage = info[info.indexOf("Damage") + 1];
            var speed = info[info.indexOf("Projectile Speed") + 1];
            var range = info[info.indexOf("Range") + 1];
            var fameBonus = info[info.indexOf("Fame Bonus") + 1];
            var feedPower = info[info.indexOf("Feed Power") + 1];
            if (info.indexOf("Soulbound") > -1) {
                var soulbound = "Yes";
            } else {
                soulbound = "No";
            }

            if (info.indexOf("Rate of Fire") > -1) var rateOfFire = info[info.indexOf("Rate of Fire") + 1];
            else rateOfFire = "100%";

            if (info.indexOf("Fame Bonus") < 0) fameBonus = "0%";

            if (info.indexOf("Shots") < 0 && info.indexOf("Tier") > -1) {

                var tdRaw = [];
                tier = [];
                $(".table-responsive > table > tbody > tr").each(function(i, elem) {
                    if ($("th", elem).text() === "On Equip") tdRaw.push($("td", elem).text());
                    tier.push($("th", elem).text());
                });

                if (tier.length != 0) {
                    tier = tier.filter(el => el.includes("Tier") && el != "");
                    tier = tier[0].replace("Tier", "");
                }

                pageDesc = info[0];
                var mpCost = info[info.indexOf("MP Cost") + 1];
                var onEquip = tdRaw[0];
                var effects = [];
                var duration = info[info.indexOf("Duration") + 1];
                range = info[info.indexOf("Range") + 1];
                var cooldown = info[info.indexOf("Cooldown") + 1];
                fameBonus = info[info.indexOf("Fame Bonus") + 1];
                feedPower = info[info.indexOf("Feed Power") + 1];
                if (info.indexOf("Soulbound") > -1) {
                    soulbound = "Yes";
                } else {
                    soulbound = "No";
                }

                if (tdRaw.length === 0) onEquip = "No effect";
                if (info.indexOf("Fame Bonus") < 0) fameBonus = "0%";

                var lootBag = [];

                $(".img-responsive").each(function(i, elem) {
                    if (!$(this).attr("alt")) return;
                    if ($(this).attr("alt").includes("Assigned to")) lootBag.push($(this).attr("alt").replace("Assigned to", ""));
                });

                if (lootBag.length === 0) var lootBagEmote = "No loot bag";
                else var lootBagEmote = "<:" + lootBag[0].replace(/ /g, "").toLowerCase() + ":" + bot.emojis.find(emoji => emoji.name === lootBag[0].replace(/ /g, "").toLowerCase()).id + "> " + lootBag[0];

                for (var i = 0; i != info.length; i++) {
                    if (info[i].includes("On ")) effects.push(info[i]);
                }

                if (effects.length === 0) effects.push("Nothing");

                if (info.indexOf("Duration") > -1) {
                    var wikiEmbed = new Discord.RichEmbed()
                        .setTitle("**" + name + "**")
                        .setURL("https://www.realmeye.com" + result)
                        .setColor(0xDA3118)
                        .setThumbnail(image)
                        .setDescription(pageDesc);
                    if (tier.length != 0) wikiEmbed.addField("Tier:", tier, true);
                    wikiEmbed.addField("MP Cost:", mpCost, true);
                    wikiEmbed.addField("On Equip:", onEquip, true);
                    wikiEmbed.addField("Effects:", effects.join(",\n"), true);
                    wikiEmbed.addField("Duration:", duration, true);
                    wikiEmbed.addField("Range:", range, true);
                    wikiEmbed.addField("Cooldown:", cooldown, true);
                    wikiEmbed.addField("Fame Bonus:", fameBonus, true);
                    wikiEmbed.addField("Feed Power:", feedPower, true);
                    wikiEmbed.addField("Soulbound:", soulbound, true);
                    wikiEmbed.addField("Loot Bag:", lootBagEmote, true);
                    if (tier.length === 0) wikiEmbed.addBlankField(true);
                    return message.channel.send(wikiEmbed).catch(err => {
                        message.channel.send(":x: **Couldn't get information on this item. Feel free to visit the link yourself; https://www.realmeye.com" + result + "** " + eyeEmote)
                    });
                } else {
                    var wikiEmbed = new Discord.RichEmbed()
                        .setTitle("**" + name + "**")
                        .setURL("https://www.realmeye.com" + result)
                        .setColor(0xDA3118)
                        .setThumbnail(image)
                        .setDescription(pageDesc);
                    if (tier.length != 0) wikiEmbed.addField("Tier:", tier, true);
                    wikiEmbed.addField("On Equip:", onEquip, true);
                    wikiEmbed.addField("Feed Power:", feedPower, true);
                    wikiEmbed.addField("Fame Bonus:", fameBonus, true);
                    wikiEmbed.addField("Soulbound:", soulbound, true);
                    wikiEmbed.addField("Loot Bag:", "<:" + lootBag[0].replace(/ /g, "").toLowerCase() + ":" + bot.emojis.find(emoji => emoji.name === lootBag[0].replace(/ /g, "").toLowerCase()).id + "> " + lootBag[0], true)
                    if (tier.length === 0) wikiEmbed.addBlankField(true);
                    return message.channel.send(wikiEmbed).catch(err => {
                        message.channel.send(":x: **Couldn't get information on this item. Feel free to visit the link yourself; https://www.realmeye.com" + result + "** " + eyeEmote)
                    });
                }
            }
            if (info.indexOf("Tier") < 0) {

                if (info[1] === "The Realm Eye says:") {

                    description = [];
                    $("#d > div").find("p").each(function(i, elem) {
                        description.push($(this).text());
                    });

                    pageDesc = $(".container > div").find("p").first().text();

                    info = description.join("\n").split("\n").filter(function(el) {
                        return el.replace(/ /g, "") != '' && el != null && el != '' && el != ' ' & !el.includes("Counts");
                    });

                    if (info.length > 0) {

                        var HP = info[0].replace("Base HP: ", "").replace("HP: ", "");
                        var def = info[1].replace("DEF: ", "");
                        var xp = info[2].replace("EXP: ", "");
                        var location = info[3].replace("Location: ", "");
                        var immune = [];

                        for (var i = 0; i != info.length; i++) {
                            if (info[i].includes("Immune")) immune.push(info[i].replace(/Immune to/g, ""));
                        }

                        if (immune.length === 0) immune.push("Nothing");

                        var wikiEmbed = new Discord.RichEmbed()
                            .setTitle("**" + name + "**")
                            .setURL("https://www.realmeye.com" + result)
                            .setColor(0xDA3118)
                            .setThumbnail(image)
                            .setDescription(pageDesc)
                            .addField("Base HP:", HP, true)
                            .addField("DEF:", def, true)
                            .addField("EXP:", xp, true)
                            .addField("Location:", location, true)
                            .addField("Immune to:", immune.join(",\n"), true)
                            .addBlankField(true);
                        return message.channel.send(wikiEmbed).catch(err => {
                            message.channel.send(":x: **Couldn't get information on this item. Feel free to visit the link yourself; https://www.realmeye.com" + result + "** " + eyeEmote)
                        });
                    } else {
                        description = [];
                        $("#d > p").each(function(i, elem) {
                            description.push($(this).text());
                        });

                        info = description.join("\n").split("\n").filter(function(el) {
                            return el.replace(/ /g, "") != '' && el != null && el != '' && el != ' ' & !el.includes("Counts");
                        });

                        pageDesc = info[0];
                        var HP = info[0].replace("Base HP:", "").replace("HP:", "");
                        var def = info[1].replace("DEF:", "");
                        var xp = info[2].replace("EXP:", "");
                        var location = info[3].replace("Location:", "");
                        var immune = [];

                        for (var i = 0; i != info.length; i++) {
                            if (info[i].includes("Immune")) immune.push(info[i].replace(/Immune to/g, ""));
                        }

                        if (immune.length === 0) immune.push("Nothing");


                        var wikiEmbed = new Discord.RichEmbed()
                            .setTitle("**" + name + "**")
                            .setURL("https://www.realmeye.com" + result)
                            .setColor(0xDA3118)
                            .setThumbnail(image)
                            .setDescription(pageDesc)
                            .addField("Base HP:", HP, true)
                            .addField("DEF:", def, true)
                            .addField("EXP:", xp, true)
                            .addField("Location:", location, true)
                            .addField("Immune to:", immune.join(",\n"), true)
                            .addBlankField(true);
                        return message.channel.send(wikiEmbed).catch(err => {
                            message.channel.send(":x: **Coudln't get information on query \"" + args.slice(2).join(" ") + "\"** " + eyeEmote)
                        });
                    }
                } else if (info[0] === "The Realm Eye says:" && $("#stats").text() === "Stats") {

                    description = [];
                    $("#d > div").find("p").each(function(i, elem) {
                        description.push($(this).text());
                    });

                    pageDesc = $(".container > div").find("p").first().text();

                    info = description.join("\n").split("\n").filter(function(el) {
                        return el.replace(/ /g, "") != '' && el != null && el != '' && el != ' ' & !el.includes("Counts");
                    });

                    if (info.length > 0) {

                        HP = info[1].replace("Base HP: ", "").replace("HP: ", "");
                        def = info[2].replace("DEF: ", "");
                        xp = info[3].replace("EXP: ", "");
                        location = info[4].replace("Location: ", "");
                        immune = [];

                        for (i = 0; i != info.length; i++) {
                            if (info[i].includes("Immune")) immune.push(info[i].replace(/Immune to/g, ""));
                        }

                        if (immune.length === 0) immune.push("Nothing");

                        var wikiEmbed = new Discord.RichEmbed()
                            .setTitle("**" + name + "**")
                            .setURL("https://www.realmeye.com" + result)
                            .setColor(0xDA3118)
                            .setThumbnail(image)
                            .setDescription(pageDesc)
                            .addField("Base HP:", HP, true)
                            .addField("DEF:", def, true)
                            .addField("EXP:", xp, true)
                            .addField("Location:", location, true)
                            .addField("Immune to:", immune.join(",\n"), true)
                            .addBlankField(true);
                        return message.channel.send(wikiEmbed).catch(err => {
                            message.channel.send(":x: **Couldn't get information on this item. Feel free to visit the link yourself; https://www.realmeye.com" + result + "** " + eyeEmote)
                        });
                    } else {
                        description = [];
                        $("#d > p").each(function(i, elem) {
                            description.push($(this).text());
                        });

                        info = description.join("\n").split("\n").filter(function(el) {
                            return el.replace(/ /g, "") != '' && el != null && el != '' && el != ' ' & !el.includes("Counts");
                        });

                        pageDesc = info[0];
                        var HP = info[1].replace("Base HP:", "").replace("HP:", "");
                        var def = info[2].replace("DEF:", "");
                        var xp = info[3].replace("EXP:", "");
                        var location = info[4].replace("Location:", "");
                        var immune = [];

                        for (i = 0; i != info.length; i++) {
                            if (info[i].includes("Immune")) immune.push(info[i].replace(/Immune to/g, ""));
                        }

                        if (immune.length === 0) immune.push("Nothing");


                        var wikiEmbed = new Discord.RichEmbed()
                            .setTitle("**" + name + "**")
                            .setURL("https://www.realmeye.com" + result)
                            .setColor(0xDA3118)
                            .setThumbnail(image)
                            .setDescription(pageDesc)
                            .addField("Base HP:", HP, true)
                            .addField("DEF:", def, true)
                            .addField("EXP:", xp, true)
                            .addField("Location:", location, true)
                            .addField("Immune to:", immune.join(",\n"), true)
                            .addBlankField(true);
                        return message.channel.send(wikiEmbed).catch(err => {
                            message.channel.send(":x: **Couldn't get information on this item. Feel free to visit the link yourself; https://www.realmeye.com" + result + "** " + eyeEmote)
                        });
                    }
                } else {

                    var map = [];
                    $("#d > p > img").each(function(i, elem) {
                        if (!$(this).attr("title")) return;
                        if ($(this).attr("title").includes("Layout")) map.push("https:" + $(this).attr("src").replace(/ /g, "%20"));
                    });

                    if (map.length === 0) {
                        $("#d > div > img").each(function(i, elem) {
                            if (!$(this).attr("title")) return;
                            map.push("https://www.realmeye.com" + $(this).attr("src").replace(/ /g, "%20"));
                        });
                        if (map.length === 0) {
                            $("#d > div > div > img").each(function(i, elem) {
                                map.push("https:" + $(this).attr("src").replace(/ /g, "%20"));
                            });
                            if (map.length === 0) {
                                $("#d > div > img").each(function(i, elem) {
                                    map.push("https://www.realmeye.com" + $(this).attr("src").replace(/ /g, "%20"));
                                });
                            }
                            if (map.length === 0) {
                                map.push("https://brandslogo.net/wp-content/themes/logolove/images/not-available.jpg");
                            }
                        }
                    }

                    var difficulty = [];
                    image = [];
                    var otherImages = [];
                    lootBag = [];
                    $("#d > div > table > tbody > tr > td > img").each(function(i, elem) {
                        if (!$(this).attr("title")) return;
                        if ($(this).attr("title").includes("Difficulty:")) difficulty.push($(this).attr("title").replace("Difficulty: ", ""));
                        if ($(this).attr("title").includes("Portal")) image.push("https:" + $(this).attr("src").replace(/ /g, "%20"));
                        if ($(this).attr("title").includes("Assigned to ")) lootBag.push($(this).attr("title").replace("Assigned to ", ""));
                        otherImages.push($(this).attr("src"));
                    });



                    if (difficulty.length === 0) difficulty.push("0");
                    if (image.length === 0 && otherImages.length > 0) image[0] = "https:" + otherImages[0].replace(/ /g, "%20");
                    else if (image.length === 0 && otherImages.length === 0) image[0] = "https://brandslogo.net/wp-content/themes/logolove/images/not-available.jpg";

                    description = [];
                    $("#d > p").each(function(i, elem) {
                        description.push($(this).text());
                    });

                    info = description.join("\n").split("\n").filter(function(el) {
                        return el.replace(/ /g, "") != '' && el != null && el != '' && el != ' ' & !el.toLowerCase().includes("key");
                    });

                    if (info.length != 0) {
                        description = [];
                        tier = [];
                        $("#d > div > table > tbody > tr").each(function(i, elem) {
                            description.push($("td", this).text());
                        });

                        info = description.join("\n").split("\n").filter(function(el) {
                            return el.replace(/ /g, "") != '' && el != null && el != '' && el != ' ' & !el.toLowerCase().includes("key");
                        });
                    }

                    var graves = "";

                    for (i = 0; i != parseInt(difficulty[0]); i++) {
                        graves += "<:difficultyGrave:681914240013303818>";
                    }

                    if (difficulty[0] === 0) graves = "Not available";

                    pageDesc = [];
                    for (var i = 0; i < info.length; i++) {
                        pageDesc.push(info[i]);
                        if (i > 2) continue;
                    }

                    if (lootBag.length > 0) lootBagEmote = "<:" + lootBag[0].replace(/ /g, "").toLowerCase() + ":" + bot.emojis.find(emoji => emoji.name === lootBag[0].replace(/ /g, "").toLowerCase()).id + "> " + lootBag[0];

                    var wikiEmbed = new Discord.RichEmbed()
                        .setTitle("**" + name + "**")
                        .setURL("https://www.realmeye.com" + result)
                        .setColor(0xDA3118)
                        .setThumbnail(image[0])
                        .setDescription(pageDesc.join("\n"));
                    if (graves.length > 0) {
                        wikiEmbed.addField("Difficulty:", graves)
                        wikiEmbed.setImage(map[0])
                    }
                    if (lootBag.length > 0) {
                        wikiEmbed.addField("Loot Bag:", lootBagEmote)
                    }
                    return message.channel.send(wikiEmbed).catch(err => {
                        message.channel.send(":x: **Couldn't get information on this item. Feel free to visit the link yourself; https://www.realmeye.com" + result + "** " + eyeEmote)
                    });
                }
            } else {

                var lootBag = [];

                $(".img-responsive").each(function(i, elem) {
                    if (!$(this).attr("alt")) return;
                    if ($(this).attr("alt").includes("Assigned to")) lootBag.push($(this).attr("alt").replace("Assigned to", ""));
                });

                if (lootBag.length === 0) lootBagEmote = "No loot bag";
                else lootBagEmote = "<:" + lootBag[0].replace(/ /g, "").toLowerCase() + ":" + bot.emojis.find(emoji => emoji.name === lootBag[0].replace(/ /g, "").toLowerCase()).id + "> " + lootBag[0];

                var wikiEmbed = new Discord.RichEmbed()
                    .setTitle("**" + name + "**")
                    .setURL("https://www.realmeye.com" + result)
                    .setColor(0xDA3118)
                    .setThumbnail(image)
                    .setDescription(pageDesc)
                    .addField("Tier:", tier, true)
                    .addField("Shots:", shots, true)
                    .addField("Damage:", damage, true)
                    .addField("Speed:", speed, true)
                    .addField("Rate of Fire:", rateOfFire, true)
                    .addField("Range:", range, true)
                    .addField("Fame Bonus:", fameBonus, true)
                    .addField("Feed Power:", feedPower, true)
                    .addField("Soulbound:", soulbound, true)
                    .addField("Loot Bag:", lootBagEmote, true)
                    .addBlankField(true);
                message.channel.send(wikiEmbed).catch(err => {
                    message.channel.send(":x: **Couldn't get information on this item. Feel free to visit the link yourself; https://www.realmeye.com" + result + "** " + eyeEmote)
                });
            }
        }
    });
}

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

module.exports.run = async(bot, message, args) => {
    switch (args[1].toLowerCase()) {
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
                        .setURL("https://www.realmeye.com/player/" + name)
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
                        if (args[3] <= characterCount && !isNaN(args[3])) {
                            var index = args[3];
                            index--;
                        } else var index = 0;
                    } else var index = 0;

                    var embed = new Discord.RichEmbed()
                        .setTitle(rotmgEmote + "** RotMG Player Card - " + name + " (Characters)**")
                        .setColor(0xDA3118)
                        .setURL("https://www.realmeye.com/player/" + name)
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
                    if (characterCount <= 1) return message.channel.send(embed);
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
                                            .setURL("https://www.realmeye.com/player/" + name)
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
                                            .setURL("https://www.realmeye.com/player/" + name)
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
                        if (args[3] <= petCount && !isNaN(args[3])) {
                            var index = args[3];
                            index--;
                        } else var index = 0;
                    } else var index = 0;

                    var embed = new Discord.RichEmbed()
                        .setTitle(rotmgEmote + "** RotMG Player Card - " + name + " (Pets)**")
                        .setColor(0xDA3118)
                        .setURL("https://www.realmeye.com/pets-of/" + name)
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
                    if (petCount <= 1) return message.channel.send(embed);
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
                                            .setURL("https://www.realmeye.com/pets-of/" + name)
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
                                            .setURL("https://www.realmeye.com/pets-of/" + name)
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

                    if (graveYard.length === 0) return message.channel.send(":x: **No user matched the query \"" + args[2] + "\"** " + eyeEmote);

                    if (args[3]) {
                        if (args[3] <= graveYard.length && !isNaN(args[3])) {
                            var index = args[3];
                            index--;
                        } else var index = 0;
                    } else var index = 0;

                    graveYard.reverse();

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
                        .setURL("https://www.realmeye.com/graveyard-of-player/" + name)
                        .setThumbnail(getCharImage(className))
                        .addField("Class:", className + " (level " + level + ") - " + stats, true)
                        .addBlankField(true)
                        .addBlankField(true)
                        .addField("Fame:", numberWithSpaces(fame), true)
                        .addField("Exp:", numberWithSpaces(xp), true)
                        .addBlankField(true)
                        .addField("Killed by:", killedBy, true)
                        .addField("Killed On:", date.replace(/T/g, ", ").replace(/Z/g, ""), true)
                        .addBlankField(true)
                        .setFooter("Page " + (index + 1) + "/" + graveYard.length);
                    if (graveYard.length <= 1) return message.channel.send(embed);
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
                                            .setURL("https://www.realmeye.com/graveyard-of-player/" + name)
                                            .setThumbnail(getCharImage(className))
                                            .addField("Class:", className + " (level " + level + ") - " + stats, true)
                                            .addBlankField(true)
                                            .addBlankField(true)
                                            .addField("Fame:", numberWithSpaces(fame), true)
                                            .addField("Exp:", numberWithSpaces(xp), true)
                                            .addBlankField(true)
                                            .addField("Killed by:", killedBy, true)
                                            .addField("Killed On:", date.replace(/T/g, ", ").replace(/Z/g, ""), true)
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
                                            .setURL("https://www.realmeye.com/graveyard-of-player/" + name)
                                            .setThumbnail(getCharImage(className))
                                            .addField("Class:", className + " (level " + level + ") - " + stats, true)
                                            .addBlankField(true)
                                            .addBlankField(true)
                                            .addField("Fame:", numberWithSpaces(fame), true)
                                            .addField("Exp:", numberWithSpaces(xp), true)
                                            .addBlankField(true)
                                            .addField("Killed by:", killedBy, true)
                                            .addField("Killed On:", date.replace(/T/g, ", ").replace(/Z/g, ""), true)
                                            .addBlankField(true)
                                            .setFooter("Page " + (index + 1) + "/" + graveYard.length);
                                        messageEmbed.edit(Rembed);
                                    });
                                });
                            });
                        });
                    });
                }).catch(err => {
                    if (err) message.channel.send(":x: **Couldn't fetch this user's Graveyard. It may be hidden or empty **" + eyeEmote + "\n" + err.message);
                });
            }
            break;
        case "wiki":
        case "w":
            if (!args[2]) return message.channel.send(":x: **No query provided**");
            else {

                if (args[2].toLowerCase() === "nexus") {
                    var wikiEmbed = new Discord.RichEmbed()
                        .setTitle("**Nexus**")
                        .setURL("https://www.realmeye.com/wiki/nexus")
                        .setColor(0xDA3118)
                        .setThumbnail("https://static.drips.pw/rotmg/wiki/Environment/Portals/Portal%20to%20Nexus.png")
                        .setImage("https://i.imgur.com/ViO3bV8.png")
                        .setDescription("The Nexus is the realm’s ‘town’ area, and a safe zone from Oryx’s minions. In the Nexus, you can interact and [trade](https://www.realmeye.com/wiki/trading)\nwith other players, customize your [options](https://www.realmeye.com/wiki/controls-and-commands), and purchase [Realm Gold](https://www.realmeye.com/wiki/realm-gold) and items, and access the [Shop](https://www.realmeye.com/wiki/shop). It is also the\ngateway between Realms that allows access to your [Vault](https://www.realmeye.com/wiki/vault), [Guild Hall](https://www.realmeye.com/wiki/guild-hall) and [Pet Yard](https://www.realmeye.com/wiki/pet-yard), as well as [The Tinkerer](https://www.realmeye.com/wiki/the-tinkerer),\nthe [Login Seer](https://www.realmeye.com/wiki/login-seer) and [The Arena](https://www.realmeye.com/wiki/the-arena).")
                    return message.channel.send(wikiEmbed);
                }

                var url = config.API_ENDPOINT + args.slice(2).join("%20").toLowerCase();
                request({
                    url: url,
                    headers: {
                        "user-agent": config.USER_AGENT
                    }
                }, (err, res, body) => {
                    if (!err && res.statusCode == 200) {
                        var $ = cheerio.load(body);
                        var resultNames = [];
                        var results = [];
                        var i = 0;
                        $(".container > div > div > div > div > p > a").each(function(e, elem) {
                            results.push($(this).attr("href"));
                            resultNames.push($(this).text());
                            if (i === 4) return;
                            i++;
                        });
                        if (results.length === 0) return message.channel.send(":x: **No element matched the query \"" + args.slice(2).join(" ") + "\"** " + eyeEmote);
                        else {
                            var choiceDescription = "";
                            var result = "";
                            for (var ind = 0; ind < results.length; ind++) {
                                choiceDescription += "**" + (ind + 1) + "**. " + resultNames[ind] + "\n";
                                if (ind === 4) break;
                            }
                            var choiceEmbed = new Discord.RichEmbed()
                                .setTitle(rotmgEmote + " **Results for \"" + args.slice(2).join(" ") + "\"**")
                                .setColor(0xDA3118)
                                .setDescription("Please choose a result by reacting with the corresponding number [1-5]\n\n" + choiceDescription)
                            message.channel.send(choiceEmbed).then(choiceEmbed => {
                                choiceEmbed.react("1️⃣").then(() => {
                                    choiceEmbed.react("2️⃣").then(() => {
                                        choiceEmbed.react("3️⃣").then(() => {
                                            choiceEmbed.react("4️⃣").then(() => {
                                                choiceEmbed.react("5️⃣").then(() => {

                                                    var oneFilter = (reaction, user) => reaction.emoji.name === "1️⃣" && user.id != bot.user.id;
                                                    var twoFilter = (reaction, user) => reaction.emoji.name === "2️⃣" && user.id != bot.user.id;
                                                    var threeFilter = (reaction, user) => reaction.emoji.name === "3️⃣" && user.id != bot.user.id;
                                                    var fourFilter = (reaction, user) => reaction.emoji.name === "4️⃣" && user.id != bot.user.id;
                                                    var fiveFilter = (reaction, user) => reaction.emoji.name === "5️⃣" && user.id != bot.user.id;
                                                    var one = choiceEmbed.createReactionCollector(oneFilter);
                                                    var two = choiceEmbed.createReactionCollector(twoFilter);
                                                    var three = choiceEmbed.createReactionCollector(threeFilter);
                                                    var four = choiceEmbed.createReactionCollector(fourFilter);
                                                    var five = choiceEmbed.createReactionCollector(fiveFilter);

                                                    one.on("collect", () => {
                                                        wiki(results[0], message, bot, args);
                                                        choiceEmbed.clearReactions().then(() => {
                                                            one.stop();
                                                            two.stop();
                                                            three.stop();
                                                            four.stop();
                                                            five.stop();
                                                            choiceEmbed.delete();
                                                        });
                                                    });
                                                    two.on("collect", () => {
                                                        wiki(results[1], message, bot, args);
                                                        choiceEmbed.clearReactions().then(() => {
                                                            one.stop();
                                                            two.stop();
                                                            three.stop();
                                                            four.stop();
                                                            five.stop();
                                                            choiceEmbed.delete();
                                                        });
                                                    });
                                                    three.on("collect", () => {
                                                        wiki(results[2], message, bot, args);
                                                        choiceEmbed.clearReactions().then(() => {
                                                            one.stop();
                                                            two.stop();
                                                            three.stop();
                                                            four.stop();
                                                            five.stop();
                                                            choiceEmbed.delete();
                                                        });
                                                    });
                                                    four.on("collect", () => {
                                                        wiki(results[3], message, bot, args);
                                                        choiceEmbed.clearReactions().then(() => {
                                                            one.stop();
                                                            two.stop();
                                                            three.stop();
                                                            four.stop();
                                                            five.stop();
                                                            choiceEmbed.delete();
                                                        });
                                                    });
                                                    five.on("collect", () => {
                                                        wiki(results[4], message, bot, args);
                                                        choiceEmbed.clearReactions().then(() => {
                                                            one.stop();
                                                            two.stop();
                                                            three.stop();
                                                            four.stop();
                                                            five.stop();
                                                            choiceEmbed.delete();
                                                        });
                                                    });
                                                })
                                            });
                                        });
                                    });
                                })
                            });
                        }
                    }
                });
            }
            break;
        case "trade":
        case "trading":
        case "t":
            if (!args[2]) return message.channel.send(":x **No query provided**");
            else {
                if (!args[3]) return message.channel.send(":x **No query provided**");
                else {
                    if (args[2].toLowerCase() != "b" && args[2].toLowerCase() != "s" && args[2].toLowerCase() != "buy" && args[2].toLowerCase() != "sell") return message.channel.send(":x: **Invalid type provided. \"" + args[2] + "\" is not an action [buy/sell]** " + eyeEmote);
                    if (args[2].toLowerCase() === "b") var action = "buy";
                    else if (args[2].toLowerCase() === "s") action = "sell";
                    else action = args[2].toLowerCase();
                    var itemsList = [];
                    await requestItems().then(res => { itemsList.push(res) });
                    itemsList = itemsList[0];
                    var url = "https://www.realmeye.com/current-offers";
                    request({
                        url: url,
                        headers: {
                            "user-agent": config.USER_AGENT
                        }
                    }, (err, res, body) => {
                        if (!err && res.statusCode === 200) {
                            var $ = cheerio.load(body);
                            var items = [];
                            var itemName = [];
                            $(".current-offers > .item-wrapper").each(function(i, element) {
                                if ($(element).attr("class").includes("disabled")) return;
                                if ($("a > span", element).attr("class") === "item") {
                                    if ($("a > span", element).attr("title").toLowerCase().includes(args.slice(3).join(" ").toLowerCase())) {
                                        $("a", element).each(function(ind, elem) {
                                            if (!$(this).attr("class")) return;
                                            if ($(this).attr("class") === "item-" + action + "ing") {
                                                items.push($(this).attr("href"));
                                                itemName.push($(".item", elem).attr("title"));
                                            }
                                        });
                                    }
                                }
                            });
                        } else return message.channel.send(":x: **Couldn't access RealmEye servers**");
                        if (items.length === 0) return message.channel.send(":x: **No element matched the query \"" + args.slice(3).join(" ") + "\"** " + eyeEmote);
                        url = "https://www.realmeye.com" + items[0];
                        request({
                            url: url,
                            headers: {
                                "user-agent": config.USER_AGENT
                            }
                        }, (err, res, body) => {
                            if (!err && res.statusCode === 200) {
                                var $ = cheerio.load(body);
                                var tradeInfo = [];
                                var tradesSell = [];
                                var tradesBuy = [];
                                var tradesTime = [];
                                var tradesAuthor = [];
                                var tradesLink = [];
                                var iiii = 0;
                                var iii = 0;
                                var tradesEmbed = new Discord.RichEmbed();
                                tradesEmbed.addField("⠀", "Selling", true)
                                tradesEmbed.addField("⠀", "⠀", true)
                                tradesEmbed.addField("⠀", "Buying", true)
                                $("#g > tbody > tr").each(function(i, element) {
                                    tradeInfo = [];
                                    tradesSell = [];
                                    tradesBuy = [];
                                    iii = 0;
                                    $("td", element).each(function(ind, elem) {
                                        $(".item-static", elem).each(function(index, e) {
                                            var tier = itemsList[$(".item", e).attr("data-item").toString()];
                                            tier = tier.filter(e => e != undefined);
                                            if (tier[1] === 10 || tier[1] === 0 || tier[1] === 26) {
                                                tier[2] = "";
                                            } else {
                                                if (tier[2] === -1) tier[2] = " UT";
                                                else tier[2] = " T" + tier[2];
                                            }
                                            if (iii === 0) {
                                                tradesSell.push($(".item-quantity-static", e).text().slice(1) + "x " + itemsList[$("span", e).attr("data-item").toString()][0] + tier[2]);
                                            }
                                            else if (iii === 1) {
                                                tradesBuy.push($(".item-quantity-static", e).text().slice(1) + "x " + itemsList[$("span", e).attr("data-item").toString()][0] + tier[2]);
                                            }
                                        });
                                        if ($("a", elem).attr("href") != undefined) {
                                            if ($("a", elem).attr("href").includes("/offers-by/")) {
                                                tradeInfo.push($("a", elem).text());
                                                tradeInfo.push("https://www.realmeye.com" + $("a", elem).attr("href"));
                                            }
                                        }
                                        iii++;
                                    });
                                    tradesAuthor.push(tradeInfo[0]);
                                    tradesLink.push(tradeInfo[1]);
                                    if (iiii >= 5) return;
                                        tradesEmbed.setTitle(rotmgEmote + " **Results for \"" + args.slice(3).join(" ") + "\" (" + action + "ing)**")
                                        tradesEmbed.setURL(url)
                                        tradesEmbed.setThumbnail()
                                        tradesEmbed.setColor(0xDA3118)
                                        tradesEmbed.addField("⠀", "[" + tradesSell.join(" and ") + "](" + tradesLink[iiii] + ")", true)
                                        tradesEmbed.addField("⠀", "[for](" + tradesLink[iiii] + ")", true)
                                        tradesEmbed.addField("⠀", "[" + tradesBuy.join(" and ") + "](" + tradesLink[iiii] + ")", true)
                                    iiii++;
                                });
                                message.channel.send(tradesEmbed);
                            } else return message.channel.send(":x: **No element matched the query \"" + args.slice(3).join(" ") + "\"** " + eyeEmote);
                        });
                    });
                }
            }
            break;
        default:
            break;
    }
};

module.exports.help = {
    name: "realmeye",
    aliases: "re",
    description: "Fetch information about a player on the RealmEye website",
    usage: PREFIX + "realmeye <user/characters/pets/graveyard> <username>, " + PREFIX + "realmeye <wiki> <query>"
}
