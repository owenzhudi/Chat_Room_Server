/**
 *
 * Environment Config
 *
 */

const env = {
  production: {
    name: 'production',
    port: 8000
  },
  dev: {
    name: 'dev',
    port: 8001
  },
  test: {
    name: 'test',
    port: 8002
  }
};

module.exports = env[process.env.NODE_ENV];
