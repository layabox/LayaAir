import { LayaGL } from "../../../layagl/LayaGL";
import { Event } from "../../../events/Event";
import type { IGraphicsSingleQuadDataHandle } from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Texture } from "../../../resource/Texture";
import { ColorUtils } from "../../../utils/ColorUtils";
import { TextureArrayRegistry2D } from "../../../webgl/utils/TextureArrayRegistry2D";
import { Graphics } from "../../Graphics";
import { DrawImageCmd } from "../../cmd/DrawImageCmd";
import { DrawRectCmd } from "../../cmd/DrawRectCmd";
import { DrawTextureCmd } from "../../cmd/DrawTextureCmd";
import { FillTextureCmd } from "../../cmd/FillTextureCmd";
import {
	GraphicsSingleQuadFlag,
	GraphicsSingleQuadKind,
	GraphicsSingleQuadPayloadField,
	GraphicsCommandPatchResult,
	GraphicsHandleDirtyFlag,
} from "./GraphicsPipelineTypes";
import { GraphicsOpRenderStateHelper } from "./GraphicsPipelineHelpers";
import type { GraphicsRenderer } from "./GraphicsRenderer";

/**
 * Owns the complete SingleQuad state, including its fixed payload buffer.
 * GraphicsRenderer only selects and schedules this mode.
 * @internal
 */
export class GraphicsSingleQuadMode {
	private _dataHandle: IGraphicsSingleQuadDataHandle = null;
	private _payloadBuffer: ArrayBuffer = null;
	private _payloadInt32: Int32Array = null;
	private _payloadFloat32: Float32Array = null;
	private _submittedPayload: Int32Array = null;
	private _submittedResource: BaseTexture = null;
	private _submittedResourceInternal: any = null;
	private _submitted: boolean = false;
	private _texture: Texture = null;
	private _resource: BaseTexture = null;
	private _dependsOnSize: boolean = false;

	static classify(spriteTexture: Texture, graphics: Graphics): GraphicsSingleQuadKind | 0 {
		let cmds = graphics && graphics.cmds;
		let count = cmds ? cmds.length : 0;
		if (spriteTexture)
			return count === 0 ? GraphicsSingleQuadKind.SpriteTexture : 0;
		if (count !== 1)
			return 0;
		let cmd = cmds[0];
		switch (cmd.cmdID) {
			case DrawTextureCmd.ID:
			case DrawImageCmd.ID:
				return GraphicsSingleQuadKind.TextureQuad;
			case FillTextureCmd.ID: {
				let type = (cmd as FillTextureCmd).type;
				return type === "repeat" || type === "repeat-x" || type === "repeat-y" || type === "no-repeat"
					? GraphicsSingleQuadKind.FillTexture : 0;
			}
			case DrawRectCmd.ID: {
				let rect = cmd as DrawRectCmd;
				return rect.fillColor != null && (rect.lineColor == null || rect.lineWidth <= 0)
					? GraphicsSingleQuadKind.SolidQuad : 0;
			}
		}
		return 0;
	}

	constructor(private _renderer: GraphicsRenderer, handleControlBuffer: ArrayBuffer) {
		this._payloadBuffer = new ArrayBuffer(GraphicsSingleQuadPayloadField.WordCount * 4);
		this._payloadInt32 = new Int32Array(this._payloadBuffer);
		this._payloadFloat32 = new Float32Array(this._payloadBuffer);
		this._submittedPayload = new Int32Array(GraphicsSingleQuadPayloadField.WordCount);
		this._dataHandle = LayaGL.render2DRenderPassFactory.createGraphicsSingleQuadDataHandle();
		this._dataHandle.setGraphicsHandleUpdateBuffer(handleControlBuffer);
		this._dataHandle.setSingleQuadPayloadBuffer(this._payloadBuffer);
	}

	getDataHandle(): IGraphicsSingleQuadDataHandle {
		return this._dataHandle;
	}

	getDependsOnSize(): boolean {
		return this._dependsOnSize;
	}

	render(graphics: Graphics, kind: GraphicsSingleQuadKind): boolean {
		if (kind === GraphicsSingleQuadKind.SpriteTexture)
			return this._renderSpriteTexture();
		let cmd = graphics.cmds[0];
		let binding = cmd._cacheData;
		if (binding && binding.kind === "FrameAnimation") {
			binding.commandIndex = 0;
			binding.opStart = -1;
			binding.opCount = 0;
			binding.op = null;
		}
		switch (kind) {
			case GraphicsSingleQuadKind.TextureQuad:
				return this._renderTextureCommand(cmd as DrawTextureCmd | DrawImageCmd);
			case GraphicsSingleQuadKind.FillTexture:
				return this._renderFillTextureCommand(cmd as FillTextureCmd);
			default:
				return this._renderSolidQuadCommand(cmd as DrawRectCmd);
		}
	}

