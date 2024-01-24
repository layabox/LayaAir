import { PostProcessEffect } from "laya/d3/core/render/PostProcessEffect";
import { PostProcessRenderContext } from "laya/d3/core/render/PostProcessRenderContext";
import EdgeEffectVS from "./shader/EdgeEffectVS.vs";
import EdgeEffectFS from "./shader/EdgeEffectFS.fs";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { Viewport } from "laya/d3/math/Viewport";
import { Camera } from "laya/d3/core/Camera";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataType } from "laya/RenderDriver/RenderModuleData/Design/ShaderData";
import { LayaGL } from "laya/layagl/LayaGL";
import { ShaderDefine } from "laya/RenderDriver/RenderModuleData/Design/ShaderDefine";
import { ShaderPass } from "laya/RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { RenderTexture, DepthTextureMode } from "laya/resource/RenderTexture";

export enum EdgeMode {
    ColorEdge = 0,
    NormalEdge = 1,
    DepthEdge = 2
}

export class EdgeEffect extends PostProcessEffect {
    private _shader: Shader3D = null;
    private static _isShaderInit: boolean = false;
    private _shaderData: ShaderData = LayaGL.unitRenderModuleDataFactory.createShaderData(null);
    static DEPTHTEXTURE: number;
    static DEPTHNORMALTEXTURE: number;
    static DEPTHBUFFERPARAMS: number;
    static EDGECOLOR: number;
    static COLORHOLD: number;
    static DEPTHHOLD: number;
    static NORMALHOLD: number;
    static SHADERDEFINE_DEPTHNORMAL: ShaderDefine;
    static SHADERDEFINE_DEPTH: ShaderDefine;
    static SHADERDEFINE_DEPTHEDGE: ShaderDefine;
    static SHADERDEFINE_NORMALEDGE: ShaderDefine;
    static SHADERDEFINE_COLOREDGE: ShaderDefine;
    static SHADERDEFINE_SOURCE: ShaderDefine;
    _depthBufferparam: Vector4 = new Vector4();

    _edgeMode: EdgeMode = EdgeMode.NormalEdge;

    static __init__() {
        EdgeEffect.DEPTHTEXTURE = Shader3D.propertyNameToID("u_DepthTex");
        EdgeEffect.DEPTHNORMALTEXTURE = Shader3D.propertyNameToID("u_DepthNormalTex");
        EdgeEffect.DEPTHBUFFERPARAMS = Shader3D.propertyNameToID("u_DepthBufferParams");
        EdgeEffect.EDGECOLOR = Shader3D.propertyNameToID("u_EdgeColor");
        EdgeEffect.COLORHOLD = Shader3D.propertyNameToID("u_ColorHold");
        EdgeEffect.DEPTHHOLD = Shader3D.propertyNameToID("u_Depthhold");
        EdgeEffect.NORMALHOLD = Shader3D.propertyNameToID("u_NormalHold");
    }
    static EdgeEffectShaderInit() {
        EdgeEffect.__init__();
        EdgeEffect.SHADERDEFINE_DEPTH = Shader3D.getDefineByName("DEPTH");
        EdgeEffect.SHADERDEFINE_DEPTHNORMAL = Shader3D.getDefineByName("DEPTHNORMAL");

        EdgeEffect.SHADERDEFINE_DEPTHEDGE = Shader3D.getDefineByName("DEPTHEDGE");
        EdgeEffect.SHADERDEFINE_NORMALEDGE = Shader3D.getDefineByName("NORMALEDGE");
        EdgeEffect.SHADERDEFINE_COLOREDGE = Shader3D.getDefineByName("COLOREDGE");

        EdgeEffect.SHADERDEFINE_SOURCE = Shader3D.getDefineByName("SOURCE");
        let attributeMap: any = {
            'a_PositionTexcoord': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };

        let uniformMap: any = {
            "u_MainTex": ShaderDataType.Texture2D,
            "u_MainTex_TexelSize": ShaderDataType.Vector4,
            "u_DepthTex": ShaderDataType.Texture2D,
            "u_DepthNormalTex": ShaderDataType.Texture2D,
            "u_DepthBufferParams": ShaderDataType.Vector4,
            "u_EdgeColor": ShaderDataType.Color,
            "u_ColorHold": ShaderDataType.Float,
            "u_Depthhold": ShaderDataType.Float,
            "u_NormalHold": ShaderDataType.Float,
        };
        let shader: Shader3D = Shader3D.add("PostProcessEdge");
        let subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let pass: ShaderPass = subShader.addShaderPass(EdgeEffectVS, EdgeEffectFS);
        pass.renderState.depthWrite = false;
    }
    constructor() {
        super();
        if (!EdgeEffect._isShaderInit) {
            EdgeEffect._isShaderInit = true;
            EdgeEffect.EdgeEffectShaderInit();
        }
        this._shader = Shader3D.find("PostProcessEdge");
        this.edgeColor = new Vector3(0.0, 0.0, 0.0);
        this.colorHold = 0.7;
        this.normalHold = 0.7;
        this.depthHold = 0.7;
        this.edgeMode = EdgeMode.DepthEdge;
        this.showSource = true;
    }

