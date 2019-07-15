/*[IF-FLASH]*/
package laya.webgl.canvas.save {
	improt laya.webgl.canvas.save.ISaveData;
	improt laya.resource.Context;
	public class SaveTransform implements laya.webgl.canvas.save.ISaveData {
		private static var POOL:*;

		public function SaveTransform(){}
		public function isSaveMark():Boolean{}
		public function restore(context:Context):void{}
		public static function save(context:Context):void{}
	}

}
