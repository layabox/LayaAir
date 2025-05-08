declare const ShaderCompiler: () => Promise<any>;

declare const wasm_bindgen: () => Promise<any>;

export interface GlslangCompiler {
    glsl450_to_spirv(glslSource: string, stage: "vertex" | "fragment" | "compute"): {
        spirv: Uint32Array,
        info_log: string,
        success: boolean
    };

    glsl300es_preprocess(glslSource: string, stage: "vertex" | "fragment" | "compute"): {
        preprocessed_code: string,
        info_log: string,
        success: boolean
    };
};

export interface NagaCompiler {
    spirv_to_wgsl(spv: Uint8Array, validation: boolean): string;
    glsl_to_wgsl(source: string, stage: "vertex" | "fragment" | "compute", validation: boolean): string;
};

export class WebGPUShaderCompiler {

    glslang: GlslangCompiler;

    naga: NagaCompiler;

    constructor() {

    }

    async init() {
        const glslInit = ShaderCompiler().then(module => {
            this.glslang = module;
        }, reason => {
            console.error("glslang init failed", reason);
        });

        const Nagabind = wasm_bindgen;

        const nagaInit = Nagabind().then(() => {
            this.naga = (Nagabind as unknown as NagaCompiler);
        });

        return Promise.all([glslInit, nagaInit]);
    }

    destroy() {
        this.glslang = null;
        this.naga = null;
    }

}
