import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderData } from "../../shader/ShaderData";
import { Material } from "./Material";
import { RenderState } from "./RenderState";
import { BaseTexture } from "../../../resource/BaseTexture";
import { ShaderDefine } from "../../shader/ShaderDefine";

/**
 * <code>BlinnPhongMaterial</code> 类用于实现Blinn-Phong材质。
 */
export class BlinnPhongMaterial extends Material {
	/**高光强度数据源_漫反射贴图的Alpha通道。*/
	static SPECULARSOURCE_DIFFUSEMAPALPHA: number;
	/**高光强度数据源_高光贴图的RGB通道。*/
	static SPECULARSOURCE_SPECULARMAP: number;

	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态_透明混合。*/
	static RENDERMODE_TRANSPARENT: number = 2;

	/**@internal */
	static SHADERDEFINE_DIFFUSEMAP: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_NORMALMAP: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SPECULARMAP: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ENABLETRANSMISSION:ShaderDefine;
	/**@internal */
	static SHADERDEFINE_THICKNESSMAP:ShaderDefine;
	/**@internal */
	static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_DiffuseTexture");
	/**@internal */
	static NORMALTEXTURE: number = Shader3D.propertyNameToID("u_NormalTexture");
	/**@internal */
	static SPECULARTEXTURE: number = Shader3D.propertyNameToID("u_SpecularTexture");
	/**@internal */
	static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_DiffuseColor");
	/**@internal */
	static MATERIALSPECULAR: number = Shader3D.propertyNameToID("u_MaterialSpecular");
	/**@internal */
	static SHININESS: number = Shader3D.propertyNameToID("u_Shininess");
	/**@internal */
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
	/**@internal */
	static TRANSMISSIONRATE:number = Shader3D.propertyNameToID("u_TransmissionRate");
	/**@internal */
	static IBACKDIFFUSE:number = Shader3D.propertyNameToID("u_BackDiffuse");
	/**@internal */
	static IBACKSCALE:number = Shader3D.propertyNameToID("u_BackScale");
	/**@internal */
	static THINKNESSTEXTURE:number = Shader3D.propertyNameToID("u_ThinknessTexture");
	/**@internal */
	static TRANSMISSIONCOLOR:number = Shader3D.propertyNameToID("u_TransmissionColor");
	/**@internal */
	static AlbedoIntensity: number = Shader3D.propertyNameToID("u_AlbedoIntensity");

