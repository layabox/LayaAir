/**
* <code>IReferenceCounter</code> 引用计数器接口。
*/
export interface IReferenceCounter {
	/**获得引用计数 */
	_getReferenceCount(): number;
	/**增加引用计数 */
	_addReference(count: number): void;
	/**删除引用计数*/
	_removeReference(count: number): void;
	/**清除引用计数 */
	_clearReference(): void;
}
