'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var connect = require('gulp-connect');

var extend = require('extend');
var merge = require('merge-stream');

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var brfs = require('brfs');

var config = require('./config');

var lint = require('./lint');
var buildCssTask = require('./css');

function createBundler(watch) {
    var bundler = browserify(config.src.js.main, extend({
        debug: true,
        entry: true
    }, watch ? watchify.args : { }));
    
    if(watch) {
        bundler = watchify(bundler);
    }

    bundler = bundler
    .transform(brfs)
    .transform(babelify.configure({
        only: /^(?!.*node_modules)+.+\.js$/,
        sourceMap: 'inline',
        sourceMapRelative: __dirname
    }));
    
    if(watch) {
        bundler = bundler.on('update', watch);
    }

    return bundler;
}

module.exports = function createBuildTask(watch) {
    var isBuilding = false;
    var bundler = createBundler(watch && function(changedFiles) {
        gutil.log('building is starting...');

        if(changedFiles) {
            gutil.log([ 'files to rebuild:' ].concat(changedFiles).join('\n'));
        }

        if(!isBuilding) {
            isBuilding = true;

            return lint(gulp.src(changedFiles))
                .on('finish', function() {
                    console.log('building changed files...');
                    
                    return bundler.bundle()
                    .on('error', function(err) {
                        isBuilding = false;
                        
                        gutil.log('Building error', err.message);
                    })
                    .on('end', function() {
                        isBuilding = false;
                        
                        gutil.log('Building finished!');
                    })
                    .pipe(source(config.dist.js.bundleName))
                    .pipe(gulp.dest(config.dist.js.dir))
                    .pipe(connect.reload());
                });
        } else {
            return null;
        }
    });
    
    return function buildTask() {
        return merge(buildCssTask(watch),
            lint(gulp.src(config.src.js.files))
            .on('finish', function() {
                return bundler.bundle()
                .on('error', function(err) {
                    gutil.log('Browserify error:', err.message);
                })
                .on('end', function() {
                    gutil.log('Building finished!');
                })
                .pipe(source(config.dist.js.bundleName))
                .pipe(gulp.dest(config.dist.js.dir))
                .pipe(connect.reload())
            })
        );
    };
};
