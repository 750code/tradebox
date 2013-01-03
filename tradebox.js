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
    self.sort = opts.sort || {key:'name',dir:'asc'};

    if (_.isEmpty(self.apiKey)) {
      return done(new Error('Please specify an 750 Tradebox API key'));
    }

    // get data
    self.get(self.path, function(err, data) {
      var tpl = false;
      data = self.sortData(data);
      if (typeof self.template === 'object') {
        tpl = self.template.text();
      } else if (self.template !== false) {
        tpl = self.templates[self.template];
      }
      if (tpl !== false) tpl = _.template(tpl, data);
      return done.apply(self, [null, data, tpl]);
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
  // todo: deprecate this
  TradeBox.prototype.recurse = function(elems, levels) {
    var self = this, opts = self.opts, levels = levels || 0;
    elems.each(function() {
      var el = this;
      opts.path = $(el).data('path');
      if (opts.path === undefined) return;
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

  // sort data
  TradeBox.prototype.sortData = function(data) {
    var self = this;
    if (typeof self.sort === 'string') {
      if (self.sort === 'asc' || self.sort === 'desc') {
        self.sort = {key:'name',dir:self.sort};
      } else {
        self.sort = {key:self.sort,dir:'asc'};
      }
    }
    data.contents = _.sortBy(data.contents, function(file) { return file[self.sort.key]; });
    if (self.sort.dir === 'desc') data.contents.reverse();
    return data;
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
