package laya.html.utils {
	
	/**
	 * @private
	 *  <code>ILayout</code> 类是显示对象的布局接口。
	 */
	public interface ILayout {
		function get x():Number;
		function set x(value:Number):void;
		function get y():Number;
		function set y(value:Number):void;
		function get width():Number;
		function get height():Number;
		function _isChar():Boolean;
		function _getCSSStyle():HTMLStyle;
	}
}