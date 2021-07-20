import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera } from "laya/d3/core/Camera";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { PostProcessEffect } from "laya/d3/core/render/PostProcessEffect";
import { PostProcessRenderContext } from "laya/d3/core/render/PostProcessRenderContext";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { DepthPass, DepthTextureMode } from "laya/d3/depthMap/DepthPass";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector4 } from "laya/d3/math/Vector4";
import { Viewport } from "laya/d3/math/Viewport";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderData } from "laya/d3/shader/ShaderData";
import { ShaderPass } from "laya/d3/shader/ShaderPass";
import { SubShader } from "laya/d3/shader/SubShader";
import { RenderTextureDepthFormat, RenderTextureFormat } from "laya/resource/RenderTextureFormat";
import { WarpMode } from "laya/resource/WrapMode";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector3 } from "laya/d3/math/Vector3";

import BlitScreenVS from "./Shader/BlitScreen.vs";
import FragAO from "./Shader/FragAO.fs";
import AoBlurHorizontal from "./Shader/AoBlurHorizontal.fs";
import AOComposition from "./Shader/AOComposition.fs";

export class ScalableAO extends PostProcessEffect {
    static BlurDelty: number = Shader3D.propertyNameToID("u_Delty");
    static AOColor:number = Shader3D.propertyNameToID("u_AOColor");
    static aoTexture:number = Shader3D.propertyNameToID("u_compositionAoTexture");
    static radius:number = Shader3D.propertyNameToID("u_radius");
    static instance:number = Shader3D.propertyNameToID("u_Intensity");

    //scalable AO shader
    private _shader: Shader3D;
    private _shaderData: ShaderData;

    //blurHorizontal Ao Shader
    private _aoBlurHorizontalShader:Shader3D;
    private _aoComposition:Shader3D;

    private static HasInit: boolean = false;

    static deltyHorizontal:Vector2 = new Vector2(1.0,0.0);
    static deltyVector:Vector2 = new Vector2(0.0,1.0);

