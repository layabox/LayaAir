import { Config } from "../../../../Config";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { NotImplementedError } from "../../../utils/Error";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { LayaGL } from "../../../layagl/LayaGL";
import { LayaXBindGroupHelper, LayaXBindingInfo, LayaXBindingInfoType } from "./LayaXBindGroupHelper";
import { LayaXRenderEngine } from "./LayaXRenderEngine";
import { LayaXCommandUniformMap } from "./LayaXCommandUniformMap";
import { LayaXShaderPass } from "../RenderModuleData/LayaXShaderPass";
import { LayaXSubShader } from "../RenderModuleData/LayaXSubShader";
import { LayaX_GLSLForVulkanGenerator } from "./ShaderGenerate/LayaX_GLSLForVulkanGenerator";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

/**
 * @internal
 * LayaX shader instance — compiles GLSL→WGSL and creates pipeline via native conchLayaXShaderInstance.
 *
 * Flow:
 * 1. _create() receives ShaderProcessInfo + ShaderPass
 * 2. Reads set→map names from LayaXShaderPass.compileSetMapNames (set by Rust callback)
 * 3. Builds bindingInfoMap from LayaXCommandUniformMap per set (unified, no 2D/3D distinction)
 * 4. Processes GLSL → Vulkan GLSL via GLSLForVulkanGenerator (TODO: extract as shared service)
 * 5. Compiles to SPIR-V via glslang.wasm → WGSL via naga.wasm (TODO: extract as shared service)
 * 6. Computes textureExits
 * 7. Calls C++ conchLayaXShaderInstance.create(vs_wgsl, fs_wgsl, propertySetMapJson, textureExitsJson)
 * 8. C++ calls Rust FFI layax_create_render_program → ProgramHandle
 */
export class LayaXShaderInstance implements IShaderInstance {

    _nativeObj: any;

    /**@internal */
    private _shaderPass: ShaderPass;

    /** Per-set binding info (LayaX-native, duck-type compatible with WebGPU for GLSLForVulkanGenerator) */
    bindingInfoMap: Map<number, LayaXBindingInfo[]> = new Map();

    /** Per-set CommandUniformMap names (for textureExits computation) */
    private _resourcesCacheKey: Map<number, string[]> = new Map();

    /** Per-set texture usage bitmask */
    textureExitsMap: Map<number, number> = new Map();

    constructor() {
    }

    _serializeShader(): ArrayBuffer {
        throw new NotImplementedError();
    }

    _deserialize(buffer: ArrayBuffer): boolean {
        throw new NotImplementedError();
    }

    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
        this._shaderPass = shaderPass;
        const moduleData = shaderPass.moduleData as LayaXShaderPass;

        // 1. Read set→map names from LayaXShaderPass (stored by Rust compile callback)
        //    All sets (scene, camera, node, material, etc.) are included — no hardcoded logic.
        const setMapNames = moduleData.compileSetMapNames;
        if (!setMapNames || setMapNames.size === 0) {
            console.warn("LayaXShaderInstance._create: no set→map names available");
        }

        // 2. Build bindingInfoMap for each set from setMapNames (unified rule)
        //    Auto-populate empty CommandUniformMaps from SubShader._uniformMap if needed.
        if (setMapNames) {
            for (const [setIndex, mapNames] of setMapNames) {
                for (const mapName of mapNames) {
                    this._ensureCommandMapPopulated(mapName, shaderPass);
                }
                const bindings = LayaXBindGroupHelper.createBindingInfoArray(setIndex, mapNames);
                this.bindingInfoMap.set(setIndex, bindings);
                this._resourcesCacheKey.set(setIndex, mapNames);
            }
        }
        // 3. Filter attributeMap by attributeLocations
        let attriLocArray = shaderPass.moduleData.attributeLocations;
        let filteredAttributeMap: Record<string, [number, any]> = {};
        let noUseAttributeMap: Record<string, [number, any]> = {};
        for (const [key, value] of Object.entries(shaderProcessInfo.attributeMap)) {
            if (attriLocArray.has(value[0])) {
                filteredAttributeMap[key] = value;
            } else {
                noUseAttributeMap[key] = value;
            }
        }

