package laya.webgl.text {
	import laya.webgl.text.CharRenderInfo;
	import laya.webgl.text.ICharRender;
	public class CharRender_Native extends ICharRender {
		private var lastFont:*;
		private var lastScaleX:*;
		private var lastScaleY:*;

		public function CharRender_Native(){}

		/**
		 * @param font 
		 * @param str 
		 * @override 
		 */
		override public function getWidth(font:String,str:String):Number{
			return null;
		}

		/**
		 * @param sx 
		 * @param sy 
		 * @override 
		 */
		override public function scale(sx:Number,sy:Number):void{}

		/**
		 * TODO stroke
		 * @param char 
		 * @param font 
		 * @param size 返回宽高
		 * @return 
		 * @override 
		 */
		override public function getCharBmp(char:String,font:String,lineWidth:Number,colStr:String,strokeColStr:String,size:CharRenderInfo,margin_left:Number,margin_top:Number,margin_right:Number,margin_bottom:Number,rect:Array = null):ImageData{
			return null;
		}
	}

}
