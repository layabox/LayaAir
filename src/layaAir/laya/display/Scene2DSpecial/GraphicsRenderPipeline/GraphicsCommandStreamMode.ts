import { type IGraphicsCommandStreamDataHandle, type IGraphicsMultiQuadOp2D, type IGraphicsOp2D, type IGraphicsTextOp2D, type IGraphicsTextureQuadOp2D } from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { LayaGL } from "../../../layagl/LayaGL";
import { Draw9GridTextureCmd } from "../../cmd/Draw9GridTextureCmd";
import { DrawTexturesCmd } from "../../cmd/DrawTexturesCmd";
import { FillTextCmd } from "../../cmd/FillTextCmd";
import { GraphicsOp2DKind, GraphicsOp2DDirtyFlag, GraphicsCommandDependency, GraphicsCommandLayoutRefresh, GraphicsInfoDirtyFlag, GraphicsOwnerTransformDependency, GraphicsRefreshAction, GraphicsHandleDirtyFlag, GraphicsCommandPatchResult, type GraphicsCommandId, type GraphicsCommandInfo, type GraphicsCommandRangeRecord, type GraphicsOp2DPatchResult, type GraphicsOp2DTextureHost } from "./GraphicsPipelineTypes";
import { GraphicsDefines } from "../../../webgl/shader/d2/GraphicsDefines";
import { type IGraphicsCmd } from "../../IGraphics";
import { Sprite } from "../../Sprite";
import { SaveCmd } from "../../cmd/SaveCmd";
import { RestoreCmd } from "../../cmd/RestoreCmd";
import { GraphicsCompileContext } from "./GraphicsCompileContext";
import { Texture } from "../../../resource/Texture";
import { Event } from "../../../events/Event";
import { DrawTextureCmd } from "../../cmd/DrawTextureCmd";
import { type GraphicsRunner } from "../GraphicsRunner";
import { Render2DProcessor } from "../../Render2DProcessor";
import type { GraphicsRenderer } from "./GraphicsRenderer";

const REBUILD_SOURCE_STRUCTURE_DIRTY = 0x80000000;
const REBUILD_SIGNATURE_VALUE_MASK = 0x7fffffff;
const INVALID_COMMAND_SPLICE_INDEX = -2;
const LOCAL_REPLACEMENT_SPLICE_LIMIT = 32;
interface GraphicsCommandTextureRecord {
   texture: Texture;
   listening: boolean;
   commandIndices: number | number[];
   buildVersion: number;
}
const enum GraphicsCommandTrackerFlag {
   StateDependency = 1 << 0,
   SizePayload = 1 << 1,
   ScaleTessellation = 1 << 2,
   LayoutLocal = 1 << 3,
   LayoutStructural = 1 << 4,
   StateCommand = 1 << 5,
   PendingReplacement = 1 << 6,
}
const enum GraphicsCommandMetadataField {
   OpStart,
   OpCount,
   Flags,
   TessellationKey,
   StateScope,
   Stride,
}
const enum GraphicsStateScopeField {
   ParentScope,
   CommandStart,
   CommandEnd,
   Stride,
}
const GRAPHICS_STATE_FRAME_STRIDE = 8;
const SPRITE_TEXTURE_COMMAND_INDEX = 0x7fffffff;
const SPRITE_TEXTURE_COMMAND_ID = "$spriteTexture";
// Graphics compilation is synchronous and non-reentrant. Ops copy these values
// before returning, so one module-level workspace replaces per-Mode scratch objects.
const PATCH_RESULT: GraphicsOp2DPatchResult = { success: false, opIndex: -1, dirtyFlags: GraphicsOp2DDirtyFlag.None };
const COMMAND_RANGE_SCRATCH: GraphicsCommandRangeRecord = { commandIndex: -1, start: -1, count: 0, active: false };
// Rebuild/rewrite are synchronous and non-reentrant. Keep their capacity at
// module scope so many retained Modes share one high-water workspace.
const REBUILD_OPS_SCRATCH: IGraphicsOp2D[] = [];
let REBUILD_SIGNATURES_SCRATCH: Int32Array = new Int32Array(32);
let REBUILD_SOURCE_INDICES_SCRATCH: Int32Array = new Int32Array(8);
let REWRITE_SIGNATURES_SCRATCH: Int32Array = new Int32Array(32);
const REWRITE_DISCARD_OPS_SCRATCH: IGraphicsOp2D[] = [];
let REWRITE_DIRTY_START_SCRATCH = Number.MAX_SAFE_INTEGER;
let REWRITE_DIRTY_END_SCRATCH = -1;
let REWRITE_DIRTY_FLAGS_SCRATCH = GraphicsOp2DDirtyFlag.None;
const ACTIVE_MULTI_QUAD_TEXTURES_SCRATCH: GraphicsOp2DTextureHost[] = [];
const SCALE_TESSELLATION_DIRTY_COMMANDS_SCRATCH: number[] = [];
const SINGLE_TEXTURE_COMMAND_SCRATCH: number[] = [-1];
const COMMAND_INFO_SCRATCH: GraphicsCommandInfo = {
   dependency: GraphicsCommandDependency.None,
   layoutRefresh: GraphicsCommandLayoutRefresh.None,
   scaleTessellationKey: 0,
   isStateCommand: false,
};
/** @internal Single retained CommandStream runtime; no business inheritance layers. */
export class GraphicsCommandStreamMode {
   private _dataHandle: IGraphicsCommandStreamDataHandle = null;
   readonly ops: IGraphicsOp2D[] = [];
   private _activeCommandIndex: number = -1;
   private _activeRebuildSourceCommandIndex: number = -1;
   private _activeCommandId: GraphicsCommandId = "";
   private _activeCommandOp: IGraphicsOp2D = null;
   private _rewriteStart: number = -1;
   private _rewriteEnd: number = -1;
   private _rewriteCursor: number = -1;
   private _rewriteFailed: boolean = false;
   private _rebuildCursor: number = 0;
   private _rebuilding: boolean = false;
   private _rebuildSpliceIndex: number = -1;
   private _rebuildSpliceRemovedCount: number = 0;
   private _rebuildSpliceAddedCount: number = 0;

   clear(releaseHandle: boolean = false): void {
   	this._finishOrCancelRebuild(true);
   	for (let i = 0, n = this.ops.length; i < n; i++)
   		this.ops[i].destroy();
      this.ops.length = 0;
      this.resetState();
      if (releaseHandle && this._dataHandle)
         this._dataHandle.syncGraphicsOps(GraphicsCommandStreamMode._emptyOps);
   }

   private resetState(): void {
   	this._activeCommandIndex = -1;
   	this._activeRebuildSourceCommandIndex = -1;
   	this._activeCommandId = "";
   	this._activeCommandOp = null;
   }

   beginCommand(commandIndex: number, commandId: GraphicsCommandId): void {
   	this._activeCommandIndex = commandIndex;
   	this._activeRebuildSourceCommandIndex = this._getRebuildSourceCommandIndex(commandIndex);
   	this._activeCommandId = commandId;
   	this._activeCommandOp = null;
   }

   endCommand(): void {
   	this.resetState();
   }

   getTextureQuadTargetOp(): IGraphicsTextureQuadOp2D | IGraphicsMultiQuadOp2D | IGraphicsTextOp2D {
   	if (this._textureQuadPatchTarget)
   		return this._textureQuadPatchTarget;
   	if (this._activeCommandId === DrawTexturesCmd.ID || this._activeCommandId === Draw9GridTextureCmd.ID)
   		return this._activeCommandOp as IGraphicsMultiQuadOp2D || this._appendOp(GraphicsOp2DKind.MultiQuad) as IGraphicsMultiQuadOp2D;
   	if (this._activeCommandId === FillTextCmd.ID)
   		return this._activeCommandOp as IGraphicsTextOp2D || this._appendOp(GraphicsOp2DKind.Text) as IGraphicsTextOp2D;
   	return this._appendOp(GraphicsOp2DKind.TextureQuad) as IGraphicsTextureQuadOp2D;
   }

   clearDirty(start: number = 0, count: number = this.ops.length): void {
   	let end = Math.min(start + count, this.ops.length);
   	for (let i = Math.max(0, start); i < end; i++)
   		this.ops[i].clearDirty();
   }

