// Imports
const gulp = require('gulp');
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const browserSync = require('browser-sync').create();
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
// SCSS
const sass = require('gulp-sass');
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const sassLint = require('gulp-sass-lint');
// HTML
const htmlmin = require('gulp-htmlmin');
// JSON
const jsonmin = require('gulp-jsonminify');
// Images
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');
// JavaScript/ES6
const browserify = require('gulp-browserify');
const babel = require('gulp-babel');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
// Settings/Einstellungen
const PRODUCTION = false;
const IMAGE_QUALITY = 80;
// Konstanten
const SRC           = './src';
const ASSETS        = './src/assets';
const DIST_STAGE    = './dist/staging';
const DIST_PROD     = './dist/production';
const DIST          = (PRODUCTION) ? DIST_PROD : DIST_STAGE;

// Browser Refresh
const reload = (done) => {
    browserSync.reload();
    done();
};

// Function for serve the dev server in borwsaer
const serve = (done) => {
    browserSync.init({
        server: {
            baseDir: `${DIST}`
        }
    });
    done();
};

const images = () => {
    return gulp.src(`${ASSETS}/images/**/*`)
    .pipe(imagemin([
	   imagemin.gifsicle({interlaced: true}),
	   imageminMozjpeg({progressive: true, quality: IMAGE_QUALITY}),
	   pngquant({quality: IMAGE_QUALITY}),
	   imagemin.svgo({
		   plugins: [
			   {removeViewBox: true},
			   {cleanupIDs: false}
		   ]
	   })
	]))
    .pipe(gulp.dest(`${DIST}/assets/images`))
}

const css = () => {
    return gulp.src(`${ASSETS}/scss/**/*.scss`)
        // Init Plumber (Bei Fehlern durchlaufen)
        .pipe(plumber())
        // Lint SCSS
        .pipe(sassLint({
            options: {
                formatter: 'stylish',
            },
            rules: {
                'no-ids': 1,
                'final-newline': 0,
                'no-mergeable-selectors': 1,
                'indentation': 0
            }
        }))
        // Format SCSS
        .pipe(sassLint.format())
        // Source Map
        .pipe(sourcemaps.init())
        // SCSS -> CSS
        .pipe(sass.sync({ outputStyle: "compressed" })).on('error', sass.logError)
        // + Suffix
        .pipe(rename({ basename: 'main', suffix: ".min" }))
        // + Autoprefixer & cssNano
        .pipe(postcss([autoprefixer(), cssnano()]))
        // Source Map schreiben
        .pipe(sourcemaps.write(''))
        // Ausgabe
        .pipe(gulp.dest(`${DIST}/assets/css`))
        // Refresh/Inject CSS
        .pipe(browserSync.stream());
};

const html = () => {
    return gulp.src(`${SRC}/*.html`)
        // Init Plumber (Bei Fehlern durchlaufen)
        .pipe(plumber())
        // HTML aufräumen
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            html5: true,
            removeEmptyAttributes: true,
            removeTagWhitespace: true,
            sortAttributes: true,
            sortClassName: true
        }))
        // Ausgabe
        .pipe(gulp.dest(`${DIST}`));
};

const script = () => {
    return gulp.src(`${ASSETS}/js/**/*.js`)
        // Init Plumber (Bei Fehlern durchlaufen)
        .pipe(plumber(((error) => {
            gutil.log(error.message);
        })))
        // Source Map
        .pipe(sourcemaps.init())
        // Alles zusammenführen
        .pipe(concat('scripts.js'))
        // Use Babel
        .pipe(babel())
        // JavaScript Lint
        .pipe(jshint())
        // Report of jslint
        .pipe(jshint.reporter('jshint-stylish'))
        // Add browser Support
        .pipe(browserify({
            insertGlobals: true
        }))
        // Minify
        .pipe(uglify())
        // add SUffix
        .pipe(rename({ basename: 'main', suffix: ".min" }))
        // Write Sourcemap
        .pipe(sourcemaps.write(''))
        // Write everything to destination folder
        .pipe(gulp.dest(`${DIST}/assets/js`))
        // Update Browser
        .pipe(browserSync.stream());
};

// Function to watch our Changes and refreash page
const watch = () => gulp.watch([`${ASSETS}/images/**/*`, `${SRC}/*.html`, `${ASSETS}/js/**/*.js`, `${ASSETS}/scss/**/*.scss`], gulp.series(images, css, script, html, reload));

// All Tasks for this Project
const dev = gulp.series(images, css, script, html, serve, watch);

// Just Build the Project
const build = gulp.series(images, css, script, html);

// Default function (used when type gulp)
exports.dev = dev;
exports.build = build;
exports.default = build;