    get edgeColor(): Vector3 {
        return this._shaderData.getVector3(EdgeEffect.EDGECOLOR);
    }

    set edgeColor(value: Vector3) {
        this._shaderData.setVector3(EdgeEffect.EDGECOLOR, value);
    }

    get colorHold(): number {
        return this._shaderData.getNumber(EdgeEffect.COLORHOLD);
    }

    set colorHold(value: number) {
        this._shaderData.setNumber(EdgeEffect.COLORHOLD, value);
    }

    get depthHold(): number {
        return this._shaderData.getNumber(EdgeEffect.DEPTHHOLD);
    }

    set depthHold(value: number) {
        this._shaderData.setNumber(EdgeEffect.DEPTHHOLD, value)
    }

    get normalHold(): number {
        return this._shaderData.getNumber(EdgeEffect.NORMALHOLD);
    }

    set normalHold(value: number) {
        this._shaderData.setNumber(EdgeEffect.NORMALHOLD, value);
    }

    get edgeMode(): EdgeMode {
        return this._edgeMode;
    }

    get showSource(): boolean {
        return this._shaderData.hasDefine(EdgeEffect.SHADERDEFINE_SOURCE);
    }

    set showSource(value: boolean) {
        if (value) {
            this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_SOURCE);
        }
        else {
            this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_SOURCE);
        }
    }

    set edgeMode(value: EdgeMode) {
        this._edgeMode = value;
        switch (value) {
            case EdgeMode.ColorEdge:
                this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_COLOREDGE);
                this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_DEPTHEDGE);
                this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_NORMALEDGE);
                break;
            case EdgeMode.NormalEdge:
                this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_NORMALEDGE);
                this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_DEPTHEDGE);
                this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_COLOREDGE);
                break;
            case EdgeMode.DepthEdge:
                this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_DEPTHEDGE);
                this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_COLOREDGE);
                this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_NORMALEDGE);
                break;
        }
    }


    render(context: PostProcessRenderContext): void {
        let cmd: CommandBuffer = context.command;
        let viewport: Viewport = context.camera.viewport;

        let camera: Camera = context.camera;
        let far: number = camera.farPlane;
        let near: number = camera.nearPlane;

        let source: RenderTexture = context.indirectTarget;
        let destination: RenderTexture = context.destination;

        let width: number = viewport.width;
        let height: number = viewport.height;

        let renderTexture: RenderTexture = RenderTexture.createFromPool(width, height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.DEPTH_16, false, 1);
        renderTexture.filterMode = FilterMode.Bilinear;

        if (camera.depthTextureMode == DepthTextureMode.Depth) {
            this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_DEPTH);
            this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_DEPTHNORMAL);
            this._shaderData.setTexture(EdgeEffect.DEPTHTEXTURE, camera.depthTexture);
        }
        else if (camera.depthTextureMode == DepthTextureMode.DepthNormals) {
            this._shaderData.addDefine(EdgeEffect.SHADERDEFINE_DEPTHNORMAL);
            this._shaderData.removeDefine(EdgeEffect.SHADERDEFINE_DEPTH);
            this._shaderData.setTexture(EdgeEffect.DEPTHNORMALTEXTURE, camera.depthNormalTexture);
        }

        this._depthBufferparam.setValue(1.0 - far / near, far / near, (near - far) / (near * far), 1 / near);
        this._shaderData.setVector(EdgeEffect.DEPTHBUFFERPARAMS, this._depthBufferparam);

        cmd.blitScreenTriangle(source, context.destination, null, this._shader, this._shaderData, 0);

        //context.source = renderTexture;
        context.deferredReleaseTextures.push(renderTexture);

    }


}