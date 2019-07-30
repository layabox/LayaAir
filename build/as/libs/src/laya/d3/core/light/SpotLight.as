package laya.d3.core.light {
	import laya.d3.core.light.LightSprite;

	/*
	 * <code>SpotLight</code> 类用于创建聚光。
	 */
	public class SpotLight extends laya.d3.core.light.LightSprite {
		private static var _tempMatrix0:*;
		private static var _tempMatrix1:*;
		private var _direction:*;
		private var _spotAngle:*;
		private var _range:*;

		/*
		 * 获取聚光灯的锥形角度。
		 * @return 聚光灯的锥形角度。
		 */

		/*
		 * 设置聚光灯的锥形角度。
		 * @param value 聚光灯的锥形角度。
		 */
		public var spotAngle:Number;

		/*
		 * 获取聚光的范围。
		 * @return 聚光的范围值。
		 */

		/*
		 * 设置聚光的范围。
		 * @param value 聚光的范围值。
		 */
		public var range:Number;

		/*
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onActive():void{}

		/*
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onInActive():void{}

		/*
		 * 更新聚光相关渲染状态参数。
		 * @param state 渲染状态参数。
		 * @override 
		 */
		override public function _prepareToScene():Boolean{
			return null;
		}
	}

}
