package laya.physics.joint {
	import laya.components.Component;

	/*
	 * 关节基类
	 */
	public class JointBase extends laya.components.Component {

		/*
		 * 原生关节对象
		 */
		protected var _joint:*;

		/*
		 * [只读]原生关节对象
		 */
		public function get joint():*{
				return null;
		}

		/*
		 * @override 
		 */
		override protected function _onEnable():void{}

		/*
		 * @override 
		 */
		override protected function _onAwake():void{}
		protected function _createJoint():void{}

		/*
		 * @override 
		 */
		override protected function _onDisable():void{}
	}

}
