import { Config } from "../../../../Config";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderProcessInfo, ShaderCompileDefineBase } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderDeviceFactory } from "../../DriverDesign/RenderDevice/IRenderDeviceFactory";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { WebGLRenderGeometryElement } from "./RenderGeometryElementOBJ";
import { WebGLBufferState } from "./WebGLBufferState";
import { WebGLIndexBuffer } from "./WebGLIndexBuffer";
import { WebGLShaderInstance } from "./WebGLShaderInstance";
import { WebGLVertexBuffer } from "./WebGLVertexBuffer";

export class WebGLRenderDeviceFactory implements IRenderDeviceFactory {

    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): IShaderInstance {
        let shaderIns = new WebGLShaderInstance();
        shaderIns._create(shaderProcessInfo, shaderPass);
        return shaderIns;
    }

    createIndexBuffer(bufferUsageType: BufferUsage): IIndexBuffer {
        return new WebGLIndexBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, bufferUsageType);
    }

    createVertexBuffer(bufferUsageType: BufferUsage): IVertexBuffer {
        return new WebGLVertexBuffer(BufferTargetType.ARRAY_BUFFER, bufferUsageType);
    }

    createBufferState(): IBufferState {
        return new WebGLBufferState();
    }

    createRenderGeometryElement(mode: MeshTopology, drawType: DrawType): IRenderGeometryElement {
        return new WebGLRenderGeometryElement(mode, drawType);
    }

    createEngine(config: Config, canvas: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
}