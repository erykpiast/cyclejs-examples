'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');


module.exports = function lintTask(tests) {
    gutil.log('linting is starting...');

    return tests
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .on('error', function(err) {
            gutil.log('linter error:', err.message);
        })
        .on('finish', function(e) {
            gutil.log('linting finished!');
        });
};
