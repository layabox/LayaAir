/*[IF-FLASH]*/
package laya.utils {
	public class IStatRender {
		public function show(x:Number = null,y:Number = null):void{}
		public function enable():void{}
		public function hide():void{}
		public function set_onclick(fn:Function):void{}
		public function isCanvasRender():Boolean{}
		public function renderNotCanvas(ctx:*,x:Number,y:Number):void{}
	}

}
