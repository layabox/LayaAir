import { Event } from "../../../events/Event";
import { LayaGL } from "../../../layagl/LayaGL";
import { IPrimitiveRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { GraphicsInfoDirtyFlag, I2DPrimitiveDataHandle, IGraphicsOp2D, IGraphicsTextureQuadOp2D } from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRenderStruct2D } from "../../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { Resource } from "../../../resource/Resource";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Texture } from "../../../resource/Texture";
import { Graphics } from "../../Graphics";
import { Sprite } from "../../Sprite";
import { BaseRender2DType, SpriteConst, TransformKind } from "../../SpriteConst";
import { SpriteGlobalTransform } from "../../SpriteGlobaTransform";
import { DrawTextureCmd } from "../../cmd/DrawTextureCmd";
import type { IGraphicsCmd } from "../../IGraphics";
import {
	GraphicsHandleDirtyFlag,
	GraphicsHandleUpdateField,
	GraphicsOwnerTransformDependency,
	GraphicsRefreshAction,
} from "./GraphicsPipelineTypes";
import { GraphicsCommandTracker } from "./GraphicsCommandTracker";
import { GraphicsCommandOpEncoder, GraphicsCommandOpEncoderHost } from "./GraphicsCommandOpEncoder";
import { GraphicsOp2DList } from "./GraphicsOp2DList";
import { GraphicsRunner } from "../GraphicsRunner";
import { GraphicsOp2DDirtyFlag, GraphicsOp2DKind } from "./GraphicsPipelineTypes";
import { GraphicsOpRenderStateHelper } from "./GraphicsPipelineHelpers";
import { Render2DProcessor } from "../../Render2DProcessor";

/** @internal */
export class GraphicsRenderer implements GraphicsCommandOpEncoderHost {

   static __init__(): void {
   }

   static _emptyList: IPrimitiveRenderElement2D[] = [];
   owner: Sprite;

   _struct: IRenderStruct2D;

   texturesMap: Map<number, {
      texture: Texture;
      bitmap: BaseTexture;
      time:number;
   }> = new Map();

   _display: boolean = false;
   /** @internal Whether the current display state has been applied to the render struct. */
   private _structDisplay: boolean = false;

   private _renderDataHandle: I2DPrimitiveDataHandle;
   private _handleUpdateBuffer: ArrayBuffer = new ArrayBuffer(GraphicsHandleUpdateField.WordCount * 4);
   private _handleUpdateInt32: Int32Array = new Int32Array(this._handleUpdateBuffer);
   private _handleUpdateFloat32: Float32Array = new Float32Array(this._handleUpdateBuffer);
   private _opListBuilder: GraphicsOp2DList;
   private _commandOpEncoder: GraphicsCommandOpEncoder;
   private _commandTracker: GraphicsCommandTracker = new GraphicsCommandTracker();
   private _commandOps: IGraphicsOp2D[] = [];
   private _destroyed: boolean = false;
   private _renderedGraphicsModified: number = Number.MIN_SAFE_INTEGER;
   private _graphicsStateDirty: boolean = true;
   private _materialDirty: boolean = true;
   private _graphicsUseSpriteState: boolean = true;
   private _pendingCommandReplacements: number[] = [];
   private _recoveringTextureIds: Set<number> = new Set();
   private _ownerTransformListenerActive: boolean = false;
   private _ownerTransformMask: number = 0;

   graphics:Graphics = null;

   constructor(owner: Sprite) {
      this._destroyed = false;
      this.owner = owner;
      this._struct = owner._struct;
      this._renderDataHandle = LayaGL.render2DRenderPassFactory.create2D2DPrimitiveDataHandle();
      this._renderDataHandle.setGraphicsHandleUpdateBuffer(this._handleUpdateBuffer);
      this._opListBuilder = new GraphicsOp2DList();
      this._commandOpEncoder = new GraphicsCommandOpEncoder(this._opListBuilder, this);
   }

