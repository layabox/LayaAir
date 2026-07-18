import type { IGraphicsCmd } from "../../IGraphics";
import type { Sprite } from "../../Sprite";
import {
	GraphicsCommandDependency,
	GraphicsCommandLayoutRefresh,
	GraphicsInfoDirtyFlag,
	GraphicsOwnerTransformDependency,
	GraphicsRefreshAction,
	type GraphicsCommandInfo,
	type GraphicsCommandRangeRecord,
} from "./GraphicsPipelineTypes";

const enum GraphicsCommandTrackerFlag {
   StateDependency = 1 << 0,
   SizePayload = 1 << 1,
   ScaleTessellation = 1 << 2,
   LayoutMarkDirty = 1 << 3,
   LayoutRerunCommand = 1 << 4,
   LayoutStructural = 1 << 5,
   LayoutDirty = 1 << 6,
   SizeDirty = 1 << 7,
}

/**
 * CommandOpIndex semantics for the offset-first stream compiler.
 *
 * Tracks each command-to-op range and whether later command replacement must
 * rebuild because an earlier state command changed the affected range. State
 * commands can map to zero ops while still affecting following draw ops.
 * @internal
 */
export class GraphicsCommandTracker {
   private _rangeStarts: number[] = [];
   private _rangeCounts: number[] = [];
   private _cmdFlags: number[] = [];
   private _scaleTessellationKeys: number[] = [];
   private _layoutDirtyCommands: number[] = [];
   private _sizeDirtyCommands: number[] = [];
   private _scaleTessellationCommands: number[] = [];
   private _scaleTessellationDirtyCommands: number[] = [];
   private _textureCommandRanges: Map<number, number[]> = new Map();
   private _rangeScratch: GraphicsCommandRangeRecord = { cmdIndex: -1, start: -1, count: 0, active: false };
   private _activeCmdIndex: number = -1;
   private _activeCommandHadStateDependency: boolean = false;
   private _collectDependencies: boolean = false;
   private _hasStateDependency: boolean = false;
   private _layoutDirtyCount: number = 0;
   private _sizeDirtyCount: number = 0;
   private _scaleTessellationCount: number = 0;
   private _ownerTransformDependencyMask: GraphicsOwnerTransformDependency = GraphicsOwnerTransformDependency.None;
   private _commandInfoScratch: GraphicsCommandInfo = {
      dependency: GraphicsCommandDependency.None,
      layoutRefresh: GraphicsCommandLayoutRefresh.None,
      scaleTessellationKey: 0,
      isStateCommand: false,
   };

   get collectDependencies(): boolean {
      return this._collectDependencies;
   }

   beginBuild(): void {
      this._rangeStarts.length = 0;
      this._rangeCounts.length = 0;
      this._cmdFlags.length = 0;
      this._scaleTessellationKeys.length = 0;
      this._layoutDirtyCommands.length = 0;
      this._sizeDirtyCommands.length = 0;
      this._scaleTessellationCommands.length = 0;
      this._scaleTessellationDirtyCommands.length = 0;
      this._textureCommandRanges.clear();
      this._activeCmdIndex = -1;
      this._activeCommandHadStateDependency = false;
      this._collectDependencies = true;
      this._hasStateDependency = false;
      this._layoutDirtyCount = 0;
      this._sizeDirtyCount = 0;
      this._scaleTessellationCount = 0;
      this._ownerTransformDependencyMask = GraphicsOwnerTransformDependency.None;
   }

   endBuild(): void {
      this._activeCmdIndex = -1;
      this._activeCommandHadStateDependency = false;
      this._collectDependencies = false;
   }

   beginCommand(cmdIndex: number): void {
      this._activeCmdIndex = cmdIndex;
      this._activeCommandHadStateDependency = this._hasStateDependency;
   }

   endCommand(cmdIndex: number, recordStart: number, recordEnd: number, cmd: IGraphicsCmd, owner?: Sprite): void {
      this._activeCmdIndex = -1;
      this._writeRange(cmdIndex, recordStart, recordEnd);
      let info = this._readCommandInfo(cmd, owner);
      this._writeCommandMetadata(cmdIndex, info, this._activeCommandHadStateDependency);
      this._activeCommandHadStateDependency = false;
   }

   beginScratch(): void {
      this._activeCmdIndex = -1;
      this._activeCommandHadStateDependency = false;
      this._collectDependencies = false;
   }

