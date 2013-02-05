var $ = require('jquery-browserify');
var tb = require('./index');

tb.apiKey = '7d2c4ce01927fdfb17eca3deead4fc2f';

tb({
  template: $('#custom-template')
}, function(err, data, html) {
  $('.tradebox').empty().html(html);
  this.recurse($('.tradebox').find('a'));
});