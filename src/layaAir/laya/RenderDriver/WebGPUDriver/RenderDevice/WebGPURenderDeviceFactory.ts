import { Config } from "../../../../Config";
import { Laya } from "../../../../Laya";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { LayaGL } from "../../../layagl/LayaGL";
import { HTMLCanvas } from "../../../resource/HTMLCanvas";
import { Resource } from "../../../resource/Resource";
import { ShaderProcessInfo, ShaderCompileDefineBase } from "../../../webgl/utils/ShaderCompileDefineBase";
import { ComputeShaderProcessInfo } from "../../DriverDesign/RenderDevice/ComputeShader/IComputeShader";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderDeviceFactory } from "../../DriverDesign/RenderDevice/IRenderDeviceFactory";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { EDeviceBufferUsage, IDeviceBuffer } from "../../DriverDesign/RenderDevice/IDeviceBuffer";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGPUBufferState } from "./WebGPUBufferState";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { WebGPUIndexBuffer } from "./WebGPUIndexBuffer";
import { WebGPUConfig, WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";
import { WebGPUShaderData } from "./WebGPUShaderData";
import { WebGPUShaderInstance } from "./WebGPUShaderInstance";
import { WebGPUUniformBufferBase } from "./WebGPUUniform/WebGPUUniformBufferBase";
import { WebGPUVertexBuffer } from "./WebGPUVertexBuffer";
import { WebGPUComputeContext } from "./compute/WebGPUComputeContext";
import { WebGPUComputeShaderInstance } from "./compute/WebGPUComputeShaderInstance";
import { WebGPUDeviceBuffer } from "./compute/WebGPUStorageBuffer";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderVariantCollection } from "../../../RenderEngine/RenderShader/ShaderVariantCollection";
import { WebGPUBindGroup, WebGPUBindGroupCache } from "./WebGPUBindGroupCache";
import { WebGPUPipelineCache } from "./WebGPUPipelineCache";
import { Vector2 } from "../../../maths/Vector2";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";

export class WebGPUGlobalPipeLineCacheInfo {
    globalDefineData: WebDefineDatas;//用来判断宏是否改动  导致了shader变化
    globalPipelineCacheKey: string;//包括camera scene的layout数据，包括invertY和destrt的stateCacheID
    globalDefineChangeFlag: Vector2 = new Vector2();
    pipeLineChangeFlag: Vector2 = new Vector2();
    constructor() {
        this.globalDefineData = LayaGL.unitRenderModuleDataFactory.createDefineDatas() as WebDefineDatas;
    }
}

export function compareCahceFlag(changeFlag: Vector2, cacheFlag: Vector2) {
    let needUpdate = false;
    if (changeFlag.x > cacheFlag.x)
        needUpdate = true;
    else if (changeFlag.x === cacheFlag.x) {
        needUpdate = changeFlag.y > cacheFlag.y;
    }
    return needUpdate
}

export function coverCahceFlag(coverFlag: Vector2, oldFlag: Vector2) {
    let needUpdate = false;
    if (coverFlag.x > oldFlag.x)
        needUpdate = true;
    else if (coverFlag.x === oldFlag.x) {
        needUpdate = coverFlag.y > oldFlag.y;
    }
    if (needUpdate) {
        coverFlag.cloneTo(oldFlag);
    }
    return;
}


export class OneDrawPassCacheInfo {
    matCacheFlag: Vector2 = new Vector2(-1, -1);
    nodeCacheFlag: Vector2 = new Vector2(-1, -1);
    passDefineCacheFlag: Vector2 = new Vector2(-1, -1);
    geometryStateID: number = -1;
    drawInfos: OneDrawCacheInfo[] = [];
}

//记录一个RenderElement 一次DrawCall的缓存数据
export class OneDrawCacheInfo {
    shaderInstance: WebGPUShaderInstance;
    pipeline: GPURenderPipeline;
    shaderChange: boolean;
    pipeLineCacheFlag: Vector2 = new Vector2(-1, -1);//和global的BindGroup引起的pipeline的更新Flag做对比
    defineCacheFlag: Vector2 = new Vector2(-1, -1);//define的改动cache数据

    nodeBindGroup: WebGPUBindGroup;
    renderNodeBindGroupCacheFlag: Vector2 = new Vector2(-1, -1);
    matBindGroup: WebGPUBindGroup;
    matBindGroupCacheFlag: Vector2 = new Vector2(-1, -1);
}


