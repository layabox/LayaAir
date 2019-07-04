import { TraceTool } from "./TraceTool";
///////////////////////////////////////////////////////////
//  DTrace.as
//  Macromedia ActionScript Implementation of the Class DTrace
//  Created on:      2015-9-28 上午10:39:47
//  Original author: ww
///////////////////////////////////////////////////////////

/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-9-28 上午10:39:47
	 */
	export class DTrace
	{
		constructor(){
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
			arg=DTrace.getArgArr(arg);
			arg.push(TraceTool.getCallLoc(2));
			console.log.apply(console,arg);
			var str:string;
			str=arg.join(" ");
			
		}
		/**
		 * 开始计时 
		 * @param sign
		 */
		 static timeStart(sign:string):void
		{
			console.time(sign);;
		}
		/**
		 * 结束计时 
		 * @param sign
		 */
		 static timeEnd(sign:string):void
		{
			console.timeEnd(sign);;
		}
		 static traceTable(data:any[]):void
		{
			console.table(data);;
		}
	}

