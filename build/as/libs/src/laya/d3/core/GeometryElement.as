/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.resource.IDestroy;
	public class GeometryElement implements laya.resource.IDestroy {
		public function get destroyed():Boolean{};

		public function GeometryElement(){}
		public function _getType():Number{}
		public function destroy():void{}
	}

}
