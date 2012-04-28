# Grouple

Inspired by Google Plus Circles, Grouple aims at simplifying the creation of groupings, in the form of circles.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/jonaphin/grouple/master/dist/jquery.grouple.min.js
[max]: https://raw.github.com/jonaphin/grouple/master/dist/jquery.grouple.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.grouple.min.js"></script>

<style>
#grouple_container {
  width: 200px;
  height: 200px;
}
</style>

<div id="grouple_container"></div>

<script>
jQuery(function($) {
  $("#grouple_container").grouple(); // "initialize grouple within your container"
});
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "src" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Jonathan Lancar  
Licensed under the MIT license.
