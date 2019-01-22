'use strict';

// define gulp plugins
const gulp         = require('gulp'),
	  plumber      = require('gulp-plumber'),
	  sass         = require('gulp-sass'),
	  sourcemaps   = require('gulp-sourcemaps'),
	  autoprefixer = require('gulp-autoprefixer'),
	  rename       = require('gulp-rename'),
	  csso         = require('gulp-csso'),
	  uglify       = require('gulp-uglify'),
	  babel        = require("gulp-babel"),
	  svgo         = require('gulp-svgo'),
	  svgSprite    = require("gulp-svg-sprites"),
	  pump         = require("pump"),
	  browserSync  = require('browser-sync').create(),
	  reload       = browserSync.reload;

// define global path for source, destination and watching
const path = {
	dist: {
		css        : 'dist/css/',
		js         : 'dist/js/',
		svg        : 'dist/images/icons/svg/'
	},
	assets: {
		scss       : 'assets/scss/*.scss',
		js         : 'assets/js/*.js',
		svg        : 'assets/images/svg/*.svg'
	},
	watch: {
		scss       : 'assets/scss/**/*.scss',
		js         : 'assets/js/**/*.js',
		svg        : 'assets/images/svg/*.svg'
	}
};

// define partials for autoprefixer
const autoprefixerSettings = {
	browsers: [
		'last 2 versions',
		'iOS 7'
	],
	cascade: false
};

//init local server
gulp.task('serve', () => {
	browserSync.init({
		server: {
			baseDir: './'
		}
	});

	// watch any changes in .html, css, js files and reload browser
	browserSync.watch("*.html").on("change", reload);
	browserSync.watch('dist/**/*.*').on('change', reload);
});

// compile scss in to css, minify, autoprefixer, rename, sourcemaps
gulp.task('scss', cb => {
	pump([
		gulp.src(path.assets.scss),
		plumber(),
		sourcemaps.init(),
		sass(),
		csso({restructure: false}),
		autoprefixer(autoprefixerSettings),
		rename({suffix: '.min'}),
		sourcemaps.write(),
		gulp.dest(path.dist.css)
	], cb);
});

// compile js(ES6) to js(ES5), minify, rename, sourcemaps
gulp.task('js', cb => {
	pump([
		gulp.src(path.assets.js),
		plumber(),
		sourcemaps.init(),
		babel(),
		uglify(),
		rename({suffix: '.min'}),
		sourcemaps.write(),
		gulp.dest(path.dist.js)
	], cb);
});

// create svg sprite from svg files
gulp.task('svg-sprite', cb => {
	pump([
		gulp.src(path.assets.svg),
		svgSprite({
			mode: "symbols",
			preview: false,
			svgId: "icon-%f",
			svg: {
				symbols: "symbol-defs.svg"
			}
		}),
		svgo({
			plugins: [
				{removeViewBox: false},
				{cleanupIDs: false},
				{removeTitle: true}
			]
		}),
		gulp.dest(path.dist.svg)
	], cb);
});

// watch any changes in scss, javascript files
gulp.task('watch', () => {
	gulp.watch(path.watch.scss, gulp.series('scss'));
	gulp.watch(path.watch.js, gulp.series('js'));
	gulp.watch(path.watch.svg, gulp.series('svg-sprite'));
});

// define default task
gulp.task('default', gulp.series(
	gulp.parallel('scss', 'js', 'svg-sprite'),
	gulp.parallel('watch', 'serve')
));