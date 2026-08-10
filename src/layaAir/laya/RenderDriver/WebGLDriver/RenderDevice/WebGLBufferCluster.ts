import { IUniformLayout } from "../../DriverDesign/RenderDevice/UniformBufferManager/IUniformLayout";
import { UniformBufferBlock } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferBlock";
import { UniformBufferCluster } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferCluster";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLSubUniformBuffer } from "./WebGLSubUniformBuffer";

/** WebGL 大内存块:覆写 _createBufferBlock,产出带 descriptor 的 WebGLSubUniformBuffer */
export class WebGLBufferCluster extends UniformBufferCluster {
    protected _createBufferBlock(index: number, size: number, alignedSize: number, descriptor: IUniformLayout, owner: WebGLShaderData): UniformBufferBlock {
        return new WebGLSubUniformBuffer(this, index, size, alignedSize, descriptor);
    }
}
