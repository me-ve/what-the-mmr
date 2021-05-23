const URLEncode = require('urlencode');
const HTTPS = require('https');
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
                default:
                    return msg.channel.send('Expected servers: NA, EUNE, EUW');
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