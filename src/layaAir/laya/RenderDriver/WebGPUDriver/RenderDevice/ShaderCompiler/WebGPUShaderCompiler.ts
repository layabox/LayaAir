import { initSync } from "../../../../../pkg/nagabind";

declare const ShaderCompiler: () => Promise<any>;

declare const wasm_bindgen: any;

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
        }, reason => {
            console.error("glslang init failed", reason);
        });

        const nagaInit = Nagabind.initSync().then(() => {
            this.naga = {
                spirv_to_wgsl: wasm_bindgen.spirv_to_wgsl
            };
        });

        return Promise.all([glslInit, nagaInit]);
    }

    destroy() {
        this.glslang = null;
        this.naga = null;
    }

}
