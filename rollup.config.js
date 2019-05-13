import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
const path = require('path')
// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

const resolveFile = function(filePath) {
    return path.join(__dirname, '..', filePath)
}
  

export default {
	input: './src/debug/Main1.ts',
	output: {
		file: 'bin/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: true,
        name:'laya'
	},
	plugins: [
        typescript({
            abortOnError:false
        }),
		//resolve(), // tells Rollup how to find date-fns in node_modules
		commonjs(), // converts date-fns to ES modules
		//production && terser() // minify, but only in production
	]
};