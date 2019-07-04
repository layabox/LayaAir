import { DebugTxt } from "./DebugTxt";
/**
	 * ...
	 * @author ww
	 */
	export class TouchDebugTools 
	{
		
		constructor(){
			
		}
		 static getTouchIDs(events:any[]):any[]
		{
			var rst:any[];
			rst = [];
			var i:number, len:number;
			len = events.length;
			for (i = 0; i < len; i++)
			{
				rst.push(events[i].identifier||0);
			}
			return rst;
		}
		 static traceTouchIDs(msg:string,events:any[]):void
		{
			DebugTxt.dTrace(msg+":"+TouchDebugTools.getTouchIDs(events).join(","));
		}
	}


