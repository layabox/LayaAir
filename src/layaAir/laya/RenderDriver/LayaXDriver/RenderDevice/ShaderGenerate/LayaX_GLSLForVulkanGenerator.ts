import { Config3D } from "../../../../../Config3D";
import { LayaGL } from "../../../../layagl/LayaGL";
import { RenderParams } from "../../../../RenderEngine/RenderEnum/RenderParams";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { ShaderNode } from "../../../../webgl/utils/ShaderNode";
import { UniformProperty } from "../../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../../DriverDesign/RenderDevice/ShaderData";
import { LayaXBindingInfo, LayaXBindingInfoType, LayaXBindGroupHelper } from "../LayaXBindGroupHelper";
import { LayaXCommandUniformMap } from "../LayaXCommandUniformMap";
import { LayaXRenderEngine } from "../LayaXRenderEngine";
import { getTypeString, getTypeDefaultString, isSamplerType } from "./LayaX_GLSLGeneratorHelper";
import { GpuScenePropertyRecordSchema } from "../../RenderModuleData/LayaXGpuScenePropertyRecord";


const uniformRegex = /(?:layout\s*\([^)]*\)\s*)?\buniform\s+(?:(lowp|mediump|highp)\s+)?(?:(?:readonly|writeonly|coherent|volatile|restrict)\s+)*(\w+)\s+(\w+)(\s*\[\s*(\d+)\s*\])?\s*;/gm;

const uniformBlockRegex = /(?:layout\s*\([^)]*\)\s*)?uniform\s+(\w+)\s*\{([\s\S]*?)\}\s*;/g;

const glFragColorRegex = /gl_FragColor/g;

function removeBindingSuffix(name: string, suffix: "_Texture" | "_Sampler"): string {
    return name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
}

interface CollectUniform {
    samplerType?: string,
    arrayLength?: number,
    demision?: string,
    type: ShaderDataType
    set?: number
    declaredInGlsl?: boolean
    registeredInMaterialMap?: boolean
}

/**
 * attribute列表
 */
type AttributeMapType = {
    [key: string]: [ //主键，attribute名称
        number, //attribute位置绑定
        ShaderDataType, //attribute类型
    ]
};

/**
 * @internal
 * generate glsl for vulkan
 */
export class LayaX_GLSLForVulkanGenerator {

