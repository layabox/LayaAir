import { Laya } from "Laya";
import { Browser } from "laya/utils/Browser"
import { Timer } from "laya/utils/Timer"

	/**
	 * ...
	 * @author ww
	 */
	export class TimeTool 
	{
		
		constructor(){
			
		}
		
		private static timeDic:any = { };
		
		static getTime(sign:string,update:boolean=true):number
		{
			if (!TimeTool.timeDic[sign])
			{
				TimeTool.timeDic[sign] = 0;
			}
			var tTime:number;
			tTime = Browser.now();
			var rst:number;
			rst = tTime-TimeTool.timeDic[sign];
			TimeTool.timeDic[sign] = tTime;
			return rst;
		}
		
		
		static _deep:number=0;
		static runAllCallLater():void
		{
			if(TimeTool._deep>0) debugger;
			TimeTool._deep++;
			var timer:Timer;
			timer=Laya.timer;
			//处理callLater
			var laters:any[] = timer["_laters"];
			for (var i:number = 0, n:number = laters.length - 1; i <= n; i++) {
				var handler:any = laters[i];
				if(handler)
				{
					handler.method !== null && handler.run(false);
					timer["_recoverHandler"](handler);
				}else
				{
					debugger;
				}
				
				i === n && (n = laters.length - 1);
			}
			laters.length = 0;
			TimeTool._deep--;
		}
		
	}