   beginLocalCommandRefresh(cmdIndex: number): void {
      this._removeTextureRefsForCommand(cmdIndex);
      this._activeCmdIndex = cmdIndex;
      this._activeCommandHadStateDependency = false;
      this._collectDependencies = true;
   }

   endLocalCommandRefresh(): void {
      this._activeCmdIndex = -1;
      this._activeCommandHadStateDependency = false;
      this._collectDependencies = false;
   }

   refreshCommandMetadata(cmdIndex: number, recordStart: number, recordEnd: number, cmd: IGraphicsCmd, owner?: Sprite): boolean {
      let info = this._readCommandInfo(cmd, owner);
      if (info.isStateCommand)
         return false;

      let hasStateDependency = this.hasStateDependency(cmdIndex);
      let oldStart = this._rangeStarts[cmdIndex];
      let oldCount = this._rangeCounts[cmdIndex] || 0;
      let oldEnd = oldCount > 0 && oldStart >= 0 ? oldStart + oldCount : recordStart;
      let newCount = recordEnd - recordStart;
      this._removeCommandMetadata(cmdIndex);
      this._writeRange(cmdIndex, recordStart, recordEnd);
      if (newCount !== oldCount)
         this._shiftRangesAfter(cmdIndex, oldEnd, newCount - oldCount);
      this._writeCommandMetadata(cmdIndex, info, hasStateDependency);
      this._recomputeOwnerTransformDependencyMask();
      return true;
   }

   addTextureRef(textureId: number): void {
      if (!this._collectDependencies || this._activeCmdIndex < 0)
         return;

      let ranges = this._textureCommandRanges.get(textureId);
      if (!ranges) {
         ranges = [];
         this._textureCommandRanges.set(textureId, ranges);
      }
      if (ranges.indexOf(this._activeCmdIndex) < 0)
         ranges.push(this._activeCmdIndex);
   }

   getRange(cmdIndex: number): GraphicsCommandRangeRecord {
      if (cmdIndex < 0 || cmdIndex >= this._rangeCounts.length)
         return null;

      let count = this._rangeCounts[cmdIndex] || 0;
      let start = count > 0 ? this._rangeStarts[cmdIndex] : -1;
      let out = this._rangeScratch;
      out.cmdIndex = cmdIndex;
      out.start = start;
      out.count = count;
      out.active = count > 0 && start >= 0;
      return out;
   }

   getTextureCommandRanges(textureId: number): number[] {
      return this._textureCommandRanges.get(textureId);
   }

   hasStateDependency(cmdIndex: number): boolean {
      return (this._cmdFlags[cmdIndex] & GraphicsCommandTrackerFlag.StateDependency) !== 0;
   }

   hasLayoutDirtyCommands(): boolean {
      return this._layoutDirtyCount > 0;
   }

   getLayoutDirtyCommands(): number[] {
      return this._layoutDirtyCommands;
   }

   hasSizeDirtyCommands(): boolean {
      return this._sizeDirtyCount > 0;
   }

   getSizeDirtyCommands(): number[] {
      return this._sizeDirtyCommands;
   }

   hasScaleTessellationCommands(): boolean {
      return this._scaleTessellationCount > 0;
   }

