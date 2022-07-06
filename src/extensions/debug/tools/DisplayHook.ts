import { Laya } from "Laya";
import { Notice } from "./Notice";
import { DebugInfoLayer } from "../view/nodeInfo/DebugInfoLayer"
import { DButton } from "./debugUI/DButton"
import { Event } from "laya/events/Event";
import { Render } from "laya/renders/Render";
import { Stage } from "laya/display/Stage";
import { Matrix } from "laya/maths/Matrix";
import { Point } from "laya/maths/Point";
import { Rectangle } from "laya/maths/Rectangle";
import { Browser } from "laya/utils/Browser";
import { Sprite } from "laya/display/Sprite";
import { DebugTool } from "../DebugTool";

	/**
	 * 调试拾取显示对象类
	 * @author ww
	 */
	export class DisplayHook 
	{
		
		constructor(){
			this._stage = Laya.stage;
			this.init(Render.context.canvas);
		}
		static ITEM_CLICKED:string = "ItemClicked";

		static instance:DisplayHook;
		private static selectNodeUnderMouse;
		mouseX:number;
		mouseY:number;
		private _stage:Stage;
		private _matrix:Matrix = new Matrix();
		private _point:Point = new Point();
		private _rect:Rectangle = new Rectangle();
		private _event:Event = Event.EMPTY;
		private _target:any;
		
		static initMe():void
		{
			if(!DisplayHook.instance)
			{
				DisplayHook.instance=new DisplayHook();
				DisplayHook.selectNodeUnderMouse = DebugTool.selectNodeUnderMouse;
				DebugTool.selectNodeUnderMouse = ()=>{
					DisplayHook.instance.selectDisUnderMouse();
					DisplayHook.selectNodeUnderMouse();
				}
			}
		}
		
		init(canvas:any):void {
			//禁用IE下屏幕缩放
			if ((<any>window.navigator).msPointerEnabled) {
				canvas.style['-ms-content-zooming'] = 'none';
				canvas.style['-ms-touch-action'] = 'none';
			}
			
			var _this:DisplayHook = this;
			document.addEventListener('mousedown',(e)=> {
//			canvas.addEventListener('mousedown', function(e:*):void {
				(this._event as any)._stoped = false;
				DisplayHook.isFirst=true;
//				trace("mousePos:",e.offsetX, e.offsetY);
				_this.check(_this._stage, e.offsetX, e.offsetY, _this.onMouseDown, true, false);
			}, true);
			document.addEventListener('touchstart', (e) => {
//			canvas.addEventListener('mousedown', function(e:*):void {
				(this._event as any)._stoped = false;
				DisplayHook.isFirst=true;
//				trace("mousePos:",e.offsetX, e.offsetY);
               	var touches:TouchList = e.changedTouches;
				for (var i:number = 0, n:number = touches.length; i < n; i++) {
					var touch:any = touches[i];
					initEvent(touch, e);
					_this.check(_this._stage, _this.mouseX, _this.mouseY, _this.onMouseDown, true, false);
				}
				//_this.check(_this._stage, e.offsetX, e.offsetY, _this.onMouseDown, true, false);
			}, true);
			
			function initEvent(e:Event, event:any = null):void {
				(_this._event as any)._stoped = false;
				_this._event.nativeEvent = event || e;
				_this._target = null;
				
				if ((e as any).offsetX) {
					_this.mouseX = (e as any).offsetX;
					_this.mouseY = (e as any).offsetY;
				} else {
					_this.mouseX = (e as any).clientX - Laya.stage.offset.x;
					_this.mouseY = (e as any).clientY - Laya.stage.offset.y;
				}
			}
		}
		
		private onMouseMove(ele:any, hit:boolean):void {
			this.sendEvent(ele, Event.MOUSE_MOVE);
			//TODO:BUG
			return;
			if (hit && ele != this._stage && ele !== this._target) {
				if (this._target) {
					if (this._target.$_MOUSEOVER) {
						this._target.$_MOUSEOVER = false;
						this._target.event(Event.MOUSE_OUT);
					}
				}
				this._target = ele;
				if (!ele.$_MOUSEOVER) {
					ele.$_MOUSEOVER = true;
					this.sendEvent(ele, Event.MOUSE_OVER);
					//TODO:BUG
					//trace(ele, "mouseover");
				}
			} else if (!hit && this._target && ele === this._target) {
				this._target = null;
				if (ele.$_MOUSEOVER) {
					ele.$_MOUSEOVER = false;
					this.sendEvent(ele, Event.MOUSE_OUT);
				}
			}
		}
		
		private onMouseUp(ele:any, hit:boolean):void {
			hit && this.sendEvent(ele, Event.MOUSE_UP);
		}
		
		private onMouseDown(ele:any, hit:boolean):void {
			if (hit) {
				ele.$_MOUSEDOWN = true;
				this.sendEvent(ele, Event.MOUSE_DOWN);
			}
		}
		
		private sendEvent(ele:any, type:string):void {
			if (!(this._event as any)._stoped) {
				ele.event(type, this._event.setTo(type, ele,ele));
				if (type === Event.MOUSE_UP && ele.$_MOUSEDOWN) {
					ele.$_MOUSEDOWN = false;
					ele.event(Event.CLICK, this._event.setTo(Event.CLICK, ele,ele));
				}
			}
		}
		selectDisUnderMouse():void
		{
			DisplayHook.isFirst=true;
			this.check(Laya.stage, Laya.stage.mouseX, Laya.stage.mouseY, null, true, false);
		}
		
		private isGetting:boolean = false;
		getDisUnderMouse():Sprite
		{
			this.isGetting = true;
			DisplayHook.isFirst = true;
			DebugTool.target = null;
			this.check(Laya.stage, Laya.stage.mouseX, Laya.stage.mouseY, null, true, false);
			this.isGetting = false;
			return DebugTool.target;
		}
		static isFirst:boolean=false;
		private check(sp:Sprite, mouseX:number, mouseY:number, callBack:Function, hitTest:boolean, mouseEnable:boolean):boolean {
//			trace("check:"+sp.name);
			if (sp == DebugTool.debugLayer) return false;
			if (sp == DebugInfoLayer.I) return false;
//			if(sp==DebugTool._mainPain) return false;
			//if (sp is TraceOutUI) return false;
			//if(sp=DebugInfoLayer.I) return false;
			if (this.isGetting && sp == DebugInfoLayer.I) return false;
			
			if (!sp.visible || sp.getSelfBounds().width<=0) return false;
			
			var isHit:boolean = false;
			mouseEnable = true
			if (mouseEnable) {
				var graphicHit:boolean=false;
				if (hitTest) {					
					this._rect=sp.getBounds();					
					isHit = this._rect.contains(mouseX, mouseY);
					this._point.setTo(mouseX, mouseY);
					sp.fromParentPoint(this._point);
					mouseX = this._point.x;
					mouseY = this._point.y;		
				}
//				trace("check work:"+sp.name,isHit);
				//父对象没有接收到事件，子对象不再测试
				if (isHit) {
					var flag:boolean = false;
					for (var i:number = (sp as any)._children.length - 1; i > -1; i--) {
						var child:Sprite = (sp as any)._children[i];
						//只有接受交互事件的，才进行处理
						 (flag = this.check(child, mouseX, mouseY, callBack, hitTest, true));
						if (flag) break;
					}
					//if(sp is DMainPain) return false;
					graphicHit=sp.getGraphicBounds().contains(mouseX, mouseY);
					isHit=flag||graphicHit;
					if(isHit&&!flag&&DisplayHook.isFirst)
					{
						DisplayHook.isFirst=false;
						if(! (sp instanceof DButton))
						{
							DebugTool.target = sp;
							if (!this.isGetting)
							{
								//trace("click target:");
							    DebugTool.autoWork();
							    Notice.notify(DisplayHook.ITEM_CLICKED, sp);
							}
							
						}
					}
				}
			}
			return isHit;
		}
		
	}
