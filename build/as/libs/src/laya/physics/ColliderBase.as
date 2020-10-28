package laya.physics {
	import laya.components.Component;
	import laya.physics.RigidBody;

	/**
	 * 碰撞体基类
	 */
	public class ColliderBase extends Component {

		/**
		 * 是否是传感器，传感器能够触发碰撞事件，但不会产生碰撞反应
		 */
		private var _isSensor:*;

		/**
		 * 密度值，值可以为零或者是正数，建议使用相似的密度，这样做可以改善堆叠稳定性，默认值为10
		 */
		private var _density:*;

		/**
		 * 摩擦力，取值范围0-1，值越大，摩擦越大，默认值为0.2
		 */
		private var _friction:*;

		/**
		 * 弹性系数，取值范围0-1，值越大，弹性越大，默认值为0
		 */
		private var _restitution:*;

		/**
		 * 标签
		 */
		public var label:String;

		/**
		 * @private b2Shape对象
		 */
		protected var _shape:*;

		/**
		 * @private b2FixtureDef对象
		 */
		protected var _def:*;

		/**
		 * [只读]b2Fixture对象
		 */
		public var fixture:*;

		/**
		 * [只读]刚体引用
		 */
		public var rigidBody:RigidBody;

		/**
		 * @private 获取碰撞体信息
		 */
		protected function getDef():*{}
		private var _checkRigidBody:*;

		/**
		 * 是否是传感器，传感器能够触发碰撞事件，但不会产生碰撞反应
		 */
		public function get isSensor():Boolean{return null;}
		public function set isSensor(value:Boolean):void{}

		/**
		 * 密度值，值可以为零或者是正数，建议使用相似的密度，这样做可以改善堆叠稳定性，默认值为10
		 */
		public function get density():Number{return null;}
		public function set density(value:Number):void{}

		/**
		 * 摩擦力，取值范围0-1，值越大，摩擦越大，默认值为0.2
		 */
		public function get friction():Number{return null;}
		public function set friction(value:Number):void{}

		/**
		 * 弹性系数，取值范围0-1，值越大，弹性越大，默认值为0
		 */
		public function get restitution():Number{return null;}
		public function set restitution(value:Number):void{}

		/**
		 * @private 碰撞体参数发生变化后，刷新物理世界碰撞信息
		 */
		public function refresh():void{}

		/**
		 * @private 重置形状
		 */
		public function resetShape(re:Boolean = null):void{}

		/**
		 * 获取是否为单实例组件。
		 * @override 
		 */
		override public function get isSingleton():Boolean{return null;}
	}

}
