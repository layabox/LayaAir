import { IClone } from "../core/IClone"
	
	/**
	 * <code>DefineDatas</code> 类用于创建宏定义数据。
	 */
	export class DefineDatas implements IClone {
		/** @private */
		 value:number;
		
		/**
		 * 创建一个 <code>DefineDatas</code> 实例。
		 */
		constructor(){
			
			this.value = 0;
		}
		
		/**
		 * @private
		 */
		 add(define:number):void {
			this.value |= define;
		}
		
		/**
		 * @private
		 */
		 remove(define:number):void {
			this.value &= ~define;
		}
		
		/**
		 * @private
		 */
		 has(define:number):boolean {
			return (this.value & define) > 0;
		}
		
		/**
		 * 克隆。
		 * @param	destObject 克隆源。
		 */
		 cloneTo(destObject:any):void {
			var destDefineData:DefineDatas = (<DefineDatas>destObject );
			destDefineData.value = this.value;
		}
		
		/**
		 * 克隆。
		 * @return	 克隆副本。
		 */
		 clone():any {
			var dest:DefineDatas = new DefineDatas();
			this.cloneTo(dest);
			return dest;
		}
	}


