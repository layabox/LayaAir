import { Config } from "../../../../Config";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IBufferState } from "./IBufferState";
import { IIndexBuffer } from "./IIndexBuffer";
import { IRenderGeometryElement } from "./IRenderGeometryElement";
import { IShaderInstance } from "./IShaderInstance";
import { IVertexBuffer } from "./IVertexBuffer";

export interface IRenderDeviceFactory{
    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): IShaderInstance;
    createIndexBuffer(bufferUsage: BufferUsage):IIndexBuffer;
    createVertexBuffer(bufferUsageType: BufferUsage):IVertexBuffer;
    createBufferState():IBufferState;
    createRenderGeometryElement(mode: MeshTopology, drawType: DrawType):IRenderGeometryElement;
    createEngine(config: Config, canvas: any): Promise<void>;
}