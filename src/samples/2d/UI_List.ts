/**
description
 创建垂直列表，显示多张图片，支持选择和滚动
 */
import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Box } from "laya/ui/Box";
import { Image } from "laya/ui/Image";
import { List } from "laya/ui/List";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";
import { ScrollType } from "laya/ui/Styles";
import { Sprite } from "laya/display/Sprite";
import { Texture } from "laya/resource/Texture";

export class UI_List {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(800, 600).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.setup();
		});

	}
	private _list: List;
	private setup(): void {
		var list: List = new List();

		list.itemRender = ListItem;
		list.repeatX = 1;
		list.repeatY = 4;
		// list.spaceY = 10;
		list.x = (Laya.stage.width - Item.WID) / 2;
		list.y = (Laya.stage.height - Item.HEI * list.repeatY) / 2;

		// 使用但隐藏滚动条
		list.vScrollBarSkin = "";
		list.scrollType = ScrollType.Vertical;
		list.scrollBar.elasticBackTime = 0;
		list.scrollBar.elasticDistance = 0;
		list.selectEnable = true;
		list.selectHandler = new Handler(this, this.onSelect);

		list.renderHandler = new Handler(this, this.updateItem);
		this.Main.box2D.addChild(list);

		//			list.mouseHandler = new Handler(this,onMuseHandler);
		//@ts-ignore
		window.list = list;
		// 设置数据项为对应图片的路径
		var data: any[] = [];
		for (var i: number = 0; i < 10; ++i) {
			data.push("res/ui/listskins/1.jpg");
			data.push("res/ui/listskins/2.jpg");
			data.push("res/ui/listskins/3.jpg");
			data.push("res/ui/listskins/4.jpg");
			data.push("res/ui/listskins/5.jpg");
		}
		list.array = data;
		this._list = list;

		
		let sprite = new Sprite();
		sprite.name = "ttt";
		sprite.x = 100;
		sprite.y = 100;
		let texture:Texture;// = new Texture();
		// sprite.texture = texture;
		let child;
		this.Main.box2D.addChild(sprite);

		Laya.timer.once(1000, this, () => {
			child = list.getCell(1);
			child.cacheAs = "bitmap";
		});

		Laya.timer.frameLoop(1, this, () => {

			if (!texture && child) {
				texture = new Texture();
				sprite.texture = texture;
				(child as ListItem)._list.scrollBar.value = 50;

				let firstChild = list.getCell(0);
				(firstChild as ListItem)._list.scrollBar.value = 50;
			}

			if (child && child._drawOriRT) { 
				texture.setTo(child._drawOriRT);
				sprite.graphics.repaint();
			}
		});
	}

	private _itemHeight: number;
	private _oldY: number;
	private onMuseHandler(type: Event, index: number): void {
		console.log("type:" + type.type + "ddd--" + this._list.scrollBar.value + "---index:" + index);
		var curX: number, curY: number;
		if (type.type == "mousedown") {
			this._oldY = Laya.stage.mouseY;
			let itemBox = this._list.getCell(index);
			this._itemHeight = itemBox.height;
		} else if (type.type == "mouseout") {
			curY = Laya.stage.mouseY;
			var chazhiY: number = Math.abs(curY - this._oldY);
			var tempIndex: number = Math.ceil(chazhiY / this._itemHeight);
			console.log("----------tempIndex:" + tempIndex + "---_itemHeight:" + this._itemHeight + "---chazhiY:" + chazhiY);
			var newIndex: number;
			//				if(curY > _oldY)
			//				{
			//					//向下
			//					newIndex = index + tempIndex;
			//					_list.tweenTo(newIndex);
			//				}else
			//				{
			//					//向上
			//					newIndex = index - tempIndex;
			//					_list.tweenTo(newIndex);
			//				}
		}
	}

	private updateItem(cell: ListItem, index: number): void {
		cell.setData(cell.dataSource);
	}

	private onSelect(index: number): void {
		console.log("当前选择的索引：" + index);
	}
}

class ListItem extends Box {
	_list: List;
	constructor() {
		super();

		this.size(Item.WID, Item.HEI);
		let list = this._list = new List();
		this.addChild(this._list);
		list.itemRender = Item;

		list.hScrollBarSkin = "";
		list.scrollType = ScrollType.Horizontal;
		list.scrollBar.elasticBackTime = 0;
		list.scrollBar.elasticDistance = 0;
		list.selectEnable = true;
		list.spaceX = 10;
		// list.spaceY = 10;
		list.repeatX = 1;
		list.repeatY = 1;
		// list.height = Item.HEI * 2;

		list.renderHandler = new Handler(this, this.updateItem);

	}

	private updateItem(cell: Item, index: number): void {
		cell.setImg(cell.dataSource);
	}

	setData(src: string): void {
		this._list.array = [src, src, src];
	}

}

class Item extends Box {
	static WID: number = 428;
	static HEI: number = 85;

	private img: Image;
	constructor(maincls: typeof Main) {
		super();
		this.size(Item.WID, Item.HEI);
		this.img = new Image();
		this.addChild(this.img);
	}

	setImg(src: string): void {
		this.img.skin = src;
	}
}

