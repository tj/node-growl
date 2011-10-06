# Growl for nodejs

Growl support for Nodejs. This is essentially a port of my [Ruby Growl Library](http://github.com/visionmedia/growl).

## Installation

  Install [npm](http://npmjs.org/) and run:
  
      $ npm -g install growl

## Examples

Callback functions are optional

    var growl = require('growl')
    growl.notify('You have mail!')
    growl.notify('5 new messages', { sticky: true })
    growl.notify('5 new emails', { title: 'Email Client', image: 'Safari', sticky: true })
    growl.notify('Set priority', { priority: 2 })
    growl.notify('Show Safari icon', { image: 'Safari' })
    growl.notify('Show icon', { image: 'path/to/icon.icns' })
    growl.notify('Show image', { image: 'path/to/my.image.png' })
    growl.notify('Show png filesystem icon', { image: 'png' })
    growl.notify('Show pdf filesystem icon', { image: 'article.pdf' })
    growl.notify('Show pdf filesystem icon', { image: 'article.pdf' }, function(){
      // ... notified
    })

## Options

  - title
    - notification title
  - name
    - application name
  - priority
    - priority for the notification (default is 0)
  - sticky
    - weither or not the notification should remainin until closed
  - image
    - Auto-detects the context:
      - path to an icon sets --iconpath
      - path to an image sets --image
      - capitalized word sets --appIcon
      - filename uses extname as --icon
      - otherwise treated as --icon
      
Fetch the current version of 'growlnotify':

    growl.binVersion(function(err, version){ ... })
    // => 'n.n.n'

## License 

(The MIT License)

Copyright (c) 2009 TJ Holowaychuk <tj@vision-media.ca>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.