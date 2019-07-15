/*[IF-FLASH]*/
package laya.webgl.canvas.save {
	improt laya.resource.Context;
	improt laya.webgl.canvas.save.ISaveData;
	public class SaveMark implements laya.webgl.canvas.save.ISaveData {
		private static var POOL:*;

		public function SaveMark(){}
		public function isSaveMark():Boolean{}
		public function restore(context:Context):void{}
		public static function Create(context:Context):SaveMark{}
	}

}
