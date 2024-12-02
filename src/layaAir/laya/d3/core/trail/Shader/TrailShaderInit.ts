import TrailVS from "./Trail.vs";
import TrailFS from "./Trail.fs";
import { Shader3D, ShaderFeatureType } from "../../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { TrailShaderCommon } from "../../../../display/RenderFeatureComman/Trail/TrailShaderCommon";
import { TrailMaterial } from "../TrailMaterial";
export class TrailShaderInit {
    static init() {
        TrailShaderCommon.init();
        let shader = Shader3D.add("Trail", false, false);
        shader.shaderType = ShaderFeatureType.Effect;
        let subShader = new SubShader(TrailShaderCommon.attributeMap, TrailShaderCommon.uniformMap, TrailShaderCommon.defaultValue);
        shader.addSubShader(subShader);
        let forwardPass = subShader.addShaderPass(TrailVS, TrailFS);
        TrailMaterial.defaultMaterial = new TrailMaterial();
        TrailMaterial.defaultMaterial.lock = true;
    }
}