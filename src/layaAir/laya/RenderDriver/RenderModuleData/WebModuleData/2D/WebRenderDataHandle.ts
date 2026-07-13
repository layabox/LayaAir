import { Color } from "../../../../maths/Color";
import { Matrix } from "../../../../maths/Matrix";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture2D } from "../../../../resource/Texture2D";
import { SpineShaderInit } from "../../../../spine/shader/SpineShaderInit";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import type { WebGraphicsOp2D } from "./WebGraphicsOp2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { I2DBaseRenderDataHandle, I2DPrimitiveDataHandle, IGraphicsOp2D, IMesh2DRenderDataHandle, IRender2DDataHandle, ISpineRenderDataHandle } from "../../Design/2D/IRender2DDataHandle";
import { WebGraphicsBatchEntry } from "./WebGraphicsOp2DRuntimeBuffers";
import { WebGraphicsOp2DRuntime } from "./WebGraphicsOp2DRuntime";
import { WebRenderStruct2D } from "./WebRenderStruct2D";
import { Transform2DStore } from "../../../../display/transform2d/Transform2DStore";

export abstract class WebRender2DDataHandle implements IRender2DDataHandle {
    protected _owner: WebRenderStruct2D;
    public get owner(): WebRenderStruct2D {
        return this._owner;
    }
    public set owner(value: WebRenderStruct2D) {
        this._owner = value;
    }
    protected _nMatrix_0 = new Vector3();
    protected _nMatrix_1 = new Vector3();
    protected _matUploadFrame: number = -1;
    constructor() {
    }
    private _needUseMatrix: boolean = true;
    public get needUseMatrix(): boolean {
        return this._needUseMatrix;
    }
    public set needUseMatrix(value: boolean) {
        this._needUseMatrix = value;
        this._matUploadFrame = -1;
        if (!value && this._owner?.spriteShaderData) {
            this._nMatrix_0.set(1, 0, 0);
            this._nMatrix_1.set(0, 1, 0);
            this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
            this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
        }
    }

    destroy(): void {

    }

    inheriteRenderData(context: IRenderContext2D): void {
        let data = this._owner.spriteShaderData;
        if (!data)
            return;
        if (this._needUseMatrix) {
            let slot = this._owner.transSlot;
            if (slot >= 0) {
                let matFrame = Transform2DStore.instance.getMatrixFrame(slot);
                if (this._matUploadFrame === matFrame)
                    return;
                this._matUploadFrame = matFrame;
            }
            let mat = this._owner.renderMatrix;
            this._nMatrix_0.setValue(mat.a, mat.c, mat.tx);
            this._nMatrix_1.setValue(mat.b, mat.d, mat.ty);
            this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
            this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
        }
    }
}


export class WebEmptyRender2DDataHandle extends WebRender2DDataHandle {
    inheriteRenderData(_context: IRenderContext2D): void {
        // no-op：不写 2D 矩阵，仅依赖 _handleInterData 上传 clip/alpha
    }
    destroy(): void {
        // no-op
    }
}


export class WebPrimitiveDataHandle extends WebRender2DDataHandle implements I2DPrimitiveDataHandle {
    private static _emptyGraphicsOps: ReadonlyArray<WebGraphicsOp2D> = [];
    logicMatrix: Matrix | null = null;
    mask: WebRenderStruct2D | null = null;

    private _opRuntime: WebGraphicsOp2DRuntime = null;
    private _graphicsOpsActive: boolean = false;
    private _graphicsHandleUpdateBuffer: ArrayBuffer = null;
    private _modifiedFrame: number = -1;
    private _globalAlpha: number = 1;

    public set owner(value: WebRenderStruct2D) {
        if (this._owner === value)
            return;
        this._destroyGraphicsOpRuntime();
        super.owner = value;
        this._setGraphicsOpsActive(false);
        this._createGraphicsOpRuntime();
        this._invalidateMatrixCache();
    }

    public get owner(): WebRenderStruct2D {
        return super.owner;
    }

    private _destroyGraphicsOpRuntime(): void {
        if (!this._opRuntime)
            return;
        this._opRuntime.destroy();
        this._opRuntime = null;
    }

    private _createGraphicsOpRuntime(): void {
        if (!this._owner)
            return;
        if (!this._opRuntime) {
            this._opRuntime = new WebGraphicsOp2DRuntime(this._owner);
            this._opRuntime.setGraphicsHandleUpdateBuffer(this._graphicsHandleUpdateBuffer);
        }
    }

    private _setGraphicsOpsActive(value: boolean): void {
        if (this._graphicsOpsActive === value)
            return;
        this._graphicsOpsActive = value;
        this.needUseMatrix = !value;
        this._invalidateMatrixCache();
    }

