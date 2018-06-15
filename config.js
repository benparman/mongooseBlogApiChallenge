'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://ben:password1@ds261430.mlab.com:61430/mongoose-blog-api-challenge';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://ben:password1@ds261430.mlab.com:61430/mongoose-blog-api-challenge';
exports.PORT = process.env.PORT || 8080;