    /**
     * 
     * @param defines 
     * @param attributeMap //0:useAttributeMap  1:nouseAttributeMap
     * @param uniformMap 
     * @param shaderPassName 
     * @param materialMap 
     * @param VS 
     * @param FS 
     * @param useTexArray 
     * @param checkSetNumber 
     * @param appendSet 
     * @returns 
     */
    static layax_process(defines: string[], attributeMap: AttributeMapType[], uniformMap: Map<number, LayaXBindingInfo[]>, shaderPassName: string, materialMap: Map<number, UniformProperty>, VS: ShaderNode, FS: ShaderNode, useTexArray: Set<string>, checkSetNumber: number, appendSet: number, propertyRecordSchema?: GpuScenePropertyRecordSchema | null) {

        const engine = LayaXRenderEngine._instance;

        let defMap: { [key: string]: boolean } = {};
        for (const define of defines) {
            defMap[define] = true;
        }

        // todo 
        defMap["GRAPHICS_API_GLES3"] = true;

        // particle uniform 
        defMap["COLORKEYCOUNT_8"] = true;
        defMap["COLOROVERLIFETIME_COLORKEY_8"] = true;
        defMap["GRADIENTKEYCOUNT_8"] = true;

        let vs = VS.toscript(defMap, []);
        let fs = FS.toscript(defMap, []);

        let vsVersion = "";
        if (vs[0].indexOf("#version") == 0) {
            vsVersion = vs[0] + '\n';
        }

        let fsVersion = "";
        if (fs[0].indexOf("#version") == 0) {
            fsVersion = fs[0] + '\n';
        }

        let vertexCode = vs.join('\n');
        let fragmentCode = fs.join('\n');
        let gpuSceneAutoLowering: GpuSceneAutoLoweringPlan | null = null;

        const defineStrs = defineString(defMap);

        const additionDefineStrs = additionDefineString();

        const precision = `precision highp float;
        precision highp int;`;

        {
            let vs = `layout(std140, column_major) uniform;
#define attribute in
#define varying out
#define textureCube texture
#define texture2D texture

${defineStrs}

${additionDefineStrs}

${vertexCode}
`;
            let resVS = engine.shaderCompiler.glslang.glsl300es_preprocess(vs, "vertex");

            if (!resVS.success) {
                console.error("vertex shader preprocess error", resVS.info_log);
            }
            vertexCode = resVS.preprocessed_code;

            vertexCode = renameMainFunction(vertexCode, "main_vs");

            let fs = `layout(std140, column_major) uniform;
#define varying in
out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
#define gl_FragDepthEXT gl_FragDepth
#define texture2D texture
#define textureCube texture
#define texture2DProj textureProj
#define texture2DLodEXT textureLod
#define texture2DProjLodEXT textureProjLod
#define textureCubeLodEXT textureLod
#define texture2DGradEXT textureGrad
#define texture2DProjGradEXT textureProjGrad
#define textureCubeGradEXT textureGrad

${defineStrs}

${additionDefineStrs}

${fragmentCode}
`;
            let resFS = engine.shaderCompiler.glslang.glsl300es_preprocess(fs, "fragment");

            if (!resFS.success) {
                console.error("fragment shader preprocess error", resFS.info_log);
            }
            fragmentCode = resFS.preprocessed_code;
        }

        if (propertyRecordSchema?.generatedByLayaX) {
            const prepared = prepareGpuSceneAutoLowering(
                vertexCode,
                fragmentCode,
                materialMap,
                propertyRecordSchema
            );
            if ("error" in prepared) {
                return {
                    vertex: "",
                    fragment: "",
                    hasSampler: false,
                    error: prepared.error,
                };
            }
            vertexCode = prepared.vertex;
            fragmentCode = prepared.fragment;
            gpuSceneAutoLowering = prepared.plan;
        }

        const attributeStrs = attributeString(attributeMap[0], attributeMap[1]);

        const { varyings, vsOnlyVaryings } = executeVaryings(fragmentCode, vertexCode);

        const vertexVaryingStrs = varyingString(varyings, "out");
        const fragmentVaryingStrs = varyingString(varyings, "in");

        // 将只在 VS 中出现的 varying 声明为全局变量，避免赋值语句报错
        let vsOnlyGlobalStrs = "";
        for (const v of vsOnlyVaryings) {
            vsOnlyGlobalStrs += `${v}\n`;
        }

        const fragmentOutStrs = fragmentOutString(fragmentCode);

        // 将 materialMap 中通过 regIncludeBindUnifrom 注册的 uniform 预先加入 collectionUniforms，
        // 这些 uniform（如 u_IBLDFG）不在 GLSL 源码中声明，正则提取不到，
        // 需要手动补充，后续 uniformString2 才能为其生成带 set/binding 的声明。
        let collectionUniforms = new Map<string, CollectUniform>();
        const materialUniformNames = new Set<string>();
        if (materialMap && materialMap.size > 0) {
            materialMap.forEach((uniform) => {
                materialUniformNames.add(uniform.propertyName);
                if (!collectionUniforms.has(uniform.propertyName)) {
                    collectionUniforms.set(uniform.propertyName, {
                        type: uniform.uniformtype,
                        arrayLength: uniform.arrayLength > 0 ? uniform.arrayLength : undefined,
                        registeredInMaterialMap: true,
                    });
                }
            });
        }

        const uniformCollect = (match: string, precision: string, type: string, name: string, arrayDecl: string, arrayLength: string) => {
            // todo
            const oldUniform = collectionUniforms.get(name);
            let u: CollectUniform = {
                type: getShaderDataType(type),
                declaredInGlsl: true,
                registeredInMaterialMap: oldUniform?.registeredInMaterialMap || materialUniformNames.has(name),
            };

            if (u.type != ShaderDataType.None) {
                collectionUniforms.set(name, u);
            }

            if (type == "sampler2DShadow" || type == "samplerCubeShadow" || type == "sampler2DArrayShadow") {
                u.samplerType = "depth";
            }

            // todo
            if (type == "sampler2DArray") {
                u.demision = "2d-array";
            }
            if (type == "samplerCube") {
                u.demision = "cube";
            }

            if (arrayLength) {
                let length = parseInt(arrayLength);
                u.arrayLength = length;
            }

            return "\n";
        }

        // remove original uniforms
        vertexCode = vertexCode.replace(uniformRegex, uniformCollect);
        fragmentCode = fragmentCode.replace(uniformRegex, uniformCollect);

        let textureNames: string[] = [];

        const executeUniforms = (value: LayaXBindingInfo[], key: number) => {

            value.forEach(uniform => {
                if (uniform.type == LayaXBindingInfoType.texture) {
                    let name = removeBindingSuffix(uniform.name, "_Texture");

                    textureNames.push(name);

                    let collect = collectionUniforms.get(name);
                    if (collect) {
                        collect.set = uniform.set;
                    }
                }

                if (uniform.type == LayaXBindingInfoType.sampler) {
                    let name = removeBindingSuffix(uniform.name, "_Sampler");
                    let collect = collectionUniforms.get(name);

                    if (collect) {
                        collect.set = uniform.set;
                    }
                    else if (key < checkSetNumber) {
                        let samplerType: string = uniform.texture.sampleType;
                        if (uniform.sampler?.type == "comparison") {
                            samplerType = "depth";
                        }
                        // 这里的 type 无意义
                        collectionUniforms.set(name, { type: ShaderDataType.Texture2D, set: uniform.set });
                    }
                }

                if (uniform.type == LayaXBindingInfoType.storageBuffer) {
                    let collect = collectionUniforms.get(uniform.name);
                    if (collect) {
                        collect.set = uniform.set;
                    }
                }

                if (uniform.type == LayaXBindingInfoType.buffer) {
                    let name = uniform.name;

                    let commandMap = LayaGL.renderDeviceFactory.createGlobalUniformMap(name) as LayaXCommandUniformMap;

                    commandMap._idata.forEach((u, i) => {
                        let collect = collectionUniforms.get(u.propertyName);
                        if (collect) {
                            collect.set = uniform.set;
                        }
                    });
                }
            });
        };

        uniformMap.forEach(executeUniforms);

        // 添加 新检出的 uniform（appendSet < 0 表示禁用，跳过）
        if (appendSet >= 0) {
            let wildUniforms: string[] = [];
            collectionUniforms.forEach((value, name) => {
                if (value.set == undefined) {
                    if (value.declaredInGlsl && !value.registeredInMaterialMap) {
                        const arrayInfo = value.arrayLength ? `[${value.arrayLength}]` : "";
                        wildUniforms.push(`${name}${arrayInfo}:${ShaderDataType[value.type]}`);
                    }
                }
            });
            if (wildUniforms.length > 0) {
                console.error(
                    `[LayaX] Shader "${shaderPassName}" declares uniforms in GLSL that are not registered before material creation. ` +
                    `Missing: ${wildUniforms.join(", ")}`
                );
            }
        }

        // remove original uniform blocks
        vertexCode = vertexCode.replace(uniformBlockRegex, '\n');
        fragmentCode = fragmentCode.replace(uniformBlockRegex, '\n');
        // remove original varyings
        vertexCode = vertexCode.replace(vertexVaryingRegex, '\n');
        fragmentCode = fragmentCode.replace(fragmentVaryingRegex, '\n');
        // replace texture samplers function

        // fragment out 
        fragmentCode = fragmentCode.replace(vertexVaryingRegex, "");

        if (gpuSceneAutoLowering) {
            const loweredVertex = lowerGpuScenePropertyAccess(
                vertexCode,
                gpuSceneAutoLowering,
                "getGpuSceneDataRecordIndex()"
            );
            const loweredFragment = lowerGpuScenePropertyAccess(
                fragmentCode,
                gpuSceneAutoLowering,
                GPU_SCENE_RECORD_INDEX_VARYING
            );
            if (!loweredVertex.success || !loweredFragment.success) {
                return {
                    vertex: "",
                    fragment: "",
                    hasSampler: false,
                    error: loweredVertex.error || loweredFragment.error,
                };
            }
            vertexCode = loweredVertex.source;
            fragmentCode = loweredFragment.source;
        }

        vertexCode = replaceTextureSampler(vertexCode, useTexArray);
        fragmentCode = replaceTextureSampler(fragmentCode, useTexArray);

        // Cull resources that disappeared during preprocessing and renumber binding indices.
        // Storage buffers must be checked for every set: unlike classic scene UBOs, an
        // optional scene-global SSBO has no valid placeholder binding when its feature
        // define is absent.
        {
            let texturePropertyIds: number[] = [];
            for (const texName of useTexArray) {
                if (texName.endsWith("_Texture")) {
                    texturePropertyIds.push(
                        Shader3D.propertyNameToID(texName.substring(0, texName.length - 8))
                    );
                }
            }
            const preprocessedShaderCode = `${vertexCode}\n${fragmentCode}`;
            uniformMap.forEach((value, key) => {
                let filtered: LayaXBindingInfo[] = [];
                for (const info of value) {
                    if (info.type === LayaXBindingInfoType.storageBuffer
                        && !containsIdentifier(preprocessedShaderCode, info.name)) {
                        continue;
                    }
                    if (info.type === LayaXBindingInfoType.resourcePage
                        && !containsIdentifier(preprocessedShaderCode, info.name)) {
                        continue;
                    }
                    if (info.type === LayaXBindingInfoType.sampler && info.keepAlive
                        && !containsIdentifier(preprocessedShaderCode, info.name)) {
                        continue;
                    }
                    if ((info.type === LayaXBindingInfoType.texture || info.type === LayaXBindingInfoType.sampler) && !info.keepAlive) {
                        if (key < checkSetNumber || texturePropertyIds.includes(info.propertyId)) {
                            filtered.push(info);
                        }
                    } else {
                        filtered.push(info);
                    }
                }
                // Renumber binding indices to be continuous
                for (let i = 0; i < filtered.length; i++) {
                    filtered[i].binding = i;
                }
                uniformMap.set(key, filtered);
            });
        }

        // 将所有 gl_VertexID 替换为 gl_VertexIndex
        vertexCode = vertexCode.replace(/gl_VertexID/g, "gl_VertexIndex");
        fragmentCode = fragmentCode.replace(/gl_VertexID/g, "gl_VertexIndex");

        // Graphics SSBO declarations live in the shader source while their
        // authoritative set/binding assignments live in the global uniform maps.
        // Inject those assignments after preprocessing so Vulkan never relies on
        // implicit binding zero (and so readonly reflection matches the layout).
        const graphicsSsboBindingMap = new Map<string, { set: number, binding: number }>();
        uniformMap.forEach((uniforms) => {
            for (const uniform of uniforms) {
                if (uniform.type === LayaXBindingInfoType.storageBuffer) {
                    graphicsSsboBindingMap.set(uniform.name, {
                        set: uniform.set,
                        binding: uniform.binding,
                    });
                }
            }
        });
        vertexCode = ssboStrings(graphicsSsboBindingMap, vertexCode);
        fragmentCode = ssboStrings(graphicsSsboBindingMap, fragmentCode);

        const uniformStrs = uniformString2(uniformMap, materialMap, useTexArray, collectionUniforms, checkSetNumber, appendSet);

        const glslVersion = "#version 450\n";
        // ResourcePage arrays are converted to WGSL binding arrays by the Native
        // shader bridge. Do not emit GL_EXT_nonuniform_qualifier here: the bundled
        // SPIR-V frontend rejects ShaderNonUniform before it can produce WGSL.
        const resourcePageExtension = "";

        let vertex = `${glslVersion}${resourcePageExtension}
${precision}

${defineStrs}

${attributeStrs}

${uniformStrs}

${vertexVaryingStrs}

${vsOnlyGlobalStrs}

${vertexCode}
`;

        let fragment = `${glslVersion}${resourcePageExtension}
${precision}

${fragmentOutStrs}

${additionDefineStrs}

${defineStrs}

${uniformStrs}

${fragmentVaryingStrs}

${fragmentCode}
`;

        return {
            vertex,
            fragment,
            hasSampler: collectionUniforms.size > 0
        };

    }

