const typescript = require('rollup-plugin-typescript2');
import glsl from 'rollup-plugin-glsl';
//import { terser } from "rollup-plugin-terser";

export default { 
    input: './index.ts',
    treeshake: true,//建议忽略
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
        /*terser({
            output: {
            },
            numWorkers:1,//Amount of workers to spawn. Defaults to the number of CPUs minus 1
            sourcemap: false
        })*/        
	]
};