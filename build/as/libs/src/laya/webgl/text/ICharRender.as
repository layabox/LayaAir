/*[IF-FLASH]*/
package laya.webgl.text {
	improt laya.webgl.text.CharRenderInfo;
	public class ICharRender {
		public function getWidth(font:String,str:String):Number{}
		public function scale(sx:Number,sy:Number):void{}
		public var canvasWidth:Number;
		public function getCharBmp(char:String,font:String,lineWidth:Number,colStr:String,strokeColStr:String,size:CharRenderInfo,margin_left:Number,margin_top:Number,margin_right:Number,margin_bottom:Number,rect:Array = null):ImageData{}
	}

}
