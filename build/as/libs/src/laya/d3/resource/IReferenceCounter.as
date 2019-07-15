/*[IF-FLASH]*/
package laya.d3.resource {
	public interface IReferenceCounter {
		function _getReferenceCount():Number;
		function _addReference(count:Number):void;
		function _removeReference(count:Number):void;
		function _clearReference():void;
	}

}
