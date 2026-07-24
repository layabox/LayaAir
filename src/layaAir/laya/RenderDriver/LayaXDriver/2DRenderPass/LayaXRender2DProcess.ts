import { Laya } from "../../../../Laya";
import { Matrix } from "../../../maths/Matrix";
import { LayaGL } from "../../../layagl/LayaGL";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IPrimitiveRenderElement2D, IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import {
    I2DBaseRenderDataHandle, IGraphicsSingleQuadDataHandle, IGraphicsCommandStreamDataHandle, ISubStructRenderDataHandle,
    IMesh2DRenderDataHandle, I2DGlobalRenderData,
    IRender2DDataHandle, IGraphicsOp2DFactory
} from "../../RenderModuleData/Design/2D/IRender2DDataHandle";

// ===== RT* moduleData (复用) =====
import { RTRender2DPass, RTRender2DPassManager } from "../../RenderModuleData/RuntimeModuleData/2D/RTRender2DPass";
import {
    RTBaseRenderDataHandle, RTEmptyRender2DDataHandle,
    RTGraphicsSingleQuadDataHandle, RTGraphicsCommandStreamDataHandle, RTMesh2DRenderDataHandle,
    RTSubStructRenderDataHandle
} from "../../RenderModuleData/RuntimeModuleData/2D/RTRenderDataHandle";
import { RTGlobalRenderData, RTRenderStruct2D } from "../../RenderModuleData/RuntimeModuleData/2D/RTRenderStruct2D";
import { ITransform2DMemoryFactory } from "../../../display/transform2d/ITransform2DMemory";

// ===== LayaX RenderDriver 层 =====
import { LayaXRenderElement2D } from "./LayaXRenderElement2D";
import { LayaXPrimitiveRenderElement2D } from "./LayaXPrimitiveRenderElement2D";
import { LayaXRenderContext2D } from "./LayaXRenderContext2D";
import { LayaXSetRendertarget2DCMD, LayaXDraw2DElementCMD, LayaXBlit2DQuadCMD } from "./LayaX2DRenderCMD";
import { LayaXSetRenderData, LayaXSetShaderDefine } from "../RenderDevice/LayaXRenderCMD";
import { RTTransform2DMemoryFactory } from "../../RenderModuleData/RuntimeModuleData/2D/RTTransform2DStore";
import { LayaXGraphicsOp2DFactory } from "./LayaXGraphicsOp2DFactory";

/**
 * RTRender2DPass 的 LayaX 子类。
 * super(true) 跳过 conchRTRender2DPass 创建，改用 conchLayaXRender2DPass。
 * _nativeObj 设置后需重新推送初始属性到 native。
 */
class LayaXRTRender2DPass extends RTRender2DPass {
    constructor() {
        super(true);
        this._nativeObj = new (window as any).conchLayaXRender2DPass(
            (this as any)._shaderData._nativeObj
        );
        this._nativeObj.bindPass2DBuffer((this as any)._propsBuf);
        // 重新推送初始状态到 LayaX native（父类构造跳过了这些）
        this.enable = true;
        this.enableBatch = true;
        this.isSupport = false;
        this.doClearColor = true;
        this.repaint = true;
        this.priority = 0;
        this.offsetMatrix = new Matrix();
    }
}

export class LayaXRender2DProcess implements I2DRenderPassFactory {

    // ============================
    // RenderDriver 层: LayaX 实现
    // ============================

    createTransform2DMemoryFactory(): ITransform2DMemoryFactory {
        // 数据创建下沉 native:JS 用 NativeMemory 分配共享块、传下去让 native 绑定。GLES/LayaX 不回退 WebMemory。
        return new RTTransform2DMemoryFactory();
    }

    createRenderElement2D(): IRenderElement2D {
        return new LayaXRenderElement2D();
    }

    createPrimitiveRenderElement2D(): IPrimitiveRenderElement2D {
        return new LayaXPrimitiveRenderElement2D();
    }

    createRenderContext2D(): IRenderContext2D {
        return new LayaXRenderContext2D();
    }

    createBlit2DQuadCMDData(): Blit2DQuadCMD {
        return new LayaXBlit2DQuadCMD();
    }

    createDraw2DElementCMDData(): Draw2DElementCMD {
        return new LayaXDraw2DElementCMD();
    }

    createSetRendertarget2DCMD(): SetRendertarget2DCMD {
        return new LayaXSetRendertarget2DCMD();
    }

    createSetRenderDataCMD(): SetRenderDataCMD {
        return new LayaXSetRenderData();
    }

    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new LayaXSetShaderDefine();
    }

    // ============================
    // moduleData 层: 全部复用 RT*
    // ============================

    createRender2DPass(): IRender2DPass {
        return new LayaXRTRender2DPass();
    }

    createRenderStruct2D(): IRenderStruct2D {
        return new RTRenderStruct2D();
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
        return new LayaXGraphicsOp2DFactory();
    }

    create2DBaseRenderDataHandle(): I2DBaseRenderDataHandle {
        return new RTBaseRenderDataHandle();
    }

    createMesh2DRenderDataHandle(): IMesh2DRenderDataHandle {
        return new RTMesh2DRenderDataHandle();
    }

    createEmptyRenderDataHandle(): IRender2DDataHandle {
        return new RTEmptyRender2DDataHandle();
    }
}

// ============================
// 注册入口
// ============================
Laya.addBeforeInitCallback(() => {
    if ((window as any).conchLayaXRenderElement2D) {
        LayaGL.render2DRenderPassFactory = new LayaXRender2DProcess();
    }
});
