var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('../layaAir/tsconfig.json');

gulp.task('LayaAir', () => {
      return new Promise(function (resolve, reject) {
            gulp.src(['./**/*.ts', '!laya/d3Extend/Cube/**/*.ts', '!laya/d3Extend/D3UI/**/*.ts',
                  '!laya/d3Extend/lineRender/**/*.ts', '!laya/d3Extend/physics/**/*.ts', '!laya/d3Extend/vox/**/*.ts', '!laya/d3Extend/worldMaker/**/*.ts']).pipe(tsProject()).pipe(gulp.dest('../../bin/tsc/layaAir'));
            resolve();
      });
});

gulp.task('Copy Shaders', () => {
      return new Promise(function (resolve, reject) {
            gulp.src(['/laya/d3/shader/files/**/*.vs', '/laya/d3/shader/files/**/*.ps', '/d3/shader/files/**/*.glsl'])
                  .pipe(gulp.dest('../../bin/tsc/layaAir/laya/d3/shader/files'));
            resolve();
      });
});

gulp.task('Build', gulp.series('Copy Shaders', 'LayaAir'));

