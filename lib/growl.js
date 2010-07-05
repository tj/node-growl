
// Growl - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

/**
 * Module dependencies.
 */

var child_process = require('child_process'),
    path = require('path')

/**
 * Node-growl version.
 */

exports.version = '1.0.2'
  
/**
 * Fetch the binary version when available.
 *
 * @param  {function} callback
 * @api public
 */
  
exports.binVersion = function(callback) {
  child_process.exec('growlnotify -v', function(err, stdout, stderr){
    if (err) callback(err)
    else callback(null, stdout)
  })
}

/**
 * Send growl notification _msg_ with _options_.
 *
 * Options:
 *
 *  - title   Notification title
 *  - sticky  Make the notification stick (defaults to false)
 *  - name    Application name (defaults to growlnotify)
 *  - image
 *    - path to an icon sets --iconpath
 *    - path to an image sets --image
 *    - capitalized word sets --appIcon
 *    - filename uses extname as --icon
 *    - otherwise treated as --icon
 *
 * Examples:
 *
 *   growl.notify('New email')
 *   growl.notify('5 new emails', { title: 'Thunderbird' })
 *   growl.notify('Email sent', function(){
 *     // ... notification sent
 *   })
 *
 * @param {string} msg
 * @param {object} options
 * @param {function} callback
 * @api public
 */

exports.notify = function(msg, options, callback) {
  var image,
      args = ['growlnotify', '-m', '"' + msg + '"'],
      options = options || {}
  exports.binVersion(function(err, version){
    if (err) return callback(err)
    if (image = options.image) {
      var flag, ext = path.extname(image).substr(1)
      flag = flag || ext == 'icns' && 'iconpath'
      flag = flag || /^[A-Z]/.test(image) && 'appIcon'
      flag = flag || /^png|gif|jpe?g$/.test(ext) && 'image'
      flag = flag || ext && (image = ext) && 'icon'
      flag = flag || 'icon'
      args.push('--' + flag, image)
    }
    if (options.sticky) args.push('--sticky')
    if (options.name) args.push('--name', options.name)
    if (options.title) args.push(options.title)
    child_process.exec(args.join(' '), callback)
  })
}
