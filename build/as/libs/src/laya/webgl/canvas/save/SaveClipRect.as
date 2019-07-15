/*[IF-FLASH]*/
package laya.webgl.canvas.save {
	improt laya.webgl.canvas.save.ISaveData;
	improt laya.resource.Context;
	public class SaveClipRect implements laya.webgl.canvas.save.ISaveData {
		private static var POOL:*;
		private var _globalClipMatrix:*;
		private var _clipInfoID:*;
		public var incache:Boolean;
		public function isSaveMark():Boolean{}
		public function restore(context:Context):void{}
		public static function save(context:Context):void{}
	}

}
