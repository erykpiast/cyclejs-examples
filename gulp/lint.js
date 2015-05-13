'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var q = require('q');

var config = require('./config');

module.exports = function lintTask(cb, files) {
    var deferred = q.defer();
    
    gutil.log('linting is starting...');

    gulp.src(files || config.src.js.files)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .on('error', function(err) {
            gutil.log('linter error:', err.message);
            
            deferred.reject(err);
        })
        .on('finish', function(e) {
            gutil.log('linting finished!');
            
            deferred.resolve(e);
        });
        
    return deferred.promise;
};
