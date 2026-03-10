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


const uniformRegex = /(?:layout\s*\([^)]*\)\s*)?\buniform\s+(?:(lowp|mediump|highp)\s+)?(?:(?:readonly|writeonly|coherent|volatile|restrict)\s+)*(\w+)\s+(\w+)(\s*\[\s*(\d+)\s*\])?\s*;/gm;

const uniformBlockRegex = /(?:layout\s*\([^)]*\)\s*)?uniform\s+(\w+)\s*\{([\s\S]*?)\}\s*;/g;

const glFragColorRegex = /gl_FragColor/g;

interface CollectUniform {
    samplerType?: string,
    arrayLength?: number,
    demision?: string,
    type: ShaderDataType
    set?: number
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
    static layax_process(defines: string[], attributeMap: AttributeMapType[], uniformMap: Map<number, LayaXBindingInfo[]>, shaderPassName: string, materialMap: Map<number, UniformProperty>, VS: ShaderNode, FS: ShaderNode, useTexArray: Set<string>, checkSetNumber: number, appendSet: number) {

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

        const attributeStrs = attributeString(attributeMap[0], attributeMap[1]);

        const varyings = executeVaryings(fragmentCode, vertexCode);

        const vertexVaryingStrs = varyingString(varyings, "out");
        const fragmentVaryingStrs = varyingString(varyings, "in");

        const fragmentOutStrs = fragmentOutString(fragmentCode);

        let collectionUniforms = new Map<string, CollectUniform>();

        const uniformCollect = (match: string, precision: string, type: string, name: string, arrayDecl: string, arrayLength: string) => {
            // todo
            let u: CollectUniform = {
                type: getShaderDataType(type),
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
                    let name = uniform.name.replace("_Texture", "");

                    textureNames.push(name);

                    let collect = collectionUniforms.get(name);
                    if (collect) {
                        collect.set = uniform.set;
                    }
                }

                if (uniform.type == LayaXBindingInfoType.sampler) {
                    let name = uniform.name.replace("_Sampler", "");
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
        let appendNewUniform = false;
        if (appendSet >= 0) {
            collectionUniforms.forEach((value, name) => {
                if (value.set == undefined) {
                    appendNewUniform = true;
                    let uniform: UniformProperty = {
                        id: Shader3D.propertyNameToID(name),
                        propertyName: name,
                        uniformtype: value.type,
                        arrayLength: value.arrayLength || 0
                    };

                    materialMap.set(uniform.id, uniform);
                }
            });
            // if (!uniformMap.has(appendSet)) {
            //     uniformMap.set(appendSet, LayaXBindGroupHelper.createBindingInfosByUniformMap(appendSet, "Material", shaderPassName, materialMap));

            //     executeUniforms(uniformMap.get(appendSet), appendSet);
            // }
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

        vertexCode = replaceTextureSampler(vertexCode, useTexArray);
        fragmentCode = replaceTextureSampler(fragmentCode, useTexArray);

        // const vertexProcess = new WebGPU_GLSLProcess();
        // vertexProcess.process(vertexCode, textureNames);
        // vertexCode = vertexProcess.glslCode;

        // const fragmentProcess = new WebGPU_GLSLProcess();
        // fragmentProcess.process(fragmentCode, textureNames);
        // fragmentCode = fragmentProcess.glslCode;

        // 将所有 gl_VertexID 替换为 gl_VertexIndex
        vertexCode = vertexCode.replace(/gl_VertexID/g, "gl_VertexIndex");
        fragmentCode = fragmentCode.replace(/gl_VertexID/g, "gl_VertexIndex");

        const uniformStrs = uniformString2(uniformMap, materialMap, useTexArray, collectionUniforms, checkSetNumber, appendSet);

        const glslVersion = "#version 450\n";

        let vertex = `${glslVersion}
${precision}

${defineStrs}

${attributeStrs}

${uniformStrs}

${vertexVaryingStrs}

${vertexCode}
`;

        let fragment = `${glslVersion}
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
            appendNewUniform
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
            uniformMaps.forEach((value, set) => {
                let binding = 0;
                for (let uniform of value) {
                    switch (uniform.type) {
                        case LayaXBindingInfoType.storageBuffer: {
                            let setIndex = set;
                            let bindingIndex = binding++;
                            ssboBindingMap.set(uniform.name, { set: setIndex, binding: bindingIndex });
                            break;
                        }
                        case LayaXBindingInfoType.storageTexture:
                            {
                                let access = wgslAccessToGlsl(uniform.storageTexture.access);
                                res = `${res}layout(${uniform.format ? uniform.format : "rgba8"}, set=${set}, binding=${binding++}) uniform ${access} image2D ${uniform.name};\n`;
                                break;
                            }
                        case LayaXBindingInfoType.buffer: {
                            let commandMap = (LayaGL.renderDeviceFactory.createGlobalUniformMap(uniform.name) as LayaXCommandUniformMap)
                            if (commandMap._hasUniformBuffer) {
                                let uniformMap = commandMap._idata;
                                res = `${res}${uniformMapString(uniformMap, uniform.name, uniform.set, binding++, true, new Map()).code}\n`;
                            }
                            break;
                        }
                        case LayaXBindingInfoType.texture: {
                            const textureName = uniform.name.slice(0, -"_Texture".length);

                            if (!usedTex || usedTex.has(textureName)) {
                                const textureType = getSamplerTextureType(uniform.texture.sampleType, uniform.texture.viewDimension);
                                res = `${res}layout(set=${set}, binding=${binding}) uniform ${textureType} ${textureName};\n`;
                            }
                            binding += 2;
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

function uniformMapString(uniformMap: Map<number, UniformProperty>, name: string, set: number, bindOffset: number, skipTexture: boolean, collectUniforms: Map<string, CollectUniform>) {
    let textureUniforms: UniformProperty[] = [];
    let blockUniforms: UniformProperty[] = [];

    uniformMap.forEach(uniform => {
        if (isSamplerType(uniform.uniformtype)) {
            textureUniforms.push(uniform);
        }
        else {
            blockUniforms.push(uniform);
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

    uniformSetMap.forEach((value, key) => {
        let binding = 0;
        if (value.length > 0) {
            for (let uniform of value) {
                switch (uniform.type) {
                    case LayaXBindingInfoType.storageBuffer:
                        binding++;
                        //TODO
                        break;
                    case LayaXBindingInfoType.storageTexture:
                        binding++;
                        //TODO
                        break;
                    case LayaXBindingInfoType.buffer:
                        {
                            let uniformMap = (LayaGL.renderDeviceFactory.createGlobalUniformMap(uniform.name) as LayaXCommandUniformMap)._idata;
                            if (key == appendSet) {
                                uniformMap = materialMap;
                            }

                            res = `${res}${uniformMapString(uniformMap, uniform.name, uniform.set, binding++, true, collectUniforms).code}\n`;
                            break;
                        }
                    case LayaXBindingInfoType.texture:
                        if (key < checkSetNumber || usedTexSet.has(uniform.name)) {

                            let textureName = uniform.name.replace("_Texture", "");
                            let collectUniform = collectUniforms.get(textureName);
                            if (collectUniform) {
                                uniform.texture.sampleType = uniform.texture.sampleType;
                                uniform.texture.viewDimension = collectUniform.demision || uniform.texture.viewDimension;
                            }

                            let textureType = getDimensionTextureType(uniform.texture?.viewDimension);

                            res = `${res}layout(set=${uniform.set}, binding=${binding}) uniform ${textureType} ${uniform.name};\n`

                            let samplerName = uniform.name.replace("_Texture", "");

                            samplerMap.set(samplerName, uniform);

                        }
                        // binding 始终递增，与 createBindingInfoArray 保持一致
                        binding++;
                        break;
                    case LayaXBindingInfoType.sampler:
                        if (key < checkSetNumber || usedTexSet.has(uniform.name)) {
                            let sampler = "sampler";
                            let samplerName = uniform.name.replace("_Sampler", "");

                            let collectUniform = collectUniforms.get(samplerName);
                            if (collectUniform) {
                                if (collectUniform.samplerType == "depth") {
                                    uniform.sampler.type = "comparison";
                                }
                            }

                            res = `${res}layout(set=${uniform.set}, binding=${binding}) uniform ${sampler} ${uniform.name};\n`;
                        }
                        // binding 始终递增，与 createBindingInfoArray 保持一致
                        binding++;
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

    return varyings;

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
            return ShaderDataType.Texture2D;
        case "samplerCube":
            return ShaderDataType.TextureCube;
        case "sampler2DArray":
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