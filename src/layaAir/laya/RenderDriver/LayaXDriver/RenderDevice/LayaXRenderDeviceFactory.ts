import { Config } from "../../../../Config";
import { Laya } from "../../../../Laya";
import { LayaEnv } from "../../../../LayaEnv";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderVariantCollection } from "../../../RenderEngine/RenderShader/ShaderVariantCollection";
import { LayaGL } from "../../../layagl/LayaGL";
import { HTMLCanvas } from "../../../resource/HTMLCanvas";
import { Resource } from "../../../resource/Resource";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IDeviceBuffer, EDeviceBufferUsage } from "../../DriverDesign/RenderDevice/IDeviceBuffer";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderDeviceFactory } from "../../DriverDesign/RenderDevice/IRenderDeviceFactory";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { RTStatisContext } from "../../RenderModuleData/RuntimeModuleData/RTStatisticContext";
import { LayaXBufferState } from "./LayaXBufferState";
import { LayaXCommandUniformMap } from "./LayaXCommandUniformMap";
import { LayaXDeviceBuffer } from "./LayaXDeviceBuffer";
import { LayaXIndexBuffer } from "./LayaXIndexBuffer";
import { LayaXRenderEngine } from "./LayaXRenderEngine";
import { LayaXRenderGeometry } from "./LayaXRenderGeometry";
import { LayaXShaderData } from "./LayaXShaderData";
import { LayaXShaderInstance } from "./LayaXShaderInstance";
import { LayaXVertexBuffer } from "./LayaXVertexBuffer";
import { TextRenderConfig } from "../../../webgl/text/TextRenderConfig";

export class LayaXRenderDeviceFactory implements IRenderDeviceFactory {
    createShaderData(ownerResource: Resource): ShaderData {
        return new LayaXShaderData(ownerResource);
    }

    private globalBlockMap: any = {};

    createGlobalUniformMap(blockName: string): LayaXCommandUniformMap {
        let comMap = this.globalBlockMap[blockName];
        if (!comMap)
            comMap = this.globalBlockMap[blockName] = new LayaXCommandUniformMap(blockName);
        return comMap;
    }

    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): IShaderInstance {
        let shaderIns = new LayaXShaderInstance();
        shaderIns._create(shaderProcessInfo, shaderPass);
        if (Shader3D.debugMode) {
            let defineString = shaderProcessInfo.defineString;
            let is2D = shaderProcessInfo.is2D;
            ShaderVariantCollection.active.add(shaderPass, defineString, is2D);
        }
        return shaderIns;
    }

    createIndexBuffer(bufferUsage: BufferUsage): IIndexBuffer {
        return new LayaXIndexBuffer(bufferUsage);
    }

    createVertexBuffer(bufferUsageType: BufferUsage): IVertexBuffer {
        return new LayaXVertexBuffer(bufferUsageType);
    }

    createDeviceBuffer(type: EDeviceBufferUsage): IDeviceBuffer {
        return new LayaXDeviceBuffer(type);
    }

    createBufferState(): IBufferState {
        return new LayaXBufferState();
    }

    createRenderGeometryElement(mode: MeshTopology, drawType: DrawType): IRenderGeometryElement {
        return new LayaXRenderGeometry(mode, drawType);
    }

    async createEngine(config: Config, canvas: HTMLCanvas): Promise<void> {
        TextRenderConfig.premultiplyAlpha = true;

        let engine = new LayaXRenderEngine();
        engine.initRenderEngine(canvas.source);

        new LayaGL();

        LayaGL.renderEngine = engine;
        LayaGL.textureContext = engine.getTextureContext();

        // 初始化 glslang + naga WASM（shader 编译需要）
        await engine.shaderCompiler.init();
    }
}

Laya.addBeforeInitCallback(() => {
    if (LayaEnv.isLayaX && !LayaGL.renderDeviceFactory) {
        LayaGL.renderDeviceFactory = new LayaXRenderDeviceFactory();
        let statisticsContext = new RTStatisContext();
        LayaGL.statAgent?.cloneTo(statisticsContext);
        LayaGL.statAgent = statisticsContext;
    }
})
