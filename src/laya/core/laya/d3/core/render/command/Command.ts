import { CommandBuffer } from "././CommandBuffer";
import { Camera } from "../../Camera"
	
	/**
	 * @private
	 * <code>Command</code> 类用于创建指令。
	 */
	export class Command {
		/**@private */
		private _commandBuffer:CommandBuffer = null;
		
		/**
		 * 创建一个 <code>Command</code> 实例。
		 */
		constructor(){
		
		}
		
		/**
		 *@private
		 */
		 run():void {
		
		}
		
		/**
		 *@private
		 */
		 recover():void {
			this._commandBuffer = null;
		}
	
	}


