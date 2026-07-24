import { Matrix } from "../../../maths/Matrix";
import { Point } from "../../../maths/Point";
import { Rectangle } from "../../../maths/Rectangle";
import { Texture } from "../../../resource/Texture";
import type { BaseTexture } from "../../../resource/BaseTexture";
import { ColorUtils } from "../../../utils/ColorUtils";
import { BlendMode } from "../../../webgl/canvas/BlendMode";
import { Bezier } from "../../../maths/Bezier";
import { BasePoly } from "../../../webgl/shapes/BasePoly";
import { Earcut } from "../../../webgl/shapes/Earcut";
import { VertexStream } from "../../../utils/VertexStream";
import { genSliceMesh } from "../../mesh/MeshFactory";
import { UVClippingUtils } from "../../../webgl/utils/UVClippingUtils";
import { TextureArrayRegistry2D } from "../../../webgl/utils/TextureArrayRegistry2D";
import type { TextRenderTextureSink } from "../../../webgl/text/TextRender";
import type { IGraphicsFillTextureOp2D, IGraphicsMeshOp2D, IGraphicsMultiQuadOp2D, IGraphicsSolidQuadOp2D, IGraphicsTextureQuadOp2D } from "../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { Config } from "../../../../Config";
import type { Sprite } from "../../Sprite";
import type { IGraphicsCmd } from "../../IGraphics";
import { Draw9GridTextureCmd } from "../../cmd/Draw9GridTextureCmd";
import { DrawCircleCmd } from "../../cmd/DrawCircleCmd";
import { DrawCurvesCmd } from "../../cmd/DrawCurvesCmd";
import { DrawEllipseCmd } from "../../cmd/DrawEllipseCmd";
import { DrawImageCmd } from "../../cmd/DrawImageCmd";
import { DrawLineCmd } from "../../cmd/DrawLineCmd";
import { DrawLinesCmd } from "../../cmd/DrawLinesCmd";
import { DrawPathCmd } from "../../cmd/DrawPathCmd";
import { DrawPieCmd } from "../../cmd/DrawPieCmd";
import { DrawPolyCmd } from "../../cmd/DrawPolyCmd";
import { DrawRectCmd } from "../../cmd/DrawRectCmd";
import { DrawRoundRectCmd } from "../../cmd/DrawRoundRectCmd";
import { DrawTextureCmd } from "../../cmd/DrawTextureCmd";
import { DrawTexturesCmd } from "../../cmd/DrawTexturesCmd";
import { DrawTrianglesCmd } from "../../cmd/DrawTrianglesCmd";
import { FillTextCmd } from "../../cmd/FillTextCmd";
import { FillTextureCmd } from "../../cmd/FillTextureCmd";
import type { GraphicsRunner } from "../GraphicsRunner";
import type { GraphicsCommandStreamMode } from "./GraphicsCommandStreamMode";
import { GraphicsGeometryHelper, GraphicsOpRenderStateHelper, GraphicsTextureDataHelper } from "./GraphicsPipelineHelpers";
import { GraphicsOp2DKind, type GraphicsBlendModeInput, type GraphicsColorInput, type GraphicsOp2DTextureHost } from "./GraphicsPipelineTypes";

const GRAPHICS_COMPILE_SAVE_STRIDE = 8;
const COMPILE_FILL_RANGE: number[] = [0, 0, 1, 1];
const COMPILE_FILL_GEOMETRY: number[] = new Array(12);
const COMPILE_TEXTURE_VERTICES: number[] = new Array(8);
const COMPILE_TEXTURE_UVS: number[] = new Array(8);
const COMPILE_QUAD_INDICES: number[] = [0, 2, 1, 0, 3, 2];
const COMPILE_TRIANGLE_INDICES: number[] = [0, 1, 2];
const COMPILE_MATRIX = new Matrix();
const COMPILE_PATH: number[] = [];
const COMPILE_VERTICES: number[] = [];
const COMPILE_INDICES: number[] = [];
const COMPILE_SUBPATHS: number[][] = [];
const COMPILE_SUBPATH_CLOSED: boolean[] = [];
const COMPILE_NINE_GRID_AXES: number[] = new Array(16);
const COMPILE_TEXT_VERTICES: number[] = new Array(8);
const COMPILE_TEXT_UVS: number[] = new Array(8);
const COMPILE_GRID_RECT = new Rectangle();
const EMPTY_SIZE_GRID: number[] = [0, 0, 0, 0, 0];
const TWO_PI = Math.PI * 2;

/** Lightweight retained state context used only by Graphics CommandStream compilation. @internal */
export class GraphicsCompileContext {
   _curMat: Matrix = new Matrix();
   _matrixChanged: boolean = false;
   sprite: Sprite = null;
   _textRender: GraphicsRunner["_textRender"] = null;

