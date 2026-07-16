import { Color } from "../../../maths/Color";
import { Matrix } from "../../../maths/Matrix";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { Rectangle } from "../../../maths/Rectangle";
import { Const } from "../../../Const";
import { Sprite } from "../../../display/Sprite";
import { LayaGL } from "../../../layagl/LayaGL";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { BaseTexture } from "../../../resource/BaseTexture";
import { BlendMode, BlendModeHandler } from "../../../webgl/canvas/BlendMode";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import type { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IClipInfo, IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { I2DBaseRenderDataHandle, I2DGlobalRenderData, I2DPrimitiveDataHandle, IGraphicsOp2D, IMesh2DRenderDataHandle, IRender2DDataHandle, ISpineRenderDataHandle } from "../../RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass, IRender2DPassManager } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { Stat } from "../../../utils/Stat";
import { SpineShaderInit } from "../../../spine/shader/SpineShaderInit";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { RenderState2D } from "../../../webgl/utils/RenderState2D";
import { PostProcess2D } from "../../../display/PostProcess2D";
import { FastSinglelist } from "../../../utils/SingletonList";

// ─── Global Render Data ───

export class NoRenderGlobalRenderData implements I2DGlobalRenderData {
    cullRect: Vector4;
    renderLayerMask: number;
    globalShaderData: ShaderData;
}

abstract class NoRenderDataHandleBase implements IRender2DDataHandle {
    protected _owner: NoRenderStruct2D;
    protected _nMatrix_0 = new Vector3();
    protected _nMatrix_1 = new Vector3();

    needUseMatrix: boolean = true;

    get owner(): NoRenderStruct2D { return this._owner; }
    set owner(value: NoRenderStruct2D) { this._owner = value; }

    destroy(): void { }

    inheriteRenderData(context: IRenderContext2D): void {
        let data = this._owner?.spriteShaderData;
        if (!data) return;
        if (this.needUseMatrix) {
            let mat = this._owner.renderMatrix;
            this._nMatrix_0.setValue(mat.a, mat.c, mat.tx);
            this._nMatrix_1.setValue(mat.b, mat.d, mat.ty);
            data.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
            data.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
        }
    }
}

export class NoRenderEmptyDataHandle extends NoRenderDataHandleBase {
    inheriteRenderData(_context: IRenderContext2D): void { }
    destroy(): void { }
}

export class NoRenderPrimitiveDataHandle extends NoRenderDataHandleBase implements I2DPrimitiveDataHandle {
    logicMatrix: Matrix | null = null;
    mask: NoRenderStruct2D | null = null;

    private _modifiedFrame: number = -1;
    private _globalAlpha: number = 1;
    private _graphicsSubShader: SubShader | null = null;
    private _graphicsShaderData: ShaderData | null = null;

    setGraphicsHandleUpdateBuffer(_buffer: ArrayBuffer): void {
    }

    setGraphicsMaterialState(subShader: SubShader | null, shaderData: ShaderData | null, _useSpriteState: boolean): void {
        this._graphicsSubShader = subShader || null;
        this._graphicsShaderData = shaderData || null;
    }

    syncGraphicsOps(_ops: ReadonlyArray<IGraphicsOp2D>): void {
    }

    inheriteRenderData(context: IRenderContext2D): void {
        let data = this._owner.spriteShaderData;
        if (!data) return;

        let trans = this._owner.trans;
        let mat = trans.matrix;

        if (this._modifiedFrame < trans.modifiedFrame) {
            if (this.logicMatrix) {
                let temp = Matrix.TEMP;
                Matrix.mul(this.logicMatrix, mat.copyTo(temp), temp);
                this._nMatrix_0.setValue(temp.a, temp.c, temp.tx);
                this._nMatrix_1.setValue(temp.b, temp.d, temp.ty);
            } else {
                this._nMatrix_0.setValue(mat.a, mat.c, mat.tx);
                this._nMatrix_1.setValue(mat.b, mat.d, mat.ty);
            }
            data.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
            data.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
            this._modifiedFrame = trans.modifiedFrame;
        } else if (this._globalAlpha !== this._owner.globalAlpha) {
            this._globalAlpha = this._owner.globalAlpha;
        }
    }

    destroy(): void {
        this._graphicsSubShader = null;
        this._graphicsShaderData = null;
        super.destroy();
    }
}

export class NoRenderBaseDataHandle extends NoRenderDataHandleBase implements I2DBaseRenderDataHandle {
    private _lightReceive: boolean = false;

    get lightReceive(): boolean { return this._lightReceive; }
    set lightReceive(value: boolean) {
        this._lightReceive = value;
        if (this._owner?.spriteShaderData) {
            if (value) {
                this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
            } else {
                this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
            }
        }
    }

    get owner(): NoRenderStruct2D { return this._owner; }
    set owner(value: NoRenderStruct2D) {
        if (value === this._owner) return;
        if (this._owner?.spriteShaderData) {
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        }
        this._owner = value;
        if (this._owner?.spriteShaderData) {
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        }
    }
}

const _setRenderColor: Color = new Color(1, 1, 1, 1);

export class NoRenderMeshDataHandle extends NoRenderBaseDataHandle implements IMesh2DRenderDataHandle {
    private _baseColor: Color = new Color(1, 1, 1, 1);
    private _tilingOffset: Vector4 = new Vector4();
    private _baseTexture: BaseTexture;
    private _normal2DTexture: BaseTexture;
    private _renderAlpha = -1;
    private _normal2DStrength: number;

    get baseColor(): Color { return this._baseColor; }
    set baseColor(value: Color) {
        if (value !== this._baseColor && this._baseColor.equal(value)) return;
        value = value ? value : Color.BLACK;
        value.cloneTo(this._baseColor);
        this._renderAlpha = -1;
        this._owner?.spriteShaderData?.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._baseColor);
    }

    get baseTexture(): BaseTexture { return this._baseTexture; }
    set baseTexture(value: BaseTexture) {
        if (this._baseTexture != null && value === this._baseTexture) return;
        if (this._baseTexture) this._baseTexture._removeReference();
        this._baseTexture = value;
        this._owner?.spriteShaderData?.setTexture(BaseRenderNode2D.BASERENDER2DTEXTURE, value);
        if (value) value._addReference();
    }

    get tilingOffset(): Vector4 { return this._tilingOffset; }
    set tilingOffset(value: Vector4) {
        if (!value) return;
        this._owner?.spriteShaderData?.setVector(BaseRenderNode2D.TILINGOFFSET, value);
        value.cloneTo(this._tilingOffset);
    }

    get normal2DTexture(): BaseTexture { return this._normal2DTexture; }
    set normal2DTexture(value: BaseTexture) {
        if (value === this._normal2DTexture) return;
        if (this._normal2DTexture) this._normal2DTexture._removeReference(1);
        if (value) value._addReference();
        this._normal2DTexture = value;
        this._owner?.spriteShaderData?.setTexture(BaseRenderNode2D.NORMAL2DTEXTURE, value);
    }

    get normal2DStrength(): number { return this._normal2DStrength; }
    set normal2DStrength(value: number) {
        value = Math.max(0, Math.min(1, value));
        if (this._normal2DStrength === value) return;
        this._normal2DStrength = value;
        this._owner?.spriteShaderData?.setNumber(BaseRenderNode2D.NORMAL2DSTRENGTH, value);
    }

    inheriteRenderData(context: IRenderContext2D): void {
        super.inheriteRenderData(context);
        if (this._owner && this._renderAlpha !== this._owner.globalAlpha) {
            let a = this._owner.globalAlpha * this._baseColor.a;
            _setRenderColor.setValue(this._baseColor.r, this._baseColor.g, this._baseColor.b, a);
            this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, _setRenderColor);
            this._renderAlpha = this._owner.globalAlpha;
        }
    }
}

