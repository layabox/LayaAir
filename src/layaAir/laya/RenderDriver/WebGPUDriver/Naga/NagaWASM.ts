//@ts-ignore
import init, { glsl_compile } from "./naga";

export class NagaWASM {
    /**
     * 初始化wasm库
     */
    async init() {
        await init('./naga/naga.wasm');
    }

    /**
     * 将GLSL4.5转译成WGSL
     */
    compileGLSL2WGSL(code: string, type: string) {
        return glsl_compile(code, type, false);
    }
}