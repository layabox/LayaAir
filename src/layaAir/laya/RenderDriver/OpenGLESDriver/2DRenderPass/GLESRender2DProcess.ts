import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { GLESREnderContext2D } from "./GLESRenderContext2D";
import { GLESREnderElement2D } from "./GLESRenderElement2D";

export class GLESRender2DProcess implements I2DRenderPassFactory {
    createSetRenderDataCMD(): SetRenderDataCMD {
        return null;//TODO
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return null;//TODO
    }
    createBlit2DQuadCMDData(): Blit2DQuadCMD {
        return null;//TODO
    }
    createDraw2DElementCMDData(): Draw2DElementCMD {
        return null;//TODO
    }
    createSetRendertarget2DCMD(): SetRendertarget2DCMD {
        return null;//TODO
    }
    createRenderElement2D(): GLESREnderElement2D {
        return new GLESREnderElement2D();
    }
    createRenderContext2D(): GLESREnderContext2D {
        return new GLESREnderContext2D();
    }

}


Laya.addBeforeInitCallback(() => {
    if (!LayaGL.render2DRenderPassFactory)
        LayaGL.render2DRenderPassFactory = new GLESRender2DProcess()
})