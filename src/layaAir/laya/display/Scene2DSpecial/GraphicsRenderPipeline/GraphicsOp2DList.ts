import type {
	IGraphicsFillTextureOp2D,
	IGraphicsMeshOp2D,
	IGraphicsMultiQuadOp2D,
	IGraphicsOp2D,
	IGraphicsSolidQuadOp2D,
	IGraphicsTextOp2D,
	IGraphicsTextureQuadOp2D,
} from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { Draw9GridTextureCmd } from "../../cmd/Draw9GridTextureCmd";
import { DrawTexturesCmd } from "../../cmd/DrawTexturesCmd";
import { FillTextCmd } from "../../cmd/FillTextCmd";
import {
	type GraphicsCommandId,
	GraphicsOp2DKind,
	GraphicsOp2DDirtyFlag,
} from "./GraphicsPipelineTypes";
import { GraphicsDefines } from "../../../webgl/shader/d2/GraphicsDefines";

/** @internal */
export class GraphicsOp2DList {

	readonly ops: IGraphicsOp2D[] = [];

	private _activeCommandIndex: number = -1;
	private _activeCommandId: GraphicsCommandId = "";
	private _activeCommandOp: IGraphicsOp2D = null;
	private _rewriteStart: number = -1;
	private _rewriteEnd: number = -1;
	private _rewriteCursor: number = -1;
	private _rewriteStructureKeys: string[] = [];
	private _rewriteFailed: boolean = false;
	private _rewriteDiscardOps: IGraphicsOp2D[] = [];

	get opCount(): number {
		return this.ops.length;
	}

	clear(): void {
		for (let i = 0, n = this.ops.length; i < n; i++)
			this.ops[i].destroy();
		this.ops.length = 0;
		this.resetState();
	}

	releaseOps(): void {
		this.ops.length = 0;
		this.resetState();
	}

	private resetState(): void {
		this._activeCommandIndex = -1;
		this._activeCommandId = "";
		this._activeCommandOp = null;
	}

	beginCommand(commandIndex: number, commandId: GraphicsCommandId): void {
		this._activeCommandIndex = commandIndex;
		this._activeCommandId = commandId;
		this._activeCommandOp = null;
	}

	beginRewriteCommand(commandIndex: number, commandId: GraphicsCommandId, opStart: number, opCount: number): boolean {
		if (opStart < 0 || opCount <= 0 || opStart + opCount > this.ops.length)
			return false;
		this.beginCommand(commandIndex, commandId);
		this._rewriteStart = opStart;
		this._rewriteEnd = opStart + opCount;
		this._rewriteCursor = opStart;
		this._rewriteFailed = false;
		this._rewriteStructureKeys.length = opCount;
		for (let i = 0; i < opCount; i++)
			this._rewriteStructureKeys[i] = this.ops[opStart + i].getStructureKey();
		return true;
	}

	finishRewriteCommand(): boolean {
		let success = this._rewriteStart >= 0 && !this._rewriteFailed && this._rewriteCursor === this._rewriteEnd;
		if (success) {
			for (let i = this._rewriteStart, end = this._rewriteEnd; i < end; i++) {
				if (this.ops[i].getStructureKey() !== this._rewriteStructureKeys[i - this._rewriteStart]) {
					success = false;
					break;
				}
			}
		}
		this.cancelRewriteCommand();
		return success;
	}

	cancelRewriteCommand(): void {
		this._rewriteStart = -1;
		this._rewriteEnd = -1;
		this._rewriteCursor = -1;
		this._rewriteFailed = false;
		this._rewriteStructureKeys.length = 0;
		for (let i = 0, n = this._rewriteDiscardOps.length; i < n; i++)
			this._rewriteDiscardOps[i].destroy();
		this._rewriteDiscardOps.length = 0;
		this.endCommand();
	}

	endCommand(): void {
		this._activeCommandIndex = -1;
		this._activeCommandId = "";
		this._activeCommandOp = null;
	}

	setOwnerSize(_width: number, _height: number): void {
	}

	getTextureQuadTargetOp(): IGraphicsTextureQuadOp2D | IGraphicsMultiQuadOp2D | IGraphicsTextOp2D {
		if (this._activeCommandId === DrawTexturesCmd.ID || this._activeCommandId === Draw9GridTextureCmd.ID)
			return this._activeCommandOp as IGraphicsMultiQuadOp2D || this._appendOp(GraphicsOp2DKind.MultiQuad) as IGraphicsMultiQuadOp2D;
		if (this._activeCommandId === FillTextCmd.ID)
			return this._activeCommandOp as IGraphicsTextOp2D || this._appendOp(GraphicsOp2DKind.Text) as IGraphicsTextOp2D;
		return this._appendOp(GraphicsOp2DKind.TextureQuad) as IGraphicsTextureQuadOp2D;
	}

	appendSolidQuadOp(): IGraphicsSolidQuadOp2D {
		return this._appendOp(GraphicsOp2DKind.SolidQuad) as IGraphicsSolidQuadOp2D;
	}

	appendFillTextureOp(): IGraphicsFillTextureOp2D {
		return this._appendOp(GraphicsOp2DKind.FillTexture) as IGraphicsFillTextureOp2D;
	}

	appendMeshOp(): IGraphicsMeshOp2D {
		return this._appendOp(GraphicsOp2DKind.Mesh) as IGraphicsMeshOp2D;
	}

	getCommandOp(commandIndex: number): IGraphicsOp2D {
		for (let i = 0, n = this.ops.length; i < n; i++) {
			let op = this.ops[i];
			if (op.commandIndex === commandIndex)
				return op;
		}
		return null;
	}

	getOpIndex(op: IGraphicsOp2D): number {
		return this.ops.indexOf(op);
	}

	clearDirty(): void {
		for (let i = 0, n = this.ops.length; i < n; i++)
			this.ops[i].clearDirty();
	}

	clearDirtyRange(start: number, count: number): void {
		let end = Math.min(start + count, this.ops.length);
		for (let i = Math.max(0, start); i < end; i++)
			this.ops[i].clearDirty();
	}

	clearDirtyFlagsOnly(): void {
		for (let i = 0, n = this.ops.length; i < n; i++) {
			let op = this.ops[i];
			if (op.clearDirtyFlagsOnly)
				op.clearDirtyFlagsOnly();
			else
				op.clearDirty();
		}
	}

	clearDirtyFlagsOnlyRange(start: number, count: number): void {
		let end = Math.min(start + count, this.ops.length);
		for (let i = Math.max(0, start); i < end; i++) {
			let op = this.ops[i];
			if (op.clearDirtyFlagsOnly)
				op.clearDirtyFlagsOnly();
			else
				op.clearDirty();
		}
	}

	private _appendOp(kind: GraphicsOp2DKind): IGraphicsOp2D {
		if (this._rewriteStart >= 0)
			return this._reuseRewriteOp(kind);
		let op = this._createOp(kind);
		this.ops.push(op);
		this._activeCommandOp = op;
		return op;
	}

	private _reuseRewriteOp(kind: GraphicsOp2DKind): IGraphicsOp2D {
		if (this._rewriteFailed)
			return this._createRewriteDiscardOp(kind);
		if (this._rewriteCursor < 0 || this._rewriteCursor >= this._rewriteEnd) {
			this._rewriteFailed = true;
			return this._createRewriteDiscardOp(kind);
		}
		let op = this.ops[this._rewriteCursor];
		if (!op || op.kind !== kind || !op.canUpdate(this._activeCommandId)) {
			this._rewriteFailed = true;
			return this._createRewriteDiscardOp(kind);
		}
		op.resetRecords();
		this._rewriteCursor++;
		this._activeCommandOp = op;
		return op;
	}

	private _createRewriteDiscardOp(kind: GraphicsOp2DKind): IGraphicsOp2D {
		let op = this._createOp(kind);
		this._rewriteDiscardOps.push(op);
		this._activeCommandOp = op;
		return op;
	}

	private _createOp(kind: GraphicsOp2DKind): IGraphicsOp2D {
		let factory = GraphicsDefines._factory;
		switch (kind) {
			case GraphicsOp2DKind.TextureQuad:
				return factory.createTextureQuadOp(this._activeCommandIndex, this._activeCommandId);
			case GraphicsOp2DKind.SolidQuad:
				return factory.createSolidQuadOp(this._activeCommandIndex, this._activeCommandId);
			case GraphicsOp2DKind.FillTexture:
				return factory.createFillTextureOp(this._activeCommandIndex, this._activeCommandId);
			case GraphicsOp2DKind.MultiQuad:
				return factory.createMultiQuadOp(this._activeCommandIndex, this._activeCommandId);
			case GraphicsOp2DKind.Text:
				return factory.createTextOp(this._activeCommandIndex, this._activeCommandId);
			default:
				return factory.createMeshOp(this._activeCommandIndex, this._activeCommandId);
		}
	}

}
