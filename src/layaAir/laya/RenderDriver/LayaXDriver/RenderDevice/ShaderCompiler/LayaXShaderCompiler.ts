
declare const ShaderCompiler: () => Promise<any>;

declare const wasm_bindgen: () => Promise<any>;
export interface GlslangCompiler {

    getVersion(): string;

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

    preprocess_compute(glslSource: string, stage: "compute"): {
        success: boolean,
        preprocessed_code: string,
        info_log: string,
        uniforms: Map<string, { type: string, format?: string, access?: "readonly" | "writeonly" | "readwrite" }>,
        ssbos: Map<string, "readonly" | "writeonly" | "readwrite">,
        ubos: Map<string, string>,
        samplers: Map<string, { type: string }>
    }

    glsl450_combine_to_spirv(glslSource: string, stage: "vertex" | "fragment" | "compute", splitSampler: boolean): {
        spirv: Uint32Array,
        info_log: string,
        success: boolean
    };
};

export interface NagaCompiler {
    spirv_to_wgsl(spv: Uint8Array, validation: boolean): string;
    glsl_to_wgsl(source: string, stage: "vertex" | "fragment" | "compute", validation: boolean): string;
    wgsl_to_spirv(source: string, stage: "vertex" | "fragment" | "compute", validation: boolean): Uint32Array;
};

export class LayaXShaderCompiler {

    glslang: GlslangCompiler;

    naga: NagaCompiler;

    constructor() {

    }

    async init() {
        let glslInit: Promise<unknown>;
        const NativeGlslang = (globalThis as any).conchGlslangCompiler;
        this.glslang = new NativeGlslang() as GlslangCompiler;
        glslInit = Promise.resolve();
       
        let nagaInit: Promise<unknown>;
        const NativeNaga = (globalThis as any).conchNagaCompiler;
        this.naga = new NativeNaga() as NagaCompiler;
        nagaInit = Promise.resolve();

        return Promise.all([glslInit, nagaInit]);
    }

    destroy() {
        this.glslang = null;
        this.naga = null;
    }

}
