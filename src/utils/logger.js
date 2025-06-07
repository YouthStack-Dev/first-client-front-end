// src/utils/logger.js

const LOG_LEVEL = import.meta.env.VITE_APP_LOG_LEVEL || 'debug';

const levels = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

const currentLevel = levels[LOG_LEVEL.toLowerCase()] ?? 4; // default debug

export const error = (...args) => {
  if (currentLevel >= levels.error) console.error(...args);
};

export const warn = (...args) => {
  if (currentLevel >= levels.warn) console.warn(...args);
};

export const info = (...args) => {
  if (currentLevel >= levels.info) console.info(...args);
};

export const log = (...args) => {
  if (currentLevel >= levels.debug) console.log(...args);
};
