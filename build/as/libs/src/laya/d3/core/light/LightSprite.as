package laya.d3.core.light {
	import laya.d3.core.Sprite3D;
	import laya.d3.math.Vector3;

	/*
	 * <code>LightSprite</code> 类用于创建灯光的父类。
	 */
	public class LightSprite extends laya.d3.core.Sprite3D {

		/*
		 * 灯光烘培类型-实时。
		 */
		public static var LIGHTMAPBAKEDTYPE_REALTIME:Number;

		/*
		 * 灯光烘培类型-混合。
		 */
		public static var LIGHTMAPBAKEDTYPE_MIXED:Number;

		/*
		 * 灯光烘培类型-烘焙。
		 */
		public static var LIGHTMAPBAKEDTYPE_BAKED:Number;

		/*
		 * 灯光颜色。
		 */
		public var color:Vector3;

		/*
		 * 获取灯光强度。
		 * @return 灯光强度
		 */

		/*
		 * 设置灯光强度。
		 * @param value 灯光强度
		 */
		public var intensity:Number;

		/*
		 * 获取是否产生阴影。
		 * @return 是否产生阴影。
		 */

		/*
		 * 设置是否产生阴影。
		 * @param value 是否产生阴影。
		 */
		public var shadow:Boolean;

		/*
		 * 获取阴影最远范围。
		 * @return 阴影最远范围。
		 */

		/*
		 * 设置阴影最远范围。
		 * @param value 阴影最远范围。
		 */
		public var shadowDistance:Number;

		/*
		 * 获取阴影贴图尺寸。
		 * @return 阴影贴图尺寸。
		 */

		/*
		 * 设置阴影贴图尺寸。
		 * @param value 阴影贴图尺寸。
		 */
		public var shadowResolution:Number;

		/*
		 * 获取阴影分段数。
		 * @return 阴影分段数。
		 */

		/*
		 * 设置阴影分段数。
		 * @param value 阴影分段数。
		 */
		public var shadowPSSMCount:Number;

		/*
		 * 获取阴影PCF类型。
		 * @return PCF类型。
		 */

		/*
		 * 设置阴影PCF类型。
		 * @param value PCF类型。
		 */
		public var shadowPCFType:Number;

		/*
		 * 获取灯光烘培类型。
		 */

		/*
		 * 设置灯光烘培类型。
		 */
		public var lightmapBakedType:Number;

		/*
		 * 创建一个 <code>LightSprite</code> 实例。
		 */

		public function LightSprite(){}

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
		 * 更新灯光相关渲染状态参数。
		 * @param state 渲染状态参数。
		 */
		public function _prepareToScene():Boolean{
			return null;
		}

		/*
		 * 获取灯光的漫反射颜色。
		 * @return 灯光的漫反射颜色。
		 */

		/*
		 * 设置灯光的漫反射颜色。
		 * @param value 灯光的漫反射颜色。
		 */
		public var diffuseColor:Vector3;
	}

}
