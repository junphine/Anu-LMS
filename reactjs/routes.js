const routes = module.exports = require('next-routes')(); // eslint-disable-line no-multi-assign

// @see https://github.com/fridays/next-routes
// Additional dynamic routes.
routes
  .add('_course', '/course/:course')
  .add('_courseResource', '/course/resources/:course')
  .add('_lesson', '/course/:course/:lesson')
  .add('user_reset', '/user/reset/:uid/:timestamp/:hash', 'user/reset');

