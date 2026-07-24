import { IPrimitiveRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { GraphicsInfoDirtyFlag, IGraphicsSingleQuadDataHandle, IGraphicsCommandStreamDataHandle, IRender2DDataHandle } from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRenderStruct2D } from "../../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { Texture } from "../../../resource/Texture";
import { Graphics } from "../../Graphics";
import { Sprite } from "../../Sprite";
import { BaseRender2DType, SpriteConst, TransformKind } from "../../SpriteConst";
import { SpriteGlobalTransform } from "../../SpriteGlobaTransform";
import { Event } from "../../../events/Event";
import { DrawTextureCmd } from "../../cmd/DrawTextureCmd";
import type { IGraphicsCmd } from "../../IGraphics";
import {
	GraphicsHandleDirtyFlag,
	GraphicsHandleUpdateField,
	GraphicsCommandPatchResult,
	GraphicsOp2DDirtyFlag,
	GraphicsOwnerTransformDependency,
	GraphicsRenderMode,
} from "./GraphicsPipelineTypes";
import { GraphicsCommandStreamMode } from "./GraphicsCommandStreamMode";
import { GraphicsRunner } from "../GraphicsRunner";
import { GraphicsOpRenderStateHelper } from "./GraphicsPipelineHelpers";
import { GraphicsSingleQuadMode } from "./GraphicsSingleQuadMode";

/**
 * Graphics render-boundary coordinator.
 *
 * Flow:
 * 1. Classify Empty / SingleQuad / CommandStream from the final frame state.
 * 2. Attach exactly one mode-owned data handle and synchronize shared material/owner data.
 * 3. Let SingleQuad submit its fixed payload, or let CommandStream patch/rewrite/rebuild retained Ops.
 * 4. Commit the submitted mode/version only after its handle has been published.
 *
 * Renderer does not assemble command payloads or own retained Ops.
 * @internal
 */
export class GraphicsRenderer {
   static _emptyList: IPrimitiveRenderElement2D[] = [];
   owner: Sprite;

   _struct: IRenderStruct2D;

   _display: boolean = false;
   /** @internal Whether the current display state has been applied to the render struct. */
   private _structDisplay: boolean = false;

   private _handleControlBuffer: ArrayBuffer = null;
   private _handleControlInt32: Int32Array = null;
   private _handleControlFloat32: Float32Array = null;
   private _commandStreamMode: GraphicsCommandStreamMode = null;
   private _destroyed: boolean = false;
   /** @internal */
   _renderedGraphicsModified: number = Number.MIN_SAFE_INTEGER;
   /** @internal */
   _graphicsStateDirty: boolean = true;
   private _materialDirty: boolean = true;
   private _graphicsUseSpriteState: boolean = true;
   private _recoveringTextureIds: Set<number> = null;
   private _ownerTransformMask: number = 0;
   private _renderMode: GraphicsRenderMode = GraphicsRenderMode.Empty;
   private _singleQuadMode: GraphicsSingleQuadMode = null;
   private _ownerSizePatchPending: boolean = false;
   graphics: Graphics = null;

   constructor(owner: Sprite) {
      this._destroyed = false;
      this.owner = owner;
      this._struct = owner._struct;
   }

   private _invalidateSubmittedState(): void {
      this._graphicsStateDirty = true;
      this._renderedGraphicsModified = Number.MIN_SAFE_INTEGER;
      this._clearPendingCommandChanges();
   }

   private _isCommittedStateStable(graphicsModified: number, useSpriteState: boolean): boolean {
      let handle = this._struct && this._struct.renderDataHandler;
      if (!this._display || !handle)
         return false;
      if (this._graphicsStateDirty || this._materialDirty || this._ownerSizePatchPending)
         return false;
      if (this._renderedGraphicsModified !== graphicsModified
         || this._graphicsUseSpriteState !== useSpriteState
         || this._structDisplay !== this._display
         || this._struct.renderType !== BaseRender2DType.graphics)
         return false;
      if (this._renderMode === GraphicsRenderMode.SingleQuad)
         return !!this._singleQuadMode && handle === this._singleQuadMode.getDataHandle();
      if (this._renderMode === GraphicsRenderMode.CommandStream)
         return !!this._commandStreamMode
            && handle === this._commandStreamMode.getDataHandle()
            && !this._commandStreamMode.hasPendingUpdates();
      return false;
   }