export class NoRenderSpineDataHandle extends NoRenderBaseDataHandle implements ISpineRenderDataHandle {
    private _renderAlpha = -1;
    private _baseColor: Color = new Color(1, 1, 1, 1);
    skeleton: spine.Skeleton;
    private _offset: Vector2;

    get baseColor(): Color { return this._baseColor; }
    set baseColor(value: Color) {
        if (value !== this._baseColor && this._baseColor.equal(value)) return;
        value = value ? value : Color.BLACK;
        value.cloneTo(this._baseColor);
        this._renderAlpha = -1;
        this._owner?.spriteShaderData?.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._baseColor);
    }

    get offset(): Vector2 { return this._offset; }
    set offset(value: Vector2) { this._offset = value; }

    get owner(): NoRenderStruct2D { return this._owner; }
    set owner(value: NoRenderStruct2D) {
        if (value === this._owner) return;
        if (this._owner?.spriteShaderData) {
            let sd = this._owner.spriteShaderData;
            sd.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            sd.removeDefine(SpineShaderInit.SPINE_UV);
            sd.removeDefine(SpineShaderInit.SPINE_COLOR);
        }
        this._owner = value;
        if (this._owner?.spriteShaderData) {
            let sd = this._owner.spriteShaderData;
            sd.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            sd.addDefine(SpineShaderInit.SPINE_UV);
            sd.addDefine(SpineShaderInit.SPINE_COLOR);
        }
    }

    inheriteRenderData(context: IRenderContext2D): void {
        if (!this._owner?.spriteShaderData || !this.skeleton) return;
        let shaderData = this._owner.spriteShaderData;
        let mat = this._owner.renderMatrix;
        if (this._offset) {
            let ofx = this._offset.x, ofy = this._offset.y;
            this._nMatrix_0.setValue(mat.a, mat.c, mat.tx + mat.a * ofx + mat.c * ofy);
            this._nMatrix_1.setValue(mat.b, mat.d, mat.ty + mat.b * ofx + mat.d * ofy);
        } else {
            this._nMatrix_0.setValue(mat.a, mat.c, mat.tx);
            this._nMatrix_1.setValue(mat.b, mat.d, mat.ty);
        }
        shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
        shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);

        if (this._renderAlpha !== this._owner.globalAlpha) {
            let a = this._owner.globalAlpha * this._baseColor.a;
            _setRenderColor.setValue(this._baseColor.r, this._baseColor.g, this._baseColor.b, a);
            this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, _setRenderColor);
            this._renderAlpha = this._owner.globalAlpha;
        }
    }
}

