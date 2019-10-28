import { Laya } from "../../../../Laya";
import { Handler } from "../../../utils/Handler";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefine } from "../../shader/ShaderDefine";
import { Material } from "./Material";
import { DefineDatas } from "../../shader/DefineDatas";
import { ShaderData } from "../../shader/ShaderData";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { IClone } from "../IClone";


/**
 * BaseMaterial has deprecated,please use Material instead.
 * @deprecated
 */
export class BaseMaterial extends Resource implements IClone {
	/** @deprecated use Material.MATERIAL instead*/
	static MATERIAL: string = "MATERIAL";
	/** @deprecated use Material.RENDERQUEUE_OPAQUE instead*/
	static RENDERQUEUE_OPAQUE: number = 2000;
	/** @deprecated use Material.RENDERQUEUE_ALPHATEST instead*/
	static RENDERQUEUE_ALPHATEST: number = 2450;
	/** @deprecated use Material.RENDERQUEUE_TRANSPARENT instead*/
	static RENDERQUEUE_TRANSPARENT: number = 3000;
	/** @deprecated use Material.ALPHATESTVALUE instead*/
	static ALPHATESTVALUE: number = Shader3D.propertyNameToID("u_AlphaTestValue");
	/** @deprecated use Material.SHADERDEFINE_ALPHATEST instead*/
	static SHADERDEFINE_ALPHATEST: ShaderDefine = null;

	/**
	 * @deprecated 
	 * BaseMaterial has deprecated,please use Material instead.
	 */
	static load(url: string, complete: Handler): void {
		Laya.loader.create(url, complete, null, Material.MATERIAL);
	}

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		BaseMaterial.SHADERDEFINE_ALPHATEST = Material.SHADERDEFINE_ALPHATEST;
	}

	/** @internal */
	private _alphaTest: boolean;

	/** @internal */
	_disablePublicDefineDatas: DefineDatas;//TODO:移除
	/** @internal */
	_shader: Shader3D;
	/** @internal */
	_shaderValues: ShaderData = null;//TODO:剥离贴图ShaderValue

	/** @deprecated BaseMaterial has deprecated,please use Material instead.*/
	renderQueue: number;

	/** @deprecated BaseMaterial has deprecated,please use Material instead.*/
	get alphaTestValue(): number {
		return this._shaderValues.getNumber(Material.ALPHATESTVALUE);
	}

	set alphaTestValue(value: number) {
		this._shaderValues.setNumber(Material.ALPHATESTVALUE, value);
	}

	/** @deprecated BaseMaterial has deprecated,please use Material instead.*/
	get alphaTest(): boolean {
		return this._alphaTest;
	}

	set alphaTest(value: boolean) {
		this._alphaTest = value;
		if (value)
			this._shaderValues.addDefine(Material.SHADERDEFINE_ALPHATEST);
		else
			this._shaderValues.removeDefine(Material.SHADERDEFINE_ALPHATEST);
	}

	/**
	 * BaseMaterial has deprecated,please use Material instead.
	 * @deprecated
	 */
	constructor() {
		super();
		this._disablePublicDefineDatas = new DefineDatas();
		this._shaderValues = new ShaderData(this);
		this.renderQueue = Material.RENDERQUEUE_OPAQUE;
		this._alphaTest = false;
	}

	/**
	 * @internal
	 */
	private _removeTetxureReference(): void {
		var data: any = this._shaderValues.getData();
		for (var k in data) {
			var value: any = data[k];
			if (value && value instanceof BaseTexture)//TODO:需要优化,杜绝is判断，慢
				((<BaseTexture>value))._removeReference();
		}
	}

	/**
	 * @internal
	 */
	_addReference(count: number = 1): void {
		super._addReference(count);
		var data: any = this._shaderValues.getData();
		for (var k in data) {
			var value: any = data[k];
			if (value && value instanceof BaseTexture)//TODO:需要优化,杜绝is判断，慢
				((<BaseTexture>value))._addReference();
		}
	}

	/**
	 * @internal
	 */
	_removeReference(count: number = 1): void {
		super._removeReference(count);
		this._removeTetxureReference();
	}

	/**
	 * @internal
	 */
	protected _disposeResource(): void {
		if (this._referenceCount > 0)
			this._removeTetxureReference();
		this._shaderValues = null;
	}

	/**
	 * @deprecated
	 * BaseMaterial has deprecated,please use Material instead.
	 */
	setShaderName(name: string): void {
		this._shader = Shader3D.find(name);
		if (!this._shader)
			throw new Error("BaseMaterial: unknown shader name.");
	}

	/**
	 * @deprecated
	 * BaseMaterial has deprecated,please use Material instead.
	 */
	cloneTo(destObject: any): void {
		var destBaseMaterial: Material = (<Material>destObject);
		destBaseMaterial.name = this.name;
		destBaseMaterial.renderQueue = this.renderQueue;
		this._disablePublicDefineDatas.cloneTo(destBaseMaterial._disablePublicDefineDatas);
		this._shaderValues.cloneTo(destBaseMaterial._shaderValues);
	}

	/**
	 * @deprecated
	 * BaseMaterial has deprecated,please use Material instead.
	 */
	clone(): any {
		var dest: Material = new Material();
		this.cloneTo(dest);
		return dest;
	}

	//--------------------------------------------兼容-------------------------------------------------
	/**
	 * @deprecated
	 * BaseMaterial has deprecated,please use Material instead.
	 */
	get _defineDatas(): DefineDatas {
		return this._shaderValues._defineDatas;
	}
}




