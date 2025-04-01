import { LayaGL } from "../../../layagl/LayaGL";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";


/** @internal */
export function getTypeString(type: ShaderDataType) {
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

/** @internal */
export function isSamplerType(type: ShaderDataType) {
    switch (type) {
        case ShaderDataType.Texture2D:
        case ShaderDataType.Texture3D:
        case ShaderDataType.TextureCube:
        case ShaderDataType.Texture2DArray:
            return true;
        case ShaderDataType.None:
        case ShaderDataType.Int:
        case ShaderDataType.Bool:
        case ShaderDataType.Float:
        case ShaderDataType.Vector2:
        case ShaderDataType.Vector3:
        case ShaderDataType.Vector4:
        case ShaderDataType.Color:
        case ShaderDataType.Buffer:
        case ShaderDataType.Matrix4x4:
        case ShaderDataType.Matrix3x3:
        default:
            return false;
    }

}