    static proccessCompute(defines: string[], uniformCommandMaps: LayaXCommandUniformMap[], uniformMaps: Map<number, LayaXBindingInfo[]>, node: ShaderNode, shaderName: string) {
        const engine = LayaXRenderEngine._instance;

        let defMap: { [key: string]: boolean } = {};
        for (const define of defines) {
            defMap[define] = true;
        }

        let code = node.toscript(defMap, []);

        let computeCode = code.join('\n');

        const defineStrs = defineString(defMap);

        const glslVersion = "#version 450\n";

        const ssboBindingMap = new Map<string, { set: number, binding: number }>();

        const getUniformDeclaration = (uniformMaps: Map<number, LayaXBindingInfo[]>, usedTex?: Map<string, { type: string, format?: string, access?: "readonly" | "writeonly" | "readwrite" }>) => {
            let res = "";
            const emittedBlockUniforms = new Set<string>();
            uniformMaps.forEach((value, set) => {
                for (let uniform of value) {
                    switch (uniform.type) {
                        case LayaXBindingInfoType.storageBuffer: {
                            let setIndex = set;
                            let bindingIndex = uniform.binding;
                            ssboBindingMap.set(uniform.name, { set: setIndex, binding: bindingIndex });
                            break;
                        }
                        case LayaXBindingInfoType.storageTexture:
                            {
                                let access = wgslAccessToGlsl(uniform.storageTexture.access);
                                res = `${res}layout(${uniform.format ? uniform.format : "rgba8"}, set=${set}, binding=${uniform.binding}) uniform ${access} image2D ${uniform.name};\n`;
                                break;
                            }
                        case LayaXBindingInfoType.buffer: {
                            let commandMap = (LayaGL.renderDeviceFactory.createGlobalUniformMap(uniform.name) as LayaXCommandUniformMap)
                            if (commandMap._hasUniformBuffer) {
                                let uniformMap = commandMap._idata;
                                res = `${res}${uniformMapString(uniformMap, uniform.name, uniform.set, uniform.binding, true, new Map(), emittedBlockUniforms).code}\n`;
                            }
                            break;
                        }
                        case LayaXBindingInfoType.texture: {
                            const textureName = removeBindingSuffix(uniform.name, "_Texture");

                            if (!usedTex || usedTex.has(textureName)) {
                                const textureType = getSamplerTextureType(uniform.texture.sampleType, uniform.texture.viewDimension);
                                res = `${res}layout(set=${set}, binding=${uniform.binding}) uniform ${textureType} ${textureName};\n`;
                            }
                            break;
                        }
                        default:
                            break;
                    }
                }
            });

            return res;
        }

        const uniformStr = getUniformDeclaration(uniformMaps);

        // // 为 ssbo 声明添加 set binding index
        // const preprocessCode = ssboStrings(ssboBindingMap, computeCode);

        let resCode = getComputeCode(glslVersion, defineStrs, uniformStr, computeCode);

        // 预处理
        let preprocessRes = engine.shaderCompiler.glslang.preprocess_compute(resCode, 'compute');
        if (!preprocessRes.success) {
            console.error(`LayaXComputeShader ${shaderName} preprocess error:`, preprocessRes.info_log);
            return {};
        }

        // 移除 uniform 声明
        computeCode = computeCode.replace(uniformRegex, "");

        if (preprocessRes.uniforms.size > 0 || preprocessRes.ssbos.size > 0) {
            // 检查是否有新增的 uniform
            const exists = new Map<number, LayaXBindingInfo>();
            uniformMaps.forEach(properties => {
                for (let uniform of properties) {
                    // 当前 shader 中都是 匿名 ubo, 
                    // 新增的游离 uniform 不应与 ubo 中属性重名
                    // 因此这里不与 ubo 中每个属性值进行检测
                    exists.set(uniform.propertyId, uniform);
                }
            });

            // let toremove = [];

            // 保证至少存在一个map
            let additionMaps = uniformCommandMaps[0];

            let addNewUniform = false;
            let uniformNames = preprocessRes.uniforms.keys();
            for (let name of uniformNames) {
                let propertyId = Shader3D.propertyNameToID(name);
                if (!exists.has(propertyId)) {
                    // 添加新的 uniform
                    let info = preprocessRes.uniforms.get(name);
                    let type = info!.type;
                    let access = info!.access;

                    let arrayLength = getArrayLength(type);
                    if (arrayLength > 0) {
                        type = type.substring(0, type.lastIndexOf('['));
                        additionMaps.addShaderUniformArray(propertyId, name, getShaderDataType(type), arrayLength);
                    }
                    else {
                        additionMaps.addShaderUniform(propertyId, name, getShaderDataType(type), info);
                    }

                    addNewUniform = true;

                    // if (!glslTypeIsSampler(type)) {
                    // toremove.push(name);
                    // }
                }
            }
            let addNewSSBO = false;
            let ssboNames = preprocessRes.ssbos.keys();
            for (let name of ssboNames) {
                let propertyId = Shader3D.propertyNameToID(name);
                if (!exists.has(propertyId)) {
                    // 添加新的 ssbo

                    let shaderType = ShaderDataType.DeviceBuffer;

                    const access = preprocessRes.ssbos.get(name);
                    if (access == "readonly") {
                        shaderType = ShaderDataType.ReadOnlyDeviceBuffer;
                    }

                    additionMaps.addShaderUniform(propertyId, name, shaderType, { access });

                    addNewSSBO = true;
                }
                else {
                    let uniform = exists.get(propertyId)!;
                    const access = preprocessRes.ssbos.get(name);

                    switch (uniform.buffer.type) {
                        case "storage":
                            if (access == "readonly") {
                                // 访问类型不匹配
                                console.warn(`Shader ${shaderName} ssbo access type mismatch for ${name}`);
                            }
                            break;
                        case "read-only-storage":
                            if (access != "readonly") {
                                // 访问类型不匹配
                                console.warn(`Shader ${shaderName} ssbo access type mismatch for ${name}`);
                            }
                            break;
                        case "uniform":
                        default:
                            break;
                    }
                }
            }

            if (addNewUniform || addNewSSBO) {
                // const namesStr = toremove.join("|");
                // const removeRegex = new RegExp(`\\buniform\\s+(?:(?:lowp|mediump|highp)\\s+)?\\w+\\s+(?:${namesStr})\\b(?:\\s*\\[\\s*\\d+\\s*\\])?\\s*;`, "g");

                // 生成新的 resource
                uniformMaps.set(0, LayaXBindGroupHelper.createBindingInfoArray(0, [additionMaps._stateName]));
            }

            ssboBindingMap.clear();
            const newUniformStr = getUniformDeclaration(uniformMaps, preprocessRes.uniforms);
            computeCode = ssboStrings(ssboBindingMap, computeCode);

            resCode = getComputeCode(glslVersion, defineStrs, newUniformStr, computeCode);

            return {
                code: resCode,
                hasSampler: preprocessRes.samplers.size > 0
            };
        }

        // 移除 ssob 声明
        computeCode = ssboStrings(ssboBindingMap, computeCode);
        resCode = getComputeCode(glslVersion, defineStrs, uniformStr, computeCode);

        return {
            code: resCode,
            hasSampler: preprocessRes.samplers.size > 0
        };
    }

}

