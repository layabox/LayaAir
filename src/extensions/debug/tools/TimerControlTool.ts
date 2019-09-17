import { Browser } from "laya/utils/Browser"
	/**
	 * 全局时间速率控制类
	 * @author ww
	 */
	export class TimerControlTool 
	{
		
		constructor(){
			
		}
		/**
		 * 获取浏览器当前时间
		 */
		static now():number {
			if (TimerControlTool._timeRate != 1) return TimerControlTool.getRatedNow();
			return Date.now();
		}
		
		static getRatedNow():number
		{
			var dTime:number;
			dTime = TimerControlTool.getNow() - TimerControlTool._startTime;
			return dTime * TimerControlTool._timeRate + TimerControlTool._startTime;
		}
		static getNow():number
		{
			return Date.now();
		}
		private static _startTime:number;
		private static _timeRate:number = 1;

		static _browerNow:any;

		static setTimeRate(rate:number):void
		{
			if (TimerControlTool._browerNow==null) TimerControlTool._browerNow = Browser["now"];
			TimerControlTool._startTime = TimerControlTool.getNow();
			TimerControlTool._timeRate = rate;
			if (rate != 1)
			{
				Browser["now"] = TimerControlTool.now;
			}else
			{
				if(TimerControlTool._browerNow!=null)
					Browser["now"] = TimerControlTool._browerNow;
			}
		}
		
		 static recoverRate():void
		{
			TimerControlTool.setTimeRate(1);
		}
		
	}


