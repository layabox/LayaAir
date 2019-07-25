package laya.d3.core.light {
	import laya.d3.core.light.LightSprite;

	/*
	 * <code>PointLight</code> 类用于创建点光。
	 */
	public class PointLight extends laya.d3.core.light.LightSprite {
		private static var _tempMatrix0:*;
		private var _range:*;
		private var _lightMatrix:*;

		/*
		 * 创建一个 <code>PointLight</code> 实例。
		 */

		public function PointLight(){}

		/*
		 * 获取点光的范围。
		 * @return 点光的范围。
		 */

		/*
		 * 设置点光的范围。
		 * @param value 点光的范围。
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
		 * 更新点光相关渲染状态参数。
		 * @param state 渲染状态参数。
		 * @override 
		 */
		override public function _prepareToScene():Boolean{
			return null;
		}
	}

}