   private _tryCommitStable(graphicsModified: number, useSpriteState: boolean): boolean {
      if (!this._isCommittedStateStable(graphicsModified, useSpriteState))
         return false;
      return true;
   }

   private _ensureHandleControlBuffer(): ArrayBuffer {
      if (this._handleControlBuffer)
         return this._handleControlBuffer;

      let buffer = new ArrayBuffer(GraphicsHandleUpdateField.WordCount * 4);
      this._handleControlBuffer = buffer;
      this._handleControlInt32 = new Int32Array(buffer);
      this._handleControlFloat32 = new Float32Array(buffer);
      return buffer;
   }

   private _ensureSingleQuadMode(): GraphicsSingleQuadMode {
      if (!this._singleQuadMode)
         this._singleQuadMode = new GraphicsSingleQuadMode(this, this._ensureHandleControlBuffer());
      return this._singleQuadMode;
   }

   private _ensureCommandStreamMode(): GraphicsCommandStreamMode {
      if (this._commandStreamMode)
         return this._commandStreamMode;

      this._commandStreamMode = new GraphicsCommandStreamMode(this, this._ensureHandleControlBuffer());
      return this._commandStreamMode;
   }

   /** @internal */
   private _onOwnerTransformChanged(type : number) {
      let maskedType = type & this._ownerTransformMask;
      if (maskedType === 0 || this._destroyed || !this.owner || !this.owner._struct)
         return;

      if ((maskedType & TransformKind.Size) !== 0)
         this._handleOwnerSizeChanged();
      if (!this._display || !this.owner._struct.enabled)
         return;
      if ((maskedType & TransformKind.Scale) !== 0)
         this._handleOwnerScaleChanged();
   }

   private _onOwnerDemandTransformChanged(): void {
      if (this._destroyed || !this.owner || !this.owner._struct || !this._display || !this.owner._struct.enabled)
         return;
      this._handleOwnerScaleChanged();
   }

   private _handleOwnerSizeChanged(): void {
      this.graphics?._ownerSizeChanged();
      if (this._ownerSizePatchPending) {
         return;
      }
      this._ownerSizePatchPending = true;
      this.owner.repaint();
   }

   private _flushOwnerSizeChange(): void {
      if (!this._ownerSizePatchPending)
         return;
      this._ownerSizePatchPending = false;
      this._syncGraphicsOwnerSize();

      if (this._graphicsStateDirty)
         return;

      if (this._renderMode === GraphicsRenderMode.SingleQuad && this._singleQuadMode && this._singleQuadMode.getDependsOnSize()) {
         if (this._singleQuadMode.syncSizeChange())
            this.owner._struct.setRepaint();
         return;
      }

      if (this.owner && this.owner._texture) {
         if (this._renderMode !== GraphicsRenderMode.CommandStream
            || !this._commandStreamMode
            || !this._commandStreamMode.patchSpriteTextureRetained()) {
            this._scheduleGraphicsFullRebuild();
            return;
         }
      }

      if (!this.graphics)
         return;

      let mode = this._commandStreamMode;
      if (!mode)
         return;
      let sizeDirtyCommands = mode.getSizeDirtyCommands();
      if (sizeDirtyCommands.length > 0)
         mode.refreshCommandRanges(sizeDirtyCommands, GraphicsInfoDirtyFlag.Layout | GraphicsInfoDirtyFlag.Rebatch);
   }

   private _handleOwnerScaleChanged(): void {
      if (this._renderMode !== GraphicsRenderMode.CommandStream || this._graphicsStateDirty || !this.graphics || !this._commandStreamMode) {
         return;
      }

      let scaleDirtyCmds = this._commandStreamMode.getScaleTessellationDirtyCommands(this.graphics.cmds, this.owner);
      if (scaleDirtyCmds.length > 0)
         this._commandStreamMode.refreshCommandRanges(scaleDirtyCmds, GraphicsInfoDirtyFlag.Layout | GraphicsInfoDirtyFlag.Rebatch);
   }

