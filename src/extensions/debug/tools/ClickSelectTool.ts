import { Notice } from "./Notice";
import { DisplayHook } from "./DisplayHook";
import { Laya } from "Laya";
import { DebugConsts } from "./DebugConsts";
import { DebugTool } from "../DebugTool"
	import { DebugInfoLayer } from "../view/nodeInfo/DebugInfoLayer"
	import { NodeUtils } from "../view/nodeInfo/NodeUtils"
	import { Graphics } from "laya/display/Graphics"
	import { Sprite } from "laya/display/Sprite"
	import { Rectangle } from "laya/maths/Rectangle"
	import { Browser } from "laya/utils/Browser"
	import { Handler } from "laya/utils/Handler"
	/**
	 * ...
	 * @author ww
	 */
	export class ClickSelectTool 
	{
		private static _I:ClickSelectTool;
		 static get I():ClickSelectTool
		{
			if (!ClickSelectTool._I) ClickSelectTool._I = new ClickSelectTool();
			return ClickSelectTool._I;
		}
		constructor(){
			this._selectTip.setSelfBounds(new Rectangle(0, 0, 0, 0 ));
			Notice.listen(DisplayHook.ITEM_CLICKED, this, this.itemClicked);
		}
		 static isClickSelectState:boolean = false;
		private completeHandler:Handler;
		 beginClickSelect(complete:Handler = null):void
		{
			this.completeHandler = complete;
			ClickSelectTool.isClickSelectState = true;
			this.clickSelectChange();
		}
		
		private clickSelectChange():void
		{		
			if (!Browser.onPC) return;
			this.tSelectTar = null;
			this.clearSelectTip();
			if (ClickSelectTool.isClickSelectState)
			{
				Laya.timer.loop(200, this, this.updateSelectTar, null, true);
			}else
			{
				Laya.timer.clear(this, this.updateSelectTar);
			}
		}
		private clearSelectTip():void
		{
			this._selectTip.removeSelf();
		}
		private _selectTip:Sprite=new Sprite();
		private tSelectTar:Sprite;
		private updateSelectTar():void
		{
			this.clearSelectTip();
			this.tSelectTar = DisplayHook.instance.getDisUnderMouse();
			if (!this.tSelectTar)
			{
				return;
			} 
			if (DebugInfoLayer.I.isDebugItem(this.tSelectTar)) return;
			var g:Graphics;
			g = this._selectTip.graphics;
			g.clear();
			var rec:Rectangle;
			rec = NodeUtils.getGRec(this.tSelectTar);
			DebugInfoLayer.I.popLayer.addChild(this._selectTip);
			//_selectTip.alpha = 0.2;
			g.drawRect(0, 0, rec.width, rec.height, null,DebugConsts.CLICK_SELECT_COLOR,2);
			this._selectTip.pos(rec.x, rec.y);
		}
		 static ignoreDebugTool:boolean = false;
		private itemClicked(tar:Sprite):void
		{
			if (!ClickSelectTool.isClickSelectState) return;
			if (ClickSelectTool.ignoreDebugTool)
			{
				if (DebugInfoLayer.I.isDebugItem(tar)) return;
			}

			DebugTool.showDisBound(tar);
			if (this.completeHandler)
			{
				this.completeHandler.runWith(tar);
			}
			ClickSelectTool.isClickSelectState = false;
			this.clickSelectChange();
		}
	}


