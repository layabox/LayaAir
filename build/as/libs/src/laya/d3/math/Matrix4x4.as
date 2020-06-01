package laya.d3.math {
	import laya.d3.math.Vector3;
	import laya.d3.math.Quaternion;
	import laya.d3.core.IClone;

	/**
	 * <code>Matrix4x4</code> 类用于创建4x4矩阵。
	 */
	public class Matrix4x4 implements IClone {

		/**
		 * 默认矩阵,禁止修改
		 */
		public static var DEFAULT:Matrix4x4;

		/**
		 * 默认矩阵,禁止修改
		 */
		public static var ZERO:Matrix4x4;

		/**
		 * 绕X轴旋转
		 * @param rad 旋转角度
		 * @param out 输出矩阵
		 */
		public static function createRotationX(rad:Number,out:Matrix4x4):void{}

		/**
		 * 绕Y轴旋转
		 * @param rad 旋转角度
		 * @param out 输出矩阵
		 */
		public static function createRotationY(rad:Number,out:Matrix4x4):void{}

		/**
		 * 绕Z轴旋转
		 * @param rad 旋转角度
		 * @param out 输出矩阵
		 */
		public static function createRotationZ(rad:Number,out:Matrix4x4):void{}

		/**
		 * 通过yaw pitch roll旋转创建旋转矩阵。
		 * @param yaw 
		 * @param pitch 
		 * @param roll 
		 * @param result 
		 */
		public static function createRotationYawPitchRoll(yaw:Number,pitch:Number,roll:Number,result:Matrix4x4):void{}

		/**
		 * 通过旋转轴axis和旋转角度angle计算旋转矩阵。
		 * @param axis 旋转轴,假定已经归一化。
		 * @param angle 旋转角度。
		 * @param result 结果矩阵。
		 */
		public static function createRotationAxis(axis:Vector3,angle:Number,result:Matrix4x4):void{}
		public function setRotation(rotation:Quaternion):void{}
		public function setPosition(position:Vector3):void{}

		/**
		 * 通过四元数创建旋转矩阵。
		 * @param rotation 旋转四元数。
		 * @param result 输出旋转矩阵
		 */
		public static function createRotationQuaternion(rotation:Quaternion,result:Matrix4x4):void{}

		/**
		 * 根据平移计算输出矩阵
		 * @param trans 平移向量
		 * @param out 输出矩阵
		 */
		public static function createTranslate(trans:Vector3,out:Matrix4x4):void{}

		/**
		 * 根据缩放计算输出矩阵
		 * @param scale 缩放值
		 * @param out 输出矩阵
		 */
		public static function createScaling(scale:Vector3,out:Matrix4x4):void{}

		/**
		 * 计算两个矩阵的乘法
		 * @param left left矩阵
		 * @param right right矩阵
		 * @param out 输出矩阵
		 */
		public static function multiply(left:Matrix4x4,right:Matrix4x4,out:Matrix4x4):void{}
		public static function multiplyForNative(left:Matrix4x4,right:Matrix4x4,out:Matrix4x4):void{}

		/**
		 * 从四元数计算旋转矩阵
		 * @param rotation 四元数
		 * @param out 输出矩阵
		 */
		public static function createFromQuaternion(rotation:Quaternion,out:Matrix4x4):void{}

		/**
		 * 计算仿射矩阵
		 * @param trans 平移
		 * @param rot 旋转
		 * @param scale 缩放
		 * @param out 输出矩阵
		 */
		public static function createAffineTransformation(trans:Vector3,rot:Quaternion,scale:Vector3,out:Matrix4x4):void{}

		/**
		 * 计算观察矩阵
		 * @param eye 视点位置
		 * @param target 视点目标
		 * @param up 向上向量
		 * @param out 输出矩阵
		 */
		public static function createLookAt(eye:Vector3,target:Vector3,up:Vector3,out:Matrix4x4):void{}

		/**
		 * 通过FOV创建透视投影矩阵。
		 * @param fov 视角。
		 * @param aspect 横纵比。
		 * @param near 近裁面。
		 * @param far 远裁面。
		 * @param out 输出矩阵。
		 */
		public static function createPerspective(fov:Number,aspect:Number,znear:Number,zfar:Number,out:Matrix4x4):void{}

		/**
		 * 创建透视投影矩阵。
		 * @param left 视椎左边界。
		 * @param right 视椎右边界。
		 * @param bottom 视椎底边界。
		 * @param top 视椎顶边界。
		 * @param znear 视椎近边界。
		 * @param zfar 视椎远边界。
		 * @param out 输出矩阵。
		 */
		public static function createPerspectiveOffCenter(left:Number,right:Number,bottom:Number,top:Number,znear:Number,zfar:Number,out:Matrix4x4):void{}

		/**
		 * 计算正交投影矩阵。
		 * @param left 视椎左边界。
		 * @param right 视椎右边界。
		 * @param bottom 视椎底边界。
		 * @param top 视椎顶边界。
		 * @param near 视椎近边界。
		 * @param far 视椎远边界。
		 * @param out 输出矩阵。
		 */
		public static function createOrthoOffCenter(left:Number,right:Number,bottom:Number,top:Number,znear:Number,zfar:Number,out:Matrix4x4):void{}

		/**
		 * 矩阵元素数组
		 */
		public var elements:Float32Array;

		/**
		 * 创建一个 <code>Matrix4x4</code> 实例。
		 * @param  4x4矩阵的各元素
		 */

		public function Matrix4x4(m11:Number = undefined,m12:Number = undefined,m13:Number = undefined,m14:Number = undefined,m21:Number = undefined,m22:Number = undefined,m23:Number = undefined,m24:Number = undefined,m31:Number = undefined,m32:Number = undefined,m33:Number = undefined,m34:Number = undefined,m41:Number = undefined,m42:Number = undefined,m43:Number = undefined,m44:Number = undefined,elements:Float32Array = undefined){}
		public function getElementByRowColumn(row:Number,column:Number):Number{
			return null;
		}
		public function setElementByRowColumn(row:Number,column:Number,value:Number):void{}

		/**
		 * 判断两个4x4矩阵的值是否相等。
		 * @param other 4x4矩阵
		 */
		public function equalsOtherMatrix(other:Matrix4x4):Boolean{
			return null;
		}

		/**
		 * 分解矩阵为平移向量、旋转四元数、缩放向量。
		 * @param translation 平移向量。
		 * @param rotation 旋转四元数。
		 * @param scale 缩放向量。
		 * @return 是否分解成功。
		 */
		public function decomposeTransRotScale(translation:Vector3,rotation:Quaternion,scale:Vector3):Boolean{
			return null;
		}

		/**
		 * 分解矩阵为平移向量、旋转矩阵、缩放向量。
		 * @param translation 平移向量。
		 * @param rotationMatrix 旋转矩阵。
		 * @param scale 缩放向量。
		 * @return 是否分解成功。
		 */
		public function decomposeTransRotMatScale(translation:Vector3,rotationMatrix:Matrix4x4,scale:Vector3):Boolean{
			return null;
		}

		/**
		 * 分解旋转矩阵的旋转为YawPitchRoll欧拉角。
		 * @param out float yaw
		 * @param out float pitch
		 * @param out float roll
		 * @return 
		 */
		public function decomposeYawPitchRoll(yawPitchRoll:Vector3):void{}

		/**
		 * 归一化矩阵
		 */
		public function normalize():void{}

		/**
		 * 计算矩阵的转置矩阵
		 */
		public function transpose():Matrix4x4{
			return null;
		}

		/**
		 * 计算一个矩阵的逆矩阵
		 * @param out 输出矩阵
		 */
		public function invert(out:Matrix4x4):void{}

		/**
		 * 计算BlillBoard矩阵
		 * @param objectPosition 物体位置
		 * @param cameraPosition 相机位置
		 * @param cameraUp 相机上向量
		 * @param cameraForward 相机前向量
		 * @param mat 变换矩阵
		 */
		public static function billboard(objectPosition:Vector3,cameraPosition:Vector3,cameraRight:Vector3,cameraUp:Vector3,cameraForward:Vector3,mat:Matrix4x4):void{}

		/**
		 * 设置矩阵为单位矩阵
		 */
		public function identity():void{}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
		public static function translation(v3:Vector3,out:Matrix4x4):void{}

		/**
		 * 获取平移向量。
		 * @param out 平移向量。
		 */
		public function getTranslationVector(out:Vector3):void{}

		/**
		 * 设置平移向量。
		 * @param translate 平移向量。
		 */
		public function setTranslationVector(translate:Vector3):void{}

		/**
		 * 获取前向量。
		 * @param out 前向量。
		 */
		public function getForward(out:Vector3):void{}

		/**
		 * 设置前向量。
		 * @param forward 前向量。
		 */
		public function setForward(forward:Vector3):void{}
	}

}
