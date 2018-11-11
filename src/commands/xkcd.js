const config = require('config.json')('./config.json');
const discord = require('discord.js');

const got = require('got');
var max;
module.exports = {
  name: 'xkcd',
  group: 'Fun',
  description: 'See a list of all commands',
  argsType: 'single',
  argsCount: 1,
  usage: '<comicid>|recent:random',
  updateComic: async () => (await got('https://xkcd.com/info.0.json', {
    json: true
  }).then(response => max = response.body.num).catch(err => console.error)),
  execute(message, args) {
    var comic;

    if (!args[0])
      args[0] = 'random';

    if (args[0].startsWith("recent"))
      comic = max;
    else if (args[0].startsWith("random"))
      comic = Math.floor(Math.random() * max) + 1;
    else if (typeof Number(args[0].toString()) === 'number' && typeof args[0] === 'string') {
      if (args[0].toString().length > max)
        throw "ArgError: num |should be less than or equal to 4";
      var pad = "0000";
      comic = pad.substring(0, pad.length - args[0].toString().length) + args[0].toString();
    }

    if (comic == undefined)
      throw "ArgError: comic |is undefined";

    (async () => {
      await got(`https://xkcd.com/${comic}/info.0.json`, {
        json: true
      }).then(response => {
        const embed = new discord.RichEmbed(); {
          embed.setTitle(`xkcd #${comic} - ${response.body.safe_title}`);
          embed.setImage(response.body.img);
          embed.setColor("#96A8C8");

          embed.setTimestamp(new Date());
          embed.setFooter(`.js - Issued by @${message.author.tag}`, message.author.avatarURL);
        }
        message.channel.send(embed);
      });
    })().catch(err => console.error);
  },
}

module.exports.updateComic();
