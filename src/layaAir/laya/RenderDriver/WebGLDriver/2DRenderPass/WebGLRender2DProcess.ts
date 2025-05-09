import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { I2DPrimitiveDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle, IGlobalRenderData } from "../../RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { WebRender2DPass } from "../../RenderModuleData/WebModuleData/2D/WebRender2DPass";
import { Web2DBaseRenderDataHandle, WebMesh2DRenderDataHandle, WebPrimitiveDataHandle } from "../../RenderModuleData/WebModuleData/2D/WebRenderDataHandle";
import { WebGlobalRenderData, WebRenderStruct2D } from "../../RenderModuleData/WebModuleData/2D/WebRenderStruct2D";
import { WebGLSetRenderData, WebGLSetShaderDefine } from "../RenderDevice/WebGLRenderCMD";
import { WebGLBlit2DQuadCMD, WebGLDraw2DElementCMD, WebGLSetRendertarget2DCMD } from "./WebGL2DRenderCMD";
import { WebglRenderContext2D } from "./WebGLRenderContext2D";
import { WebGLRenderelement2D } from "./WebGLRenderElement2D";

export class WebGLRender2DProcess implements I2DRenderPassFactory {

    constructor() {
    }
    create2DGlobalRenderDataHandle(): IGlobalRenderData {
        return new WebGlobalRenderData();
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