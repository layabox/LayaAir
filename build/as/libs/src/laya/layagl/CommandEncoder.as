package laya.layagl {

	/**
	 * @private CommandEncoder
	 */
	public class CommandEncoder {

		public function CommandEncoder(layagl:* = undefined,reserveSize:Number = undefined,adjustSize:Number = undefined,isSyncToRenderThread:Boolean = undefined){}
		public function getArrayData():Array{
			return null;
		}
		public function getPtrID():Number{
			return null;
		}
		public function beginEncoding():void{}
		public function endEncoding():void{}
		public function clearEncoding():void{}
		public function getCount():Number{
			return null;
		}
		public function add_ShaderValue(o:*):void{}
		public function addShaderUniform(one:*):void{}
	}

}
