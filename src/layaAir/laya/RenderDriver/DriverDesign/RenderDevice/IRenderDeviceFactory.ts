import { Config } from "../../../../Config";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Resource } from "../../../resource/Resource";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { CommandUniformMap } from "./CommandUniformMap";
import { IComputeContext } from "./ComputeShader/IComputeContext.ts";
import { ComputeShaderProcessInfo, IComputeShader } from "./ComputeShader/IComputeShader";
import { IBufferState } from "./IBufferState";
import { IIndexBuffer } from "./IIndexBuffer";
import { IRenderGeometryElement } from "./IRenderGeometryElement";
import { IShaderInstance } from "./IShaderInstance";
import { EDeviceBufferUsage, IDeviceBuffer } from "./IDeviceBuffer";
import { IVertexBuffer } from "./IVertexBuffer";
import { ShaderData } from "./ShaderData";


export interface IRenderDeviceFactory {
    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): IShaderInstance;
    createIndexBuffer(bufferUsage: BufferUsage): IIndexBuffer;
    createVertexBuffer(bufferUsageType: BufferUsage): IVertexBuffer;
    createBufferState(): IBufferState;
    createRenderGeometryElement(mode: MeshTopology, drawType: DrawType): IRenderGeometryElement;
    createEngine(config: Config, canvas: any): Promise<void>;
    createGlobalUniformMap(blockName: string): CommandUniformMap;
    createShaderData(ownerResource?: Resource): ShaderData;
    createComputeShader?(info: ComputeShaderProcessInfo): IComputeShader;
    createComputeContext?(): IComputeContext;
    createDeviceBuffer?(type: EDeviceBufferUsage): IDeviceBuffer;
}