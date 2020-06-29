package laya.webgl.canvas.save {
	import laya.webgl.canvas.save.ISaveData;
	import laya.resource.Context;
	public class SaveTransform implements ISaveData {
		private static var POOL:*;

		public function SaveTransform(){}
		public function isSaveMark():Boolean{
			return null;
		}
		public function restore(context:Context):void{}
		public static function save(context:Context):void{}
	}

}
