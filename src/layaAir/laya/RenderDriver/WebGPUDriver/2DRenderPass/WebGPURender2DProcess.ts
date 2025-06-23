import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { NotImplementedError } from "../../../utils/Error";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IPrimitiveRenderElement2D, IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRender2DDataHandle, I2DPrimitiveDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle, I2DGlobalRenderData, ISpineRenderDataHandle, I2DGraphicBufferDataView, I2DGraphicWholeBuffer } from "../../RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { WebGPUSetRenderData } from "../RenderDevice/WebGPUSetRenderData";
import { WebGPUSetShaderDefine } from "../RenderDevice/WebGPUSetShaderDefine";
import { WebGPUBlit2DQuadCMD, WebGPUDraw2DElementCMD, WebGPUSetRendertarget2DCMD } from "./WebGPU2DRenderCMD";
import { WebGPURenderContext2D } from "./WebGPURenderContext2D";
import { WebGPURenderElement2D } from "./WebGPURenderElement2D";

export class WebGPURender2DProcess implements I2DRenderPassFactory {
    createPrimitiveRenderElement2D(): IPrimitiveRenderElement2D {
        throw new NotImplementedError();
    }
    create2DGraphicBufferDataView(wholeBuffer: I2DGraphicWholeBuffer, elementOffset: number, elementSize: number, stride: number): I2DGraphicBufferDataView {
        throw new NotImplementedError();
    }
    create2DGraphicWoleBuffer(): I2DGraphicWholeBuffer {
        throw new NotImplementedError();
    }
    createRender2DPassManager(): IRender2DPassManager {
        throw new NotImplementedError();
    }
    create2DGlobalRenderDataHandle(): I2DGlobalRenderData {
        throw new NotImplementedError();
    }
    createSpineRenderDataHandle(): ISpineRenderDataHandle {
        throw new NotImplementedError();
    }
    createRender2DPass(): IRender2DPass {
        throw new NotImplementedError();
    }
    createRenderStruct2D(): IRenderStruct2D {
        throw new NotImplementedError();
    }
    createRender2DDataHandle(): IRender2DDataHandle {
        throw new NotImplementedError();
    }
    create2D2DPrimitiveDataHandle(): I2DPrimitiveDataHandle {
        throw new NotImplementedError();
    }
    create2DBaseRenderDataHandle(): I2DBaseRenderDataHandle {
        throw new NotImplementedError();
    }
    createMesh2DRenderDataHandle(): IMesh2DRenderDataHandle {
        throw new Error("Method not implemented.");
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
        throw new NotImplementedError();
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        throw new NotImplementedError();
    }
    createBlit2DQuadCMDData(): Blit2DQuadCMD {
        throw new NotImplementedError();
    }
    createDraw2DElementCMDData(): Draw2DElementCMD {
        throw new NotImplementedError();
    }
    createSetRendertarget2DCMD(): SetRendertarget2DCMD {
        throw new NotImplementedError();
    }
    createRenderElement2D(): IRenderElement2D {
        throw new NotImplementedError();
    }
    createRenderContext2D(): IRenderContext2D {
        throw new NotImplementedError();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.render2DRenderPassFactory)
        LayaGL.render2DRenderPassFactory = new WebGPURender2DProcess();
});