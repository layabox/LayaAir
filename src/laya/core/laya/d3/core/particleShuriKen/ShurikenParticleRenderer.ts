import { ShuriKenParticle3D } from "././ShuriKenParticle3D";
import { ShurikenParticleSystem } from "././ShurikenParticleSystem";
import { Bounds } from "../Bounds"
	import { Transform3D } from "../Transform3D"
	import { BaseRender } from "../render/BaseRender"
	import { RenderContext3D } from "../render/RenderContext3D"
	import { FrustumCulling } from "../../graphics/FrustumCulling"
	import { BoundBox } from "../../math/BoundBox"
	import { BoundFrustum } from "../../math/BoundFrustum"
	import { ContainmentType } from "../../math/ContainmentType"
	import { Matrix4x4 } from "../../math/Matrix4x4"
	import { Vector3 } from "../../math/Vector3"
	import { Mesh } from "../../resource/models/Mesh"
	import { DefineDatas } from "../../shader/DefineDatas"
	import { ShaderData } from "../../shader/ShaderData"
	import { Physics3DUtils } from "../../utils/Physics3DUtils"
	import { Render } from "laya/renders/Render"
	
	
	/**
	 * <code>ShurikenParticleRender</code> 类用于创建3D粒子渲染器。
	 */
	export class ShurikenParticleRenderer extends BaseRender {
		/** @private */
		private _finalGravity:Vector3 = new Vector3();
		
		/** @private */
		private _tempRotationMatrix:Matrix4x4 = new Matrix4x4();
		
		/**@private */
		private _defaultBoundBox:BoundBox;
		
		///**排序模式,无。*/
		//public const SORTINGMODE_NONE:int = 0;
		///**排序模式,通过摄像机距离排序,暂不支持。*/
		//public const SORTINGMODE_BYDISTANCE:int = 1;
		///**排序模式,年长的在前绘制,暂不支持。*/
		//public const SORTINGMODE_OLDESTINFRONT:int = 2;
		///**排序模式,年轻的在前绘制,暂不支持*/
		//public const SORTINGMODE_YOUNGESTINFRONT:int = 3;
		
		/**@private */
		private _renderMode:number;
		/**@private */
		private _mesh:Mesh;
		
		/**拉伸广告牌模式摄像机速度缩放,暂不支持。*/
		 stretchedBillboardCameraSpeedScale:number;
		/**拉伸广告牌模式速度缩放。*/
		 stretchedBillboardSpeedScale:number;
		/**拉伸广告牌模式长度缩放。*/
		 stretchedBillboardLengthScale:number;
		
		///**排序模式。*/
		//public var sortingMode:int;
		
		/**
		 * 获取渲染模式。
		 * @return 渲染模式。
		 */
		 get renderMode():number {
			return this._renderMode;
		}
		
		/**
		 * 获取网格渲染模式所使用的Mesh,rendderMode为4时生效。
		 * @return 网格模式所使用Mesh。
		 */
		 get mesh():Mesh {
			return this._mesh
		}
		
		/**
		 * 设置网格渲染模式所使用的Mesh,rendderMode为4时生效。
		 * @param value 网格模式所使用Mesh。
		 */
		 set mesh(value:Mesh) {
			if (this._mesh !== value) {
				(this._mesh) && (this._mesh._removeReference());
				this._mesh = value;
				(value) && (value._addReference());
				((<ShuriKenParticle3D>this._owner )).particleSystem._initBufferDatas();
			}
		}
		
		/**
		 * 设置渲染模式,0为BILLBOARD、1为STRETCHEDBILLBOARD、2为HORIZONTALBILLBOARD、3为VERTICALBILLBOARD、4为MESH。
		 * @param value 渲染模式。
		 */
		 set renderMode(value:number) {
			if (this._renderMode !== value) {
				var defineDatas:ShaderData = this._shaderValues;
				switch (this._renderMode) {
				case 0: 
					defineDatas.removeDefine(ShuriKenParticle3D.SHADERDEFINE_RENDERMODE_BILLBOARD);
					break;
				case 1: 
					defineDatas.removeDefine(ShuriKenParticle3D.SHADERDEFINE_RENDERMODE_STRETCHEDBILLBOARD);
					break;
				case 2: 
					defineDatas.removeDefine(ShuriKenParticle3D.SHADERDEFINE_RENDERMODE_HORIZONTALBILLBOARD);
					break;
				case 3: 
					defineDatas.removeDefine(ShuriKenParticle3D.SHADERDEFINE_RENDERMODE_VERTICALBILLBOARD);
					break;
				case 4: 
					defineDatas.removeDefine(ShuriKenParticle3D.SHADERDEFINE_RENDERMODE_MESH);
					break;
				}
				this._renderMode = value;
				switch (value) {
				case 0: 
					defineDatas.addDefine(ShuriKenParticle3D.SHADERDEFINE_RENDERMODE_BILLBOARD);
					break;
				case 1: 
					defineDatas.addDefine(ShuriKenParticle3D.SHADERDEFINE_RENDERMODE_STRETCHEDBILLBOARD);
					break;
				case 2: 
					defineDatas.addDefine(ShuriKenParticle3D.SHADERDEFINE_RENDERMODE_HORIZONTALBILLBOARD);
					break;
				case 3: 
					defineDatas.addDefine(ShuriKenParticle3D.SHADERDEFINE_RENDERMODE_VERTICALBILLBOARD);
					break;
				case 4: 
					defineDatas.addDefine(ShuriKenParticle3D.SHADERDEFINE_RENDERMODE_MESH);
					break;
				default: 
					throw new Error("ShurikenParticleRender: unknown renderMode Value.");
				}
				((<ShuriKenParticle3D>this._owner )).particleSystem._initBufferDatas();
			}
		}
		
		/**
		 * 创建一个 <code>ShurikenParticleRender</code> 实例。
		 */
		constructor(owner:ShuriKenParticle3D){
			/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
			super(owner);
			this._defaultBoundBox = new BoundBox(new Vector3(), new Vector3());
			this._renderMode = -1;
			this.stretchedBillboardCameraSpeedScale = 0.0;
			this.stretchedBillboardSpeedScale = 0.0;
			this.stretchedBillboardLengthScale = 1.0;
			//sortingMode = SORTINGMODE_NONE;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/ protected _calculateBoundingBox():void {//TODO:日后需要计算包围盒的更新
			//var particleSystem:ShurikenParticleSystem = (_owner as ShuriKenParticle3D).particleSystem;
			//particleSystem._generateBoundingBox();
			//var rotation:Quaternion = _owner.transform.rotation;
			//var corners:Vector.<Vector3> = particleSystem._boundingBoxCorners;
			//for (var i:int = 0; i < 8; i++)
			//	Vector3.transformQuat(corners[i], rotation, _tempBoudingBoxCorners[i]);
			//BoundBox.createfromPoints(_tempBoudingBoxCorners, _boundingBox);
			
			var min:Vector3 = this._bounds.getMin();
			min.x = -Number.MAX_VALUE;
			min.y = -Number.MAX_VALUE;
			min.z = -Number.MAX_VALUE;
			this._bounds.setMin(min);
			var max:Vector3 = this._bounds.getMax();
			max.x = Number.MAX_VALUE;
			max.y = Number.MAX_VALUE;
			max.z = Number.MAX_VALUE;
			this._bounds.setMax(max);
			
			if (Render.supportWebGLPlusCulling) {//[NATIVE]
				var min:Vector3 =  this._bounds.getMin();
				var max:Vector3 =  this._bounds.getMax();
				var buffer:Float32Array = FrustumCulling._cullingBuffer;
				buffer[this._cullingBufferIndex + 1] = min.x;
				buffer[this._cullingBufferIndex + 2] = min.y;
				buffer[this._cullingBufferIndex + 3] = min.z;
				buffer[this._cullingBufferIndex + 4] = max.x;
				buffer[this._cullingBufferIndex + 5] = max.y;
				buffer[this._cullingBufferIndex + 6] = max.z;
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _needRender(boundFrustum:BoundFrustum):boolean {
			if (boundFrustum) {
				if (boundFrustum.containsBoundBox(this.bounds._getBoundBox()) !== ContainmentType.Disjoint) {
					if (((<ShuriKenParticle3D>this._owner )).particleSystem.isAlive)
						return true;
					else
						return false;
				} else {
					return false;
				}
			} else {
				return true;
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _renderUpdate(context:RenderContext3D, transfrom:Transform3D):void {
			var particleSystem:ShurikenParticleSystem = ((<ShuriKenParticle3D>this._owner )).particleSystem;
			var sv:ShaderData = this._shaderValues;
			var transform:Transform3D = this._owner.transform;
			switch (particleSystem.simulationSpace) {
			case 0: //World
				break;
			case 1: //Local
				sv.setVector3(ShuriKenParticle3D.WORLDPOSITION, transform.position);
				sv.setQuaternion(ShuriKenParticle3D.WORLDROTATION, transform.rotation);
				break;
			default: 
				throw new Error("ShurikenParticleMaterial: SimulationSpace value is invalid.");
			}
			
			switch (particleSystem.scaleMode) {
			case 0: 
				var scale:Vector3 = transform.scale;
				sv.setVector3(ShuriKenParticle3D.POSITIONSCALE, scale);
				sv.setVector3(ShuriKenParticle3D.SIZESCALE, scale);
				break;
			case 1: 
				var localScale:Vector3 = transform.localScale;
				sv.setVector3(ShuriKenParticle3D.POSITIONSCALE, localScale);
				sv.setVector3(ShuriKenParticle3D.SIZESCALE, localScale);
				break;
			case 2: 
				sv.setVector3(ShuriKenParticle3D.POSITIONSCALE, transform.scale);
				sv.setVector3(ShuriKenParticle3D.SIZESCALE, Vector3._ONE);
				break;
			}
			
			Vector3.scale(Physics3DUtils.gravity, particleSystem.gravityModifier, this._finalGravity);
			sv.setVector3(ShuriKenParticle3D.GRAVITY, this._finalGravity);
			sv.setInt(ShuriKenParticle3D.SIMULATIONSPACE, particleSystem.simulationSpace);
			sv.setBool(ShuriKenParticle3D.THREEDSTARTROTATION, particleSystem.threeDStartRotation);
			sv.setInt(ShuriKenParticle3D.SCALINGMODE, particleSystem.scaleMode);
			sv.setNumber(ShuriKenParticle3D.STRETCHEDBILLBOARDLENGTHSCALE, this.stretchedBillboardLengthScale);
			sv.setNumber(ShuriKenParticle3D.STRETCHEDBILLBOARDSPEEDSCALE, this.stretchedBillboardSpeedScale);
			sv.setNumber(ShuriKenParticle3D.CURRENTTIME, particleSystem._currentTime);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  get bounds():Bounds {
			//if (!(_owner as ShuriKenParticle3D).particleSystem.isAlive) {
			//return _defaultBoundBox;
			//} else {
			if (this._boundsChange) {
				this._calculateBoundingBox();
				this._boundsChange = false;
			}
			return this._bounds;
			//}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _destroy():void {
			super._destroy();
			(this._mesh) && (this._mesh._removeReference(), this._mesh = null);
		}
	
	}


