import { IClone } from "./laya/d3/core/IClone"
import { Vector3 } from "./laya/d3/math/Vector3"
import { PBRRenderQuality } from "./laya/d3/core/material/PBRRenderQuality";
import { ILaya3D } from "./ILaya3D";
import { CannonPhysicsSettings } from "./laya/d3/physicsCannon/CannonPhysicsSettings";
import { Physics3D } from "./laya/d3/Physics3D";

/**
 * <code>Config3D</code> 类用于创建3D初始化配置。
 */
export class Config3D implements IClone {
	/**@internal*/
	static _config: Config3D = new Config3D();


	static get useCannonPhysics():boolean{
		return Config3D._config.isUseCannonPhysicsEngine;
	}
	static set useCannonPhysics(value:boolean){
		Config3D._config.isUseCannonPhysicsEngine = value;
		if(value) {
			Physics3D.__cannoninit__();
			if(!ILaya3D.Scene3D.cannonPhysicsSettings) ILaya3D.Scene3D.cannonPhysicsSettings = new CannonPhysicsSettings();
		}	
	}
	/**@internal*/
	private _defaultPhysicsMemory: number = 16;
	/**@internal*/
	private _maxLightCount: number = 32;
	/**@internal*/
	private _lightClusterCount: Vector3 = new Vector3(12, 12, 12);

	/**@internal*/
	_editerEnvironment: boolean = false;
	/**@internal*/
	_multiLighting: boolean;
	/**@internal*/
	_maxAreaLightCountPerClusterAverage: number;

	/** 是否开启抗锯齿。*/
	isAntialias: boolean = true;
	/** 画布是否包含透明通道。*/
	isAlpha: boolean = false;
	/** 画布是否预乘。*/
	premultipliedAlpha: boolean = true;
	/** 画布是否开启模板缓冲。*/
	isStencil: boolean = true;
	/** 是否开启多光源,如果场景不需要多光源，关闭后可提升性能。*/
	enableMultiLight: boolean = true;
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
	/** PBR材质渲染质量。*/
	pbrRenderQuality: PBRRenderQuality = PBRRenderQuality.High;
	/** 是否使用CANNONJS物理引擎*/
	isUseCannonPhysicsEngine:boolean = false;
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
	 * X、Y、Z轴的光照集群数量,Z值会影响Cluster接受区域光(点光、聚光)影响的数量,Math.floor(2048 / lightClusterCount.z - 1) * 4 为每个Cluster的最大平均接受区域光数量,如果每个Cluster所接受光源影响的平均数量大于该值，则较远的Cluster会忽略其中多余的光照影响。
	 */
	get lightClusterCount(): Vector3 {
		return this._lightClusterCount;
	}

	set lightClusterCount(value: Vector3) {
		if (value.x > 128 || value.y > 128 || value.z > 128) {
			this._lightClusterCount.setValue(Math.min(value.x, 128), Math.min(value.y, 128), Math.min(value.z, 128));
			console.warn("Config3D: lightClusterCount X and Y、Z must less equal 128.");
		}
		else {
			value.cloneTo(this._lightClusterCount);
		}

		var maxAreaLightCountWithZ = Math.floor(2048 / this._lightClusterCount.z - 1) * 4;
		if (maxAreaLightCountWithZ < this._maxLightCount)
			console.warn("Config3D: if the area light(PointLight、SpotLight) count is large than " + maxAreaLightCountWithZ + ",maybe the far away culster will ingonre some light.");
		this._maxAreaLightCountPerClusterAverage = Math.min(maxAreaLightCountWithZ, this._maxLightCount);
	}

	/**
	 * 创建一个 <code>Config3D</code> 实例。
	 */
	constructor() {
		this._maxAreaLightCountPerClusterAverage = Math.min(Math.floor(2048 / this._lightClusterCount.z - 1) * 4, this._maxLightCount);
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
		destConfig3D.enableMultiLight = this.enableMultiLight;
		var lightClusterCount: Vector3 = destConfig3D.lightClusterCount;
		this.lightClusterCount.cloneTo(lightClusterCount);
		destConfig3D.lightClusterCount = lightClusterCount;
		destConfig3D.pbrRenderQuality = this.pbrRenderQuality;
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

