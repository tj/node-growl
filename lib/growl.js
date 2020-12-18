// Growl - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

'use strict';

const { spawn } = require('child_process');
const { buildCommand } = require('./command');

function executeCommand(commandArguments, callback) {
  const commandToExecute = commandArguments.shift();
  // console.log(commandToExecute, commandArguments);
  const child = spawn(commandToExecute, commandArguments);
  let stdout = '';
  let stderr = '';
  let error;
  const now = new Date();
  const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
  stderr += `[${timestamp}][node-growl] : Executed command '${commandToExecute}' with arguments '${commandArguments}'\n[stderr] : `;
  child.on('error', err => {
    console.error('An error occurred.', err);
    error = err;
  });
  child.stdout.on('data', data => {
    stdout += data;
  });
  child.stderr.on('data', data => {
    stderr += data;
  });
  child.on('close', () => {
    if (typeof callback === 'function') {
      callback(error, stdout, stderr);
    }
  });
}

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

/**
 * Expose `growl`.
 */

module.exports = growl;
