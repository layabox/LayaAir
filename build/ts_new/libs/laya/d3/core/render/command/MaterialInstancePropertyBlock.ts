import { VertexDeclaration } from "../../../graphics/VertexDeclaration";
import { VertexElement } from "../../../graphics/VertexElement";
import { VertexElementFormat } from "../../../graphics/VertexElementFormat";
import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
import { Vector4 } from "../../../math/Vector4";
import { MaterialInstanceProperty } from "./MaterialInstanceProperty";

export enum InstanceLocation{
	CUSTOME0 = 12,
	CUSTOME1 = 13,
	CUSTOME2 = 14,
	CUSTOME3 = 15
}

/**
 * <code>Mesh</code> 类用于创建CustomInstance属性块。
 */
export class MaterialInstancePropertyBlock{
	
	/**Instance合并方案 */
	/**attribute instance渲染方案 优点：合并数量多,合并效率高，渲染性能优 缺点：instance变量元素少*/
	public static INSTANCETYPE_ATTRIBUTE:number = 0;
	/**uniform instance渲染方案 优点：instance变量多，灵活  缺点：合并数量受WebGLContext._maxUniformFragmentVectors的影响，合并效率低 */
	public static INSTANCETYPE_UNIFORMBUFFER:number = 1;


	/**@internal instance type*/
	protected _type:number = 0;


	/**@internal property map*/
	_propertyMap:{[key:number]:MaterialInstanceProperty} = {};

	constructor(){
	}


	/**
	 * @internal 检查传入的参数是否符合规则
	 * @param vertexElementFormat 顶点元素
	 * @param propertyName 属性名
	 * @param attributeLocation attribute位置
	 * @param prob 材质属性
	 */
	private _checkPropertyLegal(vertexElementFormat:VertexElementFormat,propertyName:string,attributeLocation:InstanceLocation,prob:MaterialInstanceProperty){
			var vecDec = prob._vertexDeclaration;
			//顶点描述是否保持一致
			if(vecDec._vertexElements[0]._elementFormat !== vertexElementFormat)
				throw "Data exists and format does not match";//数据存在且类型不匹配
			if(prob._name !== propertyName)
				throw "You cannot add a new property to an existing attributeLocation,Please use another attributeLocation";//属性名字不匹配	
	}

	/**
	 * 创建instance属性
	 * @param attributeName name
	 * @param arrays data
	 * @param vertexStride vertex size
	 * @param vertexformat vertexFormat
	 * @param attributeLocation  attribute location
	 */
	private _creatProperty(attributeName:string,arrays:Vector4[]|Vector3[]|Vector2[]|Float32Array,vertexStride:number,vertexformat:string,attributeLocation:InstanceLocation){
		var prob = this._propertyMap[attributeLocation] = new MaterialInstanceProperty();
		prob._name = attributeName;
		prob._value = arrays;
		prob._vertexDeclaration = new VertexDeclaration(vertexStride,[new VertexElement(0,vertexformat,attributeLocation)]);
		prob._isNeedUpdate = true;
		prob._vertexStride = vertexStride / 4;
		prob.createInstanceVertexBuffer3D();
	}
	
	/**
	 * 设置Vector4材质数组属性
	 * @param attributeName 属性名称（要对应到Shader中）
	 * @param arrays 数据
	 * @param attributeLocation  属性Shader位置（需要与shader中的声明Attribute一一对应）
	 */
	setVectorArray(attributeName:string,arrays:Vector4[]|Float32Array,attributeLocation:InstanceLocation):void{
		var prob = this._propertyMap[attributeLocation];
		if(prob){
			//判断匹配
			this._checkPropertyLegal(VertexElementFormat.Vector4,attributeName,attributeLocation,prob);
			prob._value = arrays;
			prob._isNeedUpdate = true;
		}else//创建自定义属性
			this._creatProperty(attributeName,arrays,16,VertexElementFormat.Vector4,attributeLocation);
	}

	/**
	 * 设置Vector3材质数组属性
	 * @param attributeName 属性名称（要对应到Shader中）
	 * @param arrays 数据
	 * @param attributeLocation 属性shader位置（需要与shader中的声明Attribute一一对应）
	 */
	setVector3Array(attributeName:string,arrays:Vector3[]|Float32Array,attributeLocation:InstanceLocation){
		var prob = this._propertyMap[attributeLocation];
		if(prob){
			//判断匹配
			this._checkPropertyLegal(VertexElementFormat.Vector3,attributeName,attributeLocation,prob);
			prob._value = arrays;
			prob._isNeedUpdate = true;
		}else//创建自定义属性
			this._creatProperty(attributeName,arrays,12,VertexElementFormat.Vector3,attributeLocation);
	}

	/**
	 * 设置Vector2材质数组属性
	 * @param attributeName 属性名称（要对应到Shader中）
	 * @param arrays 数据
	 * @param attributeLocation 属性shader位置（需要与shader中的声明Attribute一一对应）
	 */
	setVector2Array(attributeName:string,arrays:Vector2[]|Float32Array,attributeLocation:InstanceLocation){
		var prob = this._propertyMap[attributeLocation];
		if(prob){
			//判断匹配
			this._checkPropertyLegal(VertexElementFormat.Vector2,attributeName,attributeLocation,prob);
			prob._value = arrays;
			prob._isNeedUpdate = true;
		}else//创建自定义属性
			this._creatProperty(attributeName,arrays,8,VertexElementFormat.Vector2,attributeLocation);
	}

	/**
 	 * 设置Number材质数组属性
	 * @param attributeName 属性名称（要对应到Shader中）
	 * @param arrays 数据
	 * @param attributeLocation 属性shader位置（需要与shader中的声明Attribute一一对应）
	 */
	setNumberArray(attributeName:string,arrays:Float32Array,attributeLocation:InstanceLocation){
		var prob = this._propertyMap[attributeLocation];
		if(prob){
			//判断匹配
			this._checkPropertyLegal(VertexElementFormat.Single,attributeName,attributeLocation,prob);
			prob._value = arrays;
			prob._isNeedUpdate = true;
		}else//创建自定义属性
			this._creatProperty(attributeName,arrays,4,VertexElementFormat.Single,attributeLocation);
	}

	/**
	 * 获得属性数据
	 * @param attributeLocation  属性shader位置
	 */
	getPropertyArray(attributeLocation:InstanceLocation):Vector4[]|Vector3[]|Vector2[]|Float32Array{
		var prob = this._propertyMap[attributeLocation];
		return prob?prob._value:null;
	}

	clear(){
		this._propertyMap = {};
	}

}