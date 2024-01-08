import FullScreenVert from "../../../shader/files/postProcess/GaussianDoF/FullScreenVert.vs";
import CoCFS from "../../../shader/files/postProcess/GaussianDoF/CoC.fs";
import PrefilterFS from "../../../shader/files/postProcess/GaussianDoF/Prefilter.fs";
import BlurVFS from "../../../shader/files/postProcess/GaussianDoF/BlurV.fs";
import BlurHFS from "../../../shader/files/postProcess/GaussianDoF/BlurH.fs";
import CompositeFS from "../../../shader/files/postProcess/GaussianDoF/Composite.fs";
import { Camera } from "../../../core/Camera";
import { CommandBuffer } from "../../../core/render/command/CommandBuffer";
import { PostProcessEffect } from "../../../core/render/PostProcessEffect";
import { PostProcessRenderContext } from "../../../core/render/PostProcessRenderContext";
import { FilterMode } from "../../../../RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataType } from "../../../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../../../RenderEngine/RenderShader/ShaderDefine";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../../../RenderEngine/RenderShader/VertexMesh";
import { LayaGL } from "../../../../layagl/LayaGL";
import { DepthTextureMode } from "../../../RenderDriverLayer/Render3DProcess/IForwardAddClusterRP";

/**
 *  <code>BloomEffect</code> 类用于创建环境光遮罩效果。
 *  Gaussian DoF
 *  * 只支持 远景模糊
 *  - start: 开始远景模糊的深度
 *  - end: 达到最大模糊半径的远景深度
 *  - maxRadius: 远景模糊最大半径
 */
export class GaussianDoF extends PostProcessEffect {
    /**@internal */
    static SOURCESIZE: number;

    /**@internal */
    static ZBUFFERPARAMS: number;

    /**@internal */
    static COCPARAMS: number;

    /**@internal */
    static DEPTHTEXTURE: number;

    /**@internal */
    static NORMALDEPTHTEXTURE: number;

    /**@internal */
    static FULLCOCTEXTURE: number;

    /**@internal */
    static DOWNSAMPLESCALE: number;

    /**@internal */
    static BLURCOCTEXTURE: number;

    /**@internal */
    static SHADERDEFINE_DEPTHNORMALTEXTURE: ShaderDefine;

    /**
     * GaussianDOF resource init
     */
    static init() {
        GaussianDoF.SOURCESIZE = Shader3D.propertyNameToID("u_SourceSize");
        GaussianDoF.ZBUFFERPARAMS = Shader3D.propertyNameToID("u_ZBufferParams");
        GaussianDoF.COCPARAMS = Shader3D.propertyNameToID("u_CoCParams");
        GaussianDoF.DEPTHTEXTURE = Shader3D.propertyNameToID("u_CameraDepthTexture");
        GaussianDoF.NORMALDEPTHTEXTURE = Shader3D.propertyNameToID("u_CameraDepthNormalTexture");
        GaussianDoF.FULLCOCTEXTURE = Shader3D.propertyNameToID("u_FullCoCTex");
        GaussianDoF.DOWNSAMPLESCALE = Shader3D.propertyNameToID("u_DownSampleScale");
        GaussianDoF.BLURCOCTEXTURE = Shader3D.propertyNameToID("u_BlurCoCTex");
        GaussianDoF.SHADERDEFINE_DEPTHNORMALTEXTURE = Shader3D.getDefineByName("CAMERA_NORMALDEPTH");

        let attributeMap: any = {
            'a_PositionTexcoord': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4],
        };

        let uniformMap: any = {
            "u_MainTex": ShaderDataType.Texture2D,
            "u_MainTex_TexelSize": ShaderDataType.Vector4,
            "u_OffsetScale": ShaderDataType.Vector4,
            "u_ZBufferParams": ShaderDataType.Vector4,
            "u_CoCParams": ShaderDataType.Vector3,
            "u_FullCoCTex": ShaderDataType.Texture2D,
            "u_SourceSize": ShaderDataType.Vector4,
            "u_DownSampleScale": ShaderDataType.Vector4,
            "u_BlurCoCTex": ShaderDataType.Texture2D,
        };
        let shader: Shader3D = Shader3D.add("GaussianDoF");

        /**
         * CoC pass
         * 根据 FarStart 与 FarEnd， 将深度值映射到 0 - 1
         * 
         * Camera nearPlane---------FarStart---------FarEnd---------Camera farplane
         *       0         ---------   0    ---------   1  ---------      1
         */
        let cocSubShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(cocSubShader);
        cocSubShader.addShaderPass(FullScreenVert, CoCFS);

        /**
         * Prefilter pass
         * 
         */
        let prefilterSubShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(prefilterSubShader);
        prefilterSubShader.addShaderPass(FullScreenVert, PrefilterFS);

        // blur
        /**
         * blurH pass
         */
        let blurHSubShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(blurHSubShader);
        blurHSubShader.addShaderPass(FullScreenVert, BlurHFS);

        /**
         * blurV pass
         */
        let blurVSubShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(blurVSubShader);
        blurVSubShader.addShaderPass(FullScreenVert, BlurVFS);

