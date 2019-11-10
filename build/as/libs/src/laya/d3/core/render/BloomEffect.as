package laya.d3.core.render {
	import laya.d3.core.render.PostProcessEffect;
	import laya.d3.math.Color;
	import laya.resource.Texture2D;

	/**
	 * <code>BloomEffect</code> 类用于创建泛光效果。
	 */
	public class BloomEffect extends PostProcessEffect {

		/**
		 * 限制泛光像素的数量,该值在伽马空间。
		 */
		public var clamp:Number;

		/**
		 * 泛光颜色。
		 */
		public var color:Color;

		/**
		 * 是否开启快速模式。该模式通过降低质量来提升性能。
		 */
		public var fastMode:Boolean;

		/**
		 * 镜头污渍纹路,用于为泛光特效增加污渍灰尘效果
		 */
		public var dirtTexture:Texture2D;

		/**
		 * 获取泛光过滤器强度,最小值为0。
		 * @return 强度。
		 */

		/**
		 * 设置泛光过滤器强度,最小值为0。
		 * @param value 强度。
		 */
		public var intensity:Number;

		/**
		 * 设置泛光阈值,在该阈值亮度以下的像素会被过滤掉,该值在伽马空间。
		 * @return 阈值。
		 */

		/**
		 * 获取泛光阈值,在该阈值亮度以下的像素会被过滤掉,该值在伽马空间。
		 * @param value 阈值。
		 */
		public var threshold:Number;

		/**
		 * 获取软膝盖过渡强度,在阈值以下进行渐变过渡(0为完全硬过度,1为完全软过度)。
		 * @return 软膝盖值。
		 */

		/**
		 * 设置软膝盖过渡强度,在阈值以下进行渐变过渡(0为完全硬过度,1为完全软过度)。
		 * @param value 软膝盖值。
		 */
		public var softKnee:Number;

		/**
		 * 获取扩散值,改变泛光的扩散范围,最好使用整数值保证效果,该值会改变内部的迭代次数,范围是1到10。
		 * @return 光晕的扩散范围。
		 */

		/**
		 * 设置扩散值,改变泛光的扩散范围,最好使用整数值保证效果,该值会改变内部的迭代次数,范围是1到10。
		 * @param value 光晕的扩散范围。
		 */
		public var diffusion:Number;

		/**
		 * 获取形变比,通过扭曲泛光产生视觉上形变,负值为垂直扭曲,正值为水平扭曲。
		 * @return 形变比。
		 */

		/**
		 * 设置形变比,通过扭曲泛光产生视觉上形变,负值为垂直扭曲,正值为水平扭曲。
		 * @param value 形变比。
		 */
		public var anamorphicRatio:Number;

		/**
		 * 获取污渍强度。
		 * @return 污渍强度。
		 */

		/**
		 * 设置污渍强度。
		 * @param value 污渍强度。
		 */
		public var dirtIntensity:Number;

		/**
		 * 创建一个 <code>BloomEffect</code> 实例。
		 */

		public function BloomEffect(){}
	}

}
