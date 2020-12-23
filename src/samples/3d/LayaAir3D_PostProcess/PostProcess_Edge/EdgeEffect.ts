import { PostProcessEffect } from "laya/d3/core/render/PostProcessEffect";
import { PostProcessRenderContext } from "laya/d3/core/render/PostProcessRenderContext";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderData } from "laya/d3/shader/ShaderData";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { SubShader } from "laya/d3/shader/SubShader";
import { ShaderPass } from "laya/d3/shader/ShaderPass";

import EdgeEffectVS from "./shader/EdgeEffectVS.vs";
import EdgeEffectFS from "./shader/EdgeEffectFS.fs";

import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { Viewport } from "laya/d3/math/Viewport";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { TextureFormat } from "laya/resource/TextureFormat";
import { RenderTextureDepthFormat } from "laya/resource/RenderTextureFormat";
import { FilterMode } from "laya/resource/FilterMode";
import { Camera } from "laya/d3/core/Camera";
import { Vector4 } from "laya/d3/math/Vector4";
import { ShaderDefine } from "laya/d3/shader/ShaderDefine";
import { Vector3 } from "laya/d3/math/Vector3";
import { DepthTextureMode } from "laya/d3/depthMap/DepthPass";

export enum EdgeMode {
    ColorEdge = 0,
    NormalEdge = 1,
    DepthEdge = 2
}

export class EdgeEffect extends PostProcessEffect {

    private _shader: Shader3D = null;

    private static _isShaderInit: boolean = false;

    private _shaderData: ShaderData = new ShaderData();

    static DEPTHTEXTURE: number = Shader3D.propertyNameToID("u_DepthTex");
    static DEPTHNORMALTEXTURE: number = Shader3D.propertyNameToID("u_DepthNormalTex");
    static DEPTHBUFFERPARAMS: number = Shader3D.propertyNameToID("u_DepthBufferParams");

    static EDGECOLOR: number = Shader3D.propertyNameToID("u_EdgeColor");

    static COLORHOLD: number = Shader3D.propertyNameToID("u_ColorHold");
    static DEPTHHOLD: number = Shader3D.propertyNameToID("u_Depthhold");
    static NORMALHOLD: number = Shader3D.propertyNameToID("u_NormalHold");

    static SHADERDEFINE_DEPTHNORMAL: ShaderDefine;
    static SHADERDEFINE_DEPTH: ShaderDefine;

    static SHADERDEFINE_DEPTHEDGE: ShaderDefine;
    static SHADERDEFINE_NORMALEDGE: ShaderDefine;
    static SHADERDEFINE_COLOREDGE: ShaderDefine;

    static SHADERDEFINE_SOURCE: ShaderDefine;

    _depthBufferparam: Vector4 = new Vector4();

    _edgeMode: EdgeMode = EdgeMode.NormalEdge;

    constructor() {
        super();
        if (!EdgeEffect._isShaderInit) {
            EdgeEffect._isShaderInit = true;
            EdgeEffect.EdgeEffectShaderInit();
        }
        this._shader = Shader3D.find("PostProcessEdge");
        this.edgeColor = new Vector3(0.2, 0.2, 0.2);
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

        let source: RenderTexture = context.source;
        let destination: RenderTexture = context.destination;

        let width: number = viewport.width;
        let height: number = viewport.height;

        let renderTexture: RenderTexture = RenderTexture.createFromPool(width, height, TextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTH_16);
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

        cmd.blitScreenTriangle(source, renderTexture);
        cmd.blitScreenTriangle(renderTexture, source, null, this._shader, this._shaderData, 0);

        RenderTexture.recoverToPool(renderTexture);

    }

    static EdgeEffectShaderInit() {

        EdgeEffect.SHADERDEFINE_DEPTH = Shader3D.getDefineByName("DEPTH");
        EdgeEffect.SHADERDEFINE_DEPTHNORMAL = Shader3D.getDefineByName("DEPTHNORMAL");

        EdgeEffect.SHADERDEFINE_DEPTHEDGE = Shader3D.getDefineByName("DEPTHEDGE");
        EdgeEffect.SHADERDEFINE_NORMALEDGE = Shader3D.getDefineByName("NORMALEDGE");
        EdgeEffect.SHADERDEFINE_COLOREDGE = Shader3D.getDefineByName("COLOREDGE");

        EdgeEffect.SHADERDEFINE_SOURCE = Shader3D.getDefineByName("SOURCE");

        let attributeMap: any = {
            'a_PositionTexcoord': VertexMesh.MESH_POSITION0
        };

        let uniformMap: any = {
            'u_MainTex': Shader3D.PERIOD_MATERIAL, // source
            'u_OffsetScale': Shader3D.PERIOD_MATERIAL,
            'u_MainTex_TexelSize': Shader3D.PERIOD_MATERIAL,

            'u_DepthTex': Shader3D.PERIOD_MATERIAL,
            'u_DepthNormalTex': Shader3D.PERIOD_MATERIAL,
            'u_DepthBufferParams': Shader3D.PERIOD_MATERIAL,

            'u_ColorHold': Shader3D.PERIOD_MATERIAL,
            'u_Depthhold': Shader3D.PERIOD_MATERIAL,
            'u_NormalHold': Shader3D.PERIOD_MATERIAL
        };

        let shader: Shader3D = Shader3D.add("PostProcessEdge");
        let subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let pass: ShaderPass = subShader.addShaderPass(EdgeEffectVS, EdgeEffectFS);
        pass.renderState.depthWrite = false;
    }
}