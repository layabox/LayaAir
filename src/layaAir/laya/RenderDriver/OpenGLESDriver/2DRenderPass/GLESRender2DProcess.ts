import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRender2DDataHandle, I2DPrimitiveDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle ,IGlobalRenderData} from "../../RenderModuleData/Design/2D/IRender2DDataHandle"
import { IRender2DPass } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { GLESSetRenderData, GLESSetShaderDefine } from "../RenderDevice/GLESRenderCMD";
import { GLESBlit2DQuadCMD, GLESDraw2DElementCMD, GLESSetRendertarget2DCMD } from "./GLES2DRenderCMD";
import { GLESREnderContext2D } from "./GLESRenderContext2D";
import { GLESREnderElement2D } from "./GLESRenderElement2D";

export class GLESRender2DProcess implements I2DRenderPassFactory {
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