   getScaleTessellationDirtyCommands(cmds: IGraphicsCmd[], owner: Sprite): number[] {
      let dirtyCommands = this._scaleTessellationDirtyCommands;
      dirtyCommands.length = 0;
      if (!cmds)
         return dirtyCommands;

      for (let i = 0, n = this._scaleTessellationCommands.length; i < n; i++) {
         let cmdIndex = this._scaleTessellationCommands[i];
         let cmd = cmdIndex >= 0 && cmdIndex < cmds.length ? cmds[cmdIndex] : null;
         if (!cmd)
            continue;

         // State-dependent commands must be rebuilt with their preceding
         // save/scale/transform stream so the effective scale stays correct.
         if (this.hasStateDependency(cmdIndex)) {
            dirtyCommands.push(cmdIndex);
            continue;
         }

         let key = this._readCommandInfo(cmd, owner).scaleTessellationKey || 0;
         if (key !== (this._scaleTessellationKeys[cmdIndex] || 0))
            dirtyCommands.push(cmdIndex);
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

   updateScaleTessellationKeys(cmdIndexes: number[], cmds: IGraphicsCmd[], owner: Sprite): void {
      if (!cmdIndexes || !cmds)
         return;
      for (let i = 0, n = cmdIndexes.length; i < n; i++) {
         let cmdIndex = cmdIndexes[i];
         let cmd = cmdIndex >= 0 && cmdIndex < cmds.length ? cmds[cmdIndex] : null;
         if (cmd && (this._cmdFlags[cmdIndex] & GraphicsCommandTrackerFlag.ScaleTessellation) !== 0)
            this._scaleTessellationKeys[cmdIndex] = this._readCommandInfo(cmd, owner).scaleTessellationKey || 0;
      }
   }

   analyzeRefresh(cmdIndex: number, cmd: IGraphicsCmd, reason: GraphicsInfoDirtyFlag): GraphicsRefreshAction {
      let hasStateDependency = this.hasStateDependency(cmdIndex);
      return (reason & GraphicsInfoDirtyFlag.Layout) !== 0
         ? this._analyzeLayoutCommand(cmdIndex, cmd, hasStateDependency)
         : analyzeTextureCommand(cmd, hasStateDependency);
   }

   analyzeRefreshRanges(cmdIndices: number[], cmds: IGraphicsCmd[], reason: GraphicsInfoDirtyFlag): GraphicsRefreshAction {
      if (!cmdIndices || cmdIndices.length === 0 || !cmds)
         return GraphicsRefreshAction.NoEffect;

      let result = GraphicsRefreshAction.NoEffect;
      for (let i = 0, n = cmdIndices.length; i < n; i++) {
         let cmdIndex = cmdIndices[i];
         let cmd = cmdIndex >= 0 && cmdIndex < cmds.length ? cmds[cmdIndex] : null;
         if (!cmd)
            return GraphicsRefreshAction.StructuralRefresh;
         let action = this.analyzeRefresh(cmdIndex, cmd, reason);
         if (action === GraphicsRefreshAction.StructuralRefresh)
            return action;
         if (action === GraphicsRefreshAction.LocalRefresh)
            result = action;
         else
            return GraphicsRefreshAction.StructuralRefresh;
      }
      return result;
   }

   private _writeRange(cmdIndex: number, start: number, end: number): void {
      let count = end - start;
      this._rangeStarts[cmdIndex] = count > 0 ? start : -1;
      this._rangeCounts[cmdIndex] = count;
   }

   private _shiftRangesAfter(cmdIndex: number, oldEnd: number, delta: number): void {
      for (let i = cmdIndex + 1, n = this._rangeStarts.length; i < n; i++) {
         if ((this._rangeCounts[i] || 0) <= 0)
            continue;
         if (this._rangeStarts[i] >= oldEnd)
            this._rangeStarts[i] += delta;
      }
   }

   private _writeCommandMetadata(cmdIndex: number, info: GraphicsCommandInfo, hasStateDependency: boolean): void {
      let dependency = info.dependency || GraphicsCommandDependency.None;
      let layoutRefresh = info.layoutRefresh || GraphicsCommandLayoutRefresh.None;
      let flags = hasStateDependency ? GraphicsCommandTrackerFlag.StateDependency : 0;
      this._ownerTransformDependencyMask |= this._getOwnerTransformDependencyMask(info);
      if ((dependency & GraphicsCommandDependency.SizePayload) !== 0) {
         flags |= GraphicsCommandTrackerFlag.SizePayload;
         switch (layoutRefresh) {
            case GraphicsCommandLayoutRefresh.MarkDirty:
               flags |= GraphicsCommandTrackerFlag.LayoutMarkDirty;
               break;
            case GraphicsCommandLayoutRefresh.RerunCommand:
               flags |= GraphicsCommandTrackerFlag.LayoutRerunCommand;
               break;
            case GraphicsCommandLayoutRefresh.Structural:
               flags |= GraphicsCommandTrackerFlag.LayoutStructural;
               break;
         }
         if ((flags & GraphicsCommandTrackerFlag.StateDependency) === 0 && layoutRefresh === GraphicsCommandLayoutRefresh.MarkDirty) {
            flags |= GraphicsCommandTrackerFlag.LayoutDirty;
            this._layoutDirtyCount++;
            this._layoutDirtyCommands.push(cmdIndex);
         } else {
            flags |= GraphicsCommandTrackerFlag.SizeDirty;
            this._sizeDirtyCount++;
            this._sizeDirtyCommands.push(cmdIndex);
         }
      }
      if ((dependency & GraphicsCommandDependency.ScaleTessellation) !== 0) {
         flags |= GraphicsCommandTrackerFlag.ScaleTessellation;
         this._scaleTessellationKeys[cmdIndex] = info.scaleTessellationKey || 0;
         this._scaleTessellationCount++;
         this._scaleTessellationCommands.push(cmdIndex);
      }
      this._cmdFlags[cmdIndex] = flags;
      if (info.isStateCommand)
         this._hasStateDependency = true;
   }

   private _removeCommandMetadata(cmdIndex: number): void {
      let flags = this._cmdFlags[cmdIndex] || 0;
      if ((flags & GraphicsCommandTrackerFlag.LayoutDirty) !== 0) {
         this._removeCommandIndex(this._layoutDirtyCommands, cmdIndex);
         this._layoutDirtyCount = Math.max(0, this._layoutDirtyCount - 1);
      }
      if ((flags & GraphicsCommandTrackerFlag.SizeDirty) !== 0) {
         this._removeCommandIndex(this._sizeDirtyCommands, cmdIndex);
         this._sizeDirtyCount = Math.max(0, this._sizeDirtyCount - 1);
      }
      if ((flags & GraphicsCommandTrackerFlag.ScaleTessellation) !== 0) {
         this._removeCommandIndex(this._scaleTessellationCommands, cmdIndex);
         this._scaleTessellationCount = Math.max(0, this._scaleTessellationCount - 1);
      }
      this._scaleTessellationKeys[cmdIndex] = 0;
      this._cmdFlags[cmdIndex] = 0;
   }

   private _removeCommandIndex(list: number[], cmdIndex: number): void {
      let index = list.indexOf(cmdIndex);
      if (index >= 0)
         list.splice(index, 1);
   }

   private _recomputeOwnerTransformDependencyMask(): void {
      let mask = GraphicsOwnerTransformDependency.None;
      for (let i = 0, n = this._cmdFlags.length; i < n; i++) {
         let flags = this._cmdFlags[i] || 0;
         if ((flags & GraphicsCommandTrackerFlag.SizePayload) !== 0)
            mask |= GraphicsOwnerTransformDependency.SizeLayout;
         if ((flags & GraphicsCommandTrackerFlag.ScaleTessellation) !== 0)
            mask |= GraphicsOwnerTransformDependency.ScaleTessellation;
      }
      this._ownerTransformDependencyMask = mask;
   }

   private _removeTextureRefsForCommand(cmdIndex: number): void {
      this._textureCommandRanges.forEach((ranges, textureId) => {
         let index = ranges.indexOf(cmdIndex);
         if (index >= 0)
            ranges.splice(index, 1);
         if (ranges.length === 0)
            this._textureCommandRanges.delete(textureId);
      });
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

   private _analyzeLayoutCommand(cmdIndex: number, cmd: IGraphicsCmd, hasStateDependency: boolean): GraphicsRefreshAction {
      if (!cmd)
         return GraphicsRefreshAction.NoEffect;

      let flags = this._cmdFlags[cmdIndex] || 0;
      if ((flags & (GraphicsCommandTrackerFlag.SizePayload | GraphicsCommandTrackerFlag.ScaleTessellation)) === 0)
         return GraphicsRefreshAction.NoEffect;

      if (hasStateDependency)
         return GraphicsRefreshAction.StructuralRefresh;

      if ((flags & (GraphicsCommandTrackerFlag.LayoutMarkDirty | GraphicsCommandTrackerFlag.LayoutRerunCommand)) !== 0)
         return GraphicsRefreshAction.LocalRefresh;
      if ((flags & GraphicsCommandTrackerFlag.LayoutStructural) !== 0)
         return GraphicsRefreshAction.StructuralRefresh;
      return GraphicsRefreshAction.NoEffect;
   }

   private _readCommandInfo(cmd: IGraphicsCmd, owner?: Sprite): GraphicsCommandInfo {
      let out = this._commandInfoScratch;
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
}

function analyzeTextureCommand(cmd: IGraphicsCmd, hasStateDependency: boolean): GraphicsRefreshAction {
   if (!cmd)
      return GraphicsRefreshAction.NoEffect;

   if (hasStateDependency)
      return GraphicsRefreshAction.StructuralRefresh;

   return GraphicsRefreshAction.LocalRefresh;
}
