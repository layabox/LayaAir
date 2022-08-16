import { Sprite } from "laya/display/Sprite";
import { Point } from "laya/maths/Point";
import { Graphics } from "laya/display/Graphics";
import { Event } from "laya/events/Event";
import { Laya } from "Laya";
	export class DragBox extends Sprite {
		private static BLOCK_WIDTH:number = 6;
		private _box:Sprite;
		private _left:Sprite = this.drawBlock();
		private _right:Sprite = this.drawBlock();
		private _top:Sprite = this.drawBlock();
		private _bottom:Sprite = this.drawBlock();
		private _topLeft:Sprite = this.drawBlock();
		private _topRight:Sprite = this.drawBlock();
		private _bottomLeft:Sprite = this.drawBlock();
		private _bottomRight:Sprite = this.drawBlock();
		private _target:Sprite;
		private _lastPoint:Point = new Point();
		private _currDir:Sprite;
		/**0-无，1-水平，2-垂直，3-全部*/
		private _type:number;
		
		constructor(type:number){
			super();
this._type =type=3;
			this.addChild(this._box = this.drawBorder(0, 0, 0xff0000));
			//_box.mouseEnabled=true;
			if (type == 1 || type == 3) {
				this.addChild(this._left);
				this.addChild(this._right);
			}
			if (type == 2 || type == 3) {
				this.addChild(this._top);
				this.addChild(this._bottom);
			}
			if (type == 3) {
				this.addChild(this._topLeft);
				this.addChild(this._topRight);
				this.addChild(this._bottomLeft);
				this.addChild(this._bottomRight);
			}
			this.on(Event.MOUSE_DOWN, this,this.onMouseDown);
			this.mouseThrough=true;
			
		}
		private fixScale:number;
		private onMouseDown(e:Event):void {
			this._currDir = (<Sprite>e.target );
			if(e.shiftKey)
			{
				this.initFixScale();
			}
			if (this._currDir != this) {
				this._lastPoint.x = Laya.stage.mouseX;
				this._lastPoint.y = Laya.stage.mouseY;
				Laya.stage.on(Event.MOUSE_MOVE, this,this.onMouseMove);
				Laya.stage.on(Event.MOUSE_UP, this,this.onMouseUp);
				e.stopPropagation();
			}
		}
		
		protected onMouseUp(e:Event):void {
			Laya.stage.off(Event.MOUSE_MOVE, this,this.onMouseMove);
			Laya.stage.off(Event.MOUSE_UP, this,this.onMouseUp);
		}
		private initFixScale():void
		{
			this.fixScale=this._target.height / this._target.width;
		}
		protected onMouseMove(e:Event):void {
			
			var scale:number =1;
			var tx:number = (Laya.stage.mouseX - this._lastPoint.x) / scale;
			var ty:number = (Laya.stage.mouseY - this._lastPoint.y) / scale;
			var sameScale:boolean = false;
			var adptX:number;
			var adptY:number;
			if(e.shiftKey)
			{			
				if(this.fixScale<0) this.initFixScale();
//				ty=Math.ceil(tx/_target.width*_target.height);
				adptY = tx * this.fixScale;
				adptX=ty/this.fixScale;
				sameScale = true;
				switch(this._currDir)
				{
					case this._topLeft:
					case this._bottomLeft:
						this._currDir = this._left;
						break;
					case this._topRight:
					case this._bottomRight:
						this._currDir = this._right;
						break;
				}
			}
			if (tx != 0 || ty != 0) {
				this._lastPoint.x += tx * scale;
				this._lastPoint.y += ty * scale;
				var tw:number = tx / this._target.scaleX;
				var th:number = ty / this._target.scaleY;			
				if (this._currDir == this._left) {
					this._target.x += tx;
					this._target.width -= tw;
					if (sameScale)
					{
//						_target.height -= adptY / _target.scaleY;
						this._target.height=this._target.width*this.fixScale;
					}
				} else if (this._currDir == this._right) {
					this._target.width += tw;
					if (sameScale)
					{
//						_target.height+=adptY / _target.scaleY;
						this._target.height=this._target.width*this.fixScale;
					}
				} else if (this._currDir == this._top) {
					this._target.y += ty;
					this._target.height -= th;
					if (sameScale)
					{
//						_target.width -= adptX / _target.scaleX;
						this._target.width=this._target.height/this.fixScale;
					}
				} else if (this._currDir == this._bottom) {
					this._target.height += th;
					if (sameScale)
					{
//						_target.width+=adptX / _target.scaleX;
						this._target.width=this._target.height/this.fixScale;
					}
				} else if (this._currDir == this._topLeft) {
					this._target.x += tx;
					this._target.y += ty;
					this._target.width -= tw;
					this._target.height -= th;
					
				} else if (this._currDir == this._topRight) {
					this._target.y += ty;
					this._target.width += tw;
					this._target.height -= th;
				} else if (this._currDir == this._bottomLeft) {
					this._target.x += tx;
					this._target.width -= tw;
					this._target.height += th;
				} else if (this._currDir == this._bottomRight) {
					this._target.width += tw;
					this._target.height += th;
				}
				
				if (this._target.width < 1) {
					this._target.width = 1;
				}
				if (this._target.height < 1) {
					this._target.height = 1;
				}
				//
				//if (_target is Sprite) {
					//var bg:Sprite = Sprite(_target).getChildByName("bg") as Sprite;
					//if (bg) {
						//bg.width = _target.width;
						//bg.height = _target.height;
					//}
				//}
				this._target.width = Math.round(this._target.width);
				this._target.x = Math.round(this._target.x);
				this._target.y = Math.round(this._target.y);
				this._target.height = Math.round(this._target.height);
				this.refresh();
			}
		}
		
		/**画矩形*/
		private drawBorder(width:number, height:number, color:number, alpha:number = 1):Sprite {
			var box:Sprite = new Sprite();
			var g:Graphics = box.graphics;
			g.clear();
			//g.lineStyle(1, color, 1, false, LineScaleMode.NONE);
			g.drawRect(0, 0, width, height,null,"#"+color);
			return box;
		}
		
		/**画矩形*/
		private drawBlock():Sprite {
			var box:Sprite = new Sprite();
			var g:Graphics = box.graphics;
			g.clear();
			//g.beginFill(0xffffff, 1);
			//g.lineStyle(1, 0xff0000);
			box.width = DragBox.BLOCK_WIDTH;
			box.height = DragBox.BLOCK_WIDTH;
			g.drawRect(-DragBox.BLOCK_WIDTH * 0.5, -DragBox.BLOCK_WIDTH * 0.5, DragBox.BLOCK_WIDTH, DragBox.BLOCK_WIDTH,"#ffffff","#ff0000",1);
			//g.endFill();
			box.mouseEnabled=true;
			box.mouseThrough=true;
			return box;
		}
		
		/**设置对象*/
		 setTarget(target:Sprite):void {
			this._target = target;
			this.refresh();
		}
		
		 refresh():void {
			this.changePoint();
			this.changeSize();
		}
		
		private changePoint():void {
			var p:Point = this._target.localToGlobal(new Point());
			var np:Point = ((<Sprite>this.parent )).globalToLocal(p);
			this.x = np.x;
			this.y = np.y;
		}
		
		/**设置大小*/
		private changeSize():void {
			var width:number = this._target.width * this._target.scaleX;
			var height:number = this._target.height * this._target.scaleY;
			//var rect:Rectangle = _target.getRect(_target.parent);
			//var rect:Rectangle = _target.getBounds();
			console.log("change size");
			this.rotation=this._target.rotation;
			//this.pivot(_target.pivotX,_target.pivotY);
			if (this._box.width != width || this._box.height != height) {
//				_box.width = Math.abs(width);
//				_box.height = Math.abs(height);
				this._box.graphics.clear();
				this._box.graphics.drawRect(0, 0, Math.abs(width), Math.abs(height),null,"#ff0000");
				this._box.size(width,height);
				this.size(width,height);
				this._box.scaleX = Math.abs(this._box.scaleX) * (this._target.scaleX > 0 ? 1 : -1);
				this._box.scaleY = Math.abs(this._box.scaleY) * (this._target.scaleY > 0 ? 1 : -1);
				this._left.x = 0;
				this._left.y = height * 0.5;
				this._right.x = width;
				this._right.y = height * 0.5;
				this._top.x = width * 0.5;
				this._top.y = 0;
				this._bottom.x = width * 0.5;
				this._bottom.y = height;
				this._topLeft.x = this._topLeft.y = 0;
				this._topRight.x = width;
				this._topRight.y = 0;
				this._bottomLeft.x = 0;
				this._bottomLeft.y = height;
				this._bottomRight.x = width;
				this._bottomRight.y = height;
			}
		}
	}

