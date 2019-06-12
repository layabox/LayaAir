const typescript = require('rollup-plugin-typescript2');
import glsl from 'rollup-plugin-glsl';
const path = require('path')
// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default { 
    input: './index.ts',
    treeshake: false,
	output: {
		file: '../../bin/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: false,
        name:'laya',
	},
	plugins: [
        typescript({
            check: true//Set to false to avoid doing any diagnostic checks on the code
        }),
        glsl({
			// By default, everything gets included
			include: /.*(.glsl|.vs|.fs)$/,
            sourceMap: false,
            compress:false
		}),        
	]
};