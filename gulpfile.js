var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
var browsersync = require('browser-sync');
var sourcemap = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');


//这个任务是将某一资源移动到指定路径下
gulp.task('libs', () => {
    return gulp.src(['node_modules/babel-polyfill/dist/polyfill.js'])
        .pipe(gulp.dest('./build/libs'))
})

gulp.task('js', function() {
    return browserify({
            entries: './src/app.js',
            debug: true,
        })
        .transform(babelify, {
            presets: ['env']
        })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemap.init({
            loadMaps: true
        }))
        .pipe(sourcemap.write())
        .pipe(gulp.dest('./build/'))
        .pipe(browsersync.reload({
            stream: true
        }));
})

gulp.task('browser-sync', function() {
    var config = {
        server: {
            baseDir: './build/'
        }
    };

    return browsersync(config);
});

gulp.task('sass', function() {
    return gulp.src('./src/**/*.scss')
        .pipe(sourcemap.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(sourcemap.write())
        .pipe(gulp.dest('./build/'))
        .pipe(browsersync.reload({
            stream: true
        }));
});

gulp.task('watch', function() {
    gulp.watch('./src/**/*.js', ['js']);
    gulp.watch('./src/**/*.scss', ['sass']);
    gulp.watch('./build/**/*.html', function() {
        return gulp.src('')
            .pipe(browsersync.reload({
                stream: true
            }))
    });
});
gulp.task('run', ['libs', 'js']);
