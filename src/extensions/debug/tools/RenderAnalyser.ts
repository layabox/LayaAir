import { IDTools } from "./IDTools";
import { ObjectTools } from "./ObjectTools";
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite"
import { NodeConsts } from "../view/nodeInfo/NodeConsts"
	/**
	 * ...
	 * @author ww
	 */
	export class RenderAnalyser 
	{
		
		constructor(){
			this.working = true;
		}
		
		private static _instance:RenderAnalyser;
		static get I():RenderAnalyser{
			if(!RenderAnalyser._instance){
				RenderAnalyser._instance = new RenderAnalyser();
			}
			return RenderAnalyser._instance;
		}
		static set I(value){
			RenderAnalyser._instance = value;
		}
		
		render(sprite:Sprite, time:number):void
		{
			this.addTime(sprite, time);
		}
		 timeDic:any = { };
		 resultDic:any = { };
		
		 countDic:any = { };
		 resultCountDic:any = { };
		 nodeDic:any = { };
		 addTime(sprite:Sprite, time:number):void
		{
			IDTools.idObj(sprite);
			var key:number;
			key = IDTools.getObjID(sprite);
		    if (!this.timeDic.hasOwnProperty(key))
			{
				this.timeDic[key] = 0;
			}
			this.timeDic[key] = this.timeDic[key] + time;
			if (!this.countDic.hasOwnProperty(key))
			{
				this.countDic[key] = 0;
			}
			this.countDic[key] = this.countDic[key] +1;
			this.nodeDic[key] = sprite;
		}
		 getTime(sprite:Sprite):number
		{
			IDTools.idObj(sprite);
			var key:number;
			key = IDTools.getObjID(sprite);
			if (!this.resultDic[key]) return 0;
			return this.resultDic[key];
		}
		 getCount(sprite:Sprite):number
		{
			IDTools.idObj(sprite);
			var key:number;
			key = IDTools.getObjID(sprite);
			return this.resultCountDic[key];
		}
		 reset():void
		{
			var key:string;
			for (key in this.timeDic)
			{
				this.timeDic[key] = 0;
				this.countDic[key] = 0;
			}
			ObjectTools.clearObj(this.nodeDic);
		}
		 isWorking:boolean = false;
		 updates():void
		{
			ObjectTools.clearObj(this.resultDic);
			ObjectTools.insertValue(this.resultDic, this.timeDic);
			ObjectTools.clearObj(this.resultCountDic);
			ObjectTools.insertValue(this.resultCountDic, this.countDic);
			this.reset();
		}
		 set working(v:boolean)
		{
			this.isWorking = v;
			if (v)
			{
				Laya.timer.loop(NodeConsts.RenderCostMaxTime, this, this.updates);
			}else
			{
				Laya.timer.clear(this,this.updates);
			}
		}
	}


