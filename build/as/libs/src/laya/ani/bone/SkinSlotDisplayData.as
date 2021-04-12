package laya.ani.bone {
	import laya.resource.Texture;
	import laya.ani.bone.Transform;
	import laya.ani.bone.Transform;
	import laya.resource.Texture;

	/**
	 * 插槽显示数据
	 */
	public class SkinSlotDisplayData {

		/**
		 * 名称
		 */
		public var name:String;

		/**
		 * 附件名称
		 */
		public var attachmentName:String;

		/**
		 * 类型
		 */
		public var type:Number;

		/**
		 * 变换
		 */
		public var transform:Transform;

		/**
		 * 宽度
		 */
		public var width:Number;

		/**
		 * 高度
		 */
		public var height:Number;

		/**
		 * 纹理
		 */
		public var texture:Texture;

		/**
		 * 骨骼数据
		 */
		public var bones:Array;

		/**
		 * uv数据
		 */
		public var uvs:Array;

		/**
		 * 权重
		 */
		public var weights:Array;

		/**
		 * 三角面数据
		 */
		public var triangles:Array;

		/**
		 * 顶点数据
		 */
		public var vertices:Array;

		/**
		 * 长度数据
		 */
		public var lengths:Array;

		/**
		 * 版本号
		 */
		public var verLen:Number;
		public function createTexture(currTexture:Texture):Texture{
			return null;
		}
		public function destory():void{}
	}

}