   /** @internal */
   private _onOwnerTransformChanged(type : number) {
      let maskedType = type & this._ownerTransformMask;
      if (maskedType === 0 || this._destroyed || !this.owner || !this.owner._struct || !this._display || !this.owner._struct.enabled)
         return;

      if ((maskedType & TransformKind.Size) !== 0)
         this._handleOwnerSizeChanged();
      if ((maskedType & TransformKind.Scale) !== 0)
         this._handleOwnerScaleChanged();
   }

   private _handleOwnerSizeChanged(): void {
      this._syncOwnerSize();

      if (this._graphicsStateDirty)
         return;

      if (this._hasSpriteTextureUpdateTarget()) {
         this._scheduleFullRebuild();
         return;
      }

      if (!this.graphics)
         return;

      let tracker = this._commandTracker;
      if (tracker.hasLayoutDirtyCommands()) {
         this._scheduleFullRebuild();
         return;
      }
      if (tracker.hasSizeDirtyCommands())
         this._refreshCommandRanges(tracker.getSizeDirtyCommands(), GraphicsInfoDirtyFlag.Layout | GraphicsInfoDirtyFlag.Rebatch);
   }

   private _handleOwnerScaleChanged(): void {
      if (this._graphicsStateDirty || !this.graphics || !this._commandTracker.hasScaleTessellationCommands()) {
         return;
      }

      let scaleDirtyCmds = this._commandTracker.getScaleTessellationDirtyCommands(this.graphics.cmds, this.owner);
      if (scaleDirtyCmds.length > 0)
         this._refreshCommandRanges(scaleDirtyCmds, GraphicsInfoDirtyFlag.Layout | GraphicsInfoDirtyFlag.Rebatch);
   }

   private _hasSpriteTextureUpdateTarget(): boolean {
      return !!(this.owner && this.owner._texture);
   }

   private _syncOwnerTransformInterest(useRenderedCommandSummary: boolean): void {
      let transformMask = 0;
      if (this._display && this.owner && !this.owner.destroyed) {
         let dependencyMask = useRenderedCommandSummary
            ? this._commandTracker.getOwnerTransformDependencyMask()
            : this._commandTracker.collectOwnerTransformDependencyMask(this.graphics ? this.graphics.cmds : null, this.owner);
         if (this._hasSpriteTextureUpdateTarget())
            dependencyMask |= GraphicsOwnerTransformDependency.SpriteTextureSize;
         transformMask = this._toTransformMask(dependencyMask);
      }
      this._setOwnerTransformListener(transformMask);
   }

   private _toTransformMask(dependencyMask: GraphicsOwnerTransformDependency): number {
      let transformMask = 0;
      if ((dependencyMask & (GraphicsOwnerTransformDependency.SizeLayout | GraphicsOwnerTransformDependency.SpriteTextureSize)) !== 0)
         transformMask |= TransformKind.Size;
      if ((dependencyMask & GraphicsOwnerTransformDependency.ScaleTessellation) !== 0)
         transformMask |= TransformKind.Scale;
      return transformMask;
   }

   private _setOwnerTransformListener(transformMask: number): void {
      if (this._ownerTransformMask === transformMask && this._ownerTransformListenerActive === (transformMask !== 0))
         return;

      let owner = this.owner;
      if (this._ownerTransformListenerActive && owner)
         owner.off(SpriteGlobalTransform.CHANGED, this, this._onOwnerTransformChanged);

      this._ownerTransformListenerActive = false;
      this._ownerTransformMask = transformMask;

      if (transformMask !== 0 && owner && !this._destroyed) {
         owner.on(SpriteGlobalTransform.CHANGED, this, this._onOwnerTransformChanged);
         this._ownerTransformListenerActive = true;
      }
   }

   /**
    * 设置Graphics对象
    * @param graphics Graphics对象
    */
   setGraphics(graphics: Graphics): void {
      if (this.graphics !== graphics) {
         this._graphicsStateDirty = true;
         this._materialDirty = true;
         this._renderedGraphicsModified = Number.MIN_SAFE_INTEGER;
         this._clearPendingCommandReplacements();
      }
      this.graphics = graphics;
      this._checkDisplay();
      this._syncOwnerTransformInterest(false);
   }