    static init() {

        //scalableAoShader
        let attributeMap: any = {
            'a_PositionTexcoord': VertexMesh.MESH_POSITION0
        };
        let uniformMap: any = {
            // camera
            'u_Projection': Shader3D.PERIOD_MATERIAL,
            'u_ProjectionParams': Shader3D.PERIOD_MATERIAL,
            'u_ViewProjection': Shader3D.PERIOD_MATERIAL,
            'u_ZBufferParams': Shader3D.PERIOD_MATERIAL,
            'u_View': Shader3D.PERIOD_MATERIAL,
            'u_Time': Shader3D.PERIOD_MATERIAL,
            'u_CameraDepthTexture': Shader3D.PERIOD_MATERIAL,
            'u_CameraDepthNormalsTexture': Shader3D.PERIOD_MATERIAL,
            'u_radius':Shader3D.PERIOD_MATERIAL,
            'u_Intensity':Shader3D.PERIOD_MATERIAL,

            'u_MainTex': Shader3D.PERIOD_MATERIAL,
            'u_OffsetScale': Shader3D.PERIOD_MATERIAL,
        };

        let shader: Shader3D = Shader3D.add("ScalableAO");
        let subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(BlitScreenVS, FragAO);

        //BlurShader
        attributeMap = {
            'a_PositionTexcoord': VertexMesh.MESH_POSITION0
        };
        uniformMap = {
            'u_MainTex': Shader3D.PERIOD_MATERIAL,
            'u_OffsetScale': Shader3D.PERIOD_MATERIAL,
            'u_View': Shader3D.PERIOD_MATERIAL,
            'u_Projection': Shader3D.PERIOD_MATERIAL,
            'u_Delty':Shader3D.PERIOD_MATERIAL,
            'u_MainTex_TexelSize':Shader3D.PERIOD_MATERIAL
        };
        shader = Shader3D.add("AOBlurHorizontal");
        subShader = new SubShader(attributeMap,uniformMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(BlitScreenVS,AoBlurHorizontal);

        //Composition
        attributeMap = {
            'a_PositionTexcoord': VertexMesh.MESH_POSITION0
        };
        uniformMap = {
            'u_MainTex': Shader3D.PERIOD_MATERIAL,
            'u_OffsetScale': Shader3D.PERIOD_MATERIAL,
            'u_View': Shader3D.PERIOD_MATERIAL,
            'u_Projection': Shader3D.PERIOD_MATERIAL,
            'u_Delty':Shader3D.PERIOD_MATERIAL,
            'u_MainTex_TexelSize':Shader3D.PERIOD_MATERIAL,
            'u_AOColor':Shader3D.PERIOD_MATERIAL,
            'u_compositionAoTexture':Shader3D.PERIOD_MATERIAL
        };
        shader = Shader3D.add("AOComposition");
        subShader = new SubShader(attributeMap,uniformMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(BlitScreenVS,AOComposition);

    }

    //_aoColor:Vector3 = new Vector3();

    set aoColor(value:Vector3){
        this._shaderData.setVector3(ScalableAO.AOColor,value);
    }

    set instance(value:number){
        this._shaderData.setNumber(ScalableAO.instance,value);
    }

    set radius(value:number){
        this._shaderData.setNumber(ScalableAO.radius,value);
    }

    constructor() {
        super();
        ScalableAO.HasInit || ScalableAO.init();
        this._shader = Shader3D.find("ScalableAO");
        this._shaderData = new ShaderData();
        //@ts-ignore
        this._shaderData.setVector(BaseCamera.DEPTHZBUFFERPARAMS, new Vector4());
        this._aoBlurHorizontalShader = Shader3D.find("AOBlurHorizontal");
        this._aoComposition = Shader3D.find("AOComposition");

    }
    
    setUniform(camera: Camera) {
        let scene: Scene3D = camera.scene;
        let shaderData: ShaderData = this._shaderData;
        // camera
        //@ts-ignore
        shaderData.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, camera._shaderValues.getMatrix4x4(BaseCamera.VIEWPROJECTMATRIX));
        //@ts-ignore
        shaderData.setMatrix4x4(BaseCamera.PROJECTMATRIX, camera._shaderValues.getMatrix4x4(BaseCamera.PROJECTMATRIX));
        //@ts-ignore
        shaderData.setVector(BaseCamera.DEPTHZBUFFERPARAMS, camera._shaderValues.getVector(BaseCamera.DEPTHZBUFFERPARAMS));
        //@ts-ignore
        shaderData.setVector(BaseCamera.PROJECTION_PARAMS, camera._shaderValues.getVector(BaseCamera.PROJECTION_PARAMS));
        //@ts-ignore
        shaderData.setMatrix4x4(BaseCamera.VIEWMATRIX, camera._shaderValues.getMatrix4x4(BaseCamera.VIEWMATRIX));
        //@ts-ignore
        shaderData.setTexture(DepthPass.DEPTHNORMALSTEXTURE, camera._shaderValues.getTexture(DepthPass.DEPTHNORMALSTEXTURE));
        //@ts-ignore
        shaderData.setTexture(DepthPass.DEPTHTEXTURE, camera._shaderValues.getTexture(DepthPass.DEPTHTEXTURE));
        shaderData.setVector2(ScalableAO.BlurDelty,ScalableAO.deltyHorizontal);
        //@ts-ignore
        shaderData.setNumber(Scene3D.TIME, scene._shaderValues.getNumber(Scene3D.TIME));



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
        let depthTexture: RenderTexture = camera.depthTexture;

        if (!depthNormalTexture || !depthTexture) {
            return;
        }

        depthNormalTexture.wrapModeU = WarpMode.Clamp;
        depthNormalTexture.wrapModeV = WarpMode.Clamp;
        
        let source: RenderTexture = context.source;
        let width = source.width;
        let height = source.height;
        let textureFormat: RenderTextureFormat = source.format;
        let depthFormat: RenderTextureDepthFormat = RenderTextureDepthFormat.DEPTHSTENCIL_NONE;

        let finalTex: RenderTexture = RenderTexture.createFromPool(width, height, textureFormat, depthFormat);

        let shader: Shader3D = this._shader;
        let shaderData: ShaderData = this._shaderData;
        this.setUniform(camera);
        //depthTexture;
        //depthNormalTexture;
        cmd.blitScreenTriangle(null, finalTex, null, shader, shaderData, 0);
        //context.source = finalTex;
        let blurTex:RenderTexture = RenderTexture.createFromPool(width, height, textureFormat, depthFormat);
        //blur horizontal
        cmd.blitScreenTriangle(finalTex,blurTex,null,this._aoBlurHorizontalShader,shaderData,0);
        //blur Vec
        cmd.setShaderDataVector2(shaderData,ScalableAO.BlurDelty,ScalableAO.deltyVector);
        cmd.blitScreenTriangle(blurTex,finalTex,null,this._aoBlurHorizontalShader,this._shaderData,0);
        //blur Composition
        cmd.setShaderDataTexture(shaderData,ScalableAO.aoTexture,finalTex);
        cmd.blitScreenTriangle(null,blurTex,null,this._aoComposition,this._shaderData,0);
        context.source = blurTex;
        context.deferredReleaseTextures.push(finalTex);
        context.deferredReleaseTextures.push(blurTex);
    }

}