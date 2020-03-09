const gulp = require('gulp'),
    scss = require('gulp-sass'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    pkg = require('./package.json'),
    BundleHelper = require('maptalks-build-helpers').BundleHelper;

pkg.name = 'maptalks.routeplayer'

const bundleHelper = new BundleHelper(pkg);

function bundle () {
    return bundleHelper.bundle('index.js');
}

const stylesPattern = './assets/**/*.scss';
function styles () {
    return gulp.src(stylesPattern)
        .pipe(scss().on('error', scss.logError))
        .pipe(concat(pkg.name +'.css'))
        .pipe(gulp.dest('./dist'))
}

gulp.task(bundle);

gulp.task('images', () => {
    return gulp.src('./assets/images/**/*')
        .pipe(gulp.dest('./dist/images'))
});

gulp.task('styles', gulp.series(['images'], styles));

gulp.task('build', gulp.series(['bundle', 'styles']))

gulp.task('minify', gulp.series(['build'], (done) => {
    bundleHelper.minify();
    done();
}));

gulp.task('watch', gulp.series(['build'], () => { 
    gulp.watch(['./src/**/*.js', 'index.js', './gulpfile.js'], gulp.series(['bundle', 'reload'])) 
    gulp.watch([stylesPattern], gulp.series(['styles', 'reload']))
    gulp.watch(['./examples/**/*'], gulp.series(['reload']))
}));

gulp.task('connect', function() {
    connect.server({
        port: 9527,
        livereload: true
    })
})

gulp.task('reload', () => {
    return gulp.src(['./dist/**/*.*', './examples/**/*'])
        .pipe(connect.reload());
})

/* 
const TestHelper = require('maptalks-build-helpers').TestHelper;
const testHelper = new TestHelper();
const karmaConfig = require('./karma.config.js');

gulp.task('test', ['build'], () => {
    testHelper.test(karmaConfig);
});

gulp.task('tdd', ['build'], () => {
    karmaConfig.singleRun = false;
    gulp.watch(['index.js'], ['test']);
    testHelper.test(karmaConfig);
}); */

gulp.task('default', gulp.parallel([ 'connect', 'watch']));
