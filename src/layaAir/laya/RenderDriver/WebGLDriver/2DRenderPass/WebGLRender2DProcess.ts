import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IPrimitiveRenderElement2D, IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IGraphicsSingleQuadDataHandle, IGraphicsCommandStreamDataHandle, ISubStructRenderDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle, I2DGlobalRenderData, IRender2DDataHandle, IGraphicsOp2DFactory } from "../../RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { WebRender2DPass, WebRender2DPassManager } from "../../RenderModuleData/WebModuleData/2D/WebRender2DPass";
import { Web2DBaseRenderDataHandle, WebEmptyRender2DDataHandle, WebGraphicsSingleQuadDataHandle, WebGraphicsCommandStreamDataHandle, WebMesh2DRenderDataHandle, WebSubStructRenderDataHandle } from "../../RenderModuleData/WebModuleData/2D/WebRenderDataHandle";
import { WebGlobalRenderData, WebRenderStruct2D } from "../../RenderModuleData/WebModuleData/2D/WebRenderStruct2D";
import { ITransform2DMemoryFactory } from "../../../display/transform2d/ITransform2DMemory";
import { WebGLSetRenderData, WebGLSetShaderDefine } from "../RenderDevice/WebGLRenderCMD";
import { WebGLBlit2DQuadCMD, WebGLDraw2DElementCMD, WebGLSetRendertarget2DCMD } from "./WebGL2DRenderCMD";
import { WebGLPrimitiveRenderElement2D } from "./WebGLPrimitiveRenderElement2D";
import { WebglRenderContext2D } from "./WebGLRenderContext2D";
import { WebGLRenderElement2D } from "./WebGLRenderElement2D";
import { WebGLStencilMaskElement2D } from "./WebGLStencilMaskElement2D";
import { WebTransform2DMemoryFactory } from "../../RenderModuleData/WebModuleData/2D/WebTransform2DMemoryFactory";
import { WebGraphicsOp2DFactory } from "../../RenderModuleData/WebModuleData/2D/WebGraphicsOp2DFactory";

export class WebGLRender2DProcess implements I2DRenderPassFactory {

    constructor() {

    }

    createTransform2DMemoryFactory(): ITransform2DMemoryFactory {
        return new WebTransform2DMemoryFactory();
    }

    createPrimitiveRenderElement2D(): IPrimitiveRenderElement2D {
        return new WebGLPrimitiveRenderElement2D();
    }

    createRender2DPassManager(): IRender2DPassManager {
        return new WebRender2DPassManager();
    }


    create2DGlobalRenderDataHandle(): I2DGlobalRenderData {
        return new WebGlobalRenderData();
    }

    createSubStructRenderDataHandle(): ISubStructRenderDataHandle {
        return new WebSubStructRenderDataHandle();
    }
    createGraphicsSingleQuadDataHandle(): IGraphicsSingleQuadDataHandle {
        return new WebGraphicsSingleQuadDataHandle();
    }
    createGraphicsCommandStreamDataHandle(): IGraphicsCommandStreamDataHandle {
        return new WebGraphicsCommandStreamDataHandle();
    }
    createGraphicsOp2DFactory(): IGraphicsOp2DFactory {
        return new WebGraphicsOp2DFactory();
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

    createBlit2DQuadCMDData(): Blit2DQuadCMD {
        return new WebGLBlit2DQuadCMD();
    }

    createDraw2DElementCMDData(): Draw2DElementCMD {
        return new WebGLDraw2DElementCMD();
    }

    createSetRendertarget2DCMD(): SetRendertarget2DCMD {
        return new WebGLSetRendertarget2DCMD()
    }

    createRenderElement2D(): IRenderElement2D {
        return new WebGLRenderElement2D();
    }

    createStencilMaskElement2D(): IRenderElement2D {
        return WebGLStencilMaskElement2D.create();
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

    createEmptyRenderDataHandle(): IRender2DDataHandle {
        return new WebEmptyRender2DDataHandle();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.render2DRenderPassFactory)
        LayaGL.render2DRenderPassFactory = new WebGLRender2DProcess();
});
