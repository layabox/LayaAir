package laya.d3.core.light {
	import laya.d3.core.light.LightSprite;

	/*
	 * <code>DirectionLight</code> 类用于创建平行光。
	 */
	public class DirectionLight extends laya.d3.core.light.LightSprite {
		private var _direction:*;

		/*
		 * 创建一个 <code>DirectionLight</code> 实例。
		 */

		public function DirectionLight(){}
		private var _initShadow:*;

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
		 * 更新平行光相关渲染状态参数。
		 * @param state 渲染状态参数。
		 * @override 
		 */
		override public function _prepareToScene():Boolean{
			return null;
		}
	}

}
