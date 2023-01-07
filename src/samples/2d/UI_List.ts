import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Box } from "laya/ui/Box";
import { Image } from "laya/ui/Image";
import { List } from "laya/ui/List";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
import { Main } from "./../Main";
import { ScrollType } from "laya/ui/Styles";

export class UI_List {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		// 不支持WebGL时自动切换至Canvas
		Laya.init(800, 600, WebGL);

		Laya.stage.alignV = Stage.ALIGN_MIDDLE;
		Laya.stage.alignH = Stage.ALIGN_CENTER;

		Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
		Laya.stage.bgColor = "#232628";

		this.setup();
	}
	private _list: List;
	private setup(): void {
		var list: List = new List();

		list.itemRender = Item;
		list.repeatX = 1;
		list.repeatY = 4;

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

	private updateItem(cell: Item, index: number): void {
		cell.setImg(cell.dataSource);
	}

	private onSelect(index: number): void {
		console.log("当前选择的索引：" + index);
	}
}



class Item extends Box {
	static WID: number = 373;
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

