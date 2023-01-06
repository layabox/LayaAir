

import BlitScreenVS from "../../../shader/postprocess/BlitScreen.vs";
import FragAO from "../../../shader/files/postProcess/ScalableAO/FragAO.fs";
import AoBlurHorizontal from "../../../shader/files/postProcess/ScalableAO/AoBlurHorizontal.fs";
import AOComposition from "../../../shader/files/postProcess/ScalableAO/AOComposition.fs";
import AmbientOcclusion from "../../../shader/files/postProcess/ScalableAO/AmbientOcclusion.glsl";
import { LayaGL } from "../../../../layagl/LayaGL";
import { RenderTargetFormat } from "../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WrapMode } from "../../../../RenderEngine/RenderEnum/WrapMode";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType, ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { DepthTextureMode } from "../../../depthMap/DepthPass";
import { Viewport } from "../../../math/Viewport";
import { Camera } from "../../Camera";
import { CommandBuffer } from "../command/CommandBuffer";
import { PostProcessEffect } from "../PostProcessEffect";
import { PostProcessRenderContext } from "../PostProcessRenderContext";
import { BaseCamera } from "../../BaseCamera";
import { ShaderDefine } from "../../../../RenderEngine/RenderShader/ShaderDefine";
import { Color } from "../../../../maths/Color";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../../../RenderEngine/RenderShader/VertexMesh";

/**
 * AO质量
 */
export enum AOQUALITY{
    /**高 */
    High,
    /**中 */
    MEDIUM,
    /**低 */
    LOWEST
}

/**
 * <code>BloomEffect</code> 类用于创建环境光遮罩效果。
 */
export class ScalableAO extends PostProcessEffect {

    /**@internal */
    static SHADERDEFINE_AOHigh: ShaderDefine;

    /**@internal */
    static SHADERDEFINE_AOMEDIUM: ShaderDefine;

    /**@internal */
    static SHADERDEFINE_LOWEST: ShaderDefine;

    /**@internal */
    static BlurDelty: number;

    /**@internal */
    static AOColor: number;

    /**@internal */
    static aoTexture: number;

    /**@internal */
    static AOParams: number;

    /**@internal */
    static SourceTex: number;

    /**@internal */
    static deltyHorizontal: Vector2 = new Vector2(1.0, 0.0);

    /**@internal */
    static deltyVector: Vector2 = new Vector2(0.0, 1.0);

    /**
     * scaleAO resource init
     */
    static init() {
        ScalableAO.BlurDelty = Shader3D.propertyNameToID("u_Delty");
        ScalableAO.AOColor = Shader3D.propertyNameToID("u_AOColor");
        ScalableAO.aoTexture = Shader3D.propertyNameToID("u_compositionAoTexture");

        ScalableAO.AOParams = Shader3D.propertyNameToID('u_AOParams');
        ScalableAO.SourceTex = Shader3D.propertyNameToID('u_SourceTex');
        ScalableAO.SHADERDEFINE_AOHigh =Shader3D.getDefineByName("AO_High");
        ScalableAO.SHADERDEFINE_AOMEDIUM =Shader3D.getDefineByName("AO_MEDIUM");
        ScalableAO.SHADERDEFINE_LOWEST =Shader3D.getDefineByName("AO_LOWEST");
        Shader3D.addInclude("AmbientOcclusion.glsl", AmbientOcclusion);
        //scalableAoShader
        let attributeMap: any = {
            'a_PositionTexcoord': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };
        let uniformMap: any = {
            'u_OffsetScale': ShaderDataType.Vector4,
            'u_MainTex': ShaderDataType.Texture2D,
            'u_MainTex_TexelSize': ShaderDataType.Vector4,
            'u_Delty': ShaderDataType.Vector2,
            'u_PlugTime': ShaderDataType.Vector4,
            'u_AOParams': ShaderDataType.Vector4,
            'u_BlurVector': ShaderDataType.Vector2,
            'u_AOColor': ShaderDataType.Color,
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

    /*@internal scalable AO shader*/
    private _shader: Shader3D;

    /**@internal shader data */
    private _shaderData: ShaderData;

    /*@internal blurHorizontal Ao Shader */
    private _aoBlurHorizontalShader: Shader3D;

    /**@internal */
    private _aoComposition: Shader3D;

    /**@internal */
    private _aoParams: Vector3 = new Vector3();

    private _aoQuality:AOQUALITY = AOQUALITY.MEDIUM;

    /**
     * 实例化一个AO效果类
     */
    constructor() {
        super();
        this._shader = Shader3D.find("ScalableAO");
        this._shaderData = LayaGL.renderOBJCreate.createShaderData(null);
        this._aoParams = new Vector3(0.12, 0.15, 1);
        this._shaderData.setVector3(ScalableAO.AOParams, this._aoParams);
        this._shaderData.setVector(BaseCamera.DEPTHZBUFFERPARAMS, new Vector4());
        this._aoBlurHorizontalShader = Shader3D.find("AOBlurHorizontal");
        this._aoComposition = Shader3D.find("AOComposition");
        this.aoQuality = AOQUALITY.MEDIUM;
    }



    /**
     * ao Color
     */
    set aoColor(value: Color) {
        this._shaderData.setColor(ScalableAO.AOColor, value);
    }

    get aoColor() {
        return this._shaderData.getColor(ScalableAO.AOColor);
    }

    /**
     * ao intensity
     */
    set intensity(value: number) {
        this._aoParams.x = value;
        this._shaderData.setVector3(ScalableAO.AOParams, this._aoParams);
    }

    get intensity() {
        return this._aoParams.x;
    }

    /**
     * ao影响半径
     */
    set radius(value: number) {
        this._aoParams.y = value;
        this._shaderData.setVector3(ScalableAO.AOParams, this._aoParams);
    }

    get radius() {
        return this._aoParams.y;
    }

    /**
     * ao质量
     */
    get aoQuality(){
        return this._aoQuality;
    }

    set aoQuality(value:AOQUALITY){
        this._aoQuality = value;
        switch(value){
            case AOQUALITY.High:
                this._shaderData.addDefine(ScalableAO.SHADERDEFINE_AOHigh);
                this._shaderData.removeDefine(ScalableAO.SHADERDEFINE_AOMEDIUM);
                this._shaderData.removeDefine(ScalableAO.SHADERDEFINE_LOWEST);
                break;
            case AOQUALITY.MEDIUM:
                this._shaderData.addDefine(ScalableAO.SHADERDEFINE_AOMEDIUM);
                this._shaderData.removeDefine(ScalableAO.SHADERDEFINE_AOHigh);
                this._shaderData.removeDefine(ScalableAO.SHADERDEFINE_LOWEST);
                break;
            case AOQUALITY.LOWEST:
                this._shaderData.addDefine(ScalableAO.SHADERDEFINE_LOWEST);
                this._shaderData.removeDefine(ScalableAO.SHADERDEFINE_AOHigh);
                this._shaderData.removeDefine(ScalableAO.SHADERDEFINE_AOMEDIUM);
                break;
        }
    }
    
    /**
     * @override
     */
    getCameraDepthTextureModeFlag() {
        return DepthTextureMode.DepthAndDepthNormals;
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