import { Material } from "laya/resource/Material";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "laya/resource/BaseTexture";
import SeprableSSSFS from "../shader/SeparableSSS_GasBlur.fs";
import SeprableSSSVS from "../shader/SeparableSSS_GasBlur.vs";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
import { MathUtils3D } from "laya/maths/MathUtils3D";
import { Vector2 } from "laya/maths/Vector2";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";
import { ShaderDataType } from "laya/RenderDriver/RenderModuleData/Design/ShaderData";

export class SeparableSSS_BlitMaterial extends Material {

	static SHADERVALUE_COLORTEX: number;
	static SHADERVALUE_DEPTHTEX: number;
	static SHADERVALUE_BLURDIR: number;
	static SHADERVALUE_SSSWIDTH: number;
	static SHADERVALUE_DISTANCETOPROJECTIONWINDOW: number;
	static SHADERVALUE_KENEL: number;

	static SHADERDEFINE_SAMPLE_HIGH
	static init() {
		SeparableSSS_BlitMaterial.SHADERVALUE_COLORTEX = Shader3D.propertyNameToID("u_MainTex");
		SeparableSSS_BlitMaterial.SHADERVALUE_DEPTHTEX = Shader3D.propertyNameToID("u_depthTex");
		SeparableSSS_BlitMaterial.SHADERVALUE_BLURDIR = Shader3D.propertyNameToID("u_blurDir");
		SeparableSSS_BlitMaterial.SHADERVALUE_SSSWIDTH = Shader3D.propertyNameToID("u_sssWidth");
		SeparableSSS_BlitMaterial.SHADERVALUE_DISTANCETOPROJECTIONWINDOW = Shader3D.propertyNameToID("u_distanceToProjectionWindow");
		SeparableSSS_BlitMaterial.SHADERVALUE_KENEL = Shader3D.propertyNameToID("u_kernel");

		var attributeMap: { [name: string]: [number, ShaderDataType] } = {
			'a_PositionTexcoord': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
		};
		var uniformMap: any = {
			"u_MainTex": ShaderDataType.Texture2D,
			"u_depthTex": ShaderDataType.Texture2D,
			"u_blurDir": ShaderDataType.Vector2,
			"u_sssWidth": ShaderDataType.Float,
			"u_distanceToProjectionWindow": ShaderDataType.Float,
		};
		var shader: Shader3D = Shader3D.add("SeparableSSS", true, true);
		var subShader: SubShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		var shaderpass = subShader.addShaderPass(SeprableSSSVS, SeprableSSSFS);
		var renderState = shaderpass.renderState;
		renderState = shaderpass.renderState;
		renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		renderState.depthWrite = false;
		renderState.cull = RenderState.CULL_NONE;
		renderState.blend = RenderState.BLEND_DISABLE;
	}

	private _fallOff: Vector3;
	private _strength: Vector3;
	private _nSampler: number;

	constructor() {
		super();
		this.setShaderName("SeparableSSS");
		this._fallOff = new Vector3(1.0, 0.37, 0.3);
		this._strength = new Vector3(0.48, 0.41, 0.28);
		this._nSampler = 17;
		this.sssWidth = 0.0012;
		this.kenel = this.calculateKernel(this._nSampler, this._strength, this._fallOff);
	}

	/**
	 * 设置diffuse光照图片
	 */
	set colorTex(value: BaseTexture) {
		this.shaderData.setTexture(SeparableSSS_BlitMaterial.SHADERVALUE_COLORTEX, value);

	}

	//模糊采样方向  一般是horizontal一次 vertical一次
	set blurDir(value: Vector2) {
		this.shaderData.setVector2(SeparableSSS_BlitMaterial.SHADERVALUE_BLURDIR, value);
	}

	//深度贴图
	set depthTex(value: BaseTexture) {
		this.shaderData.setTexture(SeparableSSS_BlitMaterial.SHADERVALUE_DEPTHTEX, value);
	}
	//采样宽度,限制再0-0.025
	set sssWidth(value: number) {
		value = Math.max(value, 0);
		value = Math.min(value, 0.025);
		this.shaderData.setNumber(SeparableSSS_BlitMaterial.SHADERVALUE_SSSWIDTH, value);
	}

	//设置核算法变量
	set kenel(value: Vector4[]) {
		let shaderval: Float32Array = new Float32Array(value.length * 4);
		for (let i = 0, n = value.length; i < n; i++) {
			let ind = i * 4;
			shaderval[ind] = value[i].x;
			shaderval[ind + 1] = value[i].y;
			shaderval[ind + 2] = value[i].z;
			shaderval[ind + 3] = value[i].w;
		}
		this.shaderData.setBuffer(SeparableSSS_BlitMaterial.SHADERVALUE_KENEL, shaderval);
	}

	//衰减
	set falloff(value: Vector3) {
		//@ts-ignore
		Vector3.max(value, Vector3.ZERO, value);
		//@ts-ignore
		Vector3.min(value, Vector3.ONE, value);
		this._fallOff = value;
		this.kenel = this.calculateKernel(this._nSampler, this._fallOff, this._strength);
	}

	//强度
	set strength(value: Vector3) {
		//@ts-ignore
		Vector3.max(value, Vector3.ZERO, value);
		//@ts-ignore
		Vector3.min(value, Vector3.ONE, value);
		this._strength = value;
		this.kenel = this.calculateKernel(this._nSampler, this._fallOff, this._strength);
	}

	//采样数
	set nSamples(value: number) {
		this._nSampler = value;
		this.kenel = this.calculateKernel(this._nSampler, this._fallOff, this._strength);
	}

