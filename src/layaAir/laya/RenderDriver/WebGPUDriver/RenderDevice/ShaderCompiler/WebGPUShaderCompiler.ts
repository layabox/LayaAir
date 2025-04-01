declare const ShaderCompiler: () => Promise<any>;

declare const wasm_bindgen: () => Promise<any>;

const Nagabind = wasm_bindgen;


export interface GlslangCompiler {
    glsl450_to_spirv(glslSource: string, stage: "vertex" | "fragment"): {
        spirv: Uint32Array,
        info_log: string,
        success: boolean
    };
};

export interface NagaCompiler {
    spirv_to_wgsl(spv: Uint8Array, validation: boolean): string;
};

export class WebGPUShaderCompiler {

    glslang: GlslangCompiler;

    naga: NagaCompiler;

    constructor() {

    }

    async init() {
        const glslInit = ShaderCompiler().then(module => {
            this.glslang = module;
        });

        const nagaInit = Nagabind().then(module => {
            this.naga = module;
        });

        return Promise.all([glslInit, nagaInit]);
    }

    destroy() {
        this.glslang = null;
        this.naga = null;
    }

}
