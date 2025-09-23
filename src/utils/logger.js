
const LOG_LEVEL = import.meta.env.VITE_APP_LOG_LEVEL || 'debug';

const levels = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

const currentLevel = levels[LOG_LEVEL.toLowerCase()] ?? 4; // default to debug

export const logError = (...args) => {
  if (currentLevel >= levels.error) console.error(...args);
};

export const logWarning = (...args) => {
  if (currentLevel >= levels.warn) console.warn(...args);
};

export const logInfo = (...args) => {
  if (currentLevel >= levels.info) console.info(...args);
};

export const logDebug = (...args) => {
  if (currentLevel >= levels.debug) console.log(...args);
};
