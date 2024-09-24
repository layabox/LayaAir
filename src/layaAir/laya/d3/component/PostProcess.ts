import { Texture2D } from "../../resource/Texture2D"
import { Camera } from "../core/Camera"
import { CommandBuffer } from "../core/render/command/CommandBuffer"
import { PostProcessEffect } from "../core/render/PostProcessEffect"
import { PostProcessRenderContext } from "../core/render/PostProcessRenderContext"
import { RenderContext3D } from "../core/render/RenderContext3D"
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D"
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat"
import { DepthTextureMode, RenderTexture } from "../../resource/RenderTexture"
import { ColorGradEffect } from "../core/render/PostEffect/ColorGradEffect"
import { LayaGL } from "../../layagl/LayaGL"
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine"
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData"
import { Vector4 } from "../../maths/Vector4"
import { Viewport } from "../../maths/Viewport"

/**
 * @en The `PostProcess` class is used to create post-processing components.
 * @zh `PostProcess` 类用于创建后期处理组件。
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
    private _compositeShaderData: ShaderData = LayaGL.renderDeviceFactory.createShaderData(null);

    /**@internal */
    private _effects: PostProcessEffect[] = [];

    /**@internal */
    private _enable: boolean = true;

    /**@internal */
    private _depthtextureFlag: DepthTextureMode;
    /**
     * @internal 
     * @en Color Effect
     * @zh 调色Effect
     */
    _ColorGradEffect: ColorGradEffect;
    /**
     * @internal
     * @en Whether to enable the color effect.
     * @zh 是否开启调色Effect
     */
    _enableColorGrad: boolean = false;

    /**@internal */
    _context: PostProcessRenderContext;

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
     * @en Add a post-process effect.
     * @zh 构造方法，添加后期处理效果。
     */
    constructor() {
        this._context = new PostProcessRenderContext();
        this._context.compositeShaderData = this._compositeShaderData;
        this._context.command = new CommandBuffer();
        this._depthtextureFlag = 0;
    }

    /**
     * @en The enable property of the post-process.
     * @zh 启用后期处理。
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
     * @en Set the array of post-process effects.IDE main
     * @zh 设置后期处理效果数组。
     */
    get effects(): PostProcessEffect[] {
        return this._effects;
    }

    set effects(value: PostProcessEffect[]) {
        this.clearEffect();
        for (var i = 0, n = value.length; i < n; i++) {
            if (value[i])
                this.addEffect(value[i]);
        }
    }


    /**
     * @en The camera depth texture mode required for post-processing.
     * @zh 后期处理所需的相机深度纹理模式。
     */
    get cameraDepthTextureMode() {
        return this._depthtextureFlag;
    }

    /**
     *@internal
     */
    _init(camera: Camera): void {
        this._context.camera = camera;
        this._context.command!._camera = camera;
    }

    /**
     * @internal
     */
    _render(camera: Camera): void {
        this._init(camera);

        let context = this._context;

        var camera = context.camera;
        var viewport: Viewport = camera.viewport;
        var internalRT = camera._needInternalRenderTexture();
        var cameraTarget: RenderTexture = !internalRT ? RenderTexture.createFromPool(camera._offScreenRenderTexture.width, camera._offScreenRenderTexture.height, camera._getRenderTextureFormat(), RenderTargetFormat.None, false, 1, false, true) : camera._internalRenderTexture;
        var screenTexture: RenderTexture = RenderTexture.createFromPool(cameraTarget.width, cameraTarget.height, camera._getRenderTextureFormat(), RenderTargetFormat.None, false, 1, false, true);
        var Indirect: RenderTexture[] = [RenderTexture.createFromPool(cameraTarget.width, cameraTarget.height, camera._getRenderTextureFormat(), RenderTargetFormat.None, false, 1, false, true), RenderTexture.createFromPool(cameraTarget.width, cameraTarget.height, camera._getRenderTextureFormat(), RenderTargetFormat.None, false, 1, false, true)];
        //var screenTexture: RenderTexture = cameraTarget;
        context.command!.clear();
        context.source = screenTexture;
        context.indirectTarget = screenTexture;
        context.destination = this._effects.length == 2 ? Indirect[0] : cameraTarget;
        context.compositeShaderData!.clearDefine();

        if (internalRT) {
            context.command.blitScreenTriangle(camera._internalRenderTexture, screenTexture);
        }
        else {
            context.command.blitScreenTriangle(camera._offScreenRenderTexture, screenTexture);
        }

        context.compositeShaderData!.setTexture(PostProcess.SHADERVALUE_AUTOEXPOSURETEX, Texture2D.whiteTexture);//TODO:
        if (this._enableColorGrad) {
            this._ColorGradEffect._buildLUT();
        }
        for (var i: number = 0, n: number = this._effects.length; i < n; i++) {
            if (this._effects[i].active) {
                this._effects[i].render(context);
                if (i == n - 2) {//last effect:destination RenderTexture is CameraTarget
                    context.indirectTarget = context.destination;
                    context.destination = cameraTarget;
                } else {
                    context.indirectTarget = context.destination;
                    context.destination = Indirect[(i + 1) % 2];
                }
            } else if (i == n - 1) {//兼容最后一个Effect Active为false
                context.command.blitScreenTriangle(context.indirectTarget, cameraTarget);
            }
        }

        this._compositeShaderData.addDefine(PostProcess.SHADERDEFINE_FINALPASS);

        if (camera._offScreenRenderTexture) {
            if (internalRT) {
                context.destination = camera._offScreenRenderTexture;
                var canvasWidth: number = camera._getCanvasWidth(), canvasHeight: number = camera._getCanvasHeight();
                if (LayaGL.renderEngine._screenInvertY) {
                    camera._screenOffsetScale.setValue(viewport.x / canvasWidth, viewport.y / canvasHeight, viewport.width / canvasWidth, viewport.height / canvasHeight);
                }
                else {
                    camera._screenOffsetScale.setValue(viewport.x / canvasWidth, 1.0 - viewport.y / canvasHeight, viewport.width / canvasWidth, -viewport.height / canvasHeight);
                }
                context.command!.blitScreenTriangle(cameraTarget, camera._offScreenRenderTexture, camera._screenOffsetScale, null, this._compositeShaderData, 0);
            }
        }

        //释放临时纹理
        if (internalRT) RenderTexture.recoverToPool(cameraTarget);
        RenderTexture.recoverToPool(screenTexture);
        RenderTexture.recoverToPool(Indirect[0]);
        RenderTexture.recoverToPool(Indirect[1]);
        var tempRenderTextures: RenderTexture[] = context.deferredReleaseTextures;
        for (i = 0, n = tempRenderTextures.length; i < n; i++)
            RenderTexture.recoverToPool(tempRenderTextures[i]);
        tempRenderTextures.length = 0;
    }

    /**
     * @en Add a post-processing effect.
     * @param effect The post-processing effect to add.
     * @zh 添加后期处理效果。
     * @param effect 后期处理效果
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
     * @en Get a post-processing instance based on its type.
     * @param classReg The registered post-processing class type.
     * @returns The post-processing effect instance, or null if not found.
     * @zh 根据类型获取后期处理实例。
     * @param classReg 注册的后期处理类型
     * @returns 后期处理效果实例，如果没有找到则返回null
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
     * @en Remove a post-processing effect.
     * @param effect The post-processing effect to remove.
     * @zh 移除后期处理效果。
     * @param effect 后期处理效果
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
     * @en Clear all post-processing effects.
     * @zh 清理所有后期处理效果。
     */
    clearEffect(): void {
        let i = this.effects.length - 1;
        for (; i >= 0; i--) {
            this.removeEffect(this.effects[i]);
        }
        this._effects.length = 0;
    }

    /**
     * @internal
     * @en Call the instruction set.
     * @zh 调用指令集。
     */
    _applyPostProcessCommandBuffers(): void {
        this._context.command!._apply();
    }
}


