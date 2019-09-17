import { ObjTimeCountTool } from "./ObjTimeCountTool";
import { IDTools } from "./IDTools";
import { DebugConsts } from "./DebugConsts";
import { DebugTool } from "../DebugTool"
import { Sprite } from "laya/display/Sprite"
import { DebugInfoLayer } from "../view/nodeInfo/DebugInfoLayer"
import { ReCacheRecInfo } from "../view/nodeInfo/recinfos/ReCacheRecInfo"
	/**
	 * ...
	 * @author ww
	 */
	export class CacheAnalyser 
	{
		
		constructor(){
			
		}
		static renderLoopBegin():void
		{
			DebugInfoLayer.I.cacheViewLayer.graphics.clear();
		}
		static counter:ObjTimeCountTool = new ObjTimeCountTool();

		
		private static _instance:CacheAnalyser;
		static get I():CacheAnalyser{
			if(!CacheAnalyser._instance){
				CacheAnalyser._instance = new CacheAnalyser();
			}
			return CacheAnalyser._instance;
		}
		static set I(value){
			CacheAnalyser._instance = value;
		}

		private static _nodeInfoDic:any = { };
		static showCacheSprite:boolean = false;
		static showRecacheSprite:boolean = true;
		static getNodeInfoByNode(node:Sprite):ReCacheRecInfo
		{
			IDTools.idObj(node);
			var key:number;
			key = IDTools.getObjID(node);
			if (!CacheAnalyser._nodeInfoDic[key])
			{
				CacheAnalyser._nodeInfoDic[key] = new ReCacheRecInfo();
			}
			((<ReCacheRecInfo>CacheAnalyser._nodeInfoDic[key] )).setTarget(node);
			return CacheAnalyser._nodeInfoDic[key];
		}
		renderCanvas(sprite:Sprite,time:number=0):void
		{
			if (!CacheAnalyser.showCacheSprite) return;
			if (DebugInfoLayer.I.isDebugItem(sprite)) return;
			DebugTool.showDisBoundToSprite(sprite, DebugInfoLayer.I.cacheViewLayer, DebugConsts.CANVAS_REC_COLOR, 4);
		}
		reCacheCanvas(sprite:Sprite,time:number=0):void
		{
			if (!CacheAnalyser.showRecacheSprite) return;
			if (DebugInfoLayer.I.isDebugItem(sprite)) return;
			var info:ReCacheRecInfo;
			info = CacheAnalyser.getNodeInfoByNode(sprite);
			info.addCount(time);
			CacheAnalyser.counter.addTime(sprite, time);
			if (!info.parent)
			{
				DebugInfoLayer.I.nodeRecInfoLayer.addChild(info);
			}
		}
	}