// ─── Global Render Data ───

const _DefaultClipInfo: IClipInfo = {
    clipMatrix: new Matrix(),
    clipMatDir: new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE),
    clipMatPos: new Vector4(0, 0, 0, 0),
    _updateFrame: 0,
    clipDepth: 0,
    clipParent: null
};

interface StructTransform {
    matrix: Matrix;
    modifiedFrame: number;
}

type ParentData = {
    clipInfo: IClipInfo;
    blendMode: BlendMode;
    globalRenderData: NoRenderGlobalRenderData;
    pass: NoRender2DPass;
    enableCulling: boolean;
    dcOptimize: boolean;
    globalAlpha: number;
};

const _DefaultParentData: ParentData = {
    clipInfo: _DefaultClipInfo,
    blendMode: BlendMode.invalid,
    globalRenderData: null,
    pass: null,
    enableCulling: false,
    dcOptimize: false,
    globalAlpha: 1,
};

enum ChildrenUpdateType {
    All = -1, None = 0, Clip = 1, Blend = 2, Alpha = 4, Pass = 8, Global = 16, Culling = 32, DcOptimize = 64,
}

export class NoRenderStruct2D implements IRenderStruct2D {
    owner: Sprite;
    transSlot: number = -1;
    manualRender: boolean = false;
    _parentData: ParentData = { ..._DefaultParentData };
    _currentData: ParentData = this._parentData;

    zIndex: number = 0;
    _effectZ: number = 0;
    stackingRoot = false;
    rect: Rectangle = new Rectangle();

    private _enableCulling: boolean = false;
    get enableCulling(): boolean { return this._enableCulling; }
    set enableCulling(value: boolean) {
        this._enableCulling = value;
        this.updateChildren(ChildrenUpdateType.Culling);
    }
    get inheritedEnableCulling(): boolean { return this._enableCulling || this._parentData.enableCulling; }

    renderLayer: number = 1;
    parent: NoRenderStruct2D | null;
    children: NoRenderStruct2D[] = [];
    renderType: number = -1;
    renderUpdateMask: number = 0;

