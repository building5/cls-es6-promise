# cls-es6-promise

[cls-es6-promise][] provides a shim layer for [es6-promise][] so that it
will work with [continuation-local-storage][]. It does this by binding
all callbacks passed to `then` and `catch` with a CLS namespace.

```js
var cls = require('continuation-local-storage');
var ns = cls.createNamespace('NODESPACE');

var Promise = require('es6-promise').Promise;
// or require('es6-promise').polyfill();

// load shim
require('cls-es6-promise')(ns);
```

## tests

The tests can be run with `npm test`.

 [cls-es6-promise]: https://www.npmjs.com/package/cls-es6-promise
 [es6-promise]: https://www.npmjs.com/package/es6-promise
 [continuation-local-storage]: https://www.npmjs.com/package/continuation-local-storage
