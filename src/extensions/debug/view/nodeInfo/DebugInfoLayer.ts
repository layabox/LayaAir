import { Laya } from "Laya";
import { Event } from "laya/events/Event"
import { DisControlTool } from "../../tools/DisControlTool"
import { Sprite } from "laya/display/Sprite";
	/**
	 * ...
	 * @author ww
	 */
	export class DebugInfoLayer extends Sprite
	{
		 static I:DebugInfoLayer;
		 nodeRecInfoLayer:Sprite;
		 lineLayer:Sprite;
		 txtLayer:Sprite;
		 popLayer:Sprite;
		 graphicLayer:Sprite;
		 cacheViewLayer:Sprite;
		
		constructor(){
			super();
			this.nodeRecInfoLayer = new Sprite();
			this.lineLayer = new Sprite();
			this.txtLayer = new Sprite();
			this.popLayer = new Sprite();
			this.graphicLayer = new Sprite();
			this.cacheViewLayer = new Sprite();
			
			this.nodeRecInfoLayer.name = "nodeRecInfoLayer";
			this.lineLayer.name = "lineLayer";
			this.txtLayer.name = "txtLayer";
			this.popLayer.name = "popLayer";
			this.graphicLayer.name = "graphicLayer";
			this.cacheViewLayer.name = "cacheViewLayer";
			
			this.addChild(this.lineLayer);
			this.addChild(this.cacheViewLayer);
			this.addChild(this.nodeRecInfoLayer);
			this.addChild(this.txtLayer);
			this.addChild(this.popLayer);
			this.addChild(this.graphicLayer);
			
			DebugInfoLayer.I = this;
			this.zOrder = 999;
			//if (Browser.onMobile) this.scale(2, 2);
			Laya.stage.on(Event.DOUBLE_CLICK, this, this.setTop);
		}
		static init():void
		{
			if (!DebugInfoLayer.I)
			{
				new DebugInfoLayer();
				Laya.stage.addChild(DebugInfoLayer.I);
			}
		}
		setTop():void
		{
			DisControlTool.setTop(this);
		}
		isDebugItem(sprite:Sprite):boolean
		{
			return DisControlTool.isInTree(this, sprite);
		}
		
	}


