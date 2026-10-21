/**
description
 使用 CommandBuffer 绘制整组 MRT，再将辅助附件仅复制到颜色 0，观察其他附件保持不变。
 */
import { Laya } from "Laya";
import { CameraEventFlags } from "laya/d3/core/Camera";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { GBuffer, GBufferLocation } from "laya/d3/core/render/GBuffer";
import { Color } from "laya/maths/Color";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { RenderTexture } from "laya/resource/RenderTexture";
import { RenderTextureMRT } from "laya/resource/RenderTextureMRT";
import { MRTDemoBase } from "./MRTDemoBase";

export class MRT_CommandBuffer {
    private readonly _base = new MRTDemoBase();
    private readonly _commands = new CommandBuffer("MRT 独立命令流");
    private readonly _width = 512;
    private readonly _height = 384;
    private readonly _attachmentNames = ["世界空间法线", "线性反照率", "金属度 / 粗糙度 / AO"];
    private readonly _attachmentLocations = [GBufferLocation.Normal, GBufferLocation.Albedo, GBufferLocation.Surface];
    private _mrt: RenderTextureMRT = null;
    private _enabled = true;
    private _attached = false;
    private _dirty = true;
    private _selectedAttachment = 0;
    private _displayedAttachment = 0;
    private _drawCount = 0;
    private _disposed = false;

    constructor() {
        this._base.onDispose = () => this.destroy();
        void this._start();
    }

    private async _start(): Promise<void> {
        const ready = await this._base.init("Demo 3 · CommandBuffer 整组 MRT", "独立绘制 PBR 场景，再把一个辅助附件复制到颜色 0；右侧三份原始辅助数据继续保留。");
        if (!ready || this._disposed) return;
        // 相机本身走普通 PBR；内部主色最终合成到 base 的 output，不由本命令流改写。
        this._base.camera.opaqueMRT = null;
        this._base.camera.enableBuiltInRenderTexture = true;
        this._mrt = RenderTextureMRT.createFromPool({
            width: this._width,
            height: this._height,
            colorFormats: GBuffer.createColorFormats(RenderTargetFormat.R8G8B8A8),
            depthStencilFormat: RenderTargetFormat.DEPTH_16
        });
        for (let index = 0; index < this._mrt.colorAttachmentCount; index++)
            this._mrt.getColorTexture(index).filterMode = FilterMode.Bilinear;

        this._base.addButton("开启 / 暂停命令流", () => {
            this._enabled = !this._enabled;
            this._dirty = true;
        });
        this._base.addButton("切换颜色 0 的来源", () => {
            this._selectedAttachment = (this._selectedAttachment + 1) % this._attachmentNames.length;
            this._dirty = true;
        });
        this._refresh();
        // 按钮只改状态；录制和解绑统一留在下一帧开始，避免在渲染命令执行中改列表。
        Laya.timer.frameLoop(1, this, this._refresh);
    }

    private _refresh(): void {
        if (this._disposed || !this._mrt || !this._dirty) return;
        this._detachCommands();
        this._commands.clear();
        this._drawCount = 0;
        if (this._enabled) {
            this._recordCommands();
            this._base.camera.addCommandBuffer(CameraEventFlags.BeforeImageEffect, this._commands);
            this._attached = true;
            this._displayedAttachment = this._selectedAttachment;
        }
        this._updatePreviews();
        this._updateStatus();
        this._dirty = false;
    }

    private _recordCommands(): void {
        const mrt = this._mrt;
        // 第一阶段绑定整组：PBR 材质输出颜色 0，以及法线、反照率、表面参数三个附件。
        this._commands.setRenderTarget(mrt, true, true, [
            new Color(0.025, 0.035, 0.06, 1),
            new Color(0, 0, 0, 0),
            new Color(0, 0, 0, 0),
            new Color(0, 0, 0, 0)
        ]);
        for (const renderer of this._base.renderers) {
            const materials = renderer.sharedMaterials;
            for (let subMesh = 0; subMesh < materials.length; subMesh++) {
                if (!materials[subMesh]) continue;
                this._commands.drawRender(renderer, materials[subMesh], subMesh);
                this._drawCount++;
            }
        }

        // 第二阶段只绑定同组的颜色 0。来源是另一个纹理附件，因此没有读写同一纹理的反馈。
        const source = mrt.getColorTexture(this._attachmentLocations[this._selectedAttachment]);
        this._commands.blitScreenTriangle(source, mrt, null, null, null, 0, true);
        // BeforeImageEffect 之后，正常相机的 finalize 会重新绑定并输出 base.output。
    }

    private _updatePreviews(): void {
        const mrt = this._mrt;
        this._base.setPreview(GBufferLocation.Color, mrt.getColorTexture(GBufferLocation.Color), "颜色 0 · 仅主色阶段", `来自 ${this._attachmentNames[this._displayedAttachment]}；其余附件未参与本次写入`);
        this._base.setPreview(GBufferLocation.Normal, mrt.getColorTexture(GBufferLocation.Normal), "附件 1 · 世界空间法线", "location 1；RGB = 法线 × 0.5 + 0.5，A = 1");
        this._base.setPreview(GBufferLocation.Albedo, mrt.getColorTexture(GBufferLocation.Albedo), "附件 2 · 线性反照率", "location 2；不包含光照和金属度的漫反射衰减");
        this._base.setPreview(GBufferLocation.Surface, mrt.getColorTexture(GBufferLocation.Surface), "附件 3 · 表面参数", "location 3；R = 金属度，G = 粗糙度，B = AO");
    }

    private _updateStatus(): void {
        const state = this._enabled ? "正在执行" : "已暂停，右侧保留最后一次结果";
        const selection = this._attachmentNames[this._selectedAttachment];
        this._base.setStatus(`${state} ｜ ${this._width} × ${this._height}，RGBA8 × 3 + 法线 RGBA16F + Depth16\n`
            + `BeforeImageEffect：setRenderTarget → drawRender（${this._drawCount} 个子网格）→ color0Only Blit\n`
            + `颜色 0 来源：${selection}${this._enabled ? "" : "（恢复命令流后生效）"}；左侧普通相机输出保持独立。`);
    }

    private _detachCommands(): void {
        if (!this._attached) return;
        this._base.camera.removeCommandBuffer(CameraEventFlags.BeforeImageEffect, this._commands);
        this._attached = false;
    }

    private _releaseTargets(): void {
        this._detachCommands();
        // 先释放 SetRenderTarget 和 drawRender 持有的引用，再解除 UI 对各颜色附件的借用。
        this._commands.clear();
        if (this._mrt) {
            for (let slot = GBufferLocation.Color; slot < GBufferLocation.CustomStart; slot++)
                this._base.setPreview(slot, null, "", "");
            RenderTexture.recoverToPool(this._mrt);
            this._mrt = null;
        }
    }

    destroy(): void {
        if (this._disposed) return;
        this._disposed = true;
        Laya.timer.clearAll(this);
        this._releaseTargets();
        this._base.destroy();
    }
}
