import { type IGraphicsCommandStreamDataHandle, type IGraphicsMultiQuadOp2D, type IGraphicsOp2D, type IGraphicsTextOp2D, type IGraphicsTextureQuadOp2D } from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { Event } from "../../../events/Event";
import { LayaGL } from "../../../layagl/LayaGL";
import { Texture } from "../../../resource/Texture";
import { GraphicsDefines } from "../../../webgl/shader/d2/GraphicsDefines";
import { Draw9GridTextureCmd } from "../../cmd/Draw9GridTextureCmd";
import { DrawImageCmd } from "../../cmd/DrawImageCmd";
import { DrawTextureCmd } from "../../cmd/DrawTextureCmd";
import { DrawTexturesCmd } from "../../cmd/DrawTexturesCmd";
import { FillTextCmd } from "../../cmd/FillTextCmd";
import { Render2DProcessor } from "../../Render2DProcessor";
import type { GraphicsRunner } from "../GraphicsRunner";
import type { GraphicsRenderer } from "./GraphicsRenderer";
import { GraphicsCommandPatchResult, GraphicsHandleDirtyFlag, GraphicsOp2DDirtyFlag, GraphicsOp2DKind, GraphicsOwnerTransformDependency, type GraphicsCommandId, type GraphicsOp2DTextureHost } from "./GraphicsPipelineTypes";
interface TextureCommandEntry {
   texture: Texture;
   indices: number | number[];
}
const EMPTY_OPS: ReadonlyArray<IGraphicsOp2D> = [];
const OLD_OPS: IGraphicsOp2D[] = [];
const ACTIVE_TEXTURES: GraphicsOp2DTextureHost[] = [];
let OLD_SIGNATURES = new Int32Array(32);
let OLD_STRUCTURE_DIRTY = new Uint8Array(8);
const SPRITE_TEXTURE_ID = "$spriteTexture";
/** Physical retained Op storage. Command state and ranges belong to GraphicsCompileContext. @internal */
export class GraphicsCommandStreamMode {
   readonly ops: IGraphicsOp2D[] = [];
   private _dataHandle: IGraphicsCommandStreamDataHandle;
   private _activeIndex: number = -1;
   private _activeId: GraphicsCommandId = "";
   private _activeOp: IGraphicsOp2D = null;
   private _targetOp: IGraphicsTextureQuadOp2D = null;
   private _targetWrote: boolean = false;
   private _lastTargetWrote: boolean = false;
   private _activeMultiQuad: IGraphicsMultiQuadOp2D = null;
   private _drawImageOp: IGraphicsMultiQuadOp2D = null;
   private _drawImageLastIndex: number = -2;
   private _reuseOps: boolean = false;
   private _oldOpCount: number = 0;
   private _topologyChanged: boolean = false;
   private _textures: Map<number, TextureCommandEntry> = new Map();
   private _spriteTexture: Texture = null;
   private _spriteOp: IGraphicsTextureQuadOp2D = null;
   private _spriteOpIndex: number = -1;
   private _ownerDependencyMask: GraphicsOwnerTransformDependency = GraphicsOwnerTransformDependency.None;
   constructor(private _renderer: GraphicsRenderer, handleControlBuffer: ArrayBuffer) {
      this._dataHandle = LayaGL.render2DRenderPassFactory.createGraphicsCommandStreamDataHandle();
      this._dataHandle.setGraphicsHandleUpdateBuffer(handleControlBuffer);
   }
   get opCount(): number {
      return this.ops.length;
   }
   getDataHandle(): IGraphicsCommandStreamDataHandle {
      return this._dataHandle;
   }
   getOp(index: number): IGraphicsOp2D {
      return this.ops[index];
   }
   getOwnerTransformDependencyMask(): GraphicsOwnerTransformDependency {
      return this._ownerDependencyMask;
   }
   beginCommand(commandIndex: number, commandId: GraphicsCommandId, targetOp: IGraphicsTextureQuadOp2D = null): void {
      let mergeDrawImage = !targetOp && commandId === DrawImageCmd.ID;
      if (!mergeDrawImage || commandIndex !== this._drawImageLastIndex + 1)
         this._flushDrawImageGroup();
      this._activeIndex = commandIndex;
      this._activeId = commandId;
      this._activeOp = mergeDrawImage ? this._drawImageOp : null;
      this._targetOp = targetOp;
      this._targetWrote = false;
   }
   endCommand(): void {
      if (this._activeId === DrawImageCmd.ID && !this._targetOp) {
         this._drawImageOp = this._activeOp as IGraphicsMultiQuadOp2D;
         this._drawImageLastIndex = this._activeIndex;
      }
      this._lastTargetWrote = this._targetWrote;
      this._activeIndex = -1;
      this._activeId = "";
      this._activeOp = null;
      this._targetOp = null;
      this._targetWrote = false;
   }
   getTextureQuadTargetOp(): IGraphicsTextureQuadOp2D | IGraphicsMultiQuadOp2D | IGraphicsTextOp2D {
      if (this._targetOp)
         return this._targetOp;
      if (this._activeId === DrawImageCmd.ID)
         return this._activeOp as IGraphicsMultiQuadOp2D || this._appendOp(GraphicsOp2DKind.MultiQuad) as IGraphicsMultiQuadOp2D;
      if (this._activeId === DrawTexturesCmd.ID || this._activeId === Draw9GridTextureCmd.ID)
         return this._activeOp as IGraphicsMultiQuadOp2D || this._appendOp(GraphicsOp2DKind.MultiQuad) as IGraphicsMultiQuadOp2D;
      if (this._activeId === FillTextCmd.ID)
         return this._activeOp as IGraphicsTextOp2D || this._appendOp(GraphicsOp2DKind.Text) as IGraphicsTextOp2D;
      return this._appendOp(GraphicsOp2DKind.TextureQuad) as IGraphicsTextureQuadOp2D;
   }
   _appendOp(kind: GraphicsOp2DKind): IGraphicsOp2D {
      let op: IGraphicsOp2D = null;
      let cursor = this.ops.length;
      if (this._reuseOps && cursor < this._oldOpCount) {
         let old = OLD_OPS[cursor];
         if (old && old.kind === kind && old.commandIndex === this._activeIndex && old.canUpdate(this._activeId)) {
            op = old;
            OLD_OPS[cursor] = null;
            op.resetRecords();
            op.setCommandIndex(this._activeIndex);
         }
      }
      if (!op) {
         op = this._createOp(kind);
         if (this._reuseOps)
            this._topologyChanged = true;
      }
      this.ops.push(op);
      this._activeOp = op;
      return op;
   }
   private _createOp(kind: GraphicsOp2DKind): IGraphicsOp2D {
      let factory = GraphicsDefines._factory;
      switch (kind) {
         case GraphicsOp2DKind.TextureQuad:
            return factory.createTextureQuadOp(this._activeIndex, this._activeId);
         case GraphicsOp2DKind.SolidQuad:
            return factory.createSolidQuadOp(this._activeIndex, this._activeId);
         case GraphicsOp2DKind.FillTexture:
            return factory.createFillTextureOp(this._activeIndex, this._activeId);
         case GraphicsOp2DKind.MultiQuad:
            return factory.createMultiQuadOp(this._activeIndex, this._activeId);
         case GraphicsOp2DKind.Text:
            return factory.createTextOp(this._activeIndex, this._activeId);
         default:
            return factory.createMeshOp(this._activeIndex, this._activeId);
      }
   }
   _beginActiveCommandTextures(): void {
      if (this._activeId === DrawImageCmd.ID && this._activeOp === this._drawImageOp && this._activeMultiQuad === this._drawImageOp)
         return;
      this._activeMultiQuad = null; ACTIVE_TEXTURES.length = 0;
   }
   finalizeActiveCommandTextures(): void {
      if (this._activeId !== DrawImageCmd.ID || this._targetOp)
         this._flushActiveMultiQuad();
   }
   private _flushActiveMultiQuad(): void {
      if (this._activeMultiQuad)
         this._activeMultiQuad.setTextures(ACTIVE_TEXTURES, ACTIVE_TEXTURES.length);
      this._activeMultiQuad = null;
      ACTIVE_TEXTURES.length = 0;
   }
   private _flushDrawImageGroup(): void {
      if (!this._drawImageOp)
         return;
      this._flushActiveMultiQuad();
      this._drawImageOp = null;
      this._drawImageLastIndex = -2;
   }
   endCompile(): void {
      this._flushDrawImageGroup();
   }
   _recordActiveMultiQuadTexture(op: IGraphicsMultiQuadOp2D, texture: GraphicsOp2DTextureHost): void {
      if (this._activeMultiQuad && this._activeMultiQuad !== op)
         this.finalizeActiveCommandTextures();
      if (!this._activeMultiQuad) {
         this._activeMultiQuad = op;
         ACTIVE_TEXTURES.length = 0;
      }
      ACTIVE_TEXTURES[op.recordCount] = texture || null;
   }
   _markTextureQuadWritten(): void {
      if (this._targetOp)
         this._targetWrote = true;
   }
   _prepareTexture(texture: Texture, spriteTexture: boolean = false): boolean {
      if (!texture || texture.destroyed)
         return false;
      if (spriteTexture)
         this._setSpriteTexture(texture);
      else if (!this._targetOp)
         this._addTextureIndex(texture, this._activeIndex);
      if (texture.valid)
         return true;
      this._renderer.requestTextureRecovery(texture);
      return false;
   }
   private _addTextureIndex(texture: Texture, commandIndex: number): void {
      let entry = this._textures.get(texture.id);
      if (!entry) {
         entry = { texture, indices: commandIndex };
         this._textures.set(texture.id, entry);
         if (texture !== this._spriteTexture)
            texture.on(Event.CHANGE, this, this._onTextureChange, [texture]);
         return;
      }
      let indices = entry.indices;
      if (indices === -1) {
         entry.indices = commandIndex;
         return;
      }
      if (typeof indices === "number") {
         if (indices !== commandIndex)
            entry.indices = [indices, commandIndex];
      } else if (indices.indexOf(commandIndex) < 0)
         indices.push(commandIndex);
   }
   private _removeTextureIndex(texture: Texture, commandIndex: number): void {
      let entry = this._textures.get(texture.id);
      if (!entry || entry.texture !== texture)
         return;
      let indices = entry.indices;
      if (typeof indices !== "number") {
         let index = indices.indexOf(commandIndex);
         if (index < 0)
            return;
         indices.splice(index, 1);
         if (indices.length > 1)
            return;
         if (indices.length === 1) {
            entry.indices = indices[0];
            return;
         }
      } else if (indices !== commandIndex)
         return;
      entry.indices = -1;
   }
   private _deleteTextureEntry(entry: TextureCommandEntry): void {
      this._textures.delete(entry.texture.id);
      if (entry.texture !== this._spriteTexture)
         entry.texture.off(Event.CHANGE, this, this._onTextureChange);
   }
   private _clearCommandTextures(): void {
      this._textures.forEach(this._detachCommandTexture, this);
      this._textures.clear();
   }
   private _detachCommandTexture(entry: TextureCommandEntry): void {
      if (entry.texture !== this._spriteTexture)
         entry.texture.off(Event.CHANGE, this, this._onTextureChange);
   }
   private _prepareTextureIndex(reuse: boolean): void {
      if (reuse)
         this._textures.forEach(this._markTextureUnused);
      else
         this._clearCommandTextures();
   }
   private _markTextureUnused(entry: TextureCommandEntry): void {
      entry.indices = -1;
   }
   private _pruneTextureIndex(): void {
      if (this._textures.size <= 64)
         return;
      this._textures.forEach(this._pruneTextureEntry, this);
   }
   private _pruneTextureEntry(entry: TextureCommandEntry): void {
      if (entry.indices === -1)
         this._deleteTextureEntry(entry);
   }
   private _setSpriteTexture(texture: Texture): void {
      if (this._spriteTexture === texture)
         return;
      let old = this._spriteTexture;
      this._spriteTexture = texture;
      if (!this._textures.has(texture.id))
         texture.on(Event.CHANGE, this, this._onTextureChange, [texture]);
      if (old && !this._textures.has(old.id))
         old.off(Event.CHANGE, this, this._onTextureChange);
   }
   clearSpriteTextureDependency(): void {
      let texture = this._spriteTexture;
      this._spriteTexture = null;
      this._spriteOp = null;
      this._spriteOpIndex = -1;
      if (texture && !this._textures.has(texture.id))
         texture.off(Event.CHANGE, this, this._onTextureChange);
   }
   private _onTextureChange(texture: Texture): void {
      let commandEntry = this._textures.get(texture.id);
      if (texture !== this._spriteTexture && (!commandEntry || commandEntry.texture !== texture || commandEntry.indices === -1))
         return;
      if (!texture.valid)
         this._renderer.requestTextureRecovery(texture);
      this._renderer._scheduleGraphicsRebuild();
   }
   private _ensureRebuildCapacity(count: number): void {
      if (count <= OLD_STRUCTURE_DIRTY.length)
         return;
      let capacity = Math.max(8, OLD_STRUCTURE_DIRTY.length);
      while (capacity < count)
         capacity <<= 1;
      OLD_SIGNATURES = new Int32Array(capacity * 4);
      OLD_STRUCTURE_DIRTY = new Uint8Array(capacity);
   }
   private _beginRebuild(): void {
      let oldCount = this.ops.length;
      this._oldOpCount = oldCount;
      this._reuseOps = oldCount > 0;
      this._topologyChanged = false;
      if (this._reuseOps) {
         this._ensureRebuildCapacity(oldCount);
         OLD_OPS.length = oldCount;
         for (let i = 0; i < oldCount; i++) {
            let op = this.ops[i];
            OLD_OPS[i] = op;
            op.writeStructureSignature(OLD_SIGNATURES, i * 4);
            OLD_STRUCTURE_DIRTY[i] = (op.dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0 ? 1 : 0;
         }
      } else {
         OLD_OPS.length = 0;
      }
      this.ops.length = 0;
      this._spriteOp = null;
      this._spriteOpIndex = -1;
   }
   private _finishRebuild(): boolean {
      if (!this._reuseOps) {
         this._topologyChanged = this._topologyChanged || this.ops.length > 0;
         return this._topologyChanged;
      }
      if (this.ops.length !== this._oldOpCount)
         this._topologyChanged = true;
      for (let i = 0; i < this._oldOpCount; i++) {
         let old = OLD_OPS[i];
         if (old) {
            old.destroy();
            this._topologyChanged = true;
         } else {
            let op = this.ops[i];
            if (OLD_STRUCTURE_DIRTY[i] || !op.matchesStructureSignature(OLD_SIGNATURES, i * 4)) {
               this._topologyChanged = true;
               op.markDirty(GraphicsOp2DDirtyFlag.Structure);
            } else
               op.clearStructureDirty();
         }
         OLD_OPS[i] = null;
         OLD_STRUCTURE_DIRTY[i] = 0;
      }
      OLD_OPS.length = 0;
      this._reuseOps = false;
      return this._topologyChanged;
   }
   rebuild(runner: GraphicsRunner): void {
      let host = this._renderer;
      let owner = host.owner;
      let graphics = host.graphics;
      this._prepareTextureIndex(this.ops.length > 0);
      this._beginRebuild();
      host._syncGraphicsOwnerSize();
      let context = Render2DProcessor.compileContext;
      context.begin(this, owner, owner._struct.blendMode, runner._textRender);
      if (graphics) {
         let cmds = graphics.cmds;
         for (let i = 0, n = cmds.length; i < n; i++)
            context.compileCommand(i, cmds[i]);
      }
      this._ownerDependencyMask = context.getOwnerDependencyMask();
      if (owner._texture)
         this._appendSpriteTexture(context);
      else
         this.clearSpriteTextureDependency();
      context.end();
      this._pruneTextureIndex();
      let topologyChanged = this._finishRebuild();
      let dirty = GraphicsOp2DDirtyFlag.None;
      for (let i = 0, n = this.ops.length; i < n; i++)
         dirty |= this.ops[i].dirtyFlags;
      host._syncGraphicsOps(host._mapGraphicsOpDirtyFlags(dirty), 0, this.ops.length, true, topologyChanged);
   }
   private _appendSpriteTexture(context: typeof Render2DProcessor.compileContext): void {
      let owner = this._renderer.owner;
      let texture = owner._texture;
      this.beginCommand(-1, SPRITE_TEXTURE_ID);
      if (this._prepareTexture(texture, true)) {
         let op = this._appendOp(GraphicsOp2DKind.TextureQuad) as IGraphicsTextureQuadOp2D;
         context._writeSpriteTextureOp(op, owner, texture);
         this._spriteOp = op;
         this._spriteOpIndex = this.ops.length - 1;
      }
      this.endCommand();
   }
   patchSpriteTexture(): boolean {
      let owner = this._renderer.owner;
      let texture = owner._texture;
      let op = this._spriteOp;
      if (!texture || !op || this.ops[this._spriteOpIndex] !== op)
         return false;
      let context = Render2DProcessor.compileContext;
      let runner = Render2DProcessor.runner;
      context.begin(this, owner, owner._struct.blendMode, runner._textRender);
      this.beginCommand(-1, SPRITE_TEXTURE_ID, op);
      let success = this._prepareTexture(texture, true) && context._writeSpriteTextureOp(op, owner, texture);
      this.endCommand();
      context.end();
      if (!success)
         return false;
      let flags = this._renderer._mapGraphicsOpDirtyFlags(op.dirtyFlags);
      if (flags !== GraphicsHandleDirtyFlag.None)
         this._renderer._syncGraphicsOps(flags, this._spriteOpIndex, 1, false, false);
      return true;
   }
   patchFrameAnimation(binding: any, oldCmd: DrawTextureCmd, newCmd: DrawTextureCmd): GraphicsCommandPatchResult {
      let op = binding.op as IGraphicsTextureQuadOp2D;
      let opIndex = binding.opStart;
      if (!op || newCmd.matrix || binding.opCount !== 1 || this.ops[opIndex] !== op || op.kind !== GraphicsOp2DKind.TextureQuad)
         return GraphicsCommandPatchResult.Failed;
      let owner = this._renderer.owner;
      let runner = Render2DProcessor.runner;
      let context = Render2DProcessor.compileContext;
      context.begin(this, owner, owner._struct.blendMode, runner._textRender);
      context.compileCommand(binding.commandIndex, newCmd, op);
      context.end();
      if (!this._lastTargetWrote)
         return GraphicsCommandPatchResult.Failed;
      if (oldCmd.texture !== newCmd.texture) {
         this._removeTextureIndex(oldCmd.texture, binding.commandIndex);
         this._addTextureIndex(newCmd.texture, binding.commandIndex);
      }
      let flags = this._renderer._mapGraphicsOpDirtyFlags(op.dirtyFlags);
      if (flags === GraphicsHandleDirtyFlag.None)
         return GraphicsCommandPatchResult.NoChange;
      this._renderer._syncGraphicsOps(flags, opIndex, 1, false, false);
      return GraphicsCommandPatchResult.Changed;
   }
   markSubmitted(start: number = 0, count: number = this.ops.length, deferredConsume: boolean = false): void {
      let end = Math.min(start + count, this.ops.length);
      for (let i = Math.max(0, start); i < end; i++) {
         let op = this.ops[i];
         if (deferredConsume)
            op.dirtyFlags = GraphicsOp2DDirtyFlag.None;
         else
            op.clearDirty();
      }
   }
   clear(releaseHandle: boolean = false): void {
      this._clearCommandTextures();
      this.clearSpriteTextureDependency();
      for (let i = 0, n = this.ops.length; i < n; i++)
         this.ops[i].destroy();
      this.ops.length = 0;
      this._ownerDependencyMask = GraphicsOwnerTransformDependency.None;
      if (releaseHandle)
         this._dataHandle.syncGraphicsOps(EMPTY_OPS);
   }
   clearTextureDependencies(): void {
      this._clearCommandTextures();
      this.clearSpriteTextureDependency();
   }
   deactivate(): void {
      this._dataHandle.deactivateGraphicsOps();
   }
   destroy(): void {
      this.clear();
      this._dataHandle.destroy();
      this._dataHandle = null;
      this._renderer = null;
   }
}