	patchFrameAnimation(cmd: DrawTextureCmd): GraphicsCommandPatchResult {
		return this._renderTextureCommand(cmd)
			? GraphicsCommandPatchResult.Changed
			: GraphicsCommandPatchResult.NoChange;
	}

	clear(): void {
		this._clearTextureRef();
		this._dependsOnSize = false;
		this._submitted = false;
		this._submittedResource = null;
		this._submittedResourceInternal = null;
	}

	deactivate(): void {
		this._dataHandle.deactivateSingleQuad();
	}

	destroy(): void {
		this.clear();
		this._dataHandle.destroy();
		this._dataHandle = null;
		this._payloadBuffer = null;
		this._payloadInt32 = null;
		this._payloadFloat32 = null;
		this._submittedPayload = null;
		this._renderer = null;
	}

	private _renderSpriteTexture(): boolean {
		let owner = this._renderer.owner;
		let texture = owner._texture;
		let textureLayer = this._prepareTexture(texture);
		this._beginPayload(GraphicsSingleQuadKind.TextureQuad, GraphicsSingleQuadFlag.None,
			0xffffffff, owner._struct.blendMode, 1, textureLayer);
		let f32 = this._payloadFloat32;

		let sourceWidth = texture.sourceWidth || texture.width || 1;
		let sourceHeight = texture.sourceHeight || texture.height || 1;
		let width = owner._isWidthSet ? owner._width : sourceWidth;
		let height = owner._isHeightSet ? owner._height : sourceHeight;
		let widthRate = width / sourceWidth;
		let heightRate = height / sourceHeight;
		f32[GraphicsSingleQuadPayloadField.X] = texture.offsetX * widthRate;
		f32[GraphicsSingleQuadPayloadField.Y] = texture.offsetY * heightRate;
		f32[GraphicsSingleQuadPayloadField.Width] = texture.width * widthRate;
		f32[GraphicsSingleQuadPayloadField.Height] = texture.height * heightRate;

		let uv = texture._uv || texture.uv || Texture.DEF_UV;
		this._writeUV(uv);
		f32[GraphicsSingleQuadPayloadField.Aux2] = 1;
		f32[GraphicsSingleQuadPayloadField.Aux3] = 1;
		return this._submitPayload(false);
	}

	private _renderTextureCommand(cmd: DrawTextureCmd | DrawImageCmd): boolean {
		let texture = cmd.texture;
		let textureLayer = this._prepareTexture(texture);

		let owner = this._renderer.owner;
		let drawTexture = cmd.cmdID === DrawTextureCmd.ID ? cmd as DrawTextureCmd : null;
		let flags = (drawTexture && drawTexture.percent ? GraphicsSingleQuadFlag.Percent : 0)
			| (drawTexture && drawTexture.matrix ? GraphicsSingleQuadFlag.HasLocalMatrix : 0);
		let blendMode = drawTexture && drawTexture.blendMode
			? GraphicsOpRenderStateHelper.parseBlendMode(drawTexture.blendMode)
			: owner._struct.blendMode;
		this._beginPayload(GraphicsSingleQuadKind.TextureQuad, flags,
			cmd.color == null ? 0xffffffff : cmd.color, blendMode, drawTexture ? drawTexture.alpha : 1, textureLayer);
		let f32 = this._payloadFloat32;
		f32[GraphicsSingleQuadPayloadField.X] = cmd.x;
		f32[GraphicsSingleQuadPayloadField.Y] = cmd.y;
		f32[GraphicsSingleQuadPayloadField.Width] = cmd.width;
		f32[GraphicsSingleQuadPayloadField.Height] = cmd.height;

		let uv = drawTexture ? (drawTexture.uv || texture?._uv || Texture.DEF_UV) : (texture?._uv || Texture.DEF_UV);
		this._writeUV(uv);
		let sourceWidth = texture ? (texture.sourceWidth || texture.width || 1) : 1;
		let sourceHeight = texture ? (texture.sourceHeight || texture.height || 1) : 1;
		f32[GraphicsSingleQuadPayloadField.Aux0] = texture ? texture.offsetX / sourceWidth : 0;
		f32[GraphicsSingleQuadPayloadField.Aux1] = texture ? texture.offsetY / sourceHeight : 0;
		f32[GraphicsSingleQuadPayloadField.Aux2] = texture ? texture.width / sourceWidth : 1;
		f32[GraphicsSingleQuadPayloadField.Aux3] = texture ? texture.height / sourceHeight : 1;
		let matrix = drawTexture && drawTexture.matrix;
		f32[GraphicsSingleQuadPayloadField.MatrixA] = matrix ? matrix.a : 1;
		f32[GraphicsSingleQuadPayloadField.MatrixB] = matrix ? matrix.b : 0;
		f32[GraphicsSingleQuadPayloadField.MatrixC] = matrix ? matrix.c : 0;
		f32[GraphicsSingleQuadPayloadField.MatrixD] = matrix ? matrix.d : 1;
		f32[GraphicsSingleQuadPayloadField.MatrixTx] = matrix ? matrix.tx : 0;
		f32[GraphicsSingleQuadPayloadField.MatrixTy] = matrix ? matrix.ty : 0;
		return this._submitPayload(!!(drawTexture && drawTexture.percent));
	}

