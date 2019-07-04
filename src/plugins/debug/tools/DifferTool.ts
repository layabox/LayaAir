import { ObjectTools } from "./ObjectTools";
///////////////////////////////////////////////////////////
//  DifferTool.as
//  Macromedia ActionScript Implementation of the Class DifferTool
//  Created on:      2015-10-23 上午10:41:50
//  Original author: ww
///////////////////////////////////////////////////////////

/**
	 * 本类用于显示对象值变化过程
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-10-23 上午10:41:50
	 */
	export class DifferTool
	{
		constructor(sign:string="",autoTrace:boolean=true){
		     this.sign=sign;
			 this.autoTrace=autoTrace;
		}
		 autoTrace:boolean=true;
		 sign:string="";
		 obj:any;
		 update(data:any,msg:string=null):any
		{
			if(msg)
			{
				console.log(msg);
			}
			var tObj:any=ObjectTools.copyObj(data);
			if(!this.obj) this.obj={};
			var rst:any;
			rst=ObjectTools.differ(this.obj,tObj);
			this.obj=tObj;
			if(this.autoTrace)
			{
				console.log(this.sign+" differ:");
				ObjectTools.traceDifferObj(rst);
			}
			return rst;
		}
		
		
		private static _differO:any={};
		 static differ(sign:string,data:any,msg:string=null):any
		{
			if(!DifferTool._differO[sign]) DifferTool._differO[sign]=new DifferTool(sign,true);
			var tDiffer:DifferTool;
			tDiffer=DifferTool._differO[sign];
			return tDiffer.update(data,msg);
			
		}
	}

