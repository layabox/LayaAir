/**
 * @private
 * <code>IClone</code> 资源克隆接口。
 */
export interface IClone {
	clone(): any;
	cloneTo(destObject: any): void;
}