    private _dcOptimize: boolean;
    get dcOptimize(): boolean { return this._dcOptimize; }
    set dcOptimize(value: boolean) {
        this._dcOptimize = value;
        this.updateChildren(ChildrenUpdateType.DcOptimize);
    }
    get inheritedDcOptimize(): boolean { return this._dcOptimize || this._parentData.dcOptimize; }
    dcOptimizeEnd: NoRenderStruct2D;

    trans: StructTransform;

    getRenderMatrixVersion(): number { return 0; }
    get renderMatrix(): Matrix { return this.trans.matrix; }
    set renderMatrix(value: Matrix) {
        if (!this.trans)
            this.trans = { matrix: new Matrix(), modifiedFrame: 0 };
        value.copyTo(this.trans.matrix);
        this.trans.modifiedFrame = Stat.loopCount;
    }

    get globalAlpha(): number { return this._currentData.globalAlpha; }
    set globalAlpha(value: number) { this._parentData.globalAlpha = value; }

    private _alpha: number = 1.0;
    get alpha(): number { return this._alpha; }
    set alpha(value: number) {
        this._alpha = value;
        this._updateGlobalAlpha(value, this.parent ? this.parent.globalAlpha : 1);
        this.updateChildren(ChildrenUpdateType.Alpha);
    }

    private _blendMode: BlendMode = BlendMode.invalid;
    get blendMode(): BlendMode { return this._blendMode || this._currentData.blendMode || BlendMode.normal; }
    set blendMode(value: BlendMode) {
        this._updateBlendMode(value);
        this._setBlendMode();
        this.updateChildren(ChildrenUpdateType.Blend);
    }

    needUploadClip = -1;
    private _clipOffset: Vector2 = new Vector2();
    needUploadAlpha = true;
    enabled: boolean = true;
    isRenderStruct: boolean = false;
    renderElements: IRenderElement2D[] = null;
    spriteShaderData: ShaderData = null;

    private _renderDataHandler: NoRenderDataHandleBase;
    get renderDataHandler(): NoRenderDataHandleBase { return this._renderDataHandler; }
    set renderDataHandler(value: NoRenderDataHandleBase) {
        if (this._renderDataHandler) this._renderDataHandler.owner = null;
        this._renderDataHandler = value;
        if (value) this._renderDataHandler.owner = this;
    }

    _globalShaderData: ShaderData = null;
    private _globalRenderData: NoRenderGlobalRenderData = null;
    get globalRenderData(): NoRenderGlobalRenderData { return this._globalRenderData || this._currentData.globalRenderData; }
    set globalRenderData(value: NoRenderGlobalRenderData) {
        this._globalRenderData = value;
        this._updateGlobalShaderData();
        this.updateChildren(ChildrenUpdateType.Global);
    }

    private _updateGlobalShaderData() {
        let renderData = this.globalRenderData;
        this._globalShaderData = renderData ? renderData.globalShaderData : null;
        if (this._subStruct) this._subStruct._updateGlobalShaderData();
    }

    _pass: NoRender2DPass;
    _maskParentPass: NoRender2DPass;

    private _updatePriority() {
        if (this._pass) {
            if (this._maskParentPass) {
                this._pass.priority = this._maskParentPass.priority + 1;
            } else if (this._parentData.pass) {
                this._pass.priority = this._parentData.pass.priority + 1;
            } else {
                this._pass.priority = 0;
            }
        }
    }

    setMaskParentPass(pass: NoRender2DPass): void {
        this._maskParentPass = pass;
        this._updatePriority();
        if (this._pass) this.updateChildren(ChildrenUpdateType.Pass);
    }

    get pass(): NoRender2DPass { return this._pass || this._currentData.pass; }
    set pass(value: NoRender2DPass) {
        if (value !== this._pass) {
            this._pass = value;
            this._updatePriority();
            this.updateChildren(ChildrenUpdateType.Pass);
        }
    }

