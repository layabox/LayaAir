import { Sprite3D } from "../../../core/Sprite3D";
import { Bounds } from "../../../math/Bounds";
import { TextureCube } from "../../../../resource/TextureCube";
import { Volume } from "../Volume";
import { VolumeManager } from "../VolumeManager";
import { ILaya3D } from "../../../../../ILaya3D";
import { AmbientMode } from "../../../core/scene/AmbientMode";
import { Color } from "../../../../maths/Color";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { IReflectionProbeData } from "../../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";


/**
 * 反射探针模式
 */
export enum ReflectionProbeMode {
	/**烘培模式 */
	off = 0,//现在仅仅支持Back烘培
	/**实时简单采样模式 还未支持*/
	simple = 1,
}
/**
 * <code>ReflectionProbe</code> 类用于实现反射探针组件
 * @miner
 */
export class ReflectionProbe extends Volume {
	/**反射探针数量 */
	static reflectionCount: number = 0;
	/**获取一个全局唯一ID。*/
	static getID(): number {
		return ReflectionProbe.reflectionCount++;
	}

	//因为纹理数量问题 暂不支持探针混合
	static TEMPVECTOR3: Vector3 = new Vector3();
	/** 默认解码数据 */
	static defaultTextureHDRDecodeValues: Vector4 = new Vector4(1.0, 1.0, 0.0, 0.0);

	/**@internal @protected 探针重要度 */
	protected _importance: number;
	/**漫反射顔色 */
	private _ambientColor: Color = new Color();
	/**漫反射SH */
	private _ambientSH: Float32Array;
	/**@internal 是否是场景探针 */
	_isScene: boolean = false;
	/**@internal */
	_reflectionProbeID: number;
	/**@internal */
	_dataModule: IReflectionProbeData;

	constructor() {
		super();
		this._importance = 0;
		this._type = VolumeManager.ReflectionProbeVolumeType;
		this._dataModule = Laya3DRender.Render3DModuleDataFactory.createReflectionProbe();
		this._dataModule.bound = this._bounds;
		this._dataModule.ambientIntensity = 1.0;
		this._dataModule.reflectionIntensity = 1.0;
		this.boundsMax = new Vector3(5, 5, 5);
		this.boundsMin = new Vector3(-5, -5, -5);
		this._reflectionProbeID = ReflectionProbe.getID();
		this.ambientMode = AmbientMode.SolidColor;
	}


	/**
	 * 是否开启正交反射。
	 */
	get boxProjection(): boolean {
		return this._dataModule.boxProjection;
	}

	set boxProjection(value: boolean) {
		if (value != this._dataModule.boxProjection) {
			this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
		}
		this._dataModule.boxProjection = value;
	}

	/**
	 * 设置反射探针的重要度
	 */
	get importance(): number {
		return this._importance;
	}

	set importance(value: number) {
		this._importance = value
	}

	/**
	 * 设置环境漫反射的强度
	 */
	get ambientIntensity(): number {
		return this._dataModule.ambientIntensity;
	}

	set ambientIntensity(value: number) {
		if (value == this._dataModule.ambientIntensity) return;
		this._dataModule.ambientIntensity = value;
		this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
	}

	/**
	 * 设置反射探针强度
	 */
	get reflectionIntensity(): number {
		return this._dataModule.reflectionIntensity;
	}

	set reflectionIntensity(value: number) {
		if (value == this._dataModule.reflectionIntensity) return;
		value = Math.max(value, 0.0);
		this._dataModule.reflectionIntensity = value
		this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
	}

	_reCaculateBoundBox() {
		super._reCaculateBoundBox();
		this.owner && this._dataModule.setProbePosition((this.owner as Sprite3D).transform.position);
	}

	/**
	 * 获得反射探针的包围盒
	 */
	get bounds(): Bounds {
		return this._bounds as Bounds;
	}

	/**
	 * 包围盒 max
	 */
	set boundsMax(value: Vector3) {
		super.boundsMax = value;
		if (this.boxProjection)
			this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
	}

	get boundsMax(): Vector3 {
		return this._primitiveBounds.getMax();
	}

	/**
	 * 包围盒 min
	 */
	set boundsMin(value: Vector3) {
		super.boundsMin = value;
		if (this.boxProjection)
			this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
	}

	get boundsMin(): Vector3 {
		return this._primitiveBounds.getMin();
	}

	/**
	 * probe 位置
	 */
	get probePosition(): Vector3 {
		return (this.owner as Sprite3D).transform.position;
	}

	/**
	 * 漫反射颜色
	 */
	public get ambientColor(): Color {
		return this._ambientColor;
	}
	public set ambientColor(value: Color) {
		if (!value || value.equal(this._ambientColor))
			return
		value.cloneTo(this._ambientColor);
		this._dataModule.setAmbientColor(this._ambientColor);
		if (this.ambientMode == AmbientMode.SolidColor)
			this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
	}

	/**
	 * 漫反射颜色 sh
	 */
	public get ambientSH(): Float32Array {
		return this._ambientSH;
	}

	public set ambientSH(value: Float32Array) {
		if (this.ambientMode == AmbientMode.SphericalHarmonics)
			this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
		this._ambientSH = value;
		this._dataModule.setAmbientSH(this._ambientSH);
	}

	/**
	* 环境光模式。
	* 如果值为AmbientMode.SolidColor一般使用ambientColor作为环境光源，如果值为如果值为AmbientMode.SphericalHarmonics一般使用ambientSphericalHarmonics作为环境光源。
	*/
	get ambientMode(): AmbientMode {
		return this._dataModule.ambientMode;
	}

	set ambientMode(value: AmbientMode) {
		if (value == this.ambientMode) return;
		this._dataModule.ambientMode = value;
		this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;

	}

	private _iblTex: TextureCube;
	/**
	 * Image base Light
	 */
	public get iblTex(): TextureCube {
		return this._iblTex;
	}

	public set iblTex(value: TextureCube) {
		if (this._iblTex == value) return;
		if (this._iblTex) this._iblTex._removeReference();
		this._iblTex = value;
		this._dataModule.iblTex = null;
		if (value) {
			value._addReference();
			this._dataModule.iblTex = value._texture;
		}
		this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
	}

	/**
	 * Image base Light Compress by RGBD
	 */
	public get iblTexRGBD(): boolean {
		return this._dataModule.iblTexRGBD;
	}

	public set iblTexRGBD(value: boolean) {
		if (value == this._dataModule.iblTexRGBD)
			return;
		this._dataModule.iblTexRGBD = value;
		this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
	}

	/**
	 * @inheritdoc
	 * @protected
	 * @internal
	 */
	protected _onEnable(): void {
		super._onEnable();
		this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
	}

	/**
	 * @inheritdoc
	 * @internal
	 * @protected
	 */
	protected _onDisable(): void {
		super._onDisable();
	}

	/**
	 * @inheritdoc
	 * @internal
	 * @protected
	 */
	protected _onDestroy() {
		this.iblTex = null;
		this._dataModule.destroy();
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(dest: ReflectionProbe): void {
		//TODO
	}
}


