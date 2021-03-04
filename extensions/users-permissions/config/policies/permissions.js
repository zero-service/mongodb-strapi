const _ = require('lodash');

module.exports = async (ctx, next) => {
  let role;

  strapi.log.info(JSON.stringify(ctx));
  strapi.log.info(JSON.stringify(ctx.request.query));

  if ((ctx.request && ctx.request.header && ctx.request.header.authorization)
    || (ctx.request && ctx.request.query.token)) {

    ctx.log.info(JSON.stringify(ctx.request));

    // ctx.request.query.token = " eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMDFlZDUzMmQzZjA0OTdkNTNiNTdkYSIsImlhdCI6MTU3NzI2ODUzOSwiZXhwIjoxNTc5ODYwNTM5fQ.KzNqQm71JBCcEJ_7hBws10oHYDEAI9-duR0hfFKyv9E1";
    try {
      let id;
      let isAdmin;

      // const {id, isAdmin = false} = await strapi.plugins[
      //   'users-permissions'
      //   ].services.jwt.getToken(ctx);
      //
      // strapi.log.info(JSON.stringify(ctx.request.header));
      // strapi.log.info(ctx.request.header.authorization);
      //
      // ctx.log.info(`id : ${id}`);
      // ctx.log.info(`isAdmin : ${isAdmin}`);

      if (ctx.request.query && ctx.request.query.token) {
        // find the token entry that match the token from the request
        const [token] = await strapi.query('token').find({token: ctx.request.query.token});

        if (!token) {
          throw new Error(`Invalid token: This token doesn't exist`);
        } else {
          if (token.user && typeof token.token === 'string') {
            id = token.user.id;
          }
          isAdmin = false;
        }

        delete ctx.request.query.token;
      } else if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
        // use the current system with JWT in the header
        const decrypted = await strapi.plugins[
          'users-permissions'
          ].services.jwt.getToken(ctx);

        id = decrypted.id;
        isAdmin = decrypted.isAdmin || false;
      }

      if (id === undefined) {
        throw new Error('Invalid token: Token did not contain required fields');
      }

      if (isAdmin) {
        ctx.state.admin = await strapi
          .query('administrator', 'admin')
          .findOne({id});
      } else {
        ctx.state.user = await strapi
          .query('user', 'users-permissions')
          .findOne({id});
      }
    } catch(err) {
      return handleErrors(ctx, err, 'unauthorized');
    }

    if (ctx.state.admin) {
      if (ctx.state.admin.blocked === true) {
        return handleErrors(
          ctx,
          'Your account has been blocked by the administrator.',
          'unauthorized'
        );
      }

      ctx.state.user = ctx.state.admin;
      return await next();
    }

    if (!ctx.state.user) {
      return handleErrors(ctx, 'User Not Found', 'unauthorized');
    }

    role = ctx.state.user.role;

    if (role.type === 'root') {
      return await next();
    }

    const store = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    if (
      _.get(await store.get({key: 'advanced'}), 'email_confirmation') &&
      !ctx.state.user.confirmed
    ) {
      return handleErrors(
        ctx,
        'Your account email is not confirmed.',
        'unauthorized'
      );
    }

    if (ctx.state.user.blocked) {
      return handleErrors(
        ctx,
        'Your account has been blocked by the administrator.',
        'unauthorized'
      );
    }
  }

  // Retrieve `public` role.
  if (!role) {
    role = await strapi
      .query('role', 'users-permissions')
      .findOne({type: 'public'}, []);
  }

  const route = ctx.request.route;
  const permission = await strapi
    .query('permission', 'users-permissions')
    .findOne(
      {
        role: role.id,
        type: route.plugin || 'application',
        controller: route.controller,
        action: route.action,
        enabled: true,
      },
      []
    );

  if (!permission) {
    return handleErrors(ctx, undefined, 'forbidden');
  }

  // Execute the policies.
  if (permission.policy) {
    return await strapi.plugins['users-permissions'].config.policies[
      permission.policy
      ](ctx, next);
  }

  // Execute the action.
  await next();
};

const handleErrors = (ctx, err = undefined, type) => {
  if (ctx.request.graphql === null) {
    return (ctx.request.graphql = strapi.errors[type](err));
  }

  return ctx[type](err);
};
