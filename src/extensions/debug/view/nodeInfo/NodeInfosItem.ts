import { DebugInfoLayer } from "./DebugInfoLayer";
import { Laya } from "Laya";
import { GrahamScan } from "laya/maths/GrahamScan"
import { Point } from "laya/maths/Point"
import { Pool } from "laya/utils/Pool"
import { ClassTool } from "../../tools/ClassTool"
import { DisControlTool } from "../../tools/DisControlTool"
import { IDTools } from "../../tools/IDTools"
import { WalkTools } from "../../tools/WalkTools"
import { Sprite } from "laya/display/Sprite";
import { Rectangle } from "laya/maths/Rectangle";
import { Graphics } from "laya/display/Graphics";
import { Text } from "laya/display/Text";
import { Node } from "laya/display/Node";
	/**
	 * ...
	 * @author ww
	 */
	export class NodeInfosItem extends Sprite
	{
		 static NodeInfoContainer:DebugInfoLayer;
		 static init():void
		{
			if (!NodeInfosItem.NodeInfoContainer)
			{
				DebugInfoLayer.init();
				NodeInfosItem.NodeInfoContainer = DebugInfoLayer.I;
				Laya.stage.addChild(NodeInfosItem.NodeInfoContainer);
			}
		
		}
		constructor(){
			super();
			this._infoTxt = new Text();
			this._infoTxt.color = "#ff0000";
			this._infoTxt.bgColor = "#00ff00";
			this._infoTxt.fontSize = 12;
			//addChild(_infoTxt);
		}
		
		private _infoTxt:Text;
		 static showValues:any[] = ["x", "y", "scaleX", "scaleY","width","height","visible", "mouseEnabled"];
		
		private static _nodeInfoDic:any = { };
		 static getNodeInfoByNode(node:Sprite):NodeInfosItem
		{
			IDTools.idObj(node);
			var key:number;
			key = IDTools.getObjID(node);
			if (!NodeInfosItem._nodeInfoDic[key])
			{
				NodeInfosItem._nodeInfoDic[key] = new NodeInfosItem();
			}
			return NodeInfosItem._nodeInfoDic[key];
		}
		 static hideAllInfos():void
		{
			var key:string;
			var tInfo:NodeInfosItem;
			for (key in NodeInfosItem._nodeInfoDic)
			{
				tInfo = NodeInfosItem._nodeInfoDic[key];
				tInfo.removeSelf();
			}
			NodeInfosItem.clearRelations();
		}
		
		removeSelf():Node 
		{
			this._infoTxt.removeSelf();
			return super.removeSelf();
		}
		
		showToUI():void
		{
			NodeInfosItem.NodeInfoContainer.nodeRecInfoLayer.addChild(this);
			
			
			this._infoTxt.removeSelf();
			
			NodeInfosItem.NodeInfoContainer.txtLayer.addChild(this._infoTxt);
			this.findOkPos();
			
			
		}
		 randomAPos(r:number):void
		{
			//var angle:Number;
			//angle = Math.random() * 360/Math.PI;
			//_infoTxt.x = this.x + r * Math.sin(angle);
			//_infoTxt.y = this.y + r * Math.cos(angle);
			
			this._infoTxt.x = this.x + Laya.stage.width*Math.random();
			this._infoTxt.y = this.y + r *  Math.random();
		}
		 findOkPos():void
		{
			var len:number;
			len = 20;
			this.randomAPos(len);
			return;
			var count:number;
			count = 1;
			while (!this.isPosOk())
			{
				count++;
				if (count >= 500)
				{
					len += 10;
					count = 0;
				}
				this.randomAPos(len);
			}
		}
		 isPosOk():boolean
		{
			var tParent:Sprite;
			tParent = NodeInfosItem.NodeInfoContainer.nodeRecInfoLayer;
			var i:number, len:number;
			var cList:any[];
			cList = (tParent as any)._children;
			len = cList.length;
			var tChild:Sprite;
			var mRec:Rectangle;
			mRec = this._infoTxt.getBounds();
			if (mRec.x < 0) return false;
			if (mRec.y < 0) return false;
			if (mRec.right > Laya.stage.width) return false;
			//if (mRec.bottom > Laya.stage.height) return false;
			for (i = 0; i < len; i++)
			{
				tChild = cList[i];
				if (tChild == this._infoTxt) continue;
				if (mRec.intersects(tChild.getBounds())) return false;
			}
			return true;
		}
		private static _disBoundRec:Rectangle=new Rectangle();
		
		 static showNodeInfo(node:Sprite):void
		{
			var nodeInfo:NodeInfosItem;
			nodeInfo = NodeInfosItem.getNodeInfoByNode(node);
			nodeInfo.showInfo(node);		
		    nodeInfo.showToUI();
		}
		 static showDisInfos(node:Sprite):void
		{
			var _node:Sprite;
	        _node = node;
			if (!node)
				return;
			while (node)
			{
				NodeInfosItem.showNodeInfo(node);
				node = (<Sprite>node.parent );
			}
			DisControlTool.setTop(NodeInfosItem.NodeInfoContainer);
			NodeInfosItem.apdtTxtInfoPoss(_node);
			NodeInfosItem.updateRelations();
		}
		 static apdtTxtInfoPoss(node:Sprite):void
		{
			var disList:any[];
			disList = [];
		    while (node)
			{
				disList.push(node);
				node = (<Sprite>node.parent );
			}
			var i:number, len:number;
			var tInfo:NodeInfosItem;
			var tTxt:Text;
			len = disList.length;
			var xPos:number;
			xPos = Laya.stage.width - 150;
			var heightLen:number;
			heightLen = 100;
			node = disList[0];
			if (node)
			{
				tInfo = NodeInfosItem.getNodeInfoByNode(node);
				if (tInfo)
				{
					
					tTxt = tInfo._infoTxt;
					xPos = Laya.stage.width - tTxt.width - 10;
					heightLen = tTxt.height + 10;
					//trace("rePos:",node,tTxt,xPos, heightLen * i );
				}
			}
			disList = disList.reverse();
			for (i = 0; i < len; i++)
			{
				node = disList[i];
				tInfo = NodeInfosItem.getNodeInfoByNode(node);
				if (tInfo)
				{
					
					tTxt = tInfo._infoTxt;
					tTxt.pos(xPos, heightLen * i );
					//trace("rePos:",node,tTxt,xPos, heightLen * i );
				}
			}
		}
		private static clearRelations():void
		{
			var g:Graphics;
			g = NodeInfosItem.NodeInfoContainer.lineLayer.graphics;
			g.clear();
		}
		 static updateRelations():void
		{
			var g:Graphics;
			g = NodeInfosItem.NodeInfoContainer.lineLayer.graphics;
			g.clear();
			var key:string;
			var tInfo:NodeInfosItem;
			for (key in NodeInfosItem._nodeInfoDic)
			{
				tInfo = NodeInfosItem._nodeInfoDic[key];
				if (tInfo.parent)
				{
					g.drawLine(tInfo.x, tInfo.y, tInfo._infoTxt.x, tInfo._infoTxt.y,"#0000ff");
				}
			}
		}
		private static _txts:any[] = [];
		private _tar:Sprite;
		
		private static _nodePoint:Point = new Point();
		 static getNodeValue(node:Sprite, key:string):string
		{
			var rst:string;
			NodeInfosItem._nodePoint.setTo(0, 0);
			switch(key)
			{
				case "x":
					rst=node["x"]+" (g:"+node.localToGlobal(NodeInfosItem._nodePoint).x+")"
					break;
				case "y":
					rst=node["y"]+" (g:"+node.localToGlobal(NodeInfosItem._nodePoint).y+")"
					break;
				default:
					rst = node[key];
			}
			return rst;
		}
		 showInfo(node:Sprite):void
		{
			
			this._tar = node;
			if (!node) return;
			NodeInfosItem._txts.length = 0;
			var i:number, len:number;
			var tKey:string;
			len = NodeInfosItem.showValues.length;
			if (node.name)
			{
				NodeInfosItem._txts.push(ClassTool.getClassName(node)+"("+node.name+")");
			}else
			{
				NodeInfosItem._txts.push(ClassTool.getClassName(node));
			}
			
			for (i = 0; i < len; i++)
			{
				tKey = NodeInfosItem.showValues[i];
				NodeInfosItem._txts.push(tKey+":"+NodeInfosItem.getNodeValue(node,tKey));		
			}
			this._infoTxt.text = NodeInfosItem._txts.join("\n");
			this.graphics.clear();
			
			var pointList:any[];
			pointList=(node as any)._getBoundPointsM(true);
			if(!pointList||pointList.length<1) return;
			pointList=GrahamScan.pListToPointList(pointList,true);	
			WalkTools.walkArr(pointList,node.localToGlobal,node);	
			pointList=GrahamScan.pointListToPlist(pointList);
			NodeInfosItem._disBoundRec=(Rectangle as any)._getWrapRec(pointList,NodeInfosItem._disBoundRec);
			//debugLayer.graphics.drawRect(_disBoundRec.x, _disBoundRec.y, _disBoundRec.width, _disBoundRec.height, null, "#ff0000");
			this.graphics.drawRect(0, 0, NodeInfosItem._disBoundRec.width, NodeInfosItem._disBoundRec.height, null, "#00ffff");
			this.pos(NodeInfosItem._disBoundRec.x, NodeInfosItem._disBoundRec.y);
		}
		 fresh():void
		{
			this.showInfo(this._tar);
		}
		 clearMe():void
		{
			this._tar = null;
		}
		 recover():void
		{
			Pool.recover("NodeInfosItem", this);
		}
	}