	//camera的view角度
	set cameraFiledOfView(value: number) {
		let distanceToProject = 1.0 / Math.tan(0.5 * value * MathUtils3D.Deg2Rad);
		this._shaderValues.setNumber(SeparableSSS_BlitMaterial.SHADERVALUE_DISTANCETOPROJECTIONWINDOW, distanceToProject);
	}

	/**
	 * @internal  计算高度模拟近似的核算法函数
	 * @param nSamples 
	 * @param strength 
	 * @param falloff 
	 */
	private calculateKernel(nSamples: number, strength: Vector3, falloff: Vector3): Array<Vector4> {
		let range = nSamples > 20 ? 3.0 : 2.0;
		let exponent = 2.0;//指数
		let Kernel: Array<Vector4> = new Array<Vector4>(nSamples);
		//caculate offset计算偏移
		let step = 2.0 * range / (nSamples - 1);
		for (let i = 0; i < nSamples; i++) {
			let o = -range + i * step;
			let sign = o < 0.0 ? -1.0 : 1.0;
			Kernel[i] = new Vector4();
			Kernel[i].w = range * sign * Math.abs(Math.pow(o, exponent)) / Math.pow(range, exponent);
		}

		//caculate weights计算权重
		for (let i = 0; i < nSamples; i++) {
			let w0 = i > 0 ? Math.abs(Kernel[i].w - Kernel[i - 1].w) : 0.0;
			let w1 = i < nSamples - 1 ? Math.abs(Kernel[i].w - Kernel[i + 1].w) : 0.0;
			let area = (w0 + w1) / 2.0;
			let t: Vector3 = this.prefile(Kernel[i].w, falloff);
			Vector3.scale(t, area, t);
			Kernel[i].x = t.x;
			Kernel[i].y = t.y;
			Kernel[i].z = t.z;
		}

		let t = Kernel[Math.floor(nSamples / 2)];
		for (var i = Math.floor(nSamples / 2); i > 0; i--) {
			Kernel[i] = Kernel[i - 1];
		}
		Kernel[0] = t;

		let sum = new Vector3(0.0, 0.0, 0.0);
		//Calculate the sum of the weights, we will need to normalize them below:
		for (let i = 0; i < nSamples; i++) {
			//Vector3.add(sum,nSamples[i],sum);
			sum.x += Kernel[i].x;
			sum.y += Kernel[i].y;
			sum.z += Kernel[i].z;
		}

		//Normalize the weights
		for (let i = 0; i < nSamples; i++) {
			Kernel[i].x /= sum.x;
			Kernel[i].y /= sum.y;
			Kernel[i].z /= sum.z;
		}

		// Tweak them using the desired strength. The first one is:
		//     lerp(1.0, kernel[0].rgb, strength)
		Kernel[0].x = (1.0 - strength.x) + strength.x * Kernel[0].x;
		Kernel[0].y = (1.0 - strength.y) + strength.y * Kernel[0].y;
		Kernel[0].z = (1.0 - strength.z) + strength.z * Kernel[0].z;

		for (let i = 1; i < nSamples; i++) {
			Kernel[i].x *= strength.x;
			Kernel[i].y *= strength.y;
			Kernel[i].z *= strength.z;
		}

		return Kernel;
	}

	/**
	 * @internal
	 * @param r 
	 * @param falloff 
	 */
	prefile(r: number, falloff: Vector3): Vector3 {
		//我们将[2007]中定义的原始皮肤轮廓的红色通道用于所有三个通道。我们注意到它可以用于绿色和蓝色通道（使用衰减参数缩放），而不会引入明显的差异，并允许对轮廓进行完全控制。
		//0.100 * gaussian(0.0484, r) +
		//0.118 * gaussian( 0.187, r) +
		//0.113 * gaussian( 0.567, r) +
		//0.358 * gaussian(  1.99, r) +
		//0.078 * gaussian(  7.41, r);
		//把Vector3变为Array
		let falloffArray: Array<number> = [falloff.x, falloff.y, falloff.z];

		let v1 = this.gaussian(0.0484, r, falloffArray);
		Vector3.scale(v1, 0.100, v1);

		let v2 = this.gaussian(0.187, r, falloffArray);
		Vector3.scale(v2, 0.118, v2);

		let v3 = this.gaussian(0.567, r, falloffArray);
		Vector3.scale(v3, 0.113, v3);

		let v4 = this.gaussian(1.99, r, falloffArray);
		Vector3.scale(v4, 0.358, v4);

		let v5 = this.gaussian(7.41, r, falloffArray);
		Vector3.scale(v5, 0.078, v5);

		let vec3 = new Vector3(v1.x + v2.x + v3.x + v4.x + v5.x,
			v1.y + v2.y + v3.y + v4.y + v5.y,
			v1.z + v2.z + v3.z + v4.z + v5.z);
		return vec3;
	}

	/**
	 * 高斯函数
	 * @param variance 
	 * @param r 
	 * @param falloff 
	 */
	gaussian(variance: number, r: number, falloff: Array<number>): Vector3 {
		//我们使用衰减来调整轮廓的形状。较大的衰减使形状更宽，而较小的衰减使形状更箭头。

		let g = new Vector3();
		let gg = new Array<number>();
		for (let i = 0; i < 3; i++) {
			let rr = r / (falloff[i] + 0.001);
			gg[i] = Math.exp((-(rr * rr)) / (2.0 * variance)) / (2.0 * 3.14 * variance);
		}
		g.setValue(gg[0], gg[1], gg[2]);
		return g;
	}
}