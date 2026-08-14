import { UniformBufferWriter } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferWriter";

/**
 * WebGL 侧 UBO 的调用方类型:池化块(WebGLSubUniformBuffer)与独立 buffer(WebGLUniformBuffer)的公共面。
 * extends UniformBufferWriter 自动带上 descriptor / needUpload / 所有 setXxx。
 */
export interface IWebGLUniformBuffer extends UniformBufferWriter {
    bind(location: number): void;
    upload(): void;
    destroy(): void;
}
