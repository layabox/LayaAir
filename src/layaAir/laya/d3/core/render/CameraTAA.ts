import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { RenderTexture } from "../../../resource/RenderTexture";
import { Stat } from "../../../utils/Stat";
import { TemporalAAEffect, TemporalAAQuality } from "../../postProcessEffect/TemporalAAEffect";
import { BaseCamera } from "../BaseCamera";
import { CameraClearFlags } from "../Camera";
import type { Camera, CameraOpaqueMRTOptions, CameraOpaqueMRTRequirement } from "../Camera";
import type { Scene3D } from "../scene/Scene3D";
import { PostProcess } from "./postProcessBase/PostProcess";
import { RenderContext3D } from "./RenderContext3D";
import { GBufferAttachment, GBufferLocation } from "./GBuffer";

// 颜色槽 0 为相机画面，1～3 为 GBuffer，运动矢量占槽 4。
const MOTION_VECTOR_LOCATION = GBufferLocation.MotionVectors;
const MOTION_VECTOR_ATTACHMENT = MOTION_VECTOR_LOCATION - 1;
const MOTION_VECTOR_FORMAT = RenderTargetFormat.R16G16B16A16;
const MOTION_VECTOR_REQUIREMENT: CameraOpaqueMRTRequirement = Object.freeze({
    index: MOTION_VECTOR_ATTACHMENT,
    name: GBufferAttachment.MotionVectors,
    format: MOTION_VECTOR_FORMAT,
    clearColor: Object.freeze(new Color(0, 0, 0, 0))
});
const MOTION_VECTOR_REQUIREMENTS = Object.freeze([MOTION_VECTOR_REQUIREMENT]);

/** @internal 相机独立的历史纹理与着色器参数。 */
export interface CameraTAAHistory {
    texture: RenderTexture;
    valid: boolean;
    frameIndex: number;
    preparedFrameIndex: number;
    pendingCopy: boolean;
    sourceGamma: boolean;
    resolveData: ShaderData;
    copyData: ShaderData;
    sharpenData: ShaderData;
}

interface CameraTAARegistration {
    effect: TemporalAAEffect;
    owners: Set<CameraTAA>;
    created: boolean;
}

/** 相机 TAA 设置与渲染状态。 */
export class CameraTAA {
    private static readonly _registrations = new WeakMap<PostProcess, CameraTAARegistration>();
    /** 当前使用的效果；为空时不抖动投影。 */
    effect: TemporalAAEffect = null;
    frameIndex: number = -1;
    newFrame: boolean = true;
    /** 以物理像素为单位的抖动量。 */
    readonly jitter: Vector2 = new Vector2();
    /** 未抖动的 GPU 视图投影矩阵。 */
    readonly viewProjection: Matrix4x4 = new Matrix4x4();
    readonly previousViewProjection: Matrix4x4 = new Matrix4x4();
    readonly invViewProjection: Matrix4x4 = new Matrix4x4();
    readonly renderProjection: Matrix4x4 = new Matrix4x4();
    readonly renderViewProjection: Matrix4x4 = new Matrix4x4();

    private _gpuProjection: Matrix4x4 = new Matrix4x4();
    private _lastViewProjection: Matrix4x4 = new Matrix4x4();
    private _committedFrame: number = -1;
    private readonly _descriptor = {
        width: -1, height: -1, format: RenderTargetFormat.None,
        invertY: false, viewportX: 0, viewportY: 0, outputId: -1,
        scene: null as Scene3D
    };
    private _motionOutputDefined: boolean = false;
    private _warning: string = "";
    private _motionParams: Vector4 = new Vector4(1, 0, 0, 0);
    private readonly _budgetFormats: (RenderTargetFormat | null)[] = [];
    private _enabled: boolean = false;
    private _quality: TemporalAAQuality = TemporalAAQuality.High;
    private _sharpening: number = 0;
    private _history: CameraTAAHistory = null;
    private _prepared: boolean = false;
    private _registeredPostProcess: PostProcess = null;
    private _registeredEffect: TemporalAAEffect = null;

