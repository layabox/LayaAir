import { Camera } from "laya/d3/core/Camera";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { PostProcessEffect } from "laya/d3/core/render/PostProcessEffect";
import { PostProcessRenderContext } from "laya/d3/core/render/PostProcessRenderContext";
import { DepthTextureMode } from "laya/d3/depthMap/DepthPass";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Viewport } from "laya/d3/math/Viewport";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderData } from "laya/d3/shader/ShaderData";
import { ShaderPass } from "laya/d3/shader/ShaderPass";
import { SubShader } from "laya/d3/shader/SubShader";
import { Vector4 } from "laya/d3/math/Vector4";
import { Vector3 } from "laya/d3/math/Vector3";
import { RenderTextureDepthFormat, RenderTextureFormat } from "laya/resource/RenderTextureFormat";
import { FilterMode } from "laya/resource/FilterMode";
import { ShaderDefine } from "laya/d3/shader/ShaderDefine";

import FullScreenVert from "./Shader/FullScreenVert.vs";
import CoCFS from "./Shader/CoC.fs";
import PrefilterFS from "./Shader/Prefilter.fs";
import BlurVFS from "./Shader/BlurV.fs";
import BlurHFS from "./Shader/BlurH.fs";
import CompositeFS from "./Shader/Composite.fs";


/**
 *  Gaussian DoF
 *  * 只支持 远景模糊
 *  - start: 开始远景模糊的深度
 *  - end: 达到最大模糊半径的远景深度
 *  - maxRadius: 远景模糊最大半径
 */
export class GaussianDoF extends PostProcessEffect {

    private _shader: Shader3D;

    private _shaderData: ShaderData;

    private _zBufferParams: Vector4;
    private _sourceSize: Vector4;
    private _dowmSampleScale: Vector4;

    static SOURCESIZE: number = Shader3D.propertyNameToID("u_SourceSize");
    static ZBUFFERPARAMS: number = Shader3D.propertyNameToID("u_ZBufferParams");
    static COCPARAMS: number = Shader3D.propertyNameToID("u_CoCParams");
    static DEPTHTEXTURE: number = Shader3D.propertyNameToID("u_CameraDepthTexture");
    static NORMALDEPTHTEXTURE: number = Shader3D.propertyNameToID("u_CameraDepthNormalTexture");
    static FULLCOCTEXTURE: number = Shader3D.propertyNameToID("u_FullCoCTex");
    static DOWNSAMPLESCALE: number = Shader3D.propertyNameToID("u_DownSampleScale");
    static BLURCOCTEXTURE: number = Shader3D.propertyNameToID("u_BlurCoCTex");

    static SHADERDEFINE_DEPTHNORMALTEXTURE: ShaderDefine;

