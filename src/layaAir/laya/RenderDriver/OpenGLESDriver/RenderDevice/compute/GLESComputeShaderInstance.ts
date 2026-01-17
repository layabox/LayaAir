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

// SSBO 正则表达式，匹配 buffer 声明
const ssboRegexCompat =
    /((?:layout\s*\([^)]*\)\s*)*)\s*((?:(?:readonly|writeonly|coherent|volatile|restrict)\s+)*)buffer\s+([A-Za-z_]\w*)\s*\{([\s\S]*?)\}\s*([A-Za-z_]\w*)?\s*;/g;

/**
 * 替换代码中的 SSBO 声明，添加 binding 信息
 * @param ssboBindingMap SSBO 名称到 binding 的映射
 * @param code 着色器代码
 * @returns 替换后的代码
 */
function ssboStrings(ssboBindingMap: Map<string, number>, code: string): string {
    code = code.replace(ssboRegexCompat, (match, layoutStr, readonlyStr, blockName, body, instanceName) => {
        // 优先使用 instanceName，如果不存在则使用 blockName
        let binding = instanceName ? ssboBindingMap.get(instanceName) : undefined;
        if (binding === undefined) {
            binding = ssboBindingMap.get(blockName);
        }
        if (binding !== undefined) {
            let newLayoutStr = `layout(std430, binding=${binding}) `;
            // writeonly 转换为 readwrite
            if (readonlyStr && readonlyStr.trim().startsWith("writeonly")) {
                readonlyStr = " ";
            }
            return `${newLayoutStr}${readonlyStr}buffer ${blockName} {${body}} ${instanceName || ""};\n`;
        }
        else {
            // 如果不在 bindingMap 中，移除该声明
            return "";
        }
    });

    return code;
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
    private glslUniformString(uniformsMap: Map<number, UniformProperty>, useUniformBlock: boolean, blockName: string, binding: number, ssboBindingMap?: Map<string, number>): { code: string, binding: number } {

        if (uniformsMap.size == 0) {
            return { code: "", binding: binding };
        }

        if (useUniformBlock) {
            //todo
            return { code: "", binding: binding };
        }
        else {
            let uniformsStr = "";
            let currentBinding = binding;
            uniformsMap.forEach((uniform, id) => {

                if (uniform.uniformtype == ShaderDataType.DeviceBuffer) {
                    // 设置 SSBO binding 映射
                    if (ssboBindingMap) {
                        ssboBindingMap.set(uniform.propertyName, currentBinding++);
                    }
                }
                else if (uniform.uniformtype == ShaderDataType.ReadOnlyDeviceBuffer) {
                    // 设置 SSBO binding 映射
                    if (ssboBindingMap) {
                        ssboBindingMap.set(uniform.propertyName, currentBinding++);
                    }
                }
                else if (uniform.uniformtype == ShaderDataType.StorageTexture2D) {
                    let access = uniform.access;
                    uniformsStr = `${uniformsStr}layout(${uniform.format ? uniform.format : "rgba8"}, binding=${currentBinding++}) uniform ${access} image2D ${uniform.propertyName};\n`;

                }
                else if (uniform.uniformtype == ShaderDataType.Buffer) {
                    //todo
                }
                else if (uniform.uniformtype >= ShaderDataType.Texture2D) {
                    const viewDimension = _getTextureType(uniform.uniformtype);
                    const textureType = getSamplerTextureType(viewDimension);
                    uniformsStr = `${uniformsStr}layout(binding=${currentBinding++}) uniform ${textureType} ${uniform.propertyName};\n`;
                }
                else {
                    let typeStr = GLSLCodeGenerator.getAttributeType(uniform.uniformtype);
                    if (typeStr != "") {
                        uniformsStr += `layout(binding=${currentBinding++}) uniform ${typeStr} ${uniform.propertyName};\n`;
                    }
                }
            });
            return { code: uniformsStr, binding: currentBinding };
        }

    }
    proccessComputeShader(defineString: string[], uniformMaps: GLESCommandUniformMap[], CS: ShaderNode) {
        var computeHead: string;
        var defMap: any = {};
        var defineStr: string = "";
        let useUniformBlock = false;//todo Config.matUseUBO;
        let materialUniformGlsl = "";
        let binding = 0;
        const ssboBindingMap = new Map<string, number>();
        for (const uniformMap of uniformMaps) {
            let result = this.glslUniformString(uniformMap._idata, useUniformBlock, uniformMap._stateName, binding, ssboBindingMap);
            materialUniformGlsl += result.code;
            binding = result.binding;
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
                precision highp image2D;
            #else
                precision mediump float;
                precision mediump int;
                precision mediump sampler2DArray;
                precision mediump sampler3D;
                precision mediump image2D;
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

        let computeCode = vs.join('\n');
        let dstCS = vsVersion + computeHead + defineStr + computeCode;
        debugger
        // 预处理
        let preprocessRes = this._nativeObj.preprocess(dstCS, 'compute');
        if (!preprocessRes.success) {
            console.error(`GLESComputeShaderInstance ${this.name} preprocess error:`, preprocessRes.info_log);
            return {};
        }

        // 处理 SSBO
        if (preprocessRes.ssbos && preprocessRes.ssbos.length > 0) {
            // 检查是否有新增的 SSBO
            const exists = new Map<number, UniformProperty>();
            for (const uniformMap of uniformMaps) {
                uniformMap._idata.forEach((uniform, id) => {
                    exists.set(id, uniform);
                });
            }

            // 保证至少存在一个map
            if (uniformMaps.length === 0) {
                console.error(`GLESComputeShaderInstance ${this.name} uniformMaps is empty`);
                return {};
            }
            let additionMaps = uniformMaps[0];

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

                    // 检查访问类型是否匹配
                    if (uniform.uniformtype == ShaderDataType.DeviceBuffer) {
                        if (access == "readonly") {
                            // 访问类型不匹配
                            console.warn(`Shader ${this.name} ssbo access type mismatch for ${name}`);
                        }
                    }
                    else if (uniform.uniformtype == ShaderDataType.ReadOnlyDeviceBuffer) {
                        if (access != "readonly") {
                            // 访问类型不匹配
                            console.warn(`Shader ${this.name} ssbo access type mismatch for ${name}`);
                        }
                    }
                }
            }

            // 如果有新的 SSBO，需要重新生成 uniform 声明并更新 binding map
            if (addNewSSBO) {
                materialUniformGlsl = "";
                binding = 0;
                ssboBindingMap.clear();
                
                // 重新生成 uniform 声明，binding map 会在 glslUniformString 中自动构建
                for (const uniformMap of uniformMaps) {
                    let result = this.glslUniformString(uniformMap._idata, useUniformBlock, uniformMap._stateName, binding, ssboBindingMap);
                    materialUniformGlsl += result.code;
                    binding = result.binding;
                    materialUniformGlsl += "\n";
                }

                computeHead =
                    `#version 310 es
                     #if defined(GL_FRAGMENT_PRECISION_HIGH)
                        precision highp float;
                        precision highp int;
                        precision highp sampler2DArray;
                        precision highp sampler3D;
                        precision highp image2D;
                    #else
                        precision mediump float;
                        precision mediump int;
                        precision mediump sampler2DArray;
                        precision mediump sampler3D;
                        precision mediump image2D;
                    #endif
                    layout(std140, column_major) uniform;
                    layout(std430, column_major) buffer;
                    ${materialUniformGlsl}
                `;

                dstCS = vsVersion + computeHead + defineStr + computeCode;
            }
        }

        // 替换代码中的 SSBO 声明，添加 binding 信息
        // ssboBindingMap 已经在 glslUniformString 中构建完成
        computeCode = ssboStrings(ssboBindingMap, computeCode);
        dstCS = vsVersion + computeHead + defineStr + computeCode;

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