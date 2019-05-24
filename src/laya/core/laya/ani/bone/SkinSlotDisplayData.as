package laya.ani.bone {
	import laya.renders.Render;
	import laya.resource.Texture;
	
	
	/**
	 * @private
	 */
	public class SkinSlotDisplayData {
		
		public var name:String;
		public var attachmentName:String;
		public var type:int;				//0 硬  1 skin 2 另一种skin? 3 不支持
		public var transform:Transform;
		public var width:Number;
		public var height:Number;
		public var texture:Texture;
		
		public var bones:Array;
		public var uvs:Array;
		public var weights:Array;
		public var triangles:Array;
		public var vertices:Array;
		public var lengths:Array;
		public var verLen:int;
		
		public function createTexture(currTexture:Texture):Texture
		{
			if (texture) return texture;
			texture = new Texture(currTexture.bitmap, uvs);
			
			//判断是否旋转
			if (uvs[0] > uvs[4]
				&& uvs[1] > uvs[5])
			{
				//旋转
				texture.width = currTexture.height;
				texture.height = currTexture.width;
				texture.offsetX = -currTexture.offsetX;
				texture.offsetY = -currTexture.offsetY;
				texture.sourceWidth = currTexture.sourceHeight;
				texture.sourceHeight = currTexture.sourceWidth;
			}else {
				texture.width = currTexture.width;
				texture.height = currTexture.height;
				texture.offsetX = -currTexture.offsetX;
				texture.offsetY = -currTexture.offsetY;
				texture.sourceWidth = currTexture.sourceWidth;
				texture.sourceHeight = currTexture.sourceHeight;
			}
			return texture;
		}
		
		public function destory():void
		{
			if (texture) texture.destroy();
		}
	}
}