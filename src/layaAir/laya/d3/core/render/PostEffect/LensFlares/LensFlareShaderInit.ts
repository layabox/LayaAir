import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "laya/RenderEngine/RenderShader/ShaderData";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { Color } from "laya/maths/Color";

import LensFlareVS from "../../../../shader/files/postProcess/LensFlare/LensFlare.vs";
import LensFlareFS from "../../../../shader/files/postProcess/LensFlare/LensFlare.fs";
import { LensFlareElementGeomtry } from "./LensFlareGeometry";

export class LensFlareShaderInit {
    static init() {
        let attribute: { [name: string]: [number, ShaderDataType] } = {
            'a_PositionTexcoord': [LensFlareElementGeomtry.PositionUV, ShaderDataType.Vector4],
            'a_DistanceRotationScale': [LensFlareElementGeomtry.PositionRotationScale, ShaderDataType.Vector4],
        }
        let uniformMap = {
            "u_Tint": ShaderDataType.Color,
            "u_FlareTexture": ShaderDataType.Texture2D,
            "u_FlareCenter": ShaderDataType.Vector2,
            "u_aspectRatio": ShaderDataType.Float,
            "u_rotate": ShaderDataType.Float
        }
        let defaultValue = {
            "u_Tint": Color.WHITE,
            "u_aspectRatio": 1
        }
        let shader = Shader3D.add("LensFlare", true, false);
        let subshader = new SubShader(attribute, uniformMap, defaultValue)
        shader.addSubShader(subshader);
        subshader.addShaderPass(LensFlareVS, LensFlareFS);
    }
}