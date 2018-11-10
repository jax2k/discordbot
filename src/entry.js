const config = require('config.json')('./config.json');
if (process.argv.length <= 2) {
  console.log('Invalid arguments, aborting');
  process.exit(-1);
}

const args = require('minimist')(process.argv.slice(2))
const discord = require('discord.js');
const client = new discord.Client();

const fs = require('fs');
const util = require('util');
client.commands = new discord.Collection();

var all_cmds = {};
client.on('ready', () => {
  //TODO: Check against MD5 hashes to migate attack vector
  const cmds = fs.readdirSync('./src/commands/').filter(file => file.endsWith('.js'));
  for (const file of cmds) {
    const cmd = require(util.format('./commands/%s', file));
    client.commands.set(cmd.name, cmd);
  }

  // Allocate a map and map every command and its category (cmd.aliases[0])
  fields = new Map();

  client.commands.forEach((command) => {
    var category = command.group; // Category is always the first alias
    if (!all_cmds.hasOwnProperty(category))
      all_cmds[category] = []; // Allocate category before we add

    var string = util.format("``%s%s", config.prefix, command.name);
    if (command.aliases != undefined && command.aliases.length > 0)
      string = string.concat(util.format(", %s%s", config.prefix, command.aliases));
    if ((command.usage) && command.usage.includes('<') && command.usage.includes('>'))
      string = string.concat(util.format(" %s", command.usage));
    string = string.concat(util.format("`` - %s", command.description));

    all_cmds[category].push(string);
  });

  client.user.setPresence({
    game: {
      name: `${config.prefix}help  |  .js v${require("./../package").version}`
    },
    status: 'dnd'
  });

  console.log('Ready as { %s }.', client.user.tag);
});

//TODO: Setup project on github / gitlab
//TODO: Sharding
//TODO: Bot whois that shows its current shard / gateway
//TODO: Helper.js and global bot state to share across shards
client.on('message', msg => {
  if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;

  var args = (msg.content.slice(config.prefix.length).trim().split(/ +/g));
  var command = parseCommand(args[0].toLowerCase());
  args.splice(0, 1);

  if (command == undefined) {
    msg.channel.send(util.format('Invalid command! Run ``%shelp`` to get a list of all commands.', config.prefix));
    return;
  }
  console.log((args) ? `client.on(msg) cmd issued: %s%s ${args}` : `client.on(m) cmd issued: %s%s`, config.prefix, command);

  try {
    if (command == 'help') {
      client.commands.get(command).execute(msg, args, client, all_cmds);
      return;
    }
    if (command == 'got') {
      client.commands.get(command).execute(msg, args, client);
      return;
    } else
      client.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error('client.on(m) threw %s: %s', error.line, error);
  }
});

var parseCommand = function(cmd) {
  var str;
  client.commands.forEach(command => {
    if (command.aliases != undefined && command.aliases.indexOf(cmd) > -1) {
      str = command.name;
      return;
    }

    if (command.name.indexOf(cmd) > -1) {
      str = cmd;
      return;
    }
  });

  return str;
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

client.login(args['t']);