    private _invalidateMatrixCache(): void {
        this._modifiedFrame = -1;
    }

    setGraphicsHandleUpdateBuffer(buffer: ArrayBuffer): void {
        if (this._graphicsHandleUpdateBuffer === buffer)
            return;
        this._graphicsHandleUpdateBuffer = buffer;
        if (this._opRuntime)
            this._opRuntime.setGraphicsHandleUpdateBuffer(buffer);
    }

    syncGraphicsOps(ops: ReadonlyArray<IGraphicsOp2D>): void {
        if (!ops || ops.length === 0) {
            this._opRuntime.syncGraphicsOps(ops ? ops as ReadonlyArray<WebGraphicsOp2D> : WebPrimitiveDataHandle._emptyGraphicsOps);
            this._setGraphicsOpsActive(false);
            return;
        }
        this._opRuntime.syncGraphicsOps(ops as ReadonlyArray<WebGraphicsOp2D>);
        this._setGraphicsOpsActive(true);
    }

    /** @internal */
    getGraphicsBatchEntry(index: number): WebGraphicsBatchEntry {
        return this._opRuntime.getGraphicsBatchEntry(index);
    }

    inheriteRenderData(context: IRenderContext2D): void {
        let data = this._owner.spriteShaderData;

        if (data) {
            let store = Transform2DStore.instance;
            let matFrame = store.getMatrixFrame(this._owner.transSlot);
            let globalAlpha = this._owner.globalAlpha;
            let alphaChanged = this._globalAlpha != globalAlpha;

            if (this._modifiedFrame !== matFrame) {
                let mat: Matrix = this._owner.renderMatrix;
                if (this.needUseMatrix) {
                    if (this.logicMatrix) {
                        let temp = Matrix.TEMP;
                        Matrix.mul(this.logicMatrix, mat.copyTo(temp), temp);
                        this._nMatrix_0.setValue(temp.a, temp.c, temp.tx);
                        this._nMatrix_1.setValue(temp.b, temp.d, temp.ty);
                    }
                    else {
                        this._nMatrix_0.setValue(mat.a, mat.c, mat.tx);
                        this._nMatrix_1.setValue(mat.b, mat.d, mat.ty);
                    }
                    data.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
                    data.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
                }
                else if (this._graphicsOpsActive) {
                    this._opRuntime.updateTransform(mat, globalAlpha, alphaChanged);
                }
                this._globalAlpha = globalAlpha;
                this._modifiedFrame = matFrame;
            }
            else if (this._globalAlpha != globalAlpha) {
                this._globalAlpha = globalAlpha;
                if (this._graphicsOpsActive) {
                    this._opRuntime.updateGlobalAlpha(this._globalAlpha);
                }
            }
        }
    }

    destroy(): void {
        this._destroyGraphicsOpRuntime();
        super.destroy();
    }
}

export class Web2DBaseRenderDataHandle extends WebRender2DDataHandle implements I2DBaseRenderDataHandle {
    private _lightReceive: boolean = false;

    public get lightReceive(): boolean {
        return this._lightReceive;
    }
    public set lightReceive(value: boolean) {
        this._lightReceive = value;
        if (value) {
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        } else {
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        }
    }

    public get owner(): WebRenderStruct2D {
        return this._owner;
    }
    public set owner(value: WebRenderStruct2D) {
        if (value == this.owner) return;
        if (this._owner) {
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        }
        this._owner = value;
        if (this._owner) {
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        }

    }
}

const _setRenderColor: Color = new Color(1, 1, 1, 1);

export class WebMesh2DRenderDataHandle extends Web2DBaseRenderDataHandle implements IMesh2DRenderDataHandle {
    private _baseColor: Color = new Color(1, 1, 1, 1);
    private _tilingOffset: Vector4 = new Vector4();
    private _baseTexture: BaseTexture;
    private _normal2DTexture: BaseTexture;
    private _renderAlpha = -1;

