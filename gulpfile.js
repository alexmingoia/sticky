/*!
 * sticky
 * https://github.com/alexmingoia/sticky
 */

'use strict';

var gulp = require('gulp-help')(require('gulp'));
var Browserify = require('browserify');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var source = require('vinyl-source-stream');
var spawn = require('child_process').spawn;
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var stylish = require('jshint-stylish');

gulp.task('jshint', 'Lint code semantics with JSHint.', function () {
  return gulp.src(['lib/**/*.js', 'test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('jscs', 'Lint code style with JSCS.', function () {
  return gulp.src(['lib/**/*.js', 'test/**/*.js'])
    .pipe(jscs());
});

gulp.task('lint', 'Lint code semantics and style.', ['jshint', 'jscs']);

gulp.task('wrap-umd', 'Wrap module in UMD.', function () {
  var bundler = new Browserify({
    standalone: 'StickyStore'
  });

  bundler.add('./lib/sticky.js');
  bundler.exclude('../lib-cov/sticky');

  return bundler.bundle()
    .pipe(source('sticky.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist', ['wrap-umd']);

gulp.task('browserify-tests', 'Browserify tests.', function () {
  var bundler = new Browserify();

  bundler.add('./test/sticky.js');
  bundler.exclude('../lib-cov/sticky');

  return bundler.bundle()
    .pipe(source('tests.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task(
  'mocha-phantomjs',
  'Run tests using mocha-phantomjs.',
  ['browserify-tests'],
  function () {
    return gulp.src('test/sticky.html')
      .pipe(mochaPhantomJS({
        mocha: {
          timeout: 6000,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'spec'
        }
      }));
  });

gulp.task('test', 'Run tests and clean-up.', ['mocha-phantomjs'], function () {
  return gulp.src('dist/tests.js').pipe(clean());
});

gulp.task('instrument', 'Instrument code using jscoverage.', function () {
  return gulp.src('lib/**/*.js')
    .pipe(instrument())
    .pipe(gulp.dest('lib-cov'));
});

gulp.task(
  'watch',
  'Watch for code changes and run linters and tests',
  ['jshint', 'jscs', 'test'],
  function () {
    gulp.watch(['lib/**/*.js', 'test/**/*.js'], ['jshint', 'jscs', 'test']);
  });

gulp.task('clean', 'Clean-up generated files.', function () {
  return gulp.src(['lib-cov', 'coverage.html', 'npm-debug.log']).pipe(clean());
});

gulp.task('default', [process.env.NODE_ENV === 'production' ? 'dist' : 'watch']);
