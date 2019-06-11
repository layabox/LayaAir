import { Watcher } from "././Watcher";
///////////////////////////////////////////////////////////
//  DebugExport.as
//  Macromedia ActionScript Implementation of the Class DebugExport
//  Created on:      2015-10-31 下午3:35:16
//  Original author: ww
///////////////////////////////////////////////////////////

import { Browser } from "../../../../../../core/src/laya/utils/Browser"
	import { DebugTool } from "../DebugTool"
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-10-31 下午3:35:16
	 */
	export class DebugExport
	{
		constructor(){
		}
		private static _exportsDic:any=
			{
				"DebugTool":DebugTool,
				"Watcher":Watcher
			};
		 static export():void
		{
			var _window:any;
			_window=window;;
			var key:string;
			for(key in DebugExport._exportsDic)
			{
				_window[key]=DebugExport._exportsDic[key];
			}
		}
	}

