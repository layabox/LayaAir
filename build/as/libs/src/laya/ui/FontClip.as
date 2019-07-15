/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.Clip;
	public class FontClip extends laya.ui.Clip {
		protected var _valueArr:String;
		protected var _indexMap:*;
		protected var _sheet:String;
		protected var _direction:String;
		protected var _spaceX:Number;
		protected var _spaceY:Number;
		private var _align:*;
		private var _wordsW:*;
		private var _wordsH:*;

		public function FontClip(skin:String = null,sheet:String = null){}
		protected function createChildren():void{}
		private var _onClipLoaded:*;
		public var sheet:String;
		public var value:String;
		public var direction:String;
		public var spaceX:Number;
		public var spaceY:Number;
		public var align:String;
		protected function changeValue():void{}
		public var width:Number;
		public var height:Number;
		protected function measureWidth():Number{}
		protected function measureHeight():Number{}
		public function destroy(destroyChild:Boolean = null):void{}
	}

}
