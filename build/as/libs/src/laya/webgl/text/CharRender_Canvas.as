/*[IF-FLASH]*/
package laya.webgl.text {
	improt laya.webgl.text.CharRenderInfo;
	improt laya.webgl.text.ICharRender;
	public class CharRender_Canvas extends laya.webgl.text.ICharRender {
		private static var canvas:*;
		private var ctx:*;
		private var lastScaleX:*;
		private var lastScaleY:*;
		private var needResetScale:*;
		private var maxTexW:*;
		private var maxTexH:*;
		private var scaleFontSize:*;
		private var showDbgInfo:*;
		private var supportImageData:*;

		public function CharRender_Canvas(maxw:Number,maxh:Number,scalefont:Boolean = null,useImageData:Boolean = null,showdbg:Boolean = null){}
		public var canvasWidth:Number;
		public function getWidth(font:String,str:String):Number{}
		public function scale(sx:Number,sy:Number):void{}
		public function getCharBmp(char:String,font:String,lineWidth:Number,colStr:String,strokeColStr:String,cri:CharRenderInfo,margin_left:Number,margin_top:Number,margin_right:Number,margin_bottom:Number,rect:Array = null):ImageData{}
		public function getCharCanvas(char:String,font:String,lineWidth:Number,colStr:String,strokeColStr:String,cri:CharRenderInfo,margin_left:Number,margin_top:Number,margin_right:Number,margin_bottom:Number):ImageData{}
	}

}
