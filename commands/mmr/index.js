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
        if (args == 0) {
            summonerName = global.summoners[user].summonerName;
            server = global.summoners[user].server;
        } else if (args.length < 2) {
            return msg.channel.send(usage);
        } else {
            switch (args[0]) {
                case 'NA':
                    server = 'na';
                    break;
                case 'EUNE':
                    server = 'eune';
                    break;
                case 'EUW':
                    server = 'euw';
                    break;
                case 'KR':
                    server = 'kr';
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
            msg.channel.send(`Please wait...`);
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
                            message += `**Ranked\t${ranked["avg"]}\t(±${ranked["err"]})**\n`;
                            message += `Normal\t${normal["avg"]}\t(±${normal["err"]})\n`;
                            message += `ARAM\t${ARAM["avg"]}\t(±${ARAM["err"]})\n`;
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
