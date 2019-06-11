import { PostProcessRenderContext } from "../core/render/PostProcessRenderContext";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { RenderTexture } from "../resource/RenderTexture";
import { Shader3D } from "../shader/Shader3D";
import { ShaderData } from "../shader/ShaderData";
import { ShaderDefines } from "../shader/ShaderDefines";
import { BaseTexture } from "laya/resource/BaseTexture";
import { Texture2D } from "laya/resource/Texture2D";
/**
 * <code>PostProcess</code> 类用于创建后期处理组件。
 */
export class PostProcess {
    /**
     * 创建一个 <code>PostProcess</code> 实例。
     */
    constructor() {
        /**@private */
        this._compositeShader = Shader3D.find("PostProcessComposite");
        /**@private */
        this._compositeShaderData = new ShaderData();
        /**@private */
        this._context = null;
        /**@private */
        this._effects = [];
        this._context = new PostProcessRenderContext();
        this._context.compositeShaderData = this._compositeShaderData;
    }
    /**
     * @private
     */
    static __init__() {
        PostProcess.SHADERDEFINE_BLOOM_LOW = PostProcess.shaderDefines.registerDefine("BLOOM_LOW");
        PostProcess.SHADERDEFINE_BLOOM = PostProcess.shaderDefines.registerDefine("BLOOM");
        PostProcess.SHADERDEFINE_FINALPASS = PostProcess.shaderDefines.registerDefine("FINALPASS");
    }
    /**
     *@private
     */
    _init(camera, command) {
        this._context.camera = camera;
        this._context.command = command;
    }
    /**
     * @private
     */
    _render() {
        var camera = this._context.camera;
        var screenTexture = RenderTexture.createFromPool(RenderContext3D.clientWidth, RenderContext3D.clientHeight, camera._getRenderTextureFormat(), BaseTexture.FORMAT_DEPTHSTENCIL_NONE);
        var cameraTarget = camera._renderTexture;
        this._context.command.clear();
        this._context.source = screenTexture;
        this._context.destination = cameraTarget;
        this._context.compositeShaderData.clearDefine();
        this._context.command.blitScreenTriangle(cameraTarget, screenTexture);
        this._context.compositeShaderData.setTexture(PostProcess.SHADERVALUE_AUTOEXPOSURETEX, Texture2D.whiteTexture); //TODO:
        for (var i = 0, n = this._effects.length; i < n; i++)
            this._effects[i].render(this._context);
        this._compositeShaderData.addDefine(PostProcess.SHADERDEFINE_FINALPASS);
        //dithering.Render(context);
        var offScreenTexture = camera.renderTarget;
        var dest = offScreenTexture ? offScreenTexture : null; //TODO:如果不画到RenderTarget上,最后一次为null直接画到屏幕上
        this._context.destination = dest;
        this._context.command.blitScreenTriangle(this._context.source, dest, this._compositeShader, this._compositeShaderData);
        //context.source = context.destination;
        //context.destination = finalDestination;
        //释放临时纹理
        RenderTexture.recoverToPool(screenTexture);
        var tempRenderTextures = this._context.deferredReleaseTextures;
        for (i = 0, n = tempRenderTextures.length; i < n; i++)
            RenderTexture.recoverToPool(tempRenderTextures[i]);
        tempRenderTextures.length = 0;
    }
    /**
     * 添加后期处理效果。
     */
    addEffect(effect) {
        this._effects.push(effect);
    }
    /**
     * 移除后期处理效果。
     */
    removeEffect(effect) {
        var index = this._effects.indexOf(effect);
        if (index !== -1)
            this._effects.splice(index, 1);
    }
}
/**@private */
PostProcess.SHADERVALUE_MAINTEX = Shader3D.propertyNameToID("u_MainTex");
/**@private */
PostProcess.SHADERVALUE_BLOOMTEX = Shader3D.propertyNameToID("u_BloomTex");
/**@private */
PostProcess.SHADERVALUE_AUTOEXPOSURETEX = Shader3D.propertyNameToID("u_AutoExposureTex");
/**@private */
PostProcess.SHADERVALUE_BLOOM_DIRTTEX = Shader3D.propertyNameToID("u_Bloom_DirtTex");
/**@private */
PostProcess.SHADERVALUE_BLOOMTEX_TEXELSIZE = Shader3D.propertyNameToID("u_BloomTex_TexelSize");
/**@private */
PostProcess.SHADERVALUE_BLOOM_DIRTTILEOFFSET = Shader3D.propertyNameToID("u_Bloom_DirtTileOffset");
/**@private */
PostProcess.SHADERVALUE_BLOOM_SETTINGS = Shader3D.propertyNameToID("u_Bloom_Settings");
/**@private */
PostProcess.SHADERVALUE_BLOOM_COLOR = Shader3D.propertyNameToID("u_Bloom_Color");
/**@private */
PostProcess.shaderDefines = new ShaderDefines();
