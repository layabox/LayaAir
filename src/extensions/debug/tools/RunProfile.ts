import { CountTool } from "./CountTool";
import { TraceTool } from "./TraceTool";
import { DTrace } from "./DTrace";
///////////////////////////////////////////////////////////
//  CreateProfile.as
//  Macromedia ActionScript Implementation of the Class CreateProfile
//  Created on:      2015-9-25 下午3:31:46
//  Original author: ww
///////////////////////////////////////////////////////////

import { Browser } from "laya/utils/Browser"
	
	/**
	 * 类实例创建分析工具
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-9-25 下午3:31:46
	 */
	export class RunProfile
	{
		constructor(){
		}
		private static infoDic:any={};
		 static run(funName:string,callLen:number=3):void
		{
			var tCount:CountTool;
			if(!RunProfile.infoDic.hasOwnProperty(funName))
			{
				RunProfile.infoDic[funName]=new CountTool();
			}
			tCount=RunProfile.infoDic[funName];
			var msg:string;
			msg=TraceTool.getCallLoc(callLen)+"\n"+TraceTool.getCallStack(1,callLen-3);
			tCount.add(msg);
			if(RunProfile._runShowDic[funName])
			{
				console.log("Create:"+funName);
				console.log(msg);
			}
		}
		
		private static _runShowDic:any={};
		 static showClassCreate(funName:string):void
		{
		        RunProfile._runShowDic[funName]=true;	
		}
		 static hideClassCreate(funName:string):void
		{
			RunProfile._runShowDic[funName]=false;	
		}
		 static getRunInfo(funName:string):CountTool
		{
			var rst:CountTool;
			rst=RunProfile.infoDic[funName];
			if(rst)
			{
				//rst.traceSelfR();
			}
			return RunProfile.infoDic[funName];
		}
		 static runTest(fun:Function,count:number,sign:string="runTest"):void
		{
			DTrace.timeStart(sign);
			var i:number;
			for(i=0;i<count;i++)
			{
				fun();
			}
			DTrace.timeEnd(sign);
		}
		
		 static runTest2(fun:Function,count:number,sign:string="runTest"):number
		{
			var preTime:number;
			preTime = Browser.now();
			var i:number;
			for(i=0;i<count;i++)
			{
				fun();
			}
			return Browser.now() - preTime;
		}
	}

