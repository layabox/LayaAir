import { Config } from "../../../../Config";
import { Laya } from "../../../../Laya";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { LayaGL } from "../../../layagl/LayaGL";
import { Resource } from "../../../resource/Resource";
import { ShaderProcessInfo, ShaderCompileDefineBase } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderDeviceFactory } from "../../DriverDesign/RenderDevice/IRenderDeviceFactory";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGPUBufferState } from "./WebGPUBufferState";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { WebGPUIndexBuffer } from "./WebGPUIndexBuffer";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";
import { WebGPUShaderData } from "./WebGPUShaderData";
import { WebGPUShaderInstance } from "./WebGPUShaderInstance";
import { WebGPUVertexBuffer } from "./WebGPUVertexBuffer";

export class WebGPURenderDeviceFactory implements IRenderDeviceFactory {
    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): IShaderInstance {
        //@ts-ignore
        const shaderIns = new WebGPUShaderInstance(shaderPass._owner._owner.name);
        shaderIns._create(shaderProcessInfo, shaderPass as ShaderPass);
        return shaderIns;
    }
    createIndexBuffer(bufferUsage: BufferUsage): IIndexBuffer {
        return new WebGPUIndexBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, bufferUsage);
    }
    createVertexBuffer(bufferUsageType: BufferUsage): IVertexBuffer {
        return new WebGPUVertexBuffer(BufferTargetType.ARRAY_BUFFER, bufferUsageType);
    }
    createBufferState(): IBufferState {
        return new WebGPUBufferState();
    }
    createRenderGeometryElement(mode: MeshTopology, drawType: DrawType): IRenderGeometryElement {
        return new WebGPURenderGeometry(mode, drawType);
    }
    createEngine(config: Config, canvas: any): Promise<void> {
        return Promise.resolve();
    }

    static globalBlockMap: { [key: string]: WebGPUCommandUniformMap } = {};
    createGlobalUniformMap(blockName: string): WebGPUCommandUniformMap {
        let comMap = WebGPURenderDeviceFactory.globalBlockMap[blockName];
        if (!comMap)
            comMap = WebGPURenderDeviceFactory.globalBlockMap[blockName] = new WebGPUCommandUniformMap(blockName);
        return comMap;
    }

    createShaderData(ownerResource?: Resource): ShaderData {
        return new WebGPUShaderData(ownerResource);
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.renderDeviceFactory)
        LayaGL.renderDeviceFactory = new WebGPURenderDeviceFactory();
});