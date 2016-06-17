#!/usr/bin/env node

var growl = require('../lib/growl')
  , program = require('commander')
  , pkg = require('../package.json');

program
  .version(pkg.version)
  .option('-t --title <title>', 'Notifcation title')
  .option('-a --app <name>', 'Application name')
  .option('-s --sticky', 'Whether or not the notication should remain until closed')
  .option('-i --image <image>', 'Auto-detects the context:\n\t\t\tpath to an icon sets --iconpath\n\t\t\tpath to an image sets --image\n\t\t\tcapitalized word sets --appIcon\n\t\t\tfilename uses extname as --icon\n\t\t\totherwise treated as --icon')
  .option('-p --priority <priority>', 'Priority for the notification (default is 0)')
  .option('-e --exec <command>', 'manually specify a shell command instead\n\t\t\tappends message to end of shell command\n\t\t\tor, replaces %s with message\n\t\t\toptionally prepends title (example: title: message)\n\t\t\texamples: --exec "tmux display-message" --exec "echo \'%s\' > messages.log"')
  .arguments('<message>')
  .action(notify)
  .parse(process.argv);

if (program.args.length < 1) program.help();

function notify(message) {
  var options = {};
  ['title', 'app', 'sticky', 'image', 'priority', 'exec'].forEach(function (option) {
    if (program[option]) options[option] = program[option];
  });
  console.log(options, message);
  growl(message, options);
}