    constructor(private _camera: Camera) {
    }

    get active(): boolean {
        return !!this.effect;
    }

    /** @internal 仅准备完成后可用于本帧 TAA。 */
    get preparedHistory(): CameraTAAHistory | null {
        return this._prepared ? this._history : null;
    }

    /** @internal 渲染结束后仍可读取的历史状态。 */
    get history(): CameraTAAHistory | null {
        return this._history;
    }

    /** 开启 TAA 时关闭 MSAA。 */
    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        value = !!value;
        if (this._enabled === value) return;
        if (value) {
            this._camera.msaa = false;
            if (!this._camera.postProcess) this._camera.postProcess = new PostProcess();
        } else {
            this._unregisterEffect();
        }
        this.resetHistory();
        this._enabled = value;
        if (value) {
            this._bindPostProcess();
        } else if (!this._prepared) {
            this.effect = null;
            this.jitter.setValue(0, 0);
            this._setDefines(false);
            this._releaseHistory();
        }
    }

    /** 混合质量，默认 High。 */
    get quality(): TemporalAAQuality {
        return this._quality;
    }

    set quality(value: TemporalAAQuality) {
        const quality = Number.isFinite(value) ? Math.min(TemporalAAQuality.VeryHigh, Math.max(TemporalAAQuality.VeryLow, value | 0)) : TemporalAAQuality.High;
        if (this._quality === quality) return;
        this._quality = quality;
        this.resetHistory();
    }

    /** RCAS 锐化强度 [0,1]；0 表示关闭。 */
    get sharpening(): number {
        return this._sharpening;
    }

    set sharpening(value: number) {
        this._sharpening = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
    }

    /** 只复制设置，历史由新相机独立生成。 */
    cloneTo(target: CameraTAA): void {
        target.quality = this.quality;
        target.sharpening = this.sharpening;
        target.enabled = this.enabled;
    }

    /** 切镜或场景跳变后清除历史。 */
    resetHistory(): void {
        if (this._history) {
            this._history.valid = false;
            this._history.pendingCopy = false;
        }
        this._committedFrame = -1;
    }

    private _getOrCreateEffect(): TemporalAAEffect {
        const postProcess = this._camera.postProcess;
        let effect = postProcess.temporalEffect;
        let registration = CameraTAA._registrations.get(postProcess);
        if (!effect) {
            effect = new TemporalAAEffect();
            postProcess.addEffect(effect);
            if (registration) {
                registration.effect = effect;
                registration.created = true;
            } else {
                registration = { effect, owners: new Set(), created: true };
            }
            CameraTAA._registrations.set(postProcess, registration);
        } else if (!registration) {
            registration = { effect, owners: new Set(), created: false };
            CameraTAA._registrations.set(postProcess, registration);
        } else if (registration.effect !== effect) {
            registration.effect = effect;
            registration.created = false;
        }
        registration.owners.add(this);
        this._registeredPostProcess = postProcess;
        return effect;
    }

    private _bindPostProcess(): void {
        const postProcess = this._camera.postProcess;
        postProcess.enable = true;
        const effect = this._getOrCreateEffect();
        effect.active = true;
        this._registeredEffect = effect;
    }

    /** @internal 更换后处理时只重绑效果，历史纹理留待下帧复用。 */
    onPostProcessChanged(): void {
        const wasPrepared = this._prepared;
        this.resetHistory();
        this._prepared = false;
        this._unregisterEffect();
        this._bindPostProcess();
        if (!wasPrepared) {
            this.effect = null;
            this.jitter.setValue(0, 0);
            this._setDefines(false);
        }
    }

    private _unregisterEffect(): void {
        this._registeredEffect = null;
        const postProcess = this._registeredPostProcess;
        this._registeredPostProcess = null;
        if (!postProcess) return;
        const registration = CameraTAA._registrations.get(postProcess);
        if (!registration) return;
        registration.owners.delete(this);
        if (registration.owners.size) return;
        if (registration.created && postProcess.temporalEffect === registration.effect)
            postProcess.removeEffect(registration.effect);
        CameraTAA._registrations.delete(postProcess);
    }

    /** 将运动矢量绑定到 MRT 槽 4。 */
    collectRequirements(requirements: readonly CameraOpaqueMRTRequirement[] | null,
        manualOptions: CameraOpaqueMRTOptions | null): readonly CameraOpaqueMRTRequirement[] | null {
        // 上次渲染未完成，不提交历史。
        if (this._prepared) {
            this._finishHistory(false);
            this.resetHistory();
        }
        this.effect = null;
        this.jitter.setValue(0, 0);
        const camera = this._camera;
        const postProcess = camera.postProcess;
        if (!this._enabled || !Stat.enablePostprocess || !postProcess?.enable
            || !this._registeredEffect?.active || postProcess.temporalEffect !== this._registeredEffect) {
            this._setDefines(false);
            this._releaseHistory();
            this._committedFrame = -1;
            return requirements;
        }
        let reason = "";
        if (camera.msaa) reason = "MSAA must be disabled";
        else if (!this._clearsColorAndDepth()) reason = "TAA requires a camera that clears its own color and depth";
        if (!reason && (!LayaGL.renderEngine.getCapable(RenderCapable.MRT)
            || !LayaGL.renderEngine.getCapable(RenderCapable.RenderTextureFormat_R16G16B16A16)))
            reason = "MRT and half-float render targets are required";
        if (!reason && (!LayaGL.renderEngine.getCapable(RenderCapable.RenderTextureFormat_Depth)
            || camera.depthTextureFormat === RenderTargetFormat.None
            || camera.depthTextureFormat === RenderTargetFormat.STENCIL_8))
            reason = "a sampleable camera depth texture is required";
        if (!reason) {
            const sourceFormat = camera._getRenderTextureFormat();
            const halfFloatSource = sourceFormat === RenderTargetFormat.R16G16B16 || sourceFormat === RenderTargetFormat.R16G16B16A16;
            const fullFloatSource = sourceFormat === RenderTargetFormat.R32G32B32 || sourceFormat === RenderTargetFormat.R32G32B32A32;
            if ((halfFloatSource && !LayaGL.renderEngine.getCapable(RenderCapable.Texture_HalfFloatLinearFiltering))
                || (fullFloatSource && !LayaGL.renderEngine.getCapable(RenderCapable.Texture_FloatLinearFiltering)))
                reason = "the camera color format requires linear texture filtering";
        }
        if (!reason && LayaGL.renderEngine.getParams(RenderParams.Max_Color_Attachment_Count) <= MOTION_VECTOR_LOCATION)
            reason = "motion vectors at location 4 require five color attachments";
        if (!reason && !this._fitsMotionBudget(requirements, manualOptions))
            reason = "the motion attachment exceeds the device color-attachment byte budget";
        if (reason) {
            this._warn(reason);
            this._setDefines(false);
            this._releaseHistory();
            this._committedFrame = -1;
            return requirements;
        }
        this.effect = this._registeredEffect;
        return requirements?.length ? [...requirements, MOTION_VECTOR_REQUIREMENT] : MOTION_VECTOR_REQUIREMENTS;
    }

    /** 准备历史矩阵，并设置本帧渲染矩阵。 */
    setupFrame(context: RenderContext3D): boolean {
        this.prepare(context);
        if (!this.active) return false;
        const camera = this._camera;
        const view = camera.viewMatrix;
        let projection = this.renderProjection;
        if (context.invertY) {
            projection.cloneTo(this._gpuProjection);
            const elements = this._gpuProjection.elements;
            for (let column = 0; column < 4; column++) elements[column * 4 + 1] *= -1;
            projection = this._gpuProjection;
        }
        Matrix4x4.multiply(projection, view, this.renderViewProjection);
        this.renderViewProjection.invert(this.invViewProjection);
        const stableViewProjection = camera.projectionViewMatrix;
        camera._shaderValues.setMatrix4x4(BaseCamera.VIEWMATRIX, view);
        camera._shaderValues.setMatrix4x4(BaseCamera.PROJECTMATRIX, projection);
        camera._shaderValues.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, this.renderViewProjection);
        context.viewMatrix = view;
        context.projectionMatrix = camera.projectionMatrix;
        context.projectionViewMatrix = stableViewProjection;
        return true;
    }

    prepare(context: RenderContext3D): void {
        const effect = this.effect;
        if (!effect) return;
        const camera = this._camera;
        const target = camera._internalRenderTexture;
        const projection = camera.projectionMatrix;
        this.frameIndex = Stat.loopCount;
        this.newFrame = this._committedFrame !== this.frameIndex;
        const descriptor = this._descriptor;
        const outputId = camera._offScreenRenderTexture?.id ?? -1;
        if (descriptor.width !== target.width || descriptor.height !== target.height
            || descriptor.format !== target.colorFormat || descriptor.invertY !== context.invertY
            || descriptor.viewportX !== camera.viewport.x || descriptor.viewportY !== camera.viewport.y
            || descriptor.outputId !== outputId || descriptor.scene !== context.scene
            || this._committedFrame < 0
            || this.frameIndex > this._committedFrame + 1) {
            this.resetHistory();
            this.newFrame = true;
        }
        descriptor.width = target.width;
        descriptor.height = target.height;
        descriptor.format = target.colorFormat;
        descriptor.invertY = context.invertY;
        descriptor.viewportX = camera.viewport.x;
        descriptor.viewportY = camera.viewport.y;
        descriptor.outputId = outputId;
        descriptor.scene = context.scene;
        this._prepareHistory(this.frameIndex);
        this._warning = "";
        // 抖动只作用于渲染矩阵，不修改相机公开的投影矩阵。
        const sequence = (this.frameIndex & 1023) + 1;
        this.jitter.setValue(CameraTAA._halton(sequence, 2) - 0.5, CameraTAA._halton(sequence, 3) - 0.5);
        this.jitterProjection(projection, this.renderProjection, context.invertY);
        projection.cloneTo(this._gpuProjection);
        if (context.invertY) {
            const elements = this._gpuProjection.elements;
            for (let column = 0; column < 4; column++) elements[column * 4 + 1] *= -1;
        }
        Matrix4x4.multiply(this._gpuProjection, camera.viewMatrix, this.viewProjection);
        if (this.newFrame) {
            if (this._committedFrame < 0) this.viewProjection.cloneTo(this.previousViewProjection);
            else this._lastViewProjection.cloneTo(this.previousViewProjection);
        }
        this._motionParams.setValue(LayaGL.renderEngine._screenInvertY ? -1 : 1, 0, 0, 0);
        camera._shaderValues.setMatrix4x4(BaseCamera.TAAVIEWPROJECTION, this.viewProjection);
        camera._shaderValues.setMatrix4x4(BaseCamera.TAAPREVIOUSVIEWPROJECTION, this.previousViewProjection);
        camera._shaderValues.setVector(BaseCamera.TAAMOTIONPARAMS, this._motionParams);
        this._setDefines(true);
    }

    /** 将相同的像素抖动应用于场景或天空投影。 */
    jitterProjection(projection: Matrix4x4, destination: Matrix4x4, invertY: boolean): Matrix4x4 {
        if (!this.active) return projection;
        projection.cloneTo(destination);
        const target = this._camera._internalRenderTexture;
        const x = 2 * this.jitter.x / target.width;
        const y = 2 * this.jitter.y / target.height
            * (LayaGL.renderEngine._screenInvertY ? -1 : 1) * (invertY ? -1 : 1);
        const elements = destination.elements;
        for (let column = 0; column < 4; column++) {
            elements[column * 4] += x * elements[column * 4 + 3];
            elements[column * 4 + 1] += y * elements[column * 4 + 3];
        }
        return destination;
    }

    beforeRender(context: RenderContext3D): void {
        const camera = this._camera;
        // 回调可能移除 TAA；保留已分配的 MRT，并撤销投影抖动。
        if (this.effect && (!this._enabled || !Stat.enablePostprocess || !camera.postProcess?.enable
            || !this.effect.active || camera.postProcess.temporalEffect !== this.effect
            || !this._prepared || camera.msaa || !this._clearsColorAndDepth())) {
            this._releaseHistory();
            this.effect = null;
            this._committedFrame = -1;
            this.jitter.setValue(0, 0);
            this._setDefines(false);
            camera._applyViewProject(camera.viewMatrix, camera.projectionMatrix, context.invertY);
            camera._contextApply(context);
            if (camera.clearFlag === CameraClearFlags.Sky) camera.skyRenderElement.renderpre(context);
        }
    }

    afterRender(success: boolean): void {
        let committed = false;
        if (this.effect) {
            committed = this._finishHistory(success);
            if (committed) {
                this.viewProjection.cloneTo(this._lastViewProjection);
                this._committedFrame = this.frameIndex;
            } else if (!success) this._committedFrame = -1;
        }
    }

    private _prepareHistory(frameIndex: number): void {
        this._prepared = false;
        const camera = this._camera;
        const target = camera._internalRenderTexture;
        if (!target || target.destroyed || target.multiSamples !== 1 || target.width < 1 || target.height < 1
            || !camera.getOpaqueAuxiliaryTexture(MOTION_VECTOR_ATTACHMENT)) {
            this.resetHistory();
            throw new Error("Camera TAA target is missing its single-sampled motion attachment.");
        }
        const format = target.colorFormat;

        let state = this._history;
        if (state && (state.texture.destroyed || state.texture.width !== target.width
            || state.texture.height !== target.height || state.texture.colorFormat !== format
            || state.sourceGamma !== target._gammaSpace)) {
            this._releaseHistory();
            state = null;
        }
        if (!state) this._history = state = this._createHistory(target, frameIndex);
        if (state.frameIndex !== frameIndex && state.frameIndex !== frameIndex - 1)
            state.valid = false;
        state.preparedFrameIndex = frameIndex;
        state.pendingCopy = false;
        this._prepared = true;
    }

    /** 按历史尺寸和格式分配；失败时回收本次资源。 */
    private _createHistory(target: RenderTexture, frameIndex: number): CameraTAAHistory {
        let texture: RenderTexture = null;
        let resolveData: ShaderData = null;
        let copyData: ShaderData = null;
        let sharpenData: ShaderData = null;
        try {
            texture = new RenderTexture(target.width, target.height, target.colorFormat, RenderTargetFormat.None, false, 1, false, false);
            texture.name = "TemporalAAHistory";
            texture.lock = true;
            texture.filterMode = FilterMode.Bilinear;
            texture.wrapModeU = texture.wrapModeV = WrapMode.Clamp;
            texture.anisoLevel = 1;
            resolveData = LayaGL.renderDeviceFactory.createShaderData(null);
            copyData = LayaGL.renderDeviceFactory.createShaderData(null);
            sharpenData = LayaGL.renderDeviceFactory.createShaderData(null);
            return {
                texture, valid: false, frameIndex: -1, preparedFrameIndex: frameIndex,
                pendingCopy: false, sourceGamma: target._gammaSpace,
                resolveData, copyData, sharpenData
            };
        } catch (error) {
            sharpenData?.destroy();
            copyData?.destroy();
            resolveData?.destroy();
            texture?.destroy();
            throw error;
        }
    }

    private _finishHistory(success: boolean): boolean {
        const state = this.preparedHistory;
        let committed = false;
        if (state) {
            if (success && state.pendingCopy) {
                state.frameIndex = state.preparedFrameIndex;
                state.valid = true;
                committed = true;
            } else if (!success) {
                state.valid = false;
            }
            state.pendingCopy = false;
        }
        this._prepared = false;
        return committed;
    }

    private _releaseHistory(): void {
        const state = this._history;
        this._history = null;
        this._prepared = false;
        if (!state) return;
        state.texture.destroy();
        state.resolveData.destroy();
        state.copyData.destroy();
        state.sharpenData.destroy();
    }

    /** 完整释放相机的 TAA 资源。 */
    release(): void {
        const wasPrepared = this._prepared;
        this._releaseHistory();
        this._unregisterEffect();
        this._committedFrame = -1;
        if (!wasPrepared) {
            this.effect = null;
            this.jitter.setValue(0, 0);
            this._setDefines(false);
        }
    }

    destroy(): void {
        this.release();
        this.effect = null;
    }

    private _clearsColorAndDepth(): boolean {
        return this._camera.clearFlag === CameraClearFlags.SolidColor || this._camera.clearFlag === CameraClearFlags.Sky;
    }

    private _fitsMotionBudget(requirements: readonly CameraOpaqueMRTRequirement[] | null,
        manualOptions: CameraOpaqueMRTOptions | null): boolean {
        const budget = LayaGL.renderEngine.getParams(RenderParams.Max_Color_Attachment_Bytes_Per_Sample);
        if (!budget) return true;
        const formats = this._budgetFormats;
        formats.length = 1;
        formats[0] = this._camera._getRenderTextureFormat();
        const manual = manualOptions?.auxiliaryAttachments;
        if (manual) for (let index = 0; index < manual.length; index++)
            formats[index + 1] = manual[index]?.format ?? null;
        const maxAttachments = LayaGL.renderEngine.getParams(RenderParams.Max_Color_Attachment_Count);
        if (requirements) for (const requirement of requirements)
            if (requirement && Number.isInteger(requirement.index)
                && requirement.index >= 0 && requirement.index + 2 <= maxAttachments)
                formats[requirement.index + 1] = requirement.format;
        formats[MOTION_VECTOR_LOCATION] = MOTION_VECTOR_FORMAT;
        return CameraTAA._fitsColorAttachmentBudget(formats, budget);
    }

    private static _fitsColorAttachmentBudget(formats: readonly (RenderTargetFormat | null)[], budget: number): boolean {
        let bytes = 0;
        for (const format of formats) {
            if (format == null) continue;
            let cost: number, alignment: number;
            switch (format) {
                case RenderTargetFormat.R16:
                    cost = 2; alignment = 2; break;
                case RenderTargetFormat.R16G16:
                    cost = 4; alignment = 2; break;
                case RenderTargetFormat.R8G8B8:
                case RenderTargetFormat.R8G8B8A8:
                    cost = 8; alignment = 1; break;
                case RenderTargetFormat.R16G16B16:
                case RenderTargetFormat.R16G16B16A16:
                    cost = 8; alignment = 2; break;
                case RenderTargetFormat.R32G32B32:
                case RenderTargetFormat.R32G32B32A32:
                    cost = 16; alignment = 4; break;
                default:
                    return true;
            }
            bytes = Math.ceil(bytes / alignment) * alignment + cost;
        }
        return bytes <= budget;
    }

    private _warn(reason: string): void {
        if (this._warning !== reason) console.warn(`Camera: TAA disabled: ${reason}.`);
        this._warning = reason;
    }

    private _setDefines(enable: boolean): void {
        if (enable === this._motionOutputDefined) return;
        const shaderData = this._camera._shaderValues;
        if (enable)
            shaderData.addDefine(Shader3D.getDefineByName("MOTION_VECTOR_OUTPUT"));
        else
            shaderData.removeDefine(Shader3D.getDefineByName("MOTION_VECTOR_OUTPUT"));
        this._motionOutputDefined = enable;
    }

    private static _halton(index: number, radix: number): number {
        let value = 0, fraction = 1;
        while (index > 0) {
            fraction /= radix;
            value += fraction * (index % radix);
            index = Math.floor(index / radix);
        }
        return value;
    }
}
