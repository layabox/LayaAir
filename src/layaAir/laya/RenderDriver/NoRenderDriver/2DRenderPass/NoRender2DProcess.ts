import { Sprite } from "../../../display/Sprite";
import { PostProcess2D } from "../../../display/PostProcess2D";
import { Matrix } from "../../../maths/Matrix";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Color } from "../../../maths/Color";
import { BaseTexture } from "../../../resource/BaseTexture";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { SingletonList } from "../../../utils/SingletonList";
import { BlendMode } from "../../../webgl/canvas/BlendMode";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IPrimitiveRenderElement2D, IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderCMD, SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { NoRenderSetRenderData, NoRenderSetShaderDefine } from "../DriverDevice/NoRenderDeviceFactory";
import { IRender2DDataHandle, I2DPrimitiveDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle, I2DGlobalRenderData, ISpineRenderDataHandle, I2DGraphicWholeBuffer, I2DGraphicIndexDataView, I2DGraphicVertexDataView, I2DGraphicBufferDataView, IGraphics2DBufferBlock, IGraphics2DVertexBlock } from "../../RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";


export class NoRender2DProcess implements I2DRenderPassFactory {
    createGraphic2DBufferBlock(): IGraphics2DBufferBlock {
        return new NoRenderGraphics2DBufferBlock();
    }

    createGraphic2DVertexBlock(): IGraphics2DVertexBlock {
        return new NoRenderGraphics2DVertexBlock();
    }

    create2DGraphicVertexDataView(wholeBuffer: I2DGraphicWholeBuffer, elementOffset: number, elementSize: number, stride: number): I2DGraphicVertexDataView {
        return new NoRender2DGraphicVertexDataView();
    }
    create2DGraphicIndexDataView(wholeBuffer: I2DGraphicWholeBuffer, elementSize: number): I2DGraphicIndexDataView {
        return new NoRender2DGraphicIndexDataView();
    }
    create2DGraphicIndexBuffer(): I2DGraphicWholeBuffer {
        return new NoRender2DGraphicWholeBuffer();
    }

    create2DGraphicVertexBuffer(): I2DGraphicWholeBuffer {
        return new NoRender2DGraphicWholeBuffer();
    }

    createRender2DPassManager(): IRender2DPassManager {
        return new NoRenderRender2DPassManager();
    }

    create2DGlobalRenderDataHandle(): I2DGlobalRenderData {
        return new NoRender2DGlobalRenderData();
    }
    createSpineRenderDataHandle(): ISpineRenderDataHandle {
        return new NoRenderSpineRenderDataHandle();
    }
    createRender2DPass(): IRender2DPass {
        return new NoRenderRender2DPass();
    }
    createRenderStruct2D(): IRenderStruct2D {
        return new NoRenderRenderStruct2D();
    }
    createRender2DDataHandle(): IRender2DDataHandle {
        return new NoRenderRender2DDataHandle();
    }
    create2D2DPrimitiveDataHandle(): I2DPrimitiveDataHandle {
        return new NoRender2DPrimitiveDataHandle();
    }
    create2DBaseRenderDataHandle(): I2DBaseRenderDataHandle {
        return new NoRender2DBaseRenderDataHandle();
    }
    createMesh2DRenderDataHandle(): IMesh2DRenderDataHandle {
        return new NoRenderMesh2DRenderDataHandle();
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
        return new NoRenderSetRenderData();
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new NoRenderSetShaderDefine();
    }
    createBlit2DQuadCMDData(): Blit2DQuadCMD {
        return new NoRenderBlit2DquadCMD();
    }
    createDraw2DElementCMDData(): Draw2DElementCMD {
        return new NoRenderDraw2DElementCMD();
    }
    createSetRendertarget2DCMD(): SetRendertarget2DCMD {
        return new NoRenderSetRendertarget2DCMD();
    }
    createRenderElement2D(): IRenderElement2D {
        return new NoRenderElement2D()
    }
    createPrimitiveRenderElement2D(): IPrimitiveRenderElement2D {
        return null;
    }
    createRenderContext2D(): IRenderContext2D {
        return new NoRenderContext2D();
    }
    createEmptyRenderDataHandle(): IRender2DDataHandle {
        return null;
    }

}

export class NoRenderElement2D implements IRenderElement2D {
    type: number;
    owner: IRenderStruct2D;
    nodeCommonMap: string[];
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    value2DShaderData: ShaderData;
    primitiveShaderData: ShaderData;
    subShader: SubShader;
    renderStateIsBySprite: boolean;
    globalShaderData: ShaderData;

    destroy(): void {

    }

}

export class NoRenderContext2D implements IRenderContext2D {
    passData: ShaderData;
    getRenderTarget(): InternalRenderTarget {
        return null;
    }

    sceneData: ShaderData;
    invertY: boolean;
    pipelineMode: string;
    setRenderTarget(value: InternalRenderTarget, clear: boolean, clearColor: Color): void {

    }
    setOffscreenView(width: number, height: number, x?: number, y?: number): void {

    }
    getOffscreenView(out: Vector4): void {

    }
    drawRenderElementOne(node: IRenderElement2D): void {

    }
    drawRenderElementList(list: SingletonList<IRenderElement2D>): number {
        return 0;
    }
    runOneCMD(cmd: IRenderCMD): void {
    }
    runCMDList(cmds: IRenderCMD[]): void {
    }
}

export class NoRenderBlit2DquadCMD extends Blit2DQuadCMD {
    apply(context: IRenderContext2D): void {
    }
}

export class NoRenderDraw2DElementCMD extends Draw2DElementCMD {
    setRenderelements(value: IRenderElement2D[]): void {
    }
    apply(context: IRenderContext2D): void {
    }
}

