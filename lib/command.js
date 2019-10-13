const path = require('path');
const fs = require('fs');

const { setupCommand } = require('./util.js');

function buildImageArguments(image, commandType, icon) {
  const args = [];
  if (!image) return args;
  const imagePath = path.resolve(image);
  try {
    fs.accessSync(imagePath);
  } catch (error) {
    console.warn(
      `Icon provided can not be found on file system, please verify give path: '${imagePath}'`
    );
    return args;
  }
  switch (commandType) {
    case 'Darwin-Growl': {
      args.push(icon, imagePath);
      break;
    }
    case 'Darwin-NotificationCenter':
      args.push(icon, imagePath);
      break;
    case 'Linux':
      args.push(icon, imagePath);
      break;
    case 'Windows':
      args.push(icon + imagePath);
      break;
    default:
      break;
  }
  return args;
}

function buildStickyArguments(isSticky, stickyFlag, templateType) {
  const args = [];
  const isLinuxCommand = templateType === 'Linux';
  if (isSticky) {
    args.push(stickyFlag);
    if (isLinuxCommand) {
      args.push('0');
    }
  } else if (isLinuxCommand) {
    // libnotify defaults to sticky, set a hint for transient notifications
    args.push('--hint=int:transient:1');
  }
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
  } else {
    commandTemplate = setupCommand();
  }
  return commandTemplate;
}

function buildMessageArgumentsWindows(
  escapedMessage,
  options,
  commandTemplate
) {
  const args = [];
  args.push(escapedMessage);
  if (options.title) args.push(commandTemplate.title + options.title);
  if (options.url) args.push(commandTemplate.url + options.url);
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
    args.push(
      commandTemplate.host.commandTemplate,
      commandTemplate.host.hostname
    );
  }
  return args;
}

function buildMessageArgumentsDarwinG(
  commandTemplate,
  escapedMessage,
  options
) {
  const args = [];
  args.push(commandTemplate.msg);
  args.push(escapedMessage);
  if (options.title) args.push(options.title);
  if (options.url) {
    args.push(commandTemplate.url);
    args.push(options.url);
  }
  return args;
}

function buildMessageArgumentsDarwinNC(
  commandTemplate,
  escapedMessage,
  options
) {
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

function customCommandHasSubstitutions(customCommand) {
  return customCommand.indexOf('%s') > -1;
}

function buildMessageArgumentsCustomCommand(message, options, commandTemplate) {
  const args = [];
  message = options.title ? `${options.title}: ${message}` : message;
  const fullCommand = commandTemplate.pkg.replace(
    /(^|[^%])%s/g,
    `$1${message}`
  );
  const splitCmd = fullCommand.split(' ');
  splitCmd.shift();
  Array.prototype.push.apply(args, splitCmd);
  if (!customCommandHasSubstitutions(commandTemplate.pkg)) {
    args.push(message);
  }
  return args;
}

function buildMessageArguments(options, commandTemplate, message) {
  let messageArguments;
  const escapedMessage = message.replace(/\\n/g, '\n');
  switch (commandTemplate.type) {
    case 'Darwin-Growl': {
      messageArguments = buildMessageArgumentsDarwinG(
        commandTemplate,
        escapedMessage,
        options
      );
      break;
    }
    case 'Darwin-NotificationCenter': {
      messageArguments = buildMessageArgumentsDarwinNC(
        commandTemplate,
        escapedMessage,
        options
      );
      break;
    }
    case 'Linux-Growl': {
      messageArguments = buildMessageArgumentsLinuxG(
        commandTemplate,
        escapedMessage,
        options
      );
      break;
    }
    case 'Linux': {
      messageArguments = buildMessageArgumentsLinux(options, escapedMessage);
      break;
    }
    case 'Windows': {
      messageArguments = buildMessageArgumentsWindows(
        escapedMessage,
        options,
        commandTemplate
      );
      break;
    }
    case 'Custom':
      messageArguments = buildMessageArgumentsCustomCommand(
        message,
        options,
        commandTemplate
      );
      break;
    default:
      break;
  }
  return messageArguments;
}

function buildPriorityArguments(priorityValue, priorityFlag) {
  const args = [];
  if (priorityValue) {
    const priority = `${priorityValue}`;
    const checkIndexOf = priorityFlag.range.indexOf(priority);
    if (checkIndexOf > -1) {
      args.push(priorityFlag, priorityValue);
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
    return [];
  }
  const args = [];

  const imageArguments = buildImageArguments(
    options.image,
    commandTemplate.type,
    commandTemplate.icon
  );
  Array.prototype.push.apply(args, imageArguments);

  const stickyArguments = buildStickyArguments(
    options.sticky,
    commandTemplate.sticky,
    commandTemplate.type
  );
  Array.prototype.push.apply(args, stickyArguments);

  const priorityArguments = buildPriorityArguments(
    options.priority,
    commandTemplate.priority
  );
  Array.prototype.push.apply(args, priorityArguments);

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
    [commandExecutable] = commandExecutable.split(' ');
  }

  args.unshift(commandExecutable);
  return args;
}

module.exports = {
  buildCommand,
};