    private _subStruct: NoRenderStruct2D;
    get subStruct(): NoRenderStruct2D { return this._subStruct; }
    set subStruct(value: NoRenderStruct2D) {
        if (value === this._subStruct) return;
        let updateFlag = 0;
        if (value) {
            let parentData = this._parentData;
            value._blendMode = this._blendMode;
            value._currentData = parentData;
            value._maskParentPass = this._maskParentPass;
            if (parentData.globalAlpha !== 1) updateFlag |= ChildrenUpdateType.Alpha;
            if (!this._globalRenderData && parentData.globalRenderData) updateFlag |= ChildrenUpdateType.Global;
            if (!this._clipInfo && parentData.clipInfo) updateFlag |= ChildrenUpdateType.Clip;
            if (this._blendMode !== BlendMode.invalid || parentData.blendMode !== BlendMode.invalid) updateFlag |= ChildrenUpdateType.Blend;
            this._blendMode = BlendMode.invalid;
            this._currentData = _DefaultParentData;
            value.needUploadAlpha = true;
        } else if (this._subStruct) {
            let parentData = this._parentData;
            this._subStruct._currentData = this._subStruct._parentData;
            this._blendMode = this._subStruct._blendMode;
            if (parentData.globalAlpha !== 1) updateFlag |= ChildrenUpdateType.Alpha;
            if (!this._clipInfo && parentData.clipInfo) updateFlag |= ChildrenUpdateType.Clip;
            if (!this._globalRenderData && parentData.globalRenderData) updateFlag |= ChildrenUpdateType.Global;
            if (this._blendMode !== BlendMode.invalid || parentData.blendMode !== BlendMode.invalid) updateFlag |= ChildrenUpdateType.Blend;
            this._subStruct._blendMode = BlendMode.invalid;
            this._subStruct._maskParentPass = null;
            this._currentData = parentData;
        }
        this._subStruct = value;
        this._updateGlobalShaderData();
        this.updateChildren(updateFlag);
        this._setBlendMode();
    }

    constructor() { }

    _clipRect: Rectangle = null;
    _clipInfo: IClipInfo = null;

    setRenderUpdateCallback(func: Function): void {
        this._rnUpdateFun = func;
    }

