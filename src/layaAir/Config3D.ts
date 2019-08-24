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

	/** 最大光源数量。*/
	maxLightCount: number = 300;
	/** 每个集群的最大光源数量。*/
	maxLightCountPerCluster: number = 300;
	/** X、Y、Z轴的光照集群数量。*/
	lightClusterCount: Vector3 = new Vector3(16, 16, 12);

	/** 
	 * 是否开启视锥裁剪调试。
	 * 如果开启八叉树裁剪,使用红色绘制高层次八叉树节点包围盒,使用蓝色绘制低层次八叉节点包围盒,精灵包围盒和八叉树节点包围盒颜色一致,但Alpha为半透明。如果视锥完全包含八叉树节点,八叉树节点包围盒和精灵包围盒变为蓝色,同样精灵包围盒的Alpha为半透明。
	 * 如果不开启八叉树裁剪,使用绿色像素线绘制精灵包围盒。
	 */
	debugFrustumCulling: boolean = false;

	/**
	 * 获取默认物理功能初始化内存，单位为M。
	 * @return 默认物理功能初始化内存。
	 */
	get defaultPhysicsMemory(): number {
		return this._defaultPhysicsMemory;
	}

	/**
	 * 设置默认物理功能初始化内存，单位为M。
	 * @param value 默认物理功能初始化内存。
	 */
	set defaultPhysicsMemory(value: number) {
		if (value < 16)//必须大于16M
			throw "defaultPhysicsMemory must large than 16M";
		this._defaultPhysicsMemory = value;
	}

	/**
	 * 创建一个 <code>Config3D</code> 实例。
	 */
	constructor() {
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

