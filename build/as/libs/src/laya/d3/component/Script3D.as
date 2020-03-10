package laya.d3.component {
	import laya.components.Component;
	import laya.d3.physics.Collision;
	import laya.d3.physics.PhysicsComponent;

	/**
	 * <code>Script3D</code> 类用于创建脚本的父类,该类为抽象类,不允许实例。
	 */
	public class Script3D extends Component {

		/**
		 * 创建后只执行一次
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onAwake():void{}

		/**
		 * 每次启动后执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onEnable():void{}

		/**
		 * 第一次执行update之前执行，只会执行一次
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onStart():void{}

		/**
		 * 开始触发时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onTriggerEnter(other:PhysicsComponent):void{}

		/**
		 * 持续触发时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onTriggerStay(other:PhysicsComponent):void{}

		/**
		 * 结束触发时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onTriggerExit(other:PhysicsComponent):void{}

		/**
		 * 开始碰撞时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onCollisionEnter(collision:Collision):void{}

		/**
		 * 持续碰撞时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onCollisionStay(collision:Collision):void{}

		/**
		 * 结束碰撞时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onCollisionExit(collision:Collision):void{}

		/**
		 * 鼠标按下时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onMouseDown():void{}

		/**
		 * 鼠标拖拽时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onMouseDrag():void{}

		/**
		 * 鼠标点击时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onMouseClick():void{}

		/**
		 * 鼠标弹起时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onMouseUp():void{}

		/**
		 * 鼠标进入时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onMouseEnter():void{}

		/**
		 * 鼠标经过时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onMouseOver():void{}

		/**
		 * 鼠标离开时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onMouseOut():void{}

		/**
		 * 每帧更新时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onUpdate():void{}

		/**
		 * 每帧更新时执行，在update之后执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onLateUpdate():void{}

		/**
		 * 渲染之前执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onPreRender():void{}

		/**
		 * 渲染之后执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onPostRender():void{}

		/**
		 * 禁用时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onDisable():void{}

		/**
		 * 销毁时执行
		 * 此方法为虚方法，使用时重写覆盖即可
		 */
		public function onDestroy():void{}
	}

}
