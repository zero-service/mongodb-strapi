const Sentry = require('@sentry/node');
Sentry.init({
  dsn: 'https://9761d8e21c2b49e78a1b4e0f689861a2@sentry.io/1867200',
  environment: strapi.config.environment,
});

module.exports = strapi => {
  return {
    initialize() {
      strapi.app.use(async (ctx, next) => {
        try {
          await next();
        } catch(error) {
          Sentry.captureException(error);
          throw error;
        }
      });
    },
  };
};
