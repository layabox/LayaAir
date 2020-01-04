package laya.webgl.text {
	import laya.webgl.text.CharRenderInfo;
	import laya.webgl.text.ICharRender;
	public class CharRender_Canvas extends ICharRender {
		private static var canvas:*;
		private var ctx:*;
		private var lastScaleX:*;
		private var lastScaleY:*;
		private var maxTexW:*;
		private var maxTexH:*;
		private var scaleFontSize:*;
		private var showDbgInfo:*;
		private var supportImageData:*;

		public function CharRender_Canvas(maxw:Number = undefined,maxh:Number = undefined,scalefont:Boolean = undefined,useImageData:Boolean = undefined,showdbg:Boolean = undefined){}

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
		 * @param cri 修改里面的width。
		 * @return 
		 * @override 
		 */
		override public function getCharBmp(char:String,font:String,lineWidth:Number,colStr:String,strokeColStr:String,cri:CharRenderInfo,margin_left:Number,margin_top:Number,margin_right:Number,margin_bottom:Number,rect:Array = null):ImageData{
			return null;
		}
		public function getCharCanvas(char:String,font:String,lineWidth:Number,colStr:String,strokeColStr:String,cri:CharRenderInfo,margin_left:Number,margin_top:Number,margin_right:Number,margin_bottom:Number):ImageData{
			return null;
		}
	}

}