    _handleInterData(): void {
        let rect = this._clipRect;
        if (rect) {
            let info = this._clipInfo;
            let trans = this.trans;
            let clipInfo = this._currentData.clipInfo;
            let parentClipUpdateFrame = clipInfo && clipInfo !== _DefaultClipInfo ? clipInfo._updateFrame : -1;

            if (trans) {
                if (info._updateFrame < trans.modifiedFrame || info._updateFrame < parentClipUpdateFrame) {
                    let mat = trans.matrix;
                    let cm = info.clipMatrix;
                    let { x, y, width, height } = rect;
                    width = Math.max(width, 0.0001);
                    height = Math.max(height, 0.0001);
                    let tx = mat.tx, ty = mat.ty;
                    let maskA = width * mat.a, maskB = width * mat.b;
                    let maskC = height * mat.c, maskD = height * mat.d;
                    let parentOffsetX = 0, parentOffsetY = 0;
                    let rawClipX = x * mat.a + y * mat.c + tx;
                    let rawClipY = x * mat.b + y * mat.d + ty;
                    cm.tx = tx;
                    cm.ty = ty;
                    cm.a = maskA;
                    cm.b = maskB;
                    cm.c = maskC;
                    cm.d = maskD;

                    if (parentClipUpdateFrame !== -1) {
                        let parentClipPos = clipInfo.clipMatPos;
                        let offsetx = parentClipPos.z - parentClipPos.x;
                        let offsety = parentClipPos.w - parentClipPos.y;
                        parentOffsetX = offsetx;
                        parentOffsetY = offsety;
                        if (cm.a > 0 && cm.d > 0) {
                            let parentMat = clipInfo.clipMatrix;
                            let parentMinX = parentMat.tx;
                            let parentMinY = parentMat.ty;
                            let parentMaxX = parentMinX + parentMat.a;
                            let parentMaxY = parentMinY + parentMat.d;
                            let cmaxx = tx + cm.a;
                            let cmaxy = ty + cm.d;
                            if (cmaxx <= parentMinX || cmaxy <= parentMinY || tx >= parentMaxX || ty >= parentMaxY) {
                                cm.a = -0.1; cm.d = -0.1;
                            } else {
                                if (tx < parentMinX) { cm.a -= (parentMinX - tx); tx = parentMinX; }
                                if (cmaxx > parentMaxX) { cm.a -= (cmaxx - parentMaxX); }
                                if (ty < parentMinY) { cm.d -= (parentMinY - ty); ty = parentMinY; }
                                if (cmaxy > parentMaxY) { cm.d -= (cmaxy - parentMaxY); }
                                if (cm.a <= 0) cm.a = -0.1;
                                if (cm.d <= 0) cm.d = -0.1;
                                if (cm.tx < parentMinX) cm.tx = parentMinX;
                                if (cm.ty < parentMinY) cm.ty = parentMinY;
                            }
                        }
                        tx += offsetx;
                        ty += offsety;
                        cm.tx = tx;
                        cm.ty = ty;
                    }
                    info.clipMatDir.setValue(cm.a, cm.b, cm.c, cm.d);
                    info.clipMatPos.setValue(rawClipX, rawClipY, tx, ty);
                    info.clipDepth = (parentClipUpdateFrame !== -1 ? clipInfo.clipDepth : 0) + 1;
                    info.clipParent = parentClipUpdateFrame !== -1 ? clipInfo : null;
                    info._updateFrame = Math.max(trans.modifiedFrame, parentClipUpdateFrame);
                }
            }
        }

        if (this._renderDataHandler) {
            let data = this.spriteShaderData;
            let info = this.getClipInfo();
            if (info !== _DefaultClipInfo) {
                if (this.needUploadClip < info._updateFrame) {
                    this._clipOffset.setValue(info.clipMatPos.z - info.clipMatPos.x, info.clipMatPos.w - info.clipMatPos.y);
                    data.setVector2(ShaderDefines2D.UNIFORM_CLIPOFFSET, this._clipOffset);
                    this.needUploadClip = info._updateFrame;
                }
                if (!this._uniformClip) {
                    this._uniformClip = true;
                    data.addDefine(ShaderDefines2D.UNIFORMCLIP);
                }
            } else if (this._uniformClip) {
                data.removeDefine(ShaderDefines2D.UNIFORMCLIP);
                this._uniformClip = false;
            }
            if (this.needUploadAlpha) {
                data.setNumber(ShaderDefines2D.UNIFORM_VERTALPHA, this.globalAlpha);
                this.needUploadAlpha = false;
            }
        }
    }

    private _uniformClip = false;
    private _rnUpdateFun: any = null;

    private _setBlendMode(): void {
        if (!this.spriteShaderData) return;
        BlendModeHandler.setShaderData(this.blendMode, this.spriteShaderData);
        if (this._subStruct) this._subStruct._setBlendMode();
    }

    setClipRect(rect: Rectangle): void {
        this._clipRect = rect;
        rect ? this._initClipInfo() : this._clipInfo = null;
        this.updateChildren(ChildrenUpdateType.Clip);
    }

    private _initClipInfo(): void {
        if (!this._clipInfo) {
            this._clipInfo = {
                clipMatDir: new Vector4,
                clipMatPos: new Vector4,
                clipMatrix: new Matrix,
                _updateFrame: -1,
                clipDepth: 1,
                clipParent: null
            };
        } else {
            this._clipInfo._updateFrame = -1;
            this._clipInfo.clipDepth = 1;
            this._clipInfo.clipParent = null;
        }
    }

    private _updateGlobalAlpha(value: number, parentAlpha: number = 1): void {
        this._parentData.globalAlpha = parentAlpha * value;
    }

    private _updateBlendMode(blendMode: BlendMode): void {
        if (this._subStruct?.enabled) {
            this._subStruct._blendMode = blendMode;
        } else {
            this._blendMode = blendMode;
        }
    }

    getClipInfo(): IClipInfo { return this._clipInfo || this._currentData.clipInfo || _DefaultClipInfo; }
    hasClip(): boolean { return this.getClipInfo() !== _DefaultClipInfo; }