        // 4. Track used textures for culling
        let useTexSet = new Set<string>();
        let cullTextureSetLayer = shaderProcessInfo.is2D ? 3 : 2;

        // 5. Determine material set index for appending include-bound uniforms (e.g. u_IBLDFG)
        //    Material set is identified by containing a map name matching shaderPass.name.
        //    Do NOT use max set index — Set3 (Sprite2DGlobal) would be misidentified as material.
        let materialSetIndex = -1;
        if (setMapNames) {
            const passName = shaderPass.name;
            for (const [setIndex, mapNames] of setMapNames) {
                if (mapNames.includes(passName)) {
                    materialSetIndex = setIndex;
                    break;
                }
            }
        }

        const subShaderData = shaderPass._owner.moduleData as LayaXSubShader;
        const propertyRecordSchema = subShaderData.gpuScenePropertyRecordSchema;
        const gpuScenePropertyRecord = !!propertyRecordSchema
            && shaderProcessInfo.defineString.includes("GPU_SCENE")
            && materialSetIndex >= 0;
        let shaderDefines = shaderProcessInfo.defineString;
        if (gpuScenePropertyRecord) {
            const schema = propertyRecordSchema!;
            const recordSet = schema.recordSet;
            const hasResourcePage = schema.textureFields.length > 0;
            if (recordSet < 0 || recordSet > 3
                || (hasResourcePage
                    && (schema.resourcePageSet < 0 || schema.resourcePageSet > 3
                        || schema.resourcePageSet === recordSet))) {
                console.error("GPUScene property-record schema requires distinct in-range record and ResourcePage sets");
                return;
            }
            // The classic draw-property set is not part of a property-record variant.
            // Preserve an existing non-property set (for example Node/ReflectionProbe)
            // and extend it with the record resources instead.
            const recordBindings = recordSet === materialSetIndex
                ? []
                : (this.bindingInfoMap.get(recordSet) || []);
            let nextRecordBinding = recordBindings.reduce(
                (next, binding) => Math.max(next, binding.binding + 1), 0);
            const sourceMapId = Shader3D.propertyNameToID(shaderPass.name);
            recordBindings.push({
                id: 0,
                name: "GpuSceneDataBuffer",
                set: recordSet,
                binding: nextRecordBinding++,
                propertyId: schema.dataBufferPropertyId,
                sourceMapId,
                type: LayaXBindingInfoType.storageBuffer,
                bindingType: "storageBufferReadOnly",
                dataType: ShaderDataType.ReadOnlyDeviceBuffer,
                buffer: { type: "read-only-storage" },
                keepAlive: true,
            });
            if (hasResourcePage) {
                recordBindings.push({
                    id: 0,
                    name: "GpuSceneFixedSampler_Sampler",
                    set: recordSet,
                    binding: nextRecordBinding,
                    propertyId: schema.fixedSamplerSourcePropertyId,
                    sourceMapId,
                    type: LayaXBindingInfoType.sampler,
                    bindingType: "sampler",
                    dataType: ShaderDataType.Texture2D,
                    sampler: { type: "filtering" },
                    texture: { sampleType: "float", viewDimension: "2d", multisampled: false },
                    keepAlive: true,
                });
            }
            this.bindingInfoMap.set(recordSet, recordBindings);
            if (recordSet !== materialSetIndex && !hasResourcePage) {
                this.bindingInfoMap.set(materialSetIndex, []);
            }

            if (hasResourcePage) {
                const resourcePageSet = schema.resourcePageSet;
                this.bindingInfoMap.set(resourcePageSet, [{
                    id: 0,
                    name: "GpuSceneResourcePage",
                    set: resourcePageSet,
                    binding: 0,
                    propertyId: schema.resourcePagePropertyId,
                    sourceMapId,
                    type: LayaXBindingInfoType.resourcePage,
                    bindingType: "resourcePage",
                    dataType: ShaderDataType.Texture2D,
                    resourceClass: resourcePageClassName(schema.resourcePageClass),
                    slotCapacity: schema.resourcePageSlotCapacity,
                    keepAlive: true,
                }]);
            }
            shaderDefines = [
                ...shaderProcessInfo.defineString,
                "GPU_SCENE_PROPERTY_RECORD",
                `GPU_SCENE_PROPERTY_RECORD_SCHEMA_${schema.schemaId}`,
                ...(schema.textureFields.length > 0
                    ? ["GPU_SCENE_PROPERTY_RECORD_HAS_RESOURCE_PAGE"]
                    : []),
            ];
        }

