
import { ShaderDataType } from "../../RenderEngine/RenderShader/ShaderData";
import { LayaGL } from "../../layagl/LayaGL";
import { RenderCapable } from "../RenderEnum/RenderCapable";
import { UniformMapType } from "./SubShader";

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
                        let typeStr = getAttributeType(dataType);
                        if (typeStr != "") {
                            blocksStr += `${typeStr} ${uniformName};\n`;
                        }
                    }
                    blocksStr += "};\n";
                }
                else { // uniform
                    let dataType = <ShaderDataType>uniformsMap[key];
                    let typeStr = getAttributeType(dataType);
                    if (typeStr != "") {
                        uniformsStr += `uniform ${typeStr} ${key};\n`;
                    }
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
                        let typeStr = getAttributeType(dataType);
                        if (typeStr != "") {
                            uniformsStr += `uniform ${typeStr} ${uniformName};\n`;
                        }
                    }
                }
                else { // uniform
                    let dataType = <ShaderDataType>uniformsMap[key];
                    let typeStr = getAttributeType(dataType);
                    if (typeStr != "") {
                        uniformsStr += `uniform ${typeStr} ${key};\n`;
                    }
                }
            }
            return uniformsStr;
        }

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