	private _renderFillTextureCommand(cmd: FillTextureCmd): boolean {
		let texture = cmd.texture;
		let textureLayer = this._prepareTexture(texture);

		let repeatX = cmd.type === "repeat" || cmd.type === "repeat-x";
		let repeatY = cmd.type === "repeat" || cmd.type === "repeat-y";
		let flags = (cmd.percent ? GraphicsSingleQuadFlag.Percent : 0)
			| (repeatX ? GraphicsSingleQuadFlag.RepeatX : 0)
			| (repeatY ? GraphicsSingleQuadFlag.RepeatY : 0);
		this._beginPayload(GraphicsSingleQuadKind.FillTexture, flags,
			cmd.color == null ? 0xffffffff : cmd.color, this._renderer.owner._struct.blendMode, 1, textureLayer);
		let f32 = this._payloadFloat32;
		f32[GraphicsSingleQuadPayloadField.X] = cmd.x;
		f32[GraphicsSingleQuadPayloadField.Y] = cmd.y;
		f32[GraphicsSingleQuadPayloadField.Width] = cmd.width;
		f32[GraphicsSingleQuadPayloadField.Height] = cmd.height;
		f32[GraphicsSingleQuadPayloadField.Aux0] = cmd.offset ? cmd.offset.x : 0;
		f32[GraphicsSingleQuadPayloadField.Aux1] = cmd.offset ? cmd.offset.y : 0;
		let sourceWidth = texture ? (texture.sourceWidth || texture.width || 1) : 1;
		let sourceHeight = texture ? (texture.sourceHeight || texture.height || 1) : 1;
		f32[GraphicsSingleQuadPayloadField.Aux2] = sourceWidth;
		f32[GraphicsSingleQuadPayloadField.Aux3] = sourceHeight;
		f32[GraphicsSingleQuadPayloadField.FillTrimX] = texture ? texture.offsetX / sourceWidth : 0;
		f32[GraphicsSingleQuadPayloadField.FillTrimY] = texture ? texture.offsetY / sourceHeight : 0;
		f32[GraphicsSingleQuadPayloadField.FillTrimWidth] = texture ? texture.width / sourceWidth : 1;
		f32[GraphicsSingleQuadPayloadField.FillTrimHeight] = texture ? texture.height / sourceHeight : 1;
		let uvRange = texture && texture.uvrect;
		f32[GraphicsSingleQuadPayloadField.Aux4] = uvRange ? uvRange[0] : 0;
		f32[GraphicsSingleQuadPayloadField.Aux5] = uvRange ? uvRange[1] : 0;
		f32[GraphicsSingleQuadPayloadField.Aux6] = uvRange ? uvRange[2] : 1;
		f32[GraphicsSingleQuadPayloadField.Aux7] = uvRange ? uvRange[3] : 1;
		return this._submitPayload(!!cmd.percent);
	}

	private _renderSolidQuadCommand(cmd: DrawRectCmd): boolean {
		this._clearTextureRef();

		let color = typeof cmd.fillColor === "number"
			? cmd.fillColor
			: ColorUtils.create(cmd.fillColor).numColor;
		this._beginPayload(GraphicsSingleQuadKind.SolidQuad,
			cmd.percent ? GraphicsSingleQuadFlag.Percent : 0,
			color, this._renderer.owner._struct.blendMode, 1, 0);
		let f32 = this._payloadFloat32;
		f32[GraphicsSingleQuadPayloadField.X] = cmd.x;
		f32[GraphicsSingleQuadPayloadField.Y] = cmd.y;
		f32[GraphicsSingleQuadPayloadField.Width] = cmd.width;
		f32[GraphicsSingleQuadPayloadField.Height] = cmd.height;
		return this._submitPayload(!!cmd.percent);
	}

