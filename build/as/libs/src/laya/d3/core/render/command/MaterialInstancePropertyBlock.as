package laya.d3.core.render.command {
	import laya.d3.math.Vector2;
	import laya.d3.math.Vector3;
	import laya.d3.math.Vector4;

	/**
	 * <code>Mesh</code> 类用于创建CustomInstance属性块。
	 */
	public class MaterialInstancePropertyBlock {

		/**
		 * Instance合并方案
		 */

		/**
		 * attribute instance渲染方案 优点：合并数量多,合并效率高，渲染性能优 缺点：instance变量元素少
		 */
		public static var INSTANCETYPE_ATTRIBUTE:Number;

		/**
		 * uniform instance渲染方案 优点：instance变量多，灵活  缺点：合并数量受WebGLContext._maxUniformFragmentVectors的影响，合并效率低
		 */
		public static var INSTANCETYPE_UNIFORMBUFFER:Number;

		public function MaterialInstancePropertyBlock(){}

		/**
		 * 创建instance属性
		 * @param attributeName name
		 * @param arrays data
		 * @param vertexStride vertex size
		 * @param vertexformat vertexFormat
		 * @param attributeLocation attribute location
		 */
		private var _creatProperty:*;

		/**
		 * 设置Vector4材质数组属性
		 * @param attributeName 属性名称（要对应到Shader中）
		 * @param arrays 数据
		 * @param attributeLocation 属性Shader位置（需要与shader中的声明Attribute一一对应）
		 */
		public function setVectorArray(attributeName:String,arrays:*,attributeLocation:*):void{}

		/**
		 * 设置Vector3材质数组属性
		 * @param attributeName 属性名称（要对应到Shader中）
		 * @param arrays 数据
		 * @param attributeLocation 属性shader位置（需要与shader中的声明Attribute一一对应）
		 */
		public function setVector3Array(attributeName:String,arrays:*,attributeLocation:*):void{}

		/**
		 * 设置Vector2材质数组属性
		 * @param attributeName 属性名称（要对应到Shader中）
		 * @param arrays 数据
		 * @param attributeLocation 属性shader位置（需要与shader中的声明Attribute一一对应）
		 */
		public function setVector2Array(attributeName:String,arrays:*,attributeLocation:*):void{}

		/**
		 * 设置Number材质数组属性
		 * @param attributeName 属性名称（要对应到Shader中）
		 * @param arrays 数据
		 * @param attributeLocation 属性shader位置（需要与shader中的声明Attribute一一对应）
		 */
		public function setNumberArray(attributeName:String,arrays:Float32Array,attributeLocation:*):void{}

		/**
		 * 获得属性数据
		 * @param attributeLocation 属性shader位置
		 */
		public function getPropertyArray(attributeLocation:*):*{}
		public function clear():void{}
	}

}
