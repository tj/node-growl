const fs = require('fs');
const path = require('path');
const os = require('os');

function which(name) {
  const paths = process.env.PATH.split(':');
  let loc;
  for (let i = 0, len = paths.length; i < len; i += 1) {
    loc = path.join(paths[i], name);
    if (fs.existsSync(loc)) return loc;
  }
  return false;
}
function setupCommandWindows() {
  return {
    type: 'Windows',
    pkg: 'growlnotify',
    msg: '',
    sticky: '/s:true',
    title: '/t:',
    icon: '/i:',
    url: '/cu:',
    priority: {
      cmd: '/p:',
      range: [-2, -1, 0, 1, 2],
    },
  };
}

function setupCommandLinux() {
  let command = null;
  if (which('growl')) {
    command = {
      type: 'Linux-Growl',
      pkg: 'growl',
      msg: '-m',
      title: '-title',
      subtitle: '-subtitle',
      host: {
        cmd: '-H',
        hostname: '192.168.33.1',
      },
    };
  } else {
    command = {
      type: 'Linux',
      pkg: 'notify-send',
      msg: '',
      sticky: '-t',
      icon: '-i',
      priority: {
        cmd: '-u',
        range: ['low', 'normal', 'critical'],
      },
    };
  }
  return command;
}

function setupCommandDarwin() {
  let command = null;
  if (which('terminal-notifier')) {
    command = {
      type: 'Darwin-NotificationCenter',
      pkg: 'terminal-notifier',
      msg: '-message',
      title: '-title',
      subtitle: '-subtitle',
      icon: '-appIcon',
      sound: '-sound',
      url: '-open',
      priority: {
        cmd: '-execute',
        range: [],
      },
    };
  } else {
    command = {
      type: 'Darwin-Growl',
      pkg: 'growlnotify',
      msg: '-m',
      sticky: '--sticky',
      url: '--url',
      priority: {
        cmd: '--priority',
        range: [
          -2,
          -1,
          0,
          1,
          2,
          'Very Low',
          'Moderate',
          'Normal',
          'High',
          'Emergency',
        ],
      },
    };
  }
  return command;
}

function setupCommand() {
  let command;
  switch (os.type()) {
    case 'Darwin':
      command = setupCommandDarwin();
      break;
    case 'Linux':
      command = setupCommandLinux();
      break;
    case 'Windows_NT':
      command = setupCommandWindows();
      break;
    default:
      command = null;
      break;
  }
  return command;
}

module.exports = {
  setupCommand,
};