export class NoRenderSetRendertarget2DCMD extends SetRendertarget2DCMD {
    apply(context: IRenderContext2D): void {
    }
}

// ---------------------------------------------------------------------------
// Null data classes for interfaces that previously returned null or threw
// ---------------------------------------------------------------------------

export class NoRenderRender2DDataHandle implements IRender2DDataHandle {
    needUseMatrix: boolean = false;
    inheriteRenderData(context: IRenderContext2D): void {
    }
    destroy(): void {
    }
}

export class NoRender2DBaseRenderDataHandle extends NoRenderRender2DDataHandle implements I2DBaseRenderDataHandle {
    lightReceive: boolean = false;
}

export class NoRender2DPrimitiveDataHandle extends NoRenderRender2DDataHandle implements I2DPrimitiveDataHandle {
    mask: IRenderStruct2D | null = null;
    logicMatrix: Matrix | null = null;
    applyVertexBufferBlock(views: IGraphics2DBufferBlock[]): void {
    }
    skipBufferUpdate(): void {
    }
}

export class NoRenderMesh2DRenderDataHandle extends NoRender2DBaseRenderDataHandle implements IMesh2DRenderDataHandle {
    baseColor: Color;
    baseTexture: BaseTexture;
    normal2DTexture: BaseTexture;
    normal2DStrength: number = 0;
    tilingOffset: Vector4;
}

export class NoRenderSpineRenderDataHandle extends NoRender2DBaseRenderDataHandle implements ISpineRenderDataHandle {
    baseColor: Color;
    skeleton: spine.Skeleton;
    offset: Vector2;
}

export class NoRender2DGlobalRenderData implements I2DGlobalRenderData {
    cullRect: Vector4;
    renderLayerMask: number = 0;
    globalShaderData: ShaderData;
}

export class NoRender2DGraphicVertexDataView implements I2DGraphicVertexDataView {
    length: number = 0;
    start: number = 0;
    stride: number = 0;
    setData(data: ArrayLike<number>): void {
    }
}

export class NoRender2DGraphicIndexDataView implements I2DGraphicIndexDataView {
    length: number = 0;
    setData(data: ArrayLike<number>): void {
    }
    setGeometry(value: IRenderGeometryElement): void {
    }
    destroy(): void {
    }
}

export class NoRender2DGraphicWholeBuffer implements I2DGraphicWholeBuffer {
    buffer: IVertexBuffer | IIndexBuffer;
    resetData(byteLength: number): void {
    }
    addDataView(dataView: I2DGraphicBufferDataView): void {
    }
    removeDataView(dataView: I2DGraphicBufferDataView): void {
    }
    destroy(): void {
    }
}

export class NoRenderGraphics2DVertexBlock implements IGraphics2DVertexBlock {
    positions: number[] = [];
    vertexViews: I2DGraphicVertexDataView[] = [];
}

export class NoRenderGraphics2DBufferBlock implements IGraphics2DBufferBlock {
    vertexs: IGraphics2DVertexBlock[] = [];
    indexView: I2DGraphicIndexDataView;
    vertexBuffer: IVertexBuffer;
    textureArrayIndex: number = 0;
}

export class NoRenderRender2DPass implements IRender2DPass {
    updatePostProcess(): void {

    }
    enable: boolean = false;
    enableBatch: boolean = false;
    isSupport: boolean = false;
    root: IRenderStruct2D;
    doClearColor: boolean = false;
    postProcess: PostProcess2D;
    mask: IRenderStruct2D;
    repaint: boolean = false;
    renderTexture: RenderTexture2D;
    priority: number = 0;
    shaderData: ShaderData;
    offsetMatrix: Matrix;
    needRender(): boolean {
        return false;
    }
    setClearColor(r: number, g: number, b: number, a: number): void {
    }
    fowardRender(context: IRenderContext2D): void {
    }
    destroy(): void {
    }
}

export class NoRenderRender2DPassManager implements IRender2DPassManager {
    addPass(pass: IRender2DPass): void {
    }
    removePass(pass: IRender2DPass): void {
    }
    apply(context: IRenderContext2D): void {
    }
    clear(): void {
    }
}

export class NoRenderRenderStruct2D implements IRenderStruct2D {
    manualRender: boolean;
    subStruct: IRenderStruct2D;
    owner: Sprite;
    zIndex: number = 0;
    stackingRoot: boolean = false;
    enableCulling: boolean = false;
    get inheritedEnableCulling(): boolean { return false; }
    rect: Rectangle;
    renderLayer: number = 0;
    parent: IRenderStruct2D | null = null;
    children: IRenderStruct2D[] = [];
    renderType: number = 0;
    renderUpdateMask: number = 0;
    renderMatrix: Matrix;
    get globalAlpha(): number { return 1; }
    alpha: number = 1;
    blendMode: BlendMode;
    enabled: boolean = false;
    dcOptimize: boolean = false;
    get inheritedDcOptimize(): boolean { return false; }
    isRenderStruct: boolean = false;
    renderElements: IRenderElement2D[] = [];
    spriteShaderData: ShaderData;
    renderDataHandler: IRender2DDataHandle;
    globalRenderData: I2DGlobalRenderData;
    pass: IRender2DPass;
    setRepaint(): void {
    }
    addChild(child: IRenderStruct2D, index: number): void {
    }
    updateChildIndex(child: IRenderStruct2D, oldIndex: number, index: number): void {
    }
    removeChild(child: IRenderStruct2D): void {
    }
    setClipRect(rect: Rectangle): void {
    }
    setRenderUpdateCallback(func: Function): void {
    }
    destroy(): void {
    }
}
