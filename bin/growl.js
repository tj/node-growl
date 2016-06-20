#!/usr/bin/env node

var growl = require('../lib/growl')
  , program = require('commander')
  , pkg = require('../package.json')
  , NEW_LINE = '\n                          ';

program
  .version(pkg.version)
  .option('-t --title <title>', 'Notifcation title')
  .option('-a --app <name>', 'Application name')
  .option('-s --sticky', 'Whether or not the notication should remain until closed')
  .option('-i --image <image>', lines(
      'Auto-detects the context:'
    , '- path to an icon sets --iconpath'
    , '- path to an image sets --image'
    , '- capitalized word sets --appIcon'
    , '- filename uses extname as --icon'
    , '- otherwise treated as --icon'
  ))
  .option('-p --priority <priority>', 'Priority for the notification (default is 0)')
  .option('-e --exec <command>', lines(
      'Manually specify a shell command instead'
    , '- appends message to end of shell command'
    , '- or, replaces %s with message'
    , '- optionally prepends title (example: title: message)'
    , '- examples: --exec "tmux display-message" --exec "echo \'%s\' > messages.log"'
  ))
  .arguments('<message>')
  .action(notify)
  .parse(process.argv);

if (program.args.length < 1) program.help();

function notify(message) {
  var options = program.options.reduce(function (options, option) {
    var name = option.name();
    if (program[name]) options[name] = program[name];
    return options;
  }, {});
  growl(message, options);
}

function lines() {
  return Array.prototype.join.call(arguments, NEW_LINE);
}
