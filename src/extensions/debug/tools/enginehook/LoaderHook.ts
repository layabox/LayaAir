import { Laya } from "Laya";
import { Event } from "laya/events/Event"
import { LoaderManager } from "laya/net/LoaderManager"
import { LocalStorage } from "laya/net/LocalStorage"
import { Handler } from "laya/utils/Handler"
	/**
	 * ...
	 * @author ww
	 */
	export class LoaderHook extends LoaderManager
	{
		
		constructor(){super();

			
		}
		private static preFails:any = { };
		private static nowFails:any = { };
		 static enableFailDebugger:boolean = true;
		 static FailSign:string = "LoadFailItems";
		 static isInited:boolean = false;
		 static init():void
		{	
			if (LoaderHook.isInited) return;
			LoaderHook.isInited = true;
			Laya.loader = new LoaderHook();
			Laya.loader.on(Event.ERROR, null, LoaderHook.onFail);
			LoaderHook.preFails = LocalStorage.getJSON(LoaderHook.FailSign);
			if (!LoaderHook.preFails) LoaderHook.preFails = { };
			
		}
		
		private static onFail(failFile:string):void
		{
            LoaderHook.nowFails[failFile] = true;
			LocalStorage.setJSON(LoaderHook.FailSign, LoaderHook.nowFails);
		}
		 static resetFails():void
		{
			LoaderHook.nowFails= {};
			LocalStorage.setJSON(LoaderHook.FailSign, LoaderHook.nowFails);
		}
		 checkUrls(url:any):void
		{
			var tarUrl:string;
			if (typeof(url) == 'string')
			{
				tarUrl = url;
			}else
			{
				tarUrl = url.url;
			}
			if (LoaderHook.preFails[tarUrl])
			{
				
				if (LoaderHook.enableFailDebugger)
				{
					debugger;
				}
			}
		}
		 chekUrlList(urls:any[]):void
		{
			var i:number, len:number;
			len = urls.length;
			for (i = 0; i < len; i++)
			{
				this.checkUrls(urls[i]);
			}
		}
		
		/*override*/  load(url:any, complete:Handler=null, progress:Handler=null, type:string=null, priority:number=1, cache:boolean=true, group:string=null, ignoreCache:boolean=false, useWorkerLoader:boolean=false):LoaderManager
		{
			if (url instanceof Array)
			{
				this.chekUrlList((<any[]>url ));
			}else
			{
				this.checkUrls(url);
			}
			return super.load(url, complete, progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
		}
		
		
	}


