package laya.utils {

	/**
	 * @private 
	 */
	public class WordText {
		public var id:Number;
		public var save:Array;
		public var toUpperCase:String;
		public var changed:Boolean;
		public var width:Number;
		public var pageChars:Array;
		public var startID:Number;
		public var startIDStroke:Number;
		public var lastGCCnt:Number;
		public var splitRender:Boolean;
		public var scalex:Number;
		public var scaley:Number;
		public function setText(txt:String):void{}
		public function toString():String{
			return null;
		}
		public function get length():Number{
				return null;
		}
		public function charCodeAt(i:Number):Number{
			return null;
		}
		public function charAt(i:Number):String{
			return null;
		}

		/**
		 * 自己主动清理缓存，需要把关联的贴图删掉
		 * 不做也可以，textrender会自动清理不用的
		 * TODO 重用
		 */
		public function cleanCache():void{}
	}

}
