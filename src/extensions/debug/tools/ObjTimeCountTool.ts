import { IDTools } from "./IDTools";
import { ObjectTools } from "./ObjectTools";
import { Sprite } from "laya/display/Sprite"
	/**
	 * ...
	 * @author ww
	 */
	export class ObjTimeCountTool 
	{
		
		constructor(){
			
		}
		 timeDic:any = { };
		 resultDic:any = { };
		
		 countDic:any = { };
		 resultCountDic:any = { };
		 nodeDic:any = { };
		 resultNodeDic:any = { };
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
		 updates():void
		{
			ObjectTools.clearObj(this.resultDic);
			ObjectTools.insertValue(this.resultDic, this.timeDic);
			ObjectTools.clearObj(this.resultCountDic);
			ObjectTools.insertValue(this.resultCountDic, this.countDic);
			ObjectTools.insertValue(this.resultNodeDic, this.nodeDic);
			this.reset();
		}
	}


