const URLEncode = require('urlencode');
const HTTPS = require('https');

module.exports = {
    name: '!set_name',
    cooldown: 5,
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
                let data = [];
                const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
                console.log('Status Code:', res.statusCode);
                if (res.statusCode < 200 || res.statusCode > 299)
                    return msg.channel.send(`User ${summonerName} not found.`);
                else {
                    msg.channel.send(`Setting ${summonerName} to user ${userName}.`);
                    summoners[user] = summonerName;
                }
            });
        } catch (error) {
            return console.info(error);
        }
    },
};