        // 6. Process GLSL → Vulkan GLSL
        let useMaterial = Config.matUseUBO;
        Config.matUseUBO = (!shaderProcessInfo.is2D) && Config.matUseUBO;
        const glslObj = LayaX_GLSLForVulkanGenerator.layax_process(
            shaderDefines,
            [filteredAttributeMap, noUseAttributeMap],
            this.bindingInfoMap as any,
            shaderPass.name,
            shaderPass._owner._uniformMap,
            shaderProcessInfo.vs,
            shaderProcessInfo.ps,
            useTexSet,
            cullTextureSetLayer,
            materialSetIndex,
            gpuScenePropertyRecord ? propertyRecordSchema : null
        );
        Config.matUseUBO = useMaterial;

        if ((glslObj as any).error) {
            console.warn(
                `[LayaX] GPUScene shader lowering rejected "${shaderPass.name}": ` +
                `${(glslObj as any).error}. The complete View will retain Classic rendering.`
            );
            return;
        }

        // 6. Cull already done inside layax_process (after replaceTextureSampler, before uniformString2)
        // bindingInfoMap is now culled with continuous binding indices

        // 7. Compile GLSL → SPIR-V → WGSL
        // TODO: Extract shaderCompiler as shared service (not WebGPU-specific)
        const engine = LayaXRenderEngine._instance;
        let vs_wgsl = "";
        let fs_wgsl = "";

        {
            let vertexSpvRes = engine.shaderCompiler.glslang.glsl450_to_spirv(glslObj.vertex, "vertex");
            if (!vertexSpvRes.success) {
                let subShader = this._shaderPass._owner;
                let shader = subShader._owner;
                let subIndex = shader._subShaders.indexOf(subShader);
                let passIndex = subShader._passes.indexOf(this._shaderPass);
                console.error(`${shader.name}_sub${subIndex}_pass${passIndex}`);
                console.error(vertexSpvRes.info_log);
            }
            let vertexSpirv = new Uint8Array(vertexSpvRes.spirv.buffer, vertexSpvRes.spirv.byteOffset, vertexSpvRes.spirv.byteLength);

            let fragmentSpvRes = engine.shaderCompiler.glslang.glsl450_to_spirv(glslObj.fragment, "fragment");
            if (!fragmentSpvRes.success) {
                let subShader = this._shaderPass._owner;
                let shader = subShader._owner;
                let subIndex = shader._subShaders.indexOf(subShader);
                let passIndex = subShader._passes.indexOf(this._shaderPass);
                console.error(`${shader.name}_sub${subIndex}_pass${passIndex}`);
                console.error(fragmentSpvRes.info_log);
            }
            let fragmentSpv = new Uint8Array(fragmentSpvRes.spirv.buffer, fragmentSpvRes.spirv.byteOffset, fragmentSpvRes.spirv.byteLength);

            vs_wgsl = engine.shaderCompiler.naga.spirv_to_wgsl(vertexSpirv, false);
            fs_wgsl = engine.shaderCompiler.naga.spirv_to_wgsl(fragmentSpv, false);

            if (!vs_wgsl || !fs_wgsl) {
                let subShader = this._shaderPass._owner;
                let shader = subShader._owner;
                console.error(`LayaXShaderInstance: SPIR-V→WGSL conversion failed for ${shader.name}, vs_wgsl=${vs_wgsl ? 'ok' : 'EMPTY'}, fs_wgsl=${fs_wgsl ? 'ok' : 'EMPTY'}`);
            }
        }