   /** @internal Shared owner-transform subscription boundary. */
   _syncGraphicsOwnerTransformInterest(useRenderedCommandSummary: boolean): void {
      let transformMask = 0;
      if (this._display && this.owner && !this.owner.destroyed) {
         let dependencyMask = GraphicsOwnerTransformDependency.None;
         if (this._renderMode === GraphicsRenderMode.CommandStream && this._commandStreamMode) {
            dependencyMask = useRenderedCommandSummary
               ? this._commandStreamMode.getOwnerTransformDependencyMask()
               : this._commandStreamMode.collectOwnerTransformDependencyMask(this.graphics ? this.graphics.cmds : null, this.owner);
         }
         if (this.owner._texture)
            dependencyMask |= GraphicsOwnerTransformDependency.SpriteTextureSize;
         if (this._renderMode === GraphicsRenderMode.SingleQuad && this._singleQuadMode && this._singleQuadMode.getDependsOnSize())
            dependencyMask |= GraphicsOwnerTransformDependency.SizeLayout;
         if ((dependencyMask & (GraphicsOwnerTransformDependency.SizeLayout | GraphicsOwnerTransformDependency.SpriteTextureSize)) !== 0)
            transformMask |= TransformKind.Size;
         if ((dependencyMask & GraphicsOwnerTransformDependency.ScaleTessellation) !== 0)
            transformMask |= TransformKind.Scale;
      }
      this._setOwnerTransformListener(transformMask);
   }

   private _setOwnerTransformListener(transformMask: number): void {
      if (this._ownerTransformMask === transformMask)
         return;

      let owner = this.owner;
      let oldMask = this._ownerTransformMask;
      if (oldMask !== 0 && owner) {
         if ((oldMask & TransformKind.Size) !== 0)
            owner.off(SpriteGlobalTransform.SIZE_CHANGED, this, this._onOwnerTransformChanged);
         if ((oldMask & TransformKind.Scale) !== 0) {
            owner.off(Event.TRANSFORM_CHANGED, this, this._onOwnerDemandTransformChanged);
            owner._refreshDemandTransEventUp();
         }
      }

      this._ownerTransformMask = transformMask;
      if (transformMask !== 0 && owner && !this._destroyed) {
         if ((transformMask & TransformKind.Size) !== 0)
            owner.on(SpriteGlobalTransform.SIZE_CHANGED, this, this._onOwnerTransformChanged);
         if ((transformMask & TransformKind.Scale) !== 0) {
            owner.on(Event.TRANSFORM_CHANGED, this, this._onOwnerDemandTransformChanged);
            owner._setDemandTransEvent();
         }
      }
   }

   /**
    * 设置Graphics对象
    * @param graphics Graphics对象
    */
   setGraphics(graphics: Graphics): void {
      if (this.graphics !== graphics) {
         this._materialDirty = true;
         this._invalidateSubmittedState();
      }
      this.graphics = graphics;
      this._checkDisplay();
      this._syncGraphicsOwnerTransformInterest(false);
   }

   /**
     * @internal
     */
   _render(runner: GraphicsRunner): void {
      if (!this.owner || this.owner.destroyed || (!this.graphics && !this.owner._texture))
         return;

      // Resolve the final mode only at the render boundary. This preserves a
      // clear + redraw retained replacement as one command mutation.
      this._checkDisplay();
      if (!this._display) {
         this._syncStructDisplayState();
         return;
      }

      let graphicsModified = this.graphics ? this.graphics._modified : 0;
      let useSpriteState = this.graphics ? this.graphics._useSpriteState : true;
      if (this._tryCommitStable(graphicsModified, useSpriteState))
         return;

      this._syncStructDisplayState();
      this.owner._initShaderData();
      this._flushOwnerSizeChange();
      if (this._materialDirty || this._graphicsUseSpriteState !== useSpriteState)
         this._syncMaterialToHandle();

      // Material/owner-size may have been the only pending work.
      if (this._tryCommitStable(graphicsModified, useSpriteState))
         return;

      if (this._renderMode === GraphicsRenderMode.SingleQuad
         && this._renderSingleQuad(graphicsModified, useSpriteState))
         return;
      this._renderCommandStream(runner, graphicsModified, useSpriteState);
   }

