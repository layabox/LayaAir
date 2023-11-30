import { Material } from "laya/resource/Material";
import DepthNormalVS from "../DepthNormalShader/DepthNormalsTextureTest.vs";
import DepthNormalFS from "../DepthNormalShader/DepthNormalsTextureTest.fs";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { RenderState } from "laya/RenderEngine/RenderShader/RenderState";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";

export class DepthNormalsMaterial extends Material {
    static init() {
        var shader: Shader3D = Shader3D.add("DepthNormalShader", false, false);
        var subShader: SubShader = new SubShader(SubShader.DefaultAttributeMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(DepthNormalVS, DepthNormalFS, "Forward");
    }

    constructor() {
        super();
        this.setShaderName("DepthNormalShader");
        this.renderModeSet();
    }

    //渲染模式
    renderModeSet() {
        this.alphaTest = false;//深度测试关闭
        this.renderQueue = Material.RENDERQUEUE_OPAQUE;//渲染顺序放在后面
        this.depthWrite = true;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.depthTest = RenderState.DEPTHTEST_LESS;
    }
}