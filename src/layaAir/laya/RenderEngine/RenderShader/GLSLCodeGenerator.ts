
import { Config3D } from "../../../Config3D";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderNode } from "../../webgl/utils/ShaderNode";
import { RenderParams } from "../RenderEnum/RenderParams";
import { RenderCapable } from "../RenderEnum/RenderCapable";
import { UniformProperty } from "../../RenderDriver/DriverDesign/RenderDevice/CommandUniformMap";

/**
 * @internal
 */
export class GLSLCodeGenerator {

    static glslAttributeString(attributeMap: { [name: string]: [number, ShaderDataType] }) {

        let res = "";
        for (const key in attributeMap) {
            let type = getAttributeType(attributeMap[key][1]);
            if (type != "") {
                res = `${res}attribute ${type} ${key};\n`;
            }
        }

        return res;
    }

    static glslUniformString(uniformsMap: Map<number, UniformProperty>, useUniformBlock: boolean) {

        if (uniformsMap.size == 0) {
            return "";
        }

        if (useUniformBlock) {
            let uniformsStr = "";
            let blockStr = "uniform Material {\n";

            uniformsMap.forEach((uniform, key) => {
                let dataType = uniform.uniformtype;
                let uniformName = uniform.propertyName;
                if (uniform.arrayLength > 0) {
                    uniformName = `${uniformName}[${uniform.arrayLength}]`;
                }
                let typeStr = getAttributeType(dataType);
                if (typeStr != "") {
                    if (supportUniformBlock(dataType)) {
                        blockStr += `${typeStr} ${uniformName};\n`;
                    }
                    else {
                        uniformsStr += `uniform ${typeStr} ${uniformName};\n`;
                    }
                }
            });
            blockStr += "};\n";

            return blockStr + uniformsStr;
        }
        else {
            let uniformsStr = "";
            uniformsMap.forEach((uniform, id) => {
                let dataType = uniform.uniformtype;
                let uniformName = uniform.propertyName;
                if (uniform.arrayLength > 0) {
                    uniformName = `${uniformName}[${uniform.arrayLength}]`;
                }
                let typeStr = getAttributeType(dataType);
                if (typeStr != "") {
                    uniformsStr += `uniform ${typeStr} ${uniformName};\n`;
                }
            });
            return uniformsStr;
        }

    }

