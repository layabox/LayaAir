import { Laya } from "Laya";
import { Base64ImageTool } from "./Base64ImageTool";
import { ObjectTools } from "./ObjectTools";
import { Loader } from "laya/net/Loader"
	import { Texture } from "laya/resource/Texture"
	import { Handler } from "laya/utils/Handler"
	/**
	 * ...
	 * @author ww
	 */
	export class Base64Atlas 
	{
		 data:any;
		 replaceO:any;
		 idKey:string;
		constructor(data:any,idKey:string=null){
			this.data = data;
			if (!idKey) idKey = Math.random() + "key";
			this.idKey = idKey;
			this.init();
			//preLoad();
		}
		private init():void
		{
			this.replaceO = { };
			var key:string;
			for (key in this.data)
			{
				this.replaceO[key] = this.idKey + "/" + key;
			}
		}
		 getAdptUrl(url:string):string
		{
			return this.replaceO[url];
		}
		private _loadedHandler:Handler;
	     preLoad(completeHandler:Handler=null):void
		{
			this._loadedHandler = completeHandler;
			Laya.loader.load(Base64ImageTool.getPreloads(this.data),new Handler(this,this.preloadEnd));
		}
		private preloadEnd():void
		{
			var key:string;
			for (key in this.data)
			{
				var tx:Texture;
				tx = Laya.loader.getRes(this.data[key]);
				Loader.cacheRes(this.replaceO[key], tx);
				//trace("cacheRes:",replaceO[key],tx);
			}
			if (this._loadedHandler)
			{
				this._loadedHandler.run();
			}
		}
		 replaceRes(uiObj:any):void
		{
			ObjectTools.replaceValue(uiObj, this.replaceO);
		}
		
	}


