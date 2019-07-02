var gulp = require('gulp');
// 在 shell 中执行一个命令
//var exec = require('child_process').exec;
// gulp.task('tsc', function(cb) {
//   // 编译 Jekyll
//   exec('tsc -p .\\tsconfig.json', function() {
//   });
// });
// gulp.task('default', function(){
//     console.log('hello world');
//     return gulp.src(['src/**/*.vs', 'src/**/*.ps',  'src/**/*.glsl'])
// 		.pipe(gulp.dest('dist'))
    
// });

// gulp.task('default002', 'default', function(){
//   console.log('hello world88888');
//   return gulp.src(['src/**/*.vs', 'src/**/*.ps',  'src/**/*.glsl'])
//   .pipe(gulp.dest('dist'))
  
// });

var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

// gulp.task('default', function(){
//   console.log("gulp 正在执行");
//   gulp.src(['./**/*.ts', '!test.ts', '!laya/d3Extend/Cube/**/*.ts', '!laya/d3Extend/D3UI/**/*.ts', 
//   '!laya/d3Extend/lineRender/**/*.ts', '!laya/d3Extend/physics/**/*.ts', '!laya/d3Extend/vox/**/*.ts', '!laya/d3Extend/worldMaker/**/*.ts']).pipe(tsProject()).pipe(gulp.dest('./build'));

// });

gulp.task('Build', async() => {
   await gulp.src(['./**/*.ts', '!test.ts', '!laya/d3Extend/Cube/**/*.ts', '!laya/d3Extend/D3UI/**/*.ts', 
   '!laya/d3Extend/lineRender/**/*.ts', '!laya/d3Extend/physics/**/*.ts', '!laya/d3Extend/vox/**/*.ts', '!laya/d3Extend/worldMaker/**/*.ts']).pipe(tsProject()).pipe(gulp.dest('../../bin/tsc/layaAir'));
   //await gulp.src(['src/**/*.vs', 'src/**/*.ps',  'src/**/*.glsl'])
         //.pipe(gulp.dest('dist'));

   await gulp.src(['laya/d3/shader/files/**/*.vs', 'laya/d3/shader/files/**/*.ps',  'laya/d3/shader/files/**/*.glsl'])
      .pipe(gulp.dest('../../bin/tsc/layaAir/laya/d3/shader/files'));
});


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






  
