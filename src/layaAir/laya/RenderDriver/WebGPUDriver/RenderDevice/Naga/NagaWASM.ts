
export class NagaWASM {
    /**
     * 初始化wasm库
     */
    async init() {
        await (window as any).naga.initSync.call();
        
    }

    /**
     * 将GLSL4.5转译成WGSL
     */
    compileGLSL2WGSL(code: string, type: string) {
        return  (window as any).naga.glsl_compile(code, type);
    }
}