/**
 * Created by tenvine Date: 2019/12/30 Time: 10:45 上午
 */
const axios = require('axios');

module.exports = async () => {
  const {data} = await axios.get(
    'https://hub.docker.com/v2/repositories/strapi/strapi/'
  );

  strapi.log.info(JSON.stringify(data));

  await strapi.query('hit').create({
    date: new Date(),
    count: data.pull_count,
  });
};
