import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRender2DDataHandle, I2DPrimitiveDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle,IGlobalRenderData } from "../../RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { WebGPUSetRenderData } from "../RenderDevice/WebGPUSetRenderData";
import { WebGPUSetShaderDefine } from "../RenderDevice/WebGPUSetShaderDefine";
import { WebGPUBlit2DQuadCMD, WebGPUDraw2DElementCMD, WebGPUSetRendertarget2DCMD } from "./WebGPU2DRenderCMD";
import { WebGPURenderContext2D } from "./WebGPURenderContext2D";
import { WebGPURenderElement2D } from "./WebGPURenderElement2D";

export class WebGPURender2DProcess implements I2DRenderPassFactory {
    create2DGlobalRenderDataHandle(): IGlobalRenderData {
        throw new Error("Method not implemented.");
    }
    createSpineRenderDataHandle(): ISpineRenderDataHandle {
        throw new Error("Method not implemented.");
    }
    createRender2DPass(): IRender2DPass {
        throw new Error("Method not implemented.");
    }
    createRenderStruct2D(): IRenderStruct2D {
        throw new Error("Method not implemented.");
    }
    createRender2DDataHandle(): IRender2DDataHandle {
        throw new Error("Method not implemented.");
    }
    create2D2DPrimitiveDataHandle(): I2DPrimitiveDataHandle {
        throw new Error("Method not implemented.");
    }
    create2DBaseRenderDataHandle(): I2DBaseRenderDataHandle {
        throw new Error("Method not implemented.");
    }
    createMesh2DRenderDataHandle(): IMesh2DRenderDataHandle {
        throw new Error("Method not implemented.");
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
        return new WebGPUSetRenderData();
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new WebGPUSetShaderDefine();
    }
    createBlit2DQuadCMDData(): Blit2DQuadCMD {
        return new WebGPUBlit2DQuadCMD();
    }
    createDraw2DElementCMDData(): Draw2DElementCMD {
        return new WebGPUDraw2DElementCMD();
    }
    createSetRendertarget2DCMD(): SetRendertarget2DCMD {
        return new WebGPUSetRendertarget2DCMD();
    }
    createRenderElement2D(): IRenderElement2D {
        return new WebGPURenderElement2D();
    }
    createRenderContext2D(): IRenderContext2D {
        return new WebGPURenderContext2D();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.render2DRenderPassFactory)
        LayaGL.render2DRenderPassFactory = new WebGPURender2DProcess();
});