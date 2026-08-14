import { Config } from "../../../../Config";
import type { Sprite } from "../../Sprite";
import type { BaseTexture } from "../../../resource/BaseTexture";
import type { Texture } from "../../../resource/Texture";
import { Matrix } from "../../../maths/Matrix";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import type { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import type { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import type { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader2D } from "../../../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { BlendMode } from "../../../webgl/canvas/BlendMode";
import {
	GraphicsCommandDependency,
	GraphicsCommandLayoutRefresh,
	type GraphicsCommandInfo,
	type GraphicsDrawPathSegment,
	type GraphicsOp2DRenderState,
	type GraphicsOp2DTextureHost,
} from "./GraphicsPipelineTypes";

const GRAPHICS_ARC_MAX_SEGMENTS = 2048;
const TWO_PI = Math.PI * 2;
const DRAW_PATH_ARC_TO_SEGMENTS = 32;

function writeState(out: GraphicsCommandInfo): GraphicsCommandInfo {
	out.dependency = GraphicsCommandDependency.None;
	out.layoutRefresh = GraphicsCommandLayoutRefresh.None;
	out.scaleTessellationKey = 0;
	out.isStateCommand = true;
	return out;
}

function writeSize(out: GraphicsCommandInfo, percent: boolean, layoutRefresh: GraphicsCommandLayoutRefresh): GraphicsCommandInfo {
	out.dependency = percent ? GraphicsCommandDependency.SizePayload : GraphicsCommandDependency.None;
	out.layoutRefresh = percent ? layoutRefresh : GraphicsCommandLayoutRefresh.None;
	out.scaleTessellationKey = 0;
	out.isStateCommand = false;
	return out;
}

function writeScaleTessellation(out: GraphicsCommandInfo, percent: boolean, scaleTessellationKey: number): GraphicsCommandInfo {
	out.dependency = GraphicsCommandDependency.ScaleTessellation | (percent ? GraphicsCommandDependency.SizePayload : GraphicsCommandDependency.None);
	out.layoutRefresh = percent ? GraphicsCommandLayoutRefresh.RerunCommand : GraphicsCommandLayoutRefresh.None;
	out.scaleTessellationKey = scaleTessellationKey;
	out.isStateCommand = false;
	return out;
}

function getOwnerWidth(owner?: Sprite): number {
	return owner ? owner.width : 0;
}

function getOwnerHeight(owner?: Sprite): number {
	return owner ? owner.height : 0;
}

function getOwnerMinSize(owner?: Sprite): number {
	return Math.min(getOwnerWidth(owner), getOwnerHeight(owner));
}

function getOwnerMaxScale(owner?: Sprite): number {
	if (!owner)
		return 1;

	let mat = owner.globalTrans.getMatrix();
	if (!mat)
		return 1;

	let scaleX = Math.sqrt(mat.a * mat.a + mat.b * mat.b);
	let scaleY = Math.sqrt(mat.c * mat.c + mat.d * mat.d);
	return Math.max(scaleX || 0, scaleY || 0);
}

function calcArcSegmentsWithScale(radius: number, scale: number, minNum: number = 20, segPixel: number = 5): number {
	let safeRadius = Math.max(0, radius || 0);
	let safeScale = isFinite(scale) ? Math.max(0, Math.abs(scale)) : 1;
	let safeSegPixel = segPixel > 0 ? segPixel : 5;
	let minSegments = Math.max(1, minNum | 0);
	let segments = Math.max(minSegments, Math.floor(safeRadius * safeScale * Math.PI * 2 / safeSegPixel));
	return Math.min(GRAPHICS_ARC_MAX_SEGMENTS, segments);
}

function calcArcSegments(radius: number, owner?: Sprite, minNum: number = 20, segPixel: number = 5): number {
	return calcArcSegmentsWithScale(radius, getOwnerMaxScale(owner), minNum, segPixel);
}

function combineRoundRectSegments(lt: number, rt: number, lb: number, rb: number, owner?: Sprite, minNum: number = 20, segPixel: number = 5): number {
	let scale = getOwnerMaxScale(owner);
	let ltSegments = calcArcSegmentsWithScale(lt, scale, minNum, segPixel);
	let rtSegments = calcArcSegmentsWithScale(rt, scale, minNum, segPixel);
	let lbSegments = calcArcSegmentsWithScale(lb, scale, minNum, segPixel);
	let rbSegments = calcArcSegmentsWithScale(rb, scale, minNum, segPixel);
	let hash = Math.imul(ltSegments, 31) + rtSegments | 0;
	hash = Math.imul(hash, 31) + lbSegments | 0;
	return Math.imul(hash, 31) + rbSegments | 0;
}

function combineMatrix(out: Matrix, source: Matrix | null, current: Matrix | null): Matrix | null {
	if (source)
		out.setTo(source.a, source.b, source.c, source.d, source.tx, source.ty);
	else
		out.identity();
	if (current)
		Matrix.mul(out, current, out);
	return out.a === 1 && out.b === 0 && out.c === 0 && out.d === 1 && out.tx === 0 && out.ty === 0 ? null : out;
}

function parseBlendMode(value: string): BlendMode {
	switch (value) {
		case "add": return BlendMode.add;
		case "multiply": return BlendMode.multiply;
		case "screen": return BlendMode.screen;
		case "overlay": return BlendMode.overlay;
		case "light": return BlendMode.light;
		case "lighter": return BlendMode.lighter;
		case "mask": return BlendMode.mask;
		case "destinationOut":
		case "destination-out": return BlendMode.destinationOut;
		case "addOld": return BlendMode.addOld;
		case "lighterOld": return BlendMode.lighterOld;
		case "sourceAlpha": return BlendMode.sourceAlpha;
		default: return BlendMode.normal;
	}
}

function copyOffsetPoints(out: number[], points: ArrayLike<number>, offsetX: number, offsetY: number): void {
	out.length = 0;
	for (let i = 0, n = points.length; i < n; i += 2)
		out.push(points[i] + offsetX, points[i + 1] + offsetY);
}

function offsetPoints(points: number[], offsetX: number, offsetY: number): void {
	if (!offsetX && !offsetY)
		return;
	for (let i = 0, n = points.length; i < n; i += 2) {
		points[i] += offsetX;
		points[i + 1] += offsetY;
	}
}

function writeFillTextureGeometry(out: number[], x: number, y: number, width: number, height: number,
	textureWidth: number, textureHeight: number, type: string, offsetX: number, offsetY: number): boolean {
	let repeatX = type === "repeat" || type === "repeat-x" ? 1 : 0;
	let repeatY = type === "repeat" || type === "repeat-y" ? 1 : 0;
	let startX = offsetX < 0 ? x : x + offsetX;
	let startY = offsetY < 0 ? y : y + offsetY;
	let endX = x + width;
	let endY = y + height;
	if (!repeatX)
		endX = Math.min(endX, x + offsetX + textureWidth);
	if (!repeatY)
		endY = Math.min(endY, y + offsetY + textureHeight);
	if (endX < x || endY < y || startX > endX || startY > endY)
		return false;
	out[0] = startX;
	out[1] = startY;
	out[2] = endX - startX;
	out[3] = endY - startY;
	out[4] = offsetX < 0 ? (-offsetX % textureWidth) / textureWidth : 0;
	out[5] = offsetY < 0 ? (-offsetY % textureHeight) / textureHeight : 0;
	out[6] = (endX - x - offsetX) / textureWidth;
	out[7] = (endY - y - offsetY) / textureHeight;
	out[8] = repeatX;
	out[9] = repeatY;
	out[10] = offsetX;
	out[11] = offsetY;
	return true;
}

function makeCirclePath(out: number[], x: number, y: number, radius: number, segments: number): void {
	out.length = 0;
	for (let i = 0; i < segments; i++) {
		let angle = i / segments * TWO_PI;
		out.push(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
	}
}

function writeCircleFan(vertices: number[], indices: number[], x: number, y: number, radius: number, segments: number): void {
	vertices.length = 0;
	indices.length = 0;
	vertices.push(x, y);
	for (let i = 0; i < segments; i++) {
		let angle = i / segments * TWO_PI;
		vertices.push(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
	}
	for (let i = 0; i < segments; i++)
		indices.push(0, i + 1, i + 1 === segments ? 1 : i + 2);
}

function writeTextQuad(vertices: number[], uvs: number[], x: number, y: number, width: number, height: number,
	uv: ArrayLike<number>, italicDeg: number, pixelSnap: boolean, matrix: Matrix | null, matrixChanged: boolean): void {
	let xoff = italicDeg !== 0 ? Math.tan(italicDeg * Math.PI / 180) * height : 0;
	let maxX = x + width;
	let maxY = y + height;
	let a0 = x + xoff, a1 = y;
	let a2 = maxX + xoff, a3 = y;
	let a4 = maxX, a5 = maxY;
	let a6 = x, a7 = maxY;
	if (matrixChanged && matrix) {
		let tx = matrix.tx;
		let ty = matrix.ty;
		if (matrix._bTransform) {
			let ma = matrix.a, mb = matrix.b, mc = matrix.c, md = matrix.d;
			vertices[0] = a0 * ma + a1 * mc + tx;
			vertices[1] = a0 * mb + a1 * md + ty;
			vertices[2] = a2 * ma + a3 * mc + tx;
			vertices[3] = a2 * mb + a3 * md + ty;
			vertices[4] = a4 * ma + a5 * mc + tx;
			vertices[5] = a4 * mb + a5 * md + ty;
			vertices[6] = a6 * ma + a7 * mc + tx;
			vertices[7] = a6 * mb + a7 * md + ty;
		} else {
			vertices[0] = a0 + tx; vertices[1] = a1 + ty;
			vertices[2] = a2 + tx; vertices[3] = a3 + ty;
			vertices[4] = a4 + tx; vertices[5] = a5 + ty;
			vertices[6] = a6 + tx; vertices[7] = a7 + ty;
		}
	} else {
		vertices[0] = a0; vertices[1] = a1;
		vertices[2] = a2; vertices[3] = a3;
		vertices[4] = a4; vertices[5] = a5;
		vertices[6] = a6; vertices[7] = a7;
	}
	if (pixelSnap) {
		for (let i = 0; i < 8; i++)
			vertices[i] = Math.round(vertices[i]);
	}
	writeTextureQuadUVs(uvs, uv);
}

function writeTextureQuad(vertices: number[], uvs: number[], width: number, height: number, uv: ArrayLike<number>): void {
	vertices[0] = 0; vertices[1] = 0;
	vertices[2] = width; vertices[3] = 0;
	vertices[4] = width; vertices[5] = height;
	vertices[6] = 0; vertices[7] = height;
	writeTextureQuadUVs(uvs, uv);
}

function writeTextureQuadUVs(uvs: number[], uv: ArrayLike<number>): void {
	uvs[0] = uv[0];
	uvs[1] = uv[1];
	uvs[2] = uv[2];
	uvs[3] = uv[3];
	uvs[4] = uv[4] == null ? uv[2] : uv[4];
	uvs[5] = uv[5] == null ? uv[3] : uv[5];
	uvs[6] = uv[6] == null ? uv[0] : uv[6];
	uvs[7] = uv[7] == null ? uv[5] : uv[7];
}

function writeNineGridAxes(out: number[], x: number, y: number, width: number, height: number,
	sourceWidth: number, sourceHeight: number, sizeGrid: ArrayLike<number>): void {
	let top = Math.max(0, sizeGrid[0] || 0);
	let right = Math.max(0, sizeGrid[1] || 0);
	let bottom = Math.max(0, sizeGrid[2] || 0);
	let left = Math.max(0, sizeGrid[3] || 0);
	let destLeft = Math.min(left, width);
	let destRight = Math.max(destLeft, width - Math.min(right, width - destLeft));
	let destTop = Math.min(top, height);
	let destBottom = Math.max(destTop, height - Math.min(bottom, height - destTop));
	out[0] = x; out[1] = x + destLeft; out[2] = x + destRight; out[3] = x + width;
	out[4] = y; out[5] = y + destTop; out[6] = y + destBottom; out[7] = y + height;
	out[8] = 0; out[9] = left; out[10] = Math.max(left, sourceWidth - right); out[11] = sourceWidth;
	out[12] = 0; out[13] = top; out[14] = Math.max(top, sourceHeight - bottom); out[15] = sourceHeight;
}

function makeEllipsePath(out: number[], x: number, y: number, radiusX: number, radiusY: number, segments: number): void {
	out.length = 0;
	for (let i = 0; i < segments; i++) {
		let angle = i / segments * TWO_PI;
		out.push(x + Math.cos(angle) * radiusX, y + Math.sin(angle) * radiusY);
	}
}

function makePiePath(out: number[], x: number, y: number, radius: number, startAngle: number, endAngle: number, segments: number): void {
	out.length = 0;
	out.push(x, y);
	appendArcPoints(out, x, y, radius, startAngle, endAngle, segments);
}

function makeRoundRectPath(out: number[], x: number, y: number, width: number, height: number,
	lt: number, rt: number, rb: number, lb: number, minNum: number, segPixel: number, scale: number): void {
	lt = Math.max(lt || 0, 0);
	rt = Math.max(rt || 0, 0);
	rb = Math.max(rb || 0, 0);
	lb = Math.max(lb || 0, 0);
	let topClip = getRoundRectOverlapAngle(lt, rt, width);
	let rightClip = getRoundRectOverlapAngle(rt, rb, height);
	let bottomClip = getRoundRectOverlapAngle(lb, rb, width);
	let leftClip = getRoundRectOverlapAngle(lt, lb, height);
	out.length = 0;
	appendArcPath(out, x + lt, y + lt, lt, Math.PI + leftClip, Math.PI * 1.5 - topClip, scale, minNum, segPixel);
	appendArcPath(out, x + width - rt, y + rt, rt, Math.PI * 1.5 + topClip, TWO_PI - rightClip, scale, minNum, segPixel);
	appendArcPath(out, x + width - rb, y + height - rb, rb, rightClip, Math.PI * 0.5 - bottomClip, scale, minNum, segPixel);
	appendArcPath(out, x + lb, y + height - lb, lb, Math.PI * 0.5 + bottomClip, Math.PI - leftClip, scale, minNum, segPixel);
}

function getRoundRectOverlapAngle(firstRadius: number, secondRadius: number, size: number): number {
	let sum = firstRadius + secondRadius;
	if (sum <= 0 || size >= sum)
		return 0;
	return Math.asin(Math.min(1, Math.max(0, (sum - Math.max(0, size)) / sum)));
}

function appendArcPath(out: number[], x: number, y: number, radius: number, startAngle: number, endAngle: number,
	scale: number, minNum: number, segPixel: number): void {
	if (radius <= 0) {
		out.push(x, y);
		return;
	}
	if (startAngle > endAngle)
		return;
	appendArcPoints(out, x, y, radius, startAngle, endAngle,
		calcArcSegmentsWithScale(radius, scale, minNum, segPixel));
}

function appendArcPoints(out: number[], x: number, y: number, radius: number, startAngle: number, endAngle: number, segments: number): void {
	appendPathPoint(out, x + Math.cos(startAngle) * radius, y + Math.sin(startAngle) * radius);
	let stepAngle = TWO_PI / segments;
	let currentAngle = Math.ceil(startAngle / stepAngle) * stepAngle;
	if (Math.abs(currentAngle - startAngle) < 0.0000001)
		currentAngle += stepAngle;
	while (endAngle - currentAngle >= stepAngle) {
		appendPathPoint(out, x + Math.cos(currentAngle) * radius, y + Math.sin(currentAngle) * radius);
		currentAngle += stepAngle;
	}
	appendPathPoint(out, x + Math.cos(endAngle) * radius, y + Math.sin(endAngle) * radius);
}

function collectDrawPathSubpaths(paths: readonly GraphicsDrawPathSegment[] | null, offsetX: number, offsetY: number,
	subpaths: number[][], closed: boolean[]): number {
	if (!paths)
		return 0;
	let subpathCount = 0;
	let points: number[] = null;
	let closedCurrent = false;
	for (let i = 0, n = paths.length; i < n; i++) {
		let item = paths[i];
		if (item[0] === "moveTo") {
			if (finishDrawPathSubpath(points, closedCurrent)) {
				closed[subpathCount] = closedCurrent;
				subpathCount++;
			}
			points = subpaths[subpathCount] || (subpaths[subpathCount] = []);
			points.length = 0;
			closedCurrent = false;
			appendPathPoint(points, item[1] + offsetX, item[2] + offsetY);
		} else if (item[0] === "lineTo") {
			if (!points) {
				points = subpaths[subpathCount] || (subpaths[subpathCount] = []);
				points.length = 0;
			}
			appendPathPoint(points, item[1] + offsetX, item[2] + offsetY);
		} else if (item[0] === "arcTo") {
			if (!points) {
				points = subpaths[subpathCount] || (subpaths[subpathCount] = []);
				points.length = 0;
			}
			appendPathArcTo(points, item[1] + offsetX, item[2] + offsetY,
				item[3] + offsetX, item[4] + offsetY, item[5] || 0);
		} else if (item[0] === "closePath") {
			closedCurrent = true;
		}
	}
	if (finishDrawPathSubpath(points, closedCurrent)) {
		closed[subpathCount] = closedCurrent;
		subpathCount++;
	}
	return subpathCount;
}

function finishDrawPathSubpath(points: number[], isClosed: boolean): boolean {
	if (!points)
		return false;
	if (isClosed && points.length >= 4) {
		let last = points.length - 2;
		if (points[last] === points[0] && points[last + 1] === points[1])
			points.length -= 2;
	}
	return points.length >= 4;
}

function appendPathPoint(points: number[], x: number, y: number): void {
	let last = points.length - 2;
	if (last >= 0 && points[last] === x && points[last + 1] === y)
		return;
	points.push(x, y);
}

function appendPathArcTo(points: number[], x1: number, y1: number, x2: number, y2: number, radius: number): void {
	if (points.length < 2) {
		appendPathPoint(points, x1, y1);
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
		appendPathPoint(points, x1, y1);
		return;
	}
	v0x /= len0;
	v0y /= len0;
	v1x /= len1;
	v1y /= len1;
	let dot = Math.max(-1, Math.min(1, v0x * v1x + v0y * v1y));
	let angle = Math.acos(dot);
	if (angle <= 0.0001 || Math.PI - angle <= 0.0001) {
		appendPathPoint(points, x1, y1);
		return;
	}
	let tangentDistance = radius / Math.tan(angle * 0.5);
	if (!isFinite(tangentDistance) || tangentDistance <= 0) {
		appendPathPoint(points, x1, y1);
		return;
	}
	let sx = x1 + v0x * tangentDistance;
	let sy = y1 + v0y * tangentDistance;
	let ex = x1 + v1x * tangentDistance;
	let ey = y1 + v1y * tangentDistance;
	let bisectorX = v0x + v1x;
	let bisectorY = v0y + v1y;
	let bisectorLength = Math.sqrt(bisectorX * bisectorX + bisectorY * bisectorY);
	if (bisectorLength <= 0.00001) {
		appendPathPoint(points, x1, y1);
		return;
	}
	bisectorX /= bisectorLength;
	bisectorY /= bisectorLength;
	let centerDistance = Math.sqrt(tangentDistance * tangentDistance + radius * radius);
	let centerX = x1 + bisectorX * centerDistance;
	let centerY = y1 + bisectorY * centerDistance;
	appendPathPoint(points, sx, sy);
	let startAngle = Math.atan2(sy - centerY, sx - centerX);
	let endAngle = Math.atan2(ey - centerY, ex - centerX);
	let direction = v0x * v1y - v0y * v1x;
	if (direction < 0) {
		while (endAngle <= startAngle)
			endAngle += TWO_PI;
	} else {
		while (endAngle >= startAngle)
			endAngle -= TWO_PI;
	}
	let angleStep = (endAngle - startAngle) / DRAW_PATH_ARC_TO_SEGMENTS;
	for (let i = 1; i <= DRAW_PATH_ARC_TO_SEGMENTS; i++) {
		let currentAngle = startAngle + angleStep * i;
		appendPathPoint(points, centerX + Math.cos(currentAngle) * radius, centerY + Math.sin(currentAngle) * radius);
	}
}

function getDefaultSubShader(): SubShader {
	return Shader2D.graphicsShader.getSubShaderAt(0);
}

function getDefineBits(textureHost: GraphicsOp2DTextureHost | null, fillTexture: boolean = false, enableVertexSize: boolean = false): number {
	return writeGraphicsOp2DRenderState(textureHost, 0, fillTexture, false, enableVertexSize, null).typeKey;
}

function getRenderState(
	textureHost: GraphicsOp2DTextureHost | null,
	blendMode: number,
	fillTexture: boolean = false,
	useCustomMaterial: boolean = false,
	enableVertexSize: boolean = false,
	out: GraphicsOp2DRenderState = { stateKey: 0, typeKey: 0, textureKey: 0, texture: null }
): GraphicsOp2DRenderState {
	return writeGraphicsOp2DRenderState(textureHost, blendMode, fillTexture, useCustomMaterial, enableVertexSize, null, out);
}

function syncShaderData(
	shaderData: ShaderData,
	textureHost: GraphicsOp2DTextureHost | null,
	blendMode: number,
	fillTexture: boolean = false,
	useCustomMaterial: boolean = false,
	enableVertexSize: boolean = false,
	out: GraphicsOp2DRenderState = { stateKey: 0, typeKey: 0, textureKey: 0, texture: null }
): GraphicsOp2DRenderState {
	return writeGraphicsOp2DRenderState(textureHost, blendMode, fillTexture, useCustomMaterial, enableVertexSize, shaderData, out);
}

function writeGraphicsOp2DRenderState(
	textureHost: GraphicsOp2DTextureHost | null,
	blendMode: number,
	fillTexture: boolean,
	useCustomMaterial: boolean,
	enableVertexSize: boolean,
	shaderData: ShaderData | null,
	out: GraphicsOp2DRenderState = { stateKey: 0, typeKey: 0, textureKey: 0, texture: null }
): GraphicsOp2DRenderState {
	let texture: BaseTexture | null = textureHost;
	let useTextureArray = !!texture && texture.dimension === TextureDimension.Texture2DArray;
	let useGammaTexture = !!texture && texture.gammaCorrection != 1;
	let useUVClipGPU = Config.uvClipMode === "gpu";
	let defineBits = ShaderDefines2D.DEFINE_BIT_TEXTURESHADER;
	defineBits |= enableVertexSize ? ShaderDefines2D.DEFINE_BIT_VERTEX_SIZE : ShaderDefines2D.DEFINE_BIT_VERTEXALPHA;
	if (useUVClipGPU)
		defineBits |= ShaderDefines2D.DEFINE_BIT_UV_CLIP_GPU;
	if (fillTexture)
		defineBits |= ShaderDefines2D.DEFINE_BIT_FILLTEXTURE;
	if (useGammaTexture)
		defineBits |= ShaderDefines2D.DEFINE_BIT_GAMMATEXTURE;
	if (useTextureArray)
		defineBits |= ShaderDefines2D.DEFINE_BIT_USE_TEX_ARRAY;

	if (shaderData) {
		setGraphicsOp2DShaderDefine(shaderData, ShaderDefines2D.FILLTEXTURE, fillTexture);
		setGraphicsOp2DShaderDefine(shaderData, ShaderDefines2D.GAMMATEXTURE, useGammaTexture);
		setGraphicsOp2DShaderDefine(shaderData, ShaderDefines2D.VERTEXALPHA, !enableVertexSize);
		setGraphicsOp2DShaderDefine(shaderData, ShaderDefines2D.TEXTURESHADER, true);
		setGraphicsOp2DShaderDefine(shaderData, ShaderDefines2D.USE_TEX_ARRAY, useTextureArray);
		setGraphicsOp2DShaderDefine(shaderData, ShaderDefines2D.UNIFORMCLIP, false);
		setGraphicsOp2DShaderDefine(shaderData, ShaderDefines2D.UV_CLIP_GPU, useUVClipGPU);
		setGraphicsOp2DShaderDefine(shaderData, ShaderDefines2D.VERTEX_SIZE, enableVertexSize);
	}

	out.stateKey = blendMode;
	out.typeKey = blendMode
		| (useCustomMaterial ? ShaderDefines2D.TYPEKEY_CUSTOM_MATERIAL : 0)
		| defineBits;
	out.textureKey = texture ? texture.id : 0;
	out.texture = texture;
	return out;
}

function setGraphicsOp2DShaderDefine(shaderData: ShaderData, define: ShaderDefine, enabled: boolean): void {
	if (enabled)
		shaderData.addDefine(define);
	else
		shaderData.removeDefine(define);
}

function getTextureUVClipRange(texture: Texture): ArrayLike<number> | null {
	return Config.uvClipMode === "gpu" && texture.uvrect ? texture.uvrect : null;
}

function writeTextureUVRange(texture: Texture, out: number[]): number[] {
	let range = texture.uvrect;
	if (range) {
		out[0] = range[0];
		out[1] = range[1];
		out[2] = range[2];
		out[3] = range[3];
	} else {
		out[0] = 0;
		out[1] = 0;
		out[2] = 1;
		out[3] = 1;
	}
	return out;
}

/** @internal */
export const GraphicsCommandInfoHelper = {
	writeState,
	writeSize,
	writeScaleTessellation,
};

/** @internal */
export const GraphicsGeometryHelper = {
	ARC_MAX_SEGMENTS: GRAPHICS_ARC_MAX_SEGMENTS,
	getOwnerWidth,
	getOwnerHeight,
	getOwnerMinSize,
	getOwnerMaxScale,
	combineMatrix,
	calcArcSegmentsWithScale,
	calcArcSegments,
	combineRoundRectSegments,
	copyOffsetPoints,
	offsetPoints,
	writeFillTextureGeometry,
	makeCirclePath,
	writeCircleFan,
	writeTextQuad,
	writeTextureQuad,
	writeNineGridAxes,
	makeEllipsePath,
	makePiePath,
	makeRoundRectPath,
	collectDrawPathSubpaths,
};

/** @internal */
export const GraphicsTextureDataHelper = {
	getUVClipRange: getTextureUVClipRange,
	writeUVRange: writeTextureUVRange,
};

/** @internal */
export const GraphicsOpRenderStateHelper = {
	parseBlendMode,
	getDefaultSubShader,
	getDefineBits,
	getRenderState,
	syncShaderData,
};
