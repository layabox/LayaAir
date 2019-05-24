package laya.html.dom {
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.html.utils.HTMLStyle;
	import laya.maths.Rectangle;
	import laya.resource.Context;
	import laya.utils.Handler;
	
	/**
	 * HTML图文类，用于显示html内容
	 *
	 * 支持的标签如下:
	 * a:链接标签，点击后会派发"link"事件 比如:<a href='alink'>a</a>
	 * div:div容器标签，比如:<div>abc</div>
	 * span:行内元素标签，比如:<span style='color:#ff0000'>abc</span>
	 * p:行元素标签，p标签会自动换行，div不会，比如:<p>abc</p>
	 * img:图片标签，比如:<img src='res/boy.png'></img>
	 * br:换行标签，比如:<div>abc<br/>def</div>
	 * style:样式标签，比如:<div style='width:130px;height:50px;color:#ff0000'>abc</div>
	 * link:外链样式标签，可以加载一个css文件来当style使用，比如:<link type='text/css' href='html/test.css'/>
	 *
	 * style支持的属性如下:
	 * italic:true|false;					是否是斜体
	 * bold:true|false;						是否是粗体
	 * letter-spacing:10px;					字间距
	 * font-family:宋体; 					字体
	 * font-size:20px;						字体大小
	 * font-weight:bold:none;				字体是否是粗体，功能同bold
	 * color:#ff0000;						字体颜色
	 * stroke:2px;							字体描边宽度
	 * strokeColor:#ff0000;					字体描边颜色
	 * padding:10px 10px 20px 20px;			边缘的距离
	 * vertical-align:top|bottom|middle;	垂直对齐方式
	 * align:left|right|center;				水平对齐方式
	 * line-height:20px;					行高
	 * background-color:#ff0000;			背景颜色
	 * border-color:#ff0000;				边框颜色
	 * width:100px;							对象宽度
	 * height:100px;						对象高度
	 *
	 * 示例用法：
	 * var div:HTMLDivElement=new HTMLDivElement();
	 * div.innerHTML = "<link type='text/css' href='html/test.css'/><a href='alink'>a</a><div style='width:130px;height:50px;color:#ff0000'>div</div><br/><span style='font-weight:bold;color:#ffffff;font-size:30px;stroke:2px;italic:true;'>span</span><span style='letter-spacing:5px'>span2</span><p>p</p><img src='res/boy.png'></img>";
	 */
	public class HTMLDivElement extends Sprite {
		/**@private */
		public var _element:HTMLDivParser;
		/**@private */
		private var _recList:Array = [];
		/**@private */
		private var _innerHTML:String;
		/**@private */
		private var _repaintState:int = 0;
		
		public function HTMLDivElement() {
			_element = new HTMLDivParser();
			_element.repaintHandler = new Handler(this, _htmlDivRepaint);
			this.mouseEnabled = true;
			this.on(Event.CLICK, this, _onMouseClick);
		}
		
		/**@private */
		override public function destroy(destroyChild:Boolean = true):void {
			if (_element) _element.reset();
			_element = null;
			_doClears();
			super.destroy(destroyChild);
		}
		
		/**@private */
		private function _htmlDivRepaint(recreate:Boolean = false):void {
			if (recreate) {
				if (_repaintState < 2) _repaintState = 2;
			} else {
				if (_repaintState < 1) _repaintState = 1;
			}
			if (_repaintState > 0) _setGraphicDirty();
		}
		
		
		private function _updateGraphicWork():void
		{
			switch(_repaintState)
			{
				case 1:
					_updateGraphic();
					break;
				case 2:
					_refresh();
					break;
			}
		}
		
		private function _setGraphicDirty():void
		{
			callLater(_updateGraphicWork);
		}
		
		/**@private */
		private function _doClears():void {
			if (!_recList) return;
			var i:int, len:int = _recList.length;
			var tRec:HTMLHitRect;
			for (i = 0; i < len; i++) {
				tRec = _recList[i];
				tRec.recover();
			}
			_recList.length = 0;
		}
		
		/**@private */
		private function _updateGraphic():void {
			_doClears();
			this.graphics.clear(true);
			_repaintState = 0;
			_element.drawToGraphic(this.graphics, -_element.x, -_element.y, _recList);
			var bounds:Rectangle = _element.getBounds();
			if (bounds) setSelfBounds(bounds);
			//this.hitArea = bounds;
			size(bounds.width, bounds.height);
		}
		
		/**
		 * 获取HTML样式
		 */
		public function get style():HTMLStyle {
			return _element.style;
		}
		
		/**
		 * 设置标签内容
		 */
		public function set innerHTML(text:String):void {
			if (_innerHTML == text) return;
			_repaintState = 1;
			_innerHTML = text;
			_element.innerHTML = text;
			_setGraphicDirty();
		}
		
		private function _refresh():void {
			_repaintState = 1;
			if (_innerHTML) _element.innerHTML = _innerHTML;
			_setGraphicDirty();
		}
		
		/**
		 * 获取內容宽度
		 */
		public function get contextWidth():Number {
			return _element.contextWidth;
		}
		
		/**
		 * 获取內容高度
		 */
		public function get contextHeight():Number {
			return _element.contextHeight;
		}
		
		/**@private */
		private function _onMouseClick():void {
			var tX:int = this.mouseX;
			var tY:int = this.mouseY;
			var i:int, len:int;
			var tHit:HTMLHitRect;
			len = _recList.length;
			for (i = 0; i < len; i++) {
				tHit = _recList[i];
				if (tHit.rec.contains(tX, tY)) {
					_eventLink(tHit.href);
				}
			}
		}
		
		/**@private */
		private function _eventLink(href:String):void {
			event(Event.LINK, [href]);
		}
	}
}