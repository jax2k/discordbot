var queue = new Array();
module.exports = {
  name: 'prune',
  aliases: ['purge'],
  group: 'Moderation',
  description: 'Purge the specified amount of commands',
  argsType: 'single',
  argsCount: 1,
  usage: '<#>',
  execute(message, args) {
    if (message.author.bot) return;

    var limit = parseInt(args[0]) + 1; // Add one because we ignore the command
    if (parseInt(args[0]) == 100 && limit == 101)
      limit--;

    if (!limit || limit == undefined) throw "ArgError: limit |is undefined";
    if (limit > 100) throw "ArgError: limit |should be less than or equal to 100";

    message.channel.fetchMessages({
      limit: limit
    }).then(messages => {
      messages.forEach((msg) => {
        if (msg.channel.type == 'text') queue.push(msg);
      });

      message.channel.bulkDelete(queue, false).then(messages => {
        message.channel.send(`Purged ${args[0]} messages successfully`);
      });
    }).catch(console.error);
  },
};
