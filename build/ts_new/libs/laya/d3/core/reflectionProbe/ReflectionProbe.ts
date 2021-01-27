import { Vector4 } from "../../math/Vector4";
import { TextureCube } from "../../resource/TextureCube";
import { Bounds } from "../Bounds";
import { Sprite3D } from "../Sprite3D";
import { Scene3D } from "../scene/Scene3D";
import { Vector3 } from "../../math/Vector3";
import { Loader } from "../../../net/Loader";
import { TextureDecodeFormat } from "../../../resource/TextureDecodeFormat";
import { Node } from "../../../display/Node";

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
export class ReflectionProbe extends Sprite3D {
	//因为纹理数量问题 暂不支持探针混合
	static TEMPVECTOR3:Vector3 = new Vector3();
	/** 默认解码数据 */
	static defaultTextureHDRDecodeValues:Vector4 = new Vector4(1.0,1.0,0.0,0.0);
	/** 盒子反射是否开启 */
	private _boxProjection:boolean = false;
	/** 探针重要度 */
	private _importance:number;
	/** 反射探针图片 */
	private _reflectionTexture:TextureCube;
	/** 包围盒大小 */
	private _size:Vector3 = new Vector3();
	/** 包围盒偏移 */
	private _offset:Vector3 = new Vector3();
	/** 包围盒 */
	private _bounds:Bounds;
	/** 反射强度 */
	private _intensity:number;
	/** 反射参数 */
	private _reflectionHDRParams:Vector4 = new Vector4();
	/** 反射探针解码格式 */
	private _reflectionDecodeFormat:TextureDecodeFormat = TextureDecodeFormat.Normal;
	/** 队列索引 */
	private _indexInReflectProbList:number;
	/** 是否是场景探针 */
	_isScene:boolean = false;

	constructor(){
		super();
	}

	/**
	 * 是否开启正交反射。
	 */
	get boxProjection(): boolean {
		return this._boxProjection;
	}
	
	set boxProjection(value: boolean) {
		this._boxProjection = value;
	}

	/**
	 * 设置反射探针的重要度
	 */
	get importance():number{
		return this._importance;
	}

	set importance(value:number){
		this._importance = value
	}

	/**
	 * 设置反射探针资源
	 */
	get intensity():number{
		return this._intensity;
	}

	set intensity(value:number){
		value = Math.max(Math.min(value, 1.0), 0.0);
		this._reflectionHDRParams.x = value;
		if (this._reflectionDecodeFormat == TextureDecodeFormat.RGBM)
			this._reflectionHDRParams.x *= 5.0;//5.0 is RGBM param
		this._intensity = value;
	}

	/**
	 * 设置反射贴图
	 */
	get reflectionTexture(){
		return this._reflectionTexture;
	}

	set reflectionTexture(value:TextureCube){
		this._reflectionTexture = value;
		this._reflectionTexture._addReference();
	}

	/**
	 * 获得反射探针的包围盒
	 */
	get bounds():Bounds{
		return this._bounds;
	}

	/**
	 * @internal
	 */
	set bounds(value:Bounds){
		this._bounds = value;
	}

	get boundsMax():Vector3{
		return this._bounds.getMax();
	}

	get boundsMin():Vector3{
		return this._bounds.getMin();
	}

	get probePosition():Vector3{
		return this.transform.position;
	}

	/**
	 * 反射参数
	 */
	get reflectionHDRParams():Vector4{
		return this._reflectionHDRParams;
	}

	/**
	 * @internal
	 */
	set reflectionHDRParams(value:Vector4){
		this._reflectionHDRParams = value;
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_parse(data: any,spriteMap: any): void {
		super._parse(data,spriteMap);
		this._boxProjection = data.boxProjection;
		this._importance = data.importance;
		
		this._reflectionTexture = Loader.getRes(data.reflection);
		var position:Vector3 = this.transform.position;
		this._size.fromArray(data.boxSize);
		Vector3.scale(this._size,0.5, ReflectionProbe.TEMPVECTOR3);
		this._offset.fromArray(data.boxOffset);
		var min:Vector3 = new Vector3();
		var max:Vector3 = new Vector3();
		Vector3.add(position,ReflectionProbe.TEMPVECTOR3,max);
		Vector3.add(max,this._offset,max);
		Vector3.subtract(position,ReflectionProbe.TEMPVECTOR3,min);
		Vector3.add(min,this._offset,min);
		this._reflectionDecodeFormat = data.reflectionDecodingFormat;
		this.intensity = data.intensity;
		if(!this._bounds) this.bounds = new Bounds(min,max);
		else {
			this._bounds.setMin(min);
			this._bounds.setMax(max);
		}
		
	}

	/**
	 * 设置队列索引
	 * @param value 
	 */
	_setIndexInReflectionList(value: number): void {
		this._indexInReflectProbList = value;
	}
	/**
	 * 获得队列索引
	 */
	_getIndexInReflectionList():number{
		return this._indexInReflectProbList;
	}
	

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onActive(): void {
		super._onActive();
		if(this._reflectionTexture)
		(this.scene as Scene3D)._reflectionProbeManager.add(this);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onInActive(): void {
		super._onInActive();
		if(this.reflectionTexture)
		(this.scene as Scene3D)._reflectionProbeManager.remove(this);
	}


	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(destroyChild: boolean = true): void {
		if (this.destroyed)
			return;
		super.destroy(destroyChild);
		this._reflectionTexture&&this._reflectionTexture._removeReference();
		this._reflectionTexture = null;
		this._bounds = null;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(destObject: any, srcRoot:Node, dstRoot: Node): void {
		var dest:ReflectionProbe = (<ReflectionProbe>destObject);
		dest.bounds = this.bounds;
		dest.boxProjection = this.boxProjection;
		dest.importance = this.importance;
		//图片不克隆，需要重新烘培
		dest._size = this._size;
		dest._offset = this._offset;
		dest.intensity = this.intensity;
		dest.reflectionHDRParams = this.reflectionHDRParams;
		super._cloneTo(destObject, srcRoot, dstRoot);//父类函数在最后,组件应该最后赋值，否则获取材质默认值等相关函数会有问题
	}

}


