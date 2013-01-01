/**
 * tradebox
 * A 750 Tradebox API plugin
 *
 * @author Kyle Robinson Young <kyle at 750group.com>
 * @version 0.3.0
 */
 define('tradebox', ['jquery', 'lodash'], function($, _) {
  'use strict';

  // main
  function TradeBox(opts, done) {
    var self = this;
    if (typeof opts === 'function') {
      done = opts;
      opts = {};
    }
    opts = opts || {};

    // default values
    self.opts = opts;
    self.apiKey = opts.apiKey || tb.apiKey;
    tb.apiKey = self.apiKey;
    self.url = opts.url || 'http://750tradebox.com/apis/index/';
    self.path = opts.path || '';
    self.template = opts.template || 'main';
    self.templates = _.defaults(self.templates, opts.templates || {});

    if (_.isEmpty(self.apiKey)) {
      return done(new Error('Please specify an 750 Tradebox API key'));
    }

    // get data
    self.get(self.path, function(err, data) {
      var tpl = '';
      if (self.template !== false) {
        tpl = _.template(self.templates[self.template], data);
      }
      return done.apply(self, [null, data, tpl]);

      var files = data.Dropbox.contents || [];
      for (var i = 0; i < files.length; i++) {
        var template = self.buildTemplate(files[i], opts);
        var li = $(template);
        $(el).append(li);
        if (opts.recursive > 0) {
          var newOpts = $.extend({}, opts);
          newOpts.recursive--;
          newOpts.path = files[i]['path'];
          newOpts.dirTemplate = '<li class="t750-directory-name">{{name}}{{nested}}</li>';
          new TradeBox($('ul', li).get(0), newOpts);
        }
      }
    });
  }

  // function to export
  function tb(opts, done) { return new TradeBox(opts, done); }
  tb.Tradebox = TradeBox;
  tb.apiKey = '';
  tb.cls = { dir: 'tradebox-dir', file: 'tradebox-file' };

  // get data from 750 tradebox
  TradeBox.prototype.get = function(path, done) {
    var self = this;
    var url = self.url + self.apiKey + '/' + path + '.json?callback=?';
    $.getJSON(url, function(data) {
      data = data.Dropbox || {};
      data.contents = data.contents || [];
      done(null, data);
    });
  };

  // recursively load dirs
  TradeBox.prototype.recurse = function(elems, levels) {
    var self = this, opts = self.opts, levels = levels || 0;
    elems.each(function() {
      var el = this;
      opts.path = $(el).data('path');
      tb(opts, function(err, data, html) {
        if (data.contents.length > 0) {
          $(el).append(html);
          if (levels > 0) {
            self.recurse($(el).find('.' + tb.cls.dir), --levels);
          }
        }
      });
    });
  };

  // built-in templates
  TradeBox.prototype.templates = {
    main: [
    '<ul>',
      '<% _.each(contents, function(file) { %>',
        '<% if (file.is_dir) { %>',
          '<li class="' + tb.cls.dir + '" data-path="<%= file.path %>">',
            '<a href="<%= file.download_link %>"><%= file.name %></a>',
          '</li>',
        '<% } else { %>',
          '<li class="' + tb.cls.file + '" data-path="<%= file.path %>">',
            '<a href="<%= file.download_link %>" target="_blank"><%= file.name %></a>',
          '</li>',
        '<% } %>',
      '<% }); %>',
    '</ul>'
    ].join('')
  };

  // return module
  return tb;
});