'use strict';

module.exports = {
    src: {
        js: {
            files: [ './demo/index.js', './src/*/js/**/*.js', '!./src/*/js/**/spec/**/*.js' ],
            main: './demo/index.js'
        },
        css: {
            index: './src/*/css/index.scss',
            files: './src/*/css/*.scss'
        }
    },
    dist: {
        dir: './demo',
        js: {
            dir: './demo',
            bundleName: 'demo.bundle.js'
        },
        css: {
            dir: './demo',
            bundleName: 'demo.index.css'
        }
    },
    test: {
        files: './src/*/js/**/spec/**/*.spec.js',
        bundle: {
            dir: './dist',
            name: 'tests.js'
        },
        runtime: './test/phantomjs-extensions.js',
        runnerConfig: './karma.conf.js'
    }
}