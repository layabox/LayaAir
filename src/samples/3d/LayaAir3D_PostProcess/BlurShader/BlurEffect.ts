import { PostProcessEffect } from "laya/d3/core/render/PostProcessEffect";
import { PostProcessRenderContext } from "laya/d3/core/render/PostProcessRenderContext";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { Viewport } from "laya/d3/math/Viewport";
import BlurVS from "./Blur.vs";
import BlurHorizentalFS from "./BlurHorizontal.fs";
import BlurVerticalFS from "./BlurVertical.fs";
import BlurDownSampleFS from "./BlurDownSample.fs";
import BlurDownSampleVS from "./BlurDownSample.vs";
import BlurEdgeAdd from "./EdgeAdd.fs";
import BlurEdgeSub from "./EdgeSub.fs";
import { Material } from "laya/d3/core/material/Material";
import { BaseTexture } from "laya/resource/BaseTexture";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataType } from "laya/RenderEngine/RenderShader/ShaderData";
import { LayaGL } from "laya/layagl/LayaGL";
import { Vector4 } from "laya/maths/Vector4";
import { RenderTexture } from "laya/resource/RenderTexture";
import { RenderState } from "laya/RenderEngine/RenderShader/RenderState";
import { ShaderPass } from "laya/RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
export class BlurEffect extends PostProcessEffect {

    static BLUR_TYPE_GaussianBlur: number = 0;
    static BLUR_TYPE_Simple: number = 1;
    static SHADERVALUE_MAINTEX: number;
    static SHADERVALUE_TEXELSIZE: number;
    static SHADERVALUE_DOWNSAMPLEVALUE: number;

    static init() {
        BlurEffect.SHADERVALUE_MAINTEX = Shader3D.propertyNameToID("u_MainTex");
        BlurEffect.SHADERVALUE_TEXELSIZE = Shader3D.propertyNameToID("u_MainTex_TexelSize");
        BlurEffect.SHADERVALUE_DOWNSAMPLEVALUE = Shader3D.propertyNameToID("u_DownSampleValue");
        //初始化shader
        let attributeMap: any = {
            'a_PositionTexcoord': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };

        let uniformMap: any = {
            "u_MainTex": ShaderDataType.Texture2D,
            "u_sourceTexture0": ShaderDataType.Texture2D,
            "u_sourceTexture1": ShaderDataType.Texture2D,
            "u_MainTex_TexelSize": ShaderDataType.Vector4,
            "u_DownSampleValue": ShaderDataType.Float
        };
        var shader: Shader3D = Shader3D.add("blurEffect");
        //subShader0  降采样
        var subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        var shaderpass: ShaderPass = subShader.addShaderPass(BlurDownSampleVS, BlurDownSampleFS);
        var renderState: RenderState = shaderpass.renderState;
        renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        renderState.depthWrite = false;
        renderState.cull = RenderState.CULL_NONE;
        renderState.blend = RenderState.BLEND_DISABLE;
        //subShader1 垂直反向模糊
        subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        shaderpass = subShader.addShaderPass(BlurVS, BlurVerticalFS);
        renderState = shaderpass.renderState;
        renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        renderState.depthWrite = false;
        renderState.cull = RenderState.CULL_NONE;
        renderState.blend = RenderState.BLEND_DISABLE;
        //subShader2 水平方向模糊
        subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        shaderpass = subShader.addShaderPass(BlurVS, BlurHorizentalFS);
        renderState = shaderpass.renderState;
        renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        renderState.depthWrite = false;
        renderState.cull = RenderState.CULL_NONE;
        renderState.blend = RenderState.BLEND_DISABLE;
        //subShader3 subTexture
        subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        shaderpass = subShader.addShaderPass(BlurVS, BlurEdgeSub);
        renderState = shaderpass.renderState;
        renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        renderState.depthWrite = false;
        renderState.cull = RenderState.CULL_NONE;
        renderState.blend = RenderState.BLEND_DISABLE;
        //subShader4 addTexture
        subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        shaderpass = subShader.addShaderPass(BlurVS, BlurEdgeAdd);
        renderState = shaderpass.renderState;
        renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        renderState.depthWrite = false;
        renderState.cull = RenderState.CULL_NONE;
        renderState.blend = RenderState.BLEND_DISABLE;

    }

    /**@internal */
    private _shader: Shader3D = null;
    /**@internal */
    private _shaderData: ShaderData = LayaGL.renderOBJCreate.createShaderData(null);
    /**@internal */
    private _downSampleNum: number = 1;
    /**@internal */
    private _blurSpreadSize: number = 1;
    /**@internal */
    private _blurIterations: number = 2;
    /**@internal */
    private _texSize: Vector4 = new Vector4(1.0, 1.0, 1.0, 1.0);
    /**@internal */
    private _tempRenderTexture: any[];

    constructor() {
        super();
        this._shader = Shader3D.find("blurEffect");
        this._tempRenderTexture = new Array(13);
    }

    /**
     * @return 强度。
     */
    get downSampleNum(): number {
        return this._downSampleNum;
    }

    /**
     * 降采样,值范围为0-6。
     * @param value 强度。
     */
    set downSampleNum(value: number) {
        this._downSampleNum = Math.min(6, Math.max(value, 0.0));
    }

