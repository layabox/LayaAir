/*[IF-FLASH]*/
package {
	/**
	 * @private
	 */
	public var console:Console;
}

/**
 * @private
 * console描述类
 */
class Console {
	/**内存信息*/
	public var memory:Number;
	
	/**
	 * 对输入的表达式进行断言，只有表达式为false时，才输出相应的信息到控制台
	 */
	public function assert(... args):void {
	
	}
	
	/**
	 * 清空控制台信息
	 */
	public function clear(... args):void {
	
	}
	
	/**
	 * 计代码被执行的次数
	 */
	public function count(... args):void {
	
	}
	
	/**
	 * 列出一个对象所有属性
	 */
	public function dir(... args):void {
	
	}
	
	/**
	 * 显示网页的某个节点（node）所包含的html/xml代码
	 */
	public function dirxml(... args):void {
	
	}
	
	/**
	 * 输出一组信息的开头
	 */
	public function group(... args):void {
	
	}
	
	/**
	 * 创建一组默认不展开的日志
	 */
	public function groupCollapsed(... args):void {
	
	}
	
	/**
	 * 结束一组输出信息
	 */
	public function groupEnd(... args):void {
	
	}
	
	/**
	 * 创建性能时间线
	 */
	public function markTimeline(... args):void {
	
	}
	
	/**
	 * 开启性能分析
	 */
	public function profile(... args):void {
	
	}
	
	/**
	 * 结束性能分析
	 */
	public function profileEnd(... args):void {
	
	}
	
	/**
	 * 用表格的方式显示数据
	 */
	public function table(... args):void {
	
	}
	
	/**
	 * 开始计时
	 */
	public function time(... args):void {
	
	}
	
	/**
	 * 结束计时
	 */
	public function timeEnd(... args):void {
	
	}
	
	/**
	 * 添加一条事件到Timeline面板
	 */
	public function timeStamp(... args):void {
	
	}
	
	/**
	 * 开始记录时间线
	 */
	public function timeline(... args):void {
	
	}
	
	/**
	 * 结束时间线
	 */
	public function timelineEnd(... args):void {
	
	}
	
	/**
	 * 一般信息
	 */
	public function info(... arg):void {
		trace(arg);
	}
	
	/**
	 * 日志信息
	 */
	public function log(... arg):void {
		trace(arg);
	}
	
	/**
	 * 调试信息
	 */
	public function debug(... arg):void {
		trace(arg);
	}
	
	/**
	 * 警告信息
	 */
	public function warn(... arg):void {
		trace(arg);
	}
	
	/**
	 * 错误信息
	 */
	public function error(... arg):void {
		trace(arg);
	}
	
	/**
	 * 追踪函数的调用轨迹
	 */
	public function trace(... args):void {
		//trace(arg);
	}
}
