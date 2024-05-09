//@ts-ignore
import initSync, { glsl_compile } from "./naga_wasm";

export class NagaWASM {
    /**
     * 初始化wasm库
     */
    async init() {
        await initSync('./naga/naga_wasm_bg.wasm');
    }

    /**
     * 将GLSL4.5转译成WGSL
     */
    compileGLSL2WGSL(code: string, type: string) {
        return glsl_compile(code, type);
    }
}