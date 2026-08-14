import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRender2DDataHandle, IGraphicsSingleQuadDataHandle, IGraphicsCommandStreamDataHandle, ISubStructRenderDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle, I2DGlobalRenderData, IGraphicsOp2DFactory } from "../../RenderModuleData/Design/2D/IRender2DDataHandle"
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { RTRender2DPass, RTRender2DPassManager } from "../../RenderModuleData/RuntimeModuleData/2D/RTRender2DPass";
import { RTBaseRenderDataHandle, RTEmptyRender2DDataHandle, RTGraphicsSingleQuadDataHandle, RTGraphicsCommandStreamDataHandle, RTMesh2DRenderDataHandle, RTSubStructRenderDataHandle } from "../../RenderModuleData/RuntimeModuleData/2D/RTRenderDataHandle";
import { RTGlobalRenderData, RTRenderStruct2D } from "../../RenderModuleData/RuntimeModuleData/2D/RTRenderStruct2D";
import { ITransform2DMemoryFactory } from "../../../display/transform2d/ITransform2DMemory";
import { GLESSetRenderData, GLESSetShaderDefine } from "../RenderDevice/GLESRenderCMD";
import { GLESBlit2DQuadCMD, GLESDraw2DElementCMD, GLESSetRendertarget2DCMD } from "./GLES2DRenderCMD";
import { GLESRenderContext2D } from "./GLESRenderContext2D";
import { GLESRenderElement2D } from "./GLESRenderElement2D";
import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { GLESPrimitiveRenderElement2D } from "./GLESPrimitiveRenderElement2D";
import { RTTransform2DMemoryFactory } from "../../RenderModuleData/RuntimeModuleData/2D/RTTransform2DStore";
import { GLESGraphicsOp2DFactory } from "./GLESGraphicsOp2DFactory";

export class GLESRender2DProcess implements I2DRenderPassFactory {
    createTransform2DMemoryFactory(): ITransform2DMemoryFactory {
        // 数据创建下沉 native:JS 用 NativeMemory 分配共享块、传下去让 native 绑定。GLES/LayaX 不回退 WebMemory。
        return new RTTransform2DMemoryFactory();
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
    createSubStructRenderDataHandle(): ISubStructRenderDataHandle {
        return new RTSubStructRenderDataHandle();
    }
    createGraphicsSingleQuadDataHandle(): IGraphicsSingleQuadDataHandle {
        return new RTGraphicsSingleQuadDataHandle();
    }
    createGraphicsCommandStreamDataHandle(): IGraphicsCommandStreamDataHandle {
        return new RTGraphicsCommandStreamDataHandle();
    }
    createGraphicsOp2DFactory(): IGraphicsOp2DFactory {
        return new GLESGraphicsOp2DFactory();
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
