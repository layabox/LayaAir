import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRender2DDataHandle, I2DPrimitiveDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle, I2DGlobalRenderData, ISpineRenderDataHandle, I2DGraphicWholeBuffer, I2DGraphicIndexDataView, I2DGraphicVertexDataView, IGraphics2DBufferBlock, IGraphics2DVertexBlock } from "../../RenderModuleData/Design/2D/IRender2DDataHandle"
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { RTRender2DPass, RTRender2DPassManager } from "../../RenderModuleData/RuntimeModuleData/2D/RTRender2DPass";
import { RTBaseRenderDataHandle, RTEmptyRender2DDataHandle, RTGraphics2DBufferBlock, RTGraphics2DVertexBlock, RTMesh2DRenderDataHandle, RTPrimitiveDataHandle, RTRender2DDataHandle, RTSpineRenderDataHandle } from "../../RenderModuleData/RuntimeModuleData/2D/RTRenderDataHandle";
import { RTGlobalRenderData, RTRenderStruct2D } from "../../RenderModuleData/RuntimeModuleData/2D/RTRenderStruct2D";
import { GLESSetRenderData, GLESSetShaderDefine } from "../RenderDevice/GLESRenderCMD";
import { GLESBlit2DQuadCMD, GLESDraw2DElementCMD, GLESSetRendertarget2DCMD } from "./GLES2DRenderCMD";
import { GLESRenderContext2D } from "./GLESRenderContext2D";
import { GLESRenderElement2D } from "./GLESRenderElement2D";
import { RT2DGraphic2DIndexDataView, RT2DGraphic2DVertexDataView, RT2DGraphicIndexBuffer, RT2DGraphicVertexBuffer } from "../../RenderModuleData/RuntimeModuleData/2D/RT2DGraphic2DBufferDataView";
import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { GLESPrimitiveRenderElement2D } from "./GLESPrimitiveRenderElement2D";

export class GLESRender2DProcess implements I2DRenderPassFactory {
    createGraphic2DBufferBlock(): IGraphics2DBufferBlock {
        return new RTGraphics2DBufferBlock();
    }
    createGraphic2DVertexBlock(): IGraphics2DVertexBlock {
        return new RTGraphics2DVertexBlock();
    }
    create2DGraphicVertexDataView(wholeBuffer: I2DGraphicWholeBuffer, elementOffset: number, elementSize: number, stride: number): I2DGraphicVertexDataView {
        return new RT2DGraphic2DVertexDataView(wholeBuffer as RT2DGraphicVertexBuffer, elementOffset, elementSize, stride);
    }
    create2DGraphicIndexDataView(wholeBuffer: I2DGraphicWholeBuffer, elementSize: number): I2DGraphicIndexDataView {
        return new RT2DGraphic2DIndexDataView(wholeBuffer as RT2DGraphicIndexBuffer, elementSize);
    }

    create2DGraphicIndexBuffer(): I2DGraphicWholeBuffer {
        return new RT2DGraphicIndexBuffer();
    }

    create2DGraphicVertexBuffer(): I2DGraphicWholeBuffer {
        return new RT2DGraphicVertexBuffer();
    }

    createPrimitiveRenderElement2D(): IPrimitiveRenderElement2D {
        return new GLESPrimitiveRenderElement2D();
    }

    createRender2DPassManager(): IRender2DPassManager {
        return new RTRender2DPassManager();
    }
    create2DGlobalRenderDataHandle(): I2DGlobalRenderData {
        return new RTGlobalRenderData();
    }
    createSpineRenderDataHandle(): ISpineRenderDataHandle {
        return new RTSpineRenderDataHandle();
    }
    create2D2DPrimitiveDataHandle(): I2DPrimitiveDataHandle {
        return new RTPrimitiveDataHandle();
    }
    create2DBaseRenderDataHandle(): I2DBaseRenderDataHandle {
        return new RTBaseRenderDataHandle();
    }
    createMesh2DRenderDataHandle(): IMesh2DRenderDataHandle {
        return new RTMesh2DRenderDataHandle();
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
        return new GLESSetRenderData();
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new GLESSetShaderDefine();
    }
    createBlit2DQuadCMDData(): Blit2DQuadCMD {
        return new GLESBlit2DQuadCMD();
    }
    createDraw2DElementCMDData(): Draw2DElementCMD {
        return new GLESDraw2DElementCMD();
    }
    createSetRendertarget2DCMD(): SetRendertarget2DCMD {
        return new GLESSetRendertarget2DCMD;
    }
    createRenderElement2D(): GLESRenderElement2D {
        return new GLESRenderElement2D();
    }
    createRenderContext2D(): GLESRenderContext2D {
        return new GLESRenderContext2D();
    }
    createRender2DPass(): IRender2DPass {
        return new RTRender2DPass();
    }
    createRenderStruct2D(): IRenderStruct2D {
        return new RTRenderStruct2D();
    }
    createEmptyRenderDataHandle(): IRender2DDataHandle {
        return new RTEmptyRender2DDataHandle();
    }
}


Laya.addBeforeInitCallback(() => {
    if (!LayaGL.render2DRenderPassFactory)
        LayaGL.render2DRenderPassFactory = new GLESRender2DProcess()
})