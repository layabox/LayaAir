import { Color } from "../../../../maths/Color";
import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture2D } from "../../../../resource/Texture2D";
import { SpineShaderInit } from "../../../../spine/shader/SpineShaderInit";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { I2DBaseRenderDataHandle, I2DPrimitiveDataHandle, IMesh2DRenderDataHandle, IRender2DDataHandle, ISpineRenderDataHandle, IGraphicsOp2D } from "../../Design/2D/IRender2DDataHandle";
import { GLESRenderContext2D } from "../../../OpenGLESDriver/2DRenderPass/GLESRenderContext2D";
import { RTRenderStruct2D } from "./RTRenderStruct2D";
import { Vector2 } from "../../../../maths/Vector2";
import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";

type RTGraphicsNativeOpCarrier = {
    _nativeObj?: any;
};

export abstract class RTRender2DDataHandle implements IRender2DDataHandle {
    _nativeObj: any;
    constructor(nativeObj: any) {
        this._nativeObj = nativeObj;
        this._needUseMatrix = true;
    }
    protected _owner: RTRenderStruct2D;
    public get owner(): RTRenderStruct2D {
        return this._owner;
    }
    public set owner(value: RTRenderStruct2D) {
        this._owner = value;
        this._nativeObj.setOwner(value ? value._nativeObj : null);
    }

    private _needUseMatrix: boolean;
    public get needUseMatrix(): boolean {
        return this._needUseMatrix;
    }
    public set needUseMatrix(value: boolean) {
        if (this._needUseMatrix === value)
            return;
        this._needUseMatrix = value;
        this._nativeObj.needUseMatrix = value;
    }
    destroy(): void {
        this._nativeObj.destroy();
    }

    inheriteRenderData(context: GLESRenderContext2D): void {
        this._nativeObj.inheriteRenderData(context._nativeObj);
    }
}

/** 空 handle，仅跑通 clip/alpha 流程；无原生实现时使用 dummy 对象 */
export class RTEmptyRender2DDataHandle extends RTRender2DDataHandle {
    constructor() {
        const nativeObj = new (window as any).conchRTEmptyRender2DDataHandle();
        super(nativeObj);
    }
    inheriteRenderData(_context: GLESRenderContext2D): void {
        // no-op
    }
    destroy(): void {
        // no-op
    }
}

export class RTPrimitiveDataHandle extends RTRender2DDataHandle implements I2DPrimitiveDataHandle {
    constructor() {
        super(new (window as any).conchRTPrimitiveDataHandle());
    }

    readonly autoGraphicsDirtySync: boolean = true;

    _mask: RTRenderStruct2D | null = null;
    get mask(): RTRenderStruct2D | null {
        return this._mask;
    }
    set mask(value: RTRenderStruct2D | null) {
        this._mask = value;
        this._nativeObj.setMask(value ? value._nativeObj : null);
    }

    private _logicMatrix: Matrix | null = null;
    get logicMatrix(): Matrix | null {
        return this._logicMatrix;
    }
    set logicMatrix(value: Matrix | null) {
        if(value){
            if (!this._logicMatrix) {
                this._logicMatrix = new Matrix();
            }
            value.copyTo(this._logicMatrix);
        }
        this._nativeObj.setLogicMatrix(this._logicMatrix , !!value);
    }

    private _graphicsHandleUpdateBuffer: ArrayBuffer = null;
    private _graphicsNativeOps: any[] = [];

    setGraphicsHandleUpdateBuffer(buffer: ArrayBuffer): void {
        if (this._graphicsHandleUpdateBuffer === buffer)
            return;
        this._graphicsHandleUpdateBuffer = buffer;
        if (this._nativeObj.setGraphicsHandleUpdateBuffer)
            this._nativeObj.setGraphicsHandleUpdateBuffer(buffer);
    }

    syncGraphicsOps(ops: ReadonlyArray<IGraphicsOp2D>): void {
        if (!this._nativeObj.syncGraphicsOps)
            return;
        let nativeOps = this._graphicsNativeOps;
        let count = ops ? ops.length : 0;
        nativeOps.length = count;
        for (let i = 0; i < count; i++)
            nativeOps[i] = (ops[i] as IGraphicsOp2D & RTGraphicsNativeOpCarrier)._nativeObj || null;
        this._nativeObj.syncGraphicsOps(nativeOps, count);
    }
    inheriteRenderData(context: GLESRenderContext2D): void {
        this._nativeObj.inheriteRenderData(context._nativeObj);
    }

    destroy(): void {
        super.destroy();
        this._graphicsNativeOps.length = 0;
    }
}


export class RTBaseRenderDataHandle extends RTRender2DDataHandle implements I2DBaseRenderDataHandle {
    constructor(nativeObj?: any) {
        super(nativeObj || new (window as any).conchRTRender2DDataHandle());
    }

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

    public get owner(): RTRenderStruct2D {
        return this._owner;
    }
    public set owner(value: RTRenderStruct2D) {
        if (value == this.owner) return;
        if (this._owner) {
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        }
        this._owner = value;
        this._nativeObj.setOwner(this._owner._nativeObj);

        if (this._owner) {
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        }
    }
}

export class RTMesh2DRenderDataHandle extends RTBaseRenderDataHandle implements IMesh2DRenderDataHandle {
    constructor() {
        super(new (window as any).conchRTMesh2DRenderDataHandle());
        this.baseColor = new Color(1, 1, 1, 1);
    }

    private _baseColor: Color = new Color(1, 1, 1, 1);
    private _baseTexture: BaseTexture;
    private _normal2DTexture: BaseTexture;
    private _tilingOffset: Vector4 = new Vector4();

    public get tilingOffset(): Vector4 {
        return this._tilingOffset;
    }
    public set tilingOffset(value: Vector4) {
        if (!value)
            return;
        this._owner.spriteShaderData.setVector(BaseRenderNode2D.TILINGOFFSET, value);
        value ? value.cloneTo(this._tilingOffset) : null;
    }

    public get baseColor(): Color {
        return this._baseColor;
    }
    public set baseColor(value: Color) {
        if (value != this._baseColor && this._baseColor.equal(value))
            return
        value = value ? value : Color.BLACK;
        value.cloneTo(this._baseColor);
        this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._baseColor);
        this._nativeObj.setBaseColor(this._baseColor);
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
}

export class RTSpineRenderDataHandle extends RTBaseRenderDataHandle implements ISpineRenderDataHandle {
    private _offset: Vector2 = new Vector2();
    skeleton: spine.Skeleton;

    private _baseColor: Color = new Color(1, 1, 1, 1);

    public get baseColor(): Color {
        return this._baseColor;
    }

    public set baseColor(value: Color) {
        if (value != this._baseColor && this._baseColor.equal(value))
            return
        value = value ? value : Color.BLACK;
        value.cloneTo(this._baseColor);
        this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._baseColor);
        this._nativeObj.setBaseColor(this._baseColor);
    }

    constructor() {
        super(new (window as any).conchRTSpineRenderDataHandle());
    }

    public get owner(): RTRenderStruct2D {
        return this._owner;
    }

    public set owner(value: RTRenderStruct2D) {
        if (value == this.owner) return;
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.removeDefine(SpineShaderInit.SPINE_UV);
            shaderData.removeDefine(SpineShaderInit.SPINE_COLOR);
        }
        this._owner = value;
        this._nativeObj.setOwner(this._owner._nativeObj);
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
        this._nativeObj.setOffset(this._offset);
    }
}
