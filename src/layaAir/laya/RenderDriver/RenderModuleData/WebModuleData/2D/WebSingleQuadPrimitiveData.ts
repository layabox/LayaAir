import { Matrix } from "../../../../maths/Matrix";
import { BaseTexture } from "../../../../resource/BaseTexture";
import type { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { Texture2D } from "../../../../resource/Texture2D";
import type { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { BlendMode, BlendModeHandler } from "../../../../webgl/canvas/BlendMode";
import { GraphicsDefines } from "../../../../webgl/shader/d2/GraphicsDefines";
import { GraphicsOpRenderStateHelper } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineHelpers";
import {
	GRAPHICS_INFO_DEFAULT_QUAD_INDICES,
	GRAPHICS_INFO_VERTEX_BLOCK_SIZE,
	GRAPHICS_INFO_VERTEX_FLAG_DISABLED,
	GRAPHICS_INFO_VERTEX_FLAG_ENABLED,
	GraphicsSingleQuadFlag,
	GraphicsSingleQuadKind,
	GraphicsSingleQuadPayloadField,
	GraphicsHandleUpdateField,
	type GraphicsOp2DRenderState,
} from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IPrimitiveRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { WebGraphicsRenderUnit, WebGraphicsRenderUnitPool } from "./WebGraphicsOp2DRuntimeBuffers";
import { WebRenderStruct2D } from "./WebRenderStruct2D";
import { Vector4 } from "../../../../maths/Vector4";

/** @internal Fixed-payload Web implementation used by the Graphics SingleQuad mode. */
export class WebSingleQuadPrimitiveData {
	private _int32: Int32Array;
	private _float32: Float32Array;
	private _owner: WebRenderStruct2D = null;
	private _handleControlFloat32: Float32Array = null;
	private _unit: WebGraphicsRenderUnit = null;
	private _elements: IPrimitiveRenderElement2D[] = [];
	private _texture: BaseTexture = null;
	private _boundTexture: BaseTexture = null;
	private _boundInternalTexture: InternalTexture = null;
	private _boundKind: number = 0;
	private _boundBlendMode: number = -1;
	private _boundCustomMaterial: boolean = false;
	private _hasBoundTextureState: boolean = false;
	private _subShader: SubShader = null;
	private _materialShaderData: ShaderData = null;
	private _useSpriteState: boolean = true;
	private _active: boolean = false;
	private _geometryVisible: boolean = false;
	private _renderStateScratch: GraphicsOp2DRenderState = { stateKey: 0, typeKey: 0, textureKey: 0, texture: null };
	private _localX0: number = 0;
	private _localY0: number = 0;
	private _localX1: number = 0;
	private _localY1: number = 0;
	private _localX2: number = 0;
	private _localY2: number = 0;
	private _localX3: number = 0;
	private _localY3: number = 0;

	constructor(payloadBuffer: ArrayBuffer) {
		this._int32 = new Int32Array(payloadBuffer);
		this._float32 = new Float32Array(payloadBuffer);
	}

	setOwner(owner: WebRenderStruct2D): void {
		if (owner)
			this._owner = owner;
	}

	setHandleControlBuffer(buffer: ArrayBuffer): void {
		this._handleControlFloat32 = buffer ? new Float32Array(buffer) : null;
	}

	setMaterialState(subShader: SubShader, shaderData: ShaderData, useSpriteState: boolean): void {
		this._subShader = subShader || null;
		this._materialShaderData = shaderData || null;
		this._useSpriteState = useSpriteState;
		let unit = this._unit;
		if (!unit)
			return;
		unit.element.subShader = this._subShader;
		unit.element.materialShaderData = this._materialShaderData;
		if (this._active && this._hasBoundTextureState)
			this._syncRenderStateOnly();
	}

	sync(texture: BaseTexture): boolean {
		let kind = this._int32[GraphicsSingleQuadPayloadField.Kind];
		if (!this._owner || (kind !== GraphicsSingleQuadKind.TextureQuad
			&& kind !== GraphicsSingleQuadKind.FillTexture
			&& kind !== GraphicsSingleQuadKind.SolidQuad))
			return false;
		this._texture = texture || null;
		if (!this._texture && kind !== GraphicsSingleQuadKind.SolidQuad) {
			this._releaseUnit();
			this._active = true;
			this._geometryVisible = false;
			this._elements.length = 0;
			this._owner.renderElements = this._elements;
			return true;
		}
		if (!this._ensureUnit())
			return false;
		let internalTexture = this._texture ? this._texture._texture : null;
		if (!this._hasBoundTextureState || this._boundTexture !== this._texture
			|| this._boundInternalTexture !== internalTexture || this._boundKind !== kind)
			this._syncTextureState();
		else
			this._syncRenderStateOnly();
		if (kind === GraphicsSingleQuadKind.FillTexture)
			this._syncFillTextureRange();
		this._active = true;
		this._publishGeometry(this._writeVertices(this._owner.renderMatrix, this._owner.globalAlpha));
		return true;
	}

	deactivate(): void {
		this._active = false;
		this._geometryVisible = false;
		this._texture = null;
		this._releaseUnit();
	}

	updateTransform(matrix: Matrix, globalAlpha: number, writeAlpha: boolean = true): void {
		if (!this._active || !this._unit || !this._geometryVisible)
			return;
		let data = this._unit.vertexViews[0]._getData();
		let x0 = this._localX0, y0 = this._localY0;
		let x1 = this._localX1, y1 = this._localY1;
		let x2 = this._localX2, y2 = this._localY2;
		let x3 = this._localX3, y3 = this._localY3;
		if (matrix) {
			let a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
			data[0] = x0 * a + y0 * c + tx;
			data[1] = x0 * b + y0 * d + ty;
			data[16] = x1 * a + y1 * c + tx;
			data[17] = x1 * b + y1 * d + ty;
			data[32] = x2 * a + y2 * c + tx;
			data[33] = x2 * b + y2 * d + ty;
			data[48] = x3 * a + y3 * c + tx;
			data[49] = x3 * b + y3 * d + ty;
		}
		else {
			data[0] = x0;
			data[1] = y0;
			data[16] = x1;
			data[17] = y1;
			data[32] = x2;
			data[33] = y2;
			data[48] = x3;
			data[49] = y3;
		}
		if (writeAlpha) {
			let alpha = this._float32[GraphicsSingleQuadPayloadField.LocalAlpha] * globalAlpha;
			data[10] = alpha;
			data[26] = alpha;
			data[42] = alpha;
			data[58] = alpha;
		}
		this._unit.vertexViews[0]._modify();
	}

	updateGlobalAlpha(globalAlpha: number): void {
		if (!this._active || !this._unit || !this._geometryVisible)
			return;
		let data = this._unit.vertexViews[0]._getData();
		let alpha = this._float32[GraphicsSingleQuadPayloadField.LocalAlpha] * globalAlpha;
		for (let i = 0; i < 4; i++)
			data[i * GraphicsDefines.stride + 10] = alpha;
		this._unit.vertexViews[0]._modify();
	}

	destroy(): void {
		this._releaseUnit();
		this._texture = null;
		this._boundTexture = null;
		this._boundInternalTexture = null;
		this._hasBoundTextureState = false;
		this._subShader = null;
		this._materialShaderData = null;
		this._owner = null;
		this._active = false;
		this._geometryVisible = false;
	}

	private _ensureUnit(): boolean {
		if (this._unit)
			return true;
		let unit = WebGraphicsRenderUnitPool.take(4, 6, this._owner, this._subShader, this._materialShaderData);
		if (!unit) {
			unit = WebGraphicsRenderUnit.create(4, 6, this._owner, this._subShader, this._materialShaderData);
			if (!unit)
				return false;
		}
		let indices = unit.sourceIndexView._getData();
		let vertexBase = unit.vertexBlocks[0] * GRAPHICS_INFO_VERTEX_BLOCK_SIZE;
		for (let i = 0; i < 6; i++)
			indices[i] = vertexBase + GRAPHICS_INFO_DEFAULT_QUAD_INDICES[i];
		unit.sourceIndexView._modify();
		this._unit = unit;
		this._elements[0] = unit.element;
		return true;
	}

	private _releaseUnit(): void {
		if (this._unit)
			WebGraphicsRenderUnitPool.recover(this._unit);
		this._unit = null;
		this._elements.length = 0;
		this._boundTexture = null;
		this._boundInternalTexture = null;
		this._boundKind = 0;
		this._boundBlendMode = -1;
		this._boundCustomMaterial = false;
		this._hasBoundTextureState = false;
	}

	private _syncTextureState(): void {
		let unit = this._unit;
		if (!unit)
			return;
		let shaderData = unit.primitiveShaderData;
		let texture = this._texture || Texture2D.whiteTexture;
		let blendMode = this._int32[GraphicsSingleQuadPayloadField.BlendMode];
		let fillTexture = this._int32[GraphicsSingleQuadPayloadField.Kind] === GraphicsSingleQuadKind.FillTexture;
		let state = GraphicsOpRenderStateHelper.syncShaderData(shaderData, this._texture, blendMode, fillTexture,
			this._materialShaderData != null, false, this._renderStateScratch);
		if ((state.typeKey & ShaderDefines2D.DEFINE_BIT_USE_TEX_ARRAY) !== 0)
			shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE_ARRAY, texture);
		else
			shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, texture);
		BlendModeHandler.setShaderData(blendMode as BlendMode, shaderData);
		unit.element.renderStateIsBySprite = this._useSpriteState && blendMode === this._owner.blendMode;
		unit.element.textureKey = state.textureKey;
		unit.element.typeKey = state.typeKey;
		this._boundTexture = this._texture;
		this._boundInternalTexture = this._texture ? this._texture._texture : null;
		this._boundKind = this._int32[GraphicsSingleQuadPayloadField.Kind];
		this._boundBlendMode = blendMode;
		this._boundCustomMaterial = this._materialShaderData != null;
		this._hasBoundTextureState = true;
	}

	private _syncRenderStateOnly(): void {
		let unit = this._unit;
		if (!unit)
			return;
		let blendMode = this._int32[GraphicsSingleQuadPayloadField.BlendMode];
		let customMaterial = this._materialShaderData != null;
		if (blendMode !== this._boundBlendMode || customMaterial !== this._boundCustomMaterial) {
			let defineBits = unit.element.typeKey & ~((1 << ShaderDefines2D.TYPE_KEY_DEFINE_SHIFT) - 1);
			unit.element.typeKey = defineBits | blendMode | (customMaterial ? ShaderDefines2D.TYPEKEY_CUSTOM_MATERIAL : 0);
			BlendModeHandler.setShaderData(blendMode as BlendMode, unit.primitiveShaderData);
			this._boundBlendMode = blendMode;
			this._boundCustomMaterial = customMaterial;
		}
		unit.element.renderStateIsBySprite = this._useSpriteState && blendMode === this._owner.blendMode;
	}

	private _syncFillTextureRange(): void {
		let unit = this._unit;
		if (!unit)
			return;
		let range = unit.fillTextureRange;
		if (!range) {
			range = new Vector4();
			unit.fillTextureRange = range;
		}
		range.setValue(
			this._float32[GraphicsSingleQuadPayloadField.Aux4],
			this._float32[GraphicsSingleQuadPayloadField.Aux5],
			this._float32[GraphicsSingleQuadPayloadField.Aux6],
			this._float32[GraphicsSingleQuadPayloadField.Aux7]);
		unit.primitiveShaderData.setVector(ShaderDefines2D.UNIFORM_TEXRANGE, range);
	}

	private _writeVertices(ownerMatrix: Matrix, globalAlpha: number): boolean {
		let f32 = this._float32;
		let i32 = this._int32;
		let x = f32[GraphicsSingleQuadPayloadField.X];
		let y = f32[GraphicsSingleQuadPayloadField.Y];
		let width = f32[GraphicsSingleQuadPayloadField.Width];
		let height = f32[GraphicsSingleQuadPayloadField.Height];
		let flags = i32[GraphicsSingleQuadPayloadField.Flags];
		if ((flags & GraphicsSingleQuadFlag.Percent) !== 0) {
			let ownerWidth = this._handleControlFloat32
				? this._handleControlFloat32[GraphicsHandleUpdateField.OwnerWidth]
				: this._owner.owner.width;
			let ownerHeight = this._handleControlFloat32
				? this._handleControlFloat32[GraphicsHandleUpdateField.OwnerHeight]
				: this._owner.owner.height;
			x *= ownerWidth;
			y *= ownerHeight;
			width *= ownerWidth;
			height *= ownerHeight;
		}
		let kind = i32[GraphicsSingleQuadPayloadField.Kind];
		let u0 = f32[GraphicsSingleQuadPayloadField.U0];
		let v0 = f32[GraphicsSingleQuadPayloadField.V0];
		let u1 = f32[GraphicsSingleQuadPayloadField.U1];
		let v1 = f32[GraphicsSingleQuadPayloadField.V1];
		let u2 = f32[GraphicsSingleQuadPayloadField.U2];
		let v2 = f32[GraphicsSingleQuadPayloadField.V2];
		let u3 = f32[GraphicsSingleQuadPayloadField.U3];
		let v3 = f32[GraphicsSingleQuadPayloadField.V3];
		if (kind === GraphicsSingleQuadKind.TextureQuad) {
			x += width * f32[GraphicsSingleQuadPayloadField.Aux0];
			y += height * f32[GraphicsSingleQuadPayloadField.Aux1];
			width *= f32[GraphicsSingleQuadPayloadField.Aux2];
			height *= f32[GraphicsSingleQuadPayloadField.Aux3];
		}
		else if (kind === GraphicsSingleQuadKind.FillTexture) {
			let offsetX = f32[GraphicsSingleQuadPayloadField.Aux0];
			let offsetY = f32[GraphicsSingleQuadPayloadField.Aux1];
			let textureWidth = f32[GraphicsSingleQuadPayloadField.Aux2] || 1;
			let textureHeight = f32[GraphicsSingleQuadPayloadField.Aux3] || 1;
			let repeatX = (flags & GraphicsSingleQuadFlag.RepeatX) !== 0;
			let repeatY = (flags & GraphicsSingleQuadFlag.RepeatY) !== 0;
			let startX = offsetX < 0 ? x : x + offsetX;
			let startY = offsetY < 0 ? y : y + offsetY;
			let endX = x + width;
			let endY = y + height;
			if (!repeatX)
				endX = Math.min(endX, x + offsetX + textureWidth);
			if (!repeatY)
				endY = Math.min(endY, y + offsetY + textureHeight);
			if (endX < x || endY < y || startX > endX || startY > endY)
				return false;
			u0 = offsetX < 0 ? (-offsetX % textureWidth) / textureWidth : 0;
			v0 = offsetY < 0 ? (-offsetY % textureHeight) / textureHeight : 0;
			u2 = u1 = (endX - x - offsetX) / textureWidth;
			v2 = v3 = (endY - y - offsetY) / textureHeight;
			u3 = u0;
			v1 = v0;
			f32[GraphicsSingleQuadPayloadField.U0] = u0;
			f32[GraphicsSingleQuadPayloadField.V0] = v0;
			f32[GraphicsSingleQuadPayloadField.U1] = u1;
			f32[GraphicsSingleQuadPayloadField.V1] = v1;
			f32[GraphicsSingleQuadPayloadField.U2] = u2;
			f32[GraphicsSingleQuadPayloadField.V2] = v2;
			f32[GraphicsSingleQuadPayloadField.U3] = u3;
			f32[GraphicsSingleQuadPayloadField.V3] = v3;
			x = startX;
			y = startY;
			width = endX - startX;
			height = endY - startY;
		}
		else if (kind === GraphicsSingleQuadKind.SolidQuad && (width <= 0 || height <= 0)) {
			return false;
		}
		let color = i32[GraphicsSingleQuadPayloadField.PackedColor] >>> 0;
		let r = (color & 0xff) / 255;
		let g = ((color >>> 8) & 0xff) / 255;
		let b = ((color >>> 16) & 0xff) / 255;
		let a = (color >>> 24) / 255;
		let alpha = f32[GraphicsSingleQuadPayloadField.LocalAlpha] * globalAlpha;
		let hasMatrix = (flags & GraphicsSingleQuadFlag.HasLocalMatrix) !== 0;
		let data = this._unit.vertexViews[0]._getData();
		data.fill(0);
		this._writeVertex(data, 0, x, y, u0, v0, r, g, b, a, alpha, hasMatrix, ownerMatrix);
		this._writeVertex(data, 1, x + width, y, u1, v1, r, g, b, a, alpha, hasMatrix, ownerMatrix);
		this._writeVertex(data, 2, x + width, y + height, u2, v2, r, g, b, a, alpha, hasMatrix, ownerMatrix);
		this._writeVertex(data, 3, x, y + height, u3, v3, r, g, b, a, alpha, hasMatrix, ownerMatrix);
		this._unit.vertexViews[0]._modify();
		return true;
	}

	private _publishGeometry(visible: boolean): void {
		this._geometryVisible = visible;
		if (visible) {
			this._elements[0] = this._unit.element;
			this._elements.length = 1;
		}
		else {
			this._elements.length = 0;
		}
		this._owner.renderElements = this._elements;
	}

	private _writeVertex(data: Float32Array, vertexIndex: number, x: number, y: number, u: number, v: number,
		r: number, g: number, b: number, a: number, alpha: number, hasLocalMatrix: boolean, ownerMatrix: Matrix): void {
		let f32 = this._float32;
		if (hasLocalMatrix) {
			let px = x;
			let py = y;
			x = px * f32[GraphicsSingleQuadPayloadField.MatrixA] + py * f32[GraphicsSingleQuadPayloadField.MatrixC] + f32[GraphicsSingleQuadPayloadField.MatrixTx];
			y = px * f32[GraphicsSingleQuadPayloadField.MatrixB] + py * f32[GraphicsSingleQuadPayloadField.MatrixD] + f32[GraphicsSingleQuadPayloadField.MatrixTy];
		}
		switch (vertexIndex) {
			case 0:
				this._localX0 = x;
				this._localY0 = y;
				break;
			case 1:
				this._localX1 = x;
				this._localY1 = y;
				break;
			case 2:
				this._localX2 = x;
				this._localY2 = y;
				break;
			default:
				this._localX3 = x;
				this._localY3 = y;
				break;
		}
		if (ownerMatrix) {
			let px = x;
			let py = y;
			x = px * ownerMatrix.a + py * ownerMatrix.c + ownerMatrix.tx;
			y = px * ownerMatrix.b + py * ownerMatrix.d + ownerMatrix.ty;
		}
		let offset = vertexIndex * GraphicsDefines.stride;
		data[offset] = x;
		data[offset + 1] = y;
		data[offset + 2] = u;
		data[offset + 3] = v;
		data[offset + 4] = r;
		data[offset + 5] = g;
		data[offset + 6] = b;
		data[offset + 7] = a;
		data[offset + 8] = this._texture ? GRAPHICS_INFO_VERTEX_FLAG_ENABLED : GRAPHICS_INFO_VERTEX_FLAG_DISABLED;
		data[offset + 10] = alpha;
		data[offset + 11] = this._int32[GraphicsSingleQuadPayloadField.TextureLayer];
	}
}
