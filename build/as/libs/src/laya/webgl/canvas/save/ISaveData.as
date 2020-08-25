package laya.webgl.canvas.save {
	import laya.resource.Context;
	public interface ISaveData {
		function isSaveMark():Boolean;
		function restore(context:Context):void;
	}

}
