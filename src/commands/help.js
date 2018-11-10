const config = require('config.json')('./config.json');
const discord = require('discord.js');
const util = require('util');

module.exports = {
  name: 'help',
  aliases: ['h'],
  group: 'General',
  description: 'See a list of all commands',
  execute(message, args, client, cmds) {
    const embed = new discord.RichEmbed(); {
      embed.setTitle(".js")
      embed.setColor("#356FF6");
      embed.setDescription(util.format("Greetings, <@%s>! I'm .js, a discord bot written in node.js that is designed to be a fast and customizable bot for your discord server. Hopefully you enjoy my stay, and what I have to offer.\n\n **Command Usage**\n • ``<arg>`` indicates an argument \n • ``<\"arg a\">`` indicates a argument that contains spaces \n • ``<arg:default>`` indicates a default value on the right (if any)", message.author.id));
      embed.setTimestamp(new Date());
      embed.setFooter('.js');
      // Add each category from our commands json obj as a field
      for (var key in cmds) {
        var join = '';
        for (var i in cmds[key])
          join += cmds[key][i] + '\n';

        embed.addField(key, join);
      }

      embed.addField("\nInformation", "• Developed by Jaxne#4215\n• [Join](https://discord.gg/4gxMv6k) my support server.\n• [View](https://github.com/jaxonlaing/mainbot) my source code.");
    }
    message.channel.send(embed);
  },
}
