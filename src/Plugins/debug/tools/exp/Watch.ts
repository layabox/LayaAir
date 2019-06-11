///////////////////////////////////////////////////////////
//  Watch.as
//  Macromedia ActionScript Implementation of the Class Watch
//  Created on:      2015-10-26 上午9:48:18
//  Original author: ww
///////////////////////////////////////////////////////////

/**
	 * 本类调用原生watch接口，仅火狐有效
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-10-26 上午9:48:18
	 */
	export class Watch
	{
		constructor(){
		}
		 static watch(obj:any,name:string,callBack:Function):void
		{
			obj.watch(name,callBack);
		}
		 static unwatch(obj:any,name:string,callBack:Function):void
		{
			obj.unwatch(name,callBack);
		}
	}

