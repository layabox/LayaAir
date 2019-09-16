import { Laya } from "Laya";
import { DebugInfoLayer } from "./DebugInfoLayer";
import { ClassTool } from "../../tools/ClassTool"
import { RenderAnalyser } from "../../tools/RenderAnalyser"
import { StringTool } from "../../tools/StringTool"
import { WalkTools } from "../../tools/WalkTools"
import { Node } from "laya/display/Node"
import { GrahamScan } from "laya/maths/GrahamScan"
import { Sprite } from "laya/display/Sprite";
import { Point } from "laya/maths/Point";
import { Rectangle } from "laya/maths/Rectangle";
import { Graphics } from "laya/display/Graphics";
	
	/**
	 * ...
	 * @author ww
	 */
	export class NodeUtils {
		
		constructor(){
		
		}
		
		 static defaultKeys:any[] = ["x", "y", "width", "height"];
		
		 static getFilterdTree(sprite:Sprite, keys:any[]):any {
			if (!keys)
				keys = NodeUtils.defaultKeys;
			var me:any;
			me = {};
			var key:string;
			var i:number, len:number;
			len = keys.length;
			for (i = 0; i < len; i++) {
				key = keys[i];
				me[key] = sprite[key];
			}
			
			var cList:any[];
			var tChild:Sprite;
			cList = (sprite as any)._children;
			len = cList.length;
			var mClist:any[];
			mClist = [];
			for (i = 0; i < len; i++) {
				tChild = cList[i];
				mClist.push(NodeUtils.getFilterdTree(tChild, keys));
			}
			me.childs = mClist;
			return me;
		
		}
		
		 static getNodeValue(node:any, key:string):string {
			var rst:string;
			if (node instanceof Sprite) {
				var tNode:Sprite;
				tNode = (<Sprite>node );
				switch (key) {
					case "gRec": 
						rst = NodeUtils.getGRec(tNode).toString();
						break;
					case "gAlpha": 
						rst = NodeUtils.getGAlpha(tNode) + "";
						break;
					case "cmdCount": 
						rst = NodeUtils.getNodeCmdCount(tNode) + "";
						break;
					case "cmdAll": 
						rst = NodeUtils.getNodeCmdTotalCount(tNode) + "";
						break;
					case "nodeAll": 
						rst = "" + NodeUtils.getNodeCount(tNode);
						break;
					case "nodeVisible": 
						rst = "" + NodeUtils.getNodeCount(tNode, true);
						break;
					case "nodeRender": 
						rst = "" + NodeUtils.getRenderNodeCount(tNode);
						break;
					case "nodeReCache": 
						rst = "" + NodeUtils.getReFreshRenderNodeCount(tNode);
						break;
					case "renderCost": 
						rst = "" + RenderAnalyser.I.getTime(tNode);
						break;
					case "renderCount": 
						rst = "" + RenderAnalyser.I.getCount(tNode);
						break;
					default: 
						rst = node[key] + "";
				}
			}
			else {
				rst = node[key] + "";
			}
			
			return rst;
		}
		
		 static getPropertyDesO(tValue:any, keys:any[]):any {
			if (!keys)
				keys = NodeUtils.defaultKeys;
			var rst:any = {};
			if (typeof(tValue) == 'object') {
				rst.label = "" + ClassTool.getNodeClassAndName(tValue);
			}
			else {
				rst.label = "" + tValue;
			}
			
			rst.type = "";
			rst.path = tValue;
			rst.childs = [];
			rst.isDirectory = false;
			
			var key:string;
			var i:number, len:number;
			var tChild:any;
			if (tValue instanceof Node) {
				rst.des = ClassTool.getNodeClassAndName(tValue);
				rst.isDirectory = true;
				len = keys.length;
				for (i = 0; i < len; i++) {
					key = keys[i];
					tChild = NodeUtils.getPropertyDesO(tValue[key], keys);
					if (tValue.hasOwnProperty(key)) {
						tChild.label = "" + key + ":" + tChild.des;
					}
					else {
						tChild.label = "" + key + ":" + NodeUtils.getNodeValue(tValue, key);
					}
					
					rst.childs.push(tChild);
				}
				key = "_children";
				tChild = NodeUtils.getPropertyDesO(tValue[key], keys);
				tChild.label = "" + key + ":" + tChild.des;
				tChild.isChilds = true;
				rst.childs.push(tChild);
				
			}
			else if (tValue instanceof Array) {
				rst.des = "Array[" + ((<any[]>tValue )).length + "]";
				rst.isDirectory = true;
				var tList:any[];
				tList = (<any[]>tValue );
				len = tList.length;
				for (i = 0; i < len; i++) {
					tChild = NodeUtils.getPropertyDesO(tList[i], keys);
					tChild.label = "" + i + ":" + tChild.des;
					rst.childs.push(tChild);
				}
			}
			else if (typeof(tValue) == 'object') {
				rst.des = ClassTool.getNodeClassAndName(tValue);
				rst.isDirectory = true;
				for (key in tValue) {
					tChild = NodeUtils.getPropertyDesO(tValue[key], keys);
					tChild.label = "" + key + ":" + tChild.des;
					rst.childs.push(tChild);
				}
			}
			else {
				rst.des = "" + tValue;
			}
			rst.hasChild = rst.childs.length > 0;
			return rst;
		}
		
		 static adptShowKeys(keys:any[]):any[] {
			var i:number, len:number;
			len = keys.length;
			for (i = len - 1; i >= 0; i--) {
				keys[i] = StringTool.trimSide(keys[i]);
				if (keys[i].length < 1) {
					keys.splice(i, 1);
				}
			}
			return keys;
		}
		
		 static getNodeTreeData(sprite:Sprite, keys:any[]):any[] {
			NodeUtils.adptShowKeys(keys);
			var treeO:any;
			treeO = NodeUtils.getPropertyDesO(sprite, keys);
			
			//trace("treeO:", treeO);
			var treeArr:any[];
			treeArr = [];
			NodeUtils.getTreeArr(treeO, treeArr);
			return treeArr;
		}
		
		 static getTreeArr(treeO:any, arr:any[], add:boolean = true):void {
			if (add)
				arr.push(treeO);
			var tArr:any[] = treeO.childs;
			var i:number, len:number = tArr.length;
			for (i = 0; i < len; i++) {
				if (!add) {
					tArr[i].nodeParent = null;
				}
				else {
					tArr[i].nodeParent = treeO;
				}
				if (tArr[i].isDirectory) {
					NodeUtils.getTreeArr(tArr[i], arr);
				}
				else {
					arr.push(tArr[i]);
				}
			}
		}
		
		 static traceStage():void {
			console.log(NodeUtils.getFilterdTree(Laya.stage, null));
			
			console.log("treeArr:", NodeUtils.getNodeTreeData(Laya.stage, null));
		}
		
		 static getNodeCount(node:Sprite, visibleRequire:boolean = false):number {
			if (visibleRequire) {
				if (!node.visible)
					return 0;
			}
			var rst:number;
			rst = 1;
			var i:number, len:number;
			var cList:any[];
			cList = (node as any)._children;
			len = cList.length;
			for (i = 0; i < len; i++) {
				rst += NodeUtils.getNodeCount(cList[i], visibleRequire);
			}
			
			return rst;
		}
		
		 static getGVisible(node:Sprite):boolean {
			while (node) {
				if (!node.visible)
					return false;
				node = (<Sprite>node.parent );
			}
			return true;
		}
		
		 static getGAlpha(node:Sprite):number {
			var rst:number;
			rst = 1;
			while (node) {
				rst *= node.alpha;
				node = (<Sprite>node.parent );
			}
			return rst;
		}
		
		 static getGPos(node:Sprite):Point {
			var point:Point;
			point = new Point();
			node.localToGlobal(point);
			return point;
		}
		
		 static getGRec(node:Sprite):Rectangle {
			var pointList:any[];
			pointList = (node as any)._getBoundPointsM(true);
			if (!pointList || pointList.length < 1)
				return Rectangle.TEMP.setTo(0, 0, 0, 0);
			pointList = GrahamScan.pListToPointList(pointList, true);
			WalkTools.walkArr(pointList, node.localToGlobal, node);
			pointList = GrahamScan.pointListToPlist(pointList);
			var _disBoundRec:Rectangle;
			_disBoundRec = (Rectangle as any)._getWrapRec(pointList, _disBoundRec);
			return _disBoundRec;
		}
		
		 static getGGraphicRec(node:Sprite):Rectangle {
			var pointList:any[];
			pointList = (node.getGraphicBounds() as any)._getBoundPoints();
			if (!pointList || pointList.length < 1)
				return Rectangle.TEMP.setTo(0, 0, 0, 0);
			pointList = GrahamScan.pListToPointList(pointList, true);
			WalkTools.walkArr(pointList, node.localToGlobal, node);
			pointList = GrahamScan.pointListToPlist(pointList);
			var _disBoundRec:Rectangle;
			_disBoundRec = (Rectangle as any)._getWrapRec(pointList, _disBoundRec);
			return _disBoundRec;
		}
		
		 static getNodeCmdCount(node:Sprite):number {
			var rst:number;
			if (node.graphics) {
				if (node.graphics.cmds) {
					rst = node.graphics.cmds.length;
				}
				else {
					if ((node.graphics as any)._one) {
						rst = 1;
					}
					else {
						rst = 0;
					}
				}
			}
			else {
				rst = 0;
			}
			return rst;
		}
		
		 static getNodeCmdTotalCount(node:Sprite):number {
			var rst:number;
			var i:number, len:number;
			var cList:any[];
			cList = (node as any)._children;
			len = cList.length;
			rst = NodeUtils.getNodeCmdCount(node);
			for (i = 0; i < len; i++) {
				rst += NodeUtils.getNodeCmdTotalCount(cList[i]);
			}
			return rst;
		}
		
		 static getRenderNodeCount(node:Sprite):number {
			if (node.cacheAs != "none")
				return 1;
			var rst:number;
			var i:number, len:number;
			var cList:any[];
			cList = (node as any)._children;
			len = cList.length;
			rst = 1;
			for (i = 0; i < len; i++) {
				rst += NodeUtils.getRenderNodeCount(cList[i]);
			}
			return rst;
		}
		
		 static getReFreshRenderNodeCount(node:Sprite):number {
			var rst:number;
			var i:number, len:number;
			var cList:any[];
			cList = (node as any)._children;
			len = cList.length;
			rst = 1;
			for (i = 0; i < len; i++) {
				rst += NodeUtils.getRenderNodeCount(cList[i]);
			}
			return rst;
		}
		
		private static g:Graphics;
		
		 static showCachedSpriteRecs():void {
			NodeUtils.g = DebugInfoLayer.I.graphicLayer.graphics;
			NodeUtils.g.clear();
			WalkTools.walkTarget(Laya.stage, NodeUtils.drawCachedBounds, null);
		}
		
		private static drawCachedBounds(sprite:Sprite):void {
			if (sprite.cacheAs == "none")
				return;
			if (DebugInfoLayer.I.isDebugItem(sprite))
				return;
			var rec:Rectangle;
			rec = NodeUtils.getGRec(sprite);
			NodeUtils.g.drawRect(rec.x, rec.y, rec.width, rec.height, null, "#0000ff", 2);
		
		}
	}


