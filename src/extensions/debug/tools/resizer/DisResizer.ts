import { AutoFillRec } from "./AutoFillRec";
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite"
import { Event } from "laya/events/Event"
import { Rectangle } from "laya/maths/Rectangle"
import { DisControlTool } from "../DisControlTool"

	/**
	 * 本类用于调整对象的宽高以及坐标
	 * @author ww
	 */
	export class DisResizer 
	{
		/**
		 * 最边缘的拖动条
		 */
		static Side:number = 2;
		/**
		 * 垂直方向的拖动条
		 */
		static Vertical:number = 1;
		/**
		 * 水平方向的拖动条
		 */
		static Horizon:number = 0;

		constructor(){}
		private static _up:AutoFillRec;
		private static _down:AutoFillRec;
		private static _left:AutoFillRec;
		private static _right:AutoFillRec;
		
		private static _barList:any[];
		private static _tar:Sprite;
		static barWidth:number = 2;
		static useGetBounds:boolean=false;
		static init():void
		{
			if (DisResizer._up) return;
			
			DisResizer._up=new AutoFillRec("T");
			DisResizer._up.height = DisResizer.barWidth;
			DisResizer._up.type = DisResizer.Horizon;
			
			DisResizer._down=new AutoFillRec("T");
			DisResizer._down.height = DisResizer.barWidth;
			DisResizer._down.type = DisResizer.Horizon;
			
			DisResizer._left=new AutoFillRec("R");
			DisResizer._left.width = DisResizer.barWidth;
			DisResizer._left.type = DisResizer.Vertical;
			
			DisResizer._right=new AutoFillRec("R");
			DisResizer._right.width = DisResizer.barWidth;
			DisResizer._right.type =DisResizer.Vertical;
			
			DisResizer._barList = [DisResizer._up, DisResizer._down, DisResizer._left, DisResizer._right];
			DisResizer.addEvent();
		}
		private static stageDown(e:Event):void
		{
			var target:Sprite;
			target = (<Sprite>e.target );
		    if (DisResizer._tar && DisControlTool.isInTree(DisResizer._tar, target))
			{
				return;
			}
			DisResizer.clear();
		}
		static clear():void
		{
			DisResizer._tar = null;
			Laya.stage.off(Event.MOUSE_UP, null, DisResizer.stageDown);
			DisControlTool.removeItems(DisResizer._barList);
			DisResizer.clearDragEvents();
		}
		private static addEvent():void
		{
			var i:number, len:number;
			var tBar:AutoFillRec;
			len = DisResizer._barList.length;
			for (i = 0; i < len; i++)
			{
				tBar = DisResizer._barList[i];
				tBar.on(Event.MOUSE_DOWN, null, DisResizer.barDown);
			}
		}
		private static tBar:AutoFillRec;
		private static barDown(e:Event):void
		{
			DisResizer.clearDragEvents();
			DisResizer.tBar = (<AutoFillRec>e.target );
			if (!DisResizer.tBar) return;
			var area:Rectangle;
			area = new Rectangle();
			if (DisResizer.tBar.type == DisResizer.Horizon)
			{
				area.x = DisResizer.tBar.x;
				area.width = 0;
				area.y = DisResizer.tBar.y - 200;
				area.height = 400;
			}else
			{
				area.x = DisResizer.tBar.x-200;
				area.width = 400;
				area.y = 0;
				area.height = 0;
			}
			var option:any;
			option = { };
			option.area = area;
			DisResizer.tBar.record();
			//tBar.startDrag(option);
			DisResizer.tBar.startDrag(area);
			DisResizer.tBar.on(Event.DRAG_MOVE, null, DisResizer.draging);
			DisResizer.tBar.on(Event.DRAG_END, null, DisResizer.dragEnd);
		}
		private static draging(e:Event):void
		{
			console.log("draging");
			if (!DisResizer.tBar) return;
			if (!DisResizer._tar) return;
			switch(DisResizer.tBar)
			{
				case DisResizer._left:
					DisResizer._tar.x += DisResizer.tBar.getDx();
					DisResizer._tar.width -= DisResizer.tBar.getDx();
					DisResizer._up.width -= DisResizer.tBar.getDx();
					DisResizer._down.width-=DisResizer.tBar.getDx();
					
					DisResizer._right.x -= DisResizer.tBar.getDx();		
					DisResizer.tBar.x -= DisResizer.tBar.getDx();
					break;
				case DisResizer._right:
					DisResizer._tar.width += DisResizer.tBar.getDx();
					DisResizer._up.width += DisResizer.tBar.getDx();
					DisResizer._down.width+=DisResizer.tBar.getDx();
						
					break;
				case DisResizer._up:
					DisResizer._tar.y += DisResizer.tBar.getDy();
					DisResizer._tar.height -= DisResizer.tBar.getDy();
					DisResizer._right.height -= DisResizer.tBar.getDy();
					DisResizer._left.height-=DisResizer.tBar.getDy();
					
					DisResizer._down.y -= DisResizer.tBar.getDy();		
					DisResizer.tBar.y -= DisResizer.tBar.getDy();
					break;
				case DisResizer._down:

					DisResizer._tar.height += DisResizer.tBar.getDy();
					DisResizer._right.height += DisResizer.tBar.getDy();
					DisResizer._left.height+=DisResizer.tBar.getDy();
					

					break;
				
			}
			
			DisResizer.tBar.record();
		}
		private static dragEnd(e:Event):void
		{
			console.log("dragEnd");
			DisResizer.clearDragEvents();
			DisResizer.updates();
		}
		private static clearDragEvents():void
		{
			if (!DisResizer.tBar) return;
			DisResizer.tBar.off(Event.DRAG_MOVE, null, DisResizer.draging);
			DisResizer.tBar.off(Event.DRAG_END, null, DisResizer.dragEnd);
		}
		 static setUp(dis:Sprite, force:boolean = false ):void
		{
			if (force && dis == DisResizer._tar) 
			{
//				updates();
				return;
			};
			DisControlTool.removeItems(DisResizer._barList);
			if (DisResizer._tar == dis)
			{
				DisResizer._tar = null;
				DisResizer.clearDragEvents();
				if(!force)
				return;
			}
			DisResizer._tar = dis;
			DisResizer.updates();
			
			DisControlTool.addItems(DisResizer._barList, dis);
			
			Laya.stage.off(Event.MOUSE_UP, null, DisResizer.stageDown);
			Laya.stage.on(Event.MOUSE_UP, null, DisResizer.stageDown);
			
		}
		 static updates():void
		{
			var dis:Sprite;
			dis=DisResizer._tar;
			if(!dis) return;
			var bounds:Rectangle;
//			bounds=dis.getSelfBounds();
			bounds=new Rectangle(0,0,dis.width,dis.height);
			
			DisResizer._up.x=bounds.x;
			DisResizer._up.y=bounds.y;
			DisResizer._up.width=bounds.width;
			
			DisResizer._down.x=bounds.x;
			DisResizer._down.y=bounds.y+bounds.height-DisResizer.barWidth;
			DisResizer._down.width=bounds.width;
			
			DisResizer._left.x=bounds.x;
			DisResizer._left.y=bounds.y;
			DisResizer._left.height=bounds.height;
			
			DisResizer._right.x=bounds.x+bounds.width-DisResizer.barWidth;
			DisResizer._right.y=bounds.y;
			DisResizer._right.height=bounds.height;
		}
		
	}

DisControlTool.resizeHandler = DisResizer.setUp;
