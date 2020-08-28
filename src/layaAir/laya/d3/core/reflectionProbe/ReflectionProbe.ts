import { Component } from "../../../components/Component";
import { Vector4 } from "../../math/Vector4";
import { TextureCube } from "../../resource/TextureCube";
import { Bounds } from "../Bounds";

/**
 * 反射探针模式
 */
export enum ReflectionProbeMode {
        Baked = 0,//现在仅仅支持Back烘培
        Realtime = 1,
}
/**
 * <code>ReflectionProbe</code> 类用于实现反射探针组件
 * @miner
 */
export class ReflectionProbe extends Component {
	//暂不支持HDR。因为纹理数量问题 暂不支持探针混合
	/** 默认解码数据 */
	static defaultTextureHDRDecodeValues:Vector4 = new Vector4(1.0,1.0,0.0,0.0);
	/** 盒子反射是否开启 */
	private _boxProjection:boolean;
	/** 探针重要度 */
	private _importance:number;
	/** 反射探针图片 */
	private _reflectionTexture:TextureCube;
	/** 包围盒 */
	private _bounds:Bounds;
	/** 反射强度 */
	private _intensity:number;
	/** 队列索引 */
	private _indexInReflectProbList:number;

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
		//TODO:
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
		this._intensity = value;
	}

	/**
	 * 设置反射强度
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
		return this.bounds;
	}

	
	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_onAdded(): void {
		
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
		this._reflectionTexture._removeReference(1);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_onEnable(): void {
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDisable(): void {
	}
	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_parse(data: any): void {

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
	 * @internal
	 * @override
	 */
	_cloneTo(dest: Component): void {

	}

}


