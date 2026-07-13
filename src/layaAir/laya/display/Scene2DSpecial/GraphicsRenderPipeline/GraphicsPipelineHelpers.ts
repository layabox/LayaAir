import { Config } from "../../../../Config";
import type { Sprite } from "../../Sprite";
import type { BaseTexture } from "../../../resource/BaseTexture";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import type { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import type { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import type { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader2D } from "../../../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import {
	GraphicsCommandDependency,
	GraphicsCommandLayoutRefresh,
	type GraphicsCommandInfo,
	type GraphicsOp2DRenderState,
	type GraphicsOp2DTextureHost,
} from "./GraphicsPipelineTypes";

const GRAPHICS_ARC_MAX_SEGMENTS = 2048;

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
	let base = GRAPHICS_ARC_MAX_SEGMENTS + 1;
	return ((ltSegments * base + rtSegments) * base + lbSegments) * base + rbSegments;
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
	calcArcSegmentsWithScale,
	calcArcSegments,
	combineRoundRectSegments,
};

/** @internal */
export const GraphicsOpRenderStateHelper = {
	getDefaultSubShader,
	getDefineBits,
	getRenderState,
	syncShaderData,
};
