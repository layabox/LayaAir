import { Loader } from "laya/net/Loader"
import { Render } from "laya/renders/Render"
import { Texture } from "laya/resource/Texture"
	/**
	 * ...
	 * @author ww
	 */
	export class ResTools 
	{
		
		constructor(){
			
		}
		 static getCachedResList():any[]
		{
			
			return ResTools.getWebGlResList();
			
		}
		private static getWebGlResList():any[]
		{
			var rst:any[];
			rst = [];
			return rst;
//			var tResource:Resource;
//			var _resources:Array;
//			_resources=ResourceManager.currentResourceManager["_resources"];
//			for(var i:int = 0;i <_resources.length; i++)
//			{
//				tResource = 	_resources[i];
//				//trace(ClassTool.getClassName(tResource));
//				if( ClassTool.getClassName(tResource)=="WebGLImage")
//				{
//					var url:String = tResource["src"];
//					if(url&&url.indexOf("data:image/png;base64")<0)
//					rst.push(url);
//				}
//			}
//			return rst;
		}
		
		private static getCanvasResList():any[]
		{
			var picDic:any;
			picDic = { };
			var dataO:any;
			dataO = Loader.loadedMap;
			ResTools.collectPics(dataO, picDic);
		
			return ResTools.getArrFromDic(picDic);
		}
		private static getArrFromDic(dic:any):any[]
		{

			var key:string;
			var rst:any[];
			rst = [];
			for (key in dic) {
				
				rst.push(key);
			}
			return rst;
		}
		private static collectPics(dataO:any, picDic:any):void
		{
			if (!dataO) return;
			var key:string;
			var tTexture:Texture;
			for (key in dataO)
			{
				tTexture = dataO[key];
				if (tTexture) 
				{
					if (tTexture.bitmap&&(tTexture.bitmap as any).src)
					{
						var url:string = (tTexture.bitmap as any).src;
						if(url.indexOf("data:image/png;base64")<0)
						picDic[(tTexture.bitmap as any).src] = true;
					}
					
				}
			}
		}
	}


