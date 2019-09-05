const rollup = require('rollup');
//const resolve =require( 'rollup-plugin-node-resolve');
//const commonjs =require( 'rollup-plugin-commonjs');
const typescript =require( 'rollup-plugin-typescript2');
const  glsl =require('rollup-plugin-glsl');
const path = require('path')
const layaExpPlugin = require('../buildtools/rollup_LayaExp');

const inputOptions = {
    //input: './src/debug/Main1.ts',
    input: './Main.ts',
	plugins:[
        layaExpPlugin({
            baseUrl:'../layaAir',
            layaPath:'../LayaAir',      
            //addLayaExpAt:layaexpreplace,
        }),

        typescript({
            check: false,
            tsconfigOverride:{compilerOptions:{removeComments: true}}
        }),
        //testPlug(),
        glsl({
			// By default, everything gets included
			include: /\.glsl$/ ,
			sourceMap: false
		}),        

		//resolve(), // tells Rollup how to find date-fns in node_modules
		//commonjs(), // converts date-fns to ES modules
    ]
};
const outputOptions = {
    file: '../../bin/bundle.js',
    format: 'iife', 
    sourcemap: false,
    name:'laya'
};

function testPlug(){
    return {
        transform( code, id ) {
            if( id.indexOf('.glsl')>0){
                debugger;
            }
            console.log(id);
            return code+'\n//-ROLLUPIDSTUB-//id='+id;
        },
        renderChunk(code, chunk, options) {
            let cs = code.split(/\/\/\-ROLLUP\-\/\/id\=(.*)/);
            return cs.join('\n');
        },
        generateBundle (options,bundle,isWrite){
            debugger;
        }
    }
}

async function build() {
    debugger;
  // create a bundle
  const bundle = await rollup.rollup(inputOptions);

  console.log(bundle.imports); // an array of external dependencies
  console.log(bundle.exports); // an array of names exported by the entry point
  console.log(bundle.modules); // an array of module objects

  // generate code and a sourcemap
  const { code, map } = await bundle.generate(outputOptions);

  // or write the bundle to disk
  await bundle.write(outputOptions);
}

build();