	/** 默认材质，禁止修改*/
	static defaultMaterial: BlinnPhongMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP = Shader3D.getDefineByName("DIFFUSEMAP");
		BlinnPhongMaterial.SHADERDEFINE_NORMALMAP = Shader3D.getDefineByName("NORMALMAP");
		BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP = Shader3D.getDefineByName("SPECULARMAP");
		BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
		BlinnPhongMaterial.SHADERDEFINE_ENABLETRANSMISSION = Shader3D.getDefineByName("ENABLETRANSMISSION");
		BlinnPhongMaterial.SHADERDEFINE_THICKNESSMAP = Shader3D.getDefineByName("THICKNESSMAP");
	}

	/**
	 * @internal
	 */
	get _ColorR(): number {
		return this.albedoColor.x;
	}

	set _ColorR(value: number) {
		let albedoColor = this.albedoColor;
		albedoColor.x = value;
		this.albedoColor = albedoColor;
	}

	/**
	 * @internal
	 */
	get _ColorG(): number {
		return this.albedoColor.y;
	}

	set _ColorG(value: number) {
		let albedoColor = this.albedoColor;
		albedoColor.y = value;
		this.albedoColor = albedoColor;
	}

	/**
	 * @internal
	 */
	get _ColorB(): number {
		return this.albedoColor.z;
	}

	set _ColorB(value: number) {
		let albedoColor = this.albedoColor;
		albedoColor.z = value;
		this.albedoColor = albedoColor;
	}

	/**
	 * @internal
	 */
	get _ColorA(): number {
		return this.albedoColor.w;
	}

	set _ColorA(value: number) {
		let albedoColor = this.albedoColor;
		albedoColor.w = value;
		this.albedoColor = albedoColor;
	}

	/**
	 * @internal
	 */
	get _Color(): Vector4 {
		return this._shaderValues.getVector(BlinnPhongMaterial.ALBEDOCOLOR);
	}

	set _Color(value: Vector4) {
		this.albedoColor = value;
	}

	/**
	 * @internal
	 */
	get _SpecColorR(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).x;
	}

	set _SpecColorR(value: number) {
		this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).x = value;
	}

	/**
	 * @internal
	 */
	get _SpecColorG(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).y;
	}

	set _SpecColorG(value: number) {
		this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).y = value;
	}

	/**
	 * @internal
	 */
	get _SpecColorB(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).z;
	}

	set _SpecColorB(value: number) {
		this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).z = value;
	}

	/**
	 * @internal
	 */
	get _SpecColorA(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).w;
	}

	set _SpecColorA(value: number) {
		this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).w = value;
	}

	/**
	 * @internal
	 */
	get _SpecColor(): Vector4 {
		return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR);
	}

	set _SpecColor(value: Vector4) {
		this.specularColor = value;
	}

	/**
	 * @internal
	 */
	get _Shininess(): number {
		return this._shaderValues.getNumber(BlinnPhongMaterial.SHININESS);
	}

	set _Shininess(value: number) {
		value = Math.max(0.0, Math.min(1.0, value));
		this._shaderValues.setNumber(BlinnPhongMaterial.SHININESS, value);
	}

	/**
	 * @internal
	 */
	get _MainTex_STX(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).x;
	}

	set _MainTex_STX(x: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET));
		tilOff.x = x;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STY(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).y;
	}

	set _MainTex_STY(y: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET));
		tilOff.y = y;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STZ(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).z;
	}

	set _MainTex_STZ(z: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET));
		tilOff.z = z;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STW(): number {
		return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).w;
	}

	set _MainTex_STW(w: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET));
		tilOff.w = w;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_ST(): Vector4 {
		return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET);
	}

	set _MainTex_ST(value: Vector4) {
		this.tilingOffset = value;
	}

	/**
	 * @internal
	 */
	get _Cutoff(): number {
		return this.alphaTestValue;
	}

	set _Cutoff(value: number) {
		this.alphaTestValue = value;
	}

	/**
	 * 设置渲染模式。
	 * @param 渲染模式
	 */
	set renderMode(value: number) {
		switch (value) {
			case BlinnPhongMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BlinnPhongMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BlinnPhongMaterial.RENDERMODE_TRANSPARENT:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			default:
				throw new Error("Material:renderMode value error.");
		}
	}

	/**
	 * 是否支持顶点色。
	 */
	get enableVertexColor(): boolean {
		return this._shaderValues.hasDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	set enableVertexColor(value: boolean) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	/**
	 * 纹理平铺和偏移X分量。
	 */
	get tilingOffsetX(): number {
		return this._MainTex_STX;
	}

	set tilingOffsetX(x: number) {
		this._MainTex_STX = x;
	}

	/**
	 * 纹理平铺和偏移Y分量。
	 */
	get tilingOffsetY(): number {
		return this._MainTex_STY;
	}

	set tilingOffsetY(y: number) {
		this._MainTex_STY = y;
	}

	/**
	 * 纹理平铺和偏移Z分量。
	 */
	get tilingOffsetZ(): number {
		return this._MainTex_STZ;
	}

	set tilingOffsetZ(z: number) {
		this._MainTex_STZ = z;
	}

	/**
	 * 纹理平铺和偏移W分量。
	 */
	get tilingOffsetW(): number {
		return this._MainTex_STW;
	}

	set tilingOffsetW(w: number) {
		this._MainTex_STW = w;
	}

	/**
	 * 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			this._shaderValues.setVector(BlinnPhongMaterial.TILINGOFFSET, value);
		}
		else {
			this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
		}
	}

	/**
	 * 反照率颜色R分量。
	 */
	get albedoColorR(): number {
		return this._ColorR;
	}

	set albedoColorR(value: number) {
		this._ColorR = value;
	}

	/**
	 * 反照率颜色G分量。
	 */
	get albedoColorG(): number {
		return this._ColorG;
	}

	set albedoColorG(value: number) {
		this._ColorG = value;
	}

	/**
	 * 反照率颜色B分量。
	 */
	get albedoColorB(): number {
		return this._ColorB;
	}

	set albedoColorB(value: number) {
		this._ColorB = value;
	}

	/**
	 * 反照率颜色Z分量。
	 */
	get albedoColorA(): number {
		return this._ColorA;
	}

	set albedoColorA(value: number) {
		this._ColorA = value;
	}

	/**
	 * 反照率颜色。
	 */
	get albedoColor(): Vector4 {
		return this._shaderValues.getVector(BlinnPhongMaterial.ALBEDOCOLOR);
	}

	set albedoColor(value: Vector4) {
		this._shaderValues.setVector(BlinnPhongMaterial.ALBEDOCOLOR, value);//修改值后必须调用此接口,否则NATIVE不生效
	}

	/**
	 * 反照率强度。
	 */
	get albedoIntensity(): number {
		return this._shaderValues.getNumber(BlinnPhongMaterial.AlbedoIntensity);
	}

	set albedoIntensity(value: number) {
		this._shaderValues.setNumber(BlinnPhongMaterial.AlbedoIntensity, value);
	}

	/**
	 * 高光颜色R轴分量。
	 */
	get specularColorR(): number {
		return this._SpecColorR;
	}

	set specularColorR(value: number) {
		this._SpecColorR = value;
	}

	/**
	 * 高光颜色G分量。
	 */
	get specularColorG(): number {
		return this._SpecColorG;
	}

	set specularColorG(value: number) {
		this._SpecColorG = value;
	}

	/**
	 * 高光颜色B分量。
	 */
	get specularColorB(): number {
		return this._SpecColorB;
	}

	set specularColorB(value: number) {
		this._SpecColorB = value;
	}

	/**
	 * 高光颜色A分量。
	 */
	get specularColorA(): number {
		return this._SpecColorA;
	}

	set specularColorA(value: number) {
		this._SpecColorA = value;
	}

	/**
	 * 高光颜色。
	 */
	get specularColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR));
	}

	set specularColor(value: Vector4) {
		this._shaderValues.setVector(BlinnPhongMaterial.MATERIALSPECULAR, value);
	}

	/**
	 * 高光强度,范围为0到1。
	 */
	get shininess(): number {
		return this._Shininess;
	}

	set shininess(value: number) {
		this._Shininess = value;
	}

	/**
	 * 反照率贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(BlinnPhongMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
		this._shaderValues.setTexture(BlinnPhongMaterial.ALBEDOTEXTURE, value);
	}

	/**
	 * 法线贴图。
	 */
	get normalTexture(): BaseTexture {
		return this._shaderValues.getTexture(BlinnPhongMaterial.NORMALTEXTURE);
	}

	set normalTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
		this._shaderValues.setTexture(BlinnPhongMaterial.NORMALTEXTURE, value);
	}

	/**
	 * 高光贴图。
	 */
	get specularTexture(): BaseTexture {
		return this._shaderValues.getTexture(BlinnPhongMaterial.SPECULARTEXTURE);
	}

	set specularTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);

		this._shaderValues.setTexture(BlinnPhongMaterial.SPECULARTEXTURE, value);
	}
	/**
	 * 是否支持顶点色。
	 */
	get enableTransmission(): boolean {
		return this._shaderValues.hasDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLETRANSMISSION);
	}

	set enableTransmission(value: boolean) {
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLETRANSMISSION);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLETRANSMISSION);
	}

	/**
	 * 透光率，会影响漫反射以及透光强度
	 */
	get transmissionRate():number{
		return this._shaderValues.getNumber(BlinnPhongMaterial.TRANSMISSIONRATE);
	}
	
	set transmissionRata(value:number){
		this._shaderValues.setNumber(BlinnPhongMaterial.TRANSMISSIONRATE,value);
	}

	/**
	 * 透射影响范围指数
	 */
	get backDiffuse():number{
		return this._shaderValues.getNumber(BlinnPhongMaterial.IBACKDIFFUSE);
	}
	set backDiffuse(value:number){
		this._shaderValues.setNumber(BlinnPhongMaterial.IBACKDIFFUSE,Math.max(value,1.0));
	}
	/**
	 * 透射光强度
	 */
	get backScale():number{
		return this._shaderValues.getNumber(BlinnPhongMaterial.IBACKSCALE);
	}
	set backScale(value:number){
		this._shaderValues.setNumber(BlinnPhongMaterial.IBACKSCALE,value);
	}

	/**
	 * 厚度贴图，会影响透视光，越厚，透射光越弱
	 */
	get thinknessTexture():BaseTexture{
		return this._shaderValues.getTexture(BlinnPhongMaterial.THINKNESSTEXTURE);
	}
	set thinknessTexture(value:BaseTexture){
		if (value)
			this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_THICKNESSMAP);
		else
			this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_THICKNESSMAP);

		this._shaderValues.setTexture(BlinnPhongMaterial.THINKNESSTEXTURE, value);
	}

	/**
	 * 透光颜色。模拟透光物质内部颜色吸收率
	 */
	get transmissionColor():Vector4{
		return this._shaderValues.getVector(BlinnPhongMaterial.TRANSMISSIONCOLOR);
	}
	set transmissionColor(value:Vector4){
		this._shaderValues.setVector(BlinnPhongMaterial.TRANSMISSIONCOLOR,value);
	}

	/**
	 * 创建一个 <code>BlinnPhongMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("BLINNPHONG");
		this.albedoIntensity = 1.0;
		var sv: ShaderData = this._shaderValues;
		sv.setVector(BlinnPhongMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		sv.setVector(BlinnPhongMaterial.MATERIALSPECULAR, new Vector4(1.0, 1.0, 1.0, 1.0));
		sv.setNumber(BlinnPhongMaterial.SHININESS, 0.078125);
		sv.setNumber(Material.ALPHATESTVALUE, 0.5);
		sv.setVector(BlinnPhongMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this.albedoIntensity = 1.0;
		this.renderMode = BlinnPhongMaterial.RENDERMODE_OPAQUE;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: BlinnPhongMaterial = new BlinnPhongMaterial();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destMaterial: BlinnPhongMaterial = (<BlinnPhongMaterial>destObject);
		destMaterial.albedoIntensity = this.albedoIntensity;
		destMaterial.enableVertexColor = this.enableVertexColor;
		this.albedoColor.cloneTo(destMaterial.albedoColor);
	}
}


