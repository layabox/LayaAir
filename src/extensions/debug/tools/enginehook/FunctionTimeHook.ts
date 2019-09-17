import { Browser } from "laya/utils/Browser"
import { ClassTool } from "../ClassTool"
import { CountTool } from "../CountTool"
import { FunHook } from "../hook/FunHook"
	/**
	 * ...
	 * @author ww
	 */
	export class FunctionTimeHook 
	{
		 static HookID:number=1;
		constructor(){
			
		}
		 static hookFun(obj:any, funName:string):void
		{
			if (!obj) return;
			if (obj.timeHooked) return;
			var myKey:string;
			FunctionTimeHook.HookID++;
			myKey = ClassTool.getNodeClassAndName(obj)+"."+funName+"():"+FunctionTimeHook.HookID;
			var timePreFun:Function = function(...args):void
			{
				FunctionTimeHook.funBegin(myKey);
			}
			var timeEndFun:Function = function(...args):void
			{
				FunctionTimeHook.funEnd(myKey);
			}
			obj.timeHooked = true;
			FunHook.hook(obj, funName, timePreFun, timeEndFun);
		}
		 static counter:CountTool = new CountTool();
		 static funPre:any = { };
		 static funBegin(funKey:string):void
		{
			FunctionTimeHook.funPre[funKey] = Browser.now();
		}
		 static funEnd(funKey:string):void
		{
			if (!FunctionTimeHook.funPre[funKey]) FunctionTimeHook.funPre[funKey] = 0;
			FunctionTimeHook.counter.add(funKey, Browser.now() - FunctionTimeHook.funPre[funKey]);		
		}
		 static TotalSign:string = "TotalSign";
		 static fresh():void
		{
			FunctionTimeHook.funEnd(FunctionTimeHook.TotalSign);
			FunctionTimeHook.counter.record();
			FunctionTimeHook.funBegin(FunctionTimeHook.TotalSign);
		}
	}