   /** SingleQuad owns payload assembly and one direct handle sync. */
   private _renderSingleQuad(graphicsModified: number, useSpriteState: boolean): boolean {
      let mode = this._ensureSingleQuadMode();
      this._activateRenderDataHandle(mode.getDataHandle());
      if (!mode.render(this.graphics))
         return false;

      this._renderedGraphicsModified = graphicsModified;
      this._graphicsStateDirty = false;
      this._clearPendingCommandChanges();
      if (this._commandStreamMode)
         this._commandStreamMode.clearTextureDependencies();
      this._syncGraphicsOwnerTransformInterest(true);
      this._tryCommitStable(graphicsModified, useSpriteState);
      return true;
   }

   /** CommandStream owns retained patch/rewrite/rebuild; Renderer only selects the transaction. */
   private _renderCommandStream(runner: GraphicsRunner, graphicsModified: number, useSpriteState: boolean): void {
      let mode = this._ensureCommandStreamMode();
      this._activateRenderDataHandle(mode.getDataHandle());

      if (mode.consumeSpriteTexturePatch())
         this._spriteTextureChanged();

      if (!this._graphicsStateDirty && !mode.refreshPendingCommandReplacements(runner))
         this._invalidateOpBuild();

      if (!this._graphicsStateDirty
         && this._renderedGraphicsModified === graphicsModified
         && this._tryCommitStable(graphicsModified, useSpriteState))
         return;

      this._renderedGraphicsModified = graphicsModified;
      this._graphicsStateDirty = false;
      mode.rebuild(runner);
      if (this._singleQuadMode)
         this._singleQuadMode.clear();
      this._tryCommitStable(graphicsModified, useSpriteState);
   }

   /** @internal */
   _patchTextureQuadCommand(cmdIndex: number, oldCmd: DrawTextureCmd, newCmd: DrawTextureCmd): GraphicsCommandPatchResult {
      return this._commandStreamMode
         ? this._commandStreamMode.patchTextureQuadCommand(cmdIndex, oldCmd, newCmd)
         : GraphicsCommandPatchResult.Failed;
   }
   /** @internal */
   _preRegisterTextureQuadCommands(cmds: ReadonlyArray<DrawTextureCmd> | null): void {
      if (!cmds)
         return;
      for (let i = 0, n = cmds.length; i < n; i++) {
         let texture = cmds[i] && cmds[i].texture;
         if (texture && !texture.valid)
            this.requestTextureRecovery(texture);
      }
   }

   /**
    * @internal
    */
   invalidateGraphicsState(){
      if (this._commandStreamMode)
         this._commandStreamMode.consumeSpriteTexturePatch();
      this._invalidateSubmittedState();
      this._syncGraphicsOwnerTransformInterest(false);
   }

   /** @internal Sprite.texture changed; returns true when the current render state was patched in place. */
   _spriteTextureChanged(): boolean {
      let previousMode = this._renderMode;
      this._checkDisplay();
      if (previousMode === GraphicsRenderMode.CommandStream
         && this._renderMode === GraphicsRenderMode.CommandStream
         && this.owner._texture
         && this._commandStreamMode
         && this._commandStreamMode.patchSpriteTextureRetained())
         return true;

      this.invalidateGraphicsState();
      if (this._renderMode === GraphicsRenderMode.SingleQuad && this.owner._texture) {
         this._ensureSingleQuadMode().trackTexture(this.owner._texture);
         if (this._commandStreamMode)
            this._commandStreamMode.clearTextureDependencies();
      }
      else if (this._renderMode === GraphicsRenderMode.CommandStream) {
         if (!this.owner._texture && this._commandStreamMode)
            this._commandStreamMode.clearSpriteTextureDependency();
      }
      else {
         if (this._singleQuadMode)
            this._singleQuadMode.clear();
         if (this._commandStreamMode)
            this._commandStreamMode.clearTextureDependencies();
      }
      return false;
   }

