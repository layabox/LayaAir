/*[IF-FLASH]*/
package laya.webgl.canvas.save {
	improt laya.resource.Context;
	public interface ISaveData {
		function isSaveMark():Boolean;
		function restore(context:Context):void;
	}

}
