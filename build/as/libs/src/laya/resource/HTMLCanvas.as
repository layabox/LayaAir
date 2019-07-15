/*[IF-FLASH]*/
package laya.resource {
	improt laya.resource.Bitmap;
	improt laya.resource.Texture;
	improt laya.resource.Context;
	public class HTMLCanvas extends laya.resource.Bitmap {
		private var _ctx:*;
		public function get source():*{};

		public function HTMLCanvas(createCanvas:Boolean = null){}
		public function clear():void{}
		public function destroy():void{}
		public function release():void{}
		public function get context():Context{};
		public function getContext(contextID:String,other:* = null):Context{}
		public function getMemSize():Number{}
		public function size(w:Number,h:Number):void{}
		public function getTexture():Texture{}
		public function toBase64(type:String,encoderOptions:Number):String{}
		public function toBase64Async(type:String,encoderOptions:Number,callBack:Function):void{}
	}

}