   /** @internal */
   _queueCommandReplacement(cmdIndex: number, oldCmd: IGraphicsCmd, newCmd: IGraphicsCmd): boolean {
      if (!this._commandStreamMode)
         return false;
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

      let range = this._commandStreamMode.getRange(cmdIndex);
      if (!range)
         return false;
      let isStateCommand = this._commandStreamMode.isStateCommand(cmdIndex);
      if (isStateCommand && !this._commandStreamMode.isStateCommandType(newCmd, this.owner))
         return false;
      if (!isStateCommand && (!range.active || range.count <= 0))
         return false;

      this._commandStreamMode.queueCommandReplacement(cmdIndex);
      return true;
   }

   /** @internal Retains shifted command ranges for one add/remove before the next render. */
   _queueCommandSplice(cmdIndex: number, removedCount: number, addedCount: number): boolean {
      if (!this._commandStreamMode || this._renderMode !== GraphicsRenderMode.CommandStream
         || this._graphicsStateDirty || this._renderedGraphicsModified === Number.MIN_SAFE_INTEGER || !this.graphics)
         return false;
      return this._commandStreamMode.queueCommandSplice(cmdIndex, removedCount, addedCount);
   }

   private _clearPendingCommandChanges(): void {
      if (this._commandStreamMode)
         this._commandStreamMode.clearPendingCommandChanges();
   }

   /** @internal */
   _checkDisplay() {
      if (!this.owner || this.owner.destroyed) {
         this._display = false;
         this._setOwnerTransformListener(0);
         return;
      }

      let nextMode = this._classifyRenderMode();
      let modeChanged = this._renderMode !== nextMode;
      if (modeChanged) {
         this._renderMode = nextMode;
         this._invalidateSubmittedState();
         if (nextMode === GraphicsRenderMode.Empty) {
            if (this._singleQuadMode)
               this._singleQuadMode.clear();
            if (this._commandStreamMode)
               this._commandStreamMode.clearTextureDependencies();
         }
      }

      let value = !this.owner._renderNode && nextMode !== GraphicsRenderMode.Empty;
      if (this._display === value) {
         if (modeChanged)
            this._syncGraphicsOwnerTransformInterest(false);
         return;
      }

      this._display = value;
      this._invalidateSubmittedState();
      if (value)
         this.owner._renderType |= SpriteConst.GRAPHICS;
      else
         this.owner._renderType &= ~SpriteConst.GRAPHICS;
      this._syncGraphicsOwnerTransformInterest(false);
   }

   private _classifyRenderMode(): GraphicsRenderMode {
      let spriteTexture = this.owner._texture;
      let commandCount = this.graphics && this.graphics.cmds ? this.graphics.cmds.length : 0;
      if (!spriteTexture && commandCount === 0)
         return GraphicsRenderMode.Empty;
      return GraphicsSingleQuadMode.canRender(spriteTexture, this.graphics)
         ? GraphicsRenderMode.SingleQuad
         : GraphicsRenderMode.CommandStream;
   }

   private _deactivateRenderDataHandle(handle: IRender2DDataHandle): void {
      if (this._singleQuadMode && handle === this._singleQuadMode.getDataHandle())
         this._singleQuadMode.deactivate();
      else if (this._commandStreamMode && handle === this._commandStreamMode.getDataHandle())
         this._commandStreamMode.deactivate();
   }

   private _activateRenderDataHandle(handle: IRender2DDataHandle): void {
      let struct = this._struct;
      if (!handle || !struct)
         return;
      let current = struct.renderDataHandler;
      if (current === handle)
         return;
      if (current)
         this._deactivateRenderDataHandle(current);
      this._materialDirty = true;
      struct.renderDataHandler = handle;
   }

