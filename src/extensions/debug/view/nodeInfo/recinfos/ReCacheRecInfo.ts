import { NodeRecInfo } from "./NodeRecInfo";
import { Laya } from "Laya";
import { ClassTool } from "../../../tools/ClassTool"
	/**
	 * ...
	 * @author ww
	 */
	export class ReCacheRecInfo extends NodeRecInfo 
	{
		
		constructor(){
			super();
			this.txt.fontSize = 12;
		}
		 addCount(time:number=0):void
		{
			this.count++;
			this.mTime += time;
			if (!this.isWorking)
			{
				this.working = true;
			}
		}
		 isWorking:boolean = false;
		 count:number;
		 mTime:number = 0;
		 static showTime:number = 3000;
		 updates():void
		{
			if (!this._tar["displayedInStage"])
			{
				this.working = false;
				this.removeSelf();
			}
			this.txt.text = ClassTool.getNodeClassAndName(this._tar)+"\n"+"reCache:" + this.count+"\ntime:"+this.mTime;
			if (this.count > 0)
			{
				
				this.fresh();

				Laya.timer.clear(this, this.removeSelfLater);
			}else
			{
				
				this.working = false;
				Laya.timer.once(ReCacheRecInfo.showTime, this, this.removeSelfLater);
			}
			this.count = 0;
		    this.mTime = 0;
		}
		private removeSelfLater():void
		{
			this.working = false;
			this.removeSelf();
		}
		 set working(v:boolean)
		{
			this.isWorking = v;
			if (v)
			{
				Laya.timer.loop(1000, this, this.updates);
			}else
			{
				Laya.timer.clear(this,this.updates);
			}
		}
	}


