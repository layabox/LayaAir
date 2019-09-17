///////////////////////////////////////////////////////////
//  TraceTool.as
//  Macromedia ActionScript Implementation of the Class TraceTool
//  Created on:      2015-9-25 上午10:48:54
//  Original author: ww
///////////////////////////////////////////////////////////

import { Node } from "laya/display/Node"
import { Sprite } from "laya/display/Sprite"
import { Browser } from "laya/utils/Browser"
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-9-25 上午10:48:54
	 */
	export class TraceTool
	{
		static	_debugtrace:Function;
		constructor(){}
		static closeAllLog():void
		{
			var logFun:Function;
			logFun = TraceTool.emptyLog;
			Browser.window.console.log = logFun;
		}
		static emptyLog():void
		{
			
		}
		static tempArr:any[]=[];
		/**
		 * 打印obj 
		 * @param obj
		 */
		static traceObj(obj:any):string
		{
			TraceTool.tempArr.length = 0;
			var key:string;
			for(key in obj)
			{
				TraceTool.tempArr.push(key+":"+obj[key]);
				//trace(key+":"+obj[key]);
			}
			var rst:string;
			rst = TraceTool.tempArr.join("\n");
			console.log(rst);
			return rst;
		}
		static traceObjR(obj:any):string
		{
			TraceTool.tempArr.length = 0;
			var key:string;
			for(key in obj)
			{
				TraceTool.tempArr.push(obj[key]+":"+key);
				//trace(key+":"+obj[key]);
			}
			var rst:string;
			rst = TraceTool.tempArr.join("\n");
			console.log(rst);
			return rst;
		}
		static traceSize(tar:any):void
		{
			TraceTool._debugtrace("Size: x:"+tar.x+" y:"+tar.y+" w:"+tar.width+" h:"+tar.height+" scaleX:"+tar.scaleX+" scaleY:"+tar.scaleY);
		}
		static traceSplit(msg:string):void
		{
			console.log("---------------------"+msg+"---------------------------");
		}
		static group(gName:any):void
		{
			console.group(gName);
		}
		static groupEnd():void
		{
			console.groupEnd();
		}
		/**
		 *  在js中可打印调用堆栈 
		 * @param life 打印堆栈的深度
		 */
		static getCallStack(life:number=1,s:number=1):string
		{
			var caller:any;
			caller=TraceTool.getCallStack;
			caller=caller.caller.caller;
			var msg:string;
			msg="";
			while(caller&&life>0)
			{
				if(s<=0)
				{
					msg += caller + "<-";
					life--;
				}else
				{
					
				}
				caller = caller.caller;
				s--;
			}
			return msg;
		}

		static Erroer:any = null;
		static getCallLoc(index:number=2):string
		{
			var loc:string;
			try {
				TraceTool.Erroer.i++;
			} catch (e) {
				var arr:any[];
				arr = (this as any).e.stack.replace(/Error\n/).split(/\n/);
				if (arr[index])
				{
					loc= arr[index].replace(/^\s+|\s+$/, "");
				}else
				{
					loc = "unknow";
				}
				// loc= e.stack.replace(/Error\n/).split(/\n/)[index].replace(/^\s+|\s+$/, "");
			}
			return loc;
		}
		
		static traceCallStack():string
		{
			var loc:string;
			try {
				TraceTool.Erroer.i++;
			} catch (e) {
				 loc= (this as any).e.stack;
			}
			
			console.log(loc);
			return loc;
		}
		private static holderDic:any={};
		static getPlaceHolder(len:number):string
		{
			if(!TraceTool.holderDic.hasOwnProperty(len))
			{
				var rst:string;
				rst="";
				var i:number;
				for(i=0;i<len;i++)
				{
					rst+="-";
				}		
				TraceTool.holderDic[len]=rst;
			}		
			return TraceTool.holderDic[len];
		}
		static traceTree(tar:Node,depth:number=0,isFirst:boolean=true):void
		{
			if(isFirst)
			{
				console.log("traceTree");
			}
			if(!tar) return;
			var i:number;
			var len:number;
			//trace(getPlaceHolder(depth*2)+"->",tar);
			if(tar.numChildren<1)
			{
				console.log(tar);
				return;
			}
			TraceTool.group(tar);
			len=tar.numChildren;
			depth++;
			for(i=0;i<len;i++)
			{
				TraceTool.traceTree(tar.getChildAt(i),depth,false);
			}
			TraceTool.groupEnd();
		}
		static getClassName(tar:any):string
		{
			return tar["constructor"].name;
		}
		static traceSpriteInfo(tar:Sprite,showBounds:boolean=true,showSize:boolean=true,showTree:boolean=true):void
		{
			if(!(tar instanceof Sprite)) 
			{
				console.log("not Sprite");
				return;
			}
			if(!tar) 
			{
				console.log("null Sprite");
				return;
			}
			TraceTool.traceSplit("traceSpriteInfo");
//			trace("Sprite:"+tar.name);
			TraceTool._debugtrace(TraceTool.getClassName(tar)+":"+tar.name);
			if(showTree)
			{
				TraceTool.traceTree(tar);
			}else
			{
				console.log(tar);
			}
//			trace(tar);
//			traceTree(tar);
			if(showSize)
			{
				TraceTool.traceSize(tar);
			}
			if(showBounds)
			{
				console.log("bounds:"+tar.getBounds());
			}
		}
	}

