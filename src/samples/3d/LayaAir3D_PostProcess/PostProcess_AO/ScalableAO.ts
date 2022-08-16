import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera } from "laya/d3/core/Camera";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { PostProcessEffect } from "laya/d3/core/render/PostProcessEffect";
import { PostProcessRenderContext } from "laya/d3/core/render/PostProcessRenderContext";
import { DepthTextureMode } from "laya/d3/depthMap/DepthPass";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector4 } from "laya/d3/math/Vector4";
import { Viewport } from "laya/d3/math/Viewport";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { SubShader } from "laya/d3/shader/SubShader";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector3 } from "laya/d3/math/Vector3";

import BlitScreenVS from "./Shader/BlitScreen.vs";
import FragAO from "./Shader/FragAO.fs";
import AoBlurHorizontal from "./Shader/AoBlurHorizontal.fs";
import AOComposition from "./Shader/AOComposition.fs";
import AmbientOcclusion from "./Shader/AmbientOcclusion.glsl";
import { WrapMode } from "laya/RenderEngine/RenderEnum/WrapMode";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataType } from "laya/RenderEngine/RenderShader/ShaderData";
import { LayaGL } from "laya/layagl/LayaGL";

export class ScalableAO extends PostProcessEffect {
    static BlurDelty: number;
    static AOColor: number;
    static aoTexture: number;

    static AOParams: number;
    static SourceTex: number;

    //scalable AO shader
    private _shader: Shader3D;
    private _shaderData: ShaderData;

    //blurHorizontal Ao Shader
    private _aoBlurHorizontalShader: Shader3D;
    private _aoComposition: Shader3D;

    private _aoParams: Vector3 = new Vector3();
    private static HasInit: boolean = false;

    static deltyHorizontal: Vector2 = new Vector2(1.0, 0.0);
    static deltyVector: Vector2 = new Vector2(0.0, 1.0);

    static init() {
        ScalableAO.BlurDelty = Shader3D.propertyNameToID("u_Delty");
        ScalableAO.AOColor = Shader3D.propertyNameToID("u_AOColor");
        ScalableAO.aoTexture = Shader3D.propertyNameToID("u_compositionAoTexture");

        ScalableAO.AOParams = Shader3D.propertyNameToID('u_AOParams');
        ScalableAO.SourceTex = Shader3D.propertyNameToID('u_SourceTex');
        Shader3D.addInclude("AmbientOcclusion.glsl", AmbientOcclusion);
        //scalableAoShader
        let attributeMap: any = {
            'a_PositionTexcoord': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };
        let uniformMap:any = {
            'u_OffsetScale': ShaderDataType.Vector4,
            'u_MainTex': ShaderDataType.Texture2D,
            'u_MainTex_TexelSize': ShaderDataType.Vector4,
            'u_Delty': ShaderDataType.Vector2,
            'u_PlugTime': ShaderDataType.Vector4,
            'u_AOParams': ShaderDataType.Vector4,
            'u_BlurVector': ShaderDataType.Vector2,
            'u_AOColor': ShaderDataType.Vector3,
            'u_compositionAoTexture': ShaderDataType.Texture2D

        }
        let shader: Shader3D = Shader3D.add("ScalableAO");
        let subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(BlitScreenVS, FragAO);
        //BlurShader
        shader = Shader3D.add("AOBlurHorizontal");
        subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(BlitScreenVS, AoBlurHorizontal);

        //Composition
        shader = Shader3D.add("AOComposition");
        subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(BlitScreenVS, AOComposition);

    }

    //_aoColor:Vector3 = new Vector3();
    set aoColor(value: Vector3) {
        this._shaderData.setVector3(ScalableAO.AOColor, value);
    }

    set instance(value: number) {
        this._aoParams.x = value;
        this._shaderData.setVector3(ScalableAO.AOParams, this._aoParams);
    }

    set radius(value: number) {
        this._aoParams.y = value;
        this._shaderData.setVector3(ScalableAO.AOParams, this._aoParams);
    }

    constructor() {
        super();
        ScalableAO.HasInit || ScalableAO.init();
        this._shader = Shader3D.find("ScalableAO");
        this._shaderData = LayaGL.renderOBJCreate.createShaderData(null);
        this._aoParams = new Vector3(0.12, 0.15, 1);
        this._shaderData.setVector3(ScalableAO.AOParams, this._aoParams);
        //@ts-ignore
        this._shaderData.setVector(BaseCamera.DEPTHZBUFFERPARAMS, new Vector4());
        this._aoBlurHorizontalShader = Shader3D.find("AOBlurHorizontal");
        this._aoComposition = Shader3D.find("AOComposition");

    }

    /**
     * @override
     * @param context 
     */
    render(context: PostProcessRenderContext): void {
        let cmd: CommandBuffer = context.command;
        let viewport: Viewport = context.camera.viewport;
        let camera: Camera = context.camera;

        // camera rendermode
        camera.depthTextureMode |= DepthTextureMode.DepthNormals;
        camera.depthTextureMode |= DepthTextureMode.Depth;

        let depthNormalTexture: RenderTexture = camera.depthNormalTexture;
        let depthTexture = camera.depthTexture;

        if (!depthNormalTexture || !depthTexture) {
            return;
        }

        depthNormalTexture.wrapModeU = WrapMode.Clamp;
        depthNormalTexture.wrapModeV = WrapMode.Clamp;

        let source: RenderTexture = context.source;
        let width = source.width;
        let height = source.height;
        let textureFormat: RenderTargetFormat = source.colorFormat;
        let depthFormat: RenderTargetFormat = RenderTargetFormat.None;

        let finalTex: RenderTexture = RenderTexture.createFromPool(width, height, textureFormat, depthFormat, false, 1);

        let shader: Shader3D = this._shader;
        let shaderData: ShaderData = this._shaderData;
        //depthTexture;
        //depthNormalTexture;
        cmd.blitScreenTriangle(null, finalTex, null, shader, shaderData, 0);
        //context.source = finalTex;
        let blurTex: RenderTexture = RenderTexture.createFromPool(width, height, textureFormat, depthFormat, false, 1);
        //blur horizontal
        cmd.blitScreenTriangle(finalTex, blurTex, null, this._aoBlurHorizontalShader, shaderData, 0);
        //blur Vec
        cmd.setShaderDataVector2(shaderData, ScalableAO.BlurDelty, ScalableAO.deltyVector);
        cmd.blitScreenTriangle(blurTex, finalTex, null, this._aoBlurHorizontalShader, this._shaderData, 0);
        //blur Composition
        cmd.setShaderDataTexture(shaderData, ScalableAO.aoTexture, finalTex);
        cmd.blitScreenTriangle(context.source, context.destination, null, this._aoComposition, this._shaderData, 0);
        //context.source = blurTex;
        context.deferredReleaseTextures.push(finalTex);
        context.deferredReleaseTextures.push(blurTex);
    }

}