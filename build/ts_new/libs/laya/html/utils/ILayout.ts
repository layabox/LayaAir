import { HTMLStyle } from "./HTMLStyle";
/**
	 * @private
	 *  <code>ILayout</code> 类是显示对象的布局接口。
	 */
export interface ILayout {
    x: number;
    /*function set x(value:Number):void;*/
    y: number;
    /*function set y(value:Number):void;*/
    width: number;
    height: number;
    /**@internal */
    _isChar(): boolean;
    /**@internal */
    _getCSSStyle(): HTMLStyle;
}