    public get baseColor(): Color {
        return this._baseColor;
    }
    public set baseColor(value: Color) {
        if (value != this._baseColor && this._baseColor.equal(value))
            return
        value = value ? value : Color.BLACK;
        value.cloneTo(this._baseColor);
        this._renderAlpha = -1;
        this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._baseColor);
    }

    public get baseTexture(): BaseTexture {
        return this._baseTexture;
    }
    public set baseTexture(value: BaseTexture) {
        if (this._baseTexture != null && value == this._baseTexture)
            return;

        if (this._baseTexture)
            this._baseTexture._removeReference();

        this._baseTexture = value;
        value = value ? value : Texture2D.whiteTexture;
        this._owner.spriteShaderData.setTexture(BaseRenderNode2D.BASERENDER2DTEXTURE, value);
        if (value) {
            value._addReference();
            if (value.gammaCorrection != 1) {//预乘纹理特殊处理
                this._owner.spriteShaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
            } else {
                this._owner.spriteShaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
            }
        }
    }

    public get tilingOffset(): Vector4 {
        return this._tilingOffset;
    }
    public set tilingOffset(value: Vector4) {
        if (!value)
            return;
        this._owner.spriteShaderData.setVector(BaseRenderNode2D.TILINGOFFSET, value);
        value ? value.cloneTo(this._tilingOffset) : null;
    }

    public get normal2DTexture(): BaseTexture {
        return this._normal2DTexture;
    }
    public set normal2DTexture(value: BaseTexture) {
        if (value === this._normal2DTexture)
            return;

        if (this._normal2DTexture)
            this._normal2DTexture._removeReference(1)

        if (value)
            value._addReference();
        this._normal2DTexture = value;

        this._owner.spriteShaderData.setTexture(BaseRenderNode2D.NORMAL2DTEXTURE, value);
        if (this._normal2DStrength > 0 && this._normal2DTexture)
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
        else
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
    }
    private _normal2DStrength: number;
    public get normal2DStrength(): number {
        return this._normal2DStrength;
    }
    public set normal2DStrength(value: number) {
        value = Math.max(0, Math.min(1, value)); //值应该在0~1之间
        if (this._normal2DStrength === value)
            return
        this._normal2DStrength = value;
        this._owner.spriteShaderData.setNumber(BaseRenderNode2D.NORMAL2DSTRENGTH, value);
        if (value > 0 && this._normal2DTexture)
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
        else this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
    }

    inheriteRenderData(context: IRenderContext2D): void {
        super.inheriteRenderData(context);
        if (this._renderAlpha != this._owner.globalAlpha) {
            let a = this._owner.globalAlpha * this._baseColor.a;
            _setRenderColor.setValue(this._baseColor.r, this._baseColor.g, this._baseColor.b, a);
            this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, _setRenderColor);
            this._renderAlpha = this._owner.globalAlpha;
        }
    }
}

export class WebSpineRenderDataHandle extends Web2DBaseRenderDataHandle implements ISpineRenderDataHandle {
    private _renderAlpha = -1;
    private _baseColor: Color = new Color(1, 1, 1, 1);

    public get baseColor(): Color {
        return this._baseColor;
    }
    public set baseColor(value: Color) {
        if (value != this._baseColor && this._baseColor.equal(value))
            return
        value = value ? value : Color.BLACK;
        value.cloneTo(this._baseColor);
        this._renderAlpha = -1;
        this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._baseColor);
    }

    skeleton: spine.Skeleton;

    normalUpdater: any = null;

    private _offset: Vector2;

    public get owner(): WebRenderStruct2D {
        return this._owner;
    }
    public set owner(value: WebRenderStruct2D) {
        if (value == this.owner) return;
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.removeDefine(SpineShaderInit.SPINE_UV);
            shaderData.removeDefine(SpineShaderInit.SPINE_COLOR);
        }
        this._owner = value;
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.addDefine(SpineShaderInit.SPINE_UV);
            shaderData.addDefine(SpineShaderInit.SPINE_COLOR);
        }

    }

    public get offset(): Vector2 {
        return this._offset;
    }
    public set offset(value: Vector2) {
        this._offset = value;
    }

    inheriteRenderData(context: IRenderContext2D): void {
        if (!this._owner || !this._owner.spriteShaderData || !this.skeleton)
            return
        let shaderData = this.owner.spriteShaderData;
        let trans = this.owner.renderMatrix;
        let mat = trans;
        if (this._offset) {
            let ofx = this._offset.x;
            let ofy = this._offset.y;
            this._nMatrix_0.setValue(mat.a, mat.c, mat.tx + mat.a * ofx + mat.c * ofy);
            this._nMatrix_1.setValue(mat.b, mat.d, mat.ty + mat.b * ofx + mat.d * ofy);
        } else {
            this._nMatrix_0.setValue(mat.a, mat.c, mat.tx);
            this._nMatrix_1.setValue(mat.b, mat.d, mat.ty);
        }

        shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
        shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);

        if (this._renderAlpha != this._owner.globalAlpha) {
            let a = this._owner.globalAlpha * this._baseColor.a;
            _setRenderColor.setValue(this._baseColor.r, this._baseColor.g, this._baseColor.b, a);
            this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, _setRenderColor);
            this._renderAlpha = this._owner.globalAlpha;
        }
    }
}
