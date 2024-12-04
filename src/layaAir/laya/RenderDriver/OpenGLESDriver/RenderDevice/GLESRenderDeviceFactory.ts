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
import { Resource } from "../../../resource/Resource";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { GLESShaderData } from "./GLESShaderData";
import { GLESCommandUniformMap } from "./GLESCommandUniformMap";
import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { NotImplementedError } from "../../../utils/Error";

export class GLESRenderDeviceFactory implements IRenderDeviceFactory {
    createShaderData(ownerResource: Resource): ShaderData {
        return new GLESShaderData(ownerResource);
    }
    private globalBlockMap: any = {};
    createGlobalUniformMap(blockName: string): GLESCommandUniformMap {
        let comMap = this.globalBlockMap[blockName];
        if (!comMap)
            comMap = this.globalBlockMap[blockName] = new GLESCommandUniformMap(blockName);;
        return comMap;
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
        throw new NotImplementedError();
    }

}


Laya.addBeforeInitCallback(() => {
    if (!LayaGL.renderDeviceFactory)
        LayaGL.renderDeviceFactory = new GLESRenderDeviceFactory();
})