   /**
     * @internal
     */
   _render(runner: GraphicsRunner): void {
      if (!this.owner || !this.graphics || this.owner.destroyed)
         return;

      this._syncStructDisplayState();
      if (!this._display)
         return;

      if (this._materialDirty || this._graphicsUseSpriteState !== this.graphics._useSpriteState)
         this._syncMaterialToHandle();

      if (!this._graphicsStateDirty && this._hasTextureBitmapChanged())
         this._invalidateOpBuild();

      if (!this._graphicsStateDirty && this._pendingCommandReplacements.length > 0) {
         if (this._refreshPendingCommandReplacements(runner))
            return;
         this._invalidateOpBuild();
      }

      if (!this._graphicsStateDirty && this._renderedGraphicsModified === this.graphics._modified)
         return;

      this._renderedGraphicsModified = this.graphics._modified;
      this._graphicsStateDirty = false;
      this._clearPendingCommandReplacements();

      this.clear();
      this._opListBuilder.clear();
      this._commandOps.length = 0;
      this._commandOpEncoder.clearBuildState();
      this._commandOpEncoder.preRegisterTextureQuadResources();
      this._syncOwnerSize();
      this._commandTracker.beginBuild();
      runner.clear();
      runner.sprite = this.owner;
      runner._renderer = this;

      let oldBlendMode = runner.globalCompositeOperation;
      runner.globalCompositeOperation = this.owner._struct.blendMode;

      let cmdsLength = this.graphics.cmds.length;
      let cmd:IGraphicsCmd

      for (let i = 0; i < cmdsLength; i++) {
         cmd = this.graphics.cmds[i];
         let opStart = this._opListBuilder.opCount;
         this._commandTracker.beginCommand(i);
         this._opListBuilder.beginCommand(i, cmd ? cmd.cmdID : "");
         this._commandOpEncoder.compileCommand(cmd, i, runner);
         this._opListBuilder.endCommand();
         let opEnd = this._opListBuilder.opCount;
         this._commandOps[i] = opEnd - opStart === 1 ? this._opListBuilder.ops[opStart] : null;
         this._commandTracker.endCommand(i, opStart, opEnd, cmd, this.owner);
      }
      this._appendSpriteTextureRecord();
      this._commandTracker.endBuild();
      this._syncOwnerTransformInterest(true);
      this._sweepTextureRefs();

      this._syncGraphicsOpsToHandle();

      runner.globalCompositeOperation = oldBlendMode;
      runner._renderer = null;
      runner.sprite = null;
   }

   private _appendSpriteTextureRecord(): void {
      if (this.graphics)
         this._commandOpEncoder.appendSpriteTextureOp();
   }