    private updateChildren(type: ChildrenUpdateType): void {
        if (type === ChildrenUpdateType.None) return;
        let info: IClipInfo, blendMode: BlendMode, alpha: number;
        let pass: NoRender2DPass = null, enableCulling = false, dcOptimize = false;
        let globalRenderData: NoRenderGlobalRenderData = null;
        let updateClip = false, updateBlend = false, updateAlpha = false, updatePass = false, updateGlobal = false, updateCulling = false, updateDcOptimize = false;

        if (type & ChildrenUpdateType.Clip) { info = this.getClipInfo(); this.needUploadClip = -1; if (this._subStruct) this._subStruct.needUploadClip = -1; updateClip = true; }
        if (type & ChildrenUpdateType.Blend) { blendMode = this.blendMode; updateBlend = true; }
        if (type & ChildrenUpdateType.Alpha) { alpha = this.globalAlpha; this.needUploadAlpha = true; if (this._subStruct) this._subStruct.needUploadAlpha = true; updateAlpha = true; }
        if (type & ChildrenUpdateType.Pass) { pass = this.pass; updatePass = true; }
        if (type & ChildrenUpdateType.Global) { updateGlobal = true; globalRenderData = this.globalRenderData; }
        if (type & ChildrenUpdateType.Culling) { updateCulling = true; enableCulling = this.inheritedEnableCulling; }
        if (type & ChildrenUpdateType.DcOptimize) { updateDcOptimize = true; dcOptimize = this.inheritedDcOptimize; }

        for (const child of this.children) {
            let updateChild = false;
            let cpd = child._parentData;
            if (updateClip) { cpd.clipInfo = info; if (!child._clipInfo) updateChild = true; }
            if (updateBlend) { if (child._blendMode === BlendMode.invalid) { cpd.blendMode = blendMode; child._setBlendMode(); updateChild = true; } }
            if (updateAlpha) { child._updateGlobalAlpha(child.alpha, alpha); updateChild = true; }
            if (updatePass) { cpd.pass = pass; updateChild = true; }
            if (updateGlobal) { cpd.globalRenderData = globalRenderData; child._updateGlobalShaderData(); if (!child._globalRenderData) updateChild = true; }
            if (updateCulling) { cpd.enableCulling = enableCulling; updateChild = true; }
            if (updateDcOptimize) { cpd.dcOptimize = dcOptimize; updateChild = true; }
            if (updateChild) child.updateChildren(type);
        }
    }

    setRepaint(): void { if (this.pass) this.pass.repaint = true; }

    addChild(child: NoRenderStruct2D, index: number): void {
        child.parent = this;
        this.children.splice(index, 0, child);
        let cpd = child._parentData;
        cpd.clipInfo = this.getClipInfo();
        cpd.blendMode = this.blendMode;
        child._setBlendMode();
        child._updateGlobalAlpha(child.alpha, this.globalAlpha);
        cpd.pass = this.pass;
        child._updatePriority();
        cpd.globalRenderData = this.globalRenderData;
        child._updateGlobalShaderData();
        cpd.enableCulling = this.inheritedEnableCulling;
        cpd.dcOptimize = this.inheritedDcOptimize;
        child.updateChildren(ChildrenUpdateType.All);
    }

    updateChildIndex(child: NoRenderStruct2D, oldIndex: number, index: number): void {
        if (oldIndex === index) return;
        this.children.splice(oldIndex, 1);
        if (index >= this.children.length) this.children.push(child);
        else this.children.splice(index, 0, child);
    }

    removeChild(child: NoRenderStruct2D): void {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            child.parent = null;
            this.children.splice(index, 1);
            let cpd = child._parentData;
            cpd.pass = null;
            child._updatePriority();
            cpd.clipInfo = null;
            cpd.blendMode = BlendMode.invalid;
            child._updateGlobalAlpha(child._alpha);
            cpd.globalRenderData = null;
            child._updateGlobalShaderData();
            cpd.enableCulling = false;
            cpd.dcOptimize = false;
            child.updateChildren(ChildrenUpdateType.All);
        }
    }

    renderUpdate(context: IRenderContext2D): void {
        if (this.renderDataHandler) this.renderDataHandler.inheriteRenderData(context);
        if (this._rnUpdateFun) this._rnUpdateFun(context);
    }

    destroy(): void {
        this._clipInfo = null;
        this._currentData = null;
        this._parentData = null;
        this._clipRect = null;
        this.renderElements = null;
        this.spriteShaderData = null;
        this.parent = null;
        this.children.length = 0;
        this.children = null;
        this._pass = null;
    }
}

