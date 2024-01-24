import { Material } from "laya/resource/Material";
import { Color } from "laya/maths/Color";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "laya/RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { BaseTexture } from "laya/resource/BaseTexture";
import OutlineFS from "../customShader/outline.fs";
import OutlineVS from "../customShader/outline.vs";
import Outline02FS from "../customShader/outline02.fs";
import Outline02VS from "../customShader/outline02.vs";
import { ShaderDataType } from "laya/RenderDriver/RenderModuleData/Design/ShaderData";
import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";
import { ShaderDefine } from "laya/RenderDriver/RenderModuleData/Design/ShaderDefine";

/**
 * ...
 * @author ...
 */
export class MultiplePassOutlineMaterial extends Material {
	static ALBEDOTEXTURE: number;
	static OUTLINECOLOR: number;
	static OUTLINEWIDTH: number;
	static OUTLINELIGHTNESS: number;

	static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;

	/**
	 * @private
	 */
	static __init__(): void {
		MultiplePassOutlineMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
		MultiplePassOutlineMaterial.OUTLINECOLOR = Shader3D.propertyNameToID("u_OutlineColor");
		MultiplePassOutlineMaterial.OUTLINEWIDTH = Shader3D.propertyNameToID("u_OutlineWidth");
		MultiplePassOutlineMaterial.OUTLINELIGHTNESS = Shader3D.propertyNameToID("u_OutlineLightness");
	}
	/**
	 * 漫反射贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this.getTextureByIndex(MultiplePassOutlineMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		this.setTextureByIndex(MultiplePassOutlineMaterial.ALBEDOTEXTURE, value);
	}
	/**
	 * 线条颜色
	 */
	get outlineColor(): Color {
		return this.getColorByIndex(MultiplePassOutlineMaterial.OUTLINECOLOR);
	}

	set outlineColor(value: Color) {
		this.setColorByIndex(MultiplePassOutlineMaterial.OUTLINECOLOR, value);
	}
	/**
	 * 获取轮廓宽度,范围为0到0.05。
	 */
	get outlineWidth(): number {
		return this.getFloatByIndex(MultiplePassOutlineMaterial.OUTLINEWIDTH);
	}

	set outlineWidth(value: number) {
		value = Math.max(0.0, Math.min(0.05, value));
		this.setFloatByIndex(MultiplePassOutlineMaterial.OUTLINEWIDTH, value);
	}

	/**
	 * 轮廓亮度,范围为0到1。
	 */
	get outlineLightness(): number {
		return this.getFloatByIndex(MultiplePassOutlineMaterial.OUTLINELIGHTNESS);
	}

	set outlineLightness(value: number) {
		value = Math.max(0.0, Math.min(1.0, value));
		this.setFloatByIndex(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, value);
	}


	static initShader(): void {
		MultiplePassOutlineMaterial.__init__();

		var uniformMap: any = {
			'u_OutlineLightness': ShaderDataType.Float,
			'u_OutlineColor': ShaderDataType.Color,
			'u_AlbedoTexture': ShaderDataType.Texture2D,
			'u_OutlineWidth': ShaderDataType.Float

		};
		var customShader: Shader3D = Shader3D.add("MultiplePassOutlineShader");
		var subShader: SubShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap);
		customShader.addSubShader(subShader);
		var pass1: ShaderPass = subShader.addShaderPass(OutlineVS, OutlineFS);
		pass1.renderState.cull = RenderState.CULL_FRONT;
		pass1.statefirst = true;
		subShader.addShaderPass(Outline02VS, Outline02FS);
	}



	constructor() {
		super();
		this.setShaderName("MultiplePassOutlineShader");
		this.setFloatByIndex(MultiplePassOutlineMaterial.OUTLINEWIDTH, 0.01581197);
		this.setFloatByIndex(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, 1);
		this.setColorByIndex(MultiplePassOutlineMaterial.OUTLINECOLOR, new Color(1.0, 1.0, 1.0, 0.0));
	}
}


