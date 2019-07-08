//引用插件模块
let gulp = require('gulp');
let path = require('path');

// 在 shell 中执行一个命令
var exec = require('child_process').exec;
gulp.task('tsc', () => {
	return exec(path.join(__dirname,'node_modules/.bin/tsc.cmd -b src/samples/tsconfig.json'), function() {
	});
});

gulp.task('CopyNoneTSFile', () => {
	return gulp.src([
		'src/**/*.vs',
		'src/**/*.fs',
		'src/**/*.glsl'], { base: "src" })
		.pipe(gulp.dest('bin/tsc'));
});

gulp.task('Build LayaAir', gulp.series('tsc','CopyNoneTSFile'));

