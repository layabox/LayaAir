import { GLSLCodeGenerator } from "../../../../RenderEngine/RenderShader/GLSLCodeGenerator";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { ShaderNode } from "../../../../webgl/utils/ShaderNode";
import { UniformProperty } from "../../../DriverDesign/RenderDevice/CommandUniformMap";
import { ComputeShaderProcessInfo, IComputeShader } from "../../../DriverDesign/RenderDevice/ComputeShader/IComputeShader";
import { ShaderDataType } from "../../../DriverDesign/RenderDevice/ShaderData";
import { GLESCommandUniformMap } from "../GLESCommandUniformMap";

const _defineStrings: Array<string> = [];

function _getTextureType(uniformType: ShaderDataType): "1d" | "2d" | "2d-array" | "cube" | "cube-array" | "3d" {
    switch (uniformType) {
        case ShaderDataType.Texture2D:
            return '2d';
        case ShaderDataType.Texture3D:
            return '3d';
        case ShaderDataType.TextureCube:
            return 'cube';
        case ShaderDataType.Texture2DArray:
            return '2d-array';
        default:
            return '2d';
    }
}
function getSamplerTextureType(dimension: "1d" | "2d" | "2d-array" | "cube" | "cube-array" | "3d"): string {
    if (dimension == "2d") {
        return "sampler2D";
    }
    else if (dimension == "cube") {
        return "samplerCube";
    }
    else if (dimension == "2d-array") {
        return "sampler2DArray";
    }
    else if (dimension == "3d") {
        return "sampler3D";
    }
    else if (dimension == "cube-array") {
        return "samplerCubeArray";
    }
    else if (dimension == "1d") {
        return "sampler1D";
    }
    else {
        return "sampler2D";
    }
}
export class GLESComputeShaderInstance implements IComputeShader {
    /** 原生着色器对象 */
    _nativeObj: any;

    /** 着色器名称 */
    name: string;

    /** 是否编译完成 */
    compilete: boolean = false;


    uniformMap: Map<number, UniformProperty> = new Map();
    constructor(name: string) {
        this.name = name;
        // 创建原生OpenGL ES计算着色器对象
        this._nativeObj = new (window as any).conchGLESComputeShaderInstance();
    }
    private glslUniformString(uniformsMap: Map<number, UniformProperty>, useUniformBlock: boolean, blockName: string, binding: number) {

        if (uniformsMap.size == 0) {
            return "";
        }

        if (useUniformBlock) {
            //todo
            return "";
        }
        else {
            let uniformsStr = "";
            uniformsMap.forEach((uniform, id) => {

                if (uniform.uniformtype == ShaderDataType.DeviceBuffer) {
                    //
                }
                else if (uniform.uniformtype == ShaderDataType.ReadOnlyDeviceBuffer) {
                    //
                }
                else if (uniform.uniformtype == ShaderDataType.StorageTexture2D) {
                    let access = uniform.access;
                    uniformsStr = `${uniformsStr}layout(${uniform.format ? uniform.format : "rgba8"}, binding=${binding++}) uniform ${access} image2D ${uniform.propertyName};\n`;

                }
                else if (uniform.uniformtype == ShaderDataType.Buffer) {
                    //todo
                }
                else if (uniform.uniformtype >= ShaderDataType.Texture2D) {
                    const viewDimension = _getTextureType(uniform.uniformtype);
                    const textureType = getSamplerTextureType(viewDimension);
                    uniformsStr = `${uniformsStr}layout(binding=${binding++}) uniform ${textureType} ${uniform.propertyName};\n`;
                }
                else {
                    let typeStr = GLSLCodeGenerator.getAttributeType(uniform.uniformtype);
                    if (typeStr != "") {
                        uniformsStr += `layout(binding=${binding++}) uniform ${typeStr} ${uniform.propertyName};\n`;
                    }
                }
            });
            return uniformsStr;
        }

    }
    proccessComputeShader(defineString: string[], uniformMaps: GLESCommandUniformMap[], CS: ShaderNode) {
        var computeHead: string;
        var defMap: any = {};
        var defineStr: string = "";
        let useUniformBlock = false;//todo Config.matUseUBO;
        let materialUniformGlsl = "";
        let binding = 0;
        for (const uniformMap of uniformMaps) {
            materialUniformGlsl += this.glslUniformString(uniformMap._idata, useUniformBlock, uniformMap._stateName, binding);
            materialUniformGlsl += "\n";
        }


        if (defineString.indexOf("GRAPHICS_API_GLES3") === -1) {
            defineString.push("GRAPHICS_API_GLES3");
        }
        computeHead =
            `#version 310 es
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
            layout(std430, column_major) buffer;
            ${materialUniformGlsl}
        `;

        for (var i: number = 0, n: number = defineString.length; i < n; i++) {
            var def: string = defineString[i];
            defineStr += "#define " + def + "\n";
            defMap[def] = true;
        }

        var vs: any[] = CS.toscript(defMap, []);
        var vsVersion: string = '';
        if (vs[0].indexOf('#version') == 0) {
            vsVersion = vs[0] + '\n';
            vs.shift();
        }

        let dstCS = vsVersion + computeHead + defineStr + vs.join('\n');
        return dstCS;
    }

    /**
     * 编译计算着色器
     * @param info 着色器编译信息
     */
    compile(info: ComputeShaderProcessInfo): void {
        let compileDefine = info.defineData;
        _defineStrings.length = 0;
        Shader3D._getNamesByDefineData(compileDefine, _defineStrings);

        const code = this.proccessComputeShader(_defineStrings, info.uniformMaps as GLESCommandUniformMap[], info.node);

        let uniformMaps = [];
        for (const uniformMap of info.uniformMaps as GLESCommandUniformMap[]) {
            uniformMaps.push(uniformMap._nativeObj);
        }
        const success = this._nativeObj.compile(code, uniformMaps);

        if (success) {
            this.compilete = true;
        } else {
            throw new Error(`Failed to compile compute shader: ${this.name}`);
        }
    }
    _disposeResource(): void {
		this._nativeObj.destroy();
	}
} 