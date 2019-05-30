/**
	 * @private
	 * <code>IReferenceCounter</code> 引用计数器接口。
	 */
	export interface IReferenceCounter {
		_getReferenceCount():number;
		_addReference(count:number = 1):void;
		_removeReference(count:number = 1):void;
		_clearReference():void;
	}
