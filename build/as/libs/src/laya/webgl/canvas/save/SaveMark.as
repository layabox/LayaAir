package laya.webgl.canvas.save {
	import laya.resource.Context;
	import laya.webgl.canvas.save.ISaveData;
	public class SaveMark implements laya.webgl.canvas.save.ISaveData {
		private static var POOL:*;

		public function SaveMark(){}
		public function isSaveMark():Boolean{
			return null;
		}
		public function restore(context:Context):void{}
		public static function Create(context:Context):SaveMark{
			return null;
		}
	}

}
