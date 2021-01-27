package laya.d3.graphics {

	/**
	 * 类用来定义顶点元素格式
	 */
	public class VertexElementFormat {

		/**
		 * 单精度浮点数
		 */
		public static var Single:String;

		/**
		 * vec2 数据
		 */
		public static var Vector2:String;

		/**
		 * vec3 数据
		 */
		public static var Vector3:String;

		/**
		 * vec4 数据
		 */
		public static var Vector4:String;

		/**
		 * 颜色
		 */
		public static var Color:String;

		/**
		 * 字节数组4
		 */
		public static var Byte4:String;

		/**
		 * 半精度浮点数数组2
		 */
		public static var Short2:String;

		/**
		 * 半精度浮点数数组4
		 */
		public static var Short4:String;

		/**
		 * 归一化半精度浮点数组2
		 */
		public static var NormalizedShort2:String;

		/**
		 * 归一化半精度浮点数组4
		 */
		public static var NormalizedShort4:String;

		/**
		 * 获取顶点元素格式信息。
		 * @param element 元素名称
		 * @returns 返回顶点元素信息
		 */
		public static function getElementInfos(element:String):Array{
			return null;
		}
	}

}
