'use strict';

// Growl - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

/**
 * Module dependencies.
 */

const spawn = require('child_process').spawn;
const setupCommand = require("./util").setupCommand;

/**
 * Send growl notification _msg_ with _options_.
 *
 * Options:
 *
 *  - title   Notification title
 *  - sticky  Make the notification stick (defaults to false)
 *  - priority  Specify an int or named key (default is 0)
 *  - name    Application name (defaults to growlnotify)
 *  - sound   Sound effect ( in OSx defined in preferences -> sound -> effects)
 *            works only in OSX > 10.8x
 *  - image
 *    - path to an icon sets --iconpath
 *    - path to an image sets --image
 *    - capitalized word sets --appIcon
 *    - filename uses extname as --icon
 *    - otherwise treated as --icon
 *
 * Examples:
 *
 *   growl('New email')
 *   growl('5 new emails', { title: 'Thunderbird' })
 *   growl('5 new emails', { title: 'Thunderbird', sound: 'Purr' })
 *   growl('Email sent', function(){
 *     // ... notification sent
 *   })
 *
 * @param {string} msg
 * @param {object} opts
 * @param {function} callback
 * @api public
 */

function growl(msg, opts, callback) {
  const fn = callback || function noop() {};
  const args = buildCommand(msg, opts, fn);

  executeCommand(args, fn);
}

function buildImageArguments(image, commandType, icon, notSticky) {
  let args = [];
  if (image) {
    switch (commandType) {
      case 'Darwin-Growl': {
        args.push(icon, image);
        break;
      }
      case 'Darwin-NotificationCenter':
        args.push(icon, image);
        break;
      case 'Linux':
        args.push(icon, image);
        // libnotify defaults to sticky, set a hint for transient notifications
        if (notSticky) args.push('--hint=int:transient:1');
        break;
      case 'Windows':
        args.push(icon + image);
        break;
      default:
        break;
    }
  }
  return args;
}

function buildCommand(msg, opts, fn) {
  const options = opts || {};

  const commandTemplate = chooseCommandTemplate(options);

  // noop
  if (!commandTemplate) {
    fn(new Error('growl not supported on this platform'));
    return;
  }
  const args = [];

  const imageArguments = buildImageArguments(options.image, commandTemplate.type, commandTemplate.icon, !options.sticky)
  Array.prototype.push.apply(args, imageArguments);

  // sticky
  if (options.sticky) args.push(commandTemplate.sticky);
  if (options.sticky && commandTemplate.type === 'Linux') args.push('0');

  // priority
  if (options.priority) {
    const priority = `${options.priority}`;
    const checkIndexOf = commandTemplate.priority.range.indexOf(priority);
    if (checkIndexOf > -1) {
      args.push(commandTemplate.priority, options.priority);
    }
  }

  // sound
  if (options.sound && commandTemplate.type === 'Darwin-NotificationCenter') {
    args.push(commandTemplate.sound, options.sound);
  }

  // name
  if (options.name && commandTemplate.type === 'Darwin-Growl') {
    args.push('--name', options.name);
  }

  const messageArguments = buildMessageArguments(options, commandTemplate, msg);
  Array.prototype.push.apply(args, messageArguments);

  let commandExecutable = commandTemplate.pkg;
  if (commandTemplate.type === 'Custom') {
    commandExecutable = commandExecutable.split(' ')[0]
  }

  args.unshift(commandExecutable);
  return args;
}

function chooseCommandTemplate(options) {
  let commandTemplate;
  if (options.exec) {
    commandTemplate = {
      type: 'Custom',
      pkg: options.exec,
      range: [],
    };
  }
  else {
    commandTemplate = setupCommand();
  }
  return commandTemplate;
}

function customCommandHasSubstitutions(customCommand) {
  return customCommand.indexOf('%s') > -1;
}

