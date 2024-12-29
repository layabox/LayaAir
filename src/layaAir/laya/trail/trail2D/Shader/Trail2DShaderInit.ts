import TrailVS from "./Trail2D.vs";
import TrailFS from "./Trail2D.fs";
import { Vector4 } from "../../../maths/Vector4";
import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Material } from "../../../resource/Material";
import { TrailShaderCommon } from "../../trailCommon/RenderFeatureComman/Trail/TrailShaderCommon";
import { Trail2DRender } from "../Trail2DRender";
export class Trail2DShaderInit {
    static init() {
        TrailShaderCommon.init();
        let shader = Shader3D.add("Trail2D", false, false);
        shader.shaderType = ShaderFeatureType.Effect;
        let subShader = new SubShader(TrailShaderCommon.attributeMap, { "u_TilingOffset": ShaderDataType.Vector4 }, { "u_TilingOffset": new Vector4(1, 1, 0, 0) });
        shader.addSubShader(subShader);
        let forwardPass = subShader.addShaderPass(TrailVS, TrailFS);

        //default Material
        let mat = Trail2DRender.defaultTrail2DMaterial = new Material();
        mat.setShaderName("Trail2D");
        mat.alphaTest = false;
        mat.depthTest = RenderState.DEPTHTEST_OFF;
        mat.cull = RenderState.CULL_NONE;
        mat.blend = RenderState.BLEND_ENABLE_ALL;
        mat.setIntByIndex(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_SRC_ALPHA);
        mat.setIntByIndex(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
    }
}