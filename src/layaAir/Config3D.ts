import { IClone } from "./laya/d3/core/IClone"
import { Vector3 } from "./laya/d3/math/Vector3"

/**
 * <code>Config3D</code> 类用于创建3D初始化配置。
 */
export class Config3D implements IClone {
	/**@internal*/
	static _default: Config3D = new Config3D();

	/**@internal*/
	private _defaultPhysicsMemory: number = 16;
	/**@internal*/
	private _maxLightCount: number = 32;
	/**@internal*/
	private _lightClusterCount: Vector3 = new Vector3(12, 12, 12);
	/**@internal*/
	private _maxLightCountPerCluster: number = 32;
	/**@internal*/
	_editerEnvironment: boolean = false;

	/** 是否开启抗锯齿。*/
	isAntialias: boolean = true;
	/** 设置画布是否透明。*/
	isAlpha: boolean = false;
	/** 设置画布是否预乘。*/
	premultipliedAlpha: boolean = true;
	/** 设置画布的是否开启模板缓冲。*/
	isStencil: boolean = true;

	/** 是否开启八叉树裁剪。*/
	octreeCulling: boolean = false;
	/** 八叉树初始化尺寸。*/
	octreeInitialSize: number = 64.0;
	/** 八叉树初始化中心。*/
	octreeInitialCenter: Vector3 = new Vector3(0, 0, 0);
	/** 八叉树最小尺寸。*/
	octreeMinNodeSize: number = 2.0;
	/** 八叉树松散值。*/
	octreeLooseness: number = 1.25;

	/** 
	 * 是否开启视锥裁剪调试。
	 * 如果开启八叉树裁剪,使用红色绘制高层次八叉树节点包围盒,使用蓝色绘制低层次八叉节点包围盒,精灵包围盒和八叉树节点包围盒颜色一致,但Alpha为非透明。如果视锥完全包含八叉树节点,八叉树节点包围盒和精灵包围盒变为蓝色,同样精灵包围盒的Alpha为非透明。
	 * 如果不开启八叉树裁剪,使用绿色像素线绘制精灵包围盒。
	 */
	debugFrustumCulling: boolean = false;

	/**
	 * 默认物理功能初始化内存，单位为M。
	 */
	get defaultPhysicsMemory(): number {
		return this._defaultPhysicsMemory;
	}

	set defaultPhysicsMemory(value: number) {
		if (value < 16)//必须大于16M
			throw "defaultPhysicsMemory must large than 16M";
		this._defaultPhysicsMemory = value;
	}

	/**
	 * 最大光源数量。
	 */
	get maxLightCount(): number {
		return this._maxLightCount;
	}

	set maxLightCount(value: number) {
		if (value > 2048) {
			this._maxLightCount = 2048;
			console.warn("Config3D: maxLightCount must less equal 2048.");
		}
		else {
			this._maxLightCount = value;
		}
	}

	/**
	 * X、Y、Z轴的光照集群数量。
	 */
	get lightClusterCount(): Vector3 {
		return this._lightClusterCount;
	}

	set lightClusterCount(value: Vector3) {
		if (!this._checkMaxLightCountPerCluster(this._maxLightCountPerCluster, value.z)) {
			this._lightClusterCount.setValue(value.x, value.y, 2048 / (Math.ceil(this._maxLightCountPerCluster / 4) + 1));
			console.warn("Config3D: lightClusterCount component must less equal 128.");
		}
		else {
			value.cloneTo(this._lightClusterCount);
		}
	}

	/**
	 * 每个集群的最大光源数量。
	 */
	get maxLightCountPerCluster(): number {
		return this._maxLightCountPerCluster;
	}

	set maxLightCountPerCluster(value: number) {
		if (!this._checkMaxLightCountPerCluster(value, this._lightClusterCount.z)) {
			this._maxLightCountPerCluster = Math.floor(2048 / this._lightClusterCount.z - 1) * 4;
			console.warn("Config3D: (Math.ceil(maxLightCountPerCluster/4)+1)*lightClusterCount.z must less than 2048.");
		}
		else {
			this._maxLightCountPerCluster = value;
		}
	}

	/**
	 * 创建一个 <code>Config3D</code> 实例。
	 */
	constructor() {
	}

	/**
	 * @internal
	 */
	private _checkMaxLightCountPerCluster(maxLightCountPerCluster: number, clusterCountZ: number): boolean {
		return Math.ceil((maxLightCountPerCluster / 4) + 1) * clusterCountZ < 2048;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(dest: any): void {//[实现IClone接口]
		var destConfig3D: Config3D = (<Config3D>dest);
		destConfig3D._defaultPhysicsMemory = this._defaultPhysicsMemory;
		destConfig3D._editerEnvironment = this._editerEnvironment;
		destConfig3D.isAntialias = this.isAntialias;
		destConfig3D.isAlpha = this.isAlpha;
		destConfig3D.premultipliedAlpha = this.premultipliedAlpha;
		destConfig3D.isStencil = this.isStencil;
		destConfig3D.octreeCulling = this.octreeCulling;
		this.octreeInitialCenter.cloneTo(destConfig3D.octreeInitialCenter);
		destConfig3D.octreeInitialSize = this.octreeInitialSize;
		destConfig3D.octreeMinNodeSize = this.octreeMinNodeSize;
		destConfig3D.octreeLooseness = this.octreeLooseness;
		destConfig3D.debugFrustumCulling = this.debugFrustumCulling;
		destConfig3D.maxLightCount = this.maxLightCount;
		destConfig3D.maxLightCountPerCluster = this.maxLightCountPerCluster;
		this.lightClusterCount.cloneTo(destConfig3D.lightClusterCount);
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {//[实现IClone接口]
		var dest: Config3D = new Config3D();
		this.cloneTo(dest);
		return dest;
	}

}
(window as any).Config3D = Config3D;

