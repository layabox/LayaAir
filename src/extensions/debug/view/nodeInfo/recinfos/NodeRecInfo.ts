import { DebugConsts } from "../../../tools/DebugConsts"
import { Sprite } from "laya/display/Sprite"
import { Text } from "laya/display/Text"
import { GrahamScan } from "laya/maths/GrahamScan"
import { Rectangle } from "laya/maths/Rectangle"
import { WalkTools } from "../../../tools/WalkTools"
	/**
	 * ...
	 * @author ww
	 */
	export class NodeRecInfo extends Sprite
	{
		
	     txt:Text;
		constructor(){
			super();
			this.txt = new Text();
			this.txt.color = "#ff0000";
			this.txt.bgColor = "#00ff00";
			this.txt.fontSize = 12;
			this.addChild(this.txt);
		}
		 setInfo(str:string):void
		{
			this.txt.text = str;
		}
		protected _tar:Sprite;
		 recColor:string = "#00ff00";
		 setTarget(tar:Sprite):void
		{
			this._tar = tar;
		}
		private static _disBoundRec:Rectangle=new Rectangle();
		 showInfo(node:Sprite):void
		{
			
			this._tar = node;
			if (!node) return;
			if(node.destroyed) return;
		
			this.graphics.clear();
			
			var pointList:any[];
			pointList=(node as any)._getBoundPointsM(true);
			if(!pointList||pointList.length<1) return;
			pointList=GrahamScan.pListToPointList(pointList,true);	
			WalkTools.walkArr(pointList,node.localToGlobal,node);	
			pointList=GrahamScan.pointListToPlist(pointList);
			NodeRecInfo._disBoundRec=(Rectangle as any)._getWrapRec(pointList,NodeRecInfo._disBoundRec);
			this.graphics.drawRect(0, 0, NodeRecInfo._disBoundRec.width, NodeRecInfo._disBoundRec.height, null, DebugConsts.RECACHE_REC_COLOR,2);
			this.pos(NodeRecInfo._disBoundRec.x, NodeRecInfo._disBoundRec.y);
		}
		 fresh():void
		{
			this.showInfo(this._tar);
		}
		 clearMe():void
		{
			this._tar = null;
		}
	}


