import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite"
	/**
	 * 布局工具类,目前只支持水平方向布局
	 * @author ww
	 */
	export class Layouter 
	{
		
		constructor(){
			
		}
		/**
		 * 布局用的数据，与布局方法有关
		 */
		 data:any;
		/**
		 * 布局涉及的对象
		 */
		 _items:any[];
		/**
		 * 布局用的函数
		 */
		 layoutFun:Function;
		private layout():void
		{
			this.layoutFun(this._width, this._items, this.data,this._sX);
		}
		
		 set items(arr:any[])
		{
			this._items = arr;
			this.calSize();
		}
		 get items():any[]
		{
			return this._items;
		}
		/**
		 * 布局起始x
		 */
		private _sX:number=0;
		/**
		 * 布局宽
		 */
		private _width:number=0;
		 set x(v:number)
		{
			this._sX = v;
			this.changed();
		}
		 get x():number
		{
			return this._sX;
		}
		 set width(v:number)
		{
			this._width = v;
			this.changed();
		}
		 get width():number
		{
			return this._width;
		}
		
		/**
		 * 重新布局 
		 * 
		 */
		 changed():void
		{
			Laya.timer.callLater(this, this.layout);
		}
		
		/**
		 * 根据当前的对象状态计算位置大小 
		 * 
		 */
		 calSize():void
		{
			var i:number, len:number;
			var tItem:Sprite;
			tItem = this.items[0];
			this._sX = tItem.x;
			var maxX:number;
			maxX = this._sX + tItem.width;
			len = this.items.length;
			for (i = 1; i < len; i++)
			{
				tItem = this.items[i];
				if (this._sX > tItem.x)
				{
					this._sX = tItem.x;
				}
				if (maxX < tItem.x + tItem.width)
				{
					maxX = tItem.x + tItem.width;
				}
			}
			this._width = maxX - this._sX;
			
			//trace("size:",_sX,_width);
		}
	}


