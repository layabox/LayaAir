//import { terser } from 'rollup-plugin-terser';
const typescript = require('rollup-plugin-typescript2');
import glsl from 'rollup-plugin-glsl';
const path = require('path')
// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

const resolveFile = function(filePath) {
    return path.join(__dirname, '..', filePath)
}


function testPlug(){
    return {
        transform( code, id ) {
            console.log(id,'\n',code);
        }
    }
}

export default { 
    //input: './src/debug/PerformanceTest_Maggots.ts',
    input: './index.ts',
    //input: './src/debug/UITest1.ts',
    //input: './src/debug/test/test.ts',
    //input:'./src/debug/Main1.ts',
    treeshake: false,
	output: {
		file: '../../bin/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: false,
        name:'laya',
        //indent: false
	},
	plugins: [
        typescript({
            //abortOnError:false
            check: false
        }),
        //testPlug(),
        glsl({
			// By default, everything gets included
			include: /.*(.glsl|.vs|.fs)$/,
            sourceMap: false,
            compress:false
		}),        
		//resolve(), // tells Rollup how to find date-fns in node_modules
		//commonjs(), // converts date-fns to ES modules
		//production && terser() // minify, but only in production
	]
};