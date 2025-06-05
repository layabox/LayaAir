import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRender2DDataHandle, I2DPrimitiveDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle, I2DGlobalRenderData, ISpineRenderDataHandle, I2DGraphicBufferDataView, I2DGraphicWholeBuffer } from "../../RenderModuleData/Design/2D/IRender2DDataHandle"
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { RTRender2DPass, RTRender2DPassManager } from "../../RenderModuleData/RuntimeModuleData/2D/RTRender2DPass";
import { RTPrimitiveDataHandle, RTRender2DDataHandle } from "../../RenderModuleData/RuntimeModuleData/2D/RTRenderDataHandle";
import { RTGlobalRenderData, RTRenderStruct2D } from "../../RenderModuleData/RuntimeModuleData/2D/RTRenderStruct2D";
import { GLESSetRenderData, GLESSetShaderDefine } from "../RenderDevice/GLESRenderCMD";
import { GLESBlit2DQuadCMD, GLESDraw2DElementCMD, GLESSetRendertarget2DCMD } from "./GLES2DRenderCMD";
import { GLESRenderContext2D } from "./GLESRenderContext2D";
import { GLESRenderElement2D } from "./GLESRenderElement2D";
import { RT2DGraphic2DBufferDataView, RT2DGraphicWholeBuffer } from "../../RenderModuleData/RuntimeModuleData/2D/RT2DGraphic2DBufferDataView";

export class GLESRender2DProcess implements I2DRenderPassFactory {
    create2DGraphicBufferDataView(wholeBuffer: I2DGraphicWholeBuffer, elementOffset: number, elementSize: number, stride: number): I2DGraphicBufferDataView {
        return new RT2DGraphic2DBufferDataView(wholeBuffer as RT2DGraphicWholeBuffer, wholeBuffer.modifyType, elementOffset, elementSize, stride);
    }
    create2DGraphicWoleBuffer(): I2DGraphicWholeBuffer {
        return new RT2DGraphicWholeBuffer();
    }
    createRender2DPassManager(): IRender2DPassManager {
        return new RTRender2DPassManager();
    }
    create2DGlobalRenderDataHandle(): I2DGlobalRenderData {
        return new RTGlobalRenderData();
    }
    createSpineRenderDataHandle(): ISpineRenderDataHandle {
        return new RTRender2DSpineRenderDataHandle();
    }
    create2D2DPrimitiveDataHandle(): I2DPrimitiveDataHandle {
        return new RTPrimitiveDataHandle();
    }
    create2DBaseRenderDataHandle(): I2DBaseRenderDataHandle {
        return new RTRender2DBaseRenderDataHandle();
    }
   createMesh2DRenderDataHandle(): IMesh2DRenderDataHandle {
        return new RTRender2DMeshRenderDataHandle();
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
}


Laya.addBeforeInitCallback(() => {
    if (!LayaGL.render2DRenderPassFactory)
        LayaGL.render2DRenderPassFactory = new GLESRender2DProcess()
})