   /** @internal Apply the final Graphics display state to the Struct once per render update. */
   private _syncStructDisplayState(): void {
      const owner = this.owner;
      const struct = this._struct;
      if (!owner || !struct)
         return;

      if (this._display) {
         let handle = this._renderMode === GraphicsRenderMode.SingleQuad
            ? this._ensureSingleQuadMode().getDataHandle()
            : this._ensureCommandStreamMode().getDataHandle();
         if (this._structDisplay === this._display
            && struct.renderType === BaseRender2DType.graphics
            && struct.renderDataHandler === handle)
            return;
         let firstAttach = !this._structDisplay;
         this._structDisplay = true;
         struct.renderType = BaseRender2DType.graphics;
         this._activateRenderDataHandle(handle);
         if (firstAttach)
            owner._updateStruct();
      }
      else {
         let handle = struct.renderDataHandler;
         if (!this._structDisplay && !handle)
            return;
         this._structDisplay = false;
         if (handle)
            this._deactivateRenderDataHandle(handle);
         struct.renderDataHandler = null;
         struct.renderElements = GraphicsRenderer._emptyList;
         struct.renderType = -1;
      }
   }

   destroy(): void {
      if (this._destroyed)
         return;
      this._destroyed = true;
      this._setOwnerTransformListener(0);

      this._display = false;
      this._syncStructDisplayState();

      if (this._commandStreamMode)
         this._commandStreamMode.destroy();
      if (this._recoveringTextureIds)
         this._recoveringTextureIds.clear();
      if (this._singleQuadMode)
         this._singleQuadMode.destroy();

      this.graphics = null;
      this._handleControlBuffer = null;
      this._handleControlInt32 = null;
      this._handleControlFloat32 = null;
      this._singleQuadMode = null;
      this._ownerSizePatchPending = false;
      this._commandStreamMode = null;
      this._recoveringTextureIds = null;
      this.owner = null;
   }

   /** @internal Whether this renderer must participate in the current graphics update. */
   getNeedRenderUpdate(): boolean {
      return this._display || this._structDisplay !== this._display;
   }

   /** @internal */
   _materialChanged(): void {
      this._materialDirty = true;
   }

   private _syncMaterialToHandle(handle: IGraphicsSingleQuadDataHandle | IGraphicsCommandStreamDataHandle =
      (this._struct ? this._struct.renderDataHandler : null) as IGraphicsSingleQuadDataHandle | IGraphicsCommandStreamDataHandle): void {
      if (!handle)
         return;
      let material = this.graphics ? this.graphics.material : null;
      let useSpriteState = this.graphics ? this.graphics._useSpriteState : true;
      let subShader = material
         ? material.shader.getSubShaderAt(0)
         : GraphicsOpRenderStateHelper.getDefaultSubShader();
      handle.setGraphicsMaterialState(subShader, material ? material.shaderData : null, useSpriteState);
      this._graphicsUseSpriteState = useSpriteState;
      this._materialDirty = false;
   }

   /** @internal CommandStream submit boundary. */
   _syncGraphicsOps(flags: GraphicsHandleDirtyFlag = GraphicsHandleDirtyFlag.OpPayload | GraphicsHandleDirtyFlag.OpResource | GraphicsHandleDirtyFlag.OpState, opStart: number = 0, opCount: number = -1, fullSync: boolean = true, topologyChanged: boolean = fullSync): void {
      let mode = this._ensureCommandStreamMode();
      let handle = mode.getDataHandle();
      if (opCount < 0)
         opCount = mode.ops.length;
      this._activateRenderDataHandle(handle);
      let useSpriteState = this.graphics ? this.graphics._useSpriteState : true;
      if (this._materialDirty || this._graphicsUseSpriteState !== useSpriteState)
         this._syncMaterialToHandle(handle);
      let submitted = this._submitHandleDirty(flags, opStart, opCount, topologyChanged);
      if (topologyChanged || !handle.autoGraphicsDirtySync) {
         handle.syncGraphicsOps(mode.ops);
         if (fullSync)
            mode.clearDirty();
         else
            mode.clearDirty(opStart, opCount);
         return;
      }

      if (!submitted)
         return;
      if (fullSync)
         mode.clearDirtyFlagsOnly();
      else
         mode.clearDirtyFlagsOnly(opStart, opCount);
   }

