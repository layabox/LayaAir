import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Camera } from "../../../d3/core/Camera";
import { Transform3D } from "../../../d3/core/Transform3D";
import { SceneRenderManagerOBJ } from "../../../d3/core/scene/SceneRenderManagerOBJ";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { FastSinglelist, SingletonList } from "../../../utils/SingletonList";
import { IRender3DProcess, IRenderContext3D, IRenderElement3D, IInstanceRenderBatch, IInstanceRenderElement3D, ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD } from "../../DriverDesign/3DRenderPass/IRender3DCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { SetRenderDataCMD, SetShaderDefineCMD, IRenderCMD, RenderCMDType } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { ISceneNodeData, ICameraNodeData, IBaseRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { NoRenderSetRenderData, NoRenderSetShaderDefine, NoRenderShaderData } from "../DriverDevice/NoRenderDeviceFactory";
import { NoInternalRT } from "../DriverDevice/NoRenderEngineFactory";

export class NoRender3DRenderPassFactory implements I3DRenderPassFactory {
    createRender3DProcess(): IRender3DProcess {
        return new NoRenderRender3DProcess();
    }
    createRenderContext3D(): IRenderContext3D {
        return new NoRenderRenderContext3D();
    }
    createRenderElement3D(): IRenderElement3D {
        return new NoRenderRenderElement3D();
    }
    createInstanceBatch(): IInstanceRenderBatch {
        return new NoRenderInstanceRenderBatch();
    }
    createInstanceRenderElement3D(): IInstanceRenderElement3D {
        return new NoRenderInstanceRenderElement3D;
    }
    createSkinRenderElement(): ISkinRenderElement3D {
        return new NoRenderSkinRenderElement3D();
    }
    createSceneRenderManager(): ISceneRenderManager {
        return new SceneRenderManagerOBJ();
    }
    createDrawNodeCMDData(): DrawNodeCMDData {
        return new NoRenderDrawNodeCMDData();
    }
    createBlitQuadCMDData(): BlitQuadCMDData {
        return new NoRenderBlitQuadCMDData();
    }
    createDrawElementCMDData(): DrawElementCMDData {
        return new NoRenderDrawElementCMDData();
    }
    createSetViewportCMD(): SetViewportCMD {
        return new NoRenderSetViewportCMD();
    }
    createSetRenderTargetCMD(): SetRenderTargetCMD {
        return new NoRenderSetRenderTargetCMD();
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
        return new NoRenderSetRenderData();
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new NoRenderSetShaderDefine();
    }
}

export class NoRenderRender3DProcess implements IRender3DProcess {
    fowardRender(context: IRenderContext3D, camera: Camera): void {
    }
}

export class NoRenderRenderContext3D implements IRenderContext3D {
    globalShaderData: ShaderData;
    sceneData: ShaderData;
    sceneModuleData: ISceneNodeData;
    cameraModuleData: ICameraNodeData;
    cameraData: ShaderData;
    sceneUpdataMask: number;
    cameraUpdateMask: number;
    pipelineMode: string;
    invertY: boolean;
    setRenderTarget(value: InternalRenderTarget, clearFlag: RenderClearFlag): void {

    }
    setViewPort(value: Viewport): void {

    }
    setScissor(value: Vector4): void {

    }
    setClearData(clearFlag: number, clolor: Color, depth: number, stencil: number): number {
        return 0;
    }
    drawRenderElementList(list: FastSinglelist<IRenderElement3D>): number {
        return 0;
    }
    drawRenderElementOne(node: IRenderElement3D): number {
        return 0;
    }
    runOneCMD(cmd: IRenderCMD): void {

    }
    runCMDList(cmds: IRenderCMD[]): void {

    }

}

export class NoRenderRenderElement3D implements IRenderElement3D {
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    materialRenderQueue: number;
    renderShaderData: ShaderData;
    transform: Transform3D;
    canDynamicBatch: boolean;
    isRender: boolean;
    owner: IBaseRenderNode;
    subShader: SubShader;
    materialId: number;
    destroy(): void {
    }
}

export class NoRenderInstanceRenderBatch implements IInstanceRenderBatch {
    batch(elements: SingletonList<IRenderElement3D>): void {
    }
    clearRenderData(): void {
    }
    recoverData(): void {
    }

}

export class NoRenderInstanceRenderElement3D implements IInstanceRenderElement3D {
    instanceElementList: SingletonList<IRenderElement3D>;
    setGeometry(geometry: IRenderGeometryElement): void {
    }
    clearRenderData(): void {
    }
    recover(): void {
    }
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    materialRenderQueue: number;
    renderShaderData: ShaderData;
    transform: Transform3D;
    canDynamicBatch: boolean;
    isRender: boolean;
    owner: IBaseRenderNode;
    subShader: SubShader;
    materialId: number;
    destroy(): void {
    }

}

