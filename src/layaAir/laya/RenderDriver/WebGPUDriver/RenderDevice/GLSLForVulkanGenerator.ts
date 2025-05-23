import { Config3D } from "../../../../Config3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderNode } from "../../../webgl/utils/ShaderNode";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { getTypeString, isSamplerType } from "./GLSLGeneratorHelper";
import { WebGPU_GLSLProcess } from "./GLSLProcess/WebGPU_GLSLProcess";
import { WebGPUBindGroupHelper, WebGPUBindingInfoType, WebGPUUniformPropertyBindingInfo } from "./WebGPUBindGroupHelper";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { WebGPURenderEngine } from "./WebGPURenderEngine";


const uniformRegex = /\buniform\s+(?:(lowp|mediump|highp)\s+)?(\w+)\s+(\w+)(\s*\[\s*(\d+)\s*\])?\s*;/gm;
const uniformBlockRegex = /(?:layout\s*\([^)]*\)\s*)?uniform\s+(\w+)\s*\{([\s\S]*?)\}\s*;/g;

const glFragColorRegex = /gl_FragColor/g;

interface CollectUniform {
    samplerType?: GPUTextureSampleType,
    arrayLength?: number,
    demision?: GPUTextureViewDimension,
    type: ShaderDataType
    set?: number
}

/**
 * attribute列表
 */
type WebGPUAttributeMapType = {
    [key: string]: [ //主键，attribute名称
        number, //attribute位置绑定
        ShaderDataType, //attribute类型
    ]
};

/**
 * @internal
 * generate glsl for vulkan
 */
export class GLSLForVulkanGenerator {

    static process(defines: string[], attributeMap: WebGPUAttributeMapType, uniformMap: Map<number, WebGPUUniformPropertyBindingInfo[]>, shaderPassName: string, materialMap: Map<number, UniformProperty>, VS: ShaderNode, FS: ShaderNode, useTexArray: Set<string>, checkSetNumber: number, appendSet: number) {

        const engine = WebGPURenderEngine._instance;

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

        const attributeStrs = attributeString(attributeMap);

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

        const executeUniforms = (value: WebGPUUniformPropertyBindingInfo[], key: number) => {

            value.forEach(uniform => {
                if (uniform.type == WebGPUBindingInfoType.texture) {
                    let name = uniform.name.replace("_Texture", "");

                    textureNames.push(name);

                    let collect = collectionUniforms.get(name);
                    if (collect) {
                        collect.set = uniform.set;
                    }
                }

                if (uniform.type == WebGPUBindingInfoType.sampler) {
                    let name = uniform.name.replace("_Sampler", "");
                    let collect = collectionUniforms.get(name);

                    if (collect) {
                        collect.set = uniform.set;
                    }
                    else if (key < checkSetNumber) {
                        let samplerType: GPUTextureSampleType = uniform.texture.sampleType;
                        if (uniform.sampler?.type == "comparison") {
                            samplerType = "depth";
                        }
                        // 这里的 type 无意义
                        collectionUniforms.set(name, { type: ShaderDataType.Texture2D, set: uniform.set });
                    }
                }

                if (uniform.type == WebGPUBindingInfoType.storageBuffer) {
                    let collect = collectionUniforms.get(uniform.name);
                    if (collect) {
                        collect.set = uniform.set;
                    }
                }

                if (uniform.type == WebGPUBindingInfoType.buffer) {
                    let name = uniform.name;

                    let commandMap = LayaGL.renderDeviceFactory.createGlobalUniformMap(name) as WebGPUCommandUniformMap;

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

        // 添加 新检出的 uniform 
        let appendNewUniform = false;
        {
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
            if (!uniformMap.has(appendSet)) {
                uniformMap.set(appendSet, WebGPUBindGroupHelper.createBindGroupInfosByUniformMap(appendSet, "Material", shaderPassName, materialMap));

                executeUniforms(uniformMap.get(appendSet), appendSet);
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

function attributeString(attributeMap: WebGPUAttributeMapType) {
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

function uniformString2(uniformSetMap: Map<number, WebGPUUniformPropertyBindingInfo[]>, materialMap: Map<number, UniformProperty>, usedTexSet: Set<string>, collectUniforms: Map<string, CollectUniform>, checkSetNumber: number, appendSet: number) {
    let res = "";

    let samplerMap = new Map<string, WebGPUUniformPropertyBindingInfo>();

    uniformSetMap.forEach((value, key) => {
        let binding = 0;
        if (value.length > 0) {
            for (let uniform of value) {
                switch (uniform.type) {
                    case WebGPUBindingInfoType.buffer:
                        {
                            let uniformMap = (LayaGL.renderDeviceFactory.createGlobalUniformMap(uniform.name) as WebGPUCommandUniformMap)._idata;
                            if (key == appendSet) {
                                uniformMap = materialMap;
                            }

                            res = `${res}${uniformMapString(uniformMap, uniform.name, uniform.set, binding++, true, collectUniforms).code}\n`;
                            break;
                        }
                    case WebGPUBindingInfoType.texture:
                        if (key < checkSetNumber || usedTexSet.has(uniform.name)) {

                            let textureName = uniform.name.replace("_Texture", "");
                            let collectUniform = collectUniforms.get(textureName);
                            if (collectUniform) {
                                uniform.texture.sampleType = uniform.texture.sampleType;
                                uniform.texture.viewDimension = collectUniform.demision || uniform.texture.viewDimension;
                            }

                            let textureType = getDimensionTextureType(uniform.texture?.viewDimension);

                            res = `${res}layout(set=${uniform.set}, binding=${binding++}) uniform ${textureType} ${uniform.name};\n`

                            let samplerName = uniform.name.replace("_Texture", "");

                            samplerMap.set(samplerName, uniform);

                        }
                        break;
                    case WebGPUBindingInfoType.sampler:
                        if (key < checkSetNumber || usedTexSet.has(uniform.name)) {
                            let sampler = "sampler";
                            let samplerName = uniform.name.replace("_Sampler", "");

                            let collectUniform = collectUniforms.get(samplerName);
                            if (collectUniform) {
                                if (collectUniform.samplerType == "depth") {
                                    uniform.sampler.type = "comparison";
                                }
                            }

                            res = `${res}layout(set=${uniform.set}, binding=${binding++}) uniform ${sampler} ${uniform.name};\n`;
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
    return new RegExp(`${ioType}\\s+(lowp|mediump|highp)?\\s*(\\w+)\\s+(\\w+)\\s*;`, 'g');
}

const vertexVaryingRegex = getVaryingRegex("out");
const fragmentVaryingRegex = getVaryingRegex("in");

function findVaryings(source: string, regex: RegExp): string[] {
    let varyings: string[] = [];
    let result;

    while ((result = regex.exec(source)) !== null) {
        // 判断是否有精度限定符
        const precision = result[1] ? `${result[1]} ` : '';
        const type = result[2].trim();
        const name = result[3].trim();

        varyings.push(`${precision}${type} ${name};`);
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
function getSamplerTextureType(type: GPUTextureSampleType = "float", dimension: GPUTextureViewDimension = "2d") {
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

function getDimensionTextureType(type: GPUTextureViewDimension) {
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
        default:
            return ShaderDataType.None;
    }

}