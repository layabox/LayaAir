import { Loader } from "../../../net/Loader";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { Handler } from "../../../utils/Handler";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { DefineDatas } from "../../shader/DefineDatas";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderData } from "../../shader/ShaderData";
import { IClone } from "../IClone";
import { ClassUtils } from "../../../utils/ClassUtils";
import { Laya } from "../../../../Laya";
import { ShaderDefine } from "../../shader/ShaderDefine";
import { ShaderValue } from "../../../webgl/shader/ShaderValue";

/**
 * <code>Material</code> 类用于创建材质。
 */
export class Material extends Resource implements IClone {
	/**Material资源。*/
	static MATERIAL: string = "MATERIAL";

	/** 渲染队列_不透明。*/
	static RENDERQUEUE_OPAQUE: number = 2000;
	/** 渲染队列_阿尔法裁剪。*/
	static RENDERQUEUE_ALPHATEST: number = 2450;
	/** 渲染队列_透明。*/
	static RENDERQUEUE_TRANSPARENT: number = 3000;

	/**着色器变量,透明测试值。*/
	static ALPHATESTVALUE: number = Shader3D.propertyNameToID("u_AlphaTestValue");
	/**@internal */
	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	/**@internal */
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	/**@internal */
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	/**@internal */
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	/**@internal */
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	/**@internal */
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");
	/**材质级着色器宏定义,透明测试。*/
	static SHADERDEFINE_ALPHATEST: ShaderDefine;

