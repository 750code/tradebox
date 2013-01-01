# tradebox

A [750 Tradebox](http://750tradebox.com) API plugin.

## example

```html
<!-- container for it -->
<div class="tradebox">Loading...</div>

<!-- load up jam requirejs -->
<script src="jam/require.js"></script>

<script>
require(['jquery', 'tradebox'], function($, tb) {
  
  // set your api key
  tb.apiKey = '7d2c4ce01927fdfb17eca3deead4fc2f';

  // get tradebox dirs/files
  tb(function(err, data, html) {

    // clear and put the html into your container
    $('.tradebox').empty().html(html);

    // recursively append the template for dirs
    this.recurse($('.tradebox').find('.tradebox-dir'));

  });

});
</script>
```

## methods

### `tradebox([options,] callback)`

#### `callback(err, data, html)`
* `err` If an error
* `data` Object of raw data from tradebox
* `html` Templated HTML

#### `options`
* `path` Path to get files from.
* `apiKey` Set your api key.
* `url` Specify a different API URL. Defaults to `'//750tradebox.com/apis/index/'`.
* `template` String of the template you wish to use. Defaults to `'main'`.
* `templates` An object of templates.

##### `templates`
Templates are underscore/lodash templates with `data` from the callback passed
to them. To add your own new template do:

```js
var templates = {
  mytpl: [
    '<% _.each(contents, function(file) { %>',
      '<div><%= file.name %></div>',
    '<% }); %>'
  ].join('')
};
```

### `Tradebox.recurse(elements[, levels])`
Easiest to call recurse within the `callback` with `this.recurse()`.

* `elements` List of elements to recurse on, ie: `$('.tradebox-dirs')`
* `levels` Amount of dir levels to recurse down. Default is `0`.

## install
With [jam](http://jamjs.org):

```
$ jam install tradebox
```

## license
Copyright (c) 2013 750 Group, LLC 
Licensed under the MIT license.
