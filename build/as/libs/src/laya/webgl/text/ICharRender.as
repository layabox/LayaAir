package laya.webgl.text {
	import laya.webgl.text.CharRenderInfo;
	public class ICharRender {
		public var fontsz:Number;
		public function getWidth(font:String,str:String):Number{
			return null;
		}
		public function scale(sx:Number,sy:Number):void{}
		public var canvasWidth:Number;

		/**
		 * TODO stroke
		 * @param char 
		 * @param font 
		 * @param size 返回宽高
		 * @return 
		 */
		public function getCharBmp(char:String,font:String,lineWidth:Number,colStr:String,strokeColStr:String,size:CharRenderInfo,margin_left:Number,margin_top:Number,margin_right:Number,margin_bottom:Number,rect:Array = null):ImageData{
			return null;
		}
	}

}