	/**
	 * 加载材质。
	 * @param url 材质地址。
	 * @param complete 完成回掉。
	 */
	static load(url: string, complete: Handler): void {
		Laya.loader.create(url, complete, null, Material.MATERIAL);
	}

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		Material.SHADERDEFINE_ALPHATEST = Shader3D.getDefineByName("ALPHATEST");
	}

	/**
	 * @inheritDoc
	 */
	static _parse(data: any, propertyParams: any = null, constructParams: any[] = null): Material {
		var jsonData: any = data;
		var props: any = jsonData.props;

		var material;
		var classType: string = props.type;
		//var clasPaths: any[] = classType.split('.');
		//var clas: new () => any = Browser.window;
		//clasPaths.forEach(function (cls: any): void {
		//	clas = clas[cls];
		//});
		var clas: any = ClassUtils.getRegClass(classType);
		if (clas)
			material = new clas();
		else{
			material = new Material();
			material.setShaderName(classType);
		}


		switch (jsonData.version) {
			case "LAYAMATERIAL:01":
			case "LAYAMATERIAL:02":
				var i: number, n: number;
				for (var key in props) {
					switch (key) {
						case "type":
							break;
						case "vectors":
							var vectors = props[key];
							for (i = 0, n = vectors.length; i < n; i++) {
								var vector= vectors[i];
								var vectorValue = vector.value;
								switch (vectorValue.length) {
									case 2:
										material[vector.name] = new Vector2(vectorValue[0], vectorValue[1]);
										break;
									case 3:
										material[vector.name] = new Vector3(vectorValue[0], vectorValue[1], vectorValue[2]);
										break;
									case 4:
										material[vector.name] = new Vector4(vectorValue[0], vectorValue[1], vectorValue[2], vectorValue[3]);
										break;
									default:
										throw new Error("BaseMaterial:unkonwn color length.");
								}
							}
							break;
						case "textures":
							var textures: any[] = props[key];
							for (i = 0, n = textures.length; i < n; i++) {
								var texture: any = textures[i];
								var path: string = texture.path;
								(path) && (material[texture.name] = Loader.getRes(path));
							}
							break;
						case "defines":
							var defineNames: any[] = props[key];
							for (i = 0, n = defineNames.length; i < n; i++) {
								var define: ShaderDefine = Shader3D.getDefineByName(defineNames[i]);//TODO:是否取消defines
								material._shaderValues.addDefine(define);
							}
							break;
						case "renderStates"://"LAYAMATERIAL:02" 
							var renderStatesData: any[] = props[key];
							var renderStateData: any = renderStatesData[0];
							var mat: any = (<any>material);//TODO:临时兼容
							mat.blend = renderStateData.blend;
							mat.cull = renderStateData.cull;
							mat.depthTest = renderStateData.depthTest;
							mat.depthWrite = renderStateData.depthWrite;
							mat.blendSrc = renderStateData.srcBlend;
							mat.blendDst = renderStateData.dstBlend;
							break;
						case "cull"://"LAYAMATERIAL:01"
							((<any>material)).cull = props[key];
							break;
						case "blend"://"LAYAMATERIAL:01"
							((<any>material)).blend = props[key];
							break;
						case "depthWrite"://"LAYAMATERIAL:01" 
							((<any>material)).depthWrite = props[key];
							break;
						case "srcBlend"://"LAYAMATERIAL:01" 
							((<any>material)).blendSrc = props[key];
							break;
						case "dstBlend"://"LAYAMATERIAL:01" 
							((<any>material)).blendDst = props[key];
							break;
						default:
							material[key] = props[key];
					}
				}
				break;
			case "LAYAMATERIAL:03":
				var i: number, n: number;
				for (var key in props) {
					switch (key) {
						case "type":
						case "name":
							break;
						case "defines":
							var defineNames: any[] = props[key];
							for (i = 0, n = defineNames.length; i < n; i++) {
								var define: ShaderDefine = Shader3D.getDefineByName(defineNames[i]);//TODO:是否取消defines
								material._shaderValues.addDefine(define);
							}	
							break;
						case "textures":
							var textures: any[] = props[key];
							for (i = 0, n = textures.length; i < n; i++) {
								var texture: any = textures[i];
								var path: string = texture.path;
								(path) && (material._shaderValues.setTexture(Shader3D.propertyNameToID(texture.name),Loader.getRes(path)));
							}
							break;
						default:
							var property = props[key];
							var uniName = Shader3D.propertyNameToID(key);
							if(!property.length){
								material._shaderValues.setNumber(uniName,props[key]);
							}else{
								var vectorValue = property;
								switch (vectorValue.length) {
									case 2:
										 material._shaderValues.setVector2(uniName,new Vector2(vectorValue[0], vectorValue[1]));
										break;
									case 3:
										material._shaderValues.setVector3(uniName,new Vector3(vectorValue[0], vectorValue[1], vectorValue[2]));
										break;
									case 4:
										material._shaderValues.setVector(uniName,new Vector4(vectorValue[0], vectorValue[1], vectorValue[2], vectorValue[3]));
										break;
									default:
										throw new Error("BaseMaterial:unkonwn color length.");
								}
							}
						}
				}
				break;
			default:
				throw new Error("BaseMaterial:unkonwn version.");
		}
		return material;
	}


	/** @internal */
	_shader: Shader3D;
	/** @private */
	_shaderValues: ShaderData|null;//TODO:剥离贴图ShaderValue

	/** 所属渲染队列. */
	renderQueue: number;

	/**
	 * 着色器数据。
	 */
	get shaderData(): ShaderData {
		return this._shaderValues;
	}

	/**
	 * 透明测试模式裁剪值。
	 */
	get alphaTestValue(): number {
		return this._shaderValues.getNumber(Material.ALPHATESTVALUE);
	}

	set alphaTestValue(value: number) {
		this._shaderValues.setNumber(Material.ALPHATESTVALUE, value);
	}

	/**
	 * 是否透明裁剪。
	 */
	get alphaTest(): boolean {
		return this.shaderData.hasDefine(Material.SHADERDEFINE_ALPHATEST);
	}

	set alphaTest(value: boolean) {
		if (value)
			this._shaderValues.addDefine(Material.SHADERDEFINE_ALPHATEST);
		else
			this._shaderValues.removeDefine(Material.SHADERDEFINE_ALPHATEST);
	}

	  /**
	 * 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(Material.DEPTH_WRITE);
	}

	set depthWrite(value: boolean) {
		this._shaderValues.setBool(Material.DEPTH_WRITE, value);
    }
    
    
	/**
	 * 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(Material.CULL);
	}

	set cull(value: number) {
		this._shaderValues.setInt(Material.CULL, value);
	}

    /**
	 * 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(Material.BLEND);
	}

	set blend(value: number) {
		this._shaderValues.setInt(Material.BLEND, value);
	}


	/**
	 * 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(Material.BLEND_SRC);
	}

	set blendSrc(value: number) {
		this._shaderValues.setInt(Material.BLEND_SRC, value);
	}



	/**
	 * 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(Material.BLEND_DST);
	}

	set blendDst(value: number) {
		this._shaderValues.setInt(Material.BLEND_DST, value);
    }
    
    /**
	 * 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(Material.DEPTH_TEST);
	}

	set depthTest(value: number) {
		this._shaderValues.setInt(Material.DEPTH_TEST, value);
	}

	/**
	 * 获得材质属性
	 */
	get MaterialProperty():any{
		let propertyMap:any = {};
		var shaderValues = this._shaderValues.getData();
		for(let key in shaderValues){
			propertyMap[Shader3D._propertyNameMap[parseInt(key)]] = shaderValues[key];
		}
		return propertyMap;
	}

	/**
	 * 获得材质宏
	 */
	get MaterialDefine():Array<string>{
		let shaderDefineArray = new Array<string>();
		let defineData = this._shaderValues._defineDatas;
		Shader3D._getNamesByDefineData(defineData,shaderDefineArray);
		return shaderDefineArray;
	}

	/**
	 * 创建一个 <code>BaseMaterial</code> 实例。
	 */
	constructor() {
		super();
		this._shaderValues = new ShaderData(this);
		this.renderQueue = Material.RENDERQUEUE_OPAQUE;
		this.alphaTest = false;
	}

	/**
	 * @internal
	 */
	private _removeTetxureReference(): void {
		var data: any = this._shaderValues.getData();
		for (var k in data) {
			var value: any = data[k];
			if (value && value instanceof BaseTexture)//TODO:需要优化,杜绝is判断，慢
				(<BaseTexture>value)._removeReference();
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _disposeResource(): void {
		if (this._referenceCount > 0)
			this._removeTetxureReference();
		this._shaderValues = null;
	}

	/**
	 * @implements IReferenceCounter
	 * @internal
	 * @override
	 */
	_addReference(count: number = 1): void {
		super._addReference(count);
		var data: any = this._shaderValues.getData();
		for (var k in data) {
			var value: any = data[k];
			if (value && value instanceof BaseTexture)//TODO:需要优化,杜绝is判断，慢
				(<BaseTexture>value)._addReference();
		}
	}

	/**
	 * @implements IReferenceCounter
	 * @internal
	 * @override
	 */
	_removeReference(count: number = 1): void {
		super._removeReference(count);
		this._removeTetxureReference();
	}




	/**
	 * 设置使用Shader名字。
	 * @param name 名称。
	 */
	setShaderName(name: string): void {
		this._shader = Shader3D.find(name);
		if (!this._shader)
			throw new Error("BaseMaterial: unknown shader name.");
	}

	/**
	 * 设置属性值
	 * @param name 
	 * @param value 
	 */
	setShaderPropertyValue(name:string,value:any){
		this.shaderData.setValueData(Shader3D.propertyNameToID(name),value);
	}
	/**
	 * 获取属性值
	 * @param name 
	 */
	getShaderPropertyValue(name:string):any{
		return this.shaderData.getValueData(Shader3D.propertyNameToID(name));
	}


	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destBaseMaterial: Material = (<Material>destObject);
		destBaseMaterial.name = this.name;
		destBaseMaterial.renderQueue = this.renderQueue;
		this._shaderValues.cloneTo(destBaseMaterial._shaderValues);
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: Material = new Material();
		this.cloneTo(dest);
		return dest;
	}

	//--------------------------------------------兼容-------------------------------------------------
	get _defineDatas(): DefineDatas {
		return this._shaderValues._defineDatas;
	}

	
}


