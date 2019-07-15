/*[IF-FLASH]*/
package laya.d3.resource {
	improt laya.resource.Texture2D;
	public class TextureGenerator {

		public function TextureGenerator(){}
		public static function lightAttenTexture(x:Number,y:Number,maxX:Number,maxY:Number,index:Number,data:Uint8Array):void{}
		public static function haloTexture(x:Number,y:Number,maxX:Number,maxY:Number,index:Number,data:Uint8Array):void{}
		public static function _generateTexture2D(texture:Texture2D,textureWidth:Number,textureHeight:Number,func:Function):void{}
	}

}