export class WebGPURenderDeviceFactory implements IRenderDeviceFactory {
    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): IShaderInstance {
        const shaderIns = new WebGPUShaderInstance(shaderPass._owner._owner.name);

        shaderIns._create(shaderProcessInfo, shaderPass as ShaderPass);

        if (Shader3D.debugMode) {
            let defineString = shaderProcessInfo.defineString;

            let is2D = shaderProcessInfo.is2D;

            ShaderVariantCollection.active.add(shaderPass, defineString, is2D);
        }

        return shaderIns;
    }
    createIndexBuffer(bufferUsage: BufferUsage): IIndexBuffer {
        return new WebGPUIndexBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, bufferUsage);
    }
    createVertexBuffer(bufferUsageType: BufferUsage): IVertexBuffer {
        return new WebGPUVertexBuffer(BufferTargetType.ARRAY_BUFFER, bufferUsageType);
    }

    createDeviceBuffer(type: EDeviceBufferUsage): IDeviceBuffer {
        return new WebGPUDeviceBuffer(type);
    }

    createBufferState(): IBufferState {
        return new WebGPUBufferState();
    }
    createRenderGeometryElement(mode: MeshTopology, drawType: DrawType): IRenderGeometryElement {
        return new WebGPURenderGeometry(mode, drawType);
    }
    async createEngine(config: Config, canvas: HTMLCanvas): Promise<void> {
        const gpuConfig = new WebGPUConfig();
        gpuConfig.alphaMode = "opaque";
        gpuConfig.colorSpace = "srgb"; //TODO 这里感觉会出问题
        switch (Config.powerPreference) {
            case "default":
                gpuConfig.powerPreference = "high-performance";
                break;
            default:
                gpuConfig.powerPreference = Config.powerPreference;
                break;
        }
        //@ts-ignore
        // todo add required features
        gpuConfig.deviceDescriptor.requiredFeatures = [
            // "texture-compression-astc",
            // "texture-compression-bc",
            // "texture-compression-etc2",
            // "float32-filterable"
            "depth-clip-control",
            "depth32float-stencil8",
            "texture-compression-bc",
            "texture-compression-etc2",
            "texture-compression-astc",
            "timestamp-query",
            "indirect-first-instance",
            "shader-f16",
            "rg11b10ufloat-renderable",
            "bgra8unorm-storage",
            "float32-filterable",
        ];

        if (Config.isAlpha) {
            gpuConfig.alphaMode = "premultiplied";
        } else {
            gpuConfig.alphaMode = "opaque";
        }

        const engine = new WebGPURenderEngine(gpuConfig, canvas.source);
        LayaGL.renderEngine = engine;
        await engine.initRenderEngine();
        engine.useSPRIV = Config.useSPRIV;
        if (engine.useSPRIV) {
            console.log("shader is spri-v mode");
        }
        engine.bindGroupCache = new WebGPUBindGroupCache();
        WebGPUBindGroupCache.emptyBindGroup = engine.bindGroupCache.getBindGroup([], null, null, [], 0);
        engine.pipelineCache = new WebGPUPipelineCache();
        LayaGL.textureContext = engine.getTextureContext();
        WebGPUShaderData.__init__();
        WebGPUUniformBufferBase.device = engine.getDevice();
    }

    static globalBlockMap: { [key: string]: WebGPUCommandUniformMap } = {};
    createGlobalUniformMap(blockName: string): WebGPUCommandUniformMap {
        let comMap = WebGPURenderDeviceFactory.globalBlockMap[blockName];
        if (!comMap)
            comMap = WebGPURenderDeviceFactory.globalBlockMap[blockName] = new WebGPUCommandUniformMap(blockName);
        return comMap;
    }

    createShaderData(ownerResource?: Resource): ShaderData {
        return new WebGPUShaderData();
    }

    createComputeContext(): WebGPUComputeContext {
        return new WebGPUComputeContext();
    }

    createComputeShader(info: ComputeShaderProcessInfo): WebGPUComputeShaderInstance {
        let shader = new WebGPUComputeShaderInstance(info.name);
        shader.compile(info);
        return shader;
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.renderDeviceFactory)
        LayaGL.renderDeviceFactory = new WebGPURenderDeviceFactory();
});