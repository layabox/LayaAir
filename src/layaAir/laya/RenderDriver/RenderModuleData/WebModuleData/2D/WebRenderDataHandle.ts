import { Color } from "../../../../maths/Color";
import { Matrix } from "../../../../maths/Matrix";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture2D } from "../../../../resource/Texture2D";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import type { WebGraphicsOp2D } from "./WebGraphicsOp2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { I2DBaseRenderDataHandle, IGraphicsSingleQuadDataHandle, IGraphicsCommandStreamDataHandle, ISubStructRenderDataHandle, IGraphicsOp2D, IMesh2DRenderDataHandle, IRender2DDataHandle } from "../../Design/2D/IRender2DDataHandle";
import { WebGraphicsBatchEntry } from "./WebGraphicsOp2DRuntimeBuffers";
import { WebGraphicsOp2DRuntime, type WebGraphicsMaterialState } from "./WebGraphicsOp2DRuntime";
import { WebRenderStruct2D } from "./WebRenderStruct2D";
import type { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import type { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { WebSingleQuadPrimitiveData } from "./WebSingleQuadPrimitiveData";
import { GraphicsHandleDirtyFlag, GraphicsHandleUpdateField } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";

const SINGLE_QUAD_DIRTY_MASK = GraphicsHandleDirtyFlag.OwnerSize | GraphicsHandleDirtyFlag.OpPayload
    | GraphicsHandleDirtyFlag.OpResource | GraphicsHandleDirtyFlag.OpState;

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
            let matrixVersion = this._owner.getRenderMatrixVersion();
            if (matrixVersion >= 0 && this._matUploadFrame === matrixVersion)
                return;
            this._matUploadFrame = matrixVersion;
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


export class WebSubStructRenderDataHandle extends WebRender2DDataHandle implements ISubStructRenderDataHandle {
	logicMatrix: Matrix | null = null;
	mask: WebRenderStruct2D | null = null;

	inheriteRenderData(context: IRenderContext2D): void {
		let data = this._owner.spriteShaderData;
		if (!data || !this.needUseMatrix)
			return;
		let matrixVersion = this._owner.getRenderMatrixVersion();
		if (matrixVersion >= 0 && this._matUploadFrame === matrixVersion)
			return;
		this._matUploadFrame = matrixVersion;
		let mat = this._owner.renderMatrix;
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
}

export class WebGraphicsSingleQuadDataHandle extends WebRender2DDataHandle implements IGraphicsSingleQuadDataHandle {
    private _singleQuadData: WebSingleQuadPrimitiveData = null;
    private _singleQuadActive: boolean = false;
    private _graphicsHandleUpdateBuffer: ArrayBuffer = null;
    private _graphicsHandleUpdateInt32: Int32Array = null;
    private _singleQuadPayloadBuffer: ArrayBuffer = null;
    private _handledSingleQuadVersion: number = -1;
    private _modifiedFrame: number = -1;
    private _globalAlpha: number = 1;
    private _globalAlphaValid: boolean = false;
    private _graphicsMaterialState: WebGraphicsMaterialState = { subShader: null, shaderData: null, useSpriteState: true };

    public set owner(value: WebRenderStruct2D) {
        if (this._owner === value)
            return;
        // A GraphicsRenderer owns its handle for life. Detaching the struct only makes the
        // handle dormant; retaining the owner keeps Runtime/RenderUnit identities reusable.
        if (!value) {
            this._singleQuadData.deactivate();
            this._singleQuadActive = false;
            this._handledSingleQuadVersion = -1;
            return;
        }
        super.owner = value;
        this._singleQuadData.setOwner(value);
        this._globalAlphaValid = false;
        this._modifiedFrame = -1;
        this._handledSingleQuadVersion = -1;
    }

    public get owner(): WebRenderStruct2D {
        return super.owner;
    }

    setGraphicsHandleUpdateBuffer(buffer: ArrayBuffer): void {
        if (this._graphicsHandleUpdateBuffer === buffer)
            return;
        this._graphicsHandleUpdateBuffer = buffer;
        this._graphicsHandleUpdateInt32 = new Int32Array(buffer);
        this._handledSingleQuadVersion = -1;
    }

    setGraphicsMaterialState(subShader: SubShader | null, shaderData: ShaderData | null, useSpriteState: boolean): void {
        subShader = subShader || null;
        shaderData = shaderData || null;
        this._graphicsMaterialState.subShader = subShader;
        this._graphicsMaterialState.shaderData = shaderData;
        this._graphicsMaterialState.useSpriteState = useSpriteState;
        this._singleQuadData.setMaterialState(subShader, shaderData, useSpriteState);
    }

    setSingleQuadPayloadBuffer(buffer: ArrayBuffer): void {
        if (this._singleQuadPayloadBuffer === buffer)
            return;
        if (this._singleQuadPayloadBuffer)
            throw new Error("SingleQuad payload buffer can only be bound once");
        this._singleQuadPayloadBuffer = buffer;
        this._singleQuadData = new WebSingleQuadPrimitiveData(buffer);
        this._singleQuadData.setHandleControlBuffer(this._graphicsHandleUpdateBuffer);
        this._singleQuadData.setMaterialState(this._graphicsMaterialState.subShader,
            this._graphicsMaterialState.shaderData, this._graphicsMaterialState.useSpriteState);
    }

    syncSingleQuad(texture: BaseTexture | null): boolean {
        if (!this._singleQuadData.sync(texture))
            return false;
        this._singleQuadActive = true;
        this.needUseMatrix = false;
        this._modifiedFrame = this._owner.getRenderMatrixVersion();
        this._globalAlpha = this._owner.globalAlpha;
        this._globalAlphaValid = true;
        this._handledSingleQuadVersion = this._graphicsHandleUpdateInt32[GraphicsHandleUpdateField.SingleQuadVersion];
        this._graphicsHandleUpdateInt32[GraphicsHandleUpdateField.DirtyFlags] &= ~SINGLE_QUAD_DIRTY_MASK;
        return true;
    }

    deactivateSingleQuad(): void {
        this._singleQuadData.deactivate();
        this._singleQuadActive = false;
    }

    inheriteRenderData(context: IRenderContext2D): void {
        let matrixVersion = this._owner.getRenderMatrixVersion();
        let globalAlpha = this._owner.globalAlpha;
        let singleQuadVersion = this._graphicsHandleUpdateInt32[GraphicsHandleUpdateField.SingleQuadVersion];
        if (this._singleQuadActive && this._handledSingleQuadVersion !== singleQuadVersion) {
            let inputFlags = this._graphicsHandleUpdateInt32[GraphicsHandleUpdateField.DirtyFlags];
            if (inputFlags === GraphicsHandleDirtyFlag.None
                || (inputFlags & (GraphicsHandleDirtyFlag.OwnerSize | GraphicsHandleDirtyFlag.OpPayload)) !== 0)
                this._singleQuadData.refreshInputGeometry();
            this._handledSingleQuadVersion = singleQuadVersion;
            this._graphicsHandleUpdateInt32[GraphicsHandleUpdateField.DirtyFlags] &= ~SINGLE_QUAD_DIRTY_MASK;
            this._modifiedFrame = matrixVersion;
            this._globalAlpha = globalAlpha;
            this._globalAlphaValid = true;
        }
        let alphaChanged = !this._globalAlphaValid || this._globalAlpha != globalAlpha;
        if (this._modifiedFrame !== matrixVersion) {
            if (this._singleQuadActive)
                this._singleQuadData.updateTransform(this._owner.renderMatrix, globalAlpha, alphaChanged);
            this._globalAlpha = globalAlpha;
            this._globalAlphaValid = true;
            this._modifiedFrame = matrixVersion;
        }
        else if (alphaChanged) {
            this._globalAlpha = globalAlpha;
            this._globalAlphaValid = true;
            if (this._singleQuadActive)
                this._singleQuadData.updateGlobalAlpha(this._globalAlpha);
        }
    }

    destroy(): void {
        this._singleQuadData.destroy();
        this._singleQuadData = null;
        this._singleQuadPayloadBuffer = null;
        this._singleQuadActive = false;
        this._graphicsHandleUpdateBuffer = null;
        this._graphicsHandleUpdateInt32 = null;
        this._handledSingleQuadVersion = -1;
        this._graphicsMaterialState.subShader = null;
        this._graphicsMaterialState.shaderData = null;
        super.owner = null;
        super.destroy();
    }
}

export class WebGraphicsCommandStreamDataHandle extends WebRender2DDataHandle implements IGraphicsCommandStreamDataHandle {
	readonly autoGraphicsDirtySync: boolean = false;
	private static _emptyGraphicsOps: ReadonlyArray<WebGraphicsOp2D> = [];
	private _opRuntime: WebGraphicsOp2DRuntime = null;
	private _graphicsOpsActive: boolean = false;
	private _graphicsHandleUpdateBuffer: ArrayBuffer = null;
	private _modifiedFrame: number = -1;
	private _globalAlpha: number = 1;
	private _globalAlphaValid: boolean = false;
	private _graphicsMaterialState: WebGraphicsMaterialState = { subShader: null, shaderData: null, useSpriteState: true };

	public set owner(value: WebRenderStruct2D) {
		if (this._owner === value)
			return;
		if (!value) {
			this._setGraphicsOpsActive(false);
			return;
		}
		super.owner = value;
		this._opRuntime = new WebGraphicsOp2DRuntime(value, this._graphicsMaterialState);
		this._opRuntime.setGraphicsHandleUpdateBuffer(this._graphicsHandleUpdateBuffer);
		this._graphicsOpsActive = false;
		this._globalAlphaValid = false;
		this._modifiedFrame = -1;
	}

	public get owner(): WebRenderStruct2D {
		return super.owner;
	}

	private _setGraphicsOpsActive(value: boolean): void {
		if (value)
			this._opRuntime.activate();
		else
			this._opRuntime.deactivate();
		if (this._graphicsOpsActive === value)
			return;
		this._graphicsOpsActive = value;
		this.needUseMatrix = !value;
		this._modifiedFrame = -1;
	}

	setGraphicsHandleUpdateBuffer(buffer: ArrayBuffer): void {
		if (this._graphicsHandleUpdateBuffer === buffer)
			return;
		this._graphicsHandleUpdateBuffer = buffer;
	}

	setGraphicsMaterialState(subShader: SubShader | null, shaderData: ShaderData | null, useSpriteState: boolean): void {
		subShader = subShader || null;
		shaderData = shaderData || null;
		let subShaderChanged = this._graphicsMaterialState.subShader !== subShader;
		let shaderDataChanged = this._graphicsMaterialState.shaderData !== shaderData;
		let useSpriteStateChanged = this._graphicsMaterialState.useSpriteState !== useSpriteState;
		this._graphicsMaterialState.subShader = subShader;
		this._graphicsMaterialState.shaderData = shaderData;
		this._graphicsMaterialState.useSpriteState = useSpriteState;
		if (subShaderChanged)
			this._opRuntime.syncGraphicsSubShader();
		if (shaderDataChanged)
			this._opRuntime.syncGraphicsShaderData();
		if (useSpriteStateChanged)
			this._opRuntime.syncGraphicsUseSpriteState();
	}

	syncGraphicsOps(ops: ReadonlyArray<IGraphicsOp2D>): void {
		// Resolve pending transform dirtiness once so retained clean units are
		// followed by the normal matrix-version update instead of keeping stale positions.
		this._owner.renderMatrix;
		if (ops.length === 0) {
			this._opRuntime.syncGraphicsOps(WebGraphicsCommandStreamDataHandle._emptyGraphicsOps);
			this._setGraphicsOpsActive(false);
			return;
		}
		this._opRuntime.syncGraphicsOps(ops as ReadonlyArray<WebGraphicsOp2D>);
		this._globalAlphaValid = false;
		this._setGraphicsOpsActive(true);
	}

	deactivateGraphicsOps(): void {
		this._setGraphicsOpsActive(false);
	}

	/** @internal */
	getGraphicsBatchEntry(index: number): WebGraphicsBatchEntry {
		return this._opRuntime.getGraphicsBatchEntry(index);
	}

	inheriteRenderData(context: IRenderContext2D): void {
		let matrixVersion = this._owner.getRenderMatrixVersion();
		let globalAlpha = this._owner.globalAlpha;
		let alphaChanged = !this._globalAlphaValid || this._globalAlpha != globalAlpha;
		if (this._modifiedFrame !== matrixVersion) {
			if (this._graphicsOpsActive)
				this._opRuntime.updateTransform(this._owner.renderMatrix, globalAlpha, alphaChanged);
			this._globalAlpha = globalAlpha;
			this._globalAlphaValid = true;
			this._modifiedFrame = matrixVersion;
		}
		else if (alphaChanged) {
			this._globalAlpha = globalAlpha;
			this._globalAlphaValid = true;
			if (this._graphicsOpsActive)
				this._opRuntime.updateGlobalAlpha(globalAlpha);
		}
	}

	destroy(): void {
		this._opRuntime.destroy();
		this._graphicsOpsActive = false;
		this._graphicsMaterialState.subShader = null;
		this._graphicsMaterialState.shaderData = null;
		super.owner = null;
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