export class NoRenderSkinRenderElement3D implements ISkinRenderElement3D {
    skinnedData: Float32Array[] = [];
}


export class NoRenderDrawNodeCMDData extends DrawNodeCMDData {
    type: RenderCMDType;

    protected _node: WebBaseRenderNode;
    protected _destShaderData: NoRenderShaderData;
    protected _destSubShader: SubShader;
    protected _subMeshIndex: number;

    get node(): WebBaseRenderNode {
        return this._node;
    }

    set node(value: WebBaseRenderNode) {
        this._node = value;
    }

    get destShaderData(): NoRenderShaderData {
        return this._destShaderData;
    }

    set destShaderData(value: NoRenderShaderData) {
        this._destShaderData = value;
    }

    get destSubShader(): SubShader {
        return this._destSubShader;
    }

    set destSubShader(value: SubShader) {
        this._destSubShader = value;
    }

    get subMeshIndex(): number {
        return this._subMeshIndex;
    }

    set subMeshIndex(value: number) {
        this._subMeshIndex = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.DrawNode;
    }

    apply(context: NoRenderRenderContext3D): void {
    }
}

export class NoRenderBlitQuadCMDData extends BlitQuadCMDData {
    type: RenderCMDType;
    private _sourceTexelSize: Vector4;
    protected _dest: NoInternalRT;
    protected _viewport: Viewport;
    protected _source: InternalTexture;
    protected _scissor: Vector4;
    protected _offsetScale: Vector4;
    protected _element: NoRenderRenderElement3D;

    get dest(): NoInternalRT {
        return this._dest;
    }

    set dest(value: NoInternalRT) {
        this._dest = value;
    }

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        value.cloneTo(this._viewport);
    }

    get scissor(): Vector4 {
        return this._scissor;
    }

    set scissor(value: Vector4) {
        value.cloneTo(this._scissor);
    }

    get source(): InternalTexture {
        return this._source;
    }

    set source(value: InternalTexture) {
        this._source = value;
        if (this._source) {
            this._sourceTexelSize.setValue(1.0 / this._source.width, 1.0 / this._source.height, this._source.width, this._source.height);
        }
    }

    get offsetScale(): Vector4 {
        return this._offsetScale;
    }

    set offsetScale(value: Vector4) {
        value.cloneTo(this._offsetScale);
    }

    get element(): NoRenderRenderElement3D {
        return this._element;
    }
    set element(value: NoRenderRenderElement3D) {
        this._element = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.Blit;
        this._viewport = new Viewport();
        this._scissor = new Vector4();
        this._offsetScale = new Vector4();
        this._sourceTexelSize = new Vector4();
    }

    apply(context: NoRenderRenderContext3D): void {
    }
}

export class NoRenderDrawElementCMDData extends DrawElementCMDData {
    type: RenderCMDType;
    private _elemets: NoRenderRenderElement3D[] = [];
    constructor() {
        super();
        this.type = RenderCMDType.DrawElement;
    }

    setRenderelements(value: NoRenderRenderElement3D[]): void {
        this._elemets = value;
    }

    apply(context: NoRenderRenderContext3D): void {
    }
}

export class NoRenderSetViewportCMD extends SetViewportCMD {
    type: RenderCMDType;
    protected _viewport: Viewport;
    protected _scissor: Vector4;

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        this._viewport = value;
    }

    get scissor(): Vector4 {
        return this._scissor;
    }

    set scissor(value: Vector4) {
        this._scissor = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeViewPort;
        this.scissor = new Vector4();
        this.viewport = new Viewport();
    }

    apply(context: NoRenderRenderContext3D): void {
    }
}

const viewport = new Viewport();
const scissor = new Vector4();
export class NoRenderSetRenderTargetCMD extends SetRenderTargetCMD {
    type: RenderCMDType;
    protected _rt: InternalRenderTarget;
    protected _clearFlag: number;
    protected _clearColorValue: Color;
    protected _clearDepthValue: number;
    protected _clearStencilValue: number;

    get rt(): InternalRenderTarget {
        return this._rt;
    }

    set rt(value: InternalRenderTarget) {
        this._rt = value;
    }

    get clearFlag(): number {
        return this._clearFlag;
    }
    set clearFlag(value: number) {
        this._clearFlag = value;
    }

    get clearColorValue(): Color {
        return this._clearColorValue;
    }

    set clearColorValue(value: Color) {
        value.cloneTo(this._clearColorValue);
    }

    get clearDepthValue(): number {
        return this._clearDepthValue;
    }

    set clearDepthValue(value: number) {
        this._clearDepthValue = value;
    }

    get clearStencilValue(): number {
        return this._clearStencilValue;
    }

    set clearStencilValue(value: number) {
        this._clearStencilValue = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeRenderTarget;
        this._clearColorValue = new Color();
    }

    apply(context: NoRenderRenderContext3D): void {
    }
}
