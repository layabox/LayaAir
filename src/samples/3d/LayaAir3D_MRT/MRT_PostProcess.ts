/**
description
 自定义后处理声明 MRT 法线需求并实现描边，演示自动申请、撤回需求及手动配置保留。
 */
import { Laya } from "Laya";
import { PostProcess } from "laya/d3/core/render/postProcessBase/PostProcess";
import { GBuffer, GBufferAttachment, GBufferOutput } from "laya/d3/core/render/GBuffer";
import { MRTDemoBase } from "./MRTDemoBase";
import { MRTNormalEdgeEffect } from "./MRTNormalEdgeEffect";

export class MRT_PostProcess {
    private readonly _base = new MRTDemoBase();
    private _effect: MRTNormalEdgeEffect;
    private _postProcess: PostProcess;
    private _keepManualNormal = false;
    private _destroyed = false;

    constructor() {
        this._base.onDispose = () => this.destroy();
        void this.start();
    }

    private async start(): Promise<void> {
        const ready = await this._base.init("MRT · 自动法线描边", "效果声明 normal 需求 → 相机自动申请 MRT → 采样世界法线检测轮廓与硬边。");
        if (!ready || this._destroyed) return;
        this._effect = new MRTNormalEdgeEffect();
        this._postProcess = new PostProcess();
        this._postProcess.addEffect(this._effect);
        // 初始只安装后处理，不手动设置 opaqueMRT，附件由效果的声明驱动。
        this._base.camera.postProcess = this._postProcess;
        this._base.setPreview(1, null, "① 后处理声明需求", "getCameraOpaqueMRTRequirements() 返回 normal 的槽位、格式和清除值。");
        this._base.setPreview(2, null, "② Camera 准备附件", "分配内部 RT 前合并自动与手动需求；这里没有手动申请整组资源。");
        this._base.setPreview(3, null, "③ 效果采样法线", "getOpaqueAuxiliaryTexture → Shader 描边 → context.destination。");
        this._base.addButton("切换描边效果", () => {
            this._effect.clearBorrowedTextures();
            this._effect.active = !this._effect.active;
            this.refreshStatus();
        });
        this._base.addButton("切换整个后处理", () => {
            this._effect.clearBorrowedTextures();
            this._postProcess.enable = !this._postProcess.enable;
            this.refreshStatus();
        });
        this._base.addButton("切换手动保留法线", () => {
            this._keepManualNormal = !this._keepManualNormal;
            this._base.camera.opaqueMRT = this._keepManualNormal ? GBuffer.createCameraOptions(GBufferOutput.Normal) : null;
            this.refreshStatus();
        });
        Laya.timer.frameLoop(1, this, this.refreshStatus);
        this.refreshStatus();
    }

    private refreshStatus(): void {
        if (this._destroyed || !this._effect) return;
        const camera = this._base.camera;
        const effective = camera.effectiveOpaqueMRT;
        // 每帧重新查询借用，不把旧附件存入实例；关闭自动需求后预览随之清空。
        const normal = camera.getOpaqueAuxiliaryTexture(GBufferAttachment.Normal);
        const attachmentCount = 1 + (effective?.auxiliaryAttachments.filter(attachment => attachment !== null).length || 0);
        this._base.setPreview(0, normal, "实际 MRT：世界法线", "RGB = 世界法线 × 0.5 + 0.5；A = 几何覆盖率，背景为透明黑。");
        this._base.setStatus(
            `描边效果 ${this._effect.active ? "开" : "关"} · 后处理 ${this._postProcess.enable ? "开" : "关"} · 手动保留 ${this._keepManualNormal ? "开" : "关"}\n`
            + `effective = ${effective ? "normal" : "无"} · count = ${attachmentCount}（含主色）· isMRT = ${!!normal}\n`
            + "关闭效果或后处理可观察自动附件撤回；开启手动保留后，关闭自动需求仍保留法线。"
        );
    }

    destroy(): void {
        if (this._destroyed) return;
        this._destroyed = true;
        Laya.timer.clearAll(this);
        if (this._base.camera?.postProcess === this._postProcess) this._base.camera.postProcess = null;
        if (this._effect) this._base.setPreview(0, null, "", "");
        this._postProcess?.clearEffect();
        this._postProcess?._context.command.clear();
        this._postProcess?._context.compositeShaderData?.destroy();
        this._effect?.destroy();
        this._postProcess = null;
        this._effect = null;
        this._base.destroy();
    }
}
