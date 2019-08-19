package laya.webgl.canvas.save {
	import laya.webgl.canvas.save.ISaveData;
	import laya.resource.Context;
	public class SaveClipRect implements ISaveData {
		private static var POOL:*;
		private var _globalClipMatrix:*;
		private var _clipInfoID:*;
		public var incache:Boolean;
		public function isSaveMark():Boolean{
			return null;
		}
		public function restore(context:Context):void{}
		public static function save(context:Context):void{}
	}

}
