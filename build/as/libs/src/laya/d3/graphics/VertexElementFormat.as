package laya.d3.graphics {

	/**
	 * ...
	 * @author ...
	 */
	public class VertexElementFormat {
		public static var Single:String;
		public static var Vector2:String;
		public static var Vector3:String;
		public static var Vector4:String;
		public static var Color:String;
		public static var Byte4:String;
		public static var Short2:String;
		public static var Short4:String;
		public static var NormalizedShort2:String;
		public static var NormalizedShort4:String;
		public static var HalfVector2:String;
		public static var HalfVector4:String;
		public static function __init__():void{}

		/**
		 * 获取顶点元素格式信息。
		 */
		public static function getElementInfos(element:String):Array{
			return null;
		}
	}

}
