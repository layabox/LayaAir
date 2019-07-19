import { EventDispatcher } from "laya/events/EventDispatcher"
import { Accelerator } from "laya/device/motion/Accelerator";
import { BMiniAdapter } from "./BMiniAdapter";
	
	/**@private **/
	export class MiniAccelerator extends EventDispatcher
	{
		
		constructor(){super();

			
		}
		/**@private **/
		 static __init__():void
		{
			try
			{
				var Acc:any;
				Acc = Accelerator;
				if (!Acc) return;
				Acc["prototype"]["on"] = MiniAccelerator["prototype"]["on"];
				Acc["prototype"]["off"] = MiniAccelerator["prototype"]["off"];
			}catch (e)
			{
				
			}
		}
		/**@private **/
		private static _isListening:boolean = false;
		/**@private **/
		private static _callBack:Function;
		/**@private **/
		 static startListen(callBack:Function):void
		{
			MiniAccelerator._callBack = callBack;
			if (MiniAccelerator._isListening) return;
			MiniAccelerator._isListening = true;
			try
			{
				BMiniAdapter.window.swan.onAccelerometerChange(MiniAccelerator.onAccelerometerChange);
			}catch(e){}
			
		}
		
		/**@private **/
		 static stopListen():void
		{
			MiniAccelerator._isListening = false;
			try
			{
				BMiniAdapter.window.swan.stopAccelerometer({});
			}catch(e){}
			
		}
		/**@private **/
		private static onAccelerometerChange(res:any):void
		{
			var e:any;
			e = { };
			e.acceleration = res;
			e.accelerationIncludingGravity = res;
			e.rotationRate = { };
			if (MiniAccelerator._callBack != null)
			{
				MiniAccelerator._callBack(e);
			}
		}
		
		/**
		 * 侦听加速器运动。
		 * @param observer	回调函数接受4个参数，见类说明。
		 */
		/*override*/  on(type:string, caller:any, listener:Function, args:any[] = null):EventDispatcher
		{
			super.on(type, caller, listener, args);
			MiniAccelerator.startListen(this["onDeviceOrientationChange"]);
			return this;
		}
		
		/**
		 * 取消侦听加速器。
		 * @param	handle	侦听加速器所用处理器。
		 */
		/*override*/  off(type:string, caller:any, listener:Function, onceOnly:boolean = false):EventDispatcher
		{
			if (!this.hasListener(type))
				MiniAccelerator.stopListen();
			
			return super.off(type, caller, listener, onceOnly);
		}
	}


