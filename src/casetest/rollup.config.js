//import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import glsl from 'rollup-plugin-glsl';
const path = require('path')
const layaExpPlugin = require('../buildtools/rollup_LayaExp');
// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

const resolveFile = function(filePath) {
    return path.join(__dirname, '..', filePath)
}

function testPlug(options){
    return {
        transform( code, id ) {
            var filter = rollupPluginutils.createFilter(options.include, options.exclude);
            return {
                name: 'glsl',
                transform( code, id ) {
                    if (!filter(id)) return;
                    //console.log(id,'\n',code);
                    var code = 'export default \`'+code+'\`';
                    var result = { code: code };
                    return result
                }
            }
        
            console.log(id);
        }
    }
}

let layaexpreplace = '//__LAYARPLACEMENTHERE__//';
export default { 
    //input: './src/debug/PerformanceTest_Maggots.ts',
    input: './Main.ts',
    //input: './src/debug/UITest1.ts',
    //input: './src/debug/test/test.ts',
    //input:'./src/debug/Main1.ts',
    treeshake: false,
	output: {
		file: '../../bin/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: false,
        name:'Laya',
        extend: true,
        //intro:'window.Laya=window.Laya||exports||{};\n',
        outro:layaexpreplace
        //indent: false
	},
	plugins: [
        layaExpPlugin({
            baseUrl:'../layaAir',
            layaPath:'../layaAir',      // 收集需要的laya文件
            //gatherExtFiles:layaFiles,
            addLayaExpAt:layaexpreplace,
        }),
        typescript({
            //abortOnError:false
            check: false
        }),
        //testPlug(),
        glsl({
			// By default, everything gets included
			include: /\.glsl$/,
			sourceMap: false
		}),        
		//resolve(), // tells Rollup how to find date-fns in node_modules
		//commonjs(), // converts date-fns to ES modules
		//production && terser() // minify, but only in production
	]
};