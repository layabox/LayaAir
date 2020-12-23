package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;

	/**
	 * ...
	 * @author ...
	 */
	public class ExtendTerrainMaterial extends Material {

		/**
		 * 渲染状态_不透明。
		 */
		public static var RENDERMODE_OPAQUE:Number;

		/**
		 * 渲染状态_透明混合。
		 */
		public static var RENDERMODE_TRANSPARENT:Number;

		/**
		 * splatAlpha贴图。
		 */
		public function get splatAlphaTexture():BaseTexture{return null;}
		public function set splatAlphaTexture(value:BaseTexture):void{}

		/**
		 * 第一层贴图。
		 */
		public function get diffuseTexture1():BaseTexture{return null;}
		public function set diffuseTexture1(value:BaseTexture):void{}

		/**
		 * 第二层贴图。
		 */
		public function get diffuseTexture2():BaseTexture{return null;}
		public function set diffuseTexture2(value:BaseTexture):void{}

		/**
		 * 第三层贴图。
		 */
		public function get diffuseTexture3():BaseTexture{return null;}
		public function set diffuseTexture3(value:BaseTexture):void{}

		/**
		 * 第四层贴图。
		 */
		public function get diffuseTexture4():BaseTexture{return null;}
		public function set diffuseTexture4(value:BaseTexture):void{}

		/**
		 * 第五层贴图。
		 */
		public function get diffuseTexture5():BaseTexture{return null;}
		public function set diffuseTexture5(value:BaseTexture):void{}

		/**
		 * 第一层贴图缩放偏移。
		 */
		public function set diffuseScaleOffset1(scaleOffset1:Vector4):void{}

		/**
		 * 第二层贴图缩放偏移。
		 */
		public function set diffuseScaleOffset2(scaleOffset2:Vector4):void{}

		/**
		 * 第三层贴图缩放偏移。
		 */
		public function set diffuseScaleOffset3(scaleOffset3:Vector4):void{}

		/**
		 * 第四层贴图缩放偏移。
		 */
		public function set diffuseScaleOffset4(scaleOffset4:Vector4):void{}

		/**
		 * 第五层贴图缩放偏移。
		 */
		public function set diffuseScaleOffset5(scaleOffset5:Vector4):void{}

		/**
		 * 设置渲染模式。
		 */
		public function set renderMode(value:Number):void{}

		/**
		 * 创建一个 <code>ExtendTerrainMaterial</code> 实例。
		 */

		public function ExtendTerrainMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
