/**
description
 使用官方 PBR 材质展示 Camera MRT 的颜色、世界法线、底色和表面参数附件，可切换普通 RT 与 MRT。
 */
import { Laya } from "Laya";
import { GBuffer, GBufferAttachment, GBufferLocation, GBufferOutput } from "laya/d3/core/render/GBuffer";
import { RenderTextureMRT } from "laya/resource/RenderTextureMRT";
import { MRTDemoBase } from "./MRTDemoBase";

export class MRT_Camera {
    private _base = new MRTDemoBase();
    private _enabled = true;
    private _destroyed = false;
    private _outputs = GBufferOutput.All;

    constructor(outputs: GBufferOutput = GBufferOutput.All, private readonly _title: string = "01 / Camera · 按需绑定 PBR 附件") {
        this._outputs = outputs;
        this._base.onDispose = () => this.destroy();
        void this.start();
    }

    private async start(): Promise<void> {
        const base = this._base;
        if (!await base.init(this._title, "完整布局绑定 0～3；仅材质数据时只绑定 0 和 3，1、2 不创建纹理。Camera 仍按整组池化，没有后处理或自定义命令。")) return;
        if (this._destroyed) return;
        this.applyLayout();
        base.addButton("切换 Camera MRT", () => {
            this._enabled = !this._enabled;
            this.applyLayout();
        });
        base.addButton("全部 / 仅材质数据", () => {
            this._outputs = this._outputs === GBufferOutput.All ? GBufferOutput.Surface : GBufferOutput.All;
            this.applyLayout();
        });
        base.addButton("旋转 / 暂停", () => base.rotating = !base.rotating);
        Laya.timer.frameLoop(1, this, this.refresh);
    }

    private applyLayout(): void {
        const base = this._base;
        for (let slot = GBufferLocation.Color; slot <= GBufferLocation.Surface; slot++)
            base.setPreview(slot, null, "等待下一次渲染", "先解除旧附件的展示引用");
        for (const renderer of base.renderers) for (const material of renderer.sharedMaterials)
            if (material) GBuffer.applyShaderOutputs(material.shaderData, this._outputs);
        base.camera.opaqueMRT = this._enabled ? GBuffer.createCameraOptions(this._outputs) : null;
    }

    private refresh(): void {
        const base = this._base, camera = base.camera;
        // 预览借用本帧目标，布局切换后重新查询。
        const target = camera._internalRenderTexture;
        const mrt = target instanceof RenderTextureMRT && !target._inPool ? target : null;
        const surfaceOnly = this._outputs === GBufferOutput.Surface;
        base.setPreview(GBufferLocation.Color, mrt?.getColorTexture(GBufferLocation.Color), "attachment 0 · PBR 颜色", "真正的颜色 0；与左侧相机合成输出对照");
        base.setPreview(GBufferLocation.Normal, camera.getOpaqueAuxiliaryTexture(GBufferAttachment.Normal), "attachment 1 · 世界法线", surfaceOnly ? "空槽：未创建、未绑定纹理" : "RGB = normalWS × 0.5 + 0.5；A 为覆盖标记");
        base.setPreview(GBufferLocation.Albedo, camera.getOpaqueAuxiliaryTexture(GBufferAttachment.Albedo), "attachment 2 · 线性底色", surfaceOnly ? "空槽：未创建、未绑定纹理" : "材质底色，没有叠加灯光和高光");
        base.setPreview(GBufferLocation.Surface, camera.getOpaqueAuxiliaryTexture(GBufferAttachment.Surface), "attachment 3 · 材质参数", "R 金属度 / G 粗糙度 / B AO；A 为覆盖标记");
        const textureCount = mrt?.colorFormats.filter(format => format !== null).length || 0;
        base.setStatus(`手动 MRT：${this._enabled ? "开启" : "关闭"}　布局：${surfaceOnly ? "[颜色, null, null, 材质]" : "[颜色, 法线, 底色, 材质]"}　实际颜色纹理：${mrt ? textureCount + " 张，" + mrt.width + "×" + mrt.height : "普通 RT"}\n空槽保留固定 location，不占用纹理；切换布局后仍由相机申请和回收整组资源。`);
    }

    destroy(): void {
        if (this._destroyed) return;
        this._destroyed = true;
        Laya.timer.clearAll(this);
        this._base.destroy();
    }
}