function buildMessageArguments(options, commandTemplate, message) {
  let messageArguments;
  const escapedMessage = message.replace(/\\n/g, '\n');
  switch (commandTemplate.type) {
    case 'Darwin-Growl':{
      messageArguments = buildMessageArgumentsDarwinG(commandTemplate, escapedMessage, options);
      break;
    }
    case 'Darwin-NotificationCenter': {
      messageArguments = buildMessageArgumentsDarwinNC(commandTemplate, escapedMessage, options);
      break;
    }
    case 'Linux-Growl':{
      messageArguments = buildMessageArgumentsLinuxG(commandTemplate, escapedMessage, options);
      break;
    }
    case 'Linux':{
      messageArguments = buildMessageArgumentsLinux(options, escapedMessage);
      break;
    }
    case 'Windows': {
      messageArguments = buildMessageArgumentsWindows(escapedMessage, options, commandTemplate);
      break;
    }
    case 'Custom':
      messageArguments = buildMessageArgumentsCustomCommand(message, options, commandTemplate);
      break;
    default:
      break;
  }
  return messageArguments;

}

function buildMessageArgumentsWindows(escapedMessage, options, commandTemplate) {
  const args = [];
  args.push(escapedMessage);
  if (options.title)
    args.push(commandTemplate.title + options.title);
  if (options.url)
    args.push(commandTemplate.url + options.url);
  return args;
}

function buildMessageArgumentsLinux(options, escapedMessage) {
  const args = [];
      if (options.title) args.push(options.title);
  args.push(escapedMessage);
  return args;
}

function buildMessageArgumentsLinuxG(commandTemplate, escapedMessage, options) {
  const args = [];
  args.push(commandTemplate.msg);
  args.push(escapedMessage);
  if (options.title) args.push(options.title);
  if (commandTemplate.host) {
    args.push(commandTemplate.host.commandTemplate, commandTemplate.host.hostname);
  }
  return args;
}

function buildMessageArgumentsDarwinG(commandTemplate, escapedMessage, options) {
  const args = [];
  args.push(commandTemplate.msg);
  args.push(escapedMessage);
  if (options.title)
    args.push(options.title);
      if (options.url) {
    args.push(commandTemplate.url);
        args.push(options.url);
      }
  return args;
}

function buildMessageArgumentsDarwinNC(commandTemplate, escapedMessage, options) {
  const args = [];
  args.push(commandTemplate.msg);
  args.push(escapedMessage);
      if (options.title) {
    args.push(commandTemplate.title);
        args.push(options.title);
      }
      if (options.subtitle) {
    args.push(commandTemplate.subtitle);
        args.push(options.subtitle);
      }
      if (options.url) {
    args.push(commandTemplate.url);
        args.push(options.url);
      }
  return args;
      }

function buildMessageArgumentsCustomCommand(message, options, commandTemplate) {
  const args = [];
  message = options.title ?
    `${options.title}: ${message}` :
    message;
  const fullCommand = commandTemplate.pkg.replace(/(^|[^%])%s/g, `$1${message}`);
  const splitCmd = fullCommand.split(' ');
  splitCmd.shift();
        Array.prototype.push.apply(args, splitCmd);
  if (!customCommandHasSubstitutions(commandTemplate.pkg)) {
        args.push(message);
      }
  return args;
}

function executeCommand(commandArguments, callback) {
  const commandToExecute = commandArguments.shift();
  const child = spawn(commandToExecute, commandArguments);
  let stdout = '';
  let stderr = '';
  let error;
  const now = new Date();
  const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
  stderr += `[${timestamp}][node-growl] : Executed command '${commandToExecute}' with arguments '${commandArguments}'\n[stderr] : `;
  child.on('error', (err) => {
    console.error('An error occurred.', err);
    error = err;
  });
  child.stdout.on('data', (data) => {
    stdout += data;
  });
  child.stderr.on('data', (data) => {
    stderr += data;
  });
  child.on('close', () => {
    if (typeof callback === 'function') {
      callback(error, stdout, stderr);
    }
  });
}

/**
 * Expose `growl`.
 */

module.exports = growl;