        /**
         * Composite pass
         */
        let compositeSubShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(compositeSubShader);
        compositeSubShader.addShaderPass(FullScreenVert, CompositeFS);

    }

    /**@internal */
    private _shader: Shader3D;

    /**@internal */
    private _shaderData: ShaderData;

    /**@internal */
    private _zBufferParams: Vector4;

    /**@internal */
    private _sourceSize: Vector4;

    /**@internal */
    private _dowmSampleScale: Vector4;

    /**
     * 实例化一个高斯DOF效果类
     */
    constructor() {
        super();
        this._shader = Shader3D.find("GaussianDoF");
        this._shaderData = LayaGL.renderOBJCreate.createShaderData(null);
        this._shaderData.setVector3(GaussianDoF.COCPARAMS, new Vector3(10, 30, 1));
        this._zBufferParams = new Vector4();
        this._sourceSize = new Vector4();
        this._dowmSampleScale = new Vector4();
    }

    /**
     * 开始远景模糊的深度
     */
    set farStart(value: number) {
        let cocParams: Vector3 = this._shaderData.getVector3(GaussianDoF.COCPARAMS);
        cocParams.x = value;
        this._shaderData.setVector3(GaussianDoF.COCPARAMS, cocParams);
    }

    get farStart(): number {
        return this._shaderData.getVector3(GaussianDoF.COCPARAMS).x;
    }

    /**
     * 达到最大模糊半径的远景深度
     */
    set farEnd(value: number) {
        let cocParams: Vector3 = this._shaderData.getVector3(GaussianDoF.COCPARAMS);
        cocParams.y = Math.max(cocParams.x, value);
        this._shaderData.setVector3(GaussianDoF.COCPARAMS, cocParams);
    }

    get farEnd(): number {
        return this._shaderData.getVector3(GaussianDoF.COCPARAMS).y;
    }

    /**
     * 最大模糊半径
     */
    set maxRadius(value: number) {
        let cocParams: Vector3 = this._shaderData.getVector3(GaussianDoF.COCPARAMS);
        cocParams.z = Math.min(value, 2);
        this._shaderData.setVector3(GaussianDoF.COCPARAMS, cocParams);
    }

    get maxRadius(): number {
        return this._shaderData.getVector3(GaussianDoF.COCPARAMS).z;
    }

    /**
     * @internal
     * @param context 
     */
    private _setupShaderValue(context: PostProcessRenderContext): void {
        let camera: Camera = context.camera;
        this._dowmSampleScale.setValue(0.5, 0.5, 2.0, 2.0);
        this._shaderData.setVector(GaussianDoF.DOWNSAMPLESCALE, this._dowmSampleScale);
        let far = camera.farPlane;
        let near = camera.nearPlane;
        this._zBufferParams.setValue(1.0 - far / near, far / near, (near - far) / (near * far), 1 / near);
        this._shaderData.setVector(GaussianDoF.ZBUFFERPARAMS, this._zBufferParams);
    }


    /**
     * @internal
     * @override
     */
    getCameraDepthTextureModeFlag() {
        return DepthTextureMode.Depth;
    }

    /**
    * @override
    * @param context 
    */
    render(context: PostProcessRenderContext): void {
        let cmd: CommandBuffer = context.command;
        this._setupShaderValue(context);

        let source: RenderTexture = context.source;

        let shader: Shader3D = this._shader;
        let shaderData: ShaderData = this._shaderData;

        let dataTexFormat: RenderTargetFormat = RenderTargetFormat.R16G16B16A16;
        // todo fullCoC format: R16
        let fullCoC: RenderTexture = RenderTexture.createFromPool(source.width, source.height, dataTexFormat, RenderTargetFormat.None, false, 1);
        // coc pass
        cmd.blitScreenTriangle(source, fullCoC, null, shader, shaderData, 0);
        // Prefilter pass
        fullCoC.filterMode = FilterMode.Bilinear;
        this._shaderData.setTexture(GaussianDoF.FULLCOCTEXTURE, fullCoC);
        let prefilterTex: RenderTexture = RenderTexture.createFromPool(source.width / 2, source.height / 2, dataTexFormat, RenderTargetFormat.None, false, 1);
        cmd.blitScreenTriangle(source, prefilterTex, null, shader, shaderData, 1);
        // blur
        prefilterTex.filterMode = FilterMode.Bilinear;
        this._sourceSize.setValue(prefilterTex.width, prefilterTex.height, 1.0 / prefilterTex.width, 1.0 / prefilterTex.height);
        this._shaderData.setShaderData(GaussianDoF.SOURCESIZE, ShaderDataType.Vector4, this._sourceSize);
        // blur H
        let blurHTex: RenderTexture = RenderTexture.createFromPool(prefilterTex.width, prefilterTex.height, dataTexFormat, RenderTargetFormat.None, false, 1);
        cmd.blitScreenTriangle(prefilterTex, blurHTex, null, this._shader, this._shaderData, 2);
        // blur V
        let blurVTex: RenderTexture = RenderTexture.createFromPool(prefilterTex.width, prefilterTex.height, dataTexFormat, RenderTargetFormat.None, false, 1);
        cmd.blitScreenTriangle(blurHTex, blurVTex, null, this._shader, this._shaderData, 3);
        // composite
        blurVTex.filterMode = FilterMode.Bilinear;
        blurVTex.anisoLevel = 1;
        fullCoC.filterMode = FilterMode.Point;
        this._shaderData.setTexture(GaussianDoF.BLURCOCTEXTURE, blurVTex);
        let finalTex: RenderTexture = RenderTexture.createFromPool(source.width, source.height, source.colorFormat, source.depthStencilFormat, false, 1);
        cmd.blitScreenTriangle(source, context.destination, null, this._shader, this._shaderData, 4);
        //context.source = finalTex;
        // recover render texture
        RenderTexture.recoverToPool(fullCoC);
        RenderTexture.recoverToPool(prefilterTex);
        RenderTexture.recoverToPool(blurHTex);
        RenderTexture.recoverToPool(blurVTex);
        context.deferredReleaseTextures.push(finalTex);
    }
}