   private _alpha: number = 1;
   private _blendMode: BlendMode = BlendMode.normal;
   private _saveFrames: Float64Array = null;
   private _saveDepth: number = 0;
   private _saveCapacity: number = 0;
   private _mode: GraphicsCommandStreamMode = null;
   private _resolvedTextureSource: BaseTexture = null;
   private _resolvedTextureResource: GraphicsOp2DTextureHost = null;
   private _resolvedTextureLayer: number = 0;
   private readonly _textTextureSink: TextRenderTextureSink =
      (texture, x, y, width, height, uv, color, italicDeg, pixelSnap) =>
         this._appendTextTexture(texture, x, y, width, height, uv, color, italicDeg, pixelSnap);

   /** Bind this single shared context for one synchronous compile transaction. */
   begin(mode: GraphicsCommandStreamMode): void {
      if (this._mode)
         throw new Error("GraphicsCompileContext is not reentrant");
      this._mode = mode;
   }

   /** Release all renderer-owned references after a compile transaction. */
   end(): void {
      this._clearResolvedTexture();
      this._mode = null;
      this.sprite = null;
      this._textRender = null;
      this._saveDepth = 0;
   }

   reset(sprite: Sprite, blendMode: BlendMode, textRender: GraphicsRunner["_textRender"]): void {
      this.sprite = sprite;
      this._textRender = textRender;
      this._curMat.identity();
      this._matrixChanged = false;
      this._alpha = 1;
      this._blendMode = blendMode == null ? BlendMode.normal : blendMode;
      this._saveDepth = 0;
   }

   loadStateFrom(source: Float64Array, offset: number, sprite: Sprite, textRender: GraphicsRunner["_textRender"]): void {
      this.sprite = sprite;
      this._textRender = textRender;
      let mat = this._curMat;
      mat.setTo(source[offset], source[offset + 1], source[offset + 2], source[offset + 3], source[offset + 4], source[offset + 5]);
      mat._checkTransform();
      this._matrixChanged = mat.a !== 1 || mat.b !== 0 || mat.c !== 0 || mat.d !== 1 || mat.tx !== 0 || mat.ty !== 0;
      this._alpha = source[offset + 6];
      this._blendMode = source[offset + 7];
      this._saveDepth = 0;
   }

   alpha(value: number): void {
      this.globalAlpha *= value;
   }

   compileCommand(cmd: IGraphicsCmd, isStateCommand: boolean = false): void {
      if (!cmd)
         return;
      let mode = this._mode;
      if (isStateCommand) {
         cmd.run(this, 0, 0);
         return;
      }
      mode._beginActiveCommandTextures();
      this._clearResolvedTexture();
      switch (cmd.cmdID) {
         case FillTextCmd.ID:
            (cmd as FillTextCmd).emitTextureQuads(this, 0, 0, this._textTextureSink);
            break;
         case Draw9GridTextureCmd.ID:
            this._draw9GridTexture(cmd as Draw9GridTextureCmd);
            break;
         case DrawRectCmd.ID:
         case DrawTexturesCmd.ID:
         case FillTextureCmd.ID:
         case DrawTextureCmd.ID:
         case DrawImageCmd.ID:
         case DrawLineCmd.ID:
         case DrawLinesCmd.ID:
         case DrawCircleCmd.ID:
         case DrawEllipseCmd.ID:
         case DrawPieCmd.ID:
         case DrawPolyCmd.ID:
         case DrawRoundRectCmd.ID:
         case DrawCurvesCmd.ID:
         case DrawPathCmd.ID:
         case DrawTrianglesCmd.ID:
            cmd.run(this, 0, 0);
            break;
      }
      mode.finalizeActiveCommandTextures();
   }

   drawTexture(texture: Texture, x: number, y: number, width: number, height: number, color: number = 0xffffffff): void {
      this._appendTextureQuad(texture, x, y, width, height, null, color, 1, null);
   }

   drawTextureWithTransform(texture: Texture, x: number, y: number, width: number, height: number,
      transform: Matrix | null, tx: number, ty: number, alpha: number, blendMode: BlendMode | string | null,
      uv?: ArrayLike<number>, color: number = 0xffffffff): void {
      if (!transform) {
         this._appendTextureQuad(texture, x + tx, y + ty, width, height, uv, color, alpha, blendMode);
         return;
      }
      let mode = this._mode;
      if (!mode._prepareTexture(texture) || width <= 0 || height <= 0)
         return;
      uv = uv || texture._uv || texture.uv || Texture.DEF_UV;
      let mat = COMPILE_MATRIX;
      mat.setTo(transform.a, transform.b, transform.c, transform.d, transform.tx + tx, transform.ty + ty);
      Matrix.mul(mat, this._curMat, mat);
      GraphicsGeometryHelper.writeTextureQuad(COMPILE_TEXTURE_VERTICES, COMPILE_TEXTURE_UVS, width, height, uv);
      let resource = this._resolveTextureResource(texture);
      this._writeMesh(x, y, COMPILE_TEXTURE_VERTICES, COMPILE_TEXTURE_UVS, COMPILE_QUAD_INDICES, null,
         resource, this._resolvedTextureLayer, color, this._opAlpha(alpha), this._opBlend(blendMode), mat,
         GraphicsTextureDataHelper.getUVClipRange(texture));
   }