	private _beginPayload(kind: GraphicsSingleQuadKind, flags: GraphicsSingleQuadFlag,
		color: number, blendMode: number, alpha: number, textureLayer: number): void {
		let i32 = this._payloadInt32;
		let f32 = this._payloadFloat32;
		i32.fill(0);
		i32[GraphicsSingleQuadPayloadField.Kind] = kind;
		i32[GraphicsSingleQuadPayloadField.Flags] = flags;
		i32[GraphicsSingleQuadPayloadField.PackedColor] = color;
		i32[GraphicsSingleQuadPayloadField.BlendMode] = blendMode;
		i32[GraphicsSingleQuadPayloadField.TextureLayer] = textureLayer;
		f32[GraphicsSingleQuadPayloadField.LocalAlpha] = alpha;
		f32[GraphicsSingleQuadPayloadField.MatrixA] = 1;
		f32[GraphicsSingleQuadPayloadField.MatrixD] = 1;
	}

	private _submitPayload(dependsOnSize: boolean): boolean {
		this._dependsOnSize = dependsOnSize;
		this._renderer._syncGraphicsOwnerSize();
		let resourceInternal = this._resource ? this._resource._texture : null;
		let firstSubmit = !this._submitted;
		let resourceChanged = firstSubmit || this._submittedResource !== this._resource
			|| this._submittedResourceInternal !== resourceInternal;
		let stateChanged = firstSubmit
			|| this._submittedPayload[GraphicsSingleQuadPayloadField.Kind] !== this._payloadInt32[GraphicsSingleQuadPayloadField.Kind]
			|| this._submittedPayload[GraphicsSingleQuadPayloadField.BlendMode] !== this._payloadInt32[GraphicsSingleQuadPayloadField.BlendMode];
		let payloadChanged = firstSubmit;
		for (let i = 0; !payloadChanged && i < GraphicsSingleQuadPayloadField.WordCount; i++)
			payloadChanged = this._submittedPayload[i] !== this._payloadInt32[i];
		if (!payloadChanged && !resourceChanged)
			return false;
		let flags = payloadChanged ? GraphicsHandleDirtyFlag.OpPayload : GraphicsHandleDirtyFlag.None;
		if (resourceChanged)
			flags |= GraphicsHandleDirtyFlag.OpResource;
		if (stateChanged)
			flags |= GraphicsHandleDirtyFlag.OpState;
		this._renderer._publishSingleQuadInputs(flags);
		this._submittedPayload.set(this._payloadInt32);
		this._submittedResource = this._resource;
		this._submittedResourceInternal = resourceInternal;
		this._submitted = this._dataHandle.syncSingleQuad(this._resource);
		return this._submitted;
	}

	private _writeUV(uv: ArrayLike<number>): void {
		let f32 = this._payloadFloat32;
		f32[GraphicsSingleQuadPayloadField.U0] = uv[0];
		f32[GraphicsSingleQuadPayloadField.V0] = uv[1];
		f32[GraphicsSingleQuadPayloadField.U1] = uv[2];
		f32[GraphicsSingleQuadPayloadField.V1] = uv[3];
		f32[GraphicsSingleQuadPayloadField.U2] = uv[4] == null ? uv[2] : uv[4];
		f32[GraphicsSingleQuadPayloadField.V2] = uv[5] == null ? uv[3] : uv[5];
		f32[GraphicsSingleQuadPayloadField.U3] = uv[6] == null ? uv[0] : uv[6];
		f32[GraphicsSingleQuadPayloadField.V3] = uv[7] == null ? f32[GraphicsSingleQuadPayloadField.V2] : uv[7];
	}

	private _prepareTexture(texture: Texture): number {
		this._syncTextureRef(texture);
		this._resource = null;
		let textureLayer = 0;
		if (texture && !texture.destroyed && texture.valid) {
			this._resource = texture.bitmap;
			let registry = TextureArrayRegistry2D.resolve(this._resource);
			if (registry) {
				this._resource = registry.array;
				textureLayer = registry.layer | 0;
			}
		}
		else if (texture) {
			this._renderer.requestTextureRecovery(texture);
		}
		return textureLayer;
	}

	private _syncTextureRef(texture: Texture): void {
		if (this._texture === texture)
			return;
		this._clearTextureRef();
		this._texture = texture;
		if (texture)
			texture.on(Event.CHANGE, this, this._onTextureChange);
	}

	private _clearTextureRef(): void {
		let texture = this._texture;
		this._texture = null;
		this._resource = null;
		if (texture)
			texture.off(Event.CHANGE, this, this._onTextureChange);
	}

	private _onTextureChange(): void {
		this._renderer._scheduleGraphicsPayloadUpdate();
	}
}
