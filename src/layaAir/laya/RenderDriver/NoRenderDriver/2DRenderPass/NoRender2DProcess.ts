import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SingletonList } from "../../../utils/SingletonList";
import { BlendMode } from "../../../webgl/canvas/BlendMode";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IPrimitiveRenderElement2D, IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderCMD, SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { NoRenderSetRenderData, NoRenderSetShaderDefine } from "../DriverDevice/NoRenderDeviceFactory";
import { IRender2DDataHandle, I2DPrimitiveDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle, I2DGlobalRenderData, ISpineRenderDataHandle, I2DGraphicWholeBuffer, I2DGraphicIndexDataView, I2DGraphicVertexDataView, I2DGraphicBufferDataView, IGraphics2DBufferBlock, IGraphics2DVertexBlock } from "../../RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import {
	NoRenderGraphics2DBufferBlock, NoRenderGraphics2DVertexBlock,
	NoRenderVertexDataView, NoRenderIndexDataView,
	NoRenderGraphicVertexBuffer, NoRenderGraphicIndexBuffer,
	NoRenderGlobalRenderData, NoRenderEmptyDataHandle,
	NoRenderPrimitiveDataHandle, NoRenderBaseDataHandle,
	NoRenderMeshDataHandle, NoRenderSpineDataHandle,
	NoRenderStruct2D, NoRender2DPass, NoRender2DPassManager
} from "./NoRender2DModuleData";


export class NoRender2DProcess implements I2DRenderPassFactory {
    createGraphic2DBufferBlock(): IGraphics2DBufferBlock {
        return new NoRenderGraphics2DBufferBlock();
    }

    createGraphic2DVertexBlock(): IGraphics2DVertexBlock {
        return new NoRenderGraphics2DVertexBlock();
    }

    create2DGraphicVertexDataView(wholeBuffer: I2DGraphicWholeBuffer, elementOffset: number, elementSize: number, stride: number): I2DGraphicVertexDataView {
        return new NoRenderVertexDataView(wholeBuffer as NoRenderGraphicVertexBuffer, elementOffset, elementSize, stride);
    }
    create2DGraphicIndexDataView(wholeBuffer: I2DGraphicWholeBuffer, elementSize: number): I2DGraphicIndexDataView {
        return new NoRenderIndexDataView(wholeBuffer as NoRenderGraphicIndexBuffer, elementSize);
    }
    create2DGraphicIndexBuffer(): I2DGraphicWholeBuffer {
        return new NoRenderGraphicIndexBuffer();
    }

    create2DGraphicVertexBuffer(): I2DGraphicWholeBuffer {
        return new NoRenderGraphicVertexBuffer();
    }

    createRender2DPassManager(): IRender2DPassManager {
        return new NoRender2DPassManager();
    }

    create2DGlobalRenderDataHandle(): I2DGlobalRenderData {
        return new NoRenderGlobalRenderData();
    }
    createSpineRenderDataHandle(): ISpineRenderDataHandle {
        return new NoRenderSpineDataHandle();
    }
    createRender2DPass(): IRender2DPass {
        return new NoRender2DPass();
    }
    createRenderStruct2D(): IRenderStruct2D {
        return new NoRenderStruct2D();
    }
    create2D2DPrimitiveDataHandle(): I2DPrimitiveDataHandle {
        return new NoRenderPrimitiveDataHandle();
    }
    create2DBaseRenderDataHandle(): I2DBaseRenderDataHandle {
        return new NoRenderBaseDataHandle();
    }
    createMesh2DRenderDataHandle(): IMesh2DRenderDataHandle {
        return new NoRenderMeshDataHandle();
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
        return new NoRenderSetRenderData();
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new NoRenderSetShaderDefine();
    }
    createBlit2DQuadCMDData(): Blit2DQuadCMD {
        return new NoRenderBlit2DquadCMD();
    }
    createDraw2DElementCMDData(): Draw2DElementCMD {
        return new NoRenderDraw2DElementCMD();
    }
    createSetRendertarget2DCMD(): SetRendertarget2DCMD {
        return new NoRenderSetRendertarget2DCMD();
    }
    createRenderElement2D(): IRenderElement2D {
        return new NoRenderElement2D()
    }
    createPrimitiveRenderElement2D(): IPrimitiveRenderElement2D {
        return new NoRenderPrimitiveRenderElement2D();
    }
    createRenderContext2D(): IRenderContext2D {
        return new NoRenderContext2D();
    }
    createEmptyRenderDataHandle(): IRender2DDataHandle {
        return new NoRenderEmptyDataHandle();
    }
}

export class NoRenderElement2D implements IRenderElement2D {
    typeKey: number = 0;
    textureKey: number = 0;
    type: number;
    owner: IRenderStruct2D;
    nodeCommonMap: string[];
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    value2DShaderData: ShaderData;
    primitiveShaderData: ShaderData;
    subShader: SubShader;
    renderStateIsBySprite: boolean;
    globalShaderData: ShaderData;

    destroy(): void {

    }

}

export class NoRenderPrimitiveRenderElement2D extends NoRenderElement2D implements IPrimitiveRenderElement2D {
    typeKey: number = 0;
    textureKey: number = 0;
    primitiveShaderData: ShaderData = null;
}

export class NoRenderContext2D implements IRenderContext2D {
    passData: ShaderData;
    getRenderTarget(): InternalRenderTarget {
        return null;
    }

    sceneData: ShaderData;
    invertY: boolean;
    pipelineMode: string;
    setRenderTarget(value: InternalRenderTarget, clear: boolean, clearColor: Color): void {

    }
    setOffscreenView(width: number, height: number, x?: number, y?: number): void {

    }
    getOffscreenView(out: Vector4): void {

    }
    drawRenderElementOne(node: IRenderElement2D): void {

    }
    drawRenderElementList(list: SingletonList<IRenderElement2D>): number {
        return 0;
    }
    runOneCMD(cmd: IRenderCMD): void {
    }
    runCMDList(cmds: IRenderCMD[]): void {
    }
}

export class NoRenderBlit2DquadCMD extends Blit2DQuadCMD {
    apply(context: IRenderContext2D): void {
    }
}

export class NoRenderDraw2DElementCMD extends Draw2DElementCMD {
    setRenderelements(value: IRenderElement2D[]): void {
    }
    apply(context: IRenderContext2D): void {
    }
}

export class NoRenderSetRendertarget2DCMD extends SetRendertarget2DCMD {
    apply(context: IRenderContext2D): void {
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.render2DRenderPassFactory)
        LayaGL.render2DRenderPassFactory = new NoRender2DProcess();
});