   drawTextures(texture: Texture, pos: ArrayLike<number>, tx: number, ty: number, colors: number[]): void {
      let mode = this._mode;
      if (!pos || pos.length < 2 || !mode._prepareTexture(texture) || texture.width <= 0 || texture.height <= 0)
         return;
      let uv = texture._uv || texture.uv || Texture.DEF_UV;
      let resource = this._resolveTextureResource(texture);
      let matrix = this._matrixState();
      for (let i = 0, p = 0, n = pos.length >> 1; i < n; i++, p += 2)
         this._writeTextureQuad(pos[p] + tx, pos[p + 1] + ty, texture.width, texture.height,
            uv[0], uv[1], uv[4] == null ? uv[2] : uv[4], uv[5] == null ? uv[3] : uv[5],
            colors && typeof colors[i] === "number" ? colors[i] : 0xffffffff,
            this._opAlpha(1), this._opBlend(), this._resolvedTextureLayer, matrix, resource,
            GraphicsTextureDataHelper.getUVClipRange(texture));
   }

   drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): void {
      if (width <= 0 || height <= 0)
         return;
      if (fillColor != null)
         this._writeSolidQuad(x, y, width, height, this._toABGR(fillColor),
            this._opAlpha(1), this._opBlend(), this._matrixState());
      if (lineColor != null && lineWidth > 0) {
         COMPILE_PATH.length = 0;
         COMPILE_PATH.push(x, y, x + width, y, x + width, y + height, x, y + height);
         this._appendLineMesh(COMPILE_PATH, lineWidth, true, this._toABGR(lineColor));
      }
   }

   fillTexture(texture: Texture, x: number, y: number, width: number, height: number, type: string, offset: Point, color: number): void {
      let mode = this._mode;
      if (!mode._prepareTexture(texture))
         return;
      let geometry = COMPILE_FILL_GEOMETRY;
      if (!GraphicsGeometryHelper.writeFillTextureGeometry(geometry, x, y, width, height,
         texture.width || 1, texture.height || 1, type, offset ? offset.x : 0, offset ? offset.y : 0))
         return;
      let resource = this._resolveTextureResource(texture);
      let range = GraphicsTextureDataHelper.writeUVRange(texture, COMPILE_FILL_RANGE);
      this._writeFillTexture(geometry[0], geometry[1], geometry[2], geometry[3],
         geometry[4], geometry[5], geometry[6], geometry[7], geometry[8], geometry[9], geometry[10], geometry[11],
         range[0], range[1], range[2], range[3], color, this._opAlpha(1), this._opBlend(),
         this._resolvedTextureLayer, this._matrixState(), resource, GraphicsTextureDataHelper.getUVClipRange(texture));
   }

   _drawLine(x: number, y: number, fromX: number, fromY: number, toX: number, toY: number,
      lineColor: any, lineWidth: number, vid: number): void {
      if (lineColor == null || lineWidth <= 0)
         return;
      COMPILE_PATH.length = 0;
      COMPILE_PATH.push(fromX + x, fromY + y, toX + x, toY + y);
      this._appendLineMesh(COMPILE_PATH, lineWidth, false, this._toABGR(lineColor));
   }

   _drawLines(x: number, y: number, points: any[], lineColor: any, lineWidth: number, vid: number): void {
      if (!points || points.length < 4 || lineColor == null || lineWidth <= 0)
         return;
      GraphicsGeometryHelper.copyOffsetPoints(COMPILE_PATH, points, x, y);
      this._appendLineMesh(COMPILE_PATH, lineWidth, false, this._toABGR(lineColor));
   }

   _drawCircle(x: number, y: number, radius: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): void {
      if (radius <= 0)
         return;
      let segments = GraphicsGeometryHelper.calcArcSegmentsWithScale(radius, this._tessellationScale(), 40, 5);
      GraphicsGeometryHelper.makeCirclePath(COMPILE_PATH, x, y, radius, segments);
      if (fillColor != null) {
         GraphicsGeometryHelper.writeCircleFan(COMPILE_VERTICES, COMPILE_INDICES, x, y, radius, segments);
         this._writeColorMesh(COMPILE_VERTICES, COMPILE_INDICES, this._toABGR(fillColor));
      }
      if (lineColor != null && lineWidth > 0)
         this._appendLineMesh(COMPILE_PATH, lineWidth, true, this._toABGR(lineColor));
   }

   _drawEllipse(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): void {
      if (width <= 0 || height <= 0)
         return;
      let segments = GraphicsGeometryHelper.calcArcSegmentsWithScale(width, this._tessellationScale(), 40, 5);
      GraphicsGeometryHelper.makeEllipsePath(COMPILE_PATH, x, y, width, height, segments);
      this._appendPathFillAndStroke(COMPILE_PATH, fillColor, lineColor, lineWidth, true);
   }

   _drawPie(x: number, y: number, radius: number, startAngle: number, endAngle: number,
      fillColor: any, lineColor: any, lineWidth: number, vid: number): void {
      if (radius <= 0)
         return;
      if (startAngle > endAngle) {
         let temp = startAngle;
         startAngle = endAngle;
         endAngle = temp;
      }
      if (endAngle - startAngle > TWO_PI)
         endAngle = startAngle + TWO_PI;
      let segments = GraphicsGeometryHelper.calcArcSegmentsWithScale(radius, this._tessellationScale(), 20, 5);
      GraphicsGeometryHelper.makePiePath(COMPILE_PATH, x, y, radius, startAngle, endAngle, segments);
      this._appendPathFillAndStroke(COMPILE_PATH, fillColor, lineColor, lineWidth, true);
   }

   _drawPoly(x: number, y: number, points: any[], fillColor: any, lineColor: any, lineWidth: number, isConvexPolygon: boolean, vid: number): void {
      if (!points || points.length < 6)
         return;
      GraphicsGeometryHelper.copyOffsetPoints(COMPILE_PATH, points, x, y);
      this._appendPathFillAndStroke(COMPILE_PATH, fillColor, lineColor, lineWidth, true);
   }

   _drawRoundRect(x: number, y: number, width: number, height: number, lt: number, rt: number, lb: number, rb: number,
      fillColor: any, lineColor: any, lineWidth: number, minNum: number = 20, segPixel: number = 5): void {
      if (width <= 0 || height <= 0)
         return;
      GraphicsGeometryHelper.makeRoundRectPath(COMPILE_PATH, x, y, width, height,
         lt, rt, rb, lb, minNum || 20, segPixel || 5, this._tessellationScale());
      this._appendPathFillAndStroke(COMPILE_PATH, fillColor, lineColor, lineWidth, true);
   }

   drawCurves(x: number, y: number, points: any[], lineColor: any, lineWidth: number): void {
      if (!points || points.length < 6 || lineColor == null || lineWidth <= 0)
         return;
      COMPILE_PATH.length = 0;
      Bezier.getPoints(points, 30, 2, COMPILE_PATH);
      if (COMPILE_PATH.length < 4)
         return;
      GraphicsGeometryHelper.offsetPoints(COMPILE_PATH, x, y);
      this._appendLineMesh(COMPILE_PATH, lineWidth, false, this._toABGR(lineColor));
   }

   _drawPath(x: number, y: number, paths: any[], brush: any, pen: any): void {
      let count = GraphicsGeometryHelper.collectDrawPathSubpaths(paths, x, y, COMPILE_SUBPATHS, COMPILE_SUBPATH_CLOSED);
      if (count === 0)
         return;
      let fillColor = brush ? brush.fillStyle : null;
      let lineColor = pen ? pen.strokeStyle : null;
      let lineWidth = pen && pen.lineWidth != null ? pen.lineWidth : 1;
      for (let i = 0; i < count; i++)
         this._appendPathFillAndStroke(COMPILE_SUBPATHS[i], fillColor, lineColor, lineWidth, COMPILE_SUBPATH_CLOSED[i]);
   }

   drawTriangles(texture: Texture | BaseTexture, x: number, y: number,
      vertices: ArrayLike<number>, uvs: ArrayLike<number>, indices: ArrayLike<number>, matrix?: Matrix,
      alpha?: number, blendMode?: BlendMode | string, color?: number, colors?: ArrayLike<number>, uvRange?: ArrayLike<number>): void {
      if (!vertices || !uvs || !indices || vertices.length < 2 || indices.length <= 0)
         return;
      let mode = this._mode;
      let resource: GraphicsOp2DTextureHost = null;
      let layer = 0;
      if (texture) {
         if (texture instanceof Texture) {
            if (!mode._prepareTexture(texture))
               return;
            resource = this._resolveTextureResource(texture);
         } else {
            if (texture.destroyed)
               return;
            resource = this._resolveBaseTextureResource(texture);
         }
         layer = this._resolvedTextureLayer;
      }
      this._writeMesh(x, y, vertices, uvs, indices, colors, resource, layer,
         color == null ? 0xffffffff : color, this._opAlpha(alpha == null ? 1 : alpha), this._opBlend(blendMode),
         GraphicsGeometryHelper.combineMatrix(COMPILE_MATRIX, matrix, this._curMat), uvRange);
   }

   private _appendTextureQuad(texture: Texture, x: number, y: number, width: number, height: number,
      uv: ArrayLike<number>, color: number, alpha: number, blendMode: GraphicsBlendModeInput): boolean {
      let mode = this._mode;
      if (!mode._prepareTexture(texture))
         return false;
      uv = uv || texture._uv || texture.uv || Texture.DEF_UV;
      let resource = this._resolveTextureResource(texture);
      this._writeTextureQuad(x, y, width, height,
         uv[0], uv[1], uv[4] == null ? uv[2] : uv[4], uv[5] == null ? uv[3] : uv[5],
         color, this._opAlpha(alpha), this._opBlend(blendMode), this._resolvedTextureLayer,
         this._matrixState(), resource, GraphicsTextureDataHelper.getUVClipRange(texture));
      return true;
   }

   private _appendTextTexture(texture: BaseTexture, x: number, y: number, width: number, height: number,
      uv: ArrayLike<number>, color: number, italicDeg: number, pixelSnap: boolean): void {
      if (!texture || texture.destroyed)
         return;
      let mode = this._mode;
      let resource = this._resolveBaseTextureResource(texture);
      uv = uv || Texture.DEF_UV;
      let matrix = this._matrixState();
      if (!italicDeg && pixelSnap && (!matrix || !matrix._bTransform)) {
         let tx = matrix ? matrix.tx : 0;
         let ty = matrix ? matrix.ty : 0;
         let right = Math.round(x + width + tx);
         let bottom = Math.round(y + height + ty);
         x = Math.round(x + tx);
         y = Math.round(y + ty);
         width = right - x;
         height = bottom - y;
         matrix = null;
      }
      if (!italicDeg && (!pixelSnap || !matrix || !matrix._bTransform)) {
         this._writeTextureQuad(x, y, width, height,
            uv[0], uv[1], uv[4] == null ? uv[2] : uv[4], uv[5] == null ? uv[3] : uv[5],
            color, this._opAlpha(1), this._opBlend(), this._resolvedTextureLayer, matrix, resource, null);
         return;
      }
      GraphicsGeometryHelper.writeTextQuad(COMPILE_TEXT_VERTICES, COMPILE_TEXT_UVS,
         x, y, width, height, uv, italicDeg || 0, pixelSnap, this._curMat, this._matrixChanged);
      this._writeMesh(0, 0, COMPILE_TEXT_VERTICES, COMPILE_TEXT_UVS, COMPILE_QUAD_INDICES, null,
         resource, this._resolvedTextureLayer, color, this._opAlpha(1), this._opBlend(), null, null);
   }

   private _draw9GridTexture(cmd: Draw9GridTextureCmd): void {
      let texture = cmd.texture;
      let mode = this._mode;
      if (!mode._prepareTexture(texture))
         return;
      let x = cmd.x, y = cmd.y, width = cmd.width, height = cmd.height;
      if (cmd.percent && this.sprite) {
         x *= this.sprite.width;
         y *= this.sprite.height;
         width *= this.sprite.width;
         height *= this.sprite.height;
      }
      if (width <= 0 || height <= 0)
         return;
      let sizeGrid = cmd.sizeGrid || texture._sizeGrid || EMPTY_SIZE_GRID;
      let resource = this._resolveTextureResource(texture);
      if (sizeGrid[4] === 1 || (texture.uvrect && Config.uvClipMode === "cpu")) {
         this._draw9GridMesh(cmd, x, y, width, height, sizeGrid, resource);
         return;
      }
      let sourceWidth = texture.sourceWidth || texture.width || 1;
      let sourceHeight = texture.sourceHeight || texture.height || 1;
      let axes = COMPILE_NINE_GRID_AXES;
      GraphicsGeometryHelper.writeNineGridAxes(axes, x, y, width, height, sourceWidth, sourceHeight, sizeGrid);
      let uv = texture._uv || texture.uv || Texture.DEF_UV;
      let u0 = uv[0], v0 = uv[1], u1 = uv[4] == null ? uv[2] : uv[4], v1 = uv[5] == null ? uv[3] : uv[5];
      let layer = this._resolvedTextureLayer;
      let matrix = this._matrixState();
      let clip = GraphicsTextureDataHelper.getUVClipRange(texture);
      for (let row = 0; row < 3; row++) {
         let h = axes[row + 5] - axes[row + 4];
         if (h <= 0)
            continue;
         for (let col = 0; col < 3; col++) {
            let w = axes[col + 1] - axes[col];
            if (w <= 0)
               continue;
            this._writeTextureQuad(axes[col], axes[row + 4], w, h,
               u0 + (u1 - u0) * axes[col + 8] / sourceWidth,
               v0 + (v1 - v0) * axes[row + 12] / sourceHeight,
               u0 + (u1 - u0) * axes[col + 9] / sourceWidth,
               v0 + (v1 - v0) * axes[row + 13] / sourceHeight,
               cmd.color, this._opAlpha(1), this._opBlend(), layer, matrix, resource, clip);
         }
      }
   }

   private _draw9GridMesh(cmd: Draw9GridTextureCmd, x: number, y: number, width: number, height: number,
      sizeGrid: number[], resource: GraphicsOp2DTextureHost): void {
      let vb = VertexStream.pool.take(cmd.texture);
      try {
         vb.contentRect.setTo(0, 0, width, height);
         if (cmd.color)
            vb.color.setABGR(cmd.color);
         let sourceWidth = vb.mainTex.sourceWidth;
         let sourceHeight = vb.mainTex.sourceHeight;
         COMPILE_GRID_RECT.setTo(sizeGrid[3], sizeGrid[0],
            sourceWidth - sizeGrid[1] - sizeGrid[3], sourceHeight - sizeGrid[0] - sizeGrid[2]);
         genSliceMesh(vb, vb.contentRect, vb.uvRect, COMPILE_GRID_RECT, sizeGrid[4] === 1 ? 0xff : 0);
         let vertices = vb.getVertices();
         let uvs = vb.getUVs();
         let indices: ArrayLike<number> = vb.getIndices();
         let colors = vb.getColors();
         let clip = GraphicsTextureDataHelper.getUVClipRange(cmd.texture);
         if (cmd.texture.uvrect && Config.uvClipMode === "cpu") {
            let clipped = UVClippingUtils.clipTrianglesByUVRange(vertices, indices, uvs, cmd.texture.uvrect, colors);
            vertices = clipped.vertices;
            uvs = clipped.uvs;
            indices = clipped.indices;
            colors = clipped.colors;
            clip = null;
         }
         this._writeMesh(x, y, vertices, uvs, indices, colors,
            resource, this._resolvedTextureLayer, cmd.color, this._opAlpha(1), this._opBlend(), this._matrixState(), clip);
      } finally {
         VertexStream.pool.recover(vb);
      }
   }

   _writeSpriteTextureOp(op: IGraphicsTextureQuadOp2D, owner: Sprite, texture: Texture): boolean {
      if (!op || !owner || !texture)
         return false;
      this._clearResolvedTexture();
      let sourceWidth = texture.sourceWidth || texture.width;
      let sourceHeight = texture.sourceHeight || texture.height;
      let widthScale = (owner._isWidthSet ? owner._width : sourceWidth) / (sourceWidth || 1);
      let heightScale = (owner._isHeightSet ? owner._height : sourceHeight) / (sourceHeight || 1);
      let uv = texture._uv || texture.uv || Texture.DEF_UV;
      let resource = this._resolveTextureResource(texture);
      op.texture = resource || null;
      op.writeRecord(texture.offsetX * widthScale, texture.offsetY * heightScale,
         texture.width * widthScale, texture.height * heightScale,
         uv[0], uv[1], uv[4] == null ? uv[2] : uv[4], uv[5] == null ? uv[3] : uv[5],
         0xffffffff, 1, owner._struct.blendMode, this._resolvedTextureLayer, null,
         GraphicsTextureDataHelper.getUVClipRange(texture));
      return true;
   }

   private _resolveTextureResource(texture: Texture): GraphicsOp2DTextureHost {
      return this._resolveBaseTextureResource(texture.bitmap);
   }

   private _resolveBaseTextureResource(source: BaseTexture): GraphicsOp2DTextureHost {
      if (source === this._resolvedTextureSource)
         return this._resolvedTextureResource;
      let resource: GraphicsOp2DTextureHost = source;
      let layer = 0;
      let registered = TextureArrayRegistry2D.resolve(source);
      if (registered) {
         resource = registered.array;
         layer = registered.layer | 0;
      }
      this._resolvedTextureSource = source;
      this._resolvedTextureResource = resource;
      this._resolvedTextureLayer = layer;
      return resource;
   }

   private _clearResolvedTexture(): void {
      this._resolvedTextureSource = null;
      this._resolvedTextureResource = null;
      this._resolvedTextureLayer = 0;
   }

   private _writeTextureQuad(x: number, y: number, width: number, height: number,
      u0: number, v0: number, u1: number, v1: number, color: number, alpha: number, blendMode: number,
      textureLayer: number, matrix: Matrix, texture: GraphicsOp2DTextureHost, uvClip: ArrayLike<number> = null): void {
      let mode = this._mode;
      let op = mode.getTextureQuadTargetOp();
      if (op.kind === GraphicsOp2DKind.MultiQuad || op.kind === GraphicsOp2DKind.Text) {
         let multi = op as IGraphicsMultiQuadOp2D;
         mode._recordActiveMultiQuadTexture(multi, texture);
         multi.addRecord(x, y, width, height, u0, v0, u1, v1,
            color, alpha, blendMode, textureLayer || 0, matrix, uvClip);
      } else {
         let quad = op as IGraphicsTextureQuadOp2D;
         quad.texture = texture || null;
         quad.writeRecord(x, y, width, height, u0, v0, u1, v1,
            color, alpha, blendMode, textureLayer || 0, matrix, uvClip);
      }
      mode._markTextureQuadWritten();
   }

   private _writeSolidQuad(x: number, y: number, width: number, height: number,
      color: number, alpha: number, blendMode: number, matrix: Matrix): void {
      let op = this._mode._appendOp(GraphicsOp2DKind.SolidQuad) as IGraphicsSolidQuadOp2D;
      op.writeRecord(x, y, width, height, color, alpha, blendMode, matrix);
   }

   private _writeFillTexture(x: number, y: number, width: number, height: number,
      u0: number, v0: number, u1: number, v1: number, repeatX: number, repeatY: number, offsetX: number, offsetY: number,
      rangeX: number, rangeY: number, rangeWidth: number, rangeHeight: number, color: number, alpha: number, blendMode: number,
      textureLayer: number, matrix: Matrix, texture: GraphicsOp2DTextureHost, uvClip: ArrayLike<number>): void {
      let op = this._mode._appendOp(GraphicsOp2DKind.FillTexture) as IGraphicsFillTextureOp2D;
      op.texture = texture || null;
      op.writeRecord(x, y, width, height, u0, v0, u1, v1, repeatX, repeatY, offsetX, offsetY,
         rangeX, rangeY, rangeWidth, rangeHeight, color, alpha, blendMode, textureLayer || 0, matrix, uvClip);
   }

   private _writeMesh(x: number, y: number, vertices: ArrayLike<number>, uvs: ArrayLike<number>,
      indices: ArrayLike<number>, colors: ArrayLike<number>, texture: GraphicsOp2DTextureHost, textureLayer: number,
      color: number, alpha: number, blendMode: number, matrix: Matrix, uvClip: ArrayLike<number> = null,
      vertexOffset: number = 0, vertexCount: number = vertices ? (vertices.length - vertexOffset) >> 1 : 0,
      uvOffset: number = 0, indexOffset: number = 0, indexCount: number = indices ? indices.length - indexOffset : 0,
      colorOffset: number = 0): void {
      if (!vertices || !indices)
         return;
      let op = this._mode._appendOp(GraphicsOp2DKind.Mesh) as IGraphicsMeshOp2D;
      op.texture = texture || null;
      op.writeMesh(x, y, vertices, vertexOffset, vertexCount, uvs, uvOffset, indices, indexOffset, indexCount,
         colors, colorOffset, color, alpha, blendMode, textureLayer || 0, matrix, uvClip);
   }

   private _appendLineMesh(points: number[], lineWidth: number, loop: boolean, packedColor: number): boolean {
      if (!points || points.length < 4 || lineWidth <= 0)
         return false;
      let geometry = BasePoly.createLine2Geometry(points, lineWidth, loop);
      if (!geometry || geometry.vertexCount <= 0 || geometry.indexCount <= 0)
         return false;
      this._writeMesh(0, 0, geometry.vertices, null, geometry.indices, null,
         null, 0, packedColor, this._opAlpha(1), this._opBlend(), this._matrixState(), null,
         0, geometry.vertexCount, 0, 0, geometry.indexCount);
      return true;
   }

   private _appendPathFillAndStroke(points: number[], fillColor: GraphicsColorInput,
      lineColor: GraphicsColorInput, lineWidth: number, loop: boolean): boolean {
      let wrote = false;
      if (fillColor != null) {
         let indices = Earcut.earcut(points, null, 2);
         if ((!indices || indices.length === 0) && points.length === 6)
            indices = COMPILE_TRIANGLE_INDICES;
         if (indices && indices.length > 0) {
            this._writeColorMesh(points, indices, this._toABGR(fillColor));
            wrote = true;
         }
      }
      if (lineColor != null && lineWidth > 0)
         wrote = this._appendLineMesh(points, lineWidth, loop, this._toABGR(lineColor)) || wrote;
      return wrote;
   }

   private _writeColorMesh(vertices: ArrayLike<number>, indices: ArrayLike<number>, color: number): void {
      this._writeMesh(0, 0, vertices, null, indices, null,
         null, 0, color, this._opAlpha(1), this._opBlend(), this._matrixState());
   }

   private _tessellationScale(): number {
      return Math.max(this.getCurrentScaleX(), this.getCurrentScaleY());
   }

   private _matrixState(): Matrix | null {
      let mat = this._curMat;
      return mat.a === 1 && mat.b === 0 && mat.c === 0 && mat.d === 1 && mat.tx === 0 && mat.ty === 0 ? null : mat;
   }

   private _opAlpha(localAlpha: number): number {
      return this.globalAlpha * (localAlpha == null ? 1 : localAlpha);
   }

   private _opBlend(override: GraphicsBlendModeInput = null): number {
      let value = override == null ? this.globalCompositeOperation : override;
      return typeof value === "string" ? GraphicsOpRenderStateHelper.parseBlendMode(value) : (value == null ? BlendMode.normal : value);
   }

   private _toABGR(value: GraphicsColorInput): number {
      return typeof value === "number" ? value : (value != null ? ColorUtils.create(value).numColor : 0xffffffff);
   }

   get globalAlpha(): number {
      return this._alpha;
   }

   set globalAlpha(value: number) {
      this._alpha = Math.floor(value * 1000) / 1000;
   }

   get globalCompositeOperation(): BlendMode {
      return this._blendMode;
   }

   set globalCompositeOperation(value: BlendMode) {
      if (value != null)
         this._blendMode = value;
   }

   save(): void {
      this._ensureSaveCapacity(this._saveDepth + 1);
      let offset = this._saveDepth * GRAPHICS_COMPILE_SAVE_STRIDE;
      let mat = this._curMat;
      let frames = this._saveFrames;
      frames[offset] = mat.a;
      frames[offset + 1] = mat.b;
      frames[offset + 2] = mat.c;
      frames[offset + 3] = mat.d;
      frames[offset + 4] = mat.tx;
      frames[offset + 5] = mat.ty;
      frames[offset + 6] = this._alpha;
      frames[offset + 7] = this._blendMode;
      this._saveDepth++;
   }

   restore(): void {
      if (this._saveDepth <= 0)
         return;
      let offset = --this._saveDepth * GRAPHICS_COMPILE_SAVE_STRIDE;
      let frames = this._saveFrames;
      this._curMat.setTo(frames[offset], frames[offset + 1], frames[offset + 2], frames[offset + 3], frames[offset + 4], frames[offset + 5]);
      this._curMat._checkTransform();
      let mat = this._curMat;
      this._matrixChanged = mat.a !== 1 || mat.b !== 0 || mat.c !== 0 || mat.d !== 1 || mat.tx !== 0 || mat.ty !== 0;
      this._alpha = frames[offset + 6];
      this._blendMode = frames[offset + 7];
   }

   translate(x: number, y: number): void {
      if (x === 0 && y === 0)
         return;
      let mat = this._curMat;
      if (mat._bTransform) {
         mat.tx += x * mat.a + y * mat.c;
         mat.ty += x * mat.b + y * mat.d;
      } else {
         mat.tx = x;
         mat.ty = y;
      }
      this._matrixChanged = true;
   }

   transform(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
      Matrix.mul(Matrix.TEMP.setTo(a, b, c, d, tx, ty), this._curMat, this._curMat);
      this._curMat._checkTransform();
      this._matrixChanged = true;
   }

   rotate(angle: number): void {
      this._curMat.rotateEx(angle);
      this._matrixChanged = true;
   }

   scale(scaleX: number, scaleY: number): void {
      this._curMat.scaleEx(scaleX, scaleY);
      this._matrixChanged = true;
   }

   _transform(mat: Matrix, pivotX: number, pivotY: number): void {
      this.translate(pivotX, pivotY);
      this.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
      this.translate(-pivotX, -pivotY);
   }

   _rotate(angle: number, pivotX: number, pivotY: number): void {
      this.translate(pivotX, pivotY);
      this.rotate(angle);
      this.translate(-pivotX, -pivotY);
   }

   _scale(scaleX: number, scaleY: number, pivotX: number, pivotY: number): void {
      this.translate(pivotX, pivotY);
      this.scale(scaleX, scaleY);
      this.translate(-pivotX, -pivotY);
   }

   getCurrentScaleX(): number {
      let scale = this._curMat.getScaleX();
      if (this.sprite && this.sprite.globalTrans) {
         let matrix = this.sprite.globalTrans.getMatrix();
         scale *= Math.hypot(matrix.a, matrix.b);
      }
      return Math.abs(scale);
   }

   getCurrentScaleY(): number {
      let scale = this._curMat.getScaleY();
      if (this.sprite && this.sprite.globalTrans) {
         let matrix = this.sprite.globalTrans.getMatrix();
         scale *= Math.hypot(matrix.c, matrix.d);
      }
      return Math.abs(scale);
   }

   copyStateTo(out: Float64Array, offset: number): void {
      let mat = this._curMat;
      out[offset] = mat.a;
      out[offset + 1] = mat.b;
      out[offset + 2] = mat.c;
      out[offset + 3] = mat.d;
      out[offset + 4] = mat.tx;
      out[offset + 5] = mat.ty;
      out[offset + 6] = this._alpha;
      out[offset + 7] = this._blendMode;
   }

   private _ensureSaveCapacity(frameCount: number): void {
      if (frameCount <= this._saveCapacity)
         return;
      let capacity = Math.max(4, this._saveCapacity || 0);
      while (capacity < frameCount)
         capacity <<= 1;
      let frames = new Float64Array(capacity * GRAPHICS_COMPILE_SAVE_STRIDE);
      if (this._saveFrames)
         frames.set(this._saveFrames);
      this._saveFrames = frames;
      this._saveCapacity = capacity;
   }
}
