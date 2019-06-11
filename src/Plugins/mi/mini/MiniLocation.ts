import { KGMiniAdapter } from "././KGMiniAdapter";
import { Laya } from "./../../../../../../core/src/Laya";
import { Browser } from "../../../../../../core/src/laya/utils/Browser"
	/**@private **/
	export class MiniLocation 
	{
		/**@private **/
		private static _watchDic:any = { };
		/**@private **/
		private static _curID:number = 0;
		constructor(){
			
		}
		
		/**@private **/
		 static __init__():void
		{
			KGMiniAdapter.window.navigator.geolocation.getCurrentPosition = MiniLocation.getCurrentPosition;
			KGMiniAdapter.window.navigator.geolocation.watchPosition = MiniLocation.watchPosition;
			KGMiniAdapter.window.navigator.geolocation.clearWatch = MiniLocation.clearWatch;
			
		}
		/**@private **/
		 static getCurrentPosition(success:Function=null, error:Function=null, options:any=null):void
		{
			
			var paramO:any;
			paramO = { };
			paramO.success = getSuccess;
			paramO.fail = error;
			KGMiniAdapter.window.wx.getLocation(paramO);
			function getSuccess(res:any):void
			{
				if (success != null)
				{
					success(res);
				}
			}
		}
		
		/**@private **/
		 static watchPosition(success:Function = null, error:Function = null, options:any = null):number
		{
			MiniLocation._curID++;
			var curWatchO:any;
			curWatchO = { };
			curWatchO.success = success;
			curWatchO.error = error;
			MiniLocation._watchDic[MiniLocation._curID] = curWatchO;
			Laya.timer.loop(1000, null, MiniLocation._myLoop);
			return MiniLocation._curID;
		}
		/**@private **/
		 static clearWatch(id:number):void
		{
			delete MiniLocation._watchDic[id];
			if (!MiniLocation._hasWatch())
			{
				Laya.timer.clear(null, MiniLocation._myLoop);
			}
		}
		/**@private **/
		private static _hasWatch():boolean
		{
			var key:string;
			for (key in MiniLocation._watchDic)
			{
				if (MiniLocation._watchDic[key]) return true;
			}
			return false;
		}
		/**@private **/
		private static _myLoop():void
		{
			MiniLocation.getCurrentPosition(MiniLocation._mySuccess, MiniLocation._myError);
		}
		/**@private **/
		private static _mySuccess(res:any):void
		{
			var rst:any = { };
			rst.coords = res;
			rst.timestamp = Browser.now();
			var key:string;
			for (key in MiniLocation._watchDic)
			{
				if (MiniLocation._watchDic[key].success)
				{
					MiniLocation._watchDic[key].success(rst);
				}
			}
		}
		/**@private **/
		private static _myError(res:any):void
		{
			var key:string;
			for (key in MiniLocation._watchDic)
			{
				if (MiniLocation._watchDic[key].error)
				{
					MiniLocation._watchDic[key].error(res);
				}
			}
		}
	}