   /** @internal */
   _patchTextureQuadCommand(cmdIndex: number, oldCmd: DrawTextureCmd, newCmd: DrawTextureCmd): boolean {
      let result = false;
      if (!this._graphicsStateDirty
         && this._renderedGraphicsModified !== Number.MIN_SAFE_INTEGER
         && oldCmd && newCmd && oldCmd.cmdID === newCmd.cmdID
         && !this._commandTracker.hasStateDependency(cmdIndex)) {
         let range = this._commandTracker.getRange(cmdIndex);
         let existing = this._commandOps[cmdIndex];
         if (range && range.active && range.count === 1 && existing && existing.kind === GraphicsOp2DKind.TextureQuad) {
            let opIndex = this._opListBuilder.getOpIndex(existing);
            if (opIndex >= 0) {
               let runner = Render2DProcessor.runner;
               runner.clear();
               runner.sprite = this.owner;
               runner._renderer = this;
               runner.globalCompositeOperation = this.owner._struct.blendMode;
               let patchResult = this._commandOpEncoder.patchTextureQuadOp(opIndex, existing as IGraphicsTextureQuadOp2D, newCmd, runner);
               runner._renderer = null;
               runner.sprite = null;
               if (patchResult.success) {
                  let handleDirtyFlags = this._mapOpDirtyFlagsToHandleDirtyFlags(patchResult.dirtyFlags);
                  if (handleDirtyFlags !== GraphicsHandleDirtyFlag.None)
                     this._syncGraphicsOpsToHandle(handleDirtyFlags, patchResult.opIndex, 1, (patchResult.dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0);
                  this.owner._struct.setRepaint();
                  result = true;
               }
            }
         }
      }
      return result;
   }

   /** @internal */
   _preRegisterTextureQuadCommands(cmds: ReadonlyArray<DrawTextureCmd> | null): void {
      this._commandOpEncoder.preRegisterTextureQuadCommands(cmds);
   }

   /**
    * @internal
    */
   invalidateGraphicsState(){
      this._graphicsStateDirty = true;
      this._clearPendingCommandReplacements();
      this._syncOwnerTransformInterest(false);
   }

   /** @internal */
   _queueCommandReplacement(cmdIndex: number, oldCmd: IGraphicsCmd, newCmd: IGraphicsCmd): boolean {
      if (this._graphicsStateDirty)
         return false;
      if (this._renderedGraphicsModified === Number.MIN_SAFE_INTEGER)
         return false;
      if (!this.graphics)
         return false;
      if (!oldCmd || !newCmd)
         return false;
      if (oldCmd.cmdID !== newCmd.cmdID)
         return false;

      let range = this._commandTracker.getRange(cmdIndex);
      if (!range)
         return false;
      if (!range.active || range.count <= 0)
         return false;

      if (this._pendingCommandReplacements.indexOf(cmdIndex) < 0)
         this._pendingCommandReplacements.push(cmdIndex);
      return true;
   }

   private _clearPendingCommandReplacements(): void {
      this._pendingCommandReplacements.length = 0;
   }

   private _refreshPendingCommandReplacements(runner: GraphicsRunner): boolean {
      if (!this.graphics || this._pendingCommandReplacements.length === 0)
         return true;

      if (!this._refreshCommandOps(this._pendingCommandReplacements, runner))
         return false;
      this._clearPendingCommandReplacements();
      return true;
   }

   private _refreshCommandOps(cmdIndices: number[], runner: GraphicsRunner): boolean {
      let oldRenderedModified = this._renderedGraphicsModified;
      this._renderedGraphicsModified = this.graphics._modified;

      runner.clear();
      runner.sprite = this.owner;
      runner._renderer = this;
      let oldBlendMode = runner.globalCompositeOperation;
      runner.globalCompositeOperation = this.owner._struct.blendMode;

      let dirtyStart = Number.MAX_SAFE_INTEGER;
      let dirtyEnd = -1;
      let opDirtyFlags = GraphicsOp2DDirtyFlag.None;
      let hasStructureDirty = false;
      for (let i = 0, n = cmdIndices.length; i < n; i++) {
         if (!this._refreshCommandOp(cmdIndices[i], runner)) {
            runner.globalCompositeOperation = oldBlendMode;
            runner._renderer = null;
            runner.sprite = null;
            this._renderedGraphicsModified = oldRenderedModified;
            return false;
         }
         let range = this._commandTracker.getRange(cmdIndices[i]);
         if (range && range.active) {
            dirtyStart = Math.min(dirtyStart, range.start);
            dirtyEnd = Math.max(dirtyEnd, range.start + range.count);
            for (let opIndex = range.start, end = range.start + range.count; opIndex < end; opIndex++) {
               let dirtyFlags = this._opListBuilder.ops[opIndex].dirtyFlags;
               opDirtyFlags |= dirtyFlags;
               if ((dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0) {
                  hasStructureDirty = true;
               }
            }
         }
      }

      runner.globalCompositeOperation = oldBlendMode;
      runner._renderer = null;
      runner.sprite = null;

      this._sweepTextureRefs();
      this._syncOwnerTransformInterest(true);
      let handleDirtyFlags = this._mapOpDirtyFlagsToHandleDirtyFlags(opDirtyFlags);
      if (dirtyStart !== Number.MAX_SAFE_INTEGER && handleDirtyFlags !== GraphicsHandleDirtyFlag.None)
         this._syncGraphicsOpsToHandle(handleDirtyFlags, dirtyStart, dirtyEnd - dirtyStart, hasStructureDirty);
      return true;
   }

   private _refreshCommandOp(cmdIndex: number, runner: GraphicsRunner): boolean {
      let cmd = this.graphics && cmdIndex >= 0 && cmdIndex < this.graphics.cmds.length ? this.graphics.cmds[cmdIndex] : null;
      if (!cmd)
         return false;

      let range = this._commandTracker.getRange(cmdIndex);
      if (!range || !range.active || range.count <= 0)
         return false;
      let opIndex = range.start;

      if (!this._opListBuilder.beginRewriteCommand(cmdIndex, cmd.cmdID, opIndex, range.count))
         return false;

      this._commandTracker.beginLocalCommandRefresh(cmdIndex);
      this._commandOpEncoder.compileCommand(cmd, cmdIndex, runner);
      this._commandTracker.endLocalCommandRefresh();

      if (!this._opListBuilder.finishRewriteCommand())
         return false;

      if (!this._commandTracker.refreshCommandMetadata(cmdIndex, opIndex, opIndex + range.count, cmd, this.owner))
         return false;

      this._commandOps[cmdIndex] = range.count === 1 ? this._opListBuilder.ops[opIndex] : null;
      return true;
   }


   /** @internal */
   _checkDisplay() {
      if (!this.owner || this.owner.destroyed) {
         this._display = false;
         this._setOwnerTransformListener(0);
         return;
      }

      let cmd = this.graphics && this.graphics.cmds && this.graphics.cmds.length > 0;
      let value = !this.owner._renderNode && (cmd || this.owner._texture != null);
      if (this._display === value) {
         this._syncOwnerTransformInterest(false);
         return;
      }

      this._display = value;

      if (value) {
         this._graphicsStateDirty = true;
         this._renderedGraphicsModified = Number.MIN_SAFE_INTEGER;
         this._clearPendingCommandReplacements();
         this.owner._initShaderData();
         this.owner._renderType |= SpriteConst.GRAPHICS;
      } else {
         this.owner._renderType &= ~SpriteConst.GRAPHICS;
         this._graphicsStateDirty = true;
         this._renderedGraphicsModified = Number.MIN_SAFE_INTEGER;
         this._clearPendingCommandReplacements();
      }
      this._syncOwnerTransformInterest(false);
   }

   /** @internal Apply the final Graphics display state to the Struct once per render update. */
   private _syncStructDisplayState(): void {
      if (this._structDisplay === this._display)
         return;

      this._structDisplay = this._display;
      const owner = this.owner;
      const struct = this._struct;
      if (!owner || !struct)
         return;

      if (this._display) {
         struct.renderType = BaseRender2DType.graphics;
         struct.renderDataHandler = this._renderDataHandle;
         owner._updateStruct();
      }
      else if (struct.renderDataHandler === this._renderDataHandle) {
         struct.renderDataHandler = null;
         struct.renderElements = GraphicsRenderer._emptyList;
         struct.renderType = -1;
      }
   }

   clear(): void {
      this._setOwnerTransformListener(0);
   }

   destroy(): void {
      if (this._destroyed)
         return;
      this._destroyed = true;
      this._setOwnerTransformListener(0);

      this._display = false;
      this._syncStructDisplayState();

      this.clear();
      this._opListBuilder.clear();
      this._commandOps.length = 0;

      this.texturesMap.forEach(inf => {
         inf.texture.off(Event.CHANGE, this, this._resourceRepaint);
      });
      this.texturesMap.clear();
      this._recoveringTextureIds.clear();

      this.graphics = null;
      this._renderDataHandle.destroy();
      this._renderDataHandle = null;
      this.owner = null;
   }

   /** @internal Whether this renderer must participate in the current graphics update. */
   get needRenderUpdate(): boolean {
      return this._display || this._structDisplay !== this._display;
   }

   /** @internal */
   _materialChanged(): void {
      this._materialDirty = true;
   }

   private _syncMaterialToHandle(): void {
      let material = this.graphics ? this.graphics.material : null;
      let subShader = material && material.shader && material.shader.getSubShaderAt
         ? material.shader.getSubShaderAt(0)
         : GraphicsOpRenderStateHelper.getDefaultSubShader();
      this._renderDataHandle.setGraphicsMaterialState(subShader, material ? material.shaderData : null, this.graphics._useSpriteState);
      this._graphicsUseSpriteState = this.graphics._useSpriteState;
      this._materialDirty = false;
   }

   private _syncGraphicsOpsToHandle(flags: GraphicsHandleDirtyFlag = GraphicsHandleDirtyFlag.OpPayload | GraphicsHandleDirtyFlag.OpResource | GraphicsHandleDirtyFlag.OpState, opStart: number = 0, opCount: number = this._opListBuilder.opCount, fullSync: boolean = true): void {
      let submitted = this._submitHandleDirty(flags, opStart, opCount);
      if (fullSync || !this._renderDataHandle.autoGraphicsDirtySync) {
         this._renderDataHandle.syncGraphicsOps(this._opListBuilder.ops);
         if (fullSync)
            this._opListBuilder.clearDirty();
         else
            this._opListBuilder.clearDirtyRange(opStart, opCount);
         return;
      }

      if (!submitted)
         return;
      if (fullSync)
         this._opListBuilder.clearDirtyFlagsOnly();
      else
         this._opListBuilder.clearDirtyFlagsOnlyRange(opStart, opCount);
   }

   private _mapOpDirtyFlagsToHandleDirtyFlags(flags: GraphicsOp2DDirtyFlag): GraphicsHandleDirtyFlag {
      if (flags === GraphicsOp2DDirtyFlag.None)
         return GraphicsHandleDirtyFlag.None;
      if ((flags & GraphicsOp2DDirtyFlag.Structure) !== 0)
         return GraphicsHandleDirtyFlag.OpPayload | GraphicsHandleDirtyFlag.OpResource | GraphicsHandleDirtyFlag.OpState;
      let result = GraphicsHandleDirtyFlag.None;
      if ((flags & GraphicsOp2DDirtyFlag.Geometry) !== 0)
         result |= GraphicsHandleDirtyFlag.OpPayload;
      if ((flags & GraphicsOp2DDirtyFlag.Texture) !== 0)
         result |= GraphicsHandleDirtyFlag.OpResource;
      if ((flags & GraphicsOp2DDirtyFlag.State) !== 0)
         result |= GraphicsHandleDirtyFlag.OpState;
      return result;
   }

   private _syncOwnerSize(): void {
      let width = this.owner ? this.owner.width : 0;
      let height = this.owner ? this.owner.height : 0;
      this._handleUpdateFloat32[GraphicsHandleUpdateField.OwnerWidth] = width;
      this._handleUpdateFloat32[GraphicsHandleUpdateField.OwnerHeight] = height;
      this._opListBuilder.setOwnerSize(width, height);
   }

   private _submitHandleDirty(flags: GraphicsHandleDirtyFlag, opStart: number, opCount: number): boolean {
      if (flags === GraphicsHandleDirtyFlag.None)
         return false;
      opStart = Math.max(0, opStart | 0);
      opCount = Math.min(opCount | 0, this._opListBuilder.opCount - opStart);
      if (opCount <= 0)
         return false;

      let updateVersion = this._handleUpdateInt32[GraphicsHandleUpdateField.UpdateVersion];
      if (this._handleUpdateInt32[GraphicsHandleUpdateField.HandledVersion] !== updateVersion) {
         let oldStart = this._handleUpdateInt32[GraphicsHandleUpdateField.DirtyOpStart];
         let oldCount = this._handleUpdateInt32[GraphicsHandleUpdateField.DirtyOpCount];
         if (oldStart >= 0 && oldCount > 0) {
            let oldEnd = oldStart + oldCount;
            let newEnd = opStart + opCount;
            opStart = Math.min(oldStart, opStart);
            opCount = Math.max(oldEnd, newEnd) - opStart;
            flags |= this._handleUpdateInt32[GraphicsHandleUpdateField.DirtyFlags];
         }
      }

      this._handleUpdateInt32[GraphicsHandleUpdateField.UpdateVersion] = updateVersion + 1;
      this._handleUpdateInt32[GraphicsHandleUpdateField.DirtyFlags] = flags;
      this._handleUpdateInt32[GraphicsHandleUpdateField.DirtyOpStart] = opStart;
      this._handleUpdateInt32[GraphicsHandleUpdateField.DirtyOpCount] = opCount;
      return true;
   }

   addResRef(res: Resource) {
      if (res instanceof Texture) {
         if (this._commandTracker.collectDependencies) {
            let inf = this.texturesMap.get(res.id);
            if (!inf) {
               res.on(Event.CHANGE, this, this._resourceRepaint , [res.id]);
               this.texturesMap.set(res.id, {
                  texture: res,
                  bitmap: res.bitmap,
                  time: this._renderedGraphicsModified
               });
            } else {
               inf.bitmap = res.bitmap;
               inf.time = this._renderedGraphicsModified;
            }
         }
         this._commandTracker.addTextureRef(res.id);
      }
   }

   requestTextureRecovery(texture: Texture): void {
      if (this._destroyed || !this.owner || this.owner.destroyed || !texture || texture.destroyed || texture.valid)
         return;
      let bitmap = texture.bitmap;
      if (!bitmap || !bitmap.url || this._recoveringTextureIds.has(texture.id))
         return;

      this._recoveringTextureIds.add(texture.id);
      texture.recoverBitmap(() => {
         this._recoveringTextureIds.delete(texture.id);
         if (!this._destroyed && texture.valid)
            this._scheduleFullRebuild();
      });
   }

   private _hasTextureBitmapChanged(): boolean {
      for (let inf of this.texturesMap.values()) {
         if (inf.bitmap !== inf.texture.bitmap || inf.bitmap?.destroyed)
            return true;
      }
      return false;
   }

   private _sweepTextureRefs(): void {
      this.texturesMap.forEach((inf, id) => {
         if (inf.time === this._renderedGraphicsModified)
            return;
         this.texturesMap.delete(id);
         inf.texture.off(Event.CHANGE, this, this._resourceRepaint);
      });
   }

   private _resourceRepaint(id: number) {
      if (this._destroyed || !this.owner)
         return;

      let inf = this.texturesMap.get(id);
      if (!inf)
         return;

      if (inf.time !== this._renderedGraphicsModified) {
         this.texturesMap.delete(id);
         inf.texture.off(Event.CHANGE, this, this._resourceRepaint);
         return;
      }

      if (!inf.texture.valid) {
         this._scheduleFullRebuild();
         return;
      }

      if (inf.texture === this.owner._texture) {
         this._scheduleFullRebuild();
         return;
      }

      this._refreshCommandRanges(this._commandTracker.getTextureCommandRanges(id), GraphicsInfoDirtyFlag.Texture | GraphicsInfoDirtyFlag.Rebatch);
   }

   private _refreshCommandRanges(cmdIndices: number[], reason: GraphicsInfoDirtyFlag): GraphicsRefreshAction {
      if (!cmdIndices || cmdIndices.length === 0)
         return GraphicsRefreshAction.NoEffect;
      if (this._graphicsStateDirty || !this.graphics || this._renderedGraphicsModified === Number.MIN_SAFE_INTEGER) {
         this._scheduleFullRebuild();
         return GraphicsRefreshAction.StructuralRefresh;
      }

      let action = this._commandTracker.analyzeRefreshRanges(cmdIndices, this.graphics.cmds, reason);
      if (action === GraphicsRefreshAction.NoEffect)
         return action;
      if (action === GraphicsRefreshAction.StructuralRefresh || !this._refreshCommandOps(cmdIndices, Render2DProcessor.runner)) {
         this._scheduleFullRebuild();
         return GraphicsRefreshAction.StructuralRefresh;
      }

      this.owner._struct.setRepaint();
      return GraphicsRefreshAction.LocalRefresh;
   }

   private _invalidateOpBuild(): boolean {
      if (!this.owner || this.owner.destroyed)
         return false;
      this._graphicsStateDirty = true;
      this._renderedGraphicsModified = Number.MIN_SAFE_INTEGER;
      this._clearPendingCommandReplacements();
      this.owner._struct.setRepaint();
      return true;
   }

   private _scheduleFullRebuild(): boolean {
      if (!this._invalidateOpBuild())
         return false;
      this.owner.repaint();
      return true;
   }

}
