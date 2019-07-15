/*[IF-FLASH]*/
package laya.d3 {
	improt laya.d3.math.Vector2;
	improt laya.resource.ISingletonElement;
	public class Touch implements laya.resource.ISingletonElement {
		private var _indexInList:*;
		public function get identifier():Number{};
		public function get position():Vector2{};
		public function _getIndexInList():Number{}
		public function _setIndexInList(index:Number):void{}
	}

}
