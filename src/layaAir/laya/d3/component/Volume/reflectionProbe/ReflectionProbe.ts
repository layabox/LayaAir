import { TextureDecodeFormat } from "../../../../RenderEngine/RenderEnum/TextureDecodeFormat";
import { Sprite3D } from "../../../core/Sprite3D";
import { Bounds } from "../../../math/Bounds";
import { TextureCube } from "../../../resource/TextureCube";
import { Volume } from "../Volume";
import { VolumeManager } from "../VolumeManager";
import { SphericalHarmonicsL2, SphericalHarmonicsL2Generater } from "../../../graphics/SphericalHarmonicsL2";
import { ShaderData, ShaderDataType } from "../../../../RenderEngine/RenderShader/ShaderData";
import { RenderableSprite3D } from "../../../core/RenderableSprite3D";
import { Sprite3DRenderDeclaration } from "../../../core/render/Sprite3DRenderDeclaration";
import { ILaya3D } from "../../../../../ILaya3D";
import { AmbientMode } from "../../../core/scene/AmbientMode";
import { Color } from "../../../../maths/Color";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";


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
	//因为纹理数量问题 暂不支持探针混合
	static TEMPVECTOR3: Vector3 = new Vector3();
	/** 默认解码数据 */
	static defaultTextureHDRDecodeValues: Vector4 = new Vector4(1.0, 1.0, 0.0, 0.0);
	/** 盒子反射是否开启 */
	private _boxProjection: boolean = false;
	/** 包围盒 */
	protected _bounds: Bounds;
	/** 探针重要度 */
	protected _importance: number;
	/**漫反射顔色 */
	private _ambientColor: Color = new Color();
	/**漫反射SH */
	private _ambientSH: Float32Array;
	/**漫反射强度 */
	private _ambientIntensity: number;
	/**ibl反射 */
	private _iblTex: TextureCube;
	/**ibl是否压缩 */
	private _iblTexRGBD: boolean;
	/**反射强度 */
	private _reflectionIntensity: number;
	/** @internal */
	private _ambientMode: AmbientMode = AmbientMode.SolidColor;

	/** 是否是场景探针 */
	_isScene: boolean = false;
	/**修改了值，需要更新shader，需要和updateMask对应 */
	_updateMark: number;

	constructor() {
		super();
		this._importance = 0;
		this._type = VolumeManager.ReflectionProbeVolumeType;
		this._ambientIntensity = 1.0;
		this._reflectionIntensity = 1.0;
		this.boundsMax = new Vector3(5, 5, 5);
		this.boundsMin = new Vector3(-5, -5, -5);
	}


	/**
	 * 是否开启正交反射。
	 */
	get boxProjection(): boolean {
		return this._boxProjection;
	}

	set boxProjection(value: boolean) {
		if (value != this._boxProjection) {
			this._updateMark = ILaya3D.Scene3D._updateMark;
		}
		this._boxProjection = value;
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
		return this._ambientIntensity;
	}

	set ambientIntensity(value: number) {
		if (value == this._ambientIntensity) return;
		this._ambientIntensity = value;
		this._updateMark = ILaya3D.Scene3D._updateMark;
	}

	/**
	 * 设置反射探针强度
	 */
	get reflectionIntensity(): number {
		return this._reflectionIntensity;
	}

	set reflectionIntensity(value: number) {
		if (value == this._reflectionIntensity) return;
		value = Math.max(value, 0.0);
		this._reflectionIntensity = value
		this._updateMark = ILaya3D.Scene3D._updateMark;
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
			this._updateMark = ILaya3D.Scene3D._updateMark;
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
			this._updateMark = ILaya3D.Scene3D._updateMark;
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
		value && value.cloneTo(this._ambientColor);
		if (this.ambientMode == AmbientMode.SolidColor)
			this._updateMark = ILaya3D.Scene3D._updateMark;
	}

	/**
	 * 漫反射颜色 sh
	 */
	public get ambientSH(): Float32Array {
		return this._ambientSH;
	}

	public set ambientSH(value: Float32Array) {
		if (this.ambientMode == AmbientMode.SphericalHarmonics)
			this._updateMark = ILaya3D.Scene3D._updateMark;
		this._ambientSH = value;
	}

	/**
	* 环境光模式。
	* 如果值为AmbientMode.SolidColor一般使用ambientColor作为环境光源，如果值为如果值为AmbientMode.SphericalHarmonics一般使用ambientSphericalHarmonics作为环境光源。
	*/
	get ambientMode(): AmbientMode {
		return this._ambientMode;
	}

	set ambientMode(value: AmbientMode) {
		if (value == this.ambientMode) return;
		this._ambientMode = value;
		if (!this.ambientSH) {
			if (value == AmbientMode.SphericalHarmonics) {
				this._ambientSphericalHarmonics && this._applySHCoefficients(this._ambientSphericalHarmonics, Math.pow(this._ambientIntensity,2.2));
			} else if (value == AmbientMode.TripleColor) {
				this._ambientTripleColorSphericalHarmonics && this._applySHCoefficients(this._ambientTripleColorSphericalHarmonics, 1.0);
			}
		}
		this._updateMark = ILaya3D.Scene3D._updateMark;

	}

	/**
	 * Image base Light
	 */
	public get iblTex(): TextureCube {
		return this._iblTex;
	}

	public set iblTex(value: TextureCube) {
		if (this.iblTex == value) return;
		if (this.iblTex) this.iblTex._removeReference();
		this._iblTex = value;
		if (value)
			value._addReference();
		this._updateMark = ILaya3D.Scene3D._updateMark;
	}

	/**
	 * Image base Light Compress by RGBD
	 */
	public get iblTexRGBD(): boolean {
		return this._iblTexRGBD;
	}

	public set iblTexRGBD(value: boolean) {
		if (value == this._iblTexRGBD)
			return;
		this._iblTexRGBD = value;
		this._updateMark = ILaya3D.Scene3D._updateMark;
	}

	applyReflectionShaderData(shaderData: ShaderData) {
		//boxProjection
		if (!this.boxProjection) {
			shaderData.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
		} else {
			shaderData.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
			shaderData.setShaderData(RenderableSprite3D.REFLECTIONCUBE_PROBEPOSITION, ShaderDataType.Vector3, this.probePosition);
			shaderData.setShaderData(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMAX, ShaderDataType.Vector3, this._bounds.getMax());
			shaderData.setShaderData(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMIN, ShaderDataType.Vector3, this._bounds.getMin());

		}
		if (this.ambientMode == AmbientMode.SolidColor) {
			shaderData.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL);
			shaderData.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_IBL);
			shaderData.setColor(RenderableSprite3D.AMBIENTCOLOR, this.ambientColor);
		} else if (this.iblTex && this.ambientSH) {
			shaderData.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_IBL);
			shaderData.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL);
			this.iblTex && shaderData.setTexture(RenderableSprite3D.IBLTEX, this.iblTex);
			this.iblTexRGBD ? shaderData.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD) : shaderData.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD);
			this.ambientSH && shaderData.setBuffer(RenderableSprite3D.AMBIENTSH, this.ambientSH);
		} else {//Legency
			shaderData.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_IBL);
			if (this._reflectionTexture) {
				shaderData.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL);
				shaderData.setShaderData(RenderableSprite3D.REFLECTIONTEXTURE, ShaderDataType.TextureCube, this.reflectionTexture);
				shaderData.setShaderData(RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS, ShaderDataType.Vector4, this.reflectionHDRParams);
			}

			if (this._shCoefficients) {
				shaderData.setVector(RenderableSprite3D.AMBIENTSHAR, this._shCoefficients[0]);
				shaderData.setVector(RenderableSprite3D.AMBIENTSHAG, this._shCoefficients[1]);
				shaderData.setVector(RenderableSprite3D.AMBIENTSHAB, this._shCoefficients[2]);
				shaderData.setVector(RenderableSprite3D.AMBIENTSHBR, this._shCoefficients[3]);
				shaderData.setVector(RenderableSprite3D.AMBIENTSHBG, this._shCoefficients[4]);
				shaderData.setVector(RenderableSprite3D.AMBIENTSHBB, this._shCoefficients[5]);
				shaderData.setVector(RenderableSprite3D.AMBIENTSHC, this._shCoefficients[6]);
			}

		}
		shaderData.setNumber(RenderableSprite3D.AMBIENTINTENSITY, this.ambientIntensity);
		shaderData.setNumber(RenderableSprite3D.REFLECTIONINTENSITY, this.reflectionIntensity);
	}

	/**
	* @inheritDoc
	* @override
	*/
	protected _onEnable(): void {
		super._onEnable();
		this._updateMark = ILaya3D.Scene3D._updateMark;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onDisable(): void {
		super._onDisable();
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onDestroy() {

	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(dest: ReflectionProbe): void {
		//TODO
	}



	//----------------------------------------deprecated--------------------------------------------
	/**
	 * @deprecated
	 *  反射探针图片 */
	private _reflectionTexture: TextureCube;
	/**
	 * @deprecated
	 *  反射参数 
	 */
	private _reflectionHDRParams: Vector4 = new Vector4();
	/**
	 * @deprecated 反射探针解码格式 
	 */
	private _reflectionDecodeFormat: TextureDecodeFormat = TextureDecodeFormat.Normal;
	/**
	 * @deprecated
	 *  @internal 
	 */
	private _ambientSphericalHarmonics: SphericalHarmonicsL2;
	/**
	 * 三颜色
	 * @deprecated
	 *  @internal 
	 */
	private _ambientTripleColorSphericalHarmonics: SphericalHarmonicsL2;
	/**
	 * @deprecated
	 *  @internal 
	 */
	private _shCoefficients: Vector4[];
	/**
	 * @deprecated
	 *  @internal 
	 */
	private _ambientSkyColor: Vector3 = new Vector3();
	/**
	 * @deprecated
	 *  @internal 
	 */
	private _ambientEquatorColor: Vector3 = new Vector3();
	/**
	 * @deprecated
	 *  @internal 
	 */
	private _ambientGroundColor: Vector3 = new Vector3();

	/**
	 * @deprecated
	 * 设置反射贴图
	 */
	get reflectionTexture() {
		return this._reflectionTexture;
	}

	set reflectionTexture(value: TextureCube) {
		if (this._reflectionTexture == value) return;
		if (this._reflectionTexture) this.iblTex._removeReference();
		this._reflectionTexture = value
		if(value){
			this._reflectionTexture._addReference();
			this._updateMark = ILaya3D.Scene3D._updateMark;
		}
	}

	/**
	* @deprecated
	*/
	get customReflection(): TextureCube {
		return this.reflectionTexture;
	}

	set customReflection(value: TextureCube) {
		this.reflectionTexture = value;
	}

	/**
	 * @deprecated
	 * 反射参数
	 */
	get reflectionHDRParams(): Vector4 {
		return this._reflectionHDRParams;
	}

	/**
	 * @deprecated
	 * @internal
	 */
	set reflectionHDRParams(value: Vector4) {
		this._reflectionHDRParams = value;
		this._updateMark = ILaya3D.Scene3D._updateMark;
	}

	/**
	 * 反射立方体纹理解码格式。
	 * @deprecated
	 */
	get reflectionDecodingFormat(): TextureDecodeFormat {
		return this._reflectionDecodeFormat;
	}

	set reflectionDecodingFormat(value: TextureDecodeFormat) {
		if (this._reflectionDecodeFormat != value) {
			this._reflectionDecodeFormat = value;
			if (this._reflectionDecodeFormat == TextureDecodeFormat.RGBM)
				this._reflectionHDRParams.x = 5.0;//5.0 is RGBM param
			this._updateMark = ILaya3D.Scene3D._updateMark;
		}
	}

	/**
	* @deprecated
	* 球谐环境光,修改后必须重新赋值。
	* use scene.ambientSH
	*/
	get ambientSphericalHarmonics(): SphericalHarmonicsL2 {
		return this._ambientSphericalHarmonics;
	}

	/**
	 * @deprecated
	 * use scene.ambientSH
	 */
	set ambientSphericalHarmonics(value: SphericalHarmonicsL2) {
		var originalSH: SphericalHarmonicsL2 = value || SphericalHarmonicsL2._default;

		if (!this._ambientSphericalHarmonics) {
			this._ambientSphericalHarmonics = new SphericalHarmonicsL2();
		}
		if (this._ambientSphericalHarmonics != value)
			value.cloneTo(this._ambientSphericalHarmonics);
		if (this.ambientMode == AmbientMode.TripleColor)
			this._applySHCoefficients(originalSH, 2.2);//Gamma to Linear,I prefer use 'Color.gammaToLinearSpace',but must same with Unity now.
		this._updateMark = ILaya3D.Scene3D._updateMark;
	}


	/**
	 * @deprecated
	 * @internal
	 */
	private _applySHCoefficients(originalSH: SphericalHarmonicsL2, intensity: number): void {
		if (!this._shCoefficients) {
			this._shCoefficients = new Array(7);
			for (var i: number = 0; i < 7; i++)
				this._shCoefficients[i] = new Vector4();
		}
		var optSH: Vector4[] = this._shCoefficients;
		for (var i = 0; i < 3; i++) {
			var shaderSHA: Vector4 = optSH[i];
			var shaderSHB: Vector4 = optSH[i + 3];
			shaderSHA.setValue(originalSH.getCoefficient(i, 3) * intensity, originalSH.getCoefficient(i, 1) * intensity, originalSH.getCoefficient(i, 2) * intensity, (originalSH.getCoefficient(i, 0) - originalSH.getCoefficient(i, 6)) * intensity);
			shaderSHB.setValue(originalSH.getCoefficient(i, 4) * intensity, originalSH.getCoefficient(i, 5) * intensity, originalSH.getCoefficient(i, 6) * 3 * intensity, originalSH.getCoefficient(i, 7) * intensity);// Quadratic polynomials 
		}
		optSH[6].setValue(originalSH.getCoefficient(0, 8) * intensity, originalSH.getCoefficient(1, 8) * intensity, originalSH.getCoefficient(2, 8) * intensity, 1);// Final quadratic polynomial
	}

	/**
   * @deprecated
   * 设置 天空， 地平线， 地面 环境光颜色
   */
	public setGradientAmbient(skyColor: Vector3, equatorColor: Vector3, groundColor: Vector3) {
		this._ambientSkyColor = skyColor;
		this._ambientEquatorColor = equatorColor;
		this._ambientGroundColor = groundColor;

		let gradientSH = SphericalHarmonicsL2Generater.CalGradientSH(this._ambientSkyColor, this._ambientEquatorColor, this._ambientGroundColor, true);
		this._ambientTripleColorSphericalHarmonics = gradientSH;

		if (this.ambientMode == AmbientMode.TripleColor) {
			this._applySHCoefficients(gradientSH, 2.2);
		}
		this._updateMark = ILaya3D.Scene3D._updateMark;
	}
}


