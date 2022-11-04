
import { Laya } from "Laya";
import { ClassTool } from "./tools/ClassTool";
import { CountTool } from "./tools/CountTool";
import { DisController } from "./tools/DisController";
import { DisControlTool } from "./tools/DisControlTool";
import { DTrace } from "./tools/DTrace";
import { RunProfile } from "./tools/RunProfile";
import { TraceTool } from "./tools/TraceTool";
import { WalkTools } from "./tools/WalkTools";
import { DebugInfoLayer } from "./view/nodeInfo/DebugInfoLayer";
import { NodeInfoPanel } from "./view/nodeInfo/NodeInfoPanel";
import { NodeUtils } from "./view/nodeInfo/NodeUtils";
import { Browser } from "laya/utils/Browser";
import { Sprite } from "laya/display/Sprite";
import { Rectangle } from "laya/maths/Rectangle";
import { Event } from "laya/events/Event";
import { Node } from "laya/display/Node";
import { Stat } from "laya/utils/Stat";
import { GrahamScan } from "laya/maths/GrahamScan";
import { RenderSprite } from "laya/renders/RenderSprite";
import { Watcher } from "./tools/Watcher";
// import { DisplayHook } from "./tools/DisplayHook";

	/**
	 *
	 * @author ww
	 * @version 1.0
	 * @created  2015-9-24 下午3:00:38
	 */
	
	export class DebugTool {
		constructor(){
		}
		
		static enableCacheAnalyse:boolean = false;
		static enableNodeCreateAnalyse:boolean = true;
	
		static getMenuShowEvent():string {
			//return Event.DOUBLE_CLICK;
			if (Browser.onMobile) {
				return Event.DOUBLE_CLICK;
			}
			else {
				return Event.RIGHT_CLICK;
			}
		}
		
		static initBasicFunctions():void {
			// DisplayHook.initMe();
			if (!DebugTool.debugLayer) {
				DebugInfoLayer.init();
				DebugTool.debugLayer = DebugInfoLayer.I.graphicLayer;
				DebugTool.debugLayer.mouseEnabled = false;
				DebugTool.debugLayer.mouseThrough = true;
				DebugTool.showStatu = true;
				//showStatu = false;
				Laya.stage.on(Event.KEY_DOWN, null, DebugTool.keyHandler);
				
//				cmdToTypeO[RenderSprite.IMAGE] = "IMAGE";
//				cmdToTypeO[RenderSprite.ALPHA] = "ALPHA";
//				cmdToTypeO[RenderSprite.TRANSFORM] = "TRANSFORM";
//				cmdToTypeO[RenderSprite.CANVAS] = "CANVAS";
//				cmdToTypeO[RenderSprite.GRAPHICS] = "GRAPHICS";
//				cmdToTypeO[RenderSprite.CUSTOM] = "CUSTOM";
//				cmdToTypeO[RenderSprite.CHILDS] = "CHILDS";
				
				DebugTool.export();
			}
		}
		
		private static _traceFun:Function;
		
		/**
		 * 在输出ui中输出
		 * @param str
		 */
		static dTrace(str:string):void {
			if (DebugTool._traceFun != null) {
				DebugTool._traceFun(str);
			}
			console.log(str);
		}
		
		private static keyHandler(e:any):void {
			var key:string;
			key = String.fromCharCode(e.keyCode);
//			trace("keydown:"+key);
			//trace("keyCode:"+e.keyCode);
			//  trace(e);
			if (!e.altKey)
				return;
			//trace("keydown:"+key);
			switch (e.keyCode) {
				case 38: 
					//Up
					DebugTool.showParent();
					break;
				case 40: 
					//Down
					DebugTool.showChild();
					break;
				case 37: 
					//Left
					DebugTool.showBrother(DebugTool.target, 1);
					break;
				case 39: 
					//Right
					DebugTool.showBrother(DebugTool.target, -1);
					break;
			}
			DebugTool.dealCMDKey(key);
		}
		
		 static dealCMDKey(key:string):void {
			switch (key) {
				case "上": 
					//Up
					DebugTool.showParent();
					break;
				case "下": 
					//Down
					DebugTool.showChild();
					break;
				case "左": 
					//Left
					DebugTool.showBrother(DebugTool.target, 1);
					break;
				case "右": 
					//Right
					DebugTool.showBrother(DebugTool.target, -1);
					break;
				case "B": 
					//显示所有兄弟节点
					DebugTool.showAllBrother();
					break;
				case "C": 
					//显示所有子对象
					DebugTool.showAllChild();
					break;
				case "E": 
					//显示当前对象MouseEnable链
					DebugTool.traceDisMouseEnable();
					break;
				case "S": 
					//显示当前对象Size链
					DebugTool.traceDisSizeChain();
					break;
				case "D": 
					//下移
					DisControlTool.downDis(DebugTool.target);
					break;
				case "U": 
					//上移
					DisControlTool.upDis(DebugTool.target);
					break;
				case "N": 
					//获取节点信息
					DebugTool.getNodeInfo();
					break;
				case "M": 
					//选中鼠标下的所有对象
					DebugTool.showAllUnderMosue();
					break;
				case "I": 
					//切换debugui显示隐藏
					//switchMyVisible();
					break;
				case "O": 

					break;
				case "L": 
					//切换长度控制模式
					DisController.I.switchType();
					break;
				case "Q": 
					//切换长度控制模式
					DebugTool.showNodeInfo();
					break;
				case "F": 
					//切换长度控制模式
					DebugTool.showToolPanel();
					break;
				case "P": 
					//切换长度控制模式
					DebugTool.showToolFilter();
					break;
				case "V": 
					//切换长度控制模式
					DebugTool.selectNodeUnderMouse();
					break;
				case "A": 
					//切换长度控制模式

					break;
				case "K": 
					NodeUtils.traceStage();
					break;
				case "T": 
					DebugTool.switchNodeTree();
					break;
				case "R": 
					break;
				case "X": 
					break;
				case "mCMD": 
					//获取节点信息
					DebugTool.traceCMD();
					break;
				case "allCMD": 
					//获取节点信息
					DebugTool.traceCMDR();
					break;
			
			}
		}
		
		static switchNodeTree():void {

		}
		
		static analyseMouseHit:Function;
		// ():void {
		// 	if (DebugTool.target)
		// 		MouseEventAnalyser.analyseNode(DebugTool.target);
		// }
		
		static selectNodeUnderMouse():void {
			// DisplayHook.instance.selectDisUnderMouse();
			DebugTool.showDisBound();
			return;
		}
		
		 static showToolPanel():void {
		}
		
		 static showToolFilter():void {
		}
		
		 static showNodeInfo():void {
			if (NodeInfoPanel.I.isWorkState) {
				NodeInfoPanel.I.recoverNodes();
			}
			else {
				NodeInfoPanel.I.showDisInfo(DebugTool.target);
			}
		
		}
		
		 static switchDisController():void {
			if (DisController.I.target) {
				DisController.I.target = null;
			}
			else {
				if (DebugTool.target) {
					DisController.I.target = DebugTool.target;
				}
			}
		}
		
		 static get isThisShow():boolean {
			return false;
		}
		
		 static showParent(sprite:Sprite = null):any {
			if (!sprite)
				sprite = DebugTool.target;
			if (!sprite) {
				console.log("no targetAvalible");
				return null;
			}
			DebugTool.target = (<Sprite>sprite.parent );
			DebugTool.autoWork();
		}
		
		 static showChild(sprite:Sprite = null):any {
			if (!sprite)
				sprite = DebugTool.target;
			if (!sprite) {
				console.log("no targetAvalible");
				return null;
			}
			if (sprite.numChildren > 0) {
				DebugTool.target = (<Sprite>sprite.getChildAt(0) );
				DebugTool.autoWork();
			}
		}
		
		 static showAllChild(sprite:Sprite = null):any {
			if (!sprite)
				sprite = DebugTool.target;
			if (!sprite) {
				console.log("no targetAvalible");
				return null;
			}
			DebugTool.selectedNodes = DisControlTool.getAllChild(sprite);
			DebugTool.showSelected();
		}
		
		 static showAllUnderMosue():any {
			DebugTool.selectedNodes = DisControlTool.getObjectsUnderGlobalPoint(Laya.stage);
			DebugTool.showSelected();
		}
		
		 static showParentChain(sprite:Sprite = null):any {
			if (!sprite)
				return;
			DebugTool.selectedNodes = [];
			var tar:Sprite;
			tar = (<Sprite>sprite.parent );
			while (tar) {
				DebugTool.selectedNodes.push(tar);
				tar = (<Sprite>tar.parent );
			}
			DebugTool.showSelected();
		}
		
		 static showAllBrother(sprite:Sprite = null):any {
			if (!sprite)
				sprite = DebugTool.target;
			if (!sprite) {
				console.log("no targetAvalible");
				return null;
			}
			if (!sprite.parent)
				return;
			DebugTool.selectedNodes = DisControlTool.getAllChild(sprite.parent);
			DebugTool.showSelected();
		}
		
		 static showBrother(sprite:Sprite, dID:number = 1):any {
			if (!sprite)
				sprite = DebugTool.target;
			if (!sprite) {
				console.log("no targetAvalible");
				return null;
			}
			var p:Node;
			p = sprite.parent;
			if (!p)
				return;
			var n:number;
			n = p.getChildIndex(sprite);
			n += dID;
			if (n < 0)
				n += p.numChildren;
			if (n >= p.numChildren)
				n -= p.numChildren;
			DebugTool.target = (<Sprite>p.getChildAt(n) );
			DebugTool.autoWork();
		}
		private static text:Stat = new Stat();
		
		/**
		 * 设置是否显示帧率信息
		 * @param value 是否显示true|false
		 */
		static set showStatu(value:boolean) {
			if (value) {
				Stat.show();
			}
			else {
				
				Stat.hide();
				DebugTool.clearDebugLayer();
			}
		}
		
		static clearDebugLayer():void {
			if (DebugTool.debugLayer.graphics)
				DebugTool.debugLayer.graphics.clear();
		}
		/**
		 * debug层
		 */
		static debugLayer:Sprite;
		/**
		 * 最后点击的对象
		 */
		 static _target:Sprite;
		
		static set target(v:Sprite) {
			DebugTool._target = v;
		}
		
		static get target():Sprite {
			return DebugTool._target;
		}
		/**
		 * 最后被选中的节点列表
		 */
		static selectedNodes:any[] = [];
		/**
		 * 是否自动显示选中节点列表
		 */
		static autoShowSelected:boolean = true;
		
		/**
		 * 显示选中的节点列表
		 */
		static showSelected():void {
			if (!DebugTool.autoShowSelected)
				return;
			if (!DebugTool.selectedNodes || DebugTool.selectedNodes.length < 1)
				return;
			console.log("selected:", DebugTool.selectedNodes);
			var i:number;
			var len:number;
			len = DebugTool.selectedNodes.length;
			DebugTool.clearDebugLayer();
			for (i = 0; i < len; i++) {
				DebugTool.showDisBound(DebugTool.selectedNodes[i], false);
			}
		}
		
		/**
		 * 获取类对象的创建信息
		 * @param className
		 * @return
		 */
		static getClassCreateInfo(className:string):any {
			return RunProfile.getRunInfo(className);
		}
		
		private static _showBound:boolean = true;
		
		/**
		 * 是否自动显示点击对象的边框
		 * @param value
		 */
		static set showBound(value:boolean) {
			DebugTool._showBound = value;
			if (!DebugTool._showBound) {
				DebugTool.clearDebugLayer();
			}
		}
		
		static get showBound():boolean {
			return DebugTool._showBound;
		}
		
		/**
		 * 执行默认操作
		 */
		static autoWork():void {
			if (!DebugTool.isThisShow)
				return;
			if (DebugTool.showBound)
				DebugTool.showDisBound();
			if (DebugTool.autoTraceSpriteInfo && DebugTool.target) {
				TraceTool.traceSpriteInfo(DebugTool.target, DebugTool.autoTraceBounds, DebugTool.autoTraceSize, DebugTool.autoTraceTree);
			}
			if (!DebugTool.target)
				return;
			if (DebugTool.autoTraceCMD) {
				DebugTool.traceCMD();
			}
			if (DebugTool.autoTraceCMDR) {
				DebugTool.traceCMDR();
			}
			if (DebugTool.autoTraceEnable) {
				DebugTool.traceDisMouseEnable(DebugTool.target);
			}
		}
		
		static traceDisMouseEnable(tar:any = null):any {
			console.log("----------------traceDisMouseEnable--------------------");
			if (!tar)
				tar = DebugTool.target;
			if (!tar) {
				console.log("no targetAvalible");
				return null;
			}
			var strArr:any[];
			strArr = [];
			DebugTool.selectedNodes = [];
			while (tar) {
				strArr.push(ClassTool.getNodeClassAndName(tar) + ": mouseEnabled:" + tar.mouseEnabled + " hitFirst:" + tar.hitTestPrior);
				//dTrace(TraceTool.getClassName(tar)+":"+tar.mouseEnabled);
				DebugTool.selectedNodes.push(tar);
				tar = (<Sprite>tar.parent );
			}
			console.log(strArr.join("\n"));
			DebugTool.showSelected();
			return strArr.join("\n");
		}
		
		static traceDisSizeChain(tar:any = null):any {
			console.log("---------------------traceDisSizeChain-------------------");
			if (!tar)
				tar = DebugTool.target;
			if (!tar) {
				console.log("no targetAvalible");
				return null;
			}
			DebugTool.selectedNodes = [];
			var strArr:any[];
			strArr = [];
			while (tar) {
				//dTrace(TraceTool.getClassName(tar) + ":");
				strArr.push(ClassTool.getNodeClassAndName(tar) + ": x:" + tar.x + " y:" + tar.y + " w:" + tar.width + " h:" + tar.height + " scaleX:" + tar.scaleX + " scaleY:" + tar.scaleY);
				//TraceTool.traceSize(tar);
				DebugTool.selectedNodes.push(tar);
				tar = (<Sprite>tar.parent );
			}
			console.log(strArr.join("\n"));
			DebugTool.showSelected();
			return strArr.join("\n");
		}
		private static _disBoundRec:Rectangle;
		
		/**
		 * 显示对象的边框
		 * @param sprite 对象
		 * @param clearPre 是否清楚原先的边框图
		 */
		static showDisBound(sprite:Sprite = null, clearPre:boolean = true, color:string = "#ff0000"):any {
			if (!sprite)
				sprite = DebugTool.target;
			if (!sprite) {
				console.log("no targetAvalible");
				return null;
			}
			if (clearPre)
				DebugTool.clearDebugLayer();
			var pointList:any[];
//			pointList=target.getSelfBounds().getBoundPoints();
			pointList = (sprite as any)._getBoundPointsM(true);
			if (!pointList || pointList.length < 1)
				return;
			pointList = GrahamScan.pListToPointList(pointList, true);
			WalkTools.walkArr(pointList, sprite.localToGlobal, sprite);
			pointList = GrahamScan.pointListToPlist(pointList);
			DebugTool._disBoundRec = (Rectangle as any)._getWrapRec(pointList, DebugTool._disBoundRec);
			DebugTool.debugLayer.graphics.drawRect(DebugTool._disBoundRec.x, DebugTool._disBoundRec.y, DebugTool._disBoundRec.width, DebugTool._disBoundRec.height, null, color);
			
			DebugInfoLayer.I.setTop();
		}
		
		static showDisBoundToSprite(sprite:Sprite = null, graphicSprite:Sprite = null, color:string = "#ff0000", lineWidth:number = 1):any {
			var pointList:any[];
//			pointList=target.getSelfBounds().getBoundPoints();
			pointList = (sprite as any)._getBoundPointsM(true);
			if (!pointList || pointList.length < 1)
				return;
			pointList = GrahamScan.pListToPointList(pointList, true);
			WalkTools.walkArr(pointList, sprite.localToGlobal, sprite);
			pointList = GrahamScan.pointListToPlist(pointList);
			DebugTool._disBoundRec = (Rectangle as any)._getWrapRec(pointList, DebugTool._disBoundRec);
			graphicSprite.graphics.drawRect(DebugTool._disBoundRec.x, DebugTool._disBoundRec.y, DebugTool._disBoundRec.width, DebugTool._disBoundRec.height, null, color, lineWidth);
		}
		static autoTraceEnable:boolean = false;
		static autoTraceBounds:boolean = false;
		static autoTraceSize:boolean = false;
		static autoTraceTree:boolean = true;
		/**
		 * 是否自动显示节点自身的CMD
		 */
		static autoTraceCMD:boolean = true;
		/**
		 *  是否自动显示节点自身已经子对象的CMD
		 */
		static autoTraceCMDR:boolean = false;
		/**
		 * 是否自动显示节点信息
		 */
		static autoTraceSpriteInfo:boolean = true;
		
		/**
		 *  显示节点统计信息
		 * @return
		 */
		static getNodeInfo():any {
			DebugTool.counter.reset();
			WalkTools.walkTarget(Laya.stage, DebugTool.addNodeInfo);
//			trace("total:"+counter.count);
			console.log("node info:");
			DebugTool.counter.traceSelf();
			return DebugTool.counter.data;
		}
		private static _classList:any[];
		private static _tFindClass:string;
		
		static findByClass(className:string):any[] {
			DebugTool._classList = [];
			DebugTool._tFindClass = className;
			WalkTools.walkTarget(Laya.stage, DebugTool.addClassNode);
			DebugTool.selectedNodes = DebugTool._classList;
			DebugTool.showSelected();
			return DebugTool._classList;
		}
		
		private static addClassNode(node:any):void {
			var type:string;
			type = node["constructor"].name;
			if (type == DebugTool._tFindClass) {
				DebugTool._classList.push(node);
			}
		}
		
		private static cmdToTypeO:any = {
			
			};
		
		private static _rSpList:any[] = [];
		
		/**
		 * 显示Sprite 指令信息
		 * @param sprite
		 * @return
		 */
		static traceCMD(sprite:Sprite = null):any {
			if (!sprite)
				sprite = DebugTool.target;
			if (!sprite) {
				console.log("no targetAvalible");
				return null;
			}
			console.log("self CMDs:");
			console.log(sprite.graphics.cmds);
			var renderSprite:RenderSprite;
			renderSprite = RenderSprite.renders[(sprite as any)._renderType];
			console.log("renderSprite:", renderSprite);
			DebugTool._rSpList.length = 0;
			while (renderSprite && renderSprite["_sign"] > 0) {
				
				DebugTool._rSpList.push(DebugTool.cmdToTypeO[renderSprite["_sign"]]);
				renderSprite = (renderSprite as any)._next;
			}
			console.log("fun:", DebugTool._rSpList.join(","));
			DebugTool.counter.reset();
			DebugTool.addCMDs(sprite.graphics.cmds);
			DebugTool.counter.traceSelf();
			return DebugTool.counter.data;
		}
		
		private static addCMDs(cmds:ReadonlyArray<any>):void {
			WalkTools.walkArr(cmds, DebugTool.addCMD);
		}
		
		private static addCMD(cmd:any):void {
			DebugTool.counter.add(cmd.callee);
		}
		private static counter:CountTool = new CountTool();
		
		/**
		 * 显示Sprite以及其子对象的指令信息
		 * @param sprite
		 * @return
		 */
		 static traceCMDR(sprite:Sprite = null):any {
			if (!sprite)
				sprite = DebugTool.target;
			if (!sprite) {
				console.log("no targetAvalible");
				return 0;
			}
			DebugTool.counter.reset();
			WalkTools.walkTarget(sprite, DebugTool.getCMdCount);
			console.log("cmds include children");
			DebugTool.counter.traceSelf();
			return DebugTool.counter.data;
		}
		
		private static getCMdCount(target:Sprite):number {
			if (!target)
				return 0;
			if (!(target instanceof Sprite))
				return 0;
			if (!target.graphics.cmds)
				return 0;
			DebugTool.addCMDs(target.graphics.cmds);
			var rst:number = target.graphics.cmds.length;
			return rst;
		}
		
		private static addNodeInfo(node:Node):void {
			var type:string;
			type = node["constructor"].name;
			DebugTool.counter.add(type);
		}
		
		/**
		 * 根据过滤器返回显示对象
		 * @param filter
		 * @return
		 */
		static find(filter:any, ifShowSelected:boolean = true):any[] {
			var rst:any[];
			rst = DebugTool.findTarget(Laya.stage, filter);
			DebugTool.selectedNodes = rst;
			if (DebugTool.selectedNodes) {
				DebugTool.target = DebugTool.selectedNodes[0];
			}
			if (ifShowSelected)
				DebugTool.showSelected();
			return rst;
		}
		private static nameFilter:any = {"name": "name"};
		
		/**
		 * 根据名字获取显示对象
		 * @param name
		 * @return
		 */
		static findByName(name:string):any[] {
			DebugTool.nameFilter.name = name;
			return DebugTool.find(DebugTool.nameFilter);
		}
		
		/**
		 * 获取名字以某个字符串开头的显示对象
		 * @param startStr
		 * @return
		 */
		static findNameStartWith(startStr:string):any[] {
			DebugTool.nameFilter.name = DebugTool.getStartWithFun(startStr);
			return DebugTool.find(DebugTool.nameFilter);
		}
		
		/**
		 * 获取名字包含某个字符串的显示对象
		 * @param hasStr
		 * @return
		 */
		static findNameHas(hasStr:string, showSelected:boolean = true):any[] {
			DebugTool.nameFilter.name = DebugTool.getHasFun(hasStr);
			return DebugTool.find(DebugTool.nameFilter, showSelected);
		}
		
		private static getStartWithFun(startStr:string):Function {
			var rst:Function = function(str:string):boolean {
				if (!str)
					return false;
				if (str.indexOf(startStr) == 0)
					return true;
				return false;
			};
			return rst;
		}
		
		private static getHasFun(hasStr:string):Function {
			var rst:Function = function(str:string):boolean {
				if (!str)
					return false;
				if (str.indexOf(hasStr) >= 0)
					return true;
				return false;
			};
			return rst;
		}
		
		static findTarget(target:Sprite, filter:any):any[] {
			var rst:any[] = [];
			if (DebugTool.isFit(target, filter))
				rst.push(target);
			var i:number;
			var len:number;
			var tChild:Sprite;
			len = target.numChildren;
			for (i = 0; i < len; i++) {
				tChild = (<Sprite>target.getChildAt(i) );
				if (tChild instanceof Sprite) {
					rst = rst.concat(DebugTool.findTarget(tChild, filter));
				}
			}
			return rst;
		}
		
		static findClassHas(target:Sprite, str:string):any[] {
			var rst:any[] = [];
			if (ClassTool.getClassName(target).indexOf(str) >= 0)
				rst.push(target);
			var i:number;
			var len:number;
			var tChild:Sprite;
			len = target.numChildren;
			for (i = 0; i < len; i++) {
				tChild = (<Sprite>target.getChildAt(i) );
				if (tChild instanceof Sprite) {
					rst = rst.concat(DebugTool.findClassHas(tChild, str));
				}
			}
			return rst;
		}
		
		private static isFit(tar:any, filter:any):boolean {
			if (!tar)
				return false;
			if (!filter)
				return true;
			if (filter instanceof Function) {
				return ((<Function>filter ))(tar);
			}
			var key:string;
			for (key in filter) {
				if (filter[key] instanceof Function) {
					if (!filter[key](tar[key]))
						return false;
				}
				else {
					if (tar[key] != filter[key])
						return false;
				}
				
			}
			return true;
		}
		
		static _logFun:Function;
		
		static log(... args):void {
			var arr:any[];
			arr = DTrace.getArgArr(args);
			if (DebugTool._logFun != null) {
				DebugTool._logFun(arr.join(" "));
			}
		}

		private static _exportsDic:any=
			{
				"DebugTool":DebugTool,
				"Watcher":Watcher
			};
			
		static export():void
		{
			var _window:any;
			_window=window;;
			var key:string;
			for(key in DebugTool._exportsDic)
			{
				_window[key]=DebugTool._exportsDic[key];
			}
		}
	}

TraceTool._debugtrace = DebugTool.dTrace;