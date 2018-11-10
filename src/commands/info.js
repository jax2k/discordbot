const discord = require('discord.js');
const util = require('util');
const moment = require('moment');

module.exports = {
  name: 'info',
  group: 'General',
  description: 'Displays info regarding the server',
  execute(message, args) {
    const guild = message.guild;
    if (!guild.available) return;

    var onlineCount = 0;
    guild.members.forEach(user => {
      if (user.presence.status.includes('online' || 'idle' || 'dnd'))
        onlineCount++;
    });

    var voices = 0,
      texts = 0;
    guild.channels.forEach(channel => {
      if (channel.type.includes('voice'))
        voices++;
      if (channel.type.includes('text'))
        texts++;
    });

    const embed = new discord.RichEmbed(); {
      embed.setTitle(guild.name);
      embed.setColor('#356FF6');
      embed.setThumbnail(message.guild.iconURL);
      embed.setTimestamp(new Date());

      embed.addField(`Online Users: `, onlineCount, true);
      embed.addField(`Total Users: `, guild.memberCount, true);
      embed.addField(`Created on: `, moment(guild.createdAt).format('MMM Do YYYY, h:mma'), true);
      embed.addField(`Owned by: `, `<@${guild.ownerID}>`, true);
      embed.addField(`Voice Channels: `, voices, true);
      embed.addField(`Text Channels: `, texts, true);
      embed.addField(`Roles: `, guild.roles.size, true)

      embed.setFooter(`.js - Issued by @${message.author.tag}`, message.author.avatarURL);
    }
    message.channel.send(embed);
  },
};
