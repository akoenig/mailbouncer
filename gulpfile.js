/*
 * mailbouncer
 * 
 * Copyright(c) 2014 André König <andre.koenig@posteo.de>
 * MIT Licensed
 *
 *
 */

/**
 * @author André König <andre.koenig@posteo.de>
 *
 *
 */

'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var sequence = require('run-sequence');

var paths = {};

paths.sources = ['./index.js', './gulpfile.js', './lib/**/*.js', './specs/**/*.js'];
paths.specs = ['./specs/**/*.spec.js'];

gulp.task('lint', function () {
    return gulp.src(paths.sources)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('test', function () {
    return gulp.src(paths.specs)
        .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('default', function (callback) {
    return sequence('lint', 'test', callback);
});
