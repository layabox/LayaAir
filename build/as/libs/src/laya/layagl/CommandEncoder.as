/*[IF-FLASH]*/
package laya.layagl {
	public class CommandEncoder {

		public function CommandEncoder(layagl:*,reserveSize:Number,adjustSize:Number,isSyncToRenderThread:Boolean){}
		public function getArrayData():Array{}
		public function getPtrID():Number{}
		public function beginEncoding():void{}
		public function endEncoding():void{}
		public function clearEncoding():void{}
		public function getCount():Number{}
		public function add_ShaderValue(o:*):void{}
		public function addShaderUniform(one:*):void{}
	}

}