const GPU_SCENE_RECORD_INDEX_VARYING = "v_LayaXGpuSceneRecordIndex";
const GPU_SCENE_PROPERTY_TABLE_INSTANCE = "LayaXGpuScenePropertyTable";

interface GpuSceneAutoValueField {
    name: string;
    type: ShaderDataType;
    wordOffset: number;
}

interface GpuSceneAutoTextureField {
    name: string;
    wordOffset: number;
}

interface GpuSceneAutoLoweringPlan {
    strideInWords: number;
    valueFields: GpuSceneAutoValueField[];
    textureFields: GpuSceneAutoTextureField[];
}

type GpuSceneAutoPrepareResult = {
    success: true;
    vertex: string;
    fragment: string;
    plan: GpuSceneAutoLoweringPlan;
} | {
    success: false;
    error: string;
};

function prepareGpuSceneAutoLowering(
    vertex: string,
    fragment: string,
    uniformMap: Map<number, UniformProperty>,
    schema: GpuScenePropertyRecordSchema
): GpuSceneAutoPrepareResult {
    const properties = new Map<number, UniformProperty>();
    uniformMap.forEach(property => properties.set(property.id, property));

    const valueFields: GpuSceneAutoValueField[] = [];
    for (const field of schema.valueFields) {
        const property = properties.get(field.propertyId);
        if (!property || property.uniformtype !== field.uniformType) {
            return { success: false, error: `property-record value ${field.propertyId} is not registered` };
        }
        valueFields.push({
            name: property.propertyName,
            type: property.uniformtype,
            wordOffset: field.byteOffset >>> 2,
        });
    }

    const textureFields: GpuSceneAutoTextureField[] = [];
    for (const field of schema.textureFields) {
        const property = properties.get(field.propertyId);
        if (!property || property.uniformtype !== ShaderDataType.Texture2D) {
            return { success: false, error: `property-record texture ${field.propertyId} is not a Texture2D` };
        }
        textureFields.push({
            name: property.propertyName,
            wordOffset: field.tokenByteOffset >>> 2,
        });
    }

    const plan: GpuSceneAutoLoweringPlan = {
        strideInWords: schema.recordStrideInBytes >>> 2,
        valueFields,
        textureFields,
    };
    const propertyNames = [
        ...valueFields.map(field => field.name),
        ...textureFields.map(field => field.name),
    ];
    const vertexBody = stripGpuSceneUniformDeclarations(vertex);
    const fragmentBody = stripGpuSceneUniformDeclarations(fragment);
    const vertexUsesRecord = propertyNames.some(name => containsIdentifier(vertexBody, name));
    const fragmentUsesRecord = propertyNames.some(name => containsIdentifier(fragmentBody, name));

    if ((vertexUsesRecord || fragmentUsesRecord)
        && !containsIdentifier(vertex, "getGpuSceneDataRecordIndex")) {
        return { success: false, error: "the GPUScene node-record index protocol is unavailable" };
    }

    if (fragmentUsesRecord) {
        const mainRegex = /\bvoid\s+main_vs\s*\(\s*\)\s*\{/;
        if (!mainRegex.test(vertex)) {
            return { success: false, error: "the vertex entry point cannot publish the record index" };
        }
        vertex = `flat out uint ${GPU_SCENE_RECORD_INDEX_VARYING};\n${vertex.replace(
            mainRegex,
            match => `${match}\n    ${GPU_SCENE_RECORD_INDEX_VARYING} = getGpuSceneDataRecordIndex();`
        )}`;
        fragment = `flat in uint ${GPU_SCENE_RECORD_INDEX_VARYING};\n${fragment}`;
    }

    return { success: true, vertex, fragment, plan };
}

function stripGpuSceneUniformDeclarations(source: string): string {
    return source
        .replace(uniformRegex, "")
        .replace(uniformBlockRegex, "");
}

function lowerGpuScenePropertyAccess(
    source: string,
    plan: GpuSceneAutoLoweringPlan,
    recordIndex: string
): { success: boolean; source: string; error?: string } {
    const activeValues = plan.valueFields.filter(field => containsIdentifier(source, field.name));
    const activeTextures = plan.textureFields.filter(field => containsIdentifier(source, field.name));
    if (activeValues.length === 0 && activeTextures.length === 0) {
        return { success: true, source };
    }

    const textureResult = replaceGpuSceneTextureArguments(
        source,
        activeTextures,
        plan.strideInWords,
        recordIndex
    );
    if (!textureResult.success) {
        return textureResult;
    }
    source = textureResult.source;

    for (const field of activeValues) {
        const escaped = field.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const expression = gpuSceneValueExpression(
            field.type,
            plan.strideInWords,
            field.wordOffset,
            recordIndex
        );
        if (!expression) {
            return { success: false, source, error: `unsupported value type for ${field.name}` };
        }
        source = source.replace(new RegExp(`\\b${escaped}\\b`, "g"), `(${expression})`);
    }

    source = `readonly buffer GpuSceneDataBuffer
{
    uint gpuScenePropertyWords[];
}
${GPU_SCENE_PROPERTY_TABLE_INSTANCE};
${source}`;
    return { success: true, source };
}

function replaceGpuSceneTextureArguments(
    source: string,
    fields: GpuSceneAutoTextureField[],
    strideInWords: number,
    recordIndex: string
): { success: boolean; source: string; error?: string } {
    if (fields.length === 0) {
        return { success: true, source };
    }
    const fieldsByName = new Map(fields.map(field => [field.name, field]));
    const replacements: { begin: number; end: number; text: string }[] = [];
    const callRegex = /\b(?:texture|textureLod|textureGrad|textureProj|textureProjLod|textureProjGrad)\s*\(/g;
    let match: RegExpExecArray | null;
    while ((match = callRegex.exec(source)) !== null) {
        const openParen = callRegex.lastIndex - 1;
        let depth = 1;
        let firstComma = -1;
        for (let index = openParen + 1; index < source.length && depth > 0; ++index) {
            const character = source[index];
            if (character === "(") {
                ++depth;
            } else if (character === ")") {
                --depth;
            } else if (character === "," && depth === 1) {
                firstComma = index;
                break;
            }
        }
        if (firstComma < 0) {
            continue;
        }
        const argument = source.slice(openParen + 1, firstComma).trim();
        const field = fieldsByName.get(argument);
        if (!field) {
            continue;
        }
        const token = gpuSceneWordExpression(
            strideInWords,
            field.wordOffset,
            recordIndex
        );
        replacements.push({
            begin: openParen + 1,
            end: firstComma,
            text: `sampler2D(GpuSceneResourcePage[${token}], GpuSceneFixedSampler_Sampler)`,
        });
    }

    for (let index = replacements.length - 1; index >= 0; --index) {
        const replacement = replacements[index];
        source = source.slice(0, replacement.begin)
            + replacement.text
            + source.slice(replacement.end);
    }
    for (const field of fields) {
        if (containsIdentifier(source, field.name)) {
            return {
                success: false,
                source,
                error: `texture ${field.name} is not used as a supported direct sampling argument`,
            };
        }
    }
    return { success: true, source };
}

function gpuSceneValueExpression(
    type: ShaderDataType,
    strideInWords: number,
    wordOffset: number,
    recordIndex: string
): string | null {
    const floatWord = (component: number) =>
        `uintBitsToFloat(${gpuSceneWordExpression(strideInWords, wordOffset + component, recordIndex)})`;
    switch (type) {
        case ShaderDataType.Int:
            return `int(${gpuSceneWordExpression(strideInWords, wordOffset, recordIndex)})`;
        case ShaderDataType.Bool:
            return `${gpuSceneWordExpression(strideInWords, wordOffset, recordIndex)} != 0u`;
        case ShaderDataType.Float:
            return floatWord(0);
        case ShaderDataType.Vector2:
            return `vec2(${floatWord(0)}, ${floatWord(1)})`;
        case ShaderDataType.Vector3:
            return `vec3(${floatWord(0)}, ${floatWord(1)}, ${floatWord(2)})`;
        case ShaderDataType.Vector4:
        case ShaderDataType.Color:
            return `vec4(${floatWord(0)}, ${floatWord(1)}, ${floatWord(2)}, ${floatWord(3)})`;
        case ShaderDataType.Matrix3x3:
            return `mat3(${Array.from({ length: 9 }, (_, index) => floatWord(index)).join(", ")})`;
        case ShaderDataType.Matrix4x4:
            return `mat4(${Array.from({ length: 16 }, (_, index) => floatWord(index)).join(", ")})`;
        default:
            return null;
    }
}

function gpuSceneWordExpression(
    strideInWords: number,
    wordOffset: number,
    recordIndex: string
): string {
    return `${GPU_SCENE_PROPERTY_TABLE_INSTANCE}.gpuScenePropertyWords[` +
        `uint(${recordIndex}) * ${strideInWords}u + ${wordOffset}u]`;
}

function defineString(defines: { [key: string]: boolean }) {
    let res = "";

    for (const key in defines) {
        if (defines[key]) {
            res += `#define ${key}\n`;
        }
    }

    return res;
}

function attributeString(attributeMap: AttributeMapType, nouseAttributeMap: AttributeMapType) {
    let res = "";

    let location = 0;

    let attributeDefines = "";

    for (const key in attributeMap) {
        let type = getTypeString(attributeMap[key][1]);

        // todo
        if (key == "a_BoneIndices") {
            type = "uvec4";
        }

        location = attributeMap[key][0];
        if (type != "") {
            if (type == "mat4") {
                res = `${res}layout(location = ${location++}) in vec4 ${key}_0;\n`;
                res = `${res}layout(location = ${location++}) in vec4 ${key}_1;\n`;
                res = `${res}layout(location = ${location++}) in vec4 ${key}_2;\n`;
                res = `${res}layout(location = ${location}) in vec4 ${key}_3;\n`;

                attributeDefines = `${attributeDefines}#define ${key} mat4(${key}_0, ${key}_1, ${key}_2, ${key}_3)\n`;
            }
            else {
                res = `${res}layout(location = ${location}) in ${type} ${key};\n`;
            }
        }
    }

    for (const key in nouseAttributeMap) {//兼容gles可以有没有绑定的Attribute的方案
        let type = getTypeString(nouseAttributeMap[key][1]);
        let defaultValue = getTypeDefaultString(nouseAttributeMap[key][1]);
        // todo
        if (key == "a_BoneIndices") {
            type = "uvec4";
            defaultValue = "uvec4(0)"
        }

        nouseAttributeMap[key][0];
        if (type != "") {
            if (type == "mat4") {
                res = `${res}const vec4 ${key}_0 = vec4(0.0);\n`;
                res = `${res}const vec4 ${key}_1 = vec4(0.0);\n`;
                res = `${res}const vec4 ${key}_2 = vec4(0.0);\n`;
                res = `${res}const vec4 ${key}_3 = vec4(0.0);\n`;

                attributeDefines = `${attributeDefines}#define ${key} mat4(${key}_0, ${key}_1, ${key}_2, ${key}_3)\n`;
            }
            else {
                res = `${res}const ${type} ${key} =${defaultValue};\n`;
            }
        }
    }

    return `${res}
${attributeDefines}
`;
}

function uniformMapString(uniformMap: Map<number, UniformProperty>, name: string, set: number, bindOffset: number, skipTexture: boolean, collectUniforms: Map<string, CollectUniform>, emittedBlockUniforms: Set<string>) {
    let textureUniforms: UniformProperty[] = [];
    let blockUniforms: UniformProperty[] = [];

    uniformMap.forEach(uniform => {
        if (isSamplerType(uniform.uniformtype)) {
            textureUniforms.push(uniform);
        }
        else if (!emittedBlockUniforms.has(uniform.propertyName)) {
            blockUniforms.push(uniform);
            emittedBlockUniforms.add(uniform.propertyName);
        }
    });

    let res = "";
    let binding = bindOffset;
    if (blockUniforms.length > 0) {
        res = `${res}layout(std140, set=${set}, binding=${binding++}) uniform ${name} {`;

        for (let uniform of blockUniforms) {
            let uniformName = uniform.propertyName;
            if (uniform.arrayLength > 0) {
                let arrayLength = collectUniforms.get(uniformName)?.arrayLength || uniform.arrayLength;
                uniformName = `${uniformName}[${arrayLength}]`;
            }

            let typeStr = getTypeString(uniform.uniformtype);
            if (typeStr != "") {
                res = `${res}
    ${typeStr} ${uniformName};`;
            }

        }

        res = `${res}
};
`
    }

    if (!skipTexture && textureUniforms.length > 0) {
        for (let uniform of textureUniforms) {

            switch (uniform.uniformtype) {
                case ShaderDataType.Texture2D:
                    res = `${res}layout(set=${set}, binding=${binding++}) uniform texture2D ${uniform.propertyName}_Texture;
 layout(set=${set}, binding=${binding++}) uniform sampler ${uniform.propertyName}_Sampler;
`;
                    break;
                case ShaderDataType.TextureCube:
                    res = `${res}layout(set=${set}, binding=${binding++}) uniform texture2D ${uniform.propertyName}_Texture;
layout(set=${set}, binding=${binding++}) uniform sampler ${uniform.propertyName}_Sampler;
`;
                    break;
                // todo
                case ShaderDataType.Texture2DArray:
                case ShaderDataType.Texture3D:
                default:
                    break;
            }
        }
    }


    return {
        code: res,
        binding: binding
    }
}

function uniformString2(uniformSetMap: Map<number, LayaXBindingInfo[]>, materialMap: Map<number, UniformProperty>, usedTexSet: Set<string>, collectUniforms: Map<string, CollectUniform>, checkSetNumber: number, appendSet: number) {
    let res = "";

    let samplerMap = new Map<string, LayaXBindingInfo>();
    const emittedBlockUniforms = new Set<string>();

    uniformSetMap.forEach((value, key) => {
        if (value.length > 0) {
            for (let uniform of value) {
                switch (uniform.type) {
                    case LayaXBindingInfoType.storageBuffer:
                        //TODO
                        break;
                    case LayaXBindingInfoType.storageTexture:
                        //TODO
                        break;
                    case LayaXBindingInfoType.buffer:
                        {
                            let uniformMap = (LayaGL.renderDeviceFactory.createGlobalUniformMap(uniform.name) as LayaXCommandUniformMap)._idata;
                            if (key == appendSet) {
                                uniformMap = materialMap;
                            }

                            res = `${res}${uniformMapString(uniformMap, uniform.name, uniform.set, uniform.binding, true, collectUniforms, emittedBlockUniforms).code}\n`;
                            break;
                        }
                    case LayaXBindingInfoType.texture:
                        {
                            let textureName = removeBindingSuffix(uniform.name, "_Texture");
                            let collectUniform = collectUniforms.get(textureName);
                            if (collectUniform) {
                                uniform.texture.sampleType = uniform.texture.sampleType;
                                uniform.texture.viewDimension = collectUniform.demision || uniform.texture.viewDimension;
                            }

                            let textureType = getDimensionTextureType(uniform.texture?.viewDimension);

                            res = `${res}layout(set=${uniform.set}, binding=${uniform.binding}) uniform ${textureType} ${uniform.name};\n`

                            let samplerName = removeBindingSuffix(uniform.name, "_Texture");
                            samplerMap.set(samplerName, uniform);
                        }
                        break;
                    case LayaXBindingInfoType.sampler:
                        {
                            let sampler = "sampler";
                            let samplerName = removeBindingSuffix(uniform.name, "_Sampler");

                            let collectUniform = collectUniforms.get(samplerName);
                            if (collectUniform) {
                                if (collectUniform.samplerType == "depth") {
                                    uniform.sampler.type = "comparison";
                                    sampler = "samplerShadow";
                                }
                            }

                            res = `${res}layout(set=${uniform.set}, binding=${uniform.binding}) uniform ${sampler} ${uniform.name};\n`;
                        }
                        break;
                    case LayaXBindingInfoType.resourcePage:
                        {
                            const capacity = Math.max(1, uniform.slotCapacity || 1);
                            let textureType = "texture2D";
                            if (uniform.resourceClass === "sampledTexture2DArrayFloat" || uniform.resourceClass === "sampledTexture2DArrayDepth") {
                                textureType = "texture2DArray";
                            } else if (uniform.resourceClass === "sampledTextureCubeFloat" || uniform.resourceClass === "sampledTextureCubeDepth") {
                                textureType = "textureCube";
                            }
                            res = `${res}layout(set=${uniform.set}, binding=${uniform.binding}) uniform ${textureType} ${uniform.name}[${capacity}];\n`;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    });

    let samplerDefStrs = "\n";
    samplerMap.forEach((uniform, key) => {
        let sampleType = collectUniforms.get(key)?.samplerType || uniform.texture.sampleType;
        let sampler = getSamplerTextureType(sampleType, uniform.texture.viewDimension);
        samplerDefStrs += `#define ${key} ${sampler}(${uniform.name}, ${key}_Sampler)\n`;
        uniform.texture.sampleType = sampleType;
    });

    return res + samplerDefStrs;
}


function getVaryingRegex(ioType: string): RegExp {
    return new RegExp(`(?:(flat|smooth|noperspective)\\s+)?${ioType}\\s+(?:(lowp|mediump|highp)\\s+)?(\\w+)\\s+(\\w+)\\s*;`, 'g');
}

const vertexVaryingRegex = getVaryingRegex("out");
const fragmentVaryingRegex = getVaryingRegex("in");

function findVaryings(source: string, regex: RegExp): string[] {
    let varyings: string[] = [];
    let result;

    while ((result = regex.exec(source)) !== null) {
        // 修饰符
        const interpolation = result[1] ? `${result[1]} ` : '';
        // 判断是否有精度限定符
        const precision = result[2] ? `${result[2]} ` : '';
        const type = result[3].trim();
        const name = result[4].trim();

        varyings.push(`${interpolation} ${precision} ${type} ${name};`);
    }

    return varyings;
}

function varyingString(varyings: string[], io: string) {

    let res = "";
    for (let i = 0; i < varyings.length; i++) {
        res += `layout(location = ${i}) ${io} ${varyings[i]}\n`;
    }
    return res;

}

function executeVaryings(fsSource: string, vsSource: string) {

    let vertexVaryings = findVaryings(vsSource, vertexVaryingRegex);
    let fragmentVaryings = findVaryings(fsSource, fragmentVaryingRegex);

    let varyings = vertexVaryings.filter(item => fragmentVaryings.includes(item));
    let vsOnlyVaryings = vertexVaryings.filter(item => !fragmentVaryings.includes(item));

    return { varyings, vsOnlyVaryings };

}

function fragmentOutString(source: string) {
    // todo mrt
    return "layout(location = 0) out vec4 pc_fragColor;"
}

/**
 * 
 * @param source 
 * @out usedTexSet 
 * @returns 
 */
function replaceTextureSampler(source: string, usedTexSet: Set<string>) {

    const textureRegx = /texture\s*\(\s*([\w_]+)\s*,\s*([^)]*)\s*\)/g;
    let newSource = source.replace(textureRegx, (match, textureName, uvName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return match;
        return `texture(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName})`;
    });

    const textureProjRegx = /textureProj\s*\(\s*([\w_]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(textureProjRegx, (match, textureName, uvName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return match;
        return `textureProj(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName})`;
    });

    const textureLodRegx = /textureLod\s*\(\s*([\w_]+)\s*,\s*([^,]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(textureLodRegx, (match, textureName, uvName, lodName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return match;
        return `textureLod(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName}, ${lodName})`;
    });

    const textureProjLodRegx = /textureProjLod\s*\(\s*([\w_]+)\s*,\s*([^,]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(textureProjLodRegx, (match, textureName, uvName, lodName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return match;
        return `textureProjLod(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName}, ${lodName})`;
    });

    const textureGradRegx = /textureGrad\s*\(\s*([\w_]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(textureGradRegx, (match, textureName, uvName, ddxName, ddyName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return match;
        return `textureGrad(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName}, ${ddxName}, ${ddyName})`;
    });

    const textureProjGradRegx = /textureProjGrad\s*\(\s*([\w_]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(textureProjGradRegx, (match, textureName, uvName, ddxName, ddyName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return match;
        return `textureProjGrad(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName}, ${ddxName}, ${ddyName})`;
    });
    return newSource;
}

function additionDefineString() {

    return `
#define MAX_LIGHT_COUNT ${Config3D.maxLightCount}
#define MAX_LIGHT_COUNT_PER_CLUSTER ${Config3D._maxAreaLightCountPerClusterAverage}
#define CLUSTER_X_COUNT ${Config3D.lightClusterCount.x}
#define CLUSTER_Y_COUNT ${Config3D.lightClusterCount.y}
#define CLUSTER_Z_COUNT ${Config3D.lightClusterCount.z}
#define MORPH_MAX_COUNT ${Config3D.maxMorphTargetCount}
#define SHADER_CAPAILITY_LEVEL ${LayaGL.renderEngine.getParams(RenderParams.SHADER_CAPAILITY_LEVEL)}
`

}

// todo
function getSamplerTextureType(type: string = "float", dimension: string = "2d") {
    if (dimension == "2d") {
        switch (type) {
            case "depth":
                return "sampler2DShadow";
            case "float":
            case "unfilterable-float":
            case "sint":
            case "uint":
            default:
                return "sampler2D";
        }
    }
    else if (dimension == "cube") {
        switch (type) {
            case "depth":
                return "samplerCubeShadow";
            default:
                return "samplerCube";
        }
    }
    else if (dimension == "2d-array") {
        switch (type) {
            case "depth":
                return "sampler2DArrayShadow";
            default:
                return "sampler2DArray";
        }
    }
    else if (dimension == "3d") {
        switch (type) {
            case "depth":
                return "sampler3DShadow";
            default:
                return "sampler3D";
        }
    }
    else if (dimension == "cube-array") {
        switch (type) {
            case "depth":
                return "samplerCubeArrayShadow";
            default:
                return "samplerCubeArray";
        }
    }
    else if (dimension == "1d") {
        switch (type) {
            case "depth":
                return "sampler1DShadow";
            default:
                return "sampler1D";
        }
    }
    else {
        return "sampler2D";
    }
}

function getDimensionTextureType(type: string) {
    switch (type) {
        case "1d":
            return "texture1D";
        case "2d":
            return "texture2D";
        case "2d-array":
            return "texture2DArray";
        case "cube":
            return "textureCube";
        case "cube-array":
            return "textureCubeArray";
        case "3d":
            return "texture3D";
        default:
            return "texture2D";
    }
}

function getShaderDataType(type: string) {
    // todo types
    switch (type) {
        case "float":
            return ShaderDataType.Float;
        case "int":
        case "uint":
            return ShaderDataType.Int;
        case "bool":
            return ShaderDataType.Bool;
        case "vec2":
            return ShaderDataType.Vector2;
        case "vec3":
            return ShaderDataType.Vector3;
        case "vec4":
            return ShaderDataType.Vector4;
        case "mat3":
            return ShaderDataType.Matrix3x3;
        case "mat4":
            return ShaderDataType.Matrix4x4;
        case "sampler2D":
        case "sampler2DShadow":
            return ShaderDataType.Texture2D;
        case "samplerCube":
        case "samplerCubeShadow":
            return ShaderDataType.TextureCube;
        case "sampler2DArray":
        case "sampler2DArrayShadow":
            return ShaderDataType.Texture2DArray;
        case "image2D":
            return ShaderDataType.StorageTexture2D;
        default:
            return ShaderDataType.None;
    }
}

function wgslAccessToGlsl(access: string) {
    switch (access) {
        case "read-only":
            return "readonly";
        case "read-write":
            return "";
        case "write-only":
        default:
            return "writeonly";
    }
}

function glslTypeIsSampler(type: string) {
    switch (type) {
        case "sampler2D":
        case "samplerCube":
        case "sampler2DArray":
        case "sampler3D":
        case "samplerCubeArray":
        case "sampler1D":
        case "sampler2DShadow":
        case "samplerCubeShadow":
        case "sampler2DArrayShadow":
        case "sampler3DShadow":
        case "samplerCubeArrayShadow":
        case "sampler1DShadow":
            return true;
        default:
            return false;
    }
}

function getArrayLength(name: string): number {
    let endPos = name.lastIndexOf(']');
    let startPos = name.lastIndexOf('[');

    if (startPos != -1 && endPos == name.length - 1) {
        let arrayLengthStr = name.slice(startPos + 1, endPos);
        let arrayLength = parseInt(arrayLengthStr);

        if (!isNaN(arrayLength) && arrayLength > 0) {
            return arrayLength;
        }
    }
    return 0;
}

function getComputeCode(glslVersion: string, defineStrs: string, uniformStr: string, computeCode: string) {
    return `${glslVersion}

layout(std140, column_major) uniform;
layout(std430, column_major) buffer;

${defineStrs}

${uniformStr}

${computeCode}
`
}

const mainFuncRegex = /\bvoid\s+main\s*\(\s*\)/;
function renameMainFunction(source: string, newName: string) {
    const newCode = source.replace(mainFuncRegex, `void ${newName}()`);
    return newCode;
}

function containsIdentifier(source: string, identifier: string): boolean {
    const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`).test(source);
}


const ssboRegexCompat =
    /((?:layout\s*\([^)]*\)\s*)*)\s*((?:(?:readonly|writeonly|coherent|volatile|restrict)\s+)*)buffer\s+([A-Za-z_]\w*)\s*\{([\s\S]*?)\}\s*([A-Za-z_]\w*)?\s*;/g;
function ssboStrings(ssboBindingMap: Map<string, { set: number, binding: number }>, code: string) {
    code = code.replace(ssboRegexCompat, (match, layoutStr, readonlyStr, blockName, body, instanceName) => {
        let bindingInfo = ssboBindingMap.get(blockName);
        if (bindingInfo) {
            let newLayoutStr = `layout(std430, set = ${bindingInfo.set}, binding = ${bindingInfo.binding}) `;
            // writeonly 转换为 readwrite
            if (readonlyStr.startsWith("writeonly")) {
                readonlyStr = " ";
            }
            return `${newLayoutStr}${readonlyStr}buffer ${blockName} {${body}} ${instanceName || ""};\n`
        }
        else {
            return "";
        }
    });

    return code;
}