   /** @internal CommandStream update boundary. */
   _mapGraphicsOpDirtyFlags(flags: GraphicsOp2DDirtyFlag): GraphicsHandleDirtyFlag {
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

   /** @internal Shared mode boundary. */
   _syncGraphicsOwnerSize(): void {
      let width = this.owner ? this.owner.width : 0;
      let height = this.owner ? this.owner.height : 0;
      if (this._handleControlFloat32) {
         this._handleControlFloat32[GraphicsHandleUpdateField.OwnerWidth] = width;
         this._handleControlFloat32[GraphicsHandleUpdateField.OwnerHeight] = height;
      }
   }

   private _submitHandleDirty(flags: GraphicsHandleDirtyFlag, opStart: number, opCount: number, topologyChanged: boolean): boolean {
      if (flags === GraphicsHandleDirtyFlag.None && !topologyChanged)
         return false;
      opStart = Math.max(0, opStart | 0);
      opCount = Math.max(0, Math.min(opCount | 0, this._commandStreamMode.ops.length - opStart));
      if (opCount <= 0 && !topologyChanged)
         return false;

      let updateVersion = this._handleControlInt32[GraphicsHandleUpdateField.UpdateVersion];
      if (this._handleControlInt32[GraphicsHandleUpdateField.HandledVersion] !== updateVersion) {
         let oldStart = this._handleControlInt32[GraphicsHandleUpdateField.DirtyOpStart];
         let oldCount = this._handleControlInt32[GraphicsHandleUpdateField.DirtyOpCount];
         if (oldStart >= 0 && oldCount > 0) {
            let oldEnd = oldStart + oldCount;
            let newEnd = opStart + opCount;
            opStart = Math.min(oldStart, opStart);
            opCount = Math.max(oldEnd, newEnd) - opStart;
            flags |= this._handleControlInt32[GraphicsHandleUpdateField.DirtyFlags];
         }
      }

      this._handleControlInt32[GraphicsHandleUpdateField.DirtyFlags] = flags;
      this._handleControlInt32[GraphicsHandleUpdateField.DirtyOpStart] = opStart;
      this._handleControlInt32[GraphicsHandleUpdateField.DirtyOpCount] = opCount;
      if (topologyChanged)
         this._handleControlInt32[GraphicsHandleUpdateField.TopologyVersion]++;
      // Publish last so every consumer observes a complete metadata snapshot.
      this._handleControlInt32[GraphicsHandleUpdateField.UpdateVersion] = updateVersion + 1;
      return true;
   }

   requestTextureRecovery(texture: Texture): void {
      if (this._destroyed || !this.owner || this.owner.destroyed || !texture || texture.destroyed || texture.valid)
         return;
      let bitmap = texture.bitmap;
      if (!bitmap || !bitmap.url || (this._recoveringTextureIds && this._recoveringTextureIds.has(texture.id)))
         return;

      if (!this._recoveringTextureIds) {
         this._recoveringTextureIds = new Set();
      }
      this._recoveringTextureIds.add(texture.id);
      texture.recoverBitmap(() => {
         if (this._recoveringTextureIds)
            this._recoveringTextureIds.delete(texture.id);
         if (!this._destroyed && texture.valid)
            this._scheduleGraphicsFullRebuild();
      });
   }

   private _invalidateOpBuild(): boolean {
      if (!this.owner || this.owner.destroyed)
         return false;
      this._invalidateSubmittedState();
      this.owner._struct.setRepaint();
      return true;
   }

   /** @internal CommandStream rebuild boundary. */
   _scheduleGraphicsFullRebuild(): boolean {
      if (!this._invalidateOpBuild())
         return false;
      this.owner.repaint();
      return true;
   }

}
