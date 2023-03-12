const gulp = require('gulp');
const del = require('del');

function clean() {
    return del(['../../source/web-security'], {force: true});
}

function copy() {
    return gulp.src('src/public_files/**/*').pipe(gulp.dest('../../source/web-security/'));
}

exports.clean = clean;
exports.copy = copy;
exports.default = gulp.series(clean, copy);