    static GLShaderLanguageProcess3D(defineString: string[],
        attributeMap: { [name: string]: [number, ShaderDataType] },
        uniformMap: Map<number, UniformProperty>, VS: ShaderNode, FS: ShaderNode) {

        var clusterSlices = Config3D.lightClusterCount;
        var defMap: any = {};

        var vertexHead: string;
        var fragmentHead: string;
        var defineStr: string = "";

        // 拼接 shader attribute
        let useUniformBlock = Config3D._matUseUBO;
        let attributeglsl = GLSLCodeGenerator.glslAttributeString(attributeMap);
        let uniformglsl = GLSLCodeGenerator.glslUniformString(uniformMap, useUniformBlock);

        if (LayaGL.renderEngine.getParams(RenderParams.SHADER_CAPAILITY_LEVEL) > 30) {
            defineString.push("GRAPHICS_API_GLES3");
            vertexHead =
                `#version 300 es
#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
    precision highp sampler2DArray;
    precision highp sampler3D;
#else
    precision mediump float;
    precision mediump int;
    precision mediump sampler2DArray;
    precision mediump sampler3D;
#endif
layout(std140, column_major) uniform;
#define attribute in
#define varying out
#define textureCube texture
#define texture2D texture
${attributeglsl}
${uniformglsl}
`;

            fragmentHead =
                `#version 300 es
#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
    precision highp sampler2DArray;
	precision highp sampler3D;
#else
    precision mediump float;
    precision mediump int;
    precision mediump sampler2DArray;
	precision mediump sampler3D;
#endif
layout(std140, column_major) uniform;
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
${uniformglsl}`;
        }
        else {
            vertexHead =
                `#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
#endif
${attributeglsl}
${uniformglsl}`;
            fragmentHead =
                `#ifdef GL_EXT_shader_texture_lod
    #extension GL_EXT_shader_texture_lod : enable
#endif

#ifdef GL_OES_standard_derivatives
	#extension GL_OES_standard_derivatives : enable 
#endif

#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
#endif

#if !defined(GL_EXT_shader_texture_lod)
    #define texture1DLodEXT texture1D
    #define texture2DLodEXT texture2D
    #define texture2DProjLodEXT texture2DProj
    #define texture3DLodEXT texture3D
    #define textureCubeLodEXT textureCube
#endif
${uniformglsl}`;
        }

        // todo 
        defineStr += "#define MAX_LIGHT_COUNT " + Config3D.maxLightCount + "\n";
        defineStr += "#define MAX_LIGHT_COUNT_PER_CLUSTER " + Config3D._maxAreaLightCountPerClusterAverage + "\n";
        defineStr += "#define CLUSTER_X_COUNT " + clusterSlices.x + "\n";
        defineStr += "#define CLUSTER_Y_COUNT " + clusterSlices.y + "\n";
        defineStr += "#define CLUSTER_Z_COUNT " + clusterSlices.z + "\n";
        defineStr += "#define MORPH_MAX_COUNT " + Config3D.maxMorphTargetCount + "\n";
        defineStr += "#define SHADER_CAPAILITY_LEVEL " + LayaGL.renderEngine.getParams(RenderParams.SHADER_CAPAILITY_LEVEL) + "\n";



        for (var i: number = 0, n: number = defineString.length; i < n; i++) {
            var def: string = defineString[i];
            defineStr += "#define " + def + "\n";
            defMap[def] = true;
        }

        var vs: any[] = VS.toscript(defMap, []);
        var vsVersion: string = '';
        if (vs[0].indexOf('#version') == 0) {
            vsVersion = vs[0] + '\n';
            vs.shift();
        }

        var ps: any[] = FS.toscript(defMap, []);
        var psVersion: string = '';
        if (ps[0].indexOf('#version') == 0) {
            psVersion = ps[0] + '\n';
            ps.shift();
        };
        let dstVS = vsVersion + vertexHead + defineStr + vs.join('\n');
        let detFS = psVersion + fragmentHead + defineStr + ps.join('\n');
        return { vs: dstVS, fs: detFS };
    }
}

function getAttributeType(type: ShaderDataType) {
    switch (type) {
        case ShaderDataType.Int:
            return "int";
        case ShaderDataType.Bool:
            return "bool";
        case ShaderDataType.Float:
            return "float";
        case ShaderDataType.Vector2:
            return "vec2";
        case ShaderDataType.Vector3:
            return "vec3";
        case ShaderDataType.Vector4:
        case ShaderDataType.Color:
            return "vec4";
        case ShaderDataType.Matrix4x4:
            return "mat4";
        case ShaderDataType.Matrix3x3:
            return "mat3";
        case ShaderDataType.Texture2D:
            return "sampler2D";
        case ShaderDataType.TextureCube:
            return "samplerCube";
        case ShaderDataType.Texture2DArray:
            if (LayaGL.renderEngine.getCapable(RenderCapable.Texture3D)) {
                return "sampler2DArray";
            }
            else {
                return "";
            }
        case ShaderDataType.Texture3D:
            if (LayaGL.renderEngine.getCapable(RenderCapable.Texture3D)) {
                return "sampler3D";
            }
            else {
                return "";
            }
        default:
            return "";
    }
}

function supportUniformBlock(type: ShaderDataType) {
    switch (type) {
        case ShaderDataType.Int:
        case ShaderDataType.Bool:
        case ShaderDataType.Float:
        case ShaderDataType.Vector2:
        case ShaderDataType.Vector3:
        case ShaderDataType.Vector4:
        case ShaderDataType.Color:
        case ShaderDataType.Matrix4x4:
        case ShaderDataType.Matrix3x3:
            return true;
        default:
            return false;
    }
}