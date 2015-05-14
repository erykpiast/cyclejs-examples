'use strict';

var WATCH = true;

var gulp = require('gulp');

var createBuildTask = require('./gulp/build');
var createTestTask = require('./gulp/test');
var webserverTask = require('./gulp/web-server');

gulp.task('webserver', webserverTask);

gulp.task('test:once', createTestTask(!WATCH));
gulp.task('test:watch', createTestTask(WATCH));

gulp.task('build:once', createBuildTask(!WATCH));
gulp.task('build:watch', createBuildTask(WATCH));

gulp.task('default', [ 'build:watch', 'webserver' ]);
