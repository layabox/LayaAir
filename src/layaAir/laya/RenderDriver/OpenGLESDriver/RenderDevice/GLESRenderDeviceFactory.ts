import { Config } from "../../../../Config";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderDeviceFactory } from "../../DriverDesign/RenderDevice/IRenderDeviceFactory";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { GLESShaderInstance } from "./GLESShaderInstance";
import { GLESBufferState } from "./GLESBufferState";
import { GLESIndexBuffer } from "./GLESIndexBuffer";
import { GLESRenderGeometryElement } from "./GLESRenderGeometryElement";
import { GLESVertexBuffer } from "./GLESVertexBuffer";
import { CommandUniformMap } from "../../DriverDesign/RenderDevice/CommandUniformMap";

export class GLESRenderDeviceFactory implements IRenderDeviceFactory {
    createGlobalUniformMap(blockName: string): CommandUniformMap {
        throw new Error("Method not implemented.");
    }
    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): IShaderInstance {
        let shaderIns = new GLESShaderInstance();
        shaderIns._create(shaderProcessInfo, shaderPass);
        return shaderIns;
    }
    createIndexBuffer(bufferUsage: BufferUsage): IIndexBuffer {
        return new GLESIndexBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, bufferUsage);
    }
    createVertexBuffer(bufferUsageType: BufferUsage): IVertexBuffer {
        return new GLESVertexBuffer(BufferTargetType.ARRAY_BUFFER, bufferUsageType);
    }
    createBufferState(): IBufferState {
        return new GLESBufferState();
    }
    createRenderGeometryElement(mode: MeshTopology, drawType: DrawType): IRenderGeometryElement {
        return new GLESRenderGeometryElement(mode, drawType);
    }
    createEngine(config: Config, canvas: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

}