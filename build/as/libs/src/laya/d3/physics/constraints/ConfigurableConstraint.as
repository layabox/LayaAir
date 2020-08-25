package laya.d3.physics.constraints {
	import laya.d3.physics.constraints.ConstraintComponent;
	import laya.d3.math.Vector3;
	public class ConfigurableConstraint extends ConstraintComponent {
		public static var CONFIG_MOTION_TYPE_LOCKED:Number;
		public static var CONFIG_MOTION_TYPE_LIMITED:Number;
		public static var CONFIG_MOTION_TYPE_FREE:Number;

		/**
		 * 创建一个<code>Generic6DofSpring2Constraint</code>实例
		 */

		public function ConfigurableConstraint(){}

		/**
		 * 主轴
		 */
		public function get axis():Vector3{return null;}

		/**
		 * 副轴
		 */
		public function get secondaryAxis():Vector3{return null;}
		public function set maxAngularLimit(value:Vector3):void{}
		public function set minAngularLimit(value:Vector3):void{}
		public function get maxAngularLimit():Vector3{return null;}
		public function get minAngularLimit():Vector3{return null;}
		public function set maxLinearLimit(value:Vector3):void{}
		public function set minLinearLimit(value:Vector3):void{}
		public function get maxLinearLimit():Vector3{return null;}
		public function get minLinearLimit():Vector3{return null;}

		/**
		 * X轴线性约束模式
		 */
		public function set XMotion(value:Number):void{}
		public function get XMotion():Number{return null;}

		/**
		 * Y轴线性约束模式
		 */
		public function set YMotion(value:Number):void{}
		public function get YMotion():Number{return null;}

		/**
		 * Z轴线性约束模式
		 */
		public function set ZMotion(value:Number):void{}
		public function get ZMotion():Number{return null;}

		/**
		 * X轴旋转约束模式
		 */
		public function set angularXMotion(value:Number):void{}
		public function get angularXMotion():Number{return null;}

		/**
		 * Y轴旋转约束模式
		 */
		public function set angularYMotion(value:Number):void{}
		public function get angularYMotion():Number{return null;}

		/**
		 * Z轴旋转约束模式
		 */
		public function set angularZMotion(value:Number):void{}
		public function get angularZMotion():Number{return null;}

		/**
		 * 线性弹簧
		 */
		public function set linearLimitSpring(value:Vector3):void{}
		public function get linearLimitSpring():Vector3{return null;}

		/**
		 * 角度弹簧
		 */
		public function set angularLimitSpring(value:Vector3):void{}
		public function get angularLimitSpring():Vector3{return null;}

		/**
		 * 线性弹力
		 */
		public function set linearBounce(value:Vector3):void{}
		public function get linearBounce():Vector3{return null;}

		/**
		 * 角度弹力
		 */
		public function set angularBounce(value:Vector3):void{}
		public function get angularBounce():Vector3{return null;}
		public function set linearDamp(value:Vector3):void{}
		public function get linearDamp():Vector3{return null;}
		public function set angularDamp(value:Vector3):void{}
		public function get angularDamp():Vector3{return null;}
		public function set anchor(value:Vector3):void{}
		public function get anchor():Vector3{return null;}
		public function set connectAnchor(value:Vector3):void{}
		public function get connectAnchor():Vector3{return null;}

		/**
		 * 设置对象自然旋转的局部轴主轴，axis2为副轴
		 * @param axis1 
		 * @param axis2 
		 */
		public function setAxis(axis:Vector3,secondaryAxis:Vector3):void{}
		public function _initAllConstraintInfo():void{}
		public function _onDisable():void{}
	}

}