    static __init__() {

        GaussianDoF.SHADERDEFINE_DEPTHNORMALTEXTURE = Shader3D.getDefineByName("CAMERA_NORMALDEPTH");

        let attributeMap: any = {
            'a_PositionTexcoord': VertexMesh.MESH_POSITION0
        };
        let uniformMap: any = {
            'u_MainTex': Shader3D.PERIOD_MATERIAL,
            'u_OffsetScale': Shader3D.PERIOD_MATERIAL,
            'u_ZBufferParams': Shader3D.PERIOD_MATERIAL,
            'u_CoCParams': Shader3D.PERIOD_MATERIAL,
            'u_CameraDepthTexture': Shader3D.PERIOD_MATERIAL,
            'u_CameraDepthNormalTexture': Shader3D.PERIOD_MATERIAL,
            'u_FullCoCTex': Shader3D.PERIOD_MATERIAL,
            'u_SourceSize': Shader3D.PERIOD_MATERIAL,
            'u_DownSampleScale': Shader3D.PERIOD_MATERIAL,
            'u_BlurCoCTex': Shader3D.PERIOD_MATERIAL,
            'u_MainTex_TexelSize': Shader3D.PERIOD_MATERIAL,
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
        let cocPass: ShaderPass = cocSubShader.addShaderPass(FullScreenVert, CoCFS);

        /**
         * Prefilter pass
         * 
         */
        let prefilterSubShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(prefilterSubShader);
        let prefilterPass: ShaderPass = prefilterSubShader.addShaderPass(FullScreenVert, PrefilterFS);

        // blur
        /**
         * blurH pass
         */
        let blurHSubShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(blurHSubShader);
        let blurHPass: ShaderPass = blurHSubShader.addShaderPass(FullScreenVert, BlurHFS);

        /**
         * blurV pass
         */
        let blurVSubShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(blurVSubShader);
        let blurVPass: ShaderPass = blurVSubShader.addShaderPass(FullScreenVert, BlurVFS);

        /**
         * Composite pass
         */
        let compositeSubShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(compositeSubShader);
        let compositePass: ShaderPass = compositeSubShader.addShaderPass(FullScreenVert, CompositeFS);

    }

    constructor() {
        GaussianDoF.__init__();
        super();
        this._shader = Shader3D.find("GaussianDoF");
        this._shaderData = new ShaderData();
        this._shaderData.setVector3(GaussianDoF.COCPARAMS, new Vector3(10, 30, 1));
        this._zBufferParams = new Vector4();
        this._sourceSize = new Vector4();
        this._dowmSampleScale = new Vector4();
    }

    set farStart(value: number) {
        let cocParams: Vector3 = this._shaderData.getVector3(GaussianDoF.COCPARAMS);
        cocParams.x = value;
        this._shaderData.setVector3(GaussianDoF.COCPARAMS, cocParams);
    }

    get farStart(): number {
        return this._shaderData.getVector3(GaussianDoF.COCPARAMS).x;
    }

    set farEnd(value: number) {
        let cocParams: Vector3 = this._shaderData.getVector3(GaussianDoF.COCPARAMS);
        cocParams.y = Math.max(cocParams.x, value);
        this._shaderData.setVector3(GaussianDoF.COCPARAMS, cocParams);
    }

    get farEnd(): number {
        return this._shaderData.getVector3(GaussianDoF.COCPARAMS).y;
    }

    set maxRadius(value: number) {
        let cocParams: Vector3 = this._shaderData.getVector3(GaussianDoF.COCPARAMS);
        cocParams.z = Math.min(value, 2);
        this._shaderData.setVector3(GaussianDoF.COCPARAMS, cocParams);
    }

    get maxRadius(): number {
        return this._shaderData.getVector3(GaussianDoF.COCPARAMS).z;
    }

    setupShaderValue(context: PostProcessRenderContext): void {
        let camera: Camera = context.camera;
        let source: RenderTexture = context.source;

        this._dowmSampleScale.setValue(0.5, 0.5, 2.0, 2.0);
        this._shaderData.setVector(GaussianDoF.DOWNSAMPLESCALE, this._dowmSampleScale);

        let far = camera.farPlane;
        let near = camera.nearPlane;
        this._zBufferParams.setValue(1.0 - far / near, far / near, (near - far) / (near * far), 1 / near);
        this._shaderData.setVector(GaussianDoF.ZBUFFERPARAMS, this._zBufferParams);

        if (camera.depthTextureMode & DepthTextureMode.Depth) {
            let depthTexture: RenderTexture = camera.depthTexture;
            this._shaderData.setTexture(GaussianDoF.DEPTHTEXTURE, depthTexture);
            this._shaderData.removeDefine(GaussianDoF.SHADERDEFINE_DEPTHNORMALTEXTURE);
        }
        else if (camera.depthTextureMode & DepthTextureMode.DepthNormals) {
            let depthNormalTexture: RenderTexture = camera.depthNormalTexture;
            this._shaderData.setTexture(GaussianDoF.NORMALDEPTHTEXTURE, depthNormalTexture);
            this._shaderData.addDefine(GaussianDoF.SHADERDEFINE_DEPTHNORMALTEXTURE);
        }
        else {
            camera.depthTextureMode |= DepthTextureMode.Depth;
        }

    }

    render(context: PostProcessRenderContext): void {
        let cmd: CommandBuffer = context.command;
        let viewport: Viewport = context.camera.viewport;
        let camera: Camera = context.camera;

        this.setupShaderValue(context);

        let source: RenderTexture = context.source;

        let shader: Shader3D = this._shader;
        let shaderData: ShaderData = this._shaderData;

        let dataTexFormat: RenderTextureFormat = RenderTextureFormat.R16G16B16A16;

        // todo fullCoC format: R16
        let fullCoC: RenderTexture = RenderTexture.createFromPool(source.width, source.height, dataTexFormat, RenderTextureDepthFormat.DEPTHSTENCIL_NONE, 1);

        // coc pass
        cmd.blitScreenTriangle(source, fullCoC, null, shader, shaderData, 0);

        // Prefilter pass
        fullCoC.filterMode = FilterMode.Bilinear;
        this._shaderData.setTexture(GaussianDoF.FULLCOCTEXTURE, fullCoC);
        let prefilterTex: RenderTexture = RenderTexture.createFromPool(source.width / 2, source.height / 2, dataTexFormat, RenderTextureDepthFormat.DEPTHSTENCIL_NONE, 1);
        cmd.blitScreenTriangle(source, prefilterTex, null, shader, shaderData, 1);

        // blur
        prefilterTex.filterMode = FilterMode.Bilinear;
        this._sourceSize.setValue(prefilterTex.width, prefilterTex.height, 1.0 / prefilterTex.width, 1.0 / prefilterTex.height);
        this._shaderData.setValueData(GaussianDoF.SOURCESIZE, this._sourceSize);

        // blur H
        let blurHTex: RenderTexture = RenderTexture.createFromPool(prefilterTex.width, prefilterTex.height, dataTexFormat, RenderTextureDepthFormat.DEPTHSTENCIL_NONE, 1);
        cmd.blitScreenTriangle(prefilterTex, blurHTex, null, this._shader, this._shaderData, 2);

        // blur V
        let blurVTex: RenderTexture = RenderTexture.createFromPool(prefilterTex.width, prefilterTex.height, dataTexFormat, RenderTextureDepthFormat.DEPTHSTENCIL_NONE, 1);
        cmd.blitScreenTriangle(blurHTex, blurVTex, null, this._shader, this._shaderData, 3);

        // composite
        blurVTex.filterMode = FilterMode.Bilinear;
        blurVTex.anisoLevel = 1;
        fullCoC.filterMode = FilterMode.Point;
        this._shaderData.setTexture(GaussianDoF.BLURCOCTEXTURE, blurVTex);
        let finalTex: RenderTexture = RenderTexture.createFromPool(source.width, source.height, source.format, source.depthStencilFormat, 1);
        cmd.blitScreenTriangle(source, finalTex, null, this._shader, this._shaderData, 4);

        context.source = finalTex;

        // recover render texture
        RenderTexture.recoverToPool(fullCoC);
        RenderTexture.recoverToPool(prefilterTex);
        RenderTexture.recoverToPool(blurHTex);
        RenderTexture.recoverToPool(blurVTex);
        context.deferredReleaseTextures.push(finalTex);

    }

}
