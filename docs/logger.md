# logger

* simple logger to log messages with different log levels to console
* by default, the logger is enabled in NODE_ENV equals development
* by default, the log level is set to INFO

## log levels
* TRACE: 0
* DEBUG: 1
* INFO: 2
* WARN: 3
* ERROR: 4

## configuration
configuration is being done using localstorage.
```javascript
// manually enable logger
localStorage.setItem("logEnabled", 1);

// set log level (to error only)
localStorage.setItem("logLevel", 4);
```

## log messages
```javascript
import logger from '../lib/logger';

logger.warn('no entries found');
// -> message will get printed if loglevel is <= 3
```