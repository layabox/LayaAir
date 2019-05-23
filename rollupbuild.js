const rollup = require('rollup');
//const resolve =require( 'rollup-plugin-node-resolve');
//const commonjs =require( 'rollup-plugin-commonjs');
const typescript =require( 'rollup-plugin-typescript2');
const path = require('path')

const inputOptions = {
    //input: './src/debug/Main1.ts',
    input: './src/debug/test/test.ts',
	plugins:[
        typescript({
            abortOnError:false
        }),
        testPlug()
		//resolve(), // tells Rollup how to find date-fns in node_modules
		//commonjs(), // converts date-fns to ES modules
    ]
};
const outputOptions = {
    file: 'bin/bundle.js',
    format: 'iife', 
    sourcemap: true,
    name:'laya'
};

function testPlug(){
    return {
        transform( code, id ) {
            console.log(id,'\n',code);
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