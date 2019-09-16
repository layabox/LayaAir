import { Laya } from "Laya";
import { Text } from "laya/display/Text"
	/**
	 * ...
	 * @author ww
	 */
	export class DebugTxt 
	{
		
		constructor(){
			
		}
		 static _txt:Text;
		 static I:DebugTxt;
		 static init():void
		{
			if (DebugTxt._txt) return;
			DebugTxt._txt = new Text();
			DebugTxt._txt.pos(100, 100);
			DebugTxt._txt.color = "#ff00ff";
			DebugTxt._txt.zOrder = 999;
			DebugTxt._txt.fontSize = 24;
			DebugTxt._txt.text = "debugTxt inited";
			Laya.stage.addChild(DebugTxt._txt);
		}
		 static getArgArr(arg:any[]):any[]
		{
			var rst:any[];
			rst=[];
			var i:number,len:number=arg.length;
			
			for(i=0;i<len;i++)
			{
				rst.push(arg[i]);
			}
			return rst;
		}
		 static dTrace(...arg):void
		{
			arg=DebugTxt.getArgArr(arg);
			//arg.push(TraceTool.getCallLoc(2));
			//__JS__("console.log.apply(console,arg)");
			var str:string;
			str=arg.join(" ");
			if (DebugTxt._txt)
			{
				DebugTxt._txt.text = str + "\n" + DebugTxt._txt.text;
			}
		}
		private static getTimeStr():string
		{
			var dateO:any= new Date();
			return dateO.toTimeString();
		}
		 static traceTime(msg:string):void
		{
			DebugTxt.dTrace(DebugTxt.getTimeStr());
			DebugTxt.dTrace(msg);
		}
		 static show(...arg):void
		{
			arg=DebugTxt.getArgArr(arg);
			//arg.push(TraceTool.getCallLoc(2));
			//__JS__("console.log.apply(console,arg)");
			var str:string;
			str=arg.join(" ");
			if (DebugTxt._txt)
			{
				DebugTxt._txt.text = str;
			}
		}
	}


