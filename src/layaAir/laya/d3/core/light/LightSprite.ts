import { Config3D } from "../../../../Config3D";
import { Node } from "../../../display/Node";
import { Vector3 } from "../../math/Vector3";
import { Scene3D } from "../scene/Scene3D";
import { Sprite3D } from "../Sprite3D";
import { ShadowMode } from "./ShadowMode";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Light } from "./Light";

/**
 * @internal
 */
export enum LightType {
	Directional,
	Spot,
	Point
}

export enum LightMode {
	Bake,//烘培灯光，不计入灯光效果
	RealTime,//实时光
	Mix//只在没有lightmap的模型上生效
}

/**
 * <code>LightSprite</code> 类用于创建灯光的父类。
 */
export class LightSprite extends Sprite3D {
	/** @internal */
	_light: Light;
	_mode:LightMode;
	/**
	 * 灯光颜色。
	 */
	get color(): Vector3 {
		return this._light.color;
	}

	set color(value: Vector3) {
		this._light.color = value;
	}

	get mode():LightMode{
		return this._mode;
	}

	set mode(value:LightMode){
		this._mode = value;
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
		this.color.fromArray(colorData);
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

	/**
	 * @deprecated
	 * please use color property instead.
	 */
	get diffuseColor(): Vector3 {
		console.log("LightSprite: discard property,please use color property instead.");
		return this.color;
	}

	set diffuseColor(value: Vector3) {
		console.log("LightSprite: discard property,please use color property instead.");
		this.color = value;
	}

}

