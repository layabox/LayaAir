/*[IF-FLASH]*/
package laya.html.dom {
	improt laya.display.Sprite;
	improt laya.html.utils.HTMLStyle;
	public class HTMLDivElement extends laya.display.Sprite {
		private var _recList:*;
		private var _innerHTML:*;
		private var _repaintState:*;

		public function HTMLDivElement(){}
		public function destroy(destroyChild:Boolean = null):void{}
		private var _htmlDivRepaint:*;
		private var _updateGraphicWork:*;
		private var _setGraphicDirty:*;
		private var _doClears:*;
		private var _updateGraphic:*;
		public function get style():HTMLStyle{};
		public var innerHTML:String;
		private var _refresh:*;
		public function get contextWidth():Number{};
		public function get contextHeight():Number{};
		private var _onMouseClick:*;
		private var _eventLink:*;
	}

}