// ─── Global Render Data ───

export class NoRender2DPass implements IRender2DPass {
    _priority: number = 0;
    get priority(): number { return this._priority; }
    set priority(value: number) { this._priority = value; }

    enable: boolean = true;
    isSupport: boolean = false;
    renderTexture: RenderTexture2D;
    postProcess: PostProcess2D = null;
    repaint: boolean = true;
    doClearColor: boolean = true;
    root: NoRenderStruct2D = null;
    offsetMatrix: Matrix = new Matrix();
    shaderData: ShaderData = null;

    private _mask: NoRenderStruct2D;
    get mask(): NoRenderStruct2D { return this._mask; }
    set mask(value: NoRenderStruct2D) {
        if (this._mask) this._mask.setMaskParentPass(null);
        this._mask = value;
        if (value) value.setMaskParentPass(this);
    }

    private _enableBatch: boolean = true;
    get enableBatch(): boolean { return this._enableBatch; }
    set enableBatch(value: boolean) { this.repaint = true; this._enableBatch = value; }

    constructor() {
        this.shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
    }

    setClearColor(r: number, g: number, b: number, a: number): void { }

    needRender(): boolean {
        return this.enable && !this.isSupport && (this.repaint || !this.renderTexture);
    }

    fowardRender(context: IRenderContext2D, renderTime: number): void {
        if (!this.root || this.root.globalAlpha < 0.01) return;

        if (this.renderTexture) {
            if (this.renderTexture.width === 0 || this.renderTexture.height === 0) return;
            context.setRenderTarget(this.renderTexture._renderTarget, this.doClearColor, null);
        } else {
            let sizeX = RenderState2D.width, sizeY = RenderState2D.height;
            if (sizeX === 0 || sizeY === 0) return;
            context.setOffscreenView(sizeX, sizeY);
            context.setRenderTarget(null, this.doClearColor, null);
        }
        context.passData = this.shaderData;

        if (this.repaint && this.root) {
            this._walkAndRenderUpdate(context, this.root);
        }
        this.repaint = false;
    }

    private _walkAndRenderUpdate(context: IRenderContext2D, struct: NoRenderStruct2D): void {
        if (!struct.enabled || struct.globalAlpha < 0.01 || this._mask === struct) return;
        let renderStruct = (struct.subStruct && struct !== this.root) ? struct.subStruct : struct;
        if (renderStruct.manualRender) return;
        renderStruct._handleInterData();
        renderStruct.renderUpdate(context);
        for (let i = 0, n = renderStruct.children.length; i < n; i++) {
            let child = renderStruct.children[i] as NoRenderStruct2D;
            child._effectZ = child.zIndex + struct._effectZ;
            this._walkAndRenderUpdate(context, child);
        }
    }

    updatePostProcess(): void { }

    destroy(): void {
        this.root = null;
        this.renderTexture = null;
        this.postProcess = null;
        if (this.shaderData) {
            this.shaderData.destroy();
            this.shaderData = null;
        }
    }
}

export class NoRender2DPassManager implements IRender2DPassManager {
    private _modify: boolean = false;
    private _passes: NoRender2DPass[] = [];

    addPass(pass: NoRender2DPass): void {
        if (this._passes.indexOf(pass) !== -1) return;
        this._passes.push(pass);
        this._modify = true;
    }

    removePass(pass: NoRender2DPass): void {
        let index = this._passes.indexOf(pass);
        if (index === -1) return;
        this._passes.splice(index, 1);
        this._modify = true;
    }

    apply(context: IRenderContext2D, renderTime: number): void {
        if (this._modify) {
            this._modify = false;
            this._passes.sort((a, b) => b._priority - a._priority);
        }
        for (const pass of this._passes) {
            if (pass.needRender()) pass.fowardRender(context, renderTime);
        }
    }

    clear(): void { this._passes.length = 0; }
}
