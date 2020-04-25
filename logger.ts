// different log levels
enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  SILENT = 5,
}

// logger
class Logger {
  logLevel : LogLevel;

  constructor() {
    const level = localStorage.getItem('loglevel');
    this.logLevel = LogLevel.INFO;
    if (level) {
      const l = parseInt(level, 10);
      if ((l as LogLevel)) {
        this.logLevel = l;
      } else {
        this.error(`invalid loglevel in localStorage: ${l}`);
      }
    }
  }

  // set log level
  setLogLevel(level : LogLevel) {
    this.logLevel = level;
    localStorage.setItem('debuglevel', level.toString());
  }

  // get log level
  getLogLevel() {
    return this.logLevel;
  }

  // log on trace level
  trace(...message : any[]) {
    this.log(LogLevel.TRACE, message);
  }

  // log on debug level
  debug(...message : any[]) {
    this.log(LogLevel.DEBUG, message);
  }

  // log on info level
  info(...message : any[]) {
    this.log(LogLevel.INFO, message);
  }

  // log on warn level
  warn(...message : any[]) {
    this.log(LogLevel.WARN, message);
  }

  // log on error level
  error(...message : any[]) {
    this.log(LogLevel.ERROR, message);
  }

  // log on given level
  log(level : LogLevel, ...message : any[]) {
    if (process.env.NODE_ENV === 'development' && level >= this.logLevel) {
      // eslint-disable-next-line no-console
      console.log(`${LogLevel[level]}: ${message}`);
    }
  }
}

export default new Logger();
