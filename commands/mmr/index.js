const URLEncode = require('urlencode');
const HTTPS = require('https');
const Discord = require('discord.js');
module.exports = {
    name: '!mmr',
    description: 'Get MMR data',
    execute(msg, args) {
        const user = msg.author.id;
        const userName = msg.author.username;
        let summonerName;
        let server;
        const usage = 'Usage: !mmr or !mmr <server> <name>';
        /*if (args == 0) {
            summonerName = global.summoners[user].summonerName;
            server = global.summoners[user].server;
        } else*/
        if (args.length < 2) {
            return msg.channel.send(usage);
        } else {
            let arg0 = args[0].toLowerCase();
            switch (args[0]) {
                case 'na':
                    //server = 'na';
                    //break;
                case 'eune':
                    //server = 'eune';
                    //break;
                case 'euw':
                    //server = 'euw';
                    //break;
                case 'kr':
                    //server = 'kr';
                    //break;
                    server = arg0;
                    break;
                default:
                    return msg.channel.send('Expected servers: NA, EUNE, EUW, KR');
            }
            summonerName = `${args[1]}`;
            for (let i = 2; i < args.length; i++) {
                summonerName += ` ${args[i]}`;
            }
        }
        let encodedName = URLEncode(summonerName);
        const query = `https://${server}.whatismymmr.com/api/v1/summoner?name=${encodedName}`;
        try {
            //msg.channel.send(`Please wait...`);
            HTTPS.get(query, res => {
                console.log('Status Code:', res.statusCode);
                if (res.statusCode < 200 || res.statusCode > 299)
                    return msg.channel.send(`User ${summonerName} not found.`);
                else {
                    let body;
                    console.log(query);
                    res.on('data', function(chunk) {
                        body += chunk;
                    });
                    res.on('end', function() {
                        try {
                            if (body.startsWith('undefined')) {
                                body = body.substring('undefined'.length);
                            }
                            let data = JSON.parse(body);
                            console.log(data);
                            let ranked = data["ranked"];
                            let normal = data["normal"];
                            let ARAM = data["ARAM"];
                            /*let embed = new Discord.MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(`${summonerName}`)
                                .setAuthor(`${userName}`)
                                .addFields({ name: 'Ranked average', value: `${ranked["avg"]}`, inline: true }, { name: 'Ranked ±', value: `${ranked["err"]}`, inline: true }, { name: 'Normal average', value: `${normal["avg"]}`, inline: true }, { name: 'Normal ±', value: `${normal["err"]}`, inline: true }, { name: 'ARAM average', value: `${ARAM["avg"]}`, inline: true }, { name: 'ARAM ±', value: `${ARAM["err"]}`, inline: true })
                                .setTimestamp();
                            msg.channel.send(embed);*/
                            let message = `${summonerName}\n`;
                            message += `>>> **Type\tLast refresh time\tAverage\tError\tCentile\tClosest rank**\n`;
                            if (ranked["avg"] != null) {
                                let time = new Date(ranked["timestamp"] * 1000).toISOString().slice(0, 16).replace('T', ' ');
                                message += `Ranked\t${time}\t${ranked["avg"]}\t(±${ranked["err"]})\t${ranked["percentile"]}%\t${ranked["closestRank"]}\n`;

                            } else {
                                message += `*no data for ranked*\n`;
                            }
                            if (normal["avg"] != null) {
                                let time = new Date(normal["timestamp"] * 1000).toISOString().slice(0, 16).replace('T', ' ');
                                message += `Normal\t${time}\t${normal["avg"]}\t(±${normal["err"]})\t${normal["percentile"]}%\t${normal["closestRank"]}\n`;
                            } else {
                                message += `*no data for normal*\n`;
                            }
                            if (ARAM["avg"] != null) {
                                let time = new Date(ARAM["timestamp"] * 1000).toISOString().slice(0, 16).replace('T', ' ');
                                message += `ARAM\t${time}\t${ARAM["avg"]}\t(±${ARAM["err"]})\t${ARAM["percentile"]}%\t${ARAM["closestRank"]}\n`;
                            } else {
                                message += `*no data for ARAM*\n`;
                            }
                            msg.channel.send(message);
                        } catch (error) {
                            return console.log(error);
                        }
                    });
                }
            });
        } catch (error) {
            return console.info(error);
        }
    },
};
