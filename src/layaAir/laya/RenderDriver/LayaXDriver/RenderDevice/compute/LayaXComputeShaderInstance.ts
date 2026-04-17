import { ComputeShaderProcessInfo, IComputeShader } from "../../../DriverDesign/RenderDevice/ComputeShader/IComputeShader";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { LayaXBindGroupHelper, LayaXBindingInfo } from "../LayaXBindGroupHelper";
import { LayaXCommandUniformMap } from "../LayaXCommandUniformMap";
import { LayaXRenderEngine } from "../LayaXRenderEngine";
import { LayaX_GLSLForVulkanGenerator } from "../ShaderGenerate/LayaX_GLSLForVulkanGenerator";

const _defineStrings: Array<string> = [];

/**
 * @internal
 * LayaX Compute Shader Instance.
 *
 * Flow (TS 侧，对标 WebGPUComputeShaderInstance + LayaXShaderInstance)：
 * 1. compile(info) 收集 define + uniform sets
 * 2. LayaX_GLSLForVulkanGenerator.proccessCompute 生成 compute GLSL
 * 3. glslang.wasm: GLSL → SPIR-V (stage = 'compute')
 * 4. naga.wasm:   SPIR-V → WGSL
 * 5. new conchLayaXComputeShaderInstance() → _nativeObj.create(wgsl, propJson)
 * 6. C++ 调 layax_create_compute_program → Rust 建 ShaderModule + 注册
 *
 * 不存 entry_point：dispatch 时传入 kernel 名。
 */
export class LayaXComputeShaderInstance implements IComputeShader {

    _nativeObj: any;

    name: string;

    /** Per-set binding info */
    uniformSetMap: Map<number, LayaXBindingInfo[]> = new Map();

    /** Per-set CommandUniformMap */
    uniformCommandMap: LayaXCommandUniformMap[];

    compilete: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * 编译计算着色器
     */
    compile(info: ComputeShaderProcessInfo): void {
        const engine = LayaXRenderEngine._instance;

        const node = info.node;
        const compileDefine = info.defineData;
        _defineStrings.length = 0;
        Shader3D._getNamesByDefineData(compileDefine, _defineStrings);

        // 1. 以 uniformMaps（每个 set 一个 CommandUniformMap）构造 per-set binding info
        const commandMaps = info.uniformMaps as LayaXCommandUniformMap[];
        for (let i = 0, n = commandMaps.length; i < n; i++) {
            this.uniformSetMap.set(
                i,
                LayaXBindGroupHelper.createBindingInfoArray(i, [commandMaps[i]._stateName])
            );
        }
        this.uniformCommandMap = commandMaps;

        // 2. 生成 Vulkan GLSL
        const processResult = LayaX_GLSLForVulkanGenerator.proccessCompute(
            _defineStrings,
            this.uniformCommandMap,
            this.uniformSetMap,
            node,
            info.name
        );
        const glsl = processResult.code;
        const splitSampler = processResult.hasSampler;

        // 3. GLSL → SPIR-V (compute stage)
        const spvRes = engine.shaderCompiler.glslang.glsl450_combine_to_spirv(glsl, 'compute', splitSampler);
        if (!spvRes.success) {
            console.error(`LayaXComputeShaderInstance '${info.name}' compile error:`, spvRes.info_log);
            return;
        }
        const spirv = new Uint8Array(spvRes.spirv.buffer, spvRes.spirv.byteOffset, spvRes.spirv.byteLength);

        // 4. SPIR-V → WGSL
        const wgsl = engine.shaderCompiler.naga.spirv_to_wgsl(spirv, false);
        if (!wgsl) {
            console.error(`LayaXComputeShaderInstance '${info.name}': SPIR-V→WGSL conversion failed`);
            return;
        }

        // 5. 序列化 + 推送到 Native (constructor builds the compute program)
        const propertySetMapJson = this._serializeBindingInfoMap();

        this._nativeObj = new (window as any).conchLayaXComputeShaderInstance(wgsl, propertySetMapJson);
        if (!this._nativeObj || !this._nativeObj.getHandle()) {
            console.error(`[LayaX-DBG] create compute program '${info.name}' FAILED!`);
            return;
        }
        console.log(`[LayaX-DBG] create compute program '${info.name}': wgsl_len=${wgsl.length} sets=${Array.from(this.uniformSetMap.keys())}`);

        this.compilete = true;
    }

    private _serializeBindingInfoMap(): string {
        const obj: any = {};
        for (const [setIndex, bindings] of this.uniformSetMap) {
            obj[setIndex.toString()] = bindings.map(b => ({
                id: b.id,
                name: b.name,
                set: b.set,
                binding: b.binding,
                bindingType: b.bindingType,
                dataType: b.dataType,
                propertyId: b.propertyId,
                sourceMapId: b.sourceMapId,
                hasDynamicOffset: b.buffer?.hasDynamicOffset ?? false,
                sampler: b.sampler,
            }));
        }
        return JSON.stringify(obj);
    }

}
