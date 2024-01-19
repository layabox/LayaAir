
import { Config3D } from "../../../Config3D";
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderNode } from "../../webgl/utils/ShaderNode";
import { RenderParams } from "../RenderEnum/RenderParams";
import { ShaderDataType } from "../RenderInterface/ShaderData";
import { UniformMapType } from "./SubShader";

/**
 * @internal
 */
export class GLSLCodeGenerator {

    static glslAttributeString(attributeMap: { [name: string]: [number, ShaderDataType] }) {

        let res = "";
        for (const key in attributeMap) {
            let type = getAttributeType(attributeMap[key][1]);
            res = `${res}attribute ${type} ${key};\n`;
        }

        return res;
    }

    static glslUniformString(uniformsMap: UniformMapType, useUniformBlock: boolean) {

        if (useUniformBlock) {
            let blocksStr = "";
            let uniformsStr = "";
            for (const key in uniformsMap) {
                // uniform block
                if (typeof uniformsMap[key] == "object") {
                    let blockUniforms = <{ [uniformName: string]: ShaderDataType }>uniformsMap[key];
                    blocksStr += `uniform ${key} {\n`;
                    for (const uniformName in blockUniforms) {
                        let dataType = blockUniforms[uniformName];
                        blocksStr += `${getAttributeType(dataType)} ${uniformName};\n`;
                    }
                    blocksStr += "};\n";
                }
                else { // uniform
                    let dataType = <ShaderDataType>uniformsMap[key];
                    uniformsStr += `uniform ${getAttributeType(dataType)} ${key};\n`;
                }
            }
            return blocksStr + uniformsStr;

        }
        else {
            let uniformsStr = "";
            for (const key in uniformsMap) {
                // uniform block
                if (typeof uniformsMap[key] == "object") {
                    let blockUniforms = <{ [uniformName: string]: ShaderDataType }>uniformsMap[key];
                    for (const uniformName in blockUniforms) {
                        let dataType = blockUniforms[uniformName];
                        uniformsStr += `uniform ${getAttributeType(dataType)} ${uniformName};\n`;
                    }
                }
                else { // uniform
                    let dataType = <ShaderDataType>uniformsMap[key];
                    uniformsStr += `uniform ${getAttributeType(dataType)} ${key};\n`;
                }
            }
            return uniformsStr;
        }

    }

    static GLShaderLanguageProcess3D(defineString: string[],
        attributeMap: { [name: string]: [number, ShaderDataType] },
        uniformMap: UniformMapType, VS: ShaderNode, FS: ShaderNode) {

        var clusterSlices = Config3D.lightClusterCount;
        var defMap: any = {};

        var vertexHead: string;
        var fragmentHead: string;
        var defineStr: string = "";

        // 拼接 shader attribute
        let useUniformBlock = Config3D._uniformBlock;
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
        default:
            return "";
    }
}