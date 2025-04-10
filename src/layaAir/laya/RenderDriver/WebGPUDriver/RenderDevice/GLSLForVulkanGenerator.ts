import { Config3D } from "../../../../Config3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { ShaderNode } from "../../../webgl/utils/ShaderNode";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { getTypeString, isSamplerType } from "./GLSLGeneratorHelper";
import { WebGPUBindingInfoType, WebGPUUniformPropertyBindingInfo } from "./WebGPUCodeGenerator";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";


const uniformRegex = /\buniform\s+(?:(lowp|mediump|highp)\s+)?(\w+)\s+(\w+)(\s*\[\s*(\d+)\s*\])?\s*;/gm;
const uniformBlockRegex = /(?:layout\s*\([^)]*\)\s*)?uniform\s+(\w+)\s*\{([\s\S]*?)\}\s*;/g;

const glFragColorRegex = /gl_FragColor/g;

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

    static process(defines: string[], attributeMap: WebGPUAttributeMapType, uniformMap: Map<number, WebGPUUniformPropertyBindingInfo[]>, materialMap: Map<number, UniformProperty>, VS: ShaderNode, FS: ShaderNode, useTexArray: Set<string>, checkSetNumber: number) {

        let defMap: { [key: string]: boolean } = {};
        for (const define of defines) {
            defMap[define] = true;
        }

        // todo 
        defMap["GRAPHICS_API_GLES3"] = true;

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

        const attributeStrs = attributeString(attributeMap);

        // const uniformStrs = uniformString(commanMap, uniformMap);


        const varyings = executeVaryings(fragmentCode, vertexCode);

        const vertexVaryingStrs = varyingString(varyings, "out");
        const fragmentVaryingStrs = varyingString(varyings, "in");

        const fragmentOutStrs = fragmentOutString(fragmentCode);

        // remove original uniforms
        vertexCode = vertexCode.replace(uniformRegex, '\n');
        fragmentCode = fragmentCode.replace(uniformRegex, '\n');
        // remove original uniform blocks
        vertexCode = vertexCode.replace(uniformBlockRegex, '\n');
        fragmentCode = fragmentCode.replace(uniformBlockRegex, '\n');
        // remove original varyings
        vertexCode = vertexCode.replace(varyingRegex, '\n');
        fragmentCode = fragmentCode.replace(varyingRegex, '\n');
        // replace texture samplers function




        vertexCode = replaceTextureSampler(vertexCode, useTexArray);
        fragmentCode = replaceTextureSampler(fragmentCode, useTexArray);

        const uniformStrs = uniformString2(uniformMap, materialMap, useTexArray, checkSetNumber);



        // replace fragment out put
        // todo mrt
        fragmentCode = fragmentCode.replace(glFragColorRegex, 'pc_fragColor');

        const glslVersion = "#version 450\n";

        const precision = `precision highp float;
precision highp int;`;

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
            fragment
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

function uniformMapString(uniformMap: Map<number, UniformProperty>, name: string, set: number, bindOffset: number, skipTexture: boolean) {
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
                uniformName = `${uniformName}[${uniform.arrayLength}]`;
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

function uniformBlockString(name: string, set: number, bindOffset: number) {
    let uniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap(name) as WebGPUCommandUniformMap;
    return uniformMapString(uniformMap._idata, name, set, bindOffset, false);
}

function uniformString(commonMap: string[], materialUniforms: Map<number, UniformProperty>) {

    let sceneSet = uniformBlockString("Scene3D", 0, 0);

    let cameraSet = uniformBlockString("BaseCamera", 1, 0);

    // let spriteSet = uniformBlockString("Sprite3D", 2, 0);

    // addition map
    let commonMapSet = { code: "", binding: 0 };
    for (let common of commonMap) {
        let set = uniformBlockString(common, 2, commonMapSet.binding);
        commonMapSet.code += set.code;
        commonMapSet.binding = set.binding;
    }

    let materialSet = uniformMapString(materialUniforms, "Material", 3, 0, false);

    return `${sceneSet.code}${cameraSet.code}${commonMapSet.code}${materialSet.code}`;
}

function uniformString2(uniformSetMap: Map<number, WebGPUUniformPropertyBindingInfo[]>, materialMap: Map<number, UniformProperty>, usedTexSet: Set<string>, checkSetNumber: number) {
    let res = "";
    uniformSetMap.forEach((value, key) => {
        if (value.length > 0) {
            for (let uniform of value) {
                switch (uniform.type) {
                    case WebGPUBindingInfoType.buffer:
                        {
                            let uniformMap = (LayaGL.renderDeviceFactory.createGlobalUniformMap(uniform.name) as WebGPUCommandUniformMap)._idata;
                            if (key == 3) {
                                uniformMap = materialMap;
                            }

                            res = `${res}${uniformMapString(uniformMap, uniform.name, uniform.set, uniform.binding, true).code}\n`;
                            break;
                        }
                    case WebGPUBindingInfoType.texture:
                        if (key < checkSetNumber || usedTexSet.has(uniform.name)) {

                            let textureType = getDimensionTextureType(uniform.texture?.viewDimension);

                            res = `${res}layout(set=${uniform.set}, binding=${uniform.binding}) uniform ${textureType} ${uniform.name};\n`
                        }
                        break;
                    case WebGPUBindingInfoType.sampler:
                        if (key < checkSetNumber || usedTexSet.has(uniform.name)) {
                            let sampler = "sampler";

                            // todo
                            if (uniform.name == "u_ShadowMap_Sampler") {
                                sampler = "samplerShadow";
                            }

                            res = `${res}layout(set=${uniform.set}, binding=${uniform.binding}) uniform sampler ${uniform.name};\n`
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    });
    return res;
}


const varyingRegex = /varying\s+(\w+)\s+(\w+)\s*;/g;
function findVaryings(source: string) {
    let varyings: string[] = [];
    let result;
    while ((result = varyingRegex.exec(source)) !== null) {
        let type = result[1].trim();
        let name = result[2].trim();

        varyings.push(`${type} ${name};`);
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

    let vertexVaryings = findVaryings(vsSource);
    let fragmentVaryings = findVaryings(fsSource);

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

    const texture2DRegex = /texture2D\s*\(\s*([\w_]+)\s*,\s*([^)]*)\s*\)/g;
    let newSource = source.replace(texture2DRegex, (match, textureName, uvName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return `texture(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName})`;
    });

    const textureCubeRegex = /textureCube\s*\(\s*([\w_]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(textureCubeRegex, (match, textureName, uvName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return `texture(samplerCube(${textureName}_Texture, ${textureName}_Sampler), ${uvName})`;
    });

    const texture2DProjRegex = /texture2DProj\s*\(\s*([\w_]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(texture2DProjRegex, (match, textureName, uvName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return `textureProj(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName})`;
    });

    const texture2DLodEXTRegex = /texture2DLodEXT\s*\(\s*([\w_]+)\s*,\s*([^,]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(texture2DLodEXTRegex, (match, textureName, uvName, lodName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return `textureLod(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName}, ${lodName})`;
    });

    const texture2DProjLodEXTRegex = /texture2DProjLodEXT\s*\(\s*([\w_]+)\s*,\s*([^,]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(texture2DProjLodEXTRegex, (match, textureName, uvName, lodName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return `textureProjLod(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName}, ${lodName})`;
    });

    const textureCubeLodEXTRegex = /textureCubeLodEXT\s*\(\s*([\w_]+)\s*,\s*([^,]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(textureCubeLodEXTRegex, (match, textureName, uvName, lodName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return `textureLod(samplerCube(${textureName}_Texture, ${textureName}_Sampler), ${uvName}, ${lodName})`;
    });


    const texture2DGradEXTRegex = /texture2DGradEXT\s*\(\s*([\w_]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(texture2DGradEXTRegex, (match, textureName, uvName, ddxName, ddyName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return `textureGrad(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName}, ${ddxName}, ${ddyName})`;
    });

    const texture2DProjGradEXTRegex = /texture2DProjGradEXT\s*\(\s*([\w_]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(texture2DProjGradEXTRegex, (match, textureName, uvName, ddxName, ddyName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return `textureProjGrad(sampler2D(${textureName}_Texture, ${textureName}_Sampler), ${uvName}, ${ddxName}, ${ddyName})`;
    });

    const textureCubeGradEXTRegex = /textureCubeGradEXT\s*\(\s*([\w_]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]*)\s*\)/g;
    newSource = newSource.replace(textureCubeGradEXTRegex, (match, textureName, uvName, ddxName, ddyName) => {
        usedTexSet.add(`${textureName}_Texture`);
        usedTexSet.add(`${textureName}_Sampler`);
        return `textureGrad(samplerCube(${textureName}_Texture, ${textureName}_Sampler), ${uvName}, ${ddxName}, ${ddyName})`;
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
function getSamplerTextureType(type: GPUTextureSampleType) {
    switch (type) {
        case "depth":
            return "samplerShadow";
        case "float":
        case "unfilterable-float":
        case "sint":
        case "uint":
        default:
            return "sampler";
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
