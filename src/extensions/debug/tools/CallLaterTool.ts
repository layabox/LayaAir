import { Laya } from "Laya";
///////////////////////////////////////////////////////////
//  CallLaterTool.as
//  Macromedia ActionScript Implementation of the Class CallLaterTool
//  Created on:      2017-3-2 下午12:11:59
//  Original author: ww
///////////////////////////////////////////////////////////
import { Timer } from "laya/utils/Timer"
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2017-3-2 下午12:11:59
	 */
	export class CallLaterTool
	{
		constructor(){
		}
		 static initCallLaterRecorder():void
		{
			if(CallLaterTool.oldCallLater) return;
			CallLaterTool.oldCallLater=Laya.timer["callLater"];
			Laya.timer["callLater"]=CallLaterTool["prototype"]["callLater"];
		}
		
		private static _recordedCallLaters:any[]=[];
		private static _isRecording:boolean=false;
		 static beginRecordCallLater():void
		{
			CallLaterTool.initCallLaterRecorder();
			CallLaterTool._isRecording=true;
		}
		 static runRecordedCallLaters():void
		{
			CallLaterTool._isRecording=false;
			var timer:Timer;
			timer=Laya.timer;
			//处理callLater
			var laters:any[] = timer["_laters"];
			laters=CallLaterTool._recordedCallLaters;
			for (var i:number = 0, n:number = laters.length - 1; i <= n; i++) {
				var handler:any = laters[i];
				if(CallLaterTool._recordedCallLaters.indexOf(handler)<0) continue;
				handler.method !== null && handler.run(false);
				timer["_recoverHandler"](handler);
				laters.splice(i,1);
			}
			CallLaterTool._recordedCallLaters.length=0;
			
		}
		
		 _getHandler:Function;
		 _indexHandler:Function;
		 _pool:any[];
		 _laters:any[];
		
		 static oldCallLater:Function;
		
		/**
		 * 延迟执行。
		 * @param	caller 执行域(this)。
		 * @param	method 定时器回调函数。
		 * @param	args 回调参数。
		 */
		 callLater(caller:any, method:Function, args:any[] = null):void {
			if (this._getHandler(caller, method) == null) {
				CallLaterTool.oldCallLater.call(this,caller,method,args);
				if(CallLaterTool._isRecording)
				{
					CallLaterTool._recordedCallLaters.push(this._laters[this._laters.length-1]);
				}
				
			}
		}
	}

