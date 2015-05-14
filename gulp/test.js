'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var karma = require('gulp-karma');

var glob = require('glob');
var extend = require('extend');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var multipipe = require('multipipe');
var addSrc = require('gulp-add-src');
var buffer = require('vinyl-buffer');

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var brfs = require('brfs');

var config = require('./config');

var lint = require('./lint');

function createBundler(watch) {
    var bundler = browserify(extend({
        debug: true,
        entry: true
    }, watch ? watchify.args : { }));
    
    if(watch) {
        bundler = watchify(bundler);
    }

    glob.sync(config.test.files).forEach(function(filePath) {
        bundler = bundler.add(filePath);
    });

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

function runTests(tests) {
    return multipipe(
        source(config.test.bundle.name),
        buffer(),
        addSrc(config.test.runtime),
        concat(config.test.bundle.name),
        gulp.dest(config.test.bundle.dir),
        karma({
            configFile: config.test.runnerConfig,
            action: 'run'
        })
        .on('error', function(err) {
            gutil.log('Karma error:', err.message);
        })
    );
}

module.exports = function createBuildTestsTask(watch) {
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
                    return bundler.bundle()
                    .pipe(runTests())
                    .on('error', function(err) {
                        isBuilding = false;
                        
                        gutil.log('Building error', err.message);
                    })
                    .on('end', function() {
                        isBuilding = false;
                        
                        gutil.log('Building finished!');
                    });
                });
        } else {
            return null;
        }
    });
    
    return function buildTestsTask() {
        return lint(gulp.src(config.test.files))
            .on('finish', function() {
                return bundler.bundle()
                    .on('error', function(err) {
                        gutil.log('Browserify error:', err.message);
                    })
                    .on('end', function() {
                        gutil.log('Building finished!');
                    })
                    .pipe(runTests());
            });
    };
};
