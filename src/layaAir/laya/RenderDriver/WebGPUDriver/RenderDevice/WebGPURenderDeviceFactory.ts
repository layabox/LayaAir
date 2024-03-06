
import { Config } from "../../../../Config";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { Resource } from "../../../resource/Resource";
import { ShaderProcessInfo, ShaderCompileDefineBase } from "../../../webgl/utils/ShaderCompileDefineBase";
import { CommandUniformMap, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderDeviceFactory } from "../../DriverDesign/RenderDevice/IRenderDeviceFactory";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderData, ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGPUBufferState } from "./WebGPUBufferState";
import { WebGPUIndexBuffer } from "./WebGPUIndexBuffer";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";
import { WebGPUShaderData } from "./WebGPUShaderData";
import { WebGPUShaderInstance } from "./WebGPUShaderInstance";
import { WebGPUVertexBuffer } from "./WebGPUVertexBuffer";

export class WebGPURenderDeviceFactory implements IRenderDeviceFactory {
    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): IShaderInstance {
        let shaderIns = new WebGPUShaderInstance();
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
        return Promise.resolve();//TODO
    }

    static globalBlockMap: any = {};
    createGlobalUniformMap(blockName: string): CommandUniformMap {
        let comMap = WebGPURenderDeviceFactory.globalBlockMap[blockName];
        if (!comMap)
            comMap = WebGPURenderDeviceFactory.globalBlockMap[blockName] = new WebGPUCommandUniformMap(blockName);;
        return comMap;
    }

    createShaderData(ownerResource?: Resource): ShaderData {
        return new WebGPUShaderData(ownerResource);
    }

}


export class WebGPUCommandUniformMap extends CommandUniformMap {

    /**@internal */
    _idata: {
        [key: number]: {
            propertyName: string,
            uniformtype: ShaderDataType,
        }
    } = {};
    _stateName: string;

    constructor(stateName: string) {
        super(stateName);
        this._stateName = stateName;
    }

    hasPtrID(propertyID: number): boolean {
        return !!(this._idata[propertyID] != null);
    }

    /**
     * 增加一个Uniform参数
     * @internal
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, block: string = ""): void {
        this._idata[propertyID] = { uniformtype: uniformtype, propertyName: propertyKey };
    }

    /**
     * 增加一个Uniform
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderBlockUniform(propertyID: number, blockname: string, blockProperty: UniformProperty[]): void {
        //webgpu can't support block uniform
        return null;
    }

}