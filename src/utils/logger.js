// src/utils/logger.js

const isDev = import.meta.env.DEV; // true in dev, false in prod

export const log = (...args) => {
  if (isDev) console.log(...args);
};

export const warn = (...args) => {
  if (isDev) console.warn(...args);
};

export const error = (...args) => {
  if (isDev) console.error(...args);
};

export const info = (...args) => {
  if (isDev) console.info(...args);
};