    /**
     * 采样间隔  过大会失真1-10
     * @return 。
     */
    get blurSpreadSize(): number {
        return this._blurSpreadSize;
    }

    /**
     * @param value 
     */
    set blurSpreadSize(value: number) {
        this._blurSpreadSize = Math.min(10, Math.max(value, 1.0));
    }

    /**
     * 迭代次数  越大性能消耗越大 效果越好
     * @return 。
     */
    get blurIterations(): number {
        return this._blurIterations;
    }

    /**
     * @param value。
     */
    set blurIterations(value: number) {
        this._blurIterations = Math.min(Math.max(value, 0.0), 6.0);
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    render(context: PostProcessRenderContext): void {
        var cmd: CommandBuffer = context.command;
        var viewport: Viewport = context.camera.viewport;
        var scaleFactor: number = 1.0 / (1 << Math.floor(this._downSampleNum));
        var tw: number = Math.floor(viewport.width * scaleFactor);
        var th: number = Math.floor(viewport.height * scaleFactor);
        this._texSize.setValue(1.0 / tw, 1.0 / th, tw, th);
        //赋值
        this._shaderData.setNumber(BlurEffect.SHADERVALUE_DOWNSAMPLEVALUE, this.blurSpreadSize);
        this._shaderData.setVector(BlurEffect.SHADERVALUE_TEXELSIZE, this._texSize);
        //降采样
        var downSampleTexture: RenderTexture = RenderTexture.createFromPool(tw, th, RenderTargetFormat.R8G8B8, RenderTargetFormat.None, false, 1);
        downSampleTexture.filterMode = FilterMode.Bilinear;
        this._tempRenderTexture[0] = downSampleTexture;
        var lastDownTexture: RenderTexture = context.source;
        cmd.blitScreenTriangle(lastDownTexture, downSampleTexture, null, this._shader, this._shaderData, 0);
        lastDownTexture = downSampleTexture;
        //迭代次数
        for (var i: number = 0; i < this._blurIterations; i++) {
            //vertical
            var blurTexture: RenderTexture = RenderTexture.createFromPool(tw, th, RenderTargetFormat.R8G8B8, RenderTargetFormat.None, false, 1);
            blurTexture.filterMode = FilterMode.Bilinear;
            cmd.blitScreenTriangle(lastDownTexture, blurTexture, null, this._shader, this._shaderData, 1);
            lastDownTexture = blurTexture;
            this._tempRenderTexture[i * 2 + 1] = blurTexture;
            //Horizental
            blurTexture = RenderTexture.createFromPool(tw, th, RenderTargetFormat.R8G8B8, RenderTargetFormat.None, false, 1);
            blurTexture.filterMode = FilterMode.Bilinear;
            cmd.blitScreenTriangle(lastDownTexture, blurTexture, null, this._shader, this._shaderData, 2);
            lastDownTexture = blurTexture;
            this._tempRenderTexture[i * 2 + 2] = blurTexture;
        }
        context.source = lastDownTexture;
        cmd.blitScreenTriangle(context.indirectTarget, context.destination);
        var maxTexture = this._blurIterations * 2 + 1;
        //释放渲染纹理
        for (i = 0; i < maxTexture; i++) {
            RenderTexture.recoverToPool(this._tempRenderTexture[i]);
        }
        context.deferredReleaseTextures.push(lastDownTexture);
    }
}

export class BlurMaterial extends Material {
    static SHADERVALUE_MAINTEX: number;
    static SHADERVALUE_TEXELSIZE: number;
    static SHADERVALUE_DOWNSAMPLEVALUE: number;
    static SHADERVALUE_SOURCETEXTURE0: number;
    static ShADERVALUE_SOURCETEXTURE1: number;

    static __init__() {
        BlurMaterial.SHADERVALUE_MAINTEX = Shader3D.propertyNameToID("u_MainTex");
        BlurMaterial.SHADERVALUE_TEXELSIZE = Shader3D.propertyNameToID("u_MainTex_TexelSize");
        BlurMaterial.SHADERVALUE_DOWNSAMPLEVALUE = Shader3D.propertyNameToID("u_DownSampleValue");
        BlurMaterial.SHADERVALUE_SOURCETEXTURE0 = Shader3D.propertyNameToID("u_sourceTexture0");
        BlurMaterial.ShADERVALUE_SOURCETEXTURE1 = Shader3D.propertyNameToID("u_sourceTexture1");
    }

    constructor(texelSize: Vector4, offset: number) {
        super();
        BlurMaterial.__init__();
        this.setShaderName("blurEffect");
        this.setIntByIndex(BlurMaterial.SHADERVALUE_DOWNSAMPLEVALUE, offset);
        this.setVector4ByIndex(BlurMaterial.SHADERVALUE_TEXELSIZE, texelSize);
    }

    sourceTexture(sourceTexture0: BaseTexture, sourceTexture1: BaseTexture) {
        this.setTextureByIndex(BlurMaterial.SHADERVALUE_SOURCETEXTURE0, sourceTexture0);
        this.setTextureByIndex(BlurMaterial.ShADERVALUE_SOURCETEXTURE1, sourceTexture1);
    }
}

