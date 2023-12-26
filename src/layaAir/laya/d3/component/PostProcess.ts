import { ILaya } from "../../../ILaya"
import { Texture2D } from "../../resource/Texture2D"
import { Camera } from "../core/Camera"
import { CommandBuffer } from "../core/render/command/CommandBuffer"
import { PostProcessEffect } from "../core/render/PostProcessEffect"
import { PostProcessRenderContext } from "../core/render/PostProcessRenderContext"
import { Viewport } from "../math/Viewport"
import { RenderContext3D } from "../core/render/RenderContext3D"
import { ShaderDefine } from "../../RenderEngine/RenderShader/ShaderDefine"
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D"
import { ShaderData } from "../../RenderEngine/RenderShader/ShaderData"
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat"
import { RenderTexture } from "../../resource/RenderTexture"
import { ColorGradEffect } from "../core/render/PostEffect/ColorGradEffect"
import { LayaGL } from "../../layagl/LayaGL"
import { DepthTextureMode } from "../RenderDriverLayer/Render3DProcess/IForwardAddClusterRP"

/**
 * <code>PostProcess</code> 类用于创建后期处理组件。
 */
export class PostProcess {

    /**@internal */
    static SHADERDEFINE_BLOOM_LOW: ShaderDefine;

    /**@internal */
    static SHADERDEFINE_BLOOM: ShaderDefine;

    /**@internal */
    static SHADERDEFINE_FINALPASS: ShaderDefine;

    /**@internal */
    static SHADERVALUE_MAINTEX: number;

    /**@internal */
    static SHADERVALUE_BLOOMTEX: number;

    /**@internal */
    static SHADERVALUE_AUTOEXPOSURETEX: number;

    /**@internal */
    static SHADERVALUE_BLOOM_DIRTTEX: number;

    /**@internal */
    static SHADERVALUE_BLOOMTEX_TEXELSIZE: number;

    /**@internal */
    static SHADERVALUE_BLOOM_DIRTTILEOFFSET: number;

    /**@internal */
    static SHADERVALUE_BLOOM_SETTINGS: number;

    /**@internal */
    static SHADERVALUE_BLOOM_COLOR: number;

    /**
     * @internal
     */
    static __init__(): void {
        PostProcess.SHADERDEFINE_BLOOM_LOW = Shader3D.getDefineByName("BLOOM_LOW");
        PostProcess.SHADERDEFINE_BLOOM = Shader3D.getDefineByName("BLOOM");
        PostProcess.SHADERDEFINE_FINALPASS = Shader3D.getDefineByName("FINALPASS");
        PostProcess.SHADERVALUE_MAINTEX = Shader3D.propertyNameToID("u_MainTex");
        PostProcess.SHADERVALUE_BLOOMTEX = Shader3D.propertyNameToID("u_BloomTex");
        PostProcess.SHADERVALUE_AUTOEXPOSURETEX = Shader3D.propertyNameToID("u_AutoExposureTex");
        PostProcess.SHADERVALUE_BLOOM_DIRTTEX = Shader3D.propertyNameToID("u_Bloom_DirtTex");
        PostProcess.SHADERVALUE_BLOOMTEX_TEXELSIZE = Shader3D.propertyNameToID("u_BloomTex_TexelSize");
        PostProcess.SHADERVALUE_BLOOM_DIRTTILEOFFSET = Shader3D.propertyNameToID("u_Bloom_DirtTileOffset");
        PostProcess.SHADERVALUE_BLOOM_SETTINGS = Shader3D.propertyNameToID("u_Bloom_Settings");
        PostProcess.SHADERVALUE_BLOOM_COLOR = Shader3D.propertyNameToID("u_Bloom_Color");
    }

    /**@internal */
    private _compositeShader: Shader3D = Shader3D.find("PostProcessComposite");

    /**@internal */
    private _compositeShaderData: ShaderData = LayaGL.renderOBJCreate.createShaderData(null);

    /**@internal */
    private _effects: PostProcessEffect[] = [];

    /**@internal */
    private _enable: boolean = true;

    /**@internal */
    private _depthtextureFlag: DepthTextureMode;
    /**@internal 调色Effect*/
    _ColorGradEffect: ColorGradEffect;
    /**@internal 是否开启调色Effect*/
    _enableColorGrad: boolean = false;

    /**@internal */
    _context: PostProcessRenderContext | null = null;

    /**
     * 重新计算CameraFlag
     */
    private recaculateCameraFlag() {
        this._depthtextureFlag = DepthTextureMode.None;
        let n = this.effects.length;
        for (let i = 0; i < n; i++) {
            this._depthtextureFlag |= this.effects[i].getCameraDepthTextureModeFlag();
        }
    }

    /**
     * 创建一个 <code>PostProcess</code> 实例。
     */
    constructor() {
        this._context = new PostProcessRenderContext();
        this._context.compositeShaderData = this._compositeShaderData;
        this._context.command = new CommandBuffer();
        this._depthtextureFlag = 0;
    }

    /**
     * 开启属性
     */
    get enable(): boolean {
        return this._enable;
    }

    set enable(value: boolean) {
        this._enable = value;
    }

    /**
     * 设置渲染状态
     * @internal
     */
    set commandContext(oriContext: RenderContext3D) {
        this._context.command._context = oriContext;
    }

    /**
     * IDEmain
     * 设置后期Effect数组
     */
    set effects(value: PostProcessEffect[]) {
        this.clearEffect();
        for (var i = 0, n = value.length; i < n; i++) {
            if (value[i])
                this.addEffect(value[i]);
        }
    }

