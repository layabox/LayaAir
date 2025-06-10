import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { I2DPrimitiveDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle, ISpineRenderDataHandle, I2DGlobalRenderData, I2DGraphicBufferDataView, I2DGraphicWholeBuffer } from "../../RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { Web2DGraphic2DBufferDataView, Web2DGraphicWholeBuffer } from "../../RenderModuleData/WebModuleData/2D/Web2DGraphic2DBufferDataView";
import { WebRender2DPass, WebRender2DPassManager } from "../../RenderModuleData/WebModuleData/2D/WebRender2DPass";
import { Web2DBaseRenderDataHandle, WebMesh2DRenderDataHandle, WebPrimitiveDataHandle, WebSpineRenderDataHandle } from "../../RenderModuleData/WebModuleData/2D/WebRenderDataHandle";
import { WebGlobalRenderData, WebRenderStruct2D } from "../../RenderModuleData/WebModuleData/2D/WebRenderStruct2D";
import { WebGLSetRenderData, WebGLSetShaderDefine } from "../RenderDevice/WebGLRenderCMD";
import { WebGLBlit2DQuadCMD, WebGLDraw2DElementCMD, WebGLSetRendertarget2DCMD } from "./WebGL2DRenderCMD";
import { WebglRenderContext2D } from "./WebGLRenderContext2D";
import { WebGLRenderelement2D } from "./WebGLRenderElement2D";

export class WebGLRender2DProcess implements I2DRenderPassFactory {

    constructor() {
    }
    create2DGraphicBufferDataView(wholeBuffer: Web2DGraphicWholeBuffer, elementOffset: number, elementSize: number, stride: number): I2DGraphicBufferDataView {
        return new Web2DGraphic2DBufferDataView(wholeBuffer, wholeBuffer.modifyType, elementOffset, elementSize, stride);
    }
    create2DGraphicWoleBuffer(): I2DGraphicWholeBuffer {
        return new Web2DGraphicWholeBuffer();
    }

    createRender2DPassManager(): IRender2DPassManager {
        return new WebRender2DPassManager();
    }


    create2DGlobalRenderDataHandle(): I2DGlobalRenderData {
        return new WebGlobalRenderData();
    }

    createSpineRenderDataHandle(): ISpineRenderDataHandle {
        return new WebSpineRenderDataHandle();
    }

    create2D2DPrimitiveDataHandle(): I2DPrimitiveDataHandle {
        return new WebPrimitiveDataHandle();
    }
    create2DBaseRenderDataHandle(): I2DBaseRenderDataHandle {
        return new Web2DBaseRenderDataHandle();
    }
    createMesh2DRenderDataHandle(): IMesh2DRenderDataHandle {
        return new WebMesh2DRenderDataHandle();
    }

    createSetRenderDataCMD(): SetRenderDataCMD {
        return new WebGLSetRenderData();
    }

    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new WebGLSetShaderDefine();
    }

    createBlit2DQuadCMDData(): WebGLBlit2DQuadCMD {
        return new WebGLBlit2DQuadCMD();
    }

    createDraw2DElementCMDData(): Draw2DElementCMD {
        return new WebGLDraw2DElementCMD();
    }

    createSetRendertarget2DCMD(): SetRendertarget2DCMD {
        return new WebGLSetRendertarget2DCMD()
    }

    createRenderElement2D(): IRenderElement2D {
        return new WebGLRenderelement2D();
    }

    createRenderContext2D(): IRenderContext2D {
        return new WebglRenderContext2D();
    }

    createRender2DPass(): IRender2DPass {
        return new WebRender2DPass();
    }

    createRenderStruct2D(): any {
        return new WebRenderStruct2D();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.render2DRenderPassFactory)
        LayaGL.render2DRenderPassFactory = new WebGLRender2DProcess();
});