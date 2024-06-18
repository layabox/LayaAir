import { Node } from "../../../display/Node";
import { Sprite3D } from "../Sprite3D";
import { ShadowMode } from "./ShadowMode";
import { Light, LightMode } from "./Light";
import { Color } from "../../../maths/Color";
import { Matrix4x4 } from "../../../maths/Matrix4x4";

/**
 * @deprecated
 * <code>LightSprite</code> 类用于创建灯光的父类。
 */
export class LightSprite extends Sprite3D {
	/** @internal */
	_light: Light;
	/**
	 * 灯光颜色。
	 */
	get color(): Color {
		return this._light.color;
	}

	set color(value: Color) {
		this._light.color = value;
	}

	/**
	 * 灯光烘焙模式
	 */
	get mode(): LightMode {
		return this._light.lightmapBakedType;
	}

	set mode(value: LightMode) {
		this._light.lightmapBakedType = value;
	}

	/**
	 * 灯光强度。
	 */
	get intensity(): number {
		return this._light.intensity;
	}

	set intensity(value: number) {
		this._light.intensity = value;
	}

	/**
	 * 阴影模式。
	 */
	get shadowMode(): ShadowMode {
		return this._light.shadowMode;
	}

	set shadowMode(value: ShadowMode) {
		this._light.shadowMode = value
	}

	/**
	 * 最大阴影距离。
	 */
	get shadowDistance(): number {
		return this._light.shadowDistance;
	}

	set shadowDistance(value: number) {
		this._light.shadowDistance = value;
	}

	/**
	 * 阴影贴图分辨率。
	 */
	get shadowResolution(): number {
		return this._light.shadowResolution;
	}

	set shadowResolution(value: number) {
		this._light.shadowResolution = value;
	}

	/**
	 * 阴影深度偏差。
	 */
	get shadowDepthBias(): number {
		return this._light.shadowDepthBias;
	}

	set shadowDepthBias(value: number) {
		this._light.shadowDepthBias = value;
	}

	/**
	 * 阴影法线偏差。
	 */
	get shadowNormalBias(): number {
		return this._light.shadowNormalBias;
	}

	set shadowNormalBias(value: number) {
		this._light.shadowNormalBias = value;
	}

	/**
	 * 阴影强度。
	 */
	get shadowStrength(): number {
		return this._light.shadowStrength;
	}

	set shadowStrength(value: number) {
		this._light.shadowStrength = value;
	}

	/**
	 * 阴影视锥的近裁面。
	 */
	get shadowNearPlane(): number {
		return this._light.shadowNearPlane;
	}

	set shadowNearPlane(value: number) {
		this._light.shadowNearPlane = value;
	}

	/**
	 * 灯光烘培类型。
	 */
	get lightmapBakedType(): number {
		return this._light.lightmapBakedType;
	}

	set lightmapBakedType(value: number) {
		this._light.lightmapBakedType = value;
	}

	/**
	 * 获取灯光世界矩阵
	 */
	get lightWorldMatrix(): Matrix4x4 {
		return this._light.lightWorldMatrix;
	}

	/**
	 * 创建一个 <code>LightSprite</code> 实例。
	 */
	constructor() {
		super();
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_parse(data: any, spriteMap: any): void {
		super._parse(data, spriteMap);
		var colorData: any[] = data.color;
		this.color.r = colorData[0];
		this.color.g = colorData[1];
		this.color.b = colorData[2];
		this.intensity = data.intensity;
		this.lightmapBakedType = data.lightmapBakedType;
	}
	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(destObject: any, rootSprite: Node, dstSprite: Node) {
		super._cloneTo(destObject, rootSprite, dstSprite);
		var spriteLight = <LightSprite>destObject;
		spriteLight.color = this.color.clone();
		spriteLight.intensity = this.intensity;
		spriteLight.lightmapBakedType = this.lightmapBakedType;
	}

	/**
	 * @internal
	 */
	protected _addToLightQueue(): void {
	}

	/**
	 * @internal
	 */
	protected _removeFromLightQueue(): void {
	}

	/**
	 * @internal
	 */
	protected _create(): Node {
		return new Sprite3D();
	}
}