    get effects(): PostProcessEffect[] {
        return this._effects;
    }

    /**
     * 根据后期处理的需要,设置值
     */
    get cameraDepthTextureMode() {
        return this._depthtextureFlag;
    }

    /**
     *@internal
     */
    _init(camera: Camera): void {
        this._context!.camera = camera;
        this._context!.command!._camera = camera;
    }

    /**
     * @internal
     */
    _render(camera: Camera): void {
        this._init(camera);
        var camera = this._context!.camera;
        var viewport: Viewport = camera!.viewport;
        var cameraTarget: RenderTexture = camera!._internalRenderTexture;
        var screenTexture: RenderTexture = RenderTexture.createFromPool(cameraTarget.width, cameraTarget.height, camera._getRenderTextureFormat(), RenderTargetFormat.None, false, 1, false, true);
        var Indirect: RenderTexture[] = [RenderTexture.createFromPool(cameraTarget.width, cameraTarget.height, camera._getRenderTextureFormat(), RenderTargetFormat.None, false, 1, false, true), RenderTexture.createFromPool(cameraTarget.width, cameraTarget.height, camera._getRenderTextureFormat(), RenderTargetFormat.None, false, 1, false, true)];
        //var screenTexture: RenderTexture = cameraTarget;
        this._context!.command!.clear();
        this._context!.source = screenTexture;
        this._context!.indirectTarget = screenTexture;
        this._context!.destination = this._effects.length == 2 ? Indirect[0] : cameraTarget;
        this._context!.compositeShaderData!.clearDefine();

        this._context.command.blitScreenTriangle(cameraTarget, screenTexture);

        this._context!.compositeShaderData!.setTexture(PostProcess.SHADERVALUE_AUTOEXPOSURETEX, Texture2D.whiteTexture);//TODO:
        if (this._enableColorGrad) {
            this._ColorGradEffect._buildLUT();
        }
        for (var i: number = 0, n: number = this._effects.length; i < n; i++) {
            if (this._effects[i].active) {
                this._effects[i].render(this._context!);
                if (i == n - 2) {//last effect:destination RenderTexture is CameraTarget
                    this._context.indirectTarget = this._context.destination;
                    this._context.destination = cameraTarget;
                } else {
                    this._context.indirectTarget = this._context.destination;
                    this._context.destination = Indirect[(i + 1) % 2];
                }
            } else if (i == n - 1) {//兼容最后一个Effect Active为false
                this._context.command.blitScreenTriangle(this._context.indirectTarget, cameraTarget);
            }
        }

        this._compositeShaderData.addDefine(PostProcess.SHADERDEFINE_FINALPASS);

        var offScreenTex: RenderTexture = camera!._offScreenRenderTexture;
        var dest = offScreenTex ? offScreenTex : null;//TODO:如果不画到RenderTarget上,最后一次为null直接画到屏幕上
        this._context!.destination = dest;
        var canvasWidth: number = camera!._getCanvasWidth(), canvasHeight: number = camera!._getCanvasHeight();
        if (dest) {
            camera!._screenOffsetScale.setValue(viewport.x / canvasWidth, (canvasHeight - viewport.y - viewport.height) / canvasHeight, viewport.width / canvasWidth, viewport.height / canvasHeight);
            this._context!.command!.blitScreenTriangle(cameraTarget, dest, camera!._screenOffsetScale, null, this._compositeShaderData, 0);
        }

        //释放临时纹理
        RenderTexture.recoverToPool(screenTexture);
        RenderTexture.recoverToPool(Indirect[0]);
        RenderTexture.recoverToPool(Indirect[1]);
        var tempRenderTextures: RenderTexture[] = this._context!.deferredReleaseTextures;
        for (i = 0, n = tempRenderTextures.length; i < n; i++)
            RenderTexture.recoverToPool(tempRenderTextures[i]);
        tempRenderTextures.length = 0;
    }

    /**
     * 添加后期处理效果。
     */
    addEffect(effect: PostProcessEffect): void {
        if (effect.singleton && this.getEffect((effect as any).constructor)) {
            console.error("无法增加已经存在的Effect");
            return;
        }
        if (!this._enableColorGrad || effect instanceof ColorGradEffect) {
            this._effects.push(effect);
        } else {
            this._effects.splice(this._effects.length - 1, 0, effect);
        }

        this.recaculateCameraFlag();
        effect.effectInit(this);
    }

    /**
     * 根据类型获得后期处理实例
     * @param classReg 
     * @returns 
     */
    getEffect(classReg: any): any {
        let size: number = this._effects.length;
        for (let i = 0; i < size; i++) {
            let element = this._effects[i];
            if (element instanceof classReg) {
                return element;
            }
        }
        return null
    }

    /**
     * 移除后期处理效果。
     */
    removeEffect(effect: PostProcessEffect): void {
        var index: number = this._effects.indexOf(effect);
        if (index !== -1) {
            this._effects.splice(index, 1);
            effect.release(this);
            this.recaculateCameraFlag();
        }
    }

    /**
     * 清理所有后期处理
     */
    clearEffect(): void {
        let i = this.effects.length - 1;
        for (; i >= 0; i--) {
            this.removeEffect(this.effects[i]);
        }
    }

    /**
     * 调用指令集
     * @internal
     */
    _applyPostProcessCommandBuffers(): void {
        this._context!.command!._apply();
    }
}


