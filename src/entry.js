const helper = require('./helper.js');
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

require('config.json')('./config.json');
if (config.debug && !args["d"]) {
  const child_process = require('child_process');
  console.log(" * Restarting bot in debug mode...");

  var forkArgs = ['--inspect', '.'];
  forkArgs.push("--t=" + args['t']);
  forkArgs.push("--d=fbi.gov");

  var subproc = child_process.spawnSync(process.argv.shift(), forkArgs, {
    cwd: process.cwd(),
    stdio: "inherit",
    windowsHide: false
  });

  process.exit();
}

var all_cmds = {};
client.on('ready', () => {
  if (require('config.json')('./config.json'))
    console.log(" * Sucessfully parsed config.json");

//TODO: Check against MD5 hashes to migate attack vector
  const cmds = fs.readdirSync('./src/commands/').filter(file => file.endsWith('.js'));
  for (const file of cmds) {
    const cmd = require(util.format('./commands/%s', file));
    if (cmd.name == undefined)
      continue;

    client.commands.set(cmd.name, cmd);
  }

  // Allocate a map and map every command and its category (cmd.aliases[0])
  fields = new Map();
  client.commands.forEach((command) => {
    var category = command.group; // Category is always the first alias
    if (!all_cmds.hasOwnProperty(category))
      all_cmds[category] = []; // Allocate category before we add

    var string = util.format("``%s%s", config.prefix, command.name);
    string += ((command.aliases != undefined && command.aliases.length > 0) ? util.format(", %s%s", config.prefix, command.aliases) : "")
    string += ((command.usage) && command.usage.includes('<') && command.usage.includes('>') ? util.format(" %s", command.usage) : "")
    string += util.format("`` - %s", command.description);

    all_cmds[category].push(string);
  });

  client.user.setPresence({
    game: {
      name: `${config.prefix}help  |  .js v${require("./../package").version}`
    },
    status: 'dnd'
  });

  if (require('uws')) console.log(" * Established uWS module");
  console.log(' * Ready as { %s%s%s } (Press CTRL+C to quit)', helper.Colors.FG_CYAN, client.user.tag, helper.Colors.FN_RESET);
});

//TODO: work on logger?
//TODO: Helper.js and global bot state to share across shards
//TODO: Sharding eventually
//TODO: Bot whois that shows its current shard / gateway
//TODO: Work on command system that deals with arguments better

client.on('message', msg => {
  if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;

  const channel = msg.channel;

  var args = (msg.content.slice(config.prefix.length).trim().split(/ +/g));
  command = parseCommand(args[0].toLowerCase());
  args.splice(0, 1);

  if (command == undefined) {
    channel.send(invalidCommand());
    return;
  }

  console.log((args) ? `client.on(msg) issued command: %s%s ${args}` : `client.on(m) issued command: %s%s`, config.prefix, command);

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
    if (error.includes('ArgError:')) {
      channel.send(invalidArgument(error.split('ArgError:')[1]));
      return;
    }

    (error.line) ? console.error('client.on(msg) threw %s: %s', error.line, error) : console.error('client.on(msg) threw: %s', error);
  }
});

// return invalid command string
function invalidCommand() {
  return util.format('Invalid command! Run ``%shelp`` to get a list of valid commands.', config.prefix);
}

// return invalid argument string
function invalidArgument(arg) {
  return util.format('Argument ``%s`` %s. Run ``%shelp`` to get a list of valid arguments.', arg.split('|')[0], arg.split('|')[1], config.prefix);
}

function parseCommand(cmd) {
  let exit = null;
  client.commands.forEach((command) => {
    if (command.name == cmd) {
      exit = command.name;
      return;
    }

    if (command.aliases != undefined && command.aliases.includes(cmd)) {
      exit = command.name;
      return;
    }
  });

  return exit;
}

client.login(args['t']);
