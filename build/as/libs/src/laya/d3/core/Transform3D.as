package laya.d3.core {
	import laya.events.EventDispatcher;
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Quaternion;
	import laya.d3.math.Vector3;
	import laya.d3.core.Sprite3D;

	/**
	 * <code>Transform3D</code> 类用于实现3D变换。
	 */
	public class Transform3D extends EventDispatcher {

		/**
		 * 所属精灵。
		 */
		public function get owner():Sprite3D{
				return null;
		}

		/**
		 * 世界矩阵是否需要更新。
		 */
		public function get worldNeedUpdate():Boolean{
				return null;
		}

		/**
		 * 局部位置X轴分量。
		 */
		public var localPositionX:Number;

		/**
		 * 局部位置Y轴分量。
		 */
		public var localPositionY:Number;

		/**
		 * 局部位置Z轴分量。
		 */
		public var localPositionZ:Number;

		/**
		 * 局部位置。
		 */
		public var localPosition:Vector3;

		/**
		 * 局部旋转四元数X分量。
		 */
		public var localRotationX:Number;

		/**
		 * 局部旋转四元数Y分量。
		 */
		public var localRotationY:Number;

		/**
		 * 局部旋转四元数Z分量。
		 */
		public var localRotationZ:Number;

		/**
		 * 局部旋转四元数W分量。
		 */
		public var localRotationW:Number;

		/**
		 * 局部旋转。
		 */
		public var localRotation:Quaternion;

		/**
		 * 局部缩放X。
		 */
		public var localScaleX:Number;

		/**
		 * 局部缩放Y。
		 */
		public var localScaleY:Number;

		/**
		 * 局部缩放Z。
		 */
		public var localScaleZ:Number;

		/**
		 * 局部缩放。
		 */
		public var localScale:Vector3;

		/**
		 * 局部空间的X轴欧拉角。
		 */
		public var localRotationEulerX:Number;

		/**
		 * 局部空间的Y轴欧拉角。
		 */
		public var localRotationEulerY:Number;

		/**
		 * 局部空间的Z轴欧拉角。
		 */
		public var localRotationEulerZ:Number;

		/**
		 * 局部空间欧拉角。
		 */
		public var localRotationEuler:Vector3;

		/**
		 * 局部矩阵。
		 */
		public var localMatrix:Matrix4x4;

		/**
		 * 世界位置。
		 */
		public var position:Vector3;

		/**
		 * 世界旋转。
		 */
		public var rotation:Quaternion;

		/**
		 * 世界空间的旋转角度，顺序为x、y、z。
		 */
		public var rotationEuler:Vector3;

		/**
		 * 世界矩阵。
		 */
		public var worldMatrix:Matrix4x4;

		/**
		 * 创建一个 <code>Transform3D</code> 实例。
		 * @param owner 所属精灵。
		 */

		public function Transform3D(owner:Sprite3D = undefined){}

		/**
		 * 平移变换。
		 * @param translation 移动距离。
		 * @param isLocal 是否局部空间。
		 */
		public function translate(translation:Vector3,isLocal:Boolean = null):void{}

		/**
		 * 旋转变换。
		 * @param rotations 旋转幅度。
		 * @param isLocal 是否局部空间。
		 * @param isRadian 是否弧度制。
		 */
		public function rotate(rotation:Vector3,isLocal:Boolean = null,isRadian:Boolean = null):void{}

		/**
		 * 获取向前方向。
		 * @param 前方向 。
		 */
		public function getForward(forward:Vector3):void{}

		/**
		 * 获取向上方向。
		 * @param 上方向 。
		 */
		public function getUp(up:Vector3):void{}

		/**
		 * 获取向右方向。
		 * @param 右方向 。
		 */
		public function getRight(right:Vector3):void{}

		/**
		 * 观察目标位置。
		 * @param target 观察目标。
		 * @param up 向上向量。
		 * @param isLocal 是否局部空间。
		 */
		public function lookAt(target:Vector3,up:Vector3,isLocal:Boolean = null):void{}

		/**
		 * 世界缩放。
		 * 某种条件下获取该值可能不正确（例如：父节点有缩放，子节点有旋转），缩放会倾斜，无法使用Vector3正确表示,必须使用Matrix3x3矩阵才能正确表示。
		 * @return 世界缩放。
		 */
		public function getWorldLossyScale():Vector3{
			return null;
		}

		/**
		 * 设置世界缩放。
		 * 某种条件下设置该值可能不正确（例如：父节点有缩放，子节点有旋转），缩放会倾斜，无法使用Vector3正确表示,必须使用Matrix3x3矩阵才能正确表示。
		 * @return 世界缩放。
		 */
		public function setWorldLossyScale(value:Vector3):void{}

		/**
		 * @deprecated 
		 */

		/**
		 * @deprecated 
		 */
		public var scale:Vector3;
	}

}
