const URLEncode = require('urlencode');
const HTTPS = require('https');

module.exports = {
    name: '!set_name',
    description: 'Set the summoner name',
    execute(msg, args) {
        const user = msg.author.id;
        const userName = msg.author.username;
        const usage = 'Usage: !set_name <server> <name>';
        if (args.length < 2) {
            return msg.channel.send(`!set_name <server> <name>`);
        }
        let server;
        let summonerName;
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
        let encodedName = URLEncode(summonerName);
        //TODO validate name by connecting to database
        const query = `https://${server}.whatismymmr.com/api/v1/summoner?name=${encodedName}`;
        try {
            msg.channel.send(`Please wait...`);
            HTTPS.get(query, res => {
                console.log(query);
                console.log('Status Code:', res.statusCode);
                if (res.statusCode < 200 || res.statusCode > 299)
                    return msg.channel.send(`User ${summonerName} not found.`);
                // 001 - user doesn't exist
                // 004 - user data was not found
                else {
                    msg.channel.send(`Setting ${summonerName} to user ${userName}.`);
                    global.summoners[user] = { summonerName: summonerName, server: server };
                }
            });
        } catch (error) {
            return console.info(error);
        }
    },
};