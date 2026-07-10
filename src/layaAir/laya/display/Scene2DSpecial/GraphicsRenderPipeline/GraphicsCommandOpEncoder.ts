import { Config } from "../../../../Config";
import { Bezier } from "../../../maths/Bezier";
import { Matrix } from "../../../maths/Matrix";
import { Rectangle } from "../../../maths/Rectangle";
import type { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { Texture } from "../../../resource/Texture";
import { Texture2DArray } from "../../../resource/Texture2DArray";
import { genSliceMesh } from "../../mesh/MeshFactory";
import { ColorUtils } from "../../../utils/ColorUtils";
import { VertexStream } from "../../../utils/VertexStream";
import { BlendMode } from "../../../webgl/canvas/BlendMode";
import { BasePoly } from "../../../webgl/shapes/BasePoly";
import { Earcut } from "../../../webgl/shapes/Earcut";
import { TextureArrayRegistry2D } from "../../../webgl/utils/TextureArrayRegistry2D";
import { UVClippingUtils } from "../../../webgl/utils/UVClippingUtils";
import { Sprite } from "../../Sprite";
import { Draw9GridTextureCmd } from "../../cmd/Draw9GridTextureCmd";
import { DrawCircleCmd } from "../../cmd/DrawCircleCmd";
import { DrawEllipseCmd } from "../../cmd/DrawEllipseCmd";
import { DrawImageCmd } from "../../cmd/DrawImageCmd";
import { DrawLineCmd } from "../../cmd/DrawLineCmd";
import { DrawLinesCmd } from "../../cmd/DrawLinesCmd";
import { DrawPieCmd } from "../../cmd/DrawPieCmd";
import { DrawPolyCmd } from "../../cmd/DrawPolyCmd";
import { DrawRectCmd } from "../../cmd/DrawRectCmd";
import { DrawRoundRectCmd } from "../../cmd/DrawRoundRectCmd";
import { DrawTextureCmd } from "../../cmd/DrawTextureCmd";
import { DrawTexturesCmd } from "../../cmd/DrawTexturesCmd";
import { DrawTrianglesCmd } from "../../cmd/DrawTrianglesCmd";
import { DrawCurvesCmd } from "../../cmd/DrawCurvesCmd";
import { DrawPathCmd } from "../../cmd/DrawPathCmd";
import { FillTextCmd } from "../../cmd/FillTextCmd";
import { FillTextureCmd } from "../../cmd/FillTextureCmd";
import type { GraphicsCommandInfo, IGraphicsCmd } from "../../IGraphics";
import type {
   IGraphicsMeshOp2D,
   IGraphicsMultiQuadOp2D,
   IGraphicsTextOp2D,
   IGraphicsTextureQuadOp2D,
} from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { GraphicsOp2DDirtyFlag, GraphicsOp2DKind, type GraphicsBlendModeInput, type GraphicsColorInput, type GraphicsDrawPathSegment, type GraphicsOp2DPatchResult, type GraphicsOp2DTextureHost } from "./GraphicsPipelineTypes";
import { GraphicsOp2DList } from "./GraphicsOp2DList";
import type { GraphicsRunner } from "../GraphicsRunner";

const TEXTURE_QUAD_INDICES: number[] = [0, 2, 1, 0, 3, 2];

/** @internal */
export interface GraphicsCommandOpEncoderHost {
   owner: Sprite;
   addResRef(res: Resource): void;
}

/** @internal */
export class GraphicsCommandOpEncoder {
   private _preRegisteredTextureQuadCommands: ReadonlyArray<DrawTextureCmd> = null;
   private _commandInfoScratch: GraphicsCommandInfo = { dependency: 0, layoutRefresh: 0, scaleTessellationKey: 0, isStateCommand: false };
   private _genericMeshMatrixScratch: Matrix = new Matrix();
   private _textureMeshMatrixScratch: Matrix = new Matrix();
   private _fillTextureTexRangeScratch: number[] = [0, 0, 1, 1];
   private _uvClipRangeScratch: number[] = [0, 0, 1, 1];
   private _gridRectScratch: Rectangle = new Rectangle();
   private _textQuadVerticesScratch: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
   private _textQuadUVScratch: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
   private _textureQuadVerticesScratch: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
   private _textureQuadUVScratch: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
   private _shapeVerticesScratch: number[] = [];
   private _shapeIndicesScratch: number[] = [];
   private _shapePathScratch: number[] = [];
   private _shapeSubpathsScratch: number[][] = [];
   private _shapeSubpathClosedScratch: boolean[] = [];
   private _resolvedTextureLayer: number = 0;
   private _activeMultiQuadOp: IGraphicsMultiQuadOp2D = null;
   private _activeMultiQuadTextures: GraphicsOp2DTextureHost[] = [];

   constructor(private _opList: GraphicsOp2DList, private _host: GraphicsCommandOpEncoderHost) {
   }

   clearBuildState(): void {
      this.finalizeActiveCommandTextures();
   }

   compileCommand(cmd: IGraphicsCmd, cmdIndex: number, runner: GraphicsRunner): void {
      if (!cmd)
         return;
      if (this.isStateCommand(cmd)) {
         cmd.run(runner, 0, 0);
         return;
      }
      this._beginActiveCommandTextures();
      this.appendCommandOp(cmd, cmdIndex, runner);
      this.finalizeActiveCommandTextures();
   }

   finalizeActiveCommandTextures(): void {
      if (this._activeMultiQuadOp)
         this._activeMultiQuadOp.setTextures(this._activeMultiQuadTextures, this._activeMultiQuadTextures.length);
      this._activeMultiQuadOp = null;
      this._activeMultiQuadTextures.length = 0;
   }

   private _beginActiveCommandTextures(): void {
      this._activeMultiQuadOp = null;
      this._activeMultiQuadTextures.length = 0;
   }

   isStateCommand(cmd: IGraphicsCmd): boolean {
      let owner = this._host.owner;
      let info = cmd && cmd.getGraphicsCommandInfo ? cmd.getGraphicsCommandInfo(this._commandInfoScratch, owner) : null;
      return !!(info && info.isStateCommand);
   }

   appendCommandOp(cmd: IGraphicsCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      if (!cmd)
         return false;
      switch (cmd.cmdID) {
         case DrawRectCmd.ID:
            return this._tryAppendDrawRectOps(cmd as DrawRectCmd, cmdIndex, runner);
         case DrawLineCmd.ID:
            return this._tryAppendDrawLineOp(cmd as DrawLineCmd, cmdIndex, runner);
         case DrawLinesCmd.ID:
            return this._tryAppendDrawLinesOp(cmd as DrawLinesCmd, cmdIndex, runner);
         case DrawCircleCmd.ID:
            return this._tryAppendDrawCircleOps(cmd as DrawCircleCmd, cmdIndex, runner);
         case DrawEllipseCmd.ID:
            return this._tryAppendDrawEllipseOps(cmd as DrawEllipseCmd, cmdIndex, runner);
         case DrawPieCmd.ID:
            return this._tryAppendDrawPieOps(cmd as DrawPieCmd, cmdIndex, runner);
         case DrawPolyCmd.ID:
            return this._tryAppendDrawPolyOps(cmd as DrawPolyCmd, cmdIndex, runner);
         case DrawRoundRectCmd.ID:
            return this._tryAppendDrawRoundRectOps(cmd as DrawRoundRectCmd, cmdIndex, runner);
         case DrawTexturesCmd.ID:
            return this._tryAppendDrawTexturesOps(cmd as DrawTexturesCmd, cmdIndex, runner);
         case DrawCurvesCmd.ID:
            return this._tryAppendDrawCurvesOp(cmd as DrawCurvesCmd, cmdIndex, runner);
         case DrawPathCmd.ID:
            return this._tryAppendDrawPathOps(cmd as DrawPathCmd, cmdIndex, runner);
         case FillTextureCmd.ID:
            return this._tryAppendFillTextureOp(cmd as FillTextureCmd, cmdIndex, runner);
         case FillTextCmd.ID:
            return this._tryAppendFillTextOps(cmd as FillTextCmd, cmdIndex, runner);
         case Draw9GridTextureCmd.ID:
            return this._tryAppend9GridTextureOps(cmd as Draw9GridTextureCmd, cmdIndex, runner);
         case DrawTrianglesCmd.ID:
            return this._tryAppendGenericMeshOp(cmd as DrawTrianglesCmd, cmdIndex, runner);
         case DrawTextureCmd.ID:
         case DrawImageCmd.ID:
            return this._tryAppendTextureQuadOp(cmd as DrawTextureCmd | DrawImageCmd, cmdIndex, runner);
      }
      return false;
   }

   patchTextureQuadOp(opIndex: number, op: IGraphicsTextureQuadOp2D, cmd: DrawTextureCmd, runner: GraphicsRunner = null): GraphicsOp2DPatchResult {
      if (!op)
         return { success: false, opIndex: -1, dirtyFlags: GraphicsOp2DDirtyFlag.None };
      if (!this._writeTextureQuadCommandValuesToOp(op, cmd, runner))
         return { success: false, opIndex: -1, dirtyFlags: GraphicsOp2DDirtyFlag.None };
      return { success: true, opIndex, dirtyFlags: op.dirtyFlags };
   }

   preRegisterTextureQuadCommands(cmds: ReadonlyArray<DrawTextureCmd> | null): void {
      this._preRegisteredTextureQuadCommands = cmds;
      this.preRegisterTextureQuadResources();
   }

   preRegisterTextureQuadResources(): void {
      let cmds = this._preRegisteredTextureQuadCommands;
      if (!cmds)
         return;
      for (let i = 0, n = cmds.length; i < n; i++) {
         let cmd = cmds[i];
         if (cmd && cmd.texture)
            this._resolveGraphicsTextureResource(cmd.texture);
      }
   }

   appendSpriteTextureOp(): void {
      let owner = this._host.owner;
      let tex = owner ? owner._texture : null;
      if (!tex)
         return;
      let width = owner._isWidthSet ? owner._width : tex.sourceWidth;
      let height = owner._isHeightSet ? owner._height : tex.sourceHeight;
      let wRate = width / (tex.sourceWidth || tex.width || 1);
      let hRate = height / (tex.sourceHeight || tex.height || 1);
      let uv = tex._uv || tex.uv || Texture.DEF_UV;
      let textureResource = this._resolveGraphicsTextureResource(tex);
      this._writeTextureQuadValues(tex.offsetX * wRate, tex.offsetY * hRate, tex.width * wRate, tex.height * hRate,
         uv[0], uv[1], uv[4] == null ? uv[2] : uv[4], uv[5] == null ? uv[3] : uv[5],
         0xffffffff, 1, owner._struct.blendMode, this._resolvedTextureLayer, null, textureResource, this._getTextureUVClipRange(tex));
   }

   private _tryAppendTextureQuadOp(cmd: DrawTextureCmd | DrawImageCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      let drawTextureCmd = cmd.cmdID === DrawTextureCmd.ID ? cmd as DrawTextureCmd : null;
      if (drawTextureCmd && drawTextureCmd.matrix)
         return this._tryAppendMatrixTextureMeshOp(drawTextureCmd, cmdIndex, runner);
      let op = this._opList.getTextureQuadTargetOp();
      return this._writeTextureQuadCommandValuesToOp(op as IGraphicsTextureQuadOp2D, cmd, runner);
   }

   private _tryAppendDrawTexturesOps(cmd: DrawTexturesCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      let tex = cmd.texture;
      let pos = cmd.pos;
      if (!tex || !pos || pos.length < 2)
         return false;
      let width = tex.width;
      let height = tex.height;
      if (width <= 0 || height <= 0)
         return false;

      let uv = tex._uv || tex.uv || Texture.DEF_UV;
      let u0 = uv ? uv[0] : 0;
      let v0 = uv ? uv[1] : 0;
      let u1 = uv ? (uv[4] == null ? uv[2] : uv[4]) : 1;
      let v1 = uv ? (uv[5] == null ? uv[3] : uv[5]) : 1;
      let textureResource = this._resolveGraphicsTextureResource(tex);
      let textureLayer = this._resolvedTextureLayer;
      let uvClip = this._getTextureUVClipRange(tex);
      let matrix = this._getMatrixState(runner);
      let colors = cmd.colors || [];
      let count = pos.length >> 1;
      for (let i = 0, p = 0; i < count; i++, p += 2) {
         this._writeTextureQuadValues(pos[p], pos[p + 1], width, height, u0, v0, u1, v1,
            typeof colors[i] === "number" ? colors[i] : 0xffffffff,
            this._getOpAlpha(runner, 1), this._getOpBlendMode(runner),
            textureLayer, matrix, textureResource, this._getTextureUVClipRange(tex));
      }
      return true;
   }

   private _tryAppendDrawRectOps(cmd: DrawRectCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      let wrote = false;
      if (cmd.fillColor != null)
         wrote = this._tryAppendSolidQuadOp(cmd, cmdIndex, runner);
      if (cmd.lineColor != null && cmd.lineWidth > 0)
         wrote = this._appendRectStrokeMesh(cmd, cmdIndex, runner) || wrote;
      return wrote;
   }

   private _tryAppendSolidQuadOp(cmd: DrawRectCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      let owner = this._host.owner;
      let x = cmd.x, y = cmd.y, width = cmd.width, height = cmd.height;
      if (cmd.percent && owner) {
         x *= owner.width;
         y *= owner.height;
         width *= owner.width;
         height *= owner.height;
      }
      let offset = (cmd.lineWidth >= 1 && cmd.lineColor) ? cmd.lineWidth / 2 : 0;
      let lineOffset = cmd.lineColor ? cmd.lineWidth : 0;
      x += offset;
      y += offset;
      width -= lineOffset;
      height -= lineOffset;
      if (width <= 0 || height <= 0)
         return false;
      if (this._writeSolidQuadValues(x, y, width, height,
         this._toABGR(cmd.fillColor), this._getOpAlpha(runner, 1), this._getOpBlendMode(runner),
         this._getMatrixState(runner)) < 0)
         return false;
      return true;
   }

   private _tryAppendDrawLineOp(cmd: DrawLineCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      if (cmd.lineColor == null || cmd.lineWidth <= 0)
         return false;
      let owner = this._host.owner;
      let fromX = cmd.fromX;
      let fromY = cmd.fromY;
      let toX = cmd.toX;
      let toY = cmd.toY;
      if (cmd.percent && owner) {
         fromX *= owner.width;
         fromY *= owner.height;
         toX *= owner.width;
         toY *= owner.height;
      }
      let offset = (cmd.lineWidth < 1 || cmd.lineWidth % 2 === 0) ? 0 : 0.5;
      return this._appendLineMesh([fromX + offset, fromY + offset, toX + offset, toY + offset], cmd.lineWidth, false, this._toABGR(cmd.lineColor), cmdIndex, runner);
   }

   private _tryAppendDrawLinesOp(cmd: DrawLinesCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      if (!cmd.points || cmd.points.length < 4 || cmd.lineColor == null || cmd.lineWidth <= 0)
         return false;
      let offset = (cmd.lineWidth < 1 || cmd.lineWidth % 2 === 0) ? 0 : 0.5;
      this._copyOffsetPoints(cmd.points, cmd.x + offset, cmd.y + offset);
      return this._appendLineMesh(this._shapePathScratch, cmd.lineWidth, false, this._toABGR(cmd.lineColor), cmdIndex, runner);
   }

   private _tryAppendDrawCircleOps(cmd: DrawCircleCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      let owner = this._host.owner;
      let x = cmd.x;
      let y = cmd.y;
      let radius = cmd.radius;
      let offset = (cmd.lineWidth >= 1 && cmd.lineColor) ? cmd.lineWidth / 2 : 0;
      if (cmd.percent && owner) {
         x *= owner.width;
         y *= owner.height;
         radius *= Math.min(owner.width, owner.height);
      }
      radius -= offset;
      if (radius <= 0)
         return false;
      let wrote = false;
      let segments = Math.max(12, Math.min(128, Math.ceil(radius * 2 * Math.PI / 5)));
      this._makeCirclePath(x, y, radius, segments);
      if (cmd.fillColor != null)
         wrote = this._appendCircleFillMesh(x, y, radius, segments, this._toABGR(cmd.fillColor), cmdIndex, runner) || wrote;
      if (cmd.lineColor != null && cmd.lineWidth > 0)
         wrote = this._appendLineMesh(this._shapePathScratch, cmd.lineWidth, true, this._toABGR(cmd.lineColor), cmdIndex, runner) || wrote;
      return wrote;
   }

   private _tryAppendDrawEllipseOps(cmd: DrawEllipseCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      let owner = this._host.owner;
      let x = cmd.x;
      let y = cmd.y;
      let rx = cmd.width;
      let ry = cmd.height;
      let offset = (cmd.lineWidth >= 1 && cmd.lineColor) ? cmd.lineWidth / 2 : 0;
      if (cmd.percent && owner) {
         x *= owner.width;
         y *= owner.height;
         rx *= owner.width;
         ry *= owner.height;
      }
      rx -= offset;
      ry -= offset;
      if (rx <= 0 || ry <= 0)
         return false;
      let segments = Math.max(12, Math.min(128, Math.ceil(Math.max(rx, ry) * 2 * Math.PI / 5)));
      this._makeEllipsePath(x, y, rx, ry, segments);
      return this._appendPathFillAndStroke(this._shapePathScratch, cmd.fillColor, cmd.lineColor, cmd.lineWidth, true, cmdIndex, runner);
   }

   private _tryAppendDrawPieOps(cmd: DrawPieCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      let offset = (cmd.lineWidth >= 1 && cmd.lineColor) ? cmd.lineWidth / 2 : 0;
      let lineOffset = cmd.lineColor ? cmd.lineWidth : 0;
      let x = cmd.x + offset;
      let y = cmd.y + offset;
      let radius = cmd.radius - lineOffset;
      if (radius <= 0)
         return false;
      let startAngle = cmd.startAngle * Math.PI / 180;
      let endAngle = cmd.endAngle * Math.PI / 180;
      let arc = Math.abs(endAngle - startAngle);
      let segments = Math.max(2, Math.min(128, Math.ceil(radius * arc / 5)));
      this._makePiePath(x, y, radius, startAngle, endAngle, segments);
      return this._appendPathFillAndStroke(this._shapePathScratch, cmd.fillColor, cmd.lineColor, cmd.lineWidth, true, cmdIndex, runner);
   }

   private _tryAppendDrawPolyOps(cmd: DrawPolyCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      if (!cmd.points || cmd.points.length < 6)
         return false;
      let offset = (cmd.lineWidth >= 1 && cmd.lineColor) ? (cmd.lineWidth % 2 === 0 ? 0 : 0.5) : 0;
      this._copyOffsetPoints(cmd.points, cmd.x + offset, cmd.y + offset);
      return this._appendPathFillAndStroke(this._shapePathScratch, cmd.fillColor, cmd.lineColor, cmd.lineWidth, true, cmdIndex, runner);
   }

   private _tryAppendDrawRoundRectOps(cmd: DrawRoundRectCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      let owner = this._host.owner;
      let x = cmd.x;
      let y = cmd.y;
      let width = cmd.width;
      let height = cmd.height;
      let offset = (cmd.lineWidth >= 1 && cmd.lineColor) ? cmd.lineWidth / 2 : 0;
      let lineOffset = cmd.lineColor ? cmd.lineWidth : 0;
      if (cmd.percent && owner) {
         x *= owner.width;
         y *= owner.height;
         width *= owner.width;
         height *= owner.height;
      }
      x += offset;
      y += offset;
      width -= lineOffset;
      height -= lineOffset;
      if (width <= 0 || height <= 0)
         return false;
      this._makeRoundRectPath(x, y, width, height, cmd.lt, cmd.rt, cmd.rb, cmd.lb, cmd.minNum || 20, cmd.segPixel || 5);
      return this._appendPathFillAndStroke(this._shapePathScratch, cmd.fillColor, cmd.lineColor, cmd.lineWidth, true, cmdIndex, runner);
   }

   private _tryAppendDrawCurvesOp(cmd: DrawCurvesCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      if (!cmd.points || cmd.points.length < 6 || cmd.lineColor == null || cmd.lineWidth <= 0)
         return false;
      let path = this._shapePathScratch;
      path.length = 0;
      Bezier.getPoints(cmd.points, 5, 2, path);
      if (path.length < 4)
         return false;
      this._offsetPathPoints(path, cmd.x, cmd.y);
      return this._appendLineMesh(path, cmd.lineWidth, false, this._toABGR(cmd.lineColor), cmdIndex, runner);
   }

   private _tryAppendDrawPathOps(cmd: DrawPathCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      if (!this._collectDrawPathSubpaths(cmd.paths, cmd.x, cmd.y))
         return false;
      let brush = cmd.brush;
      let pen = cmd.pen;
      let fillColor = brush ? brush.fillStyle : null;
      let lineColor = pen ? pen.strokeStyle : null;
      let lineWidth = pen && pen.lineWidth != null ? pen.lineWidth : 1;
      let wrote = false;
      for (let i = 0, n = this._shapeSubpathsScratch.length; i < n; i++)
         wrote = this._appendPathFillAndStroke(this._shapeSubpathsScratch[i], fillColor, lineColor, lineWidth, this._shapeSubpathClosedScratch[i], cmdIndex, runner) || wrote;
      return wrote;
   }

   private _tryAppendFillTextureOp(cmd: FillTextureCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      let tex = cmd.texture;
      if (!tex)
         return false;
      let owner = this._host.owner;
      let x = cmd.x, y = cmd.y, width = cmd.width, height = cmd.height;
      if (cmd.percent && owner) {
         x *= owner.width;
         y *= owner.height;
         width *= owner.width;
         height *= owner.height;
      }
      let texw = tex.width || 1;
      let texh = tex.height || 1;
      let offsetX = cmd.offset ? cmd.offset.x : 0;
      let offsetY = cmd.offset ? cmd.offset.y : 0;
      let repeatX = cmd.type === "repeat" || cmd.type === "repeat-x" ? 1 : 0;
      let repeatY = cmd.type === "repeat" || cmd.type === "repeat-y" ? 1 : 0;
      let stx = offsetX < 0 ? x : x + offsetX;
      let sty = offsetY < 0 ? y : y + offsetY;
      let stu = offsetX < 0 ? (-offsetX % texw) / texw : 0;
      let stv = offsetY < 0 ? (-offsetY % texh) / texh : 0;
      let edx = x + width;
      let edy = y + height;
      if (!repeatX)
         edx = Math.min(edx, x + offsetX + texw);
      if (!repeatY)
         edy = Math.min(edy, y + offsetY + texh);
      if (edx < x || edy < y || stx > edx || sty > edy)
         return false;
      let edu = (edx - x - offsetX) / texw;
      let edv = (edy - y - offsetY) / texh;
      let textureResource = this._resolveGraphicsTextureResource(tex);
      let textureLayer = this._resolvedTextureLayer;
      let texRange = this._getTextureUVRange(tex, this._fillTextureTexRangeScratch);
      if (this._writeFillTextureValues(stx, sty, edx - stx, edy - sty, stu, stv, edu, edv,
         repeatX, repeatY, offsetX, offsetY, texRange[0], texRange[1], texRange[2], texRange[3],
         cmd.color, this._getOpAlpha(runner, 1), this._getOpBlendMode(runner),
         textureLayer, this._getMatrixState(runner), textureResource, this._getTextureUVClipRange(tex)) < 0)
         return false;
      return true;
   }

   private _tryAppendFillTextOps(cmd: FillTextCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      cmd.emitTextureQuads(runner, 0, 0, (texture, x, y, width, height, uv, color, italicDeg, pixelSnap) => {
         this._appendTextTextureOp(texture, x, y, width, height, uv, color, italicDeg, pixelSnap, cmdIndex, runner);
      });
      return true;
   }

   private _tryAppendGenericMeshOp(cmd: DrawTrianglesCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      if (cmd.mesh)
         return this._tryAppendMeshFactoryOp(cmd, runner);
      if (!cmd.vertices || !cmd.uvs || !cmd.indices)
         return false;
      let vertexCount = cmd.vertices.length >> 1;
      if (vertexCount <= 0 || cmd.indices.length <= 0)
         return false;
      let textureResource = cmd.texture ? this._resolveGraphicsTextureResource(cmd.texture) : null;
      let textureLayer = cmd.texture ? this._resolvedTextureLayer : 0;
      return this._writeGenericMeshValues(cmd.x, cmd.y, cmd.vertices, cmd.uvs, cmd.indices, cmd.colors,
         textureResource, textureLayer, cmd.color == null ? 0xffffffff : cmd.color,
         this._getOpAlpha(runner, cmd.alpha), this._getOpBlendMode(runner, cmd.blendMode),
         this._getGenericMeshMatrix(cmd, runner)) >= 0;
   }

   private _appendTextTextureOp(texture: BaseTexture, x: number, y: number, width: number, height: number, uv: ArrayLike<number>, color: number, italicDeg: number, pixelSnap: boolean, cmdIndex: number, runner: GraphicsRunner): void {
      let textureResource = this._resolveGraphicsTextureResource(texture);
      if (!textureResource)
         return;
      if (!uv)
         uv = Texture.DEF_UV;
      let matrix = this._getMatrixState(runner);
      let textureLayer = this._resolvedTextureLayer;

      if (!italicDeg && !pixelSnap) {
         this._writeTextureQuadValues(x, y, width, height,
            uv[0], uv[1], uv[4] == null ? uv[2] : uv[4], uv[5] == null ? uv[3] : uv[5],
            color, this._getOpAlpha(runner, 1), this._getOpBlendMode(runner),
            textureLayer, matrix, textureResource, this._getTextureUVClipRange(texture));
         return;
      }

      this._makeTextQuadGeometry(x, y, width, height, uv, italicDeg || 0, pixelSnap, runner);
      this._writeGenericMeshValues(0, 0, this._textQuadVerticesScratch, this._textQuadUVScratch, TEXTURE_QUAD_INDICES, null,
         textureResource, textureLayer, color, this._getOpAlpha(runner, 1), this._getOpBlendMode(runner), null, this._getTextureUVClipRange(texture));
   }

   private _tryAppend9GridTextureOps(cmd: Draw9GridTextureCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      if (!cmd.texture)
         return false;
      let tex = cmd.texture;
      let owner = this._host.owner;
      let x = cmd.x, y = cmd.y, width = cmd.width, height = cmd.height;
      if (cmd.percent && owner) {
         x *= owner.width;
         y *= owner.height;
         width *= owner.width;
         height *= owner.height;
      }
      if (width <= 0 || height <= 0)
         return false;

      let sizeGrid = cmd.sizeGrid || tex._sizeGrid || [0, 0, 0, 0, 0];
      let sourceWidth = tex.sourceWidth || tex.width || 1;
      let sourceHeight = tex.sourceHeight || tex.height || 1;
      let top = Math.max(0, sizeGrid[0] || 0);
      let right = Math.max(0, sizeGrid[1] || 0);
      let bottom = Math.max(0, sizeGrid[2] || 0);
      let left = Math.max(0, sizeGrid[3] || 0);
      let destLeft = Math.min(left, width);
      let destRight = Math.max(destLeft, width - Math.min(right, width - destLeft));
      let destTop = Math.min(top, height);
      let destBottom = Math.max(destTop, height - Math.min(bottom, height - destTop));
      let srcRight = Math.max(left, sourceWidth - right);
      let srcBottom = Math.max(top, sourceHeight - bottom);
      let dstX = [x, x + destLeft, x + destRight, x + width];
      let dstY = [y, y + destTop, y + destBottom, y + height];
      let srcX = [0, left, srcRight, sourceWidth];
      let srcY = [0, top, srcBottom, sourceHeight];
      let uv = tex._uv || tex.uv || Texture.DEF_UV;
      let u0 = uv[0], v0 = uv[1];
      let u1 = uv[4] == null ? uv[2] : uv[4];
      let v1 = uv[5] == null ? uv[3] : uv[5];
      let textureResource = this._resolveGraphicsTextureResource(tex);
      let textureLayer = this._resolvedTextureLayer;
      let uvClip = this._getTextureUVClipRange(tex);
      if (sizeGrid[4] === 1 || (tex.uvrect && Config.uvClipMode === "cpu"))
         return this._tryAppend9GridTextureMeshOp(cmd, x, y, width, height, sizeGrid, textureResource, textureLayer, runner);
      let matrix = this._getMatrixState(runner);
      for (let row = 0; row < 3; row++) {
         let h = dstY[row + 1] - dstY[row];
         if (h <= 0)
            continue;
         for (let col = 0; col < 3; col++) {
            let w = dstX[col + 1] - dstX[col];
            if (w <= 0)
               continue;
            this._writeTextureQuadValues(dstX[col], dstY[row], w, h,
               u0 + (u1 - u0) * (srcX[col] / sourceWidth),
               v0 + (v1 - v0) * (srcY[row] / sourceHeight),
               u0 + (u1 - u0) * (srcX[col + 1] / sourceWidth),
               v0 + (v1 - v0) * (srcY[row + 1] / sourceHeight),
               cmd.color, this._getOpAlpha(runner, 1), this._getOpBlendMode(runner),
               textureLayer, matrix, textureResource, uvClip);
         }
      }
      return true;
   }

   private _resolveGraphicsTextureResource(texture: Texture | BaseTexture): GraphicsOp2DTextureHost {
      if (!texture)
         return null;
      this._host.addResRef(texture as Resource);
      let resource: BaseTexture = texture instanceof Texture ? texture.bitmap : texture;
      let layer = 0;
      let reg = TextureArrayRegistry2D.resolve(texture);
      if (reg && reg.array instanceof Texture2DArray) {
         resource = reg.array;
         layer = reg.layer | 0;
      }
      this._resolvedTextureLayer = layer;
      return resource;
   }

   private _getTextureUVClipRange(texture: Texture | BaseTexture): ArrayLike<number> | null {
      return Config.uvClipMode === "gpu" && texture instanceof Texture && texture.uvrect ? texture.uvrect : null;
   }

   private _getTextureUVRange(texture: Texture | BaseTexture, out: number[]): number[] {
      if (texture instanceof Texture && texture.uvrect) {
         out[0] = texture.uvrect[0];
         out[1] = texture.uvrect[1];
         out[2] = texture.uvrect[2];
         out[3] = texture.uvrect[3];
      }
      else {
         out[0] = 0;
         out[1] = 0;
         out[2] = 1;
         out[3] = 1;
      }
      return out;
   }

   private _tryAppend9GridTextureMeshOp(cmd: Draw9GridTextureCmd, x: number, y: number, width: number, height: number, sizeGrid: number[], textureResource: GraphicsOp2DTextureHost, textureLayer: number, runner: GraphicsRunner): boolean {
      let vb = VertexStream.pool.take(cmd.texture);
      let success = false;
      try {
         vb.contentRect.setTo(0, 0, width, height);
         if (cmd.color)
            vb.color.setABGR(cmd.color);
         let gridRect = this._gridRectScratch;
         let sourceWidth = vb.mainTex.sourceWidth;
         let sourceHeight = vb.mainTex.sourceHeight;
         gridRect.setTo(sizeGrid[3], sizeGrid[0],
            sourceWidth - sizeGrid[1] - sizeGrid[3],
            sourceHeight - sizeGrid[0] - sizeGrid[2]);
         genSliceMesh(vb, vb.contentRect, vb.uvRect, gridRect, sizeGrid[4] === 1 ? 0xff : 0);
         if (cmd.texture.uvrect && Config.uvClipMode === "cpu") {
            let clipped = UVClippingUtils.clipTrianglesByUVRange(vb.getVertices(), vb.getIndices(), vb.getUVs(), cmd.texture.uvrect, vb.getColors());
            success = this._writeGenericMeshValues(x, y, clipped.vertices, clipped.uvs, clipped.indices, clipped.colors,
               textureResource, textureLayer, cmd.color, this._getOpAlpha(runner, 1), this._getOpBlendMode(runner), this._getMatrixState(runner)) >= 0;
         }
         else {
            success = this._writeGenericMeshValues(x, y, vb.getVertices(), vb.getUVs(), vb.getIndices(), vb.getColors(),
               textureResource, textureLayer, cmd.color, this._getOpAlpha(runner, 1), this._getOpBlendMode(runner),
               this._getMatrixState(runner), this._getTextureUVClipRange(cmd.texture)) >= 0;
         }
      } finally {
         VertexStream.pool.recover(vb);
      }
      return success;
   }

   private _makeTextQuadGeometry(x: number, y: number, width: number, height: number, uv: ArrayLike<number>, italicDeg: number, pixelSnap: boolean, runner: GraphicsRunner): void {
      let vertices = this._textQuadVerticesScratch;
      let xoff = italicDeg !== 0 ? Math.tan(italicDeg * Math.PI / 180) * height : 0;
      let maxX = x + width;
      let maxY = y + height;
      let a0 = x + xoff;
      let a1 = y;
      let a2 = maxX + xoff;
      let a3 = y;
      let a4 = maxX;
      let a5 = maxY;
      let a6 = x;
      let a7 = maxY;

      if (runner && runner._matrixChanged) {
         let matrix = runner._curMat;
         let tx = matrix.tx;
         let ty = matrix.ty;
         if (matrix._bTransform) {
            let ma = matrix.a;
            let mb = matrix.b;
            let mc = matrix.c;
            let md = matrix.d;
            vertices[0] = a0 * ma + a1 * mc + tx;
            vertices[1] = a0 * mb + a1 * md + ty;
            vertices[2] = a2 * ma + a3 * mc + tx;
            vertices[3] = a2 * mb + a3 * md + ty;
            vertices[4] = a4 * ma + a5 * mc + tx;
            vertices[5] = a4 * mb + a5 * md + ty;
            vertices[6] = a6 * ma + a7 * mc + tx;
            vertices[7] = a6 * mb + a7 * md + ty;
         } else {
            vertices[0] = a0 + tx;
            vertices[1] = a1 + ty;
            vertices[2] = a2 + tx;
            vertices[3] = a3 + ty;
            vertices[4] = a4 + tx;
            vertices[5] = a5 + ty;
            vertices[6] = a6 + tx;
            vertices[7] = a7 + ty;
         }
      } else {
         vertices[0] = a0;
         vertices[1] = a1;
         vertices[2] = a2;
         vertices[3] = a3;
         vertices[4] = a4;
         vertices[5] = a5;
         vertices[6] = a6;
         vertices[7] = a7;
      }
      if (pixelSnap) {
         for (let i = 0; i < 8; i++)
            vertices[i] = Math.round(vertices[i]);
      }
      let uvs = this._textQuadUVScratch;
      uvs[0] = uv[0];
      uvs[1] = uv[1];
      uvs[2] = uv[2];
      uvs[3] = uv[3];
      uvs[4] = uv[4] == null ? uv[2] : uv[4];
      uvs[5] = uv[5] == null ? uv[3] : uv[5];
      uvs[6] = uv[6] == null ? uv[0] : uv[6];
      uvs[7] = uv[7] == null ? uv[5] : uv[7];
   }

   private _writeTextureQuadCommandValuesToOp(op: IGraphicsTextureQuadOp2D | IGraphicsMultiQuadOp2D | IGraphicsTextOp2D, cmd: DrawTextureCmd | DrawImageCmd, runner: GraphicsRunner = null): boolean {
      let tex = cmd.texture;
      let drawTextureCmd = cmd.cmdID === DrawTextureCmd.ID ? cmd as DrawTextureCmd : null;
      if (!tex)
         return false;

      let owner = this._host.owner;
      let x = cmd.x, y = cmd.y, w = cmd.width, h = cmd.height;
      if (drawTextureCmd && drawTextureCmd.percent && owner) {
         x *= owner.width;
         y *= owner.height;
         w *= owner.width;
         h *= owner.height;
      }

      let sourceWidth = tex.sourceWidth || tex.width || 1;
      let sourceHeight = tex.sourceHeight || tex.height || 1;
      let wRate = w / sourceWidth;
      let hRate = h / sourceHeight;
      x += tex.offsetX * wRate;
      y += tex.offsetY * hRate;
      w = tex.width * wRate;
      h = tex.height * hRate;

      let uv = drawTextureCmd ? (drawTextureCmd.uv || tex._uv) : tex._uv;
      let u0 = uv ? uv[0] : 0;
      let v0 = uv ? uv[1] : 0;
      let u1 = uv ? (uv[4] == null ? uv[2] : uv[4]) : 1;
      let v1 = uv ? (uv[5] == null ? uv[3] : uv[5]) : 1;
      let textureResource = this._resolveGraphicsTextureResource(tex);
      this._writeTextureQuadOp(op, x, y, w, h, u0, v0, u1, v1,
         cmd.color, this._getOpAlpha(runner, drawTextureCmd ? drawTextureCmd.alpha : 1),
         this._getOpBlendMode(runner, drawTextureCmd ? drawTextureCmd.blendMode : null),
         this._resolvedTextureLayer, this._getMatrixState(runner), textureResource);
      return true;
   }

   private _tryAppendMeshFactoryOp(cmd: DrawTrianglesCmd, runner: GraphicsRunner): boolean {
      let mesh = cmd.mesh;
      if (!mesh)
         return false;
      let vb = VertexStream.pool.take(cmd.texture);
      let success = false;
      try {
         if (vb.contentRect && runner && runner.sprite)
            vb.contentRect.setTo(0, 0, runner.sprite.width, runner.sprite.height);
         if (cmd.color && vb.color)
            vb.color.setABGR(cmd.color);
         mesh.onPopulateMesh(vb);
         let vertices = vb.getVertices ? vb.getVertices() : null;
         let uvs = vb.getUVs ? vb.getUVs() : null;
         let indices = vb.getIndices ? vb.getIndices() : null;
         let colors = vb.getColors ? vb.getColors() : null;
         if (vertices && indices && vertices.length > 0 && indices.length > 0) {
            let textureResource = cmd.texture ? this._resolveGraphicsTextureResource(cmd.texture) : null;
            let textureLayer = cmd.texture ? this._resolvedTextureLayer : 0;
            let matrix = this._getGenericMeshMatrix(cmd, runner);
            let packedColor = cmd.color == null ? 0xffffffff : cmd.color;
            let alpha = this._getOpAlpha(runner, cmd.alpha);
            let blendMode = this._getOpBlendMode(runner, cmd.blendMode);
            if (cmd.texture?.uvrect && Config.uvClipMode === "cpu" && uvs) {
               let clipped = UVClippingUtils.clipTrianglesByUVRange(vertices, indices, uvs, cmd.texture.uvrect, colors);
               success = this._writeGenericMeshValues(cmd.x, cmd.y, clipped.vertices, clipped.uvs, clipped.indices, clipped.colors,
                  textureResource, textureLayer, packedColor, alpha, blendMode, matrix) >= 0;
            }
            else {
               success = this._writeGenericMeshValues(cmd.x, cmd.y, vertices, uvs, indices, colors,
                  textureResource, textureLayer, packedColor, alpha, blendMode, matrix,
                  cmd.texture ? this._getTextureUVClipRange(cmd.texture) : null) >= 0;
            }
         }
      } catch (e) {
         console.error(e);
      } finally {
         VertexStream.pool.recover(vb);
      }
      return success;
   }

   private _writeTextureQuadValues(x: number, y: number, width: number, height: number,
      u0: number, v0: number, u1: number, v1: number,
      packedColor: number, alpha: number, blendMode: number,
      textureLayer: number, matrix: Matrix, textureResource: GraphicsOp2DTextureHost, uvClip: ArrayLike<number> | null = null): number {
      let op = this._opList.getTextureQuadTargetOp();
      this._writeTextureQuadOp(op, x, y, width, height, u0, v0, u1, v1,
         packedColor, alpha, blendMode, textureLayer, matrix, textureResource, uvClip);
      return this._opList.getOpIndex(op);
   }

   private _writeTextureQuadOp(op: IGraphicsTextureQuadOp2D | IGraphicsMultiQuadOp2D | IGraphicsTextOp2D,
      x: number, y: number, width: number, height: number,
      u0: number, v0: number, u1: number, v1: number,
      packedColor: number, alpha: number, blendMode: number,
      textureLayer: number, matrix: Matrix, textureResource: GraphicsOp2DTextureHost, uvClip: ArrayLike<number> | null = null): void {
      if (op.kind === GraphicsOp2DKind.MultiQuad || op.kind === GraphicsOp2DKind.Text) {
         let multiQuadOp = op as IGraphicsMultiQuadOp2D;
         this._recordActiveMultiQuadTexture(multiQuadOp, textureResource);
         multiQuadOp.addRecord(x, y, width, height, u0, v0, u1, v1,
            packedColor, alpha, blendMode, textureLayer || 0, matrix, uvClip);
      }
      else {
         let textureQuadOp = op as IGraphicsTextureQuadOp2D;
         textureQuadOp.texture = textureResource || null;
         textureQuadOp.writeRecord(x, y, width, height, u0, v0, u1, v1,
            packedColor, alpha, blendMode, textureLayer || 0, matrix, uvClip);
      }
   }

   private _recordActiveMultiQuadTexture(op: IGraphicsMultiQuadOp2D, texture: GraphicsOp2DTextureHost): void {
      if (this._activeMultiQuadOp && this._activeMultiQuadOp !== op)
         this.finalizeActiveCommandTextures();
      if (!this._activeMultiQuadOp) {
         this._activeMultiQuadOp = op;
         this._activeMultiQuadTextures.length = 0;
      }
      this._activeMultiQuadTextures[op.recordCount] = texture || null;
   }

   private _writeSolidQuadValues(x: number, y: number, width: number, height: number,
      packedColor: number, alpha: number, blendMode: number, matrix: Matrix): number {
      let op = this._opList.appendSolidQuadOp();
      op.writeRecord(x, y, width, height, packedColor, alpha, blendMode, matrix);
      return this._opList.getOpIndex(op);
   }

   private _writeFillTextureValues(x: number, y: number, width: number, height: number,
      u0: number, v0: number, u1: number, v1: number,
      repeatX: number, repeatY: number, offsetX: number, offsetY: number,
      texRangeX: number, texRangeY: number, texRangeWidth: number, texRangeHeight: number,
      packedColor: number, alpha: number, blendMode: number,
      textureLayer: number, matrix: Matrix, textureResource: GraphicsOp2DTextureHost, uvClip: ArrayLike<number> | null = null): number {
      let op = this._opList.appendFillTextureOp();
      op.texture = textureResource || null;
      op.writeRecord(x, y, width, height, u0, v0, u1, v1,
         repeatX, repeatY, offsetX, offsetY, texRangeX, texRangeY, texRangeWidth, texRangeHeight,
         packedColor, alpha, blendMode, textureLayer || 0, matrix, uvClip);
      return this._opList.getOpIndex(op);
   }

   private _writeGenericMeshValues(x: number, y: number, vertices: ArrayLike<number>, uvs: ArrayLike<number> | null,
      indices: ArrayLike<number>, colors: ArrayLike<number> | null,
      textureResource: GraphicsOp2DTextureHost, textureLayer: number,
      packedColor: number, alpha: number, blendMode: number, matrix: Matrix | null,
      uvClip: ArrayLike<number> | null = null,
      vertexOffset: number = 0, vertexCount: number = vertices ? (vertices.length - vertexOffset) >> 1 : 0,
      uvOffset: number = 0, indexOffset: number = 0, indexCount: number = indices ? indices.length - indexOffset : 0,
      colorOffset: number = 0): number {
      if (!vertices || !indices)
         return -1;
      let op = this._opList.appendMeshOp();
      op.texture = textureResource || null;
      op.writeMesh(
         x, y,
         vertices, vertexOffset, vertexCount,
         uvs, uvOffset,
         indices, indexOffset, indexCount,
         colors, colorOffset,
         packedColor, alpha, blendMode, textureLayer || 0, matrix, uvClip);
      return this._opList.getOpIndex(op);
   }

   private _tryAppendMatrixTextureMeshOp(cmd: DrawTextureCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      let tex = cmd.texture;
      if (!tex || !cmd.matrix)
         return false;
      let owner = this._host.owner;
      let x = cmd.x, y = cmd.y, w = cmd.width, h = cmd.height;
      if (cmd.percent && owner) {
         x *= owner.width;
         y *= owner.height;
         w *= owner.width;
         h *= owner.height;
      }
      let sourceWidth = tex.sourceWidth || tex.width || 1;
      let sourceHeight = tex.sourceHeight || tex.height || 1;
      let wRate = w / sourceWidth;
      let hRate = h / sourceHeight;
      x += tex.offsetX * wRate;
      y += tex.offsetY * hRate;
      w = tex.width * wRate;
      h = tex.height * hRate;
      if (w <= 0 || h <= 0)
         return false;
      let uv = cmd.uv || tex._uv || Texture.DEF_UV;
      let textureResource = this._resolveGraphicsTextureResource(tex);
      let textureLayer = this._resolvedTextureLayer;
      let mat = this._textureMeshMatrixScratch;
      mat.a = cmd.matrix.a;
      mat.b = cmd.matrix.b;
      mat.c = cmd.matrix.c;
      mat.d = cmd.matrix.d;
      mat.tx = cmd.matrix.tx;
      mat.ty = cmd.matrix.ty;
      if (runner && runner._curMat)
         Matrix.mul(mat, runner._curMat, mat);
      let vertices = this._textureQuadVerticesScratch;
      vertices[0] = 0; vertices[1] = 0;
      vertices[2] = w; vertices[3] = 0;
      vertices[4] = w; vertices[5] = h;
      vertices[6] = 0; vertices[7] = h;
      let uvs = this._textureQuadUVScratch;
      uvs[0] = uv[0];
      uvs[1] = uv[1];
      uvs[2] = uv[2];
      uvs[3] = uv[3];
      uvs[4] = uv[4] == null ? uv[2] : uv[4];
      uvs[5] = uv[5] == null ? uv[3] : uv[5];
      uvs[6] = uv[6] == null ? uv[0] : uv[6];
      uvs[7] = uv[7] == null ? uv[5] : uv[7];
      this._writeGenericMeshValues(x, y,
         vertices,
         uvs,
         TEXTURE_QUAD_INDICES,
         null,
         textureResource,
         textureLayer,
         cmd.color,
         this._getOpAlpha(runner, cmd.alpha),
         this._getOpBlendMode(runner, cmd.blendMode),
         mat, this._getTextureUVClipRange(tex));
      return true;
   }

   private _appendRectStrokeMesh(cmd: DrawRectCmd, cmdIndex: number, runner: GraphicsRunner): boolean {
      let owner = this._host.owner;
      let x = cmd.x, y = cmd.y, width = cmd.width, height = cmd.height;
      if (cmd.percent && owner) {
         x *= owner.width;
         y *= owner.height;
         width *= owner.width;
         height *= owner.height;
      }
      let offset = (cmd.lineWidth >= 1 && cmd.lineColor) ? cmd.lineWidth / 2 : 0;
      let lineOffset = cmd.lineColor ? cmd.lineWidth : 0;
      x += offset;
      y += offset;
      width -= lineOffset;
      height -= lineOffset;
      if (width <= 0 || height <= 0)
         return false;
      this._shapePathScratch.length = 0;
      this._shapePathScratch.push(x, y, x + width, y, x + width, y + height, x, y + height);
      return this._appendLineMesh(this._shapePathScratch, cmd.lineWidth, true, this._toABGR(cmd.lineColor), cmdIndex, runner);
   }

   private _appendLineMesh(points: number[], lineWidth: number, loop: boolean, packedColor: number, cmdIndex: number, runner: GraphicsRunner): boolean {
      if (!points || points.length < 4 || lineWidth <= 0)
         return false;
      let lineGeometry = BasePoly.createLine2Geometry(points, lineWidth, loop);
      if (!lineGeometry || lineGeometry.vertexCount <= 0 || lineGeometry.indexCount <= 0)
         return false;
      this._writeGenericMeshValues(0, 0,
         lineGeometry.vertices,
         null,
         lineGeometry.indices,
         null,
         null, 0, packedColor, this._getOpAlpha(runner, 1), this._getOpBlendMode(runner), this._getMatrixState(runner), null,
          0, lineGeometry.vertexCount, 0, 0, lineGeometry.indexCount);
      return true;
   }

   private _makeCirclePath(x: number, y: number, radius: number, segments: number): void {
      let path = this._shapePathScratch;
      path.length = 0;
      for (let i = 0; i < segments; i++) {
         let angle = i / segments * Math.PI * 2;
         path.push(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
   }

   private _appendCircleFillMesh(x: number, y: number, radius: number, segments: number, packedColor: number, cmdIndex: number, runner: GraphicsRunner): boolean {
      let vertices = this._shapeVerticesScratch;
      let indices = this._shapeIndicesScratch;
      vertices.length = 0;
      indices.length = 0;
      vertices.push(x, y);
      for (let i = 0; i < segments; i++) {
         let angle = i / segments * Math.PI * 2;
         vertices.push(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
      for (let i = 0; i < segments; i++) {
         indices.push(0, i + 1, i + 1 === segments ? 1 : i + 2);
      }
      this._writeGenericMeshValues(0, 0, vertices, null, indices, null,
         null, 0, packedColor, this._getOpAlpha(runner, 1), this._getOpBlendMode(runner), this._getMatrixState(runner));
      return true;
   }

   private _copyOffsetPoints(points: ArrayLike<number>, offsetX: number, offsetY: number): void {
      let path = this._shapePathScratch;
      path.length = 0;
      for (let i = 0, n = points.length; i < n; i += 2)
         path.push(points[i] + offsetX, points[i + 1] + offsetY);
   }

   private _offsetPathPoints(points: number[], offsetX: number, offsetY: number): void {
      if (!offsetX && !offsetY)
         return;
      for (let i = 0, n = points.length; i < n; i += 2) {
         points[i] += offsetX;
         points[i + 1] += offsetY;
      }
   }

   private _collectDrawPathSubpaths(paths: readonly GraphicsDrawPathSegment[] | null, offsetX: number, offsetY: number): boolean {
      let subpaths = this._shapeSubpathsScratch;
      let closed = this._shapeSubpathClosedScratch;
      subpaths.length = 0;
      closed.length = 0;
      if (!paths)
         return false;
      let points: number[] = null;
      let closedCurrent = false;

      let finishCurrent = () => {
         if (!points)
            return;
         if (closedCurrent && points.length >= 4) {
            let last = points.length - 2;
            if (points[last] === points[0] && points[last + 1] === points[1])
               points.length -= 2;
         }
         if (points.length >= 4) {
            subpaths.push(points);
            closed.push(closedCurrent);
         }
         points = null;
         closedCurrent = false;
      };

      for (let i = 0, n = paths.length; i < n; i++) {
         let item = paths[i];
         switch (item[0]) {
            case "moveTo":
               finishCurrent();
               points = [];
               this._appendDrawPathPoint(points, item[1] + offsetX, item[2] + offsetY);
               break;
            case "lineTo":
               if (!points)
                  points = [];
               this._appendDrawPathPoint(points, item[1] + offsetX, item[2] + offsetY);
               break;
            case "arcTo":
               if (!points)
                  points = [];
               this._appendDrawPathArcTo(points, item[1] + offsetX, item[2] + offsetY, item[3] + offsetX, item[4] + offsetY, item[5] || 0);
               break;
            case "closePath":
               closedCurrent = true;
               break;
         }
      }
      finishCurrent();
      return subpaths.length > 0;
   }

   private _appendDrawPathPoint(points: number[], x: number, y: number): void {
      let last = points.length - 2;
      if (last >= 0 && points[last] === x && points[last + 1] === y)
         return;
      points.push(x, y);
   }

   private _appendDrawPathArcTo(points: number[], x1: number, y1: number, x2: number, y2: number, radius: number): void {
      if (points.length < 2) {
         this._appendDrawPathPoint(points, x1, y1);
         return;
      }

      let p0x = points[points.length - 2];
      let p0y = points[points.length - 1];
      let v0x = p0x - x1;
      let v0y = p0y - y1;
      let v1x = x2 - x1;
      let v1y = y2 - y1;
      let len0 = Math.sqrt(v0x * v0x + v0y * v0y);
      let len1 = Math.sqrt(v1x * v1x + v1y * v1y);
      if (radius <= 0 || len0 <= 0.00001 || len1 <= 0.00001) {
         this._appendDrawPathPoint(points, x1, y1);
         return;
      }

      v0x /= len0;
      v0y /= len0;
      v1x /= len1;
      v1y /= len1;
      let dot = Math.max(-1, Math.min(1, v0x * v1x + v0y * v1y));
      let angle = Math.acos(dot);
      if (angle <= 0.0001 || Math.PI - angle <= 0.0001) {
         this._appendDrawPathPoint(points, x1, y1);
         return;
      }

      let tangentDistance = radius / Math.tan(angle * 0.5);
      if (!isFinite(tangentDistance) || tangentDistance <= 0) {
         this._appendDrawPathPoint(points, x1, y1);
         return;
      }
      tangentDistance = Math.min(tangentDistance, len0, len1);
      let sx = x1 + v0x * tangentDistance;
      let sy = y1 + v0y * tangentDistance;
      let ex = x1 + v1x * tangentDistance;
      let ey = y1 + v1y * tangentDistance;
      this._appendDrawPathPoint(points, sx, sy);

      let segments = Math.max(3, Math.min(24, Math.ceil(Math.abs(angle) * radius / 4)));
      for (let i = 1; i <= segments; i++) {
         let t = i / segments;
         let inv = 1 - t;
         let x = inv * inv * sx + 2 * inv * t * x1 + t * t * ex;
         let y = inv * inv * sy + 2 * inv * t * y1 + t * t * ey;
         this._appendDrawPathPoint(points, x, y);
      }
   }

   private _appendPathFillAndStroke(points: number[], fillColor: GraphicsColorInput, lineColor: GraphicsColorInput, lineWidth: number, loop: boolean, cmdIndex: number, runner: GraphicsRunner): boolean {
      let wrote = false;
      if (fillColor != null)
         wrote = this._appendPolygonFillMesh(points, this._toABGR(fillColor), cmdIndex, runner);
      if (lineColor != null && lineWidth > 0)
         wrote = this._appendLineMesh(points, lineWidth, loop, this._toABGR(lineColor), cmdIndex, runner) || wrote;
      return wrote;
   }

   private _appendPolygonFillMesh(points: number[], packedColor: number, cmdIndex: number, runner: GraphicsRunner): boolean {
      if (!points || points.length < 6)
         return false;
      let indices = Earcut.earcut(points, null, 2);
      if (!indices || indices.length <= 0) {
         if (points.length === 6)
            indices = [0, 1, 2];
         else
            return false;
      }
      this._writeGenericMeshValues(0, 0, points, null, indices, null,
         null, 0, packedColor, this._getOpAlpha(runner, 1), this._getOpBlendMode(runner), this._getMatrixState(runner));
      return true;
   }

   private _makeEllipsePath(x: number, y: number, radiusX: number, radiusY: number, segments: number): void {
      let path = this._shapePathScratch;
      path.length = 0;
      for (let i = 0; i < segments; i++) {
         let angle = i / segments * Math.PI * 2;
         path.push(x + Math.cos(angle) * radiusX, y + Math.sin(angle) * radiusY);
      }
   }

   private _makePiePath(x: number, y: number, radius: number, startAngle: number, endAngle: number, segments: number): void {
      let path = this._shapePathScratch;
      path.length = 0;
      path.push(x, y);
      for (let i = 0; i <= segments; i++) {
         let t = i / segments;
         let angle = startAngle + (endAngle - startAngle) * t;
         path.push(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
   }

   private _makeRoundRectPath(x: number, y: number, width: number, height: number, lt: number, rt: number, rb: number, lb: number, minNum: number, segPixel: number): void {
      let maxRadius = Math.max(0, Math.min(width, height) / 2);
      lt = Math.min(Math.max(lt || 0, 0), maxRadius);
      rt = Math.min(Math.max(rt || 0, 0), maxRadius);
      rb = Math.min(Math.max(rb || 0, 0), maxRadius);
      lb = Math.min(Math.max(lb || 0, 0), maxRadius);
      let path = this._shapePathScratch;
      path.length = 0;
      let segmentBase = Math.max(2, Math.ceil((minNum || 20) / 4));
      this._appendArcPath(path, x + lt, y + lt, lt, Math.PI, Math.PI * 1.5, segmentBase, segPixel);
      this._appendArcPath(path, x + width - rt, y + rt, rt, Math.PI * 1.5, Math.PI * 2, segmentBase, segPixel);
      this._appendArcPath(path, x + width - rb, y + height - rb, rb, 0, Math.PI * 0.5, segmentBase, segPixel);
      this._appendArcPath(path, x + lb, y + height - lb, lb, Math.PI * 0.5, Math.PI, segmentBase, segPixel);
   }

   private _appendArcPath(path: number[], x: number, y: number, radius: number, startAngle: number, endAngle: number, minSegments: number, segPixel: number): void {
      if (radius <= 0) {
         path.push(x, y);
         return;
      }
      let segments = Math.max(minSegments, Math.ceil(Math.abs(endAngle - startAngle) * radius / Math.max(segPixel || 5, 0.1)));
      for (let i = 0; i <= segments; i++) {
         if (path.length > 0 && i === 0)
            continue;
         let angle = startAngle + (endAngle - startAngle) * (i / segments);
         path.push(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
   }

   private _getMatrixState(runner: GraphicsRunner): Matrix | null {
      let mat = runner ? runner._curMat : null;
      if (!mat || (mat.a === 1 && mat.b === 0 && mat.c === 0 && mat.d === 1 && mat.tx === 0 && mat.ty === 0))
         return null;
      return mat;
   }

   private _getGenericMeshMatrix(cmd: DrawTrianglesCmd, runner: GraphicsRunner): Matrix | null {
      let mat = this._genericMeshMatrixScratch;
      let cmdMatrix = cmd.matrix;
      if (cmdMatrix) {
         mat.a = cmdMatrix.a;
         mat.b = cmdMatrix.b;
         mat.c = cmdMatrix.c;
         mat.d = cmdMatrix.d;
         mat.tx = cmdMatrix.tx;
         mat.ty = cmdMatrix.ty;
      }
      else {
         mat.a = 1;
         mat.b = 0;
         mat.c = 0;
         mat.d = 1;
         mat.tx = 0;
         mat.ty = 0;
      }
      if (runner && runner._curMat)
         Matrix.mul(mat, runner._curMat, mat);
      if (mat.a === 1 && mat.b === 0 && mat.c === 0 && mat.d === 1 && mat.tx === 0 && mat.ty === 0)
         return null;
      return mat;
   }

   private _toABGR(value: GraphicsColorInput): number {
      if (typeof value === "number")
         return value;
      return value != null ? ColorUtils.create(value).numColor : 0xffffffff;
   }

   private _getOpAlpha(runner: GraphicsRunner, localAlpha: number): number {
      return (runner ? runner.globalAlpha : 1) * (localAlpha == null ? 1 : localAlpha);
   }

   private _getOpBlendMode(runner: GraphicsRunner, override: GraphicsBlendModeInput = null): number {
      let blendMode = override == null ? (runner ? runner.globalCompositeOperation : BlendMode.normal) : override;
      return typeof blendMode === "string" ? this._parseBlendMode(blendMode) : (blendMode == null ? BlendMode.normal : blendMode);
   }

   private _parseBlendMode(value: string): BlendMode {
      switch (value) {
         case "normal":
            return BlendMode.normal;
         case "add":
            return BlendMode.add;
         case "multiply":
            return BlendMode.multiply;
         case "screen":
            return BlendMode.screen;
         case "overlay":
            return BlendMode.overlay;
         case "light":
            return BlendMode.light;
         case "lighter":
            return BlendMode.lighter;
         case "mask":
            return BlendMode.mask;
         case "destinationOut":
         case "destination-out":
            return BlendMode.destinationOut;
         case "addOld":
            return BlendMode.addOld;
         case "lighterOld":
            return BlendMode.lighterOld;
         case "sourceAlpha":
            return BlendMode.sourceAlpha;
         default:
            return BlendMode.normal;
      }
   }
}
