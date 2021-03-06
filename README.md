# node-deliedit
Node js delimited text editing library.

[![npm version](https://badge.fury.io/js/deliedit.svg)](https://badge.fury.io/js/deliedit)
[![Build Status](https://travis-ci.org/edin-m/node-deliedit.svg?branch=master)](https://travis-ci.org/edin-m/node-deliedit)

Node js library for editing stream of text based on delimiters.

For example: 

```
...
<html lang="en">
...
    before delimiter

    <!-- startedit: html -->

    in delimiter

    <!-- endedit: html -->

    after delimiter
...
</html>
```

with:

```
var Deliedit = require('deliedit').Deliedit;
var uppercase = function(char) { return char.toUpperCase(); };

var deliedit = new Deliedit({
  delimiters: {
    start: '<!-- startedit: html -->',
    end: '<!-- endedit: html -->'
  },
  invert: false,
  withDelimiters: true,
  transformFunc: uppercase
});

fs.createReadStream('in.html').pipe(deliedit).pipe(process.stdout);
```

results in:
```
...
<html lang="en">
...
    before delimiter

    <!-- startedit: html -->

    IN DELIMITER

    <!-- endedit: html -->

    after delimiter
...
</html>
```

Options
===
```
var deliedit = new Delimiter(opts);
```

where:
- *opts.delimiter.start* - start delimiter
- *opts.delimiter.end* - end delimiter
- *opts.invert* - apply transformation function to inside delimiter (if false) or outside delimiter (if true)
- *opts.withDelimiters* - include delimiters themselves in output
- *opts.transformFunc* - transformation function: passthrough, ignorechar, uppercase available - defaults to passthrough

- *opts.transform* - DEPRECATED

TODO
===

 - Add support for some other internal transformations
   eg.  html comment / uncomment
        js comment / uncomment
