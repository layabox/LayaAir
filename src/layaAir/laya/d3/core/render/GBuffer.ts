import type { CameraOpaqueMRTOptions, CameraOpaqueMRTRequirement } from "../Camera";
import { Color } from "../../../maths/Color";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";

/** 内置 GBuffer 数据的输出开关，位置固定，不随组合重新排列。 */
export enum GBufferOutput {
    None = 0,
    Normal = 1,
    Albedo = 2,
    Surface = 4,
    All = Normal | Albedo | Surface
}

/** Shader 输出位置；自定义数据从 CustomStart 开始，不压缩未使用的中间位置。 */
export enum GBufferLocation {
    Color = 0,
    Normal = 1,
    Albedo = 2,
    Surface = 3,
    CustomStart = 4
}

/** 内置附件的查询名称。 */
export enum GBufferAttachment {
    Normal = "normal",
    Albedo = "albedo",
    Surface = "surface"
}

/** 内置输出功能宏；与 GLSL include 中的协议保持一致。 */
export enum GBufferShaderDefine {
    Configured = "GBUFFER_OUTPUTS_CONFIGURED",
    Normal = "GBUFFER_NORMAL",
    Albedo = "GBUFFER_ALBEDO",
    Surface = "GBUFFER_SURFACE"
}

/** GBuffer 上层协议：0 为主色，1～3 为内置数据，自定义从 4 开始。 */
export class GBuffer {
    /** 世界法线编码为 RGB = normalWS × 0.5 + 0.5，A 为几何覆盖标记。 */
    static readonly Normal: CameraOpaqueMRTRequirement = Object.freeze({
        index: GBufferLocation.Normal - 1,
        name: GBufferAttachment.Normal,
        format: RenderTargetFormat.R16G16B16A16,
        clearColor: Object.freeze(new Color(0, 0, 0, 0))
    });

    /** 线性底色，不包含光照、雾或输出颜色变换，A 为几何覆盖标记。 */
    static readonly Albedo: CameraOpaqueMRTRequirement = Object.freeze({
        index: GBufferLocation.Albedo - 1,
        name: GBufferAttachment.Albedo,
        format: RenderTargetFormat.R8G8B8A8,
        clearColor: Object.freeze(new Color(0, 0, 0, 0))
    });

    /** R 为金属度，G 为感知粗糙度，B 为遮蔽系数，A 为几何覆盖标记。 */
    static readonly Surface: CameraOpaqueMRTRequirement = Object.freeze({
        index: GBufferLocation.Surface - 1,
        name: GBufferAttachment.Surface,
        format: RenderTargetFormat.R8G8B8A8,
        clearColor: Object.freeze(new Color(0, 0, 0, 0))
    });

    /** 按需选择固定槽位；无辅助附件时返回 null，自定义从 4 开始。 */
    static createCameraOptions(outputs: GBufferOutput = GBufferOutput.All,
        customAttachments: CameraOpaqueMRTOptions["auxiliaryAttachments"] = []): CameraOpaqueMRTOptions | null {
        this._validateOutputs(outputs);
        const attachments = [
            outputs & GBufferOutput.Normal ? this.Normal : null,
            outputs & GBufferOutput.Albedo ? this.Albedo : null,
            outputs & GBufferOutput.Surface ? this.Surface : null,
            ...customAttachments
        ];
        while (attachments.length && attachments[attachments.length - 1] == null) attachments.pop();
        return attachments.length ? { auxiliaryAttachments: attachments } : null;
    }

    /** 为独立 MRT 生成包含主色的同一布局。 */
    static createColorFormats(mainFormat: RenderTargetFormat, outputs: GBufferOutput = GBufferOutput.All,
        customFormats: readonly (RenderTargetFormat | null)[] = []): (RenderTargetFormat | null)[] {
        const options = this.createCameraOptions(outputs, customFormats.map(format => format == null ? null : { format }));
        return [mainFormat, ...(options?.auxiliaryAttachments.map(attachment => attachment?.format ?? null) || [])];
    }

    private static _validateOutputs(outputs: GBufferOutput): void {
        if (!Number.isInteger(outputs) || outputs < GBufferOutput.None || outputs > GBufferOutput.All)
            throw new RangeError("GBuffer outputs must contain only Normal, Albedo and Surface flags.");
    }

    /** 设置材质输出功能，不改变相机附件布局。 */
    static applyShaderOutputs(shaderData: ShaderData, outputs: GBufferOutput): void {
        this._validateOutputs(outputs);
        // 区分标准 PBR 的缺省全部输出与调用方显式关闭全部输出。
        shaderData.addDefine(Shader3D.getDefineByName(GBufferShaderDefine.Configured));
        const flags = [GBufferOutput.Normal, GBufferOutput.Albedo, GBufferOutput.Surface];
        const names = [GBufferShaderDefine.Normal, GBufferShaderDefine.Albedo, GBufferShaderDefine.Surface];
        for (let index = 0; index < flags.length; index++) {
            const define = Shader3D.getDefineByName(names[index]);
            if (outputs & flags[index]) shaderData.addDefine(define);
            else shaderData.removeDefine(define);
        }
    }

    /** 未显式配置时使用标准 PBR 的全部输出；已配置时读取实际宏，兼容材质克隆。 */
    static getShaderOutputs(shaderData: ShaderData): GBufferOutput {
        if (!shaderData.hasDefine(Shader3D.getDefineByName(GBufferShaderDefine.Configured)))
            return GBufferOutput.All;
        let outputs = GBufferOutput.None;
        if (shaderData.hasDefine(Shader3D.getDefineByName(GBufferShaderDefine.Normal))) outputs |= GBufferOutput.Normal;
        if (shaderData.hasDefine(Shader3D.getDefineByName(GBufferShaderDefine.Albedo))) outputs |= GBufferOutput.Albedo;
        if (shaderData.hasDefine(Shader3D.getDefineByName(GBufferShaderDefine.Surface))) outputs |= GBufferOutput.Surface;
        return outputs;
    }
}
