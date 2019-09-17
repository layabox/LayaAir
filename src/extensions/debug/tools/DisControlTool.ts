import { Laya } from "Laya";
///////////////////////////////////////////////////////////
//  DisControlTool.as
//  Macromedia ActionScript Implementation of the Class DisControlTool
//  Created on:      2015-9-25 下午7:19:44
//  Original author: ww
///////////////////////////////////////////////////////////
import { Node } from "laya/display/Node"
import { Sprite } from "laya/display/Sprite"
import { Event } from "laya/events/Event"
import { Point } from "laya/maths/Point"
import { Rectangle } from "laya/maths/Rectangle"
import { SimpleResizer } from "./resizer/SimpleResizer"
	
	/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-9-25 下午7:19:44
	 */
	export class DisControlTool
	{
		constructor(){
		}
		private static tempP:Point = new Point();
		static getObjectsUnderPoint(sprite:Sprite,x:number,y:number,rst:any[]=null,filterFun:Function=null):any[]
		{
			rst=rst?rst:[];
			if(filterFun!=null&&!filterFun(sprite)) return rst;
			if (sprite.getBounds().contains(x, y))
			{
				rst.push(sprite);
//				var i:int, len:int = sprite.numChildren;
				var tS:Sprite;
				var tempP:Point=new Point();
				tempP.setTo(x, y);
				tempP = sprite.fromParentPoint(tempP);
				x = tempP.x;
				y = tempP.y;
				for (var i:number = (sprite as any)._children.length - 1; i > -1; i--) {
					var child:Sprite = (sprite as any)._children[i];
					if(child instanceof Sprite)
						DisControlTool.getObjectsUnderPoint(child,x,y,rst,filterFun);
				}

			}
			return rst;
		}

		static getObjectsUnderGlobalPoint(sprite:Sprite,filterFun:Function=null):any[]
		{
			var point:Point = new Point();
			point.setTo(Laya.stage.mouseX, Laya.stage.mouseY);
			if(sprite.parent)
			point = ((<Sprite>sprite.parent )).globalToLocal(point);
			return DisControlTool.getObjectsUnderPoint(sprite, point.x, point.y,null,filterFun);
		}

		static findFirstObjectsUnderGlobalPoint():Sprite
		{
			var disList:any[];
			disList = DisControlTool.getObjectsUnderGlobalPoint(Laya.stage);
			if (!disList) return null;
			var i:number, len:number;
			var tDis:Sprite;
			len = disList.length;
			for (i = len-1; i>=0; i--)
			{
				tDis = disList[i];
				if (tDis && tDis.numChildren < 1)
				{
					return tDis;
				}
			}
			return tDis;
		}

		static visibleAndEnableObjFun(tar:Sprite):boolean
		{
			return tar.visible&&tar.mouseEnabled;
		}

		static visibleObjFun(tar:Sprite):boolean
		{
			return tar.visible;
		}

		static getMousePoint(sprite:Sprite):Point
		{
			var point:Point = new Point();
			point.setTo(Laya.stage.mouseX, Laya.stage.mouseY);
			point = sprite.globalToLocal(point);
			return point;
		}

		static isChildE(parent:Node, child:Node):boolean
		{
			if (!parent) return false;
			while (child)
			{
				if (child.parent == parent) return true;
				child = child.parent;
			}
			return false;
		}

		static isInTree(pNode:Node, child:Node):boolean
		{
			return pNode == child || DisControlTool.isChildE(pNode,child);
		}

		static setTop(tar:Node):void
		{
			if(tar&&tar.parent)
			{
				var tParent:Node;
				tParent=tar.parent;
				tParent.setChildIndex(tar,tParent.numChildren-1);
			}
		}
		/**
		 * 清除对象上的相对布局数据
		 * @param items
		 *
		 */
		static clearItemRelativeInfo(item:any):void
		{
			var Nan:any = "NaN";
			item.getLayout().left = Nan;
			item.getLayout().right = Nan;
			item.getLayout().top = Nan;
			item.getLayout().bottom = Nan;
		}

		static swap(tarA:Node, tarB:Node):void
		{
			if (tarA == tarB) return;
			var iA:number;
			iA = tarA.parent.getChildIndex(tarA);
			var iB:number;
			iB = tarB.parent.getChildIndex(tarB);
			var bP:Node;
			bP = tarB.parent;
			tarA.parent.addChildAt(tarB, iA);
			bP.addChildAt(tarA,iB);
		}

		static insertToTarParent(tarA:Node,tars:any[],after:boolean=false):void
		{
			var tIndex:number;
			var parent:Node;
			if(!tarA) return;
			parent=tarA.parent;
			if(!parent) return;
			tIndex=parent.getChildIndex(tarA);
			if(after) tIndex++;
			DisControlTool.insertToParent(parent,tars,tIndex);
		}

		static insertToParent(parent:Node,tars:any[],index:number=-1):void
		{
			if(!parent) return;
			if(index<0) index=parent.numChildren;
			var i:number,len:number;
			len=tars.length;
			for(i=0;i<len;i++)
			{
				DisControlTool.transParent(tars[i],(<Sprite>parent ));
				parent.addChildAt(tars[i],index);
			}
		}

		static transParent(tar:Sprite,newParent:Sprite):void
		{
			if(!tar||!newParent) return;
			if(!tar.parent) return;
			var preParent:Sprite;
			preParent=(<Sprite>tar.parent );
			var pos:Point;
			pos=new Point(tar.x,tar.y);
			pos=preParent.localToGlobal(pos);
			pos=newParent.globalToLocal(pos);
			tar.pos(pos.x,pos.y);
		}

		static transPoint(nowParent:Sprite,tarParent:Sprite,point:Point):Point
		{
			point=nowParent.localToGlobal(point);
			point=tarParent.globalToLocal(point);
			return point;
		}

		static removeItems(itemList:any[]):void
		{
			var i:number, len:number;
			len = itemList.length;
			for (i = 0; i < len; i++)
			{
				((<Node>itemList[i] )).removeSelf();
			}
		}

		static addItems(itemList:any[],parent:Node):void
		{
			var i:number, len:number;
			len = itemList.length;
			for (i = 0; i < len; i++)
			{
				parent.addChild(itemList[i]);
			}
		}

		static getAllChild(tar:Node):any[]
		{
			if(!tar) return [];
			var i:number;
			var len:number;
			var rst:any[]=[];
			len=tar.numChildren;
			for(i=0;i<len;i++)
			{
				rst.push(tar.getChildAt(i));
			}
			return rst;
		}

		static upDis(child:Node):void
		{
			if(child&&child.parent)
			{
				var tParent:Node;
				tParent=child.parent;
				var newIndex:number;
				newIndex=tParent.getChildIndex(child)+1;
				if(newIndex>=tParent.numChildren)
				{
					newIndex=tParent.numChildren-1;
				}
				console.log("setChildIndex:"+newIndex);
				tParent.setChildIndex(child,newIndex);
			}
		}
		static downDis(child:Node):void
		{
			if(child&&child.parent)
			{
				var tParent:Node;
				tParent=child.parent;
				var newIndex:number;
				newIndex=tParent.getChildIndex(child)-1;
				if(newIndex<0) newIndex=0;
				console.log("setChildIndex:"+newIndex);
				tParent.setChildIndex(child,newIndex);
			}
		}
		static setResizeAbleEx(node:Sprite):void
		{
			var clickItem:Sprite;
			clickItem = (<Sprite>node.getChildByName("resizeBtn") );
			if (clickItem)
			{
				SimpleResizer.setResizeAble(clickItem, node);
			}
			//node.on(Event.CLICK, null, resizeHandler, [node]);
		}

		static setResizeAble(node:Sprite):void
		{
			node.on(Event.CLICK, null, DisControlTool.resizeHandler, [node]);
		}

		static resizeHandler:Function;
		// (tar:Sprite):void
		// {
		// 	DisResizer.setUp(tar);
		// }

		static setDragingItem(dragBar:Sprite, tar:Sprite):void
		{
			dragBar.on(Event.MOUSE_DOWN, null, DisControlTool.dragingHandler, [tar]);
			tar.on(Event.DRAG_END, null, DisControlTool.dragingEnd, [tar]);
		}
		
		static dragingHandler(tar:Sprite):void
		{
			if (tar)
			{
				tar.startDrag();
			}
		}

		static dragingEnd(tar:Sprite):void
		{
			DisControlTool.intFyDisPos(tar);
			console.log(tar.x,tar.y);
		}

		static showToStage(dis:Sprite, offX:number = 0, offY:number = 0):void
		{
			var rec:Rectangle = dis.getBounds();
			dis.x = Laya.stage.mouseX + offX;
			dis.y = Laya.stage.mouseY + offY;
			if (dis.x + rec.width > Laya.stage.width)
			{
				dis.x -= rec.width + offX;
			}
			if (dis.y + rec.height > Laya.stage.height)
			{
				dis.y -= rec.height + offY;
				//dis.y -= 100;
			}
			DisControlTool.intFyDisPos(dis);
		}

		static intFyDisPos(dis:Sprite):void
		{
			if (!dis) return;
			dis.x = Math.round(dis.x);
			dis.y = Math.round(dis.y);
		}

		static showOnly(disList:any[], showItem:Sprite):void
		{
			var i:number, len:number;
			len = disList.length;
			for (i = 0; i < len; i++)
			{
				disList[i].visible = disList[i] == showItem;
			}
		}

		static showOnlyByIndex(disList:any[], index:number):void
		{
			DisControlTool.showOnly(disList, disList[index]);
		}

		static addOnly(disList:any[], showItem:Sprite,parent:Sprite):void
		{
			var i:number, len:number;
			len = disList.length;
			for (i = 0; i < len; i++)
			{
				if (disList[i] != showItem)
				{
					disList[i].removeSelf();
				}else
				{
					parent.addChild(disList[i]);
				}
			}
		}

		static addOnlyByIndex(disList:any[], index:number,parent:Sprite):void
		{
			DisControlTool.addOnly(disList, disList[index],parent);
		}
	}

