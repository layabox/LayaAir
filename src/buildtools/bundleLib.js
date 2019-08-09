const rollup = require('rollup');
const rollupTypescript = require('rollup-plugin-typescript2');
const glsl = require('rollup-plugin-glsl');
const multiInput = require('./rollup_multiInput');
const layaexp = require('./rollup_LayaExp');

async function bundleLib(inputs, tsconfig, outfile, banner, outro){
    let bundle = await rollup.rollup({
        input: inputs,
        external:['Laya'],
        plugins: [
            multiInput(),
            {
                renderChunk(code, chunk, options) {
                    //替换
                    let s = 'this.Laya = this.Laya || {}';
                    let p = code.lastIndexOf(s);
                    if(p>0){
                        return code.substring(0,p)+'Laya'+code.substr(p+s.length);
                    }
                }
            },
            rollupTypescript({ 
                tsconfig:tsconfig,
                check: false,
                tsconfigOverride:{compilerOptions:{removeComments: true}} 
            }),
            glsl({
                include: /.*(.glsl|.vs|.fs)$/,
                sourceMap: false,
                compress:false
            })
        ]
    });

    await bundle.write({
        file: outfile,
        format: 'iife',
        extend:true,  // 不要var Laya=了
        banner:banner,
        outro:outro,
        name: 'Laya',
        globals:{'Laya':'Laya'},
        sourcemap: false
    });
}

module.exports=bundleLib;