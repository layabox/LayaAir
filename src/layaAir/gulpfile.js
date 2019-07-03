var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

gulp.task('LayaAir', () => {
      return new Promise(function (resolve, reject) {
            gulp.src(['./**/*.ts', '!test.ts', '!laya/d3Extend/Cube/**/*.ts', '!laya/d3Extend/D3UI/**/*.ts',
                  '!laya/d3Extend/lineRender/**/*.ts', '!laya/d3Extend/physics/**/*.ts', '!laya/d3Extend/vox/**/*.ts', '!laya/d3Extend/worldMaker/**/*.ts']).pipe(tsProject()).pipe(gulp.dest('../../bin/tsc/layaAir'));
            resolve();
      });
});

gulp.task('Copy Shaders', () => {
      return new Promise(function (resolve, reject) {
            gulp.src(['laya/d3/shader/files/**/*.vs', 'laya/d3/shader/files/**/*.ps', 'laya/d3/shader/files/**/*.glsl'])
                  .pipe(gulp.dest('../../bin/tsc/layaAir/laya/d3/shader/files'));
            resolve();
      });
});

gulp.task('Build', gulp.series('Copy Shaders', 'LayaAir'));







//E:\layaairTS\src\layaAir\laya\d3\shader\files
// gulp.task('Copy Shaders', ['Build'], function(){
//   console.log('Copying Shaders...');
//   return gulp.src(['src/**/*.vs', 'src/**/*.ps',  'src/**/*.glsl'])
//   .pipe(gulp.dest('dist'))

// });


// gulp.task('default', gulp.series('Build', 'Copy Shaders', function() {
//   //console.log("Default task that cleans, builds and runs the application [END]");
//   //done();
// }));







