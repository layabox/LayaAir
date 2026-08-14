import { Color } from "../../../../maths/Color";
import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture2D } from "../../../../resource/Texture2D";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { I2DBaseRenderDataHandle, IGraphicsSingleQuadDataHandle, IGraphicsCommandStreamDataHandle, ISubStructRenderDataHandle, IMesh2DRenderDataHandle, IRender2DDataHandle, IGraphicsOp2D } from "../../Design/2D/IRender2DDataHandle";
import { GLESRenderContext2D } from "../../../OpenGLESDriver/2DRenderPass/GLESRenderContext2D";
import { RTRenderStruct2D } from "./RTRenderStruct2D";
import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";
import type { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import type { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { GraphicsHandleUpdateField } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";

type RTGraphicsNativeOpCarrier = {
    _nativeObj?: any;
};

const enum RTSubStructUpdateField {
	MatrixA,
	MatrixB,
	MatrixC,
	MatrixD,
	MatrixTX,
	MatrixTY,
	HasLogicMatrix,
	Reserved,
	WordCount,
}

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
        this._setOwnerLocal(value);
        this._nativeObj.setOwner(value ? value._nativeObj : null);
    }

	/** @internal Update the wrapper mirror after a native attach already called setOwner. */
	_setOwnerLocal(value: RTRenderStruct2D): void {
		this._owner = value;
	}

    private _needUseMatrix: boolean;
    public get needUseMatrix(): boolean {
        return this._needUseMatrix;
    }
    public set needUseMatrix(value: boolean) {
        if (this._needUseMatrix === value)
            return;
        this._setNeedUseMatrixLocal(value);
        this._nativeObj.needUseMatrix = value;
    }

	protected _setNeedUseMatrixLocal(value: boolean): void {
		this._needUseMatrix = value;
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

export class RTSubStructRenderDataHandle extends RTRender2DDataHandle implements ISubStructRenderDataHandle {
	private _subStructUpdateBuffer: ArrayBuffer;
	private _subStructUpdateFloat32: Float32Array;
	private _subStructUpdateInt32: Int32Array;

	constructor() {
		let ctor = (window as any).conchRTSubStructRenderDataHandle;
		if (!ctor)
			throw new Error("Native backend has not implemented conchRTSubStructRenderDataHandle");
		super(new ctor());
		this._subStructUpdateBuffer = new ArrayBuffer(RTSubStructUpdateField.WordCount * 4);
		this._subStructUpdateFloat32 = new Float32Array(this._subStructUpdateBuffer);
		this._subStructUpdateInt32 = new Int32Array(this._subStructUpdateBuffer);
		this._nativeObj.setSubStructUpdateBuffer(this._subStructUpdateBuffer);
	}

	_mask: RTRenderStruct2D | null = null;
	get mask(): RTRenderStruct2D | null {
		return this._mask;
	}
	set mask(value: RTRenderStruct2D | null) {
		if (this._mask === value)
			return;
		this._mask = value;
		this._nativeObj.setMask(value ? value._nativeObj : null);
	}

	private _logicMatrix: Matrix | null = null;
	get logicMatrix(): Matrix | null {
		return this._logicMatrix;
	}
	set logicMatrix(value: Matrix | null) {
		if (!value) {
			if (!this._logicMatrix)
				return;
			this._logicMatrix = null;
			this._subStructUpdateInt32[RTSubStructUpdateField.HasLogicMatrix] = 0;
			return;
		}
		if (!this._logicMatrix)
			this._logicMatrix = new Matrix();
		value.copyTo(this._logicMatrix);
		let values = this._subStructUpdateFloat32;
		values[RTSubStructUpdateField.MatrixA] = value.a;
		values[RTSubStructUpdateField.MatrixB] = value.b;
		values[RTSubStructUpdateField.MatrixC] = value.c;
		values[RTSubStructUpdateField.MatrixD] = value.d;
		values[RTSubStructUpdateField.MatrixTX] = value.tx;
		values[RTSubStructUpdateField.MatrixTY] = value.ty;
		this._subStructUpdateInt32[RTSubStructUpdateField.HasLogicMatrix] = 1;
	}

	destroy(): void {
		super.destroy();
		this._mask = null;
		this._logicMatrix = null;
		this._subStructUpdateBuffer = null;
		this._subStructUpdateFloat32 = null;
		this._subStructUpdateInt32 = null;
	}
}

export class RTGraphicsSingleQuadDataHandle extends RTRender2DDataHandle implements IGraphicsSingleQuadDataHandle {
	private _graphicsSubShader: SubShader | null = null;
	private _graphicsShaderData: ShaderData | null = null;
	private _graphicsUseSpriteState: boolean = true;
	private _graphicsHandleUpdateBuffer: ArrayBuffer = null;
	private _graphicsHandleUpdateInt32: Int32Array = null;
	private _singleQuadPayloadBuffer: ArrayBuffer = null;
	private _singleQuadActive: boolean = false;
	private _singleQuadNativeTexture: any = null;
	private _singleQuadTextureId: number = 0;

	constructor() {
		let ctor = (window as any).conchRTGraphicsSingleQuadDataHandle;
		if (!ctor)
			throw new Error("Native backend has not implemented conchRTGraphicsSingleQuadDataHandle");
		super(new ctor());
	}

	public get owner(): RTRenderStruct2D {
		return super.owner;
	}
	public set owner(value: RTRenderStruct2D) {
		if (this._owner === value)
			return;
		super.owner = value;
		this._setNeedUseMatrixLocal(true);
		this._singleQuadActive = false;
	}

	setGraphicsHandleUpdateBuffer(buffer: ArrayBuffer): void {
		if (this._graphicsHandleUpdateBuffer === buffer)
			return;
		this._graphicsHandleUpdateBuffer = buffer;
		this._graphicsHandleUpdateInt32 = buffer ? new Int32Array(buffer) : null;
		this._nativeObj.setGraphicsHandleUpdateBuffer(buffer);
	}

	setGraphicsMaterialState(subShader: SubShader | null, shaderData: ShaderData | null, useSpriteState: boolean): void {
		subShader = subShader || null;
		shaderData = shaderData || null;
		if (this._graphicsSubShader === subShader && this._graphicsShaderData === shaderData && this._graphicsUseSpriteState === useSpriteState)
			return;
		this._graphicsSubShader = subShader;
		this._graphicsShaderData = shaderData;
		this._graphicsUseSpriteState = useSpriteState;
		let subShaderHolder: any = subShader;
		let shaderDataHolder: any = shaderData;
		this._nativeObj.setGraphicsMaterialState(
			subShaderHolder ? subShaderHolder.moduleData?._nativeObj || subShaderHolder._nativeObj || null : null,
			shaderDataHolder ? shaderDataHolder._nativeObj || null : null,
			useSpriteState);
	}

	setSingleQuadPayloadBuffer(buffer: ArrayBuffer): void {
		if (this._singleQuadPayloadBuffer === buffer)
			return;
		if (this._singleQuadPayloadBuffer)
			throw new Error("SingleQuad payload buffer can only be bound once");
		this._singleQuadPayloadBuffer = buffer;
		this._nativeObj.setSingleQuadPayloadBuffer(buffer);
	}

	syncSingleQuad(texture: BaseTexture | null): boolean {
		if (!this._singleQuadPayloadBuffer)
			return false;
		let update = this._graphicsHandleUpdateInt32;
		if (update)
			update[GraphicsHandleUpdateField.SingleQuadVersion]++;
		let internalTexture: any = texture ? texture._texture : null;
		let nativeTexture = internalTexture ? internalTexture._nativeObj || null : null;
		let textureId = texture ? texture.id : 0;
		if (!this._singleQuadActive || this._singleQuadNativeTexture !== nativeTexture || this._singleQuadTextureId !== textureId) {
			this._singleQuadNativeTexture = nativeTexture;
			this._singleQuadTextureId = textureId;
			let synced = this._nativeObj.syncSingleQuad(nativeTexture, textureId) !== false;
			if (!synced)
				return false;
		}
		this._singleQuadActive = true;
		this._setNeedUseMatrixLocal(false);
		return true;
	}

	deactivateSingleQuad(): void {
		if (!this._singleQuadActive)
			return;
		this._nativeObj.deactivateSingleQuad();
		this._singleQuadActive = false;
	}

	destroy(): void {
		this._graphicsSubShader = null;
		this._graphicsShaderData = null;
		super.destroy();
		this._graphicsHandleUpdateBuffer = null;
		this._graphicsHandleUpdateInt32 = null;
		this._singleQuadPayloadBuffer = null;
		this._singleQuadNativeTexture = null;
		this._singleQuadTextureId = 0;
		this._singleQuadActive = false;
	}
}

export class RTGraphicsCommandStreamDataHandle extends RTRender2DDataHandle implements IGraphicsCommandStreamDataHandle {

    private _graphicsSubShader: SubShader | null = null;
    private _graphicsShaderData: ShaderData | null = null;
    private _graphicsUseSpriteState: boolean = true;

    constructor() {
		let ctor = (window as any).conchRTGraphicsCommandStreamDataHandle;
		if (!ctor)
			throw new Error("Native backend has not implemented conchRTGraphicsCommandStreamDataHandle");
		super(new ctor());
    }

    public get owner(): RTRenderStruct2D {
        return super.owner;
    }
    public set owner(value: RTRenderStruct2D) {
        if (this._owner === value)
            return;
        super.owner = value;
        // Native setOwner already deactivates Graphics ops and restores this flag.
        this._setNeedUseMatrixLocal(true);
		this._graphicsOpsActive = false;
    }

    readonly autoGraphicsDirtySync: boolean = true;

    setGraphicsMaterialState(subShader: SubShader | null, shaderData: ShaderData | null, useSpriteState: boolean): void {
        subShader = subShader || null;
        shaderData = shaderData || null;
        if (this._graphicsSubShader === subShader
            && this._graphicsShaderData === shaderData
            && this._graphicsUseSpriteState === useSpriteState)
            return;
        this._graphicsSubShader = subShader;
        this._graphicsShaderData = shaderData;
        this._graphicsUseSpriteState = useSpriteState;
        let subShaderHolder: any = subShader;
        let shaderDataHolder: any = shaderData;
        this._nativeObj.setGraphicsMaterialState(
            subShaderHolder ? subShaderHolder.moduleData?._nativeObj || subShaderHolder._nativeObj || null : null,
            shaderDataHolder ? shaderDataHolder._nativeObj || null : null,
            useSpriteState);
    }

    private _graphicsHandleUpdateBuffer: ArrayBuffer = null;
    private _graphicsNativeOps: any[] = [];
	private _graphicsOpsActive: boolean = false;

    setGraphicsHandleUpdateBuffer(buffer: ArrayBuffer): void {
        if (this._graphicsHandleUpdateBuffer === buffer)
            return;
        this._graphicsHandleUpdateBuffer = buffer;
		this._nativeObj.setGraphicsHandleUpdateBuffer(buffer);
    }

    syncGraphicsOps(ops: ReadonlyArray<IGraphicsOp2D>): void {
        let nativeOps = this._graphicsNativeOps;
        let count = ops ? ops.length : 0;
        nativeOps.length = count;
        for (let i = 0; i < count; i++)
            nativeOps[i] = (ops[i] as IGraphicsOp2D & RTGraphicsNativeOpCarrier)._nativeObj || null;
        this._nativeObj.syncGraphicsOps(nativeOps, count);
        // syncGraphicsOps updates the native flag internally; mirror it without a second FFI.
        this._setNeedUseMatrixLocal(count === 0);
		this._graphicsOpsActive = count > 0;
    }

	deactivateGraphicsOps(): void {
		if (!this._graphicsOpsActive)
			return;
		this._nativeObj.deactivateGraphicsOps();
		this._graphicsOpsActive = false;
	}
    inheriteRenderData(context: GLESRenderContext2D): void {
        this._nativeObj.inheriteRenderData(context._nativeObj);
    }

    destroy(): void {
        this._graphicsSubShader = null;
        this._graphicsShaderData = null;
        super.destroy();
        this._graphicsNativeOps.length = 0;
		this._graphicsHandleUpdateBuffer = null;
		this._graphicsOpsActive = false;
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
        if (value == this._owner) return;
        this._setOwnerLocal(value);
        this._nativeObj.setOwner(value ? value._nativeObj : null);
    }

    /** @internal Keep the base-render define in sync when RTRenderStruct2D attaches the handle natively. */
    _setOwnerLocal(value: RTRenderStruct2D): void {
        if (value == this._owner) return;
        if (this._owner) {
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        }

        super._setOwnerLocal(value);

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

