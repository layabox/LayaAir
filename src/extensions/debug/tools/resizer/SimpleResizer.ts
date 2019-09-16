import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite"
import { Event } from "laya/events/Event"
import { Point } from "laya/maths/Point"
	/**
	 * ...
	 * @author ww
	 */
	export class SimpleResizer 
	{
		
		constructor(){
			
		}
		 static setResizeAble(clickItem:Sprite, tar:Sprite,minWidth:number=150,minHeight:number=150):void
		{
			clickItem.on(Event.MOUSE_DOWN, null, SimpleResizer.onMouseDown,[tar,minWidth,minHeight]);
		}
		private static onMouseDown(tar:Sprite,minWidth:number,minHeight:number,e:Event):void
		{
			SimpleResizer.clearEvents();
			if (!tar) return;
			SimpleResizer.preMousePoint.setTo(Laya.stage.mouseX, Laya.stage.mouseY);
			SimpleResizer.preTarSize.setTo(tar.width, tar.height);
			SimpleResizer.preScale.setTo(1, 1);
			var rTar:Sprite;
			rTar = tar;
			while (rTar&&rTar!=Laya.stage)
			{
				SimpleResizer.preScale.x *= rTar.scaleX;
				SimpleResizer.preScale.y *= rTar.scaleY;
				rTar = (<Sprite>rTar.parent );
			}
			//trace("scale:", preScale.x, preScale.y);
			//preScale.setTo(2, 2);
			//Laya.stage.on(Event.MOUSE_MOVE, null, onMouseMoving,[tar]);
			Laya.stage.on(Event.MOUSE_UP, null, SimpleResizer.onMouseMoveEnd);
			Laya.timer.loop(100, null, SimpleResizer.onMouseMoving, [tar,minWidth,minHeight]);
		}
		private static preMousePoint:Point = new Point();
		private static preTarSize:Point = new Point();
		private static preScale:Point = new Point();
		private static onMouseMoving(tar:Sprite,minWidth:number,minHeight:number,e:Event):void
		{
			var tWidth:number = (Laya.stage.mouseX - SimpleResizer.preMousePoint.x) / SimpleResizer.preScale.x + SimpleResizer.preTarSize.x;
			var tHeight:number=(Laya.stage.mouseY - SimpleResizer.preMousePoint.y)/SimpleResizer.preScale.y + SimpleResizer.preTarSize.y;
			tar.width = tWidth > minWidth?tWidth:minWidth;
			tar.height = tHeight>minHeight?tHeight:minHeight;
		}
		private static onMouseMoveEnd(e:Event):void
		{
			SimpleResizer.clearEvents();
		}
		private static clearEvents():void
		{
			Laya.timer.clear(null, SimpleResizer.onMouseMoving);
			//Laya.stage.off(Event.MOUSE_MOVE, null, onMouseMoving);
			Laya.stage.off(Event.MOUSE_UP, null, SimpleResizer.onMouseMoveEnd);
		}
	}


