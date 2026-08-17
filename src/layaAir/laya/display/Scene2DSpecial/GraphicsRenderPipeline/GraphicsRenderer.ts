import { IPrimitiveRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IGraphicsCommandStreamDataHandle, IGraphicsSingleQuadDataHandle, IRender2DDataHandle } from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRenderStruct2D } from "../../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { Texture } from "../../../resource/Texture";
import { Graphics } from "../../Graphics";
import { Sprite } from "../../Sprite";
import { BaseRender2DType, SpriteConst, TransformKind } from "../../SpriteConst";
import { SpriteGlobalTransform } from "../../SpriteGlobaTransform";
import { DrawTextureCmd } from "../../cmd/DrawTextureCmd";
import { GraphicsRunner } from "../GraphicsRunner";
import { GraphicsCommandStreamMode } from "./GraphicsCommandStreamMode";
import { GraphicsOpRenderStateHelper } from "./GraphicsPipelineHelpers";
import { GraphicsCommandPatchResult, GraphicsHandleDirtyFlag, GraphicsHandleUpdateField, GraphicsOp2DDirtyFlag, GraphicsOwnerTransformDependency, GraphicsRenderMode, GraphicsSingleQuadKind, RendererDirty } from "./GraphicsPipelineTypes";
import { GraphicsSingleQuadMode } from "./GraphicsSingleQuadMode";
/** Selects one retained mode and publishes its already compiled data. @internal */
export class GraphicsRenderer {
   static _emptyList: IPrimitiveRenderElement2D[] = [];
   owner: Sprite;
   graphics: Graphics = null;
   _struct: IRenderStruct2D;
   private _dirty: RendererDirty = RendererDirty.ModeContentMaterialRebuild;
   private _mode: GraphicsRenderMode = GraphicsRenderMode.Empty;
   private _singleKind: GraphicsSingleQuadKind | 0 = 0;
   private _hasSpriteTexture: boolean = false;
   private _activeHandle: IRender2DDataHandle = null;
   private _singleMode: GraphicsSingleQuadMode = null;
   private _streamMode: GraphicsCommandStreamMode = null;
   private _handleBuffer: ArrayBuffer = null;
   private _handleInt32: Int32Array = null;
   private _handleFloat32: Float32Array = null;
   private _transformMask: number = 0;
   private _recoveringTextureIds: Set<number> = new Set();
   private _destroyed: boolean = false;
   constructor(owner: Sprite) {
      this.owner = owner;
      this._struct = owner._struct;
      this._handleBuffer = new ArrayBuffer(GraphicsHandleUpdateField.WordCount * 4);
      this._handleInt32 = new Int32Array(this._handleBuffer);
      this._handleFloat32 = new Float32Array(this._handleBuffer);
   }
   setGraphics(graphics: Graphics): void {
      if (this.graphics === graphics)
         return;
      this.graphics = graphics;
      this._mark(RendererDirty.ModeContentMaterialRebuild);
   }
   _checkDisplay(): void {
      this._mark(RendererDirty.Mode);
   }
   invalidateGraphicsState(): void {
      this._mark(RendererDirty.ModeContentRebuild);
   }
   _materialChanged(): void {
      this._dirty |= RendererDirty.Material;
   }
   _commandsChanged(removedCount: number, addedCount: number): void {
      let sameCount = removedCount === addedCount;
      let modeDirty = !sameCount || !this.graphics || this.graphics.cmds.length <= 1;
      this._mark(modeDirty ? RendererDirty.ModeContentRebuild : RendererDirty.ContentRebuild);
   }
   private _mark(flags: RendererDirty): void {
      this._dirty |= flags;
      if (!this.owner._renderNode)
         this.owner._renderType |= SpriteConst.GRAPHICS;
   }
   _spriteTextureChanged(): boolean {
      let hasTexture = !!this.owner._texture;
      let modeChanged = hasTexture !== this._hasSpriteTexture;
      let canPatch = !modeChanged && this._dirty === RendererDirty.None && ((this._mode === GraphicsRenderMode.SingleQuad)
         || this._mode === GraphicsRenderMode.CommandStream);
      this._mark(modeChanged ? RendererDirty.SpriteTextureModeRebuild
         : canPatch ? RendererDirty.SpriteTexturePatch : RendererDirty.SpriteTextureRebuild);
      return canPatch;
   }
   _scheduleGraphicsRebuild(): boolean {
      this._mark(RendererDirty.ContentRebuild);
      this.owner._struct.setRepaint();
      this.owner.repaint();
      return true;
   }
   _scheduleGraphicsPayloadUpdate(): boolean {
      this._mark(RendererDirty.Content);
      this.owner._struct.setRepaint();
      this.owner.repaint();
      return true;
   }
   private _ensureSingle(): GraphicsSingleQuadMode {
      return this._singleMode || (this._singleMode = new GraphicsSingleQuadMode(this, this._handleBuffer));
   }
   private _ensureStream(): GraphicsCommandStreamMode {
      return this._streamMode || (this._streamMode = new GraphicsCommandStreamMode(this, this._handleBuffer));
   }
   private _resolveMode(): void {
      let owner = this.owner;
      let commandCount = this.graphics ? this.graphics.cmds.length : 0;
      let next = GraphicsRenderMode.Empty;
      let kind: GraphicsSingleQuadKind | 0 = 0;
      this._hasSpriteTexture = !!owner._texture;
      if (!owner._renderNode && (owner._texture || commandCount > 0)) {
         kind = GraphicsSingleQuadMode.classify(owner._texture, this.graphics);
         next = kind ? GraphicsRenderMode.SingleQuad : GraphicsRenderMode.CommandStream;
      }
      this._singleKind = kind;
      if (next !== this._mode)
         this._switchMode(next);
      this._dirty &= ~RendererDirty.Mode;
   }
   private _switchMode(next: GraphicsRenderMode): void {
      this._deactivateCurrentMode();
      this._handleInt32[GraphicsHandleUpdateField.DirtyFlags] = GraphicsHandleDirtyFlag.None;
      if (next === GraphicsRenderMode.SingleQuad) {
         this._activeHandle = this._ensureSingle().getDataHandle();
      } else if (next === GraphicsRenderMode.CommandStream) {
         this._activeHandle = this._ensureStream().getDataHandle();
      } else {
         this._activeHandle = null;
      }
      this._mode = next;
      this._dirty |= RendererDirty.ContentMaterialRebuild;
      let struct = this._struct;
      if (next === GraphicsRenderMode.Empty) {
         struct.renderDataHandler = null;
         struct.renderElements = GraphicsRenderer._emptyList;
         struct.renderType = -1;
         this.owner._renderType &= ~SpriteConst.GRAPHICS;
         return;
      }
      let firstAttach = !struct.renderDataHandler;
      struct.renderDataHandler = this._activeHandle;
      struct.renderType = BaseRender2DType.graphics;
      this.owner._renderType |= SpriteConst.GRAPHICS;
      if (firstAttach)
         this.owner._updateStruct();
   }
   private _deactivateCurrentMode(): void {
      if (this._mode === GraphicsRenderMode.SingleQuad) {
         this._singleMode.deactivate();
         this._singleMode.clear();
      } else if (this._mode === GraphicsRenderMode.CommandStream) {
         this._streamMode.deactivate();
         this._streamMode.clear(true);
      }
   }
   _render(runner: GraphicsRunner): void {
      if (this._destroyed || this._dirty === RendererDirty.None)
         return;
      if ((this._dirty & RendererDirty.Mode) !== 0)
         this._resolveMode();
      if (this._mode === GraphicsRenderMode.Empty) {
         this._dirty = RendererDirty.None;
         this.graphics?._commandsCommitted();
         this._syncTransformInterest();
         return;
      }
      this.owner._initShaderData();
      if ((this._dirty & RendererDirty.Size) !== 0)
         this._applySizeChange();
      if ((this._dirty & RendererDirty.Material) !== 0)
         this._syncMaterial();
      if (this._mode === GraphicsRenderMode.SingleQuad) {
         if ((this._dirty & RendererDirty.SingleRender) !== 0)
            this._singleMode.render(this.graphics, this._singleKind as GraphicsSingleQuadKind);
      } else if ((this._dirty & RendererDirty.StreamRender) !== 0) {
         let stream = this._streamMode;
         let patched = (this._dirty & RendererDirty.Rebuild) === 0
            && (this._dirty & RendererDirty.SpriteTexture) !== 0
            && stream.patchSpriteTexture();
         if (!patched)
            stream.rebuild(runner);
      }
      this._dirty = RendererDirty.None;
      this.graphics?._commandsCommitted();
      this._syncTransformInterest();
   }
   private _applySizeChange(): void {
      let ownerSizeChanged = this._syncGraphicsOwnerSize();
      if (ownerSizeChanged && this._mode === GraphicsRenderMode.SingleQuad
         && this._singleMode.getDependsOnSize())
         this._publishSingleQuadInputs(GraphicsHandleDirtyFlag.OwnerSize);
      if (this._mode === GraphicsRenderMode.CommandStream) {
         if (this.owner._texture || (this.graphics && this.graphics.getLayoutRepaintCount() > 0))
            this._dirty |= RendererDirty.Rebuild;
      }
   }
   /** @internal Owner size is local layout data and does not participate in the SoA world-matrix event. */
   _ownerSizeChanged(): void {
      if ((this._transformMask & TransformKind.Size) === 0)
         return;
      this.graphics?._ownerSizeChanged();
      this._dirty |= RendererDirty.SizeContent;
      this.owner.repaint();
   }
   private _onOwnerWorldTransformChanged(): void {
      this._mark(RendererDirty.ContentRebuild);
      this.owner.repaint();
   }
   private _syncTransformInterest(): void {
      let mask = 0;
      if (this._mode === GraphicsRenderMode.SingleQuad && this._singleMode.getDependsOnSize())
         mask = TransformKind.Size;
      else if (this._mode === GraphicsRenderMode.CommandStream) {
         let dependency = this._streamMode.getOwnerTransformDependencyMask();
         if (this.owner._texture || (dependency & GraphicsOwnerTransformDependency.SizeLayout) !== 0)
            mask |= TransformKind.Size;
         if ((dependency & GraphicsOwnerTransformDependency.ScaleTessellation) !== 0)
            mask |= TransformKind.Scale;
      }
      if (mask === this._transformMask)
         return;
      let oldScaleInterest = (this._transformMask & TransformKind.Scale) !== 0;
      let newScaleInterest = (mask & TransformKind.Scale) !== 0;
      if (oldScaleInterest && !newScaleInterest)
         this.owner.off(SpriteGlobalTransform.CHANGED, this, this._onOwnerWorldTransformChanged);
      this._transformMask = mask;
      if (!oldScaleInterest && newScaleInterest)
         this.owner.on(SpriteGlobalTransform.CHANGED, this, this._onOwnerWorldTransformChanged);
   }
   _patchTextureQuadCommand(binding: any, oldCmd: DrawTextureCmd, newCmd: DrawTextureCmd): GraphicsCommandPatchResult {
      if (this._dirty !== RendererDirty.None || !binding || binding.graphics !== this.graphics)
         return GraphicsCommandPatchResult.Failed;
      if (this._mode === GraphicsRenderMode.SingleQuad)
         return this._singleMode.patchFrameAnimation(newCmd);
      return this._mode === GraphicsRenderMode.CommandStream
         ? this._streamMode.patchFrameAnimation(binding, oldCmd, newCmd)
         : GraphicsCommandPatchResult.Failed;
   }
   _preRegisterTextureQuadCommands(cmds: ReadonlyArray<DrawTextureCmd> | null): void {
      for (let i = 0, n = cmds ? cmds.length : 0; i < n; i++) {
         let texture = cmds[i].texture;
         if (texture && !texture.valid)
            this.requestTextureRecovery(texture);
      }
   }
   getNeedRenderUpdate(): boolean {
      return !this._destroyed && this._dirty !== RendererDirty.None;
   }
   private _syncMaterial(): void {
      let handle = this._activeHandle as IGraphicsSingleQuadDataHandle | IGraphicsCommandStreamDataHandle;
      let material = this.graphics ? this.graphics.material : null;
      let useSpriteState = this.graphics ? this.graphics._useSpriteState : true;
      let subShader = material ? material.shader.getSubShaderAt(0) : GraphicsOpRenderStateHelper.getDefaultSubShader();
      handle.setGraphicsMaterialState(subShader, material ? material.shaderData : null, useSpriteState);
      this._dirty &= ~RendererDirty.Material;
   }
   _syncGraphicsOwnerSize(): boolean {
      let oldWidth = this._handleFloat32[GraphicsHandleUpdateField.OwnerWidth];
      let oldHeight = this._handleFloat32[GraphicsHandleUpdateField.OwnerHeight];
      this._handleFloat32[GraphicsHandleUpdateField.OwnerWidth] = this.owner.width;
      this._handleFloat32[GraphicsHandleUpdateField.OwnerHeight] = this.owner.height;
      return oldWidth !== this._handleFloat32[GraphicsHandleUpdateField.OwnerWidth]
         || oldHeight !== this._handleFloat32[GraphicsHandleUpdateField.OwnerHeight];
   }
   /** @internal Publish changes to either SingleQuad input buffer through the renderer control buffer. */
   _publishSingleQuadInputs(flags: GraphicsHandleDirtyFlag): void {
      this._handleInt32[GraphicsHandleUpdateField.DirtyFlags] |= flags;
      this._handleInt32[GraphicsHandleUpdateField.SingleQuadVersion]++;
   }
   _mapGraphicsOpDirtyFlags(flags: GraphicsOp2DDirtyFlag): GraphicsHandleDirtyFlag {
      if ((flags & GraphicsOp2DDirtyFlag.Structure) !== 0)
         return GraphicsHandleDirtyFlag.OpPayload | GraphicsHandleDirtyFlag.OpResource | GraphicsHandleDirtyFlag.OpState;
      let result = GraphicsHandleDirtyFlag.None;
      if ((flags & GraphicsOp2DDirtyFlag.Geometry) !== 0) result |= GraphicsHandleDirtyFlag.OpPayload;
      if ((flags & GraphicsOp2DDirtyFlag.Texture) !== 0) result |= GraphicsHandleDirtyFlag.OpResource;
      if ((flags & GraphicsOp2DDirtyFlag.State) !== 0) result |= GraphicsHandleDirtyFlag.OpState;
      return result;
   }
   _syncGraphicsOps(flags: GraphicsHandleDirtyFlag, start: number = 0, count: number = -1, full: boolean = true, topology: boolean = full): void {
      let mode = this._ensureStream();
      let handle = mode.getDataHandle();
      if (count < 0)
         count = mode.ops.length;
      let submitted = this._submitDirty(flags, start, count, topology);
      if (topology || !handle.autoGraphicsDirtySync) {
         handle.syncGraphicsOps(mode.ops);
         full ? mode.markSubmitted() : mode.markSubmitted(start, count);
      } else if (submitted)
         full ? mode.markSubmitted(0, mode.ops.length, true) : mode.markSubmitted(start, count, true);
   }
   private _submitDirty(flags: GraphicsHandleDirtyFlag, start: number, count: number, topology: boolean): boolean {
      if (flags === GraphicsHandleDirtyFlag.None && !topology)
         return false;
      let update = this._handleInt32;
      start = Math.max(0, start | 0);
      count = Math.max(0, Math.min(count | 0, this._streamMode.ops.length - start));
      let version = update[GraphicsHandleUpdateField.UpdateVersion];
      if (update[GraphicsHandleUpdateField.HandledVersion] !== version) {
         let oldStart = update[GraphicsHandleUpdateField.DirtyOpStart];
         let oldCount = update[GraphicsHandleUpdateField.DirtyOpCount];
         if (oldStart >= 0 && oldCount > 0) {
            let end = Math.max(oldStart + oldCount, start + count);
            start = Math.min(oldStart, start);
            count = end - start;
            flags |= update[GraphicsHandleUpdateField.DirtyFlags];
         }
      }
      update[GraphicsHandleUpdateField.DirtyFlags] = flags;
      update[GraphicsHandleUpdateField.DirtyOpStart] = start;
      update[GraphicsHandleUpdateField.DirtyOpCount] = count;
      if (topology)
         update[GraphicsHandleUpdateField.TopologyVersion]++;
      update[GraphicsHandleUpdateField.UpdateVersion] = version + 1;
      return true;
   }
   requestTextureRecovery(texture: Texture): void {
      if (this._destroyed || texture.destroyed || texture.valid)
         return;
      let bitmap = texture.bitmap;
      if (!bitmap || !bitmap.url || this._recoveringTextureIds.has(texture.id))
         return;
      let ids = this._recoveringTextureIds;
      ids.add(texture.id);
      texture.recoverBitmap(() => {
         ids.delete(texture.id);
         if (!this._destroyed && texture.valid)
            this._scheduleGraphicsRebuild();
      });
   }
   destroy(): void {
      if (this._destroyed)
         return;
      this._destroyed = true;
      this.owner.off(SpriteGlobalTransform.CHANGED, this, this._onOwnerWorldTransformChanged);
      this._deactivateCurrentMode();
      this._struct.renderDataHandler = null;
      this._struct.renderElements = GraphicsRenderer._emptyList;
      this._struct.renderType = -1;
      this._streamMode?.destroy();
      this._singleMode?.destroy();
      this._recoveringTextureIds.clear();
      this.graphics = null;
      this._activeHandle = null;
      this._streamMode = null;
      this._singleMode = null;
      this.owner = null;
   }
}
