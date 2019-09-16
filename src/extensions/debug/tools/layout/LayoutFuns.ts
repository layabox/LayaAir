import { Layouter } from "./Layouter";
import { Sprite } from "laya/display/Sprite"
	
	/**
	 * ...
	 * @author ww
	 */
	export class LayoutFuns
	{
		
		constructor(){
		
		}
		
		/**
		 * 水平等宽布局
		 * @param totalWidth
		 * @param items
		 * @param data
		 * @param sX
		 *
		 */
		 static sameWidth(totalWidth:number, items:any[], data:any = null, sX:number = 0):void
		{
			var dWidth:number = 0;
			if (data && data.dWidth)
				dWidth = data.dWidth;
			var perWidth:number;
			perWidth = (totalWidth - (items.length - 1) * dWidth) / items.length;
			var tItem:Sprite;
			var i:number, len:number;
			var tX:number;
			tX = sX;
			len = items.length;
			for (i = 0; i < len; i++)
			{
				tItem = items[i];
				tItem.x = tX;
				tItem.width = perWidth;
				tX += dWidth + perWidth;
			}
		}
		
		 static getSameWidthLayout(items:any[], dWidth:number):Layouter
		{
			var data:any;
			data = {};
			data.dWidth = dWidth;
			return LayoutFuns.getLayouter(items, data, LayoutFuns.sameWidth);
		}
		
		 static getLayouter(items:any[], data:any, fun:Function):Layouter
		{
			var layouter:Layouter;
			layouter = new Layouter();
			layouter.items = items;
			layouter.data = data;
			layouter.layoutFun = fun;
			return layouter;
		}
		
		/**
		 * 水平等间距布局
		 * @param totalWidth
		 * @param items
		 * @param data
		 * @param sX
		 *
		 */
		 static sameDis(totalWidth:number, items:any[], data:any = null, sX:number = 0):void
		{
			var dWidth:number;
			dWidth = totalWidth;
			var tItem:Sprite;
			var i:number, len:number;
			len = items.length;
			LayoutFuns.prepareForLayoutWidth(totalWidth, items);
			for (i = 0; i < len; i++)
			{
				tItem = items[i];
				dWidth -= tItem.width;
			}
			if (items.length > 1)
				dWidth = dWidth / (items.length - 1);
			var tX:number;
			tX = sX;
			len = items.length;
			for (i = 0; i < len; i++)
			{
				tItem = items[i];
				tItem.x = tX;
				tX += dWidth + tItem.width;
			}
		}
		
		 static getSameDisLayout(items:any[], rateSame:boolean = false):Layouter
		{
			var data:any;
			data = {};
			if (rateSame)
			{
				var i:number, len:number;
				len = items.length;
				var tItem:Sprite;
				var totalWidth:number;
				totalWidth = 0;
				for (i = 0; i < len; i++)
				{
					tItem = items[i];
					totalWidth += tItem.width;
				}
				totalWidth = tItem.x + tItem.width;
				for (i = 0; i < len; i++)
				{
					tItem = items[i];
					LayoutFuns.setItemRate(tItem, tItem.width / totalWidth);
				}
			}
			
			return LayoutFuns.getLayouter(items, data, LayoutFuns.sameDis);
		}
		
		/**
		 * 水平铺满布局
		 * @param totalWidth
		 * @param items
		 * @param data
		 * @param sX
		 *
		 */
		 static fullFill(totalWidth:number, items:any[], data:any = null, sX:number = 0):void
		{
			var dL:number = 0, dR:number = 0;
			if (data)
			{
				if (data.dL)
					dL = data.dL;
				if (data.dR)
					dR = data.dR;
			}
			var item:Sprite;
			var i:number, len:number;
			len = items.length;
			for (i = 0; i < len; i++)
			{
				item = items[i];
				item.x = sX + dL;
				item.width = totalWidth - dL - dR;
			}
		
		}
		
		 static getFullFillLayout(items:any[], dL:number = 0, dR:number = 0):Layouter
		{
			var data:any;
			data = {};
			data.dL = dL;
			data.dR = dR;
			return LayoutFuns.getLayouter(items, data, LayoutFuns.fullFill);
		}
		
		/**
		 * 水平固定x绝对值或者比例布局, 并用最后一个元素铺满布局宽
		 * @param totalWidth
		 * @param items
		 * @param data
		 * @param sX
		 *
		 */
		 static fixPos(totalWidth:number, items:any[], data:any = null, sX:number = 0):void
		{
			var dLen:number = 0;
			var poss:any[] = [];
			var isRate:boolean = false;
			if (data)
			{
				if (data.dLen)
					dLen = data.dLen;
				if (data.poss)
					poss = data.poss;
				if (data.isRate)
					isRate = data.isRate;
			}
			var item:Sprite;
			var i:number, len:number;
			len = poss.length;
			var tX:number;
			tX = sX;
			var tValue:number;
			var preItem:Sprite;
			preItem = null;
			for (i = 0; i < len; i++)
			{
				item = items[i];
				tValue = sX + poss[i];
				if (isRate)
				{
					tValue = sX + poss[i] * totalWidth;
				}
				item.x = tValue;
				if (preItem)
				{
					preItem.width = item.x - dLen - preItem.x;
				}
				preItem = item;
			}
			var lastItem:Sprite;
			lastItem = items[items.length - 1];
			lastItem.width = sX + totalWidth - dLen - lastItem.x;
		}
		
		 static getFixPos(items:any[], dLen:number = 0, isRate:boolean = false, poss:any[] = null):Layouter
		{
			var data:any;
			data = {};
			var layout:Layouter;
			layout = LayoutFuns.getLayouter(items, data, LayoutFuns.fixPos);
			var i:number, len:number;
			var sX:number;
			var totalWidth:number;
			sX = layout.x;
			totalWidth = layout.width;
			if (!poss)
			{
				poss = [];
				len = items.length;
				var tValue:number;
				for (i = 0; i < len; i++)
				{
					tValue = items[i].x - sX;
					if (isRate)
					{
						tValue = tValue / totalWidth;
					}
					else
					{
						
					}
					poss.push(tValue);
				}
			}
			
			data.dLen = dLen;
			data.poss = poss;
			data.isRate = isRate;
			return layout;
		}
		
		/**
		 * 清除对象上的相对布局数据
		 * @param items
		 *
		 */
		 static clearItemsRelativeInfo(items:any[]):void
		{
			var i:number, len:number;
			len = items.length;
			for (i = 0; i < len; i++)
			{
				LayoutFuns.clearItemRelativeInfo(items[i]);
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
			item.left = Nan;
			item.right = Nan;
		}
		
		 static RateSign:string = "layoutRate";
		
		 static prepareForLayoutWidth(totalWidth:number, items:any[]):void
		{
			var i:number, len:number;
			len = items.length;
			for (i = 0; i < len; i++)
			{
				LayoutFuns.prepareItemForLayoutWidth(totalWidth, items[i]);
			}
		}
		 static getSumWidth(items:any[]):number
		{
			var sum:number;
			sum=0;
			var i:number, len:number;
			len = items.length;
			for (i = 0; i < len; i++)
			{
				sum+=items[i].width;
			}
			return sum;
		}
		 static prepareItemForLayoutWidth(totalWidth:number, item:any):void
		{
			if (LayoutFuns.getItemRate(item) > 0)
			{
				item.width = totalWidth * LayoutFuns.getItemRate(item);
			}
		}
		
		 static setItemRate(item:any, rate:number):void
		{
			item[LayoutFuns.RateSign] = rate;
		}
		
		 static getItemRate(item:any):number
		{
			return item[LayoutFuns.RateSign] ? item[LayoutFuns.RateSign] : -1;
		}
		
		
		 static FreeSizeSign:string="layoutFreeSize";
		 static setItemFreeSize(item:any,free:boolean=true):void
		{
			item[LayoutFuns.FreeSizeSign]=free;
	    }
		 static isItemFreeSize(item:any):boolean
		{
			return item[LayoutFuns.FreeSizeSign];
		}
		
		/**
		 * 锁定间距布局，需要有一个对象为freeSize，表示通过调整该对象大小来铺满宽 
		 * @param totalWidth
		 * @param items
		 * @param data
		 * @param sX
		 * 
		 */
		 static lockedDis(totalWidth:number, items:any[], data:any = null, sX:number = 0):void
		{
			var dists:any[];
			dists=data.dists;
			var sumDis:number;
			sumDis=data.sumDis;
			
			var sumWidth:number;
			
			
			
			var i:number,len:number;
			var tItem:Sprite;
			var preItem:Sprite;
			LayoutFuns.prepareForLayoutWidth(totalWidth,items);
			
			sumWidth=LayoutFuns.getSumWidth(items);
			var dWidth:number;
			dWidth=totalWidth-sumDis-sumWidth;
			
			var freeItem:Sprite;
			freeItem=LayoutFuns.getFreeItem(items);
			if(freeItem)
			{
				freeItem.width+=dWidth;
			}
			
			preItem=items[0];
			preItem.x=sX;
			len=items.length;
			for(i=1;i<len;i++)
			{
				tItem=items[i];
				tItem.x=preItem.x+preItem.width+dists[i-1];
				preItem=tItem;
			}
			
			
		}
		 static getFreeItem(items:any[]):Sprite
		{
			var i:number, len:number;
			len = items.length;
			for (i = 0; i < len; i++)
			{
				if(LayoutFuns.isItemFreeSize(items[i]))
				{
					return items[i];
				}
			}
			return null;
		}
		 static getLockedDis(items:any[]):Layouter
		{
			var data:any;
			data = {};
			
			var dists:any[];
			var i:number,len:number;
			var tItem:Sprite;
			var preItem:Sprite;
			
			var sumDis:number;
			sumDis=0;
			var tDis:number;
			preItem=items[0];
			dists=[];
			len=items.length;
			for(i=1;i<len;i++)
			{
				tItem=items[i];
				tDis=tItem.x-preItem.x-preItem.width;
				dists.push(tDis);
				sumDis+=tDis;
				preItem=tItem;
			}
			
			data.dists=dists;
			data.sumDis=sumDis;
			
			return LayoutFuns.getLayouter(items, data, LayoutFuns.lockedDis);
		}
	
	}


