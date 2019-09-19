package laya.physics {
	import laya.display.Sprite;
	import laya.events.EventDispatcher;

	/**
	 * 2D物理引擎，使用Box2d驱动
	 */
	public class Physics extends EventDispatcher {

		/**
		 * 2D游戏默认单位为像素，物理默认单位为米，此值设置了像素和米的转换比率，默认50像素=1米
		 */
		public static var PIXEL_RATIO:Number;

		/**
		 * @private 
		 */
		private static var _I:*;

		/**
		 * Box2d引擎的全局引用，更多属性和api请参考 http://box2d.org
		 */
		public var box2d:*;

		/**
		 * [只读]物理世界引用，更多属性请参考官网
		 */
		public var world:*;

		/**
		 * 旋转迭代次数，增大数字会提高精度，但是会降低性能
		 */
		public var velocityIterations:Number;

		/**
		 * 位置迭代次数，增大数字会提高精度，但是会降低性能
		 */
		public var positionIterations:Number;

		/**
		 * @private 是否已经激活
		 */
		private var _enabled:*;

		/**
		 * @private 根容器
		 */
		private var _worldRoot:*;

		/**
		 * @private 空的body节点，给一些不需要节点的关节使用
		 */
		public var _emptyBody:*;

		/**
		 * @private 
		 */
		public var _eventList:Array;

		/**
		 * 全局物理单例
		 */
		public static function get I():Physics{
				return null;
		}

		public function Physics(){}

		/**
		 * 开启物理世界
		 * options值参考如下：
		 * allowSleeping:true,
		 * gravity:10,
		 * customUpdate:false 自己控制物理更新时机，自己调用Physics.update
		 */
		public static function enable(options:* = null):void{}

		/**
		 * 开启物理世界
		 * options值参考如下：
		 * allowSleeping:true,
		 * gravity:10,
		 * customUpdate:false 自己控制物理更新时机，自己调用Physics.update
		 */
		public function start(options:* = null):void{}
		private var _update:*;
		private var _sendEvent:*;

		/**
		 * @private 
		 */
		public function _createBody(def:*):*{}

		/**
		 * @private 
		 */
		public function _removeBody(body:*):void{}

		/**
		 * @private 
		 */
		public function _createJoint(def:*):*{}

		/**
		 * @private 
		 */
		public function _removeJoint(joint:*):void{}

		/**
		 * 停止物理世界
		 */
		public function stop():void{}

		/**
		 * 设置是否允许休眠，休眠可以提高稳定性和性能，但通常会牺牲准确性
		 */
		public var allowSleeping:Boolean;

		/**
		 * 物理世界重力环境，默认值为{x:0,y:1}
		 * 如果修改y方向重力方向向上，可以直接设置gravity.y=-1;
		 */
		public var gravity:*;

		/**
		 * 获得刚体总数量
		 */
		public function getBodyCount():Number{
			return null;
		}

		/**
		 * 获得碰撞总数量
		 */
		public function getContactCount():Number{
			return null;
		}

		/**
		 * 获得关节总数量
		 */
		public function getJointCount():Number{
			return null;
		}

		/**
		 * 物理世界根容器，将根据此容器作为物理世界坐标世界，进行坐标变换，默认值为stage
		 * 设置特定容器后，就可整体位移物理对象，保持物理世界不变
		 */
		public var worldRoot:Sprite;
	}

}
