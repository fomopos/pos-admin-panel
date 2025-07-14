// Version utility to get application version
export const getVersion = (): string => {
  // During build, Vite will replace this with the actual version from package.json
  return import.meta.env.VITE_APP_VERSION || '0.1.0';
};

export const getVersionWithPrefix = (): string => {
  return `v${getVersion()}`;
};
