/**
description
 开发者在固定 location 5 写入真实模型 UV 和世界高度，使用 Camera 申请自定义附件。
 */
import { Laya } from "Laya";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { GBuffer, GBufferOutput } from "laya/d3/core/render/GBuffer";
import { LayaGL } from "laya/layagl/LayaGL";
import { Color } from "laya/maths/Color";
import { RenderParams } from "laya/RenderEngine/RenderEnum/RenderParams";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderTextureMRT } from "laya/resource/RenderTextureMRT";
import { MRTCustomAttachment, MRTCustomDataMaterial, MRTCustomLocation } from "./MRTCustomDataMaterial";
import { MRTDemoBase } from "./MRTDemoBase";

enum CustomPreview {
    Color,
    CustomData,
    Layout,
    Shader
}

export class MRT_CustomLocation {
    private readonly _base = new MRTDemoBase();
    private readonly _materials: MRTCustomDataMaterial[] = [];
    private _enabled = true;
    private _destroyed = false;

    constructor() {
        this._base.onDispose = () => this.destroy();
        void this.start();
    }

    private async start(): Promise<void> {
        const base = this._base;
        if (!await base.init("04 / 自定义 location 5 · 模型 UV 与世界高度", "开发者自定义材质绘制真实几何：主色为棋盘格，自定义附件的 RG 为模型 UV，B 为世界高度，A 为覆盖率。", "相机最终输出 · 自定义材质颜色")) return;
        if (this._destroyed) return;
        if (LayaGL.renderEngine.getParams(RenderParams.Max_Color_Attachment_Count) <= MRTCustomLocation.CustomData) {
            base.setStatus("此示例需要至少 6 个颜色槽位，以绑定固定 location 5；当前设备不足。只显示普通 PBR 场景。");
            return;
        }
        for (const renderer of base.renderers) {
            const original = renderer.sharedMaterial as PBRStandardMaterial;
            const material = new MRTCustomDataMaterial(original.albedoColor);
            this._materials.push(material);
            // 原材质仍由基类统一释放。
            renderer.sharedMaterial = material;
        }
        base.camera.enableBuiltInRenderTexture = true;
        this.applyLayout();
        base.addButton("自定义 MRT 开 / 关", () => {
            this._enabled = !this._enabled;
            this.applyLayout();
        });
        base.addButton("旋转 / 暂停", () => base.rotating = !base.rotating);
        Laya.timer.frameLoop(1, this, this.refresh);
    }

    private applyLayout(): void {
        const base = this._base;
        // 先解除预览对旧附件的借用，再让相机归还或切换整组资源。
        for (let preview = CustomPreview.Color; preview <= CustomPreview.Shader; preview++)
            base.setPreview(preview, null, "等待下一次渲染", "");
        base.camera.opaqueMRT = this._enabled ? GBuffer.createCameraOptions(GBufferOutput.None, [{
            name: MRTCustomAttachment.UVHeight,
            format: RenderTargetFormat.R8G8B8A8,
            clearColor: new Color(0, 0, 0, 0)
        }]) : null;
    }

    private refresh(): void {
        const base = this._base;
        const target = base.camera._internalRenderTexture;
        const mrt = target instanceof RenderTextureMRT && !target._inPool ? target : null;
        const custom = base.camera.getOpaqueAuxiliaryTexture(MRTCustomAttachment.UVHeight);
        base.setPreview(CustomPreview.Color, mrt?.getColorTexture(MRTCustomLocation.Color), "location 0 · 主颜色", "自定义材质的棋盘格主色，与左侧最终输出对照");
        base.setPreview(CustomPreview.CustomData, custom, "location 5 · 自定义 UV / 高度", "R = 模型 U，G = 模型 V，B = 高度，A = 覆盖率");
        base.setPreview(CustomPreview.Layout, null, "固定布局 · 0 / 5", "[主色, null, null, null, null, UV高度]；只有两张颜色纹理");
        base.setPreview(CustomPreview.Shader, null, "自定义 Shader 的职责", "声明 location 5 并写入数据；关闭 MRT 后只写主色");
        const textureCount = mrt?.colorFormats.filter(format => format !== null).length || 0;
        base.setStatus(`自定义 MRT：${this._enabled ? "开启" : "关闭"}　固定自定义位置：${MRTCustomLocation.CustomData}　实际颜色纹理：${mrt ? textureCount + " 张" : "普通 RT"}\n当前使用 MRTCustomDataMaterial 开发者扩展示例；Camera、后处理和底层均不解释 UV / 高度含义。`);
    }

    destroy(): void {
        if (this._destroyed) return;
        this._destroyed = true;
        Laya.timer.clearAll(this);
        // 基类先解绑预览并销毁场景，随后释放本示例创建的材质。
        this._base.destroy();
        for (const material of this._materials) material.destroy();
        this._materials.length = 0;
    }
}
