const gulp = require('gulp');
const rollup = require('rollup');
const rollupTypescript = require('rollup-plugin-typescript2');
const glsl =require('rollup-plugin-glsl');

gulp.task('build', async ()=>{
  const bundle = await rollup.rollup({
    input: './Main.ts',
    plugins: [
      rollupTypescript({ check: false}),
      glsl({
        // By default, everything gets included
        include: './**/*.glsl',
        sourceMap: false
    }),        

    ]
  });

  await bundle.write({
    file: '../../bin/bundle.js',
    format: 'iife',
    name: 'laya',
  });
});