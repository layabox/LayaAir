import { LayaGL } from "../layagl/LayaGL";
import { CommandUniformMap } from "../RenderDriver/DriverDesign/RenderDevice/CommandUniformMap";
import { ComputeShader } from "../RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeShader";
import { ShaderDataType } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IShaderObjStructor, Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { ShaderCompile } from "../webgl/utils/ShaderCompile";
import { ShaderParser } from "./ShaderParser";

declare module "../RenderEngine/RenderShader/Shader3D" {
    interface IShaderObjStructor {
        kernels?: Array<string>;
        uniformMaps: Array<any>;
        code?: string;
    }
}

export class ComputeShaderParser {

    static parse(data: string, basePath?: string) {

        type uniformType = { [name: string]: { type: ShaderDataType, format?: string, access?: "readonly" | "writeonly" | "readwrite" } };

        let obj: IShaderObjStructor = ShaderParser.getShaderBlock(data);
        let glslMap = ShaderParser.getCGBlock(data);

        // ShaderParser.bindCG(obj, glslMap);
        // code trans
        if (obj.code) {
            obj.code = glslMap[obj.code];
        }

        // uniform map trans
        if (obj.uniformMaps) {
            let uniformMaps = obj.uniformMaps;

            let defaultMap: any = {};
            obj.defaultValue = defaultMap;
            let newUniformMaps: uniformType[] = [];
            obj.uniformMaps = newUniformMaps;

            uniformMaps.forEach((uniformMap, index) => {
                let newUniformMap: uniformType = {};
                newUniformMaps[index] = newUniformMap;
                for (let k in uniformMap) {
                    let entry = uniformMap[k];
                    if (entry.serializable === false) {
                        continue;
                    }

                    let dataType = ShaderParser.getShaderDataType(entry.type);
                    if (dataType == null) {
                        console.warn(`${obj.name}: unkown uniform type '${entry.type}'`);
                        continue;
                    }
                    if (entry.default != null) {
                        defaultMap[k] = ShaderParser.getDefaultData(dataType, entry.default);
                    }

                    newUniformMap[k] = {
                        type: dataType,
                    };

                    if (dataType == ShaderDataType.StorageTexture2D) {
                        let format = entry.format ? entry.format : "rgba8";
                        let access = entry.access ? entry.access : "writeonly";
                        newUniformMap[k].format = format;
                        newUniformMap[k].access = access;
                    }
                    else if (dataType == ShaderDataType.DeviceBuffer) {
                        let access = entry.access ? entry.access : "readwrite";
                        if (access == "readonly") {
                            newUniformMap[k].type = ShaderDataType.ReadOnlyDeviceBuffer;
                        }
                        newUniformMap[k].access = access;
                    }
                }
            });

        }

        if (!obj.name || !obj.code) {
            return null;
        }

        return ShaderCompile.compileComputeAsync(obj.code, basePath).then(compileObjs => {
            let shaderName = obj.name;
            let uniformsArray = obj.uniformMaps;

            let uniformMaps: CommandUniformMap[] = [];

            uniformsArray.forEach((uniforms: uniformType, index) => {
                let uniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap(`${shaderName}_u${index}`);

                uniformMaps.push(uniformMap);

                for (let k in uniforms) {

                    let uniformName = k;

                    let arrayLength = getArrayLength(uniformName);
                    if (arrayLength > 0) {
                        uniformName = k.substring(0, k.lastIndexOf('['));
                    }

                    let propertyID = Shader3D.propertyNameToID(uniformName);
                    let shaderDataType = uniforms[k];

                    if (arrayLength > 0) {
                        uniformMap.addShaderUniformArray(propertyID, uniformName, shaderDataType.type, arrayLength);
                    }
                    else {
                        uniformMap.addShaderUniform(propertyID, k, shaderDataType.type, { format: shaderDataType.format, access: shaderDataType.access });
                    }
                }

            });

            let node = compileObjs.node;
            compileObjs.defs
            let computeShader = new ComputeShader(shaderName, compileObjs, uniformMaps);

            return computeShader;
        });
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
