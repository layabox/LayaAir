import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Box } from "laya/ui/Box";
import { Clip } from "laya/ui/Clip";
import { Label } from "laya/ui/Label";
import { Tree } from "laya/ui/Tree";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";
import { XML } from "laya/html/XML";

export class UI_Tree {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;
		Laya.init(550, 400).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			var res: any[] = ["res/ui/vscroll.png",
				"res/ui/vscroll$bar.png",
				"res/ui/vscroll$down.png",
				"res/ui/vscroll$up.png",
				"res/ui/tree/clip_selectBox.png",
				"res/ui/tree/clip_tree_folder.png",
				"res/ui/tree/clip_tree_arrow.png"];

			Laya.loader.load(res, new Handler(this, this.onLoadComplete));
		});

	}

	private onLoadComplete(e: any = null): void {
		// 组装tree的数据
		var treeData: string = "<data>";
		for (var i: number = 0; i < 5; ++i) {
			treeData += "<item label='Directory " + (i + 1) + "' isOpen='true'>";
			for (var j: number = 0; j < 5; ++j) {
				treeData += "<leaf label='File " + (j + 1) + "'/>";
			}
			treeData += "</item>";
		}
		treeData += "</data>";
		// 解析tree的数据
		var xml: any = new XML(treeData);

		var tree: Tree = new Tree();
		tree.scrollBarSkin = "res/ui/vscroll.png";
		tree.itemRender = Item;
		tree.xml = xml;
		tree.size(300, 300);
		tree.x = (Laya.stage.width - tree.width) / 2;
		tree.y = (Laya.stage.height - tree.height) / 2;
		this.Main.box2D.addChild(tree);
	}
}



// 此类对应的json对象：
// {"child": [{"type": "Clip", "props": {"x": "13", "y": "0", "left": "12", "height": "24", "name": "selectBox", "skin": "ui/clip_selectBox.png", "right": "0", "clipY": "2"}}, {"type": "Clip", "props": {"y": "4", "x": "14", "name": "folder", "clipX": "1", "skin": "ui/clip_tree_folder.png", "clipY": "3"}}, {"type": "Label", "props": {"y": "1", "text": "treeItem", "width": "150", "left": "33", "height": "22", "name": "label", "color": "#ffff00", "right": "0", "x": "33"}}, {"type": "Clip", "props": {"x": "0", "name": "arrow", "y": "5", "skin": "ui/clip_tree_arrow.png", "clipY": "2"}}], "type": "Box", "props": {"name": "render", "right": "0", "left": "0"}};
class Item extends Box {
	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		super();
		this.Main = maincls;
		this.right = 0;
		this.left = 0;

		var selectBox: Clip = new Clip("res/ui/tree/clip_selectBox.png", 1, 2);
		selectBox.name = "selectBox";//设置 selectBox 的name 为“selectBox”时，将被识别为树结构的项的背景。2帧：悬停时背景、选中时背景。	
		selectBox.height = 32;
		selectBox.x = 13;
		selectBox.left = 12;
		this.addChild(selectBox);

		var folder: Clip = new Clip("res/ui/tree/clip_tree_folder.png", 1, 3);
		folder.name = "folder";//设置 folder 的name 为“folder”时，将被识别为树结构的文件夹开启状态图表。2帧：折叠状态、打开状态。
		folder.x = 14;
		folder.y = 4;
		this.addChild(folder);

		var label: Label = new Label("treeItem");
		label.name = "label";//设置 label 的name 为“label”时，此值将用于树结构数据赋值。
		label.fontSize = 20;
		label.color = "#FFFFFF";
		label.padding = "6,0,0,13";
		label.width = 150;
		label.height = 30;
		label.x = 33;
		label.y = 1;
		label.left = 33;
		label.right = 0;
		this.addChild(label);

		var arrow: Clip = new Clip("res/ui/tree/clip_tree_arrow.png", 1, 2);
		arrow.name = "arrow";//设置 arrow 的name 为“arrow”时，将被识别为树结构的文件夹开启状态图表。2帧：折叠状态、打开状态。
		arrow.x = 0;
		arrow.y = 5;
		this.addChild(arrow);
	}
}