        // 9. Compute textureExits per set
        {
            for (const [setIndex, mapNames] of this._resourcesCacheKey) {
                const bindings = this.bindingInfoMap.get(setIndex);
                if (!bindings) continue;
                const textureExits = LayaXBindGroupHelper.computeTextureExits(setIndex, mapNames, bindings);
                this.textureExitsMap.set(setIndex, textureExits);
            }
        }

        // 10. Serialize and create native shader instance → C++ → Rust FFI
        const propertySetMapJson = this._serializeBindingInfoMap();
        const textureExitsJson = this._serializeTextureExits();

        this._nativeObj = new (window as any).conchLayaXShaderInstance();
        let programHandle = this._nativeObj.create(vs_wgsl, fs_wgsl, propertySetMapJson, textureExitsJson);
        if (!programHandle) {
            console.error(`LayaXShaderInstance: create program FAILED! propertySetMap=${propertySetMapJson.substring(0, 200)}`);
        }
    }

    /**
     * Ensure a CommandUniformMap is populated. If it's empty and matches a pass name,
     * auto-populate from SubShader._uniformMap.
     */
    private _ensureCommandMapPopulated(mapName: string, shaderPass: ShaderPass): void {
        let map = LayaGL.renderDeviceFactory.createGlobalUniformMap(mapName) as LayaXCommandUniformMap;

        // Check if this map name corresponds to the current shader pass
        // If so, populate/supplement from SubShader._uniformMap (includes include-bound uniforms like u_IBLDFG)
        if (mapName === shaderPass.name) {
            for (const [key, value] of shaderPass._owner._uniformMap) {
                if (!map._idata.has(key)) {
                    if (value.arrayLength > 0) {
                        map.addShaderUniformArray(value.id, value.propertyName, value.uniformtype, value.arrayLength);
                    } else {
                        map.addShaderUniform(value.id, value.propertyName, value.uniformtype);
                    }
                }
            }
        }
    }

    /**
     * Serialize bindingInfoMap to JSON for Rust FFI.
     * Format: {"0":[{"id":0,"name":"Scene3D","set":0,"binding":0,"bindingType":"uniform","dataType":0,"propertyId":1},...]}
     */
    private _serializeBindingInfoMap(): string {
        const obj: any = {};
        for (const [setIndex, bindings] of this.bindingInfoMap) {
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
                resourceClass: b.resourceClass,
                slotCapacity: b.slotCapacity,
            }));
        }
        return JSON.stringify(obj);
    }

    /**
     * Serialize textureExits to JSON for Rust FFI.
     * Format: {"2":3,"3":5}
     */
    private _serializeTextureExits(): string {
        const obj: any = {};
        for (const [setIndex, bitmask] of this.textureExitsMap) {
            obj[setIndex.toString()] = bitmask;
        }
        return JSON.stringify(obj);
    }

    /**
     * @inheritDoc
     * @override
     */
    _disposeResource(): void {
        if (this._nativeObj) {
            this._nativeObj.destroy();
        }
        this.bindingInfoMap.clear();
        this._resourcesCacheKey.clear();
        this.textureExitsMap.clear();
    }
}

function resourcePageClassName(resourceClass: number): string {
    switch (resourceClass) {
        case 1: return "sampledTexture2DFloat";
        case 2: return "sampledTexture2DArrayFloat";
        case 3: return "sampledTextureCubeFloat";
        case 4: return "sampledTexture2DDepth";
        case 5: return "sampledTexture2DArrayDepth";
        case 6: return "sampledTextureCubeDepth";
        default: return "";
    }
}
