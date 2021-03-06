'use strict';

var connect = require('gulp-connect');

var config = require('./config');

module.exports = function webServerTask() {
    connect.server({
        root: [ config.dist.dir ],
        livereload: true
    });
};