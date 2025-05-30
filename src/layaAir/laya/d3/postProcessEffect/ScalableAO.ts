
import BlitScreenVS from "../shader/postprocess/BlitScreen.vs";
import FragAO from "./shader/ScalableAO/FragAO.fs";
import AoBlurHorizontal from "./shader/ScalableAO/AoBlurHorizontal.fs";
import AOComposition from "./shader/ScalableAO/AOComposition.fs";
import AmbientOcclusion from "./shader/ScalableAO/AmbientOcclusion.glsl";
import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { ShaderDataType, ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WrapMode } from "../../RenderEngine/RenderEnum/WrapMode";
import { Shader3D, ShaderFeatureType } from "../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh";
import { DepthTextureMode, RenderTexture } from "../../resource/RenderTexture";
import { BaseCamera } from "../core/BaseCamera";
import { Camera } from "../core/Camera";
import { CommandBuffer } from "../core/render/command/CommandBuffer";
import { PostProcessEffect } from "../core/render/postProcessBase/PostProcessEffect";
import { PostProcessRenderContext } from "../core/render/postProcessBase/PostProcessRenderContext";
import { Laya } from "../../../Laya";


/**
 * @en The quality of AO.
 * @zh AO质量
 */
export enum AOQUALITY {
    /**
     * @en High quality.
     * @zh 高质量
     */
    High,
    /**
     * @en Medium quality.
     * @zh 中质量
     */
    MEDIUM,
    /**
     * @en Low quality.
     * @zh 低质量
     */
    LOWEST
}

/**
 * @en The ScalableAO class is used to create ambient occlusion effect.
 * @zh ScalableAO 类用于创建环境光遮罩效果。
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
     * @internal
     * @en ScaleAO resource init
     * @zh 初始化AO资源
     */
    static init() {
        ScalableAO.BlurDelty = Shader3D.propertyNameToID("u_Delty");
        ScalableAO.AOColor = Shader3D.propertyNameToID("u_AOColor");
        ScalableAO.aoTexture = Shader3D.propertyNameToID("u_compositionAoTexture");

        ScalableAO.AOParams = Shader3D.propertyNameToID('u_AOParams');
        ScalableAO.SourceTex = Shader3D.propertyNameToID('u_SourceTex');
        ScalableAO.SHADERDEFINE_AOHigh = Shader3D.getDefineByName("AO_High");
        ScalableAO.SHADERDEFINE_AOMEDIUM = Shader3D.getDefineByName("AO_MEDIUM");
        ScalableAO.SHADERDEFINE_LOWEST = Shader3D.getDefineByName("AO_LOWEST");
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
            'u_AOParams': ShaderDataType.Vector3,
            'u_BlurVector': ShaderDataType.Vector2,
            'u_AOColor': ShaderDataType.Color,
            'u_compositionAoTexture': ShaderDataType.Texture2D

        }
        let shader: Shader3D = Shader3D.add("ScalableAO");
        shader.shaderType = ShaderFeatureType.PostProcess;
        let subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let aoPass = subShader.addShaderPass(BlitScreenVS, FragAO);
        aoPass.statefirst = true;
        aoPass.renderState.cull = RenderState.CULL_NONE;
        //BlurShader
        shader = Shader3D.add("AOBlurHorizontal");
        shader.shaderType = ShaderFeatureType.PostProcess;
        subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let blurPass = subShader.addShaderPass(BlitScreenVS, AoBlurHorizontal);
        blurPass.statefirst = true;
        blurPass.renderState.cull = RenderState.CULL_NONE;

        //Composition
        shader = Shader3D.add("AOComposition");
        shader.shaderType = ShaderFeatureType.PostProcess;
        subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let compositionPass = subShader.addShaderPass(BlitScreenVS, AOComposition);
        compositionPass.statefirst = true;
        compositionPass.renderState.cull = RenderState.CULL_NONE;
    }

    /* scalable AO shader*/
    private _shader: Shader3D;

    /** shader data */
    private _shaderData: ShaderData;

    /* blurHorizontal Ao Shader */
    private _aoBlurHorizontalShader: Shader3D;

    private _aoComposition: Shader3D;

    private _aoParams: Vector3 = new Vector3();

    private _aoQuality: AOQUALITY = AOQUALITY.MEDIUM;

    /**
     * @ignore
     * @en initializes the effect.
     * @zh 构造函数, 初始化实例。
     */
    constructor() {
        super();
        this._shader = Shader3D.find("ScalableAO");
        this._shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
        this._aoParams = new Vector3(0.12, 0.15, 1);
        this._shaderData.setVector3(ScalableAO.AOParams, this._aoParams);
        this._shaderData.setVector(BaseCamera.DEPTHZBUFFERPARAMS, new Vector4());
        this._aoBlurHorizontalShader = Shader3D.find("AOBlurHorizontal");
        this._aoComposition = Shader3D.find("AOComposition");
        this.aoQuality = AOQUALITY.MEDIUM;
    }


    /**
     * @en The color of ambient occlusion.
     * @zh 环境光遮挡的颜色
     */
    get aoColor() {
        return this._shaderData.getColor(ScalableAO.AOColor);
    }

    set aoColor(value: Color) {
        this._shaderData.setColor(ScalableAO.AOColor, value);
    }


    /**
     * @en The intensity of ambient occlusion.
     * @zh 环境光遮挡的强度
     */
    get intensity() {
        return this._aoParams.x;
    }

    set intensity(value: number) {
        this._aoParams.x = value;
        this._shaderData.setVector3(ScalableAO.AOParams, this._aoParams);
    }


    /**
     * @en The influence radius of ambient occlusion.
     * @zh 环境光遮挡的影响半径
     */
    get radius() {
        return this._aoParams.y;
    }

    set radius(value: number) {
        this._aoParams.y = value;
        this._shaderData.setVector3(ScalableAO.AOParams, this._aoParams);
    }


    /**
     * @en The quality of ambient occlusion.
     * @zh 环境光遮挡的质量
     */
    get aoQuality() {
        return this._aoQuality;
    }

    set aoQuality(value: AOQUALITY) {
        this._aoQuality = value;
        switch (value) {
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
     * @en Get the camera depth texture mode flag.
     * @zh 获取相机深度纹理模式标志。
     */
    getCameraDepthTextureModeFlag() {
        return DepthTextureMode.DepthAndDepthNormals;
    }

    /**
     * @en Render the ambient occlusion effect.
     * @param context The post-process render context.
     * @zh 渲染环境光遮挡效果。
     * @param context 后处理渲染上下文。
     */
    render(context: PostProcessRenderContext): void {
        let cmd: CommandBuffer = context.command;
        let viewport = context.camera.viewport;
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
        cmd.blitScreenTriangle(context.source, finalTex, null, shader, shaderData, 0);
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

Laya.addInitCallback(() => ScalableAO.init());