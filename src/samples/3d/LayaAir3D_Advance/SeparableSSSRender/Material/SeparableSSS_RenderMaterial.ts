import { Material } from "laya/d3/core/material/Material";
import { SubShader } from "laya/d3/shader/SubShader";
import SSSSRenderVS from "./../shader/SeparableSSS_Render.vs";
import SSSSRenderFS from "./../shader/SeparableSSS_Render.fs";
import { RenderState } from "laya/d3/core/material/RenderState";
import { Vector4 } from "laya/d3/math/Vector4";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";

export class SeparableSSSRenderMaterial extends Material {

    static SSSSDIFUSETEX: number;
    static SSSSSPECULARTEX: number;
    static TILINGOFFSET: number;

    static init() {
        SeparableSSSRenderMaterial.SSSSDIFUSETEX = Shader3D.propertyNameToID("sssssDiffuseTexture");
        SeparableSSSRenderMaterial.SSSSSPECULARTEX = Shader3D.propertyNameToID("sssssSpecularTexture");
        SeparableSSSRenderMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
        var shader: Shader3D = Shader3D.add("SeparableRender", false);
        var subShader: SubShader = new SubShader();
        shader.addSubShader(subShader);
        subShader.addShaderPass(SSSSRenderVS, SSSSRenderFS, "Forward");
    }

    constructor() {
        super();
        this.setShaderName("SeparableRender");
        this.renderModeSet();
        this._shaderValues.setVector(SeparableSSSRenderMaterial.TILINGOFFSET, new Vector4(1, 1, 0, 0));
    }

    //渲染模式
    renderModeSet() {
        this.alphaTest = false;//深度测试关闭
        this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;//渲染顺序放在后面
        this.depthWrite = true;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.depthTest = RenderState.DEPTHTEST_LESS;
    }
}