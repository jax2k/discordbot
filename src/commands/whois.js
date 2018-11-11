const discord = require('discord.js');
const helper = require('./../helper.js');
const util = require('util');
const moment = require('moment');

module.exports = {
  name: 'whois',
  group: 'General',
  description: 'Displays info regarding the specified user',
  argsType: 'single',
  argsCount: 1,
  usage: '<@user:issuer>',
  execute(message, args) {
    var guild = message.guild;

    (async () => {
      // Parse @<123...> into snowflake, move this to helper.js?
      var snowflake = (args.length > 0) ? args[0].split('@')[1].split('>')[0] : message.author.id;
      if (snowflake.includes('!'))
        snowflake = snowflake.split('!')[1];
      var member = await guild.fetchMember(snowflake).catch(console.log);

      var embed = new discord.RichEmbed(); {
        embed.setTitle(member.user.username);
        embed.setColor((member.displayColor == 0) ? '#356FF6' : member.displayHexColor);
        embed.setThumbnail(member.user.avatarURL);
        embed.setTimestamp(new Date());

        embed.addField(`Joined guild on: `, moment(member.joinedAt).format('MMM Do YYYY, h:mma'), true);
        embed.addField(`Created account on: `, moment(member.user.createdAt).format('MMM Do YYYY, h:mma'), true);

        var name = member.user.tag;
        (member.nickname) ? name += ` (${member.nickname})`: name += "";
        embed.addField("Name: ", name, true);

        var r_fbi = [];
        for (var item of member.roles.values())
          if (item.name != '@everyone')
            r_fbi.push(` ${item.toString()}`);
        embed.addField(`Roles: `, `{${r_fbi.toString()} }`, true);
        var pres = "";
        if (member.presence) {
          let game = null;
          if (member.presence.game)
            game = member.presence.game;

          var state = (game.state) ? game.state : "";
          state = state.replaceAll(";", ",");

          if (game == 'Spotify') pres += `Listening to \`\`${game.details}\`\` by \`\`${state}\`\` on \`\`${game.assets.largeText}\`\``;
          else if (game != null)
            pres += `Playing \`\`${game.name}\`\` - \`\`${game.details}\`\``;

          embed.addField(`Presence: `, pres);
        }

        var status = member.presence.status;
        if (status == ('online' || 'offline' || 'idle'))
          status = member.presence.status.charAt(0).toUpperCase() + member.presence.status.slice(1);
        else if (status == 'dnd')
          status = "Do Not Disturb";
        embed.addField(`Status: `, status);

        //TODO: Show users presence? (for high pop. servers)
        embed.setFooter(`.js - Issued by @${message.author.tag}`, message.author.avatarURL);
      }
      message.channel.send(embed);
    })();

  },
};
