import { TraceTool } from "./TraceTool";
///////////////////////////////////////////////////////////
//  CountTool.as
//  Macromedia ActionScript Implementation of the Class CountTool
//  Created on:      2015-9-24 下午6:37:56
//  Original author: ww
///////////////////////////////////////////////////////////

/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-9-24 下午6:37:56
	 */
	export class CountTool
	{
		constructor(){}
		
		data:any = { };
		preO:any = { };
		changeO:any = { };
		count:number;

		reset():void
		{
			this.data={};
			this.count=0;
		}

		add(name:string, num:number=1 ):void
		{
			this.count++;
			if(!this.data.hasOwnProperty(name))
			{
				this.data[name]=0;
			}
			this.data[name]=this.data[name]+num;
		}

		getKeyCount(key:string):number
		{
			if(!this.data.hasOwnProperty(key))
			{
				this.data[key]=0;
			}
			return this.data[key];
		}

		getKeyChange(key:string):number
		{
			if (!this.changeO[key]) return 0;
			return this.changeO[key];
		}

		record():void
		{
			var key:string;
			for (key in this.changeO)
			{
				this.changeO[key] = 0;
			}
			for (key in this.data)
			{
				if (!this.preO[key]) this.preO[key] = 0;
				this.changeO[key] = this.data[key] - this.preO[key];
				this.preO[key]=this.data[key]
			}
		}

		getCount(dataO:any):number
		{
			var rst:number = 0;
			var key:string;
			for (key in dataO)
			{
				rst += dataO[key];
			}
			return rst;
		}

		traceSelf(dataO:any=null):string
		{
			if (!dataO) dataO = this.data;
			var tCount:number;
			tCount = this.getCount(dataO);
			console.log("total:"+tCount);
//			trace(data);
			return "total:"+tCount+"\n"+TraceTool.traceObj(dataO);
		}

		traceSelfR(dataO:any=null):string
		{
			if (!dataO) dataO = this.data;
			var tCount:number;
			tCount = this.getCount(dataO);
			console.log("total:"+tCount);
			//			trace(data);
			return "total:"+tCount+"\n"+TraceTool.traceObjR(dataO);
		}
	}

