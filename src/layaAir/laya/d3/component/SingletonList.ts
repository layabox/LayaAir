import { ISingletonElement } from "../../resource/ISingletonElement"
	
/**
 * <code>SingletonList</code> 类用于实现单例队列。
 */
export class SingletonList {
	/**@private [只读]*/
		elements:ISingletonElement[] = [];
	/** @private [只读]*/
		length:number = 0;
	
	/**
	 * 创建一个新的 <code>SingletonList</code> 实例。
	 */
	constructor(){
	}
	
	/**
	 * @private
	 */
	protected _add(element:any):void {
		if (this.length === this.elements.length)
			this.elements.push(element);
		else
			this.elements[this.length] = element;
	}

}


