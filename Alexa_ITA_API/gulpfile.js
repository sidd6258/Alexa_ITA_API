const gulp = require('gulp');
//const imagemin = require('gulp-imagemin');
//const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const bourbon = require('node-bourbon');

// Logs Message
gulp.task('message', function(){
    return console.log('Gulp is running...');
});

// Compile Sass
gulp.task('sass', function () {
    gulp.src('public/stylesheets/main.scss')
        .pipe(sass({
            // includePaths: require('node-bourbon').with('other/path', 'another/path')
            // - or -
            includePaths: bourbon.includePaths
        }))
        .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('default', ['message', 'sass']);

gulp.task('watch', function(){
    gulp.watch('public/stylesheets/main.scss', ['sass']);
});