   clearDirtyFlagsOnly(start: number = 0, count: number = this.ops.length): void {
   	let end = Math.min(start + count, this.ops.length);
   	for (let i = Math.max(0, start); i < end; i++) {
   		let op = this.ops[i];
   		if (op.clearDirtyFlagsOnly)
   			op.clearDirtyFlagsOnly();
   		else
   			op.clearDirty();
   	}
   }
   _appendOp(kind: GraphicsOp2DKind): IGraphicsOp2D {
   	if (this._rewriteStart >= 0)
   		return this._reuseRewriteOp(kind);
   	if (this._rebuilding)
   		return this._reuseRebuildOp(kind);
   	let op = this._createOp(kind);
   	this.ops.push(op);
   	this._activeCommandOp = op;
   	return op;
   }
   private _reuseRebuildOp(kind: GraphicsOp2DKind): IGraphicsOp2D {
   	let rebuildOps = REBUILD_OPS_SCRATCH;
   	let sourceIndex = this._findCompatibleRebuildOp(kind);
   	let oldOp = sourceIndex >= 0 ? rebuildOps[sourceIndex] : null;
   	let op: IGraphicsOp2D;
   	if (oldOp) {
   		op = oldOp;
   		op.resetRecords();
   		op.setCommandIndex(this._activeCommandIndex);
   		rebuildOps[sourceIndex] = null;
   	} else {
   		op = this._createOp(kind);
   	}
   	this._ensureRebuildSignatureCapacity(this.ops.length + 1);
   	REBUILD_SOURCE_INDICES_SCRATCH[this.ops.length] = sourceIndex;
   	this.ops.push(op);
   	this._activeCommandOp = op;
   	return op;
   }
   private _findCompatibleRebuildOp(kind: GraphicsOp2DKind): number {
   	let rebuildOps = REBUILD_OPS_SCRATCH;
   	let sourceCommandIndex = this._activeRebuildSourceCommandIndex;
   	if (!rebuildOps || sourceCommandIndex < 0)
   		return -1;
   	let cursor = this._rebuildCursor;
   	while (cursor < rebuildOps.length) {
   		let op = rebuildOps[cursor];
   		if (!op || op.commandIndex < sourceCommandIndex) {
   			cursor++;
   			continue;
   		}
   		if (op.commandIndex > sourceCommandIndex)
   			break;
   		if (op.kind === kind && op.canUpdate(this._activeCommandId)) {
   			this._rebuildCursor = cursor + 1;
   			return cursor;
   		}
   		cursor++;
   	}
   	this._rebuildCursor = cursor;
   	return -1;
   }
   private _getRebuildSourceCommandIndex(commandIndex: number): number {
   	let spliceIndex = this._rebuildSpliceIndex;
   	if (!this._rebuilding || spliceIndex < 0)
   		return commandIndex;
   	if (commandIndex < spliceIndex)
   		return commandIndex;
   	let addedEnd = spliceIndex + this._rebuildSpliceAddedCount;
   	if (commandIndex < addedEnd) {
   		let replacementOffset = commandIndex - spliceIndex;
   		return replacementOffset < this._rebuildSpliceRemovedCount
   			? spliceIndex + replacementOffset
   			: -1;
   	}
   	return commandIndex - this._rebuildSpliceAddedCount + this._rebuildSpliceRemovedCount;
   }
   private _finishOrCancelRebuild(destroyCurrentOps: boolean): boolean {
   	if (!this._rebuilding)
   		return false;
   	let rebuildOps = REBUILD_OPS_SCRATCH;
   	let topologyChanged = !destroyCurrentOps && rebuildOps.length === 0 && this.ops.length > 0;
   	if (rebuildOps.length > 0) {
   		if (!destroyCurrentOps) {
   			let count = this.ops.length;
   			for (let i = 0; i < count; i++) {
   				let op = this.ops[i];
   				let sourceIndex = REBUILD_SOURCE_INDICES_SCRATCH[i];
   				if (sourceIndex < 0 || rebuildOps[sourceIndex]) {
   					topologyChanged = true;
   					continue;
   				}
   				if (sourceIndex !== i)
   					topologyChanged = true;
   				let signatureOffset = sourceIndex * 4;
   				let signatureTail = REBUILD_SIGNATURES_SCRATCH[signatureOffset + 3];
   				let sourceStructureDirty = (signatureTail & REBUILD_SOURCE_STRUCTURE_DIRTY) !== 0;
   				if (sourceStructureDirty)
   					REBUILD_SIGNATURES_SCRATCH[signatureOffset + 3] = signatureTail & REBUILD_SIGNATURE_VALUE_MASK;
   				let structureStable = op.matchesStructureSignature(REBUILD_SIGNATURES_SCRATCH, signatureOffset);
   				if (sourceStructureDirty)
   					REBUILD_SIGNATURES_SCRATCH[signatureOffset + 3] = signatureTail;
   				if (structureStable && !sourceStructureDirty) {
   					op.clearStructureDirty();
   				} else {
   					op.markDirty(GraphicsOp2DDirtyFlag.Structure);
   					topologyChanged = true;
   				}
   			}
   		}
   		for (let i = 0, n = rebuildOps.length; i < n; i++) {
   			let op = rebuildOps[i];
   			if (op) {
   				topologyChanged = true;
   				// Runtime still owns the previous Op-ref order until the rebuilt list
   				// is synchronized. Mark deleted refs as tombstones so shifted live Ops
   				// can be found by the same linear command-index cursor.
   				op.setCommandIndex(-1);
   				op.destroy();
   			}
   		}
   		rebuildOps.length = 0;
   	}
   	if (destroyCurrentOps) {
   		for (let i = 0, n = this.ops.length; i < n; i++)
   			this.ops[i].destroy();
   		this.ops.length = 0;
   	}
   	this._rebuilding = false;
   	this._rebuildCursor = 0;
   	this._rebuildSpliceIndex = -1;
   	this._rebuildSpliceRemovedCount = 0;
   	this._rebuildSpliceAddedCount = 0;
   	return topologyChanged;
   }
   private _ensureRebuildSignatureCapacity(opCount: number): void {
   	if (opCount <= REBUILD_SOURCE_INDICES_SCRATCH.length)
   		return;
   	let capacity = Math.max(8, REBUILD_SOURCE_INDICES_SCRATCH.length);
   	while (capacity < opCount)
   		capacity <<= 1;
   	let signatures = new Int32Array(capacity * 4);
   	let sourceIndices = new Int32Array(capacity);
   	signatures.set(REBUILD_SIGNATURES_SCRATCH);
   	sourceIndices.set(REBUILD_SOURCE_INDICES_SCRATCH);
   	REBUILD_SIGNATURES_SCRATCH = signatures;
   	REBUILD_SOURCE_INDICES_SCRATCH = sourceIndices;
   }
   private _ensureRewriteSignatureCapacity(opCount: number): void {
   	if (opCount * 4 <= REWRITE_SIGNATURES_SCRATCH.length)
   		return;
   	let capacity = Math.max(8, REWRITE_SIGNATURES_SCRATCH.length >> 2);
   	while (capacity < opCount)
   		capacity <<= 1;
   	REWRITE_SIGNATURES_SCRATCH = new Int32Array(capacity * 4);
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
   	REWRITE_DISCARD_OPS_SCRATCH.push(op);
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
   private static readonly _emptyOps: ReadonlyArray<IGraphicsOp2D> = [];
   private static readonly _emptyCommandList: number[] = [];
   private _commandMetadata: Int32Array = null;
   private _commandCapacity: number = 0;
   private _commandCount: number = 0;
   private _scopeIndex: Int32Array = null;
   private _scopeEntryFrames: Float64Array = null;
   private _scopeCapacity: number = 0;
   private _scopeCount: number = 0;
   private _currentScope: number = 0;
   private _rootBlendMode: number = 0;
   private _sizeDirtyCommands: number[] = null;
   private _scaleTessellationCommands: number[] = null;
   private _textureCommandRecord: GraphicsCommandTextureRecord = null;
   private _textureCommandRecords: Map<number, GraphicsCommandTextureRecord> = null;
   private _pendingEmptyTextureRecords: GraphicsCommandTextureRecord[] = null;
   private _commandTextureIds: Array<number | number[]> = null;
   private _textureBuildVersion: number = 0;
   private _activeCommandHadStateDependency: boolean = false;
   private _hasStateDependency: boolean = false;
   private _ownerTransformDependencyMask: GraphicsOwnerTransformDependency = GraphicsOwnerTransformDependency.None;

   private _refreshCommandMetadata(commandIndex: number, cmd: IGraphicsCmd, owner?: Sprite): boolean {
      let info = this._readCommandInfo(cmd, owner);
      if (info.isStateCommand)
         return false;

      let hasStateDependency = this.hasStateDependency(commandIndex);
      this._removeCommandMetadata(commandIndex);
      this._writeCommandMetadata(commandIndex, info, hasStateDependency);
      this._recomputeOwnerTransformDependencyMask();
      return true;
   }

   getRange(commandIndex: number): GraphicsCommandRangeRecord {
      if (commandIndex < 0 || commandIndex >= this._commandCount)
         return null;

      let count = this._getCommandValue(commandIndex, GraphicsCommandMetadataField.OpCount);
      let start = count > 0 ? this._getCommandValue(commandIndex, GraphicsCommandMetadataField.OpStart) : -1;
      let out = COMMAND_RANGE_SCRATCH;
      out.commandIndex = commandIndex;
      out.start = start;
      out.count = count;
      out.active = count > 0 && start >= 0;
      return out;
   }

   private _getTextureCommandRecord(textureId: number): GraphicsCommandTextureRecord {
      let record = this._textureCommandRecord;
      if (!record || record.texture.id !== textureId)
         record = this._textureCommandRecords && this._textureCommandRecords.get(textureId);
      return record && record.buildVersion === this._textureBuildVersion ? record : null;
   }
   private _hasListeningCommandTexture(texture: Texture): boolean {
      let record = this._textureCommandRecord;
      if (record && record.listening && record.texture === texture)
         return true;
      record = this._textureCommandRecords && this._textureCommandRecords.get(texture.id);
      return !!record && record.listening && record.texture === texture;
   }
   private _compactTextureCommandRecords(): void {
      let records = this._textureCommandRecords;
      if (!records)
         return;
      if (!this._textureCommandRecord && records.size > 0) {
         let first = records.entries().next();
         if (!first.done) {
            this._textureCommandRecord = first.value[1];
            records.delete(first.value[0]);
         }
      }
      if (records.size === 0)
         this._textureCommandRecords = null;
   }
   private _resetCommandTextureIndex(commandCount: number = 0): void {
      if (!this._commandTextureIds)
         return;
      for (let i = 0, n = this._commandTextureIds.length; i < n; i++) {
         let textureIds = this._commandTextureIds[i];
         if (typeof textureIds === "number")
            this._commandTextureIds[i] = null;
         else if (textureIds)
            textureIds.length = 0;
      }
      this._commandTextureIds.length = commandCount;
   }

   hasStateDependency(commandIndex: number): boolean {
      return (this._getCommandValue(commandIndex, GraphicsCommandMetadataField.Flags) & GraphicsCommandTrackerFlag.StateDependency) !== 0;
   }

   getSizeDirtyCommands(): number[] {
      return this._sizeDirtyCommands && this._sizeDirtyCommands.length > 0
         ? this._sizeDirtyCommands
         : GraphicsCommandStreamMode._emptyCommandList;
   }

   getScaleTessellationDirtyCommands(cmds: IGraphicsCmd[], owner: Sprite): number[] {
      if (!this._scaleTessellationCommands || this._scaleTessellationCommands.length === 0 || !cmds)
         return GraphicsCommandStreamMode._emptyCommandList;
      let dirtyCommands = SCALE_TESSELLATION_DIRTY_COMMANDS_SCRATCH;
      dirtyCommands.length = 0;
      let scaleCommands = this._scaleTessellationCommands;
      for (let i = 0, n = scaleCommands ? scaleCommands.length : 0; i < n; i++) {
         let commandIndex = scaleCommands[i];
         let cmd = commandIndex >= 0 && commandIndex < cmds.length ? cmds[commandIndex] : null;
         if (!cmd)
            continue;

         // State-dependent commands must be rebuilt with their preceding
         // save/scale/transform stream so the effective scale stays correct.
         if (this.hasStateDependency(commandIndex)) {
            dirtyCommands.push(commandIndex);
            continue;
         }

         let key = this._readCommandInfo(cmd, owner).scaleTessellationKey || 0;
         if (key !== this._getCommandValue(commandIndex, GraphicsCommandMetadataField.TessellationKey))
            dirtyCommands.push(commandIndex);
      }
      return dirtyCommands;
   }

   getOwnerTransformDependencyMask(): GraphicsOwnerTransformDependency {
      return this._ownerTransformDependencyMask;
   }

   collectOwnerTransformDependencyMask(cmds: IGraphicsCmd[], owner?: Sprite): GraphicsOwnerTransformDependency {
      let mask = GraphicsOwnerTransformDependency.None;
      if (!cmds)
         return mask;
      for (let i = 0, n = cmds.length; i < n; i++)
         mask |= this._getOwnerTransformDependencyMask(this._readCommandInfo(cmds[i], owner));
      return mask;
   }

   private _writeRange(commandIndex: number, start: number, end: number): void {
      let count = end - start;
      this._ensureCommandCapacity(commandIndex + 1);
      if (commandIndex >= this._commandCount)
         this._commandCount = commandIndex + 1;
      this._setCommandValue(commandIndex, GraphicsCommandMetadataField.OpStart, count > 0 ? start : -1);
      this._setCommandValue(commandIndex, GraphicsCommandMetadataField.OpCount, count);
   }

   isStateCommand(commandIndex: number): boolean {
      return (this._getCommandValue(commandIndex, GraphicsCommandMetadataField.Flags) & GraphicsCommandTrackerFlag.StateCommand) !== 0;
   }

   isStateCommandType(cmd: IGraphicsCmd, owner?: Sprite): boolean {
      return !!cmd && this._readCommandInfo(cmd, owner).isStateCommand;
   }

   prepareLocalReplay(commandIndex: number, context: GraphicsCompileContext, owner: Sprite, textRender: GraphicsCompileContext["_textRender"]): number {
      if (!context || commandIndex < 0 || commandIndex >= this._commandCount)
         return -1;
      if (!this.hasStateDependency(commandIndex)) {
         context.reset(owner, this._rootBlendMode, textRender);
         return commandIndex;
      }
      let scope = this._getCommandValue(commandIndex, GraphicsCommandMetadataField.StateScope);
      if (this._scopeIndex && scope >= 0 && scope < this._scopeCount) {
         let frameOffset = scope * GRAPHICS_STATE_FRAME_STRIDE;
         context.loadStateFrom(this._scopeEntryFrames, frameOffset, owner, textRender);
         return this._getScopeValue(scope, GraphicsStateScopeField.CommandStart);
      }
      context.reset(owner, this._rootBlendMode, textRender);
      return 0;
   }

   getStateScopeCommandEnd(commandIndex: number): number {
      if (commandIndex < 0 || commandIndex >= this._commandCount)
         return -1;
      if (!this._scopeIndex)
         return this._commandCount;
      let scope = this._getCommandValue(commandIndex, GraphicsCommandMetadataField.StateScope);
      return scope >= 0 && scope < this._scopeCount
         ? this._getScopeValue(scope, GraphicsStateScopeField.CommandEnd)
         : this._commandCount;
   }

   refreshChildScopeEntry(commandIndex: number, context: GraphicsCompileContext): void {
      if (!context || !this._scopeIndex || commandIndex < 0 || commandIndex + 1 >= this._commandCount)
         return;
      let parentScope = this._getCommandValue(commandIndex, GraphicsCommandMetadataField.StateScope);
      let childScope = this._getCommandValue(commandIndex + 1, GraphicsCommandMetadataField.StateScope);
      if (childScope === parentScope || childScope <= 0 || childScope >= this._scopeCount)
         return;
      if (this._getScopeValue(childScope, GraphicsStateScopeField.ParentScope) !== parentScope
         || this._getScopeValue(childScope, GraphicsStateScopeField.CommandStart) !== commandIndex + 1)
         return;
      context.copyStateTo(this._scopeEntryFrames, childScope * GRAPHICS_STATE_FRAME_STRIDE);
   }
   private _writeCommandMetadata(commandIndex: number, info: GraphicsCommandInfo, hasStateDependency: boolean): void {
      let dependency = info.dependency || GraphicsCommandDependency.None;
      let layoutRefresh = info.layoutRefresh || GraphicsCommandLayoutRefresh.None;
      let flags = hasStateDependency ? GraphicsCommandTrackerFlag.StateDependency : 0;
      // Every command-index field is overwritten during a full build. Reset the
      // only conditional field here instead of clearing the complete packed table.
      this._setCommandValue(commandIndex, GraphicsCommandMetadataField.TessellationKey, 0);
      if (info.isStateCommand)
         flags |= GraphicsCommandTrackerFlag.StateCommand;
      this._ownerTransformDependencyMask |= this._getOwnerTransformDependencyMask(info);
      if ((dependency & GraphicsCommandDependency.SizePayload) !== 0) {
         flags |= GraphicsCommandTrackerFlag.SizePayload;
         switch (layoutRefresh) {
            case GraphicsCommandLayoutRefresh.MarkDirty:
            case GraphicsCommandLayoutRefresh.RerunCommand:
               flags |= GraphicsCommandTrackerFlag.LayoutLocal;
               break;
            case GraphicsCommandLayoutRefresh.Structural:
               flags |= GraphicsCommandTrackerFlag.LayoutStructural;
               break;
         }
          if (!this._sizeDirtyCommands)
             this._sizeDirtyCommands = [];
          this._sizeDirtyCommands.push(commandIndex);
      }
      if ((dependency & GraphicsCommandDependency.ScaleTessellation) !== 0) {
         if (!this._scaleTessellationCommands) {
            this._scaleTessellationCommands = [];
         }
         flags |= GraphicsCommandTrackerFlag.ScaleTessellation;
         this._setCommandValue(commandIndex, GraphicsCommandMetadataField.TessellationKey, info.scaleTessellationKey || 0);
         this._scaleTessellationCommands.push(commandIndex);
      }
      this._setCommandValue(commandIndex, GraphicsCommandMetadataField.Flags, flags);
      if (info.isStateCommand)
         this._hasStateDependency = true;
   }
   private _removeCommandMetadata(commandIndex: number): void {
      let flags = this._getCommandValue(commandIndex, GraphicsCommandMetadataField.Flags);
      if ((flags & GraphicsCommandTrackerFlag.SizePayload) !== 0)
         this._removeCommandIndex(this._sizeDirtyCommands, commandIndex);
      if ((flags & GraphicsCommandTrackerFlag.ScaleTessellation) !== 0) {
         this._removeCommandIndex(this._scaleTessellationCommands, commandIndex);
      }
      this._setCommandValue(commandIndex, GraphicsCommandMetadataField.TessellationKey, 0);
      this._setCommandValue(commandIndex, GraphicsCommandMetadataField.Flags, 0);
   }
   private _removeCommandIndex(list: number[], commandIndex: number): void {
      if (!list)
         return;
      let index = list.indexOf(commandIndex);
      if (index >= 0) {
         let last = list.pop();
         if (index < list.length)
            list[index] = last;
      }
   }
   private _recomputeOwnerTransformDependencyMask(): void {
      let mask = GraphicsOwnerTransformDependency.None;
      if (this._sizeDirtyCommands && this._sizeDirtyCommands.length > 0)
         mask |= GraphicsOwnerTransformDependency.SizeLayout;
      if (this._scaleTessellationCommands && this._scaleTessellationCommands.length > 0)
         mask |= GraphicsOwnerTransformDependency.ScaleTessellation;
      this._ownerTransformDependencyMask = mask;
   }
   private _removeTextureRefsForCommand(commandIndex: number): void {
      let textureIds = this._commandTextureIds && this._commandTextureIds[commandIndex];
      if (!textureIds)
         return;
      if (typeof textureIds === "number") {
         this._commandTextureIds[commandIndex] = null;
         this._removeTextureCommandIndex(textureIds, commandIndex);
      } else {
         while (textureIds.length > 0)
            this._removeTextureCommandIndex(textureIds.pop(), commandIndex);
      }
   }
   private _addTextureCommandIndex(texture: Texture, commandIndex: number): GraphicsCommandTextureRecord {
      let firstRecord = this._textureCommandRecord;
      let record = firstRecord;
      let records = this._textureCommandRecords;
      if (!record || record.texture.id !== texture.id)
         record = records && records.get(texture.id);
      if (!record && firstRecord
         && (firstRecord.buildVersion !== this._textureBuildVersion || firstRecord.commandIndices == null
            || (typeof firstRecord.commandIndices !== "number" && firstRecord.commandIndices.length === 0))) {
         this._detachTextureDependencyRecord(firstRecord);
         firstRecord.texture = texture;
         firstRecord.listening = false;
         if (typeof firstRecord.commandIndices === "number")
            firstRecord.commandIndices = null;
         else if (firstRecord.commandIndices)
            firstRecord.commandIndices.length = 0;
         firstRecord.buildVersion = this._textureBuildVersion;
         record = firstRecord;
      }
      if (!record) {
         record = {
            texture: texture,
            listening: false,
            commandIndices: null,
            buildVersion: this._textureBuildVersion,
         };
         if (!this._textureCommandRecord)
            this._textureCommandRecord = record;
         else {
            records = records || (this._textureCommandRecords = new Map());
            records.set(texture.id, record);
         }
      }
      else if (record.buildVersion !== this._textureBuildVersion) {
         record.texture = texture;
         if (typeof record.commandIndices === "number")
            record.commandIndices = null;
         else if (record.commandIndices)
            record.commandIndices.length = 0;
         record.buildVersion = this._textureBuildVersion;
      }
      let commandIndices = record.commandIndices;
      if (commandIndices == null)
         record.commandIndices = commandIndex;
      else if (typeof commandIndices === "number") {
         if (commandIndices !== commandIndex)
            record.commandIndices = [commandIndices, commandIndex];
      } else if (commandIndices.length === 0 || commandIndices[commandIndices.length - 1] !== commandIndex)
         commandIndices.push(commandIndex);
      let commandTextureIds = this._commandTextureIds || (this._commandTextureIds = []);
      let textureIds = commandTextureIds[commandIndex];
      if (textureIds == null)
         commandTextureIds[commandIndex] = texture.id;
      else if (typeof textureIds === "number") {
         if (textureIds !== texture.id)
            commandTextureIds[commandIndex] = [textureIds, texture.id];
      } else if (textureIds.length === 0 || textureIds[textureIds.length - 1] !== texture.id) {
         textureIds.push(texture.id);
      }
      return record;
   }
   private _removeTextureCommandIndex(textureId: number, commandIndex: number): void {
      let record = this._textureCommandRecord;
      if (!record || record.texture.id !== textureId)
         record = this._textureCommandRecords && this._textureCommandRecords.get(textureId);
      if (!record || record.buildVersion !== this._textureBuildVersion)
         return;
      let commandIndices = record.commandIndices;
      if (typeof commandIndices === "number") {
         if (commandIndices !== commandIndex)
            return;
         record.commandIndices = null;
      } else if (commandIndices && commandIndices.length > 0) {
         let index = commandIndices.indexOf(commandIndex);
         if (index < 0)
            return;
         let lastCommandIndex = commandIndices.pop();
         if (index < commandIndices.length)
            commandIndices[index] = lastCommandIndex;
      } else
         return;
      let textureIds = this._commandTextureIds && this._commandTextureIds[commandIndex];
      if (typeof textureIds === "number") {
         if (textureIds === textureId)
            this._commandTextureIds[commandIndex] = null;
      } else if (textureIds) {
         let textureIndex = textureIds.indexOf(textureId);
         if (textureIndex >= 0) {
            let lastTextureId = textureIds.pop();
            if (textureIndex < textureIds.length)
               textureIds[textureIndex] = lastTextureId;
         }
      }
      commandIndices = record.commandIndices;
      if (typeof commandIndices === "number" || (commandIndices && commandIndices.length > 0))
         return;
      let pending = this._pendingEmptyTextureRecords || (this._pendingEmptyTextureRecords = []);
      pending.push(record);
   }
   private _getOwnerTransformDependencyMask(info: GraphicsCommandInfo): GraphicsOwnerTransformDependency {
      let mask = GraphicsOwnerTransformDependency.None;
      if (!info)
         return mask;
      let dependency = info.dependency || GraphicsCommandDependency.None;
      if ((dependency & GraphicsCommandDependency.SizePayload) !== 0)
         mask |= GraphicsOwnerTransformDependency.SizeLayout;
      if ((dependency & GraphicsCommandDependency.ScaleTessellation) !== 0)
         mask |= GraphicsOwnerTransformDependency.ScaleTessellation;
      return mask;
   }
   private _analyzeLayoutCommand(commandIndex: number, cmd: IGraphicsCmd): GraphicsRefreshAction {
      if (!cmd)
         return GraphicsRefreshAction.NoEffect;

      let flags = this._getCommandValue(commandIndex, GraphicsCommandMetadataField.Flags);
      if ((flags & (GraphicsCommandTrackerFlag.SizePayload | GraphicsCommandTrackerFlag.ScaleTessellation)) === 0)
         return GraphicsRefreshAction.NoEffect;

      if ((flags & GraphicsCommandTrackerFlag.LayoutLocal) !== 0) {
         // A command that emitted no Op at the previous size may start emitting
         // one at the new size (for example a percent rect growing from zero).
         // That is an actual range/schema change and must take the rebuild path.
         if (this._getCommandValue(commandIndex, GraphicsCommandMetadataField.OpCount) <= 0)
            return GraphicsRefreshAction.StructuralRefresh;
         return GraphicsRefreshAction.LocalRefresh;
      }
      if ((flags & GraphicsCommandTrackerFlag.LayoutStructural) !== 0)
         return GraphicsRefreshAction.StructuralRefresh;
      return GraphicsRefreshAction.NoEffect;
   }
   private _readCommandInfo(cmd: IGraphicsCmd, owner?: Sprite): GraphicsCommandInfo {
      let out = COMMAND_INFO_SCRATCH;
      out.dependency = GraphicsCommandDependency.None;
      out.layoutRefresh = GraphicsCommandLayoutRefresh.None;
      out.scaleTessellationKey = 0;
      out.isStateCommand = false;

      if (!cmd)
         return out;
      if (cmd.getGraphicsCommandInfo)
         return cmd.getGraphicsCommandInfo(out, owner) || out;
      if (cmd.needsLayoutRepaint && cmd.needsLayoutRepaint() > 0) {
         out.dependency = GraphicsCommandDependency.SizePayload | GraphicsCommandDependency.ScaleTessellation;
         out.layoutRefresh = GraphicsCommandLayoutRefresh.Structural;
      }
      return out;
   }
   private _openScope(commandStart: number, context?: GraphicsCompileContext): void {
      if (!this._scopeIndex) {
         this._ensureScopeCapacity(1);
         this._scopeCount = 1;
         this._writeRootScope(commandStart);
      }

      let scope = this._scopeCount++;
      this._ensureScopeCapacity(this._scopeCount);
      this._setScopeValue(scope, GraphicsStateScopeField.ParentScope, this._currentScope);
      this._setScopeValue(scope, GraphicsStateScopeField.CommandStart, commandStart);
      this._setScopeValue(scope, GraphicsStateScopeField.CommandEnd, commandStart);
      let frameOffset = scope * GRAPHICS_STATE_FRAME_STRIDE;
      if (context)
         context.copyStateTo(this._scopeEntryFrames, frameOffset);
      this._currentScope = scope;
   }
   private _closeScope(commandEnd: number): void {
      if (this._currentScope <= 0 || !this._scopeIndex)
         return;
      this._setScopeValue(this._currentScope, GraphicsStateScopeField.CommandEnd, commandEnd);
      this._currentScope = this._getScopeValue(this._currentScope, GraphicsStateScopeField.ParentScope);
   }
   private _writeRootScope(commandEnd: number): void {
      this._ensureScopeCapacity(1);
      this._setScopeValue(0, GraphicsStateScopeField.ParentScope, -1);
      this._setScopeValue(0, GraphicsStateScopeField.CommandStart, 0);
      this._setScopeValue(0, GraphicsStateScopeField.CommandEnd, commandEnd);
      let frames = this._scopeEntryFrames;
      frames[0] = 1;
      frames[1] = 0;
      frames[2] = 0;
      frames[3] = 1;
      frames[4] = 0;
      frames[5] = 0;
      frames[6] = 1;
      frames[7] = this._rootBlendMode;
   }
   private _ensureScopeCapacity(scopeCount: number): void {
      if (scopeCount <= this._scopeCapacity)
         return;
      let capacity = Math.max(4, this._scopeCapacity || 0);
      while (capacity < scopeCount)
         capacity <<= 1;
      let scopeIndex = new Int32Array(capacity * GraphicsStateScopeField.Stride);
      let entryFrames = new Float64Array(capacity * GRAPHICS_STATE_FRAME_STRIDE);
      if (this._scopeIndex) {
         scopeIndex.set(this._scopeIndex);
         entryFrames.set(this._scopeEntryFrames);
      }
      this._scopeIndex = scopeIndex;
      this._scopeEntryFrames = entryFrames;
      this._scopeCapacity = capacity;
   }
   private _getScopeValue(scope: number, field: GraphicsStateScopeField): number {
      return this._scopeIndex[scope * GraphicsStateScopeField.Stride + field];
   }
   private _setScopeValue(scope: number, field: GraphicsStateScopeField, value: number): void {
      this._scopeIndex[scope * GraphicsStateScopeField.Stride + field] = value;
   }
   private _ensureCommandCapacity(commandCount: number): void {
      if (commandCount <= this._commandCapacity)
         return;

      let capacity = Math.max(8, this._commandCapacity || 0);
      while (capacity < commandCount)
         capacity <<= 1;
      let commandMetadata = new Int32Array(capacity * GraphicsCommandMetadataField.Stride);
      if (this._commandMetadata)
         commandMetadata.set(this._commandMetadata);
      this._commandMetadata = commandMetadata;
      this._commandCapacity = capacity;
   }
   private _getCommandValue(commandIndex: number, field: GraphicsCommandMetadataField): number {
      if (commandIndex < 0 || commandIndex >= this._commandCount || !this._commandMetadata)
         return 0;
      return this._commandMetadata[commandIndex * GraphicsCommandMetadataField.Stride + field];
   }
   private _setCommandValue(commandIndex: number, field: GraphicsCommandMetadataField, value: number): void {
      this._commandMetadata[commandIndex * GraphicsCommandMetadataField.Stride + field] = value;
   }
   private _textureQuadPatchTarget: IGraphicsTextureQuadOp2D = null;
   private _textureQuadPatchWrote: boolean = false;
   private _activeMultiQuadOp: IGraphicsMultiQuadOp2D = null;

   private _beginCompileContext(): GraphicsCompileContext {
      let context = Render2DProcessor.compileContext;
      context.begin(this);
      return context;
   }

   finalizeActiveCommandTextures(): void {
      if (this._activeMultiQuadOp)
         this._activeMultiQuadOp.setTextures(ACTIVE_MULTI_QUAD_TEXTURES_SCRATCH, ACTIVE_MULTI_QUAD_TEXTURES_SCRATCH.length);
      this._activeMultiQuadOp = null;
      ACTIVE_MULTI_QUAD_TEXTURES_SCRATCH.length = 0;
   }
   _beginActiveCommandTextures(): void {
      this._activeMultiQuadOp = null;
      ACTIVE_MULTI_QUAD_TEXTURES_SCRATCH.length = 0;
   }

   patchTextureQuadOp(opIndex: number, op: IGraphicsTextureQuadOp2D, cmd: DrawTextureCmd, context: GraphicsCompileContext): GraphicsOp2DPatchResult {
      if (!op || !cmd || cmd.matrix)
         return this._setPatchResult(false, -1, GraphicsOp2DDirtyFlag.None);
      this._textureQuadPatchTarget = op;
      this._textureQuadPatchWrote = false;
      context.compileCommand(cmd);
      let success = this._textureQuadPatchWrote;
      this._textureQuadPatchTarget = null;
      return success
         ? this._setPatchResult(true, opIndex, op.dirtyFlags)
         : this._setPatchResult(false, -1, GraphicsOp2DDirtyFlag.None);
   }

   appendSpriteTextureOp(context: GraphicsCompileContext): void {
      // Sprite.texture is a synthetic tail command in CommandStream. Give it a
      // stable identity so retained Op/RenderUnit reconciliation can reuse it
      // across clear/redraw and command-count changes.
      this.beginCommand(SPRITE_TEXTURE_COMMAND_INDEX, SPRITE_TEXTURE_COMMAND_ID);
      this._beginActiveCommandTextures();
      let owner = this._renderer.owner;
      let tex = owner ? owner._texture : null;
      if (!this._prepareTexture(tex, true)) {
         this.finalizeActiveCommandTextures();
         this.endCommand();
         return;
      }
      let op = this.getTextureQuadTargetOp() as IGraphicsTextureQuadOp2D;
      context._writeSpriteTextureOp(op, owner, tex);
      this.finalizeActiveCommandTextures();
      this.endCommand();
   }

   patchSpriteTextureOp(context: GraphicsCompileContext): GraphicsOp2DPatchResult {
      let opIndex = this.ops.length - 1;
      let op = opIndex >= 0 ? this.ops[opIndex] : null;
      if (!op || op.kind !== GraphicsOp2DKind.TextureQuad
         || op.commandIndex !== SPRITE_TEXTURE_COMMAND_INDEX
         || !op.canUpdate(SPRITE_TEXTURE_COMMAND_ID))
         return this._setPatchResult(false, -1, GraphicsOp2DDirtyFlag.None);

      let owner = this._renderer.owner;
      let tex = owner ? owner._texture : null;
      this.beginCommand(SPRITE_TEXTURE_COMMAND_INDEX, SPRITE_TEXTURE_COMMAND_ID);
      this._beginActiveCommandTextures();
      let success = this._prepareTexture(tex, true)
         && context._writeSpriteTextureOp(op as IGraphicsTextureQuadOp2D, owner, tex);
      this.finalizeActiveCommandTextures();
      this.endCommand();
      return success
         ? this._setPatchResult(true, opIndex, op.dirtyFlags)
         : this._setPatchResult(false, -1, GraphicsOp2DDirtyFlag.None);
   }
   private _setPatchResult(success: boolean, opIndex: number, dirtyFlags: GraphicsOp2DDirtyFlag): GraphicsOp2DPatchResult {
      let result = PATCH_RESULT;
      result.success = success;
      result.opIndex = opIndex;
      result.dirtyFlags = dirtyFlags;
      return result;
   }
   _prepareTexture(texture: Texture, spriteTexture: boolean = false): boolean {
      if (!texture || texture.destroyed)
         return false;
      if (spriteTexture)
         this._syncSpriteTextureDependency(texture);
      else {
         let record = this._activeCommandIndex >= 0
            ? this._addTextureCommandIndex(texture, this._activeCommandIndex)
            : null;
         if (record)
            this._attachTextureDependencyRecord(record);
      }
      if (texture.valid)
         return true;
      this._renderer.requestTextureRecovery(texture);
      return false;
   }
   _recordActiveMultiQuadTexture(op: IGraphicsMultiQuadOp2D, texture: GraphicsOp2DTextureHost): void {
      if (this._activeMultiQuadOp && this._activeMultiQuadOp !== op)
         this.finalizeActiveCommandTextures();
      if (!this._activeMultiQuadOp) {
         this._activeMultiQuadOp = op;
         ACTIVE_MULTI_QUAD_TEXTURES_SCRATCH.length = 0;
      }
      ACTIVE_MULTI_QUAD_TEXTURES_SCRATCH[op.recordCount] = texture || null;
   }
   _markTextureQuadWritten(): void {
   	if (this._textureQuadPatchTarget)
   		this._textureQuadPatchWrote = true;
   }
   patchTextureQuadCommand(commandIndex: number, oldCmd: DrawTextureCmd, newCmd: DrawTextureCmd): GraphicsCommandPatchResult {
   	let host = this._renderer;
   	if (host._graphicsStateDirty
   		|| host._renderedGraphicsModified === Number.MIN_SAFE_INTEGER
   		|| !oldCmd || !newCmd || oldCmd.cmdID !== newCmd.cmdID
		|| this.hasStateDependency(commandIndex))
   		return GraphicsCommandPatchResult.Failed;

	let range = this.getRange(commandIndex);
   	let existing = range && range.count === 1 ? this.ops[range.start] : null;
   	if (!range || !range.active || range.count !== 1 || !existing || existing.kind !== GraphicsOp2DKind.TextureQuad)
   		return GraphicsCommandPatchResult.Failed;
   	let opIndex = range.start;

   	let compileContext = this._beginCompileContext();
   	let sharedRunner = Render2DProcessor.runner;
   	compileContext.reset(host.owner, host.owner._struct.blendMode, sharedRunner ? sharedRunner._textRender : null);
   	let patchResult: GraphicsOp2DPatchResult;
   	try {
   		patchResult = this.patchTextureQuadOp(opIndex, existing as IGraphicsTextureQuadOp2D, newCmd, compileContext);
   	} finally {
   		compileContext.end();
   	}
   	if (!patchResult.success)
   		return GraphicsCommandPatchResult.Failed;
   	let oldTexture = oldCmd.texture;
   	let newTexture = newCmd.texture;
    	let textureRecord: GraphicsCommandTextureRecord = null;
    	if (oldTexture !== newTexture) {
    		if (oldTexture)
			this._removeTextureCommandIndex(oldTexture.id, commandIndex);
		let textureIds = this._commandTextureIds && this._commandTextureIds[commandIndex];
    		let tracked = newTexture && (typeof textureIds === "number"
    			? textureIds === newTexture.id
    			: !!textureIds && textureIds.indexOf(newTexture.id) >= 0);
    		textureRecord = newTexture && tracked
    			? this._getTextureCommandRecord(newTexture.id)
			: (newTexture ? this._addTextureCommandIndex(newTexture, commandIndex) : null);
   	}
   	if (textureRecord)
   		this._attachTextureDependencyRecord(textureRecord);
   	this._publishCommandChanges(patchResult.opIndex, patchResult.opIndex + 1, patchResult.dirtyFlags);
   	let changed = patchResult.dirtyFlags !== GraphicsOp2DDirtyFlag.None || oldCmd !== newCmd;
   	if (changed)
   		host.owner._struct.setRepaint();
   	return changed ? GraphicsCommandPatchResult.Changed : GraphicsCommandPatchResult.NoChange;
   }

   patchSpriteTextureRetained(): boolean {
   	let host = this._renderer;
   	if (host._graphicsStateDirty || host._renderedGraphicsModified === Number.MIN_SAFE_INTEGER)
   		return false;
   	let context = this._beginCompileContext();
   	let runner = Render2DProcessor.runner;
   	context.reset(host.owner, host.owner._struct.blendMode, runner ? runner._textRender : null);
   	let patchResult: GraphicsOp2DPatchResult;
   	try {
   		patchResult = this.patchSpriteTextureOp(context);
   	} finally {
   		context.end();
   	}
   	if (!patchResult.success)
   		return false;
   	this._publishCommandChanges(patchResult.opIndex, patchResult.opIndex + 1, patchResult.dirtyFlags);
   	host.owner._struct.setRepaint();
   	return true;
   }

    private _publishCommandChanges(dirtyStart: number, dirtyEnd: number, opDirtyFlags: GraphicsOp2DDirtyFlag): void {
    	let pending = this._pendingEmptyTextureRecords;
    	if (pending && pending.length > 0) {
    		for (let i = 0, n = pending.length; i < n; i++) {
    			let record = pending[i];
    			let retained = this._textureCommandRecord;
    			if (!retained || retained.texture.id !== record.texture.id)
    				retained = this._textureCommandRecords && this._textureCommandRecords.get(record.texture.id);
    			let commandIndices = record.commandIndices;
    			if (typeof commandIndices === "number" || (commandIndices && commandIndices.length > 0) || retained !== record)
    				continue;
    			this._detachTextureDependencyRecord(record);
    			if (this._textureCommandRecord === record)
    				this._textureCommandRecord = null;
    			else
    				this._textureCommandRecords.delete(record.texture.id);
    		}
    		pending.length = 0;
    		this._compactTextureCommandRecords();
    	}
   	let renderer = this._renderer;
   	renderer._syncGraphicsOwnerTransformInterest(true);
   	let handleDirtyFlags = renderer._mapGraphicsOpDirtyFlags(opDirtyFlags);
   	if (dirtyStart !== Number.MAX_SAFE_INTEGER && handleDirtyFlags !== GraphicsHandleDirtyFlag.None)
   		renderer._syncGraphicsOps(handleDirtyFlags, dirtyStart, dirtyEnd - dirtyStart,
   			(opDirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0);
   }

   refreshPendingCommandReplacements(runner: GraphicsRunner): boolean {
   	let spliceCount = this._pendingCommandSpliceAddedCount;
	// Typical FontClip/damage-number redraw: clear N DrawImage commands and
	// append N commands of the same shape. Rewrite the retained Ops in place
	// and publish one payload range, without advancing topology.
   	if (this._pendingCommandSpliceIndex >= 0
   		&& spliceCount > 0
   		&& spliceCount === this._pendingCommandSpliceRemovedCount
   		&& spliceCount <= LOCAL_REPLACEMENT_SPLICE_LIMIT
   		&& !this._hasStateDependency) {
   		let start = this._pendingCommandSpliceIndex;
   		this.clearPendingCommandSplice();
   		for (let i = 0; i < spliceCount; i++)
   			this.queueCommandReplacement(start + i);
   	}
   	let pending = this._pendingCommandReplacements;
   	if (!this._renderer.graphics || !pending || pending.length === 0)
   		return true;
   	if (!this._refreshCommandOps(pending, runner._textRender, true))
   		return false;
   	this.clearPendingCommandReplacements();
   	return true;
   }

   refreshCommandRanges(commandIndices: number[], reason: GraphicsInfoDirtyFlag): GraphicsRefreshAction {
	if (!commandIndices || commandIndices.length === 0)
   		return GraphicsRefreshAction.NoEffect;
   	let host = this._renderer;
   	if (host._graphicsStateDirty || !host.graphics || host._renderedGraphicsModified === Number.MIN_SAFE_INTEGER) {
   		host._scheduleGraphicsFullRebuild();
   		return GraphicsRefreshAction.StructuralRefresh;
   	}

   	let cmds = host.graphics.cmds;
   	let checkLayout = (reason & GraphicsInfoDirtyFlag.Layout) !== 0;
	for (let i = 0, n = commandIndices.length; i < n; i++) {
		let commandIndex = commandIndices[i];
		let cmd = commandIndex >= 0 && commandIndex < cmds.length ? cmds[commandIndex] : null;
		if (!cmd || (checkLayout && this._analyzeLayoutCommand(commandIndex, cmd) !== GraphicsRefreshAction.LocalRefresh)) {
   			host._scheduleGraphicsFullRebuild();
   			return GraphicsRefreshAction.StructuralRefresh;
   		}
   	}
   	let sharedRunner = Render2DProcessor.runner;
   	if (!sharedRunner) {
   		host._scheduleGraphicsFullRebuild();
   		return GraphicsRefreshAction.StructuralRefresh;
   	}
	if (!this._refreshCommandOps(commandIndices, sharedRunner._textRender)) {
   		host._scheduleGraphicsFullRebuild();
   		return GraphicsRefreshAction.StructuralRefresh;
   	}

   	host.owner._struct.setRepaint();
   	return GraphicsRefreshAction.LocalRefresh;
   }
   private _refreshCommandOps(commandIndices: number[], textRender: GraphicsRunner["_textRender"], refreshStateCommands: boolean = false): boolean {
   	let host = this._renderer;
   	let graphics = host.graphics;
   	let compileContext = this._beginCompileContext();
   	let oldRenderedModified = host._renderedGraphicsModified;
   	host._renderedGraphicsModified = graphics._modified;
   	try {
   	let dirtyStart = Number.MAX_SAFE_INTEGER;
   	let dirtyEnd = -1;
   	let opDirtyFlags = GraphicsOp2DDirtyFlag.None;
   	if (refreshStateCommands) {
		for (let i = 0, n = commandIndices.length; i < n; i++) {
			let commandIndex = commandIndices[i];
			if (commandIndex < 0 || !this.isStateCommand(commandIndex))
   				continue;
			if (!this._refreshStateCommand(commandIndex, textRender, compileContext)) {
   				host._renderedGraphicsModified = oldRenderedModified;
   				return false;
   			}
   			dirtyStart = Math.min(dirtyStart, REWRITE_DIRTY_START_SCRATCH);
   			dirtyEnd = Math.max(dirtyEnd, REWRITE_DIRTY_END_SCRATCH);
   			opDirtyFlags |= REWRITE_DIRTY_FLAGS_SCRATCH;
			this._setCommandValue(commandIndex, GraphicsCommandMetadataField.Flags,
				this._getCommandValue(commandIndex, GraphicsCommandMetadataField.Flags) & ~GraphicsCommandTrackerFlag.PendingReplacement);
			commandIndices[i] = -1;
   		}
   	}
	for (let i = commandIndices.length - 1; i >= 0; i--) {
		let commandIndex = commandIndices[i];
		if (commandIndex < 0 || this.isStateCommand(commandIndex))
   			continue;
		let cmd = commandIndex < graphics.cmds.length ? graphics.cmds[commandIndex] : null;
		let replayStart = cmd ? this.prepareLocalReplay(commandIndex, compileContext, host.owner, textRender) : -1;
   		if (replayStart < 0) {
   			host._renderedGraphicsModified = oldRenderedModified;
   			return false;
   		}
   		this.finalizeActiveCommandTextures();
		for (let replayIndex = replayStart; replayIndex < commandIndex; replayIndex++) {
   			if (!this.isStateCommand(replayIndex))
   				continue;
   			let stateCmd = graphics.cmds[replayIndex];
   			if (!stateCmd) {
   				host._renderedGraphicsModified = oldRenderedModified;
   				return false;
   			}
   			compileContext.compileCommand(stateCmd, true);
   		}
		if (!this._rewriteCommandOp(commandIndex, compileContext)) {
   			host._renderedGraphicsModified = oldRenderedModified;
   			return false;
   		}
   		dirtyStart = Math.min(dirtyStart, REWRITE_DIRTY_START_SCRATCH);
   		dirtyEnd = Math.max(dirtyEnd, REWRITE_DIRTY_END_SCRATCH);
   		opDirtyFlags |= REWRITE_DIRTY_FLAGS_SCRATCH;
   	}
   	this._publishCommandChanges(dirtyStart, dirtyEnd, opDirtyFlags);
   	return true;
   	} finally {
   		compileContext.end();
   	}
   }
   private _refreshStateCommand(commandIndex: number, textRender: GraphicsRunner["_textRender"], compileContext: GraphicsCompileContext = Render2DProcessor.compileContext): boolean {
   	let host = this._renderer;
   	let graphics = host.graphics;
	if (!this.isStateCommand(commandIndex) || !graphics)
   		return false;
	let replayStart = this.prepareLocalReplay(commandIndex, compileContext, host.owner, textRender);
	let replayEnd = this.getStateScopeCommandEnd(commandIndex);
	if (replayStart < 0 || replayEnd <= commandIndex || replayEnd > graphics.cmds.length)
   		return false;

   	let dirtyStart = Number.MAX_SAFE_INTEGER;
   	let dirtyEnd = -1;
   	let opDirtyFlags = GraphicsOp2DDirtyFlag.None;
   	let reachedTarget = false;
   	this.finalizeActiveCommandTextures();
   	for (let i = replayStart; i < replayEnd; i++) {
   		let cmd = graphics.cmds[i];
   		if (!cmd)
   			return false;
   		if (this.isStateCommand(i)) {
   			compileContext.compileCommand(cmd, true);
   			this.refreshChildScopeEntry(i, compileContext);
			reachedTarget = reachedTarget || i === commandIndex;
   			continue;
   		}
   		if (!reachedTarget)
   			continue;
   		let range = this.getRange(i);
   		if (!range || !range.active || range.count <= 0)
   			continue;
   		if (!this._rewriteCommandOp(i, compileContext)) {
   			return false;
   		}
   		dirtyStart = Math.min(dirtyStart, REWRITE_DIRTY_START_SCRATCH);
   		dirtyEnd = Math.max(dirtyEnd, REWRITE_DIRTY_END_SCRATCH);
   		opDirtyFlags |= REWRITE_DIRTY_FLAGS_SCRATCH;
   	}
   	if (!reachedTarget)
   		return false;
   	REWRITE_DIRTY_START_SCRATCH = dirtyStart;
   	REWRITE_DIRTY_END_SCRATCH = dirtyEnd;
   	REWRITE_DIRTY_FLAGS_SCRATCH = opDirtyFlags;
   	return true;
   }
   private _rewriteCommandOp(commandIndex: number, compileContext: GraphicsCompileContext): boolean {
   	REWRITE_DIRTY_START_SCRATCH = Number.MAX_SAFE_INTEGER;
   	REWRITE_DIRTY_END_SCRATCH = -1;
   	REWRITE_DIRTY_FLAGS_SCRATCH = GraphicsOp2DDirtyFlag.None;
   	let host = this._renderer;
   	let graphics = host.graphics;
	let cmd = graphics && commandIndex >= 0 && commandIndex < graphics.cmds.length ? graphics.cmds[commandIndex] : null;
   	if (!cmd)
   		return false;
	let range = this.getRange(commandIndex);
   	if (!range || !range.active || range.count <= 0)
   		return false;
   	let opStart = range.start;
   	let opCount = range.count;
   	if (opStart < 0 || opStart + opCount > this.ops.length)
   		return false;
	this.beginCommand(commandIndex, cmd.cmdID);
   	this._rewriteStart = opStart;
   	this._rewriteEnd = opStart + opCount;
   	this._rewriteCursor = opStart;
   	this._rewriteFailed = false;
   	this._ensureRewriteSignatureCapacity(opCount);
   	for (let i = 0; i < opCount; i++)
   		this.ops[opStart + i].writeStructureSignature(REWRITE_SIGNATURES_SCRATCH, i * 4);

	this._removeTextureRefsForCommand(commandIndex);
	this._activeCommandIndex = commandIndex;
   	compileContext.compileCommand(cmd);
	this._activeCommandIndex = -1;

   	let success = !this._rewriteFailed && this._rewriteCursor === this._rewriteEnd;
   	for (let i = opStart; success && i < this._rewriteEnd; i++)
   		success = this.ops[i].matchesStructureSignature(REWRITE_SIGNATURES_SCRATCH, (i - opStart) * 4);
   	let dirtyFlags = GraphicsOp2DDirtyFlag.None;
   	if (success)
   		for (let i = opStart; i < this._rewriteEnd; i++) {
   			this.ops[i].clearStructureDirty();
   			dirtyFlags |= this.ops[i].dirtyFlags;
   		}
   	this._rewriteStart = -1;
   	this._rewriteEnd = -1;
   	this._rewriteCursor = -1;
   	this._rewriteFailed = false;
   	for (let i = 0, n = REWRITE_DISCARD_OPS_SCRATCH.length; i < n; i++)
   		REWRITE_DISCARD_OPS_SCRATCH[i].destroy();
   	REWRITE_DISCARD_OPS_SCRATCH.length = 0;
   	this.endCommand();
   	if (!success)
   		return false;
	if (!this._refreshCommandMetadata(commandIndex, cmd, host.owner)) {
   		return false;
   	}
   	REWRITE_DIRTY_START_SCRATCH = opStart;
   	REWRITE_DIRTY_END_SCRATCH = opStart + opCount;
   	REWRITE_DIRTY_FLAGS_SCRATCH = dirtyFlags;
   	return true;
   }
   private _spriteTexture: Texture = null;
   private _pendingCommandReplacements: number[] = null;
   private _pendingCommandSpliceIndex: number = -1;
   private _pendingCommandSpliceRemovedCount: number = 0;
   private _pendingCommandSpliceAddedCount: number = 0;
   private _spriteTexturePatchPending: boolean = false;

   constructor(private _renderer: GraphicsRenderer, handleControlBuffer: ArrayBuffer) {
      this._dataHandle = LayaGL.render2DRenderPassFactory.createGraphicsCommandStreamDataHandle();
      this._dataHandle.setGraphicsHandleUpdateBuffer(handleControlBuffer);
   }

   getDataHandle(): IGraphicsCommandStreamDataHandle {
      return this._dataHandle;
   }

   private _syncSpriteTextureDependency(res: Texture): void {
      if (!res || this._spriteTexture === res)
         return;
      let oldTexture = this._spriteTexture;
      this._spriteTexture = res;
      res.on(Event.CHANGE, this, this._onTextureChange, [res]);
      if (oldTexture && !this._hasListeningCommandTexture(oldTexture))
         oldTexture.off(Event.CHANGE, this, this._onTextureChange);
   }

   rebuild(runner: GraphicsRunner): void {
      let host = this._renderer;
      let graphics = host.graphics;
      let spliceIndex = this._pendingCommandSpliceIndex;
      let spliceRemovedCount = this._pendingCommandSpliceRemovedCount;
      let spliceAddedCount = this._pendingCommandSpliceAddedCount;
      this.clearPendingCommandChanges();
      this._finishOrCancelRebuild(true);
      this._rebuilding = true;
      this._rebuildCursor = 0;
      this._rebuildSpliceIndex = spliceIndex;
      this._rebuildSpliceRemovedCount = spliceRemovedCount;
      this._rebuildSpliceAddedCount = spliceAddedCount;
      let oldOpCount = this.ops.length;
      if (oldOpCount > 0) {
         this._ensureRebuildSignatureCapacity(oldOpCount);
         REBUILD_OPS_SCRATCH.length = oldOpCount;
         for (let i = 0; i < oldOpCount; i++) {
            let op = this.ops[i];
            REBUILD_OPS_SCRATCH[i] = op;
            let signatureOffset = i * 4;
            op.writeStructureSignature(REBUILD_SIGNATURES_SCRATCH, signatureOffset);
            if ((op.dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0)
               REBUILD_SIGNATURES_SCRATCH[signatureOffset + 3] |= REBUILD_SOURCE_STRUCTURE_DIRTY;
         }
      }
      this.ops.length = 0;
      this.resetState();
      this.finalizeActiveCommandTextures();
      host._syncGraphicsOwnerSize();
      let cmdsLength = graphics ? graphics.cmds.length : 0;
      let compileContext = this._beginCompileContext();
      let rootBlendMode = host.owner._struct.blendMode;
      compileContext.reset(host.owner, rootBlendMode, runner._textRender);
      try {
      this._ensureCommandCapacity(cmdsLength);
      this._commandCount = cmdsLength;
      if (this._sizeDirtyCommands)
         this._sizeDirtyCommands.length = 0;
      if (this._scaleTessellationCommands)
         this._scaleTessellationCommands.length = 0;
      this._resetCommandTextureIndex(cmdsLength);
      this._textureBuildVersion = this._textureBuildVersion === Number.MAX_SAFE_INTEGER
         ? 1
         : this._textureBuildVersion + 1;
      if (this._pendingEmptyTextureRecords)
         this._pendingEmptyTextureRecords.length = 0;
      this._activeCommandIndex = -1;
      this._activeCommandHadStateDependency = false;
      this._hasStateDependency = false;
      this._ownerTransformDependencyMask = GraphicsOwnerTransformDependency.None;
      this._rootBlendMode = rootBlendMode;
      this._currentScope = 0;
      if (this._scopeIndex) {
         this._scopeCount = 1;
         this._writeRootScope(0);
      } else {
         this._scopeCount = 0;
      }

      for (let i = 0; i < cmdsLength; i++) {
         let cmd = graphics.cmds[i];
         let opStart = this.ops.length;
         this._activeCommandIndex = i;
         this._activeCommandHadStateDependency = this._hasStateDependency;
         this._setCommandValue(i, GraphicsCommandMetadataField.StateScope, this._currentScope);
         let isStateCommand = this._readCommandInfo(cmd, host.owner).isStateCommand;
         this.beginCommand(i, cmd ? cmd.cmdID : "");
         compileContext.compileCommand(cmd, isStateCommand);
         this.endCommand();
         this._activeCommandIndex = -1;
         this._writeRange(i, opStart, this.ops.length);
         this._writeCommandMetadata(i, COMMAND_INFO_SCRATCH, this._activeCommandHadStateDependency);
         if (cmd && cmd.cmdID === SaveCmd.ID)
            this._openScope(i + 1, compileContext);
         else if (cmd && cmd.cmdID === RestoreCmd.ID)
            this._closeScope(i + 1);
         this._activeCommandHadStateDependency = false;
      }
      if (host.owner._texture)
         this.appendSpriteTextureOp(compileContext);
      else
         this.clearSpriteTextureDependency();
      if (this._scopeIndex) {
         for (let scope = this._currentScope; scope > 0; scope = this._getScopeValue(scope, GraphicsStateScopeField.ParentScope))
            this._setScopeValue(scope, GraphicsStateScopeField.CommandEnd, cmdsLength);
         this._setScopeValue(0, GraphicsStateScopeField.CommandEnd, cmdsLength);
      }
      } finally {
         compileContext.end();
      }
      this._activeCommandIndex = -1;
      this._activeCommandHadStateDependency = false;
      let topologyChanged = this._finishOrCancelRebuild(false);
      host._syncGraphicsOwnerTransformInterest(true);
      let firstTextureRecord = this._textureCommandRecord;
      if (firstTextureRecord && firstTextureRecord.buildVersion !== this._textureBuildVersion) {
         this._detachTextureDependencyRecord(firstTextureRecord);
         this._textureCommandRecord = null;
      }
      if (this._textureCommandRecords)
         this._textureCommandRecords.forEach(this._reconcileTextureDependencyRecord, this);
      this._compactTextureCommandRecords();
      let opDirtyFlags = GraphicsOp2DDirtyFlag.None;
      for (let i = 0, n = this.ops.length; i < n; i++)
         opDirtyFlags |= this.ops[i].dirtyFlags;
      host._syncGraphicsOps(
         host._mapGraphicsOpDirtyFlags(opDirtyFlags),
         0,
         this.ops.length,
         true,
         topologyChanged,
      );
   }

   private _handleTextureChange(texture: Texture): boolean {
      let host = this._renderer;
      if (!host || !host.owner || host.owner.destroyed || !texture)
         return false;
      let record = this._getTextureCommandRecord(texture.id);
      if (!record || record.texture !== texture)
         return false;
      if (!texture.valid)
         return host._scheduleGraphicsFullRebuild();
      let commandIndices = record.commandIndices;
      if (typeof commandIndices === "number") {
         SINGLE_TEXTURE_COMMAND_SCRATCH[0] = commandIndices;
         commandIndices = SINGLE_TEXTURE_COMMAND_SCRATCH;
      }
      else if (!commandIndices || commandIndices.length === 0)
         return false;
      return this.refreshCommandRanges(commandIndices, GraphicsInfoDirtyFlag.Texture | GraphicsInfoDirtyFlag.Rebatch)
         !== GraphicsRefreshAction.NoEffect;
   }

   private _onTextureChange(texture: Texture): void {
      let host = this._renderer;
      if (!host || !host.owner || host.owner.destroyed || !texture)
         return;
      let ownerRepainted = this._handleTextureChange(texture);
      if (this._spriteTexture !== texture)
         return;
      this._spriteTexturePatchPending = true;
      if (!ownerRepainted)
         host.owner.repaint();
   }

   clearSpriteTextureDependency(): void {
      let texture = this._spriteTexture;
      this._spriteTexture = null;
      if (texture && !this._hasListeningCommandTexture(texture))
         texture.off(Event.CHANGE, this, this._onTextureChange);
   }

   consumeSpriteTexturePatch(): boolean {
      let pending = this._spriteTexturePatchPending;
      this._spriteTexturePatchPending = false;
      return pending;
   }

   hasPendingUpdates(): boolean {
      return this._spriteTexturePatchPending
         || !!(this._pendingCommandReplacements && this._pendingCommandReplacements.length > 0)
         || this._pendingCommandSpliceIndex !== -1;
   }

   queueCommandReplacement(commandIndex: number): void {
      let flags = this._getCommandValue(commandIndex, GraphicsCommandMetadataField.Flags);
      if ((flags & GraphicsCommandTrackerFlag.PendingReplacement) !== 0)
         return;
      this._setCommandValue(commandIndex, GraphicsCommandMetadataField.Flags, flags | GraphicsCommandTrackerFlag.PendingReplacement);
      if (!this._pendingCommandReplacements)
         this._pendingCommandReplacements = [];
      this._pendingCommandReplacements.push(commandIndex);
   }
   clearPendingCommandReplacements(): void {
      let pending = this._pendingCommandReplacements;
      if (!pending)
         return;
      for (let i = 0, n = pending.length; i < n; i++) {
         let commandIndex = pending[i];
         if (commandIndex < 0)
            continue;
         this._setCommandValue(commandIndex, GraphicsCommandMetadataField.Flags,
            this._getCommandValue(commandIndex, GraphicsCommandMetadataField.Flags) & ~GraphicsCommandTrackerFlag.PendingReplacement);
      }
      pending.length = 0;
   }

   queueCommandSplice(commandIndex: number, removedCount: number, addedCount: number): boolean {
      if (this._pendingCommandSpliceIndex === INVALID_COMMAND_SPLICE_INDEX)
         return false;
      if (this._pendingCommandSpliceIndex >= 0) {
         // Coalesce clear(N) followed by sequential addCmd calls into one
         // replacement splice. Unequal N/M counts remain a retained rebuild:
         // the overlap maps to old Ops and only the tail changes topology.
         if (removedCount === 0
            && commandIndex >= this._pendingCommandSpliceIndex
            && commandIndex <= this._pendingCommandSpliceIndex + this._pendingCommandSpliceAddedCount) {
            this._pendingCommandSpliceAddedCount += addedCount;
            return true;
         }
         if (addedCount === 0 && this._pendingCommandSpliceAddedCount === 0
            && commandIndex === this._pendingCommandSpliceIndex) {
            this._pendingCommandSpliceRemovedCount += removedCount;
            return true;
         }
         this._pendingCommandSpliceIndex = INVALID_COMMAND_SPLICE_INDEX;
         this._pendingCommandSpliceRemovedCount = 0;
         this._pendingCommandSpliceAddedCount = 0;
         return false;
      }
      this.clearPendingCommandReplacements();
      this._pendingCommandSpliceIndex = commandIndex;
      this._pendingCommandSpliceRemovedCount = removedCount;
      this._pendingCommandSpliceAddedCount = addedCount;
      return true;
   }
   clearPendingCommandSplice(): void {
      this._pendingCommandSpliceIndex = -1;
      this._pendingCommandSpliceRemovedCount = 0;
      this._pendingCommandSpliceAddedCount = 0;
   }

   clearPendingCommandChanges(): void {
      this.clearPendingCommandReplacements();
      this.clearPendingCommandSplice();
   }

   private _reconcileTextureDependencyRecord(record: GraphicsCommandTextureRecord, id: number): void {
      if (record.buildVersion === this._textureBuildVersion)
         return;
      this._detachTextureDependencyRecord(record);
      this._textureCommandRecords.delete(id);
   }

   private _detachTextureDependencyRecord(record: GraphicsCommandTextureRecord): void {
      if (!record.listening)
         return;
      record.listening = false;
      if (record.texture !== this._spriteTexture)
         record.texture.off(Event.CHANGE, this, this._onTextureChange);
   }

   private _attachTextureDependencyRecord(record: GraphicsCommandTextureRecord): void {
      if (record.listening)
         return;
      record.listening = true;
      // Sprite.texture uses the same caller/callback, so Delegate keeps one
      // listener when both dependency roles reference the same Texture.
      record.texture.on(Event.CHANGE, this, this._onTextureChange, [record.texture]);
   }

   clearTextureDependencies(): void {
      let firstRecord = this._textureCommandRecord;
      if (firstRecord) {
         this._detachTextureDependencyRecord(firstRecord);
         this._textureCommandRecord = null;
      }
      let records = this._textureCommandRecords;
      if (records) {
         records.forEach(this._detachTextureDependencyRecord, this);
         records.clear();
         this._textureCommandRecords = null;
      }
      if (this._pendingEmptyTextureRecords)
         this._pendingEmptyTextureRecords.length = 0;
      this._resetCommandTextureIndex();
      this.clearSpriteTextureDependency();
   }

   deactivate(): void {
      this._dataHandle.deactivateGraphicsOps();
   }

   destroy(): void {
      this.clearTextureDependencies();
      this.clear();
      if (this._dataHandle)
         this._dataHandle.destroy();
      this._dataHandle = null;
      this._pendingCommandReplacements = null;
      this.clearPendingCommandSplice();
      this._spriteTexturePatchPending = false;
      this._renderer = null;
   }
}
