/*[IF-FLASH]*/
package laya.utils {
	improt laya.utils.IStatRender;
	public class StatUI extends laya.utils.IStatRender {
		private static var _fontSize:*;
		private var _txt:*;
		private var _leftText:*;
		private var _canvas:*;
		private var _ctx:*;
		private var _first:*;
		private var _vx:*;
		private var _width:*;
		private var _height:*;
		private var _view:*;
		public function show(x:Number = null,y:Number = null):void{}
		private var createUIPre:*;
		private var createUI:*;
		public function enable():void{}
		public function hide():void{}
		public function set_onclick(fn:Function):void{}
		public function loop():void{}
		private var renderInfoPre:*;
		private var renderInfo:*;
		public function isCanvasRender():Boolean{}
		public function renderNotCanvas(ctx:*,x:Number,y:Number):void{}
	}

}
