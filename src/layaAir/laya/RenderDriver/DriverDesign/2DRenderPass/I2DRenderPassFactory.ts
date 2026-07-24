import { SetRenderDataCMD, SetShaderDefineCMD } from "../RenderDevice/IRenderCMD";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "./IRender2DCMD";
import { IRenderContext2D } from "./IRenderContext2D";
import { IPrimitiveRenderElement2D, IRenderElement2D } from "./IRenderElement2D";
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { I2DBaseRenderDataHandle, IGraphicsSingleQuadDataHandle, IGraphicsCommandStreamDataHandle, ISubStructRenderDataHandle, IMesh2DRenderDataHandle, I2DGlobalRenderData, IRender2DDataHandle, IGraphicsOp2DFactory } from "../../RenderModuleData/Design/2D/IRender2DDataHandle"
import { ITransform2DMemoryFactory } from "../../../display/transform2d/ITransform2DMemory";

export interface I2DRenderPassFactory {

    /**
     * @zh 创建 Transform2D SoA 的列 buffer 工厂(数据来源)。各后端分别给：Web=JS TypedArray(只 JS 读写)；
     * GLES/LayaX=native 共享 ArrayBuffer view(上下层都读写，数据创建下沉 native，native 直接操作那份内存)。
     */
    createTransform2DMemoryFactory(): ITransform2DMemoryFactory;
    createRenderElement2D(): IRenderElement2D;

    /** @internal WebGL 2D stencil clipping mask element. Backends without this path can omit it. */
    createStencilMaskElement2D?(): IRenderElement2D;

    createPrimitiveRenderElement2D(): IPrimitiveRenderElement2D;

    createRenderContext2D(): IRenderContext2D;

    createBlit2DQuadCMDData(): Blit2DQuadCMD;

    createDraw2DElementCMDData(): Draw2DElementCMD;

    createSetRendertarget2DCMD(): SetRendertarget2DCMD;

    createSetRenderDataCMD(): SetRenderDataCMD;

    createSetShaderDefineCMD(): SetShaderDefineCMD;

    createRender2DPass(): IRender2DPass;

    createRenderStruct2D(): IRenderStruct2D;

    createRender2DPassManager(): IRender2DPassManager;

    createSubStructRenderDataHandle(): ISubStructRenderDataHandle;

    createGraphicsSingleQuadDataHandle(): IGraphicsSingleQuadDataHandle;

    createGraphicsCommandStreamDataHandle(): IGraphicsCommandStreamDataHandle;

    createGraphicsOp2DFactory(): IGraphicsOp2DFactory;

    create2DBaseRenderDataHandle(): I2DBaseRenderDataHandle;

    createMesh2DRenderDataHandle(): IMesh2DRenderDataHandle;

    create2DGlobalRenderDataHandle(): I2DGlobalRenderData;

    /** 创建仅跑 clip/alpha 流程的空 handle，用于无 2D 渲染节点但需继承父级裁剪的节点 */
    createEmptyRenderDataHandle(): IRender2DDataHandle;
}
