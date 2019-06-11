///////////////////////////////////////////////////////////
//  FilterTool.as
//  Macromedia ActionScript Implementation of the Class FilterTool
//  Created on:      2015-10-30 下午1:06:56
//  Original author: ww
///////////////////////////////////////////////////////////

/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-10-30 下午1:06:56
	 */
	export class FilterTool
	{
		constructor(){
		}
		 static getArrByFilter(arr:any[],filterFun:Function):any[]
		{
			var i:number,len:number=arr.length;
			var rst:any[]=[];
			for(i=0;i<len;i++)
			{
				if(filterFun(arr[i])) rst.push(arr[i]);
			}
			return rst;
		}
		
		 static getArr(arr:any[],sign:string,value:any):any[]
		{
			var i:number,len:number=arr.length;
			var rst:any[]=[];
			for(i=0;i<len;i++)
			{
				if(arr[i][sign]==value) rst.push(arr[i]);
			}
			return rst;
		}
		
	}

