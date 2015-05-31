'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat')
var connect = require('gulp-connect');

var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var config = require('./config');

module.exports = function buildCssTask(watch) {
    if(watch === true) {
        gutil.log('Changes in CSS will be watched!');

        gulp.watch(config.src.css.files, buildCssTask);
    }

    gutil.log('Building CSS started!');

    return gulp.src(config.src.css.index)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: [ '> 1%', 'last 2 versions' ],
            cascade: false
        }))
        .pipe(concat(config.dist.css.bundleName))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.dist.css.dir))
        .on('error', function(err) {
            gutil.log('CSS building error:', err);
        })
        .on('finish', function() {
            gutil.log('Building CSS finished!');
        })
        .pipe(connect.reload());
};
