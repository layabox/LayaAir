import { Laya } from "Laya";
import { Main } from "./../Main";
import { Sprite } from "laya/display/Sprite"
import { Stage } from "laya/display/Stage"
import { Text } from "laya/display/Text"
import { Event } from "laya/events/Event"
import { Image } from "laya/ui/Image"

export class SmartScale_T {

	//所有适配模式
	private modes: any[] = ["noscale", "exactfit", "showall", "noborder", "full", "fixedwidth", "fixedheight"];
	//当前适配模式索引
	private index: number = 0;
	//全局文本信息
	private txt: Text;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;
		Laya.init(1136, 640).then(() => {
			//设置适配模式
			Laya.stage.scaleMode = "noscale";
			//设置横竖屏
			Laya.stage.screenMode = Stage.SCREEN_HORIZONTAL;
			//设置水平对齐
			Laya.stage.alignH = "center";
			//设置垂直对齐
			Laya.stage.alignV = "middle";

			//实例一个背景
			var bg: Image = new Image();
			bg.skin = "res/bg.jpg";
			this.Main.box2D.addChild(bg);

			//实例一个文本
			this.txt = new Text();
			this.txt.text = "点击我切换适配模式(noscale)";
			this.txt.bold = true;
			this.txt.pos(0, 200);
			this.txt.fontSize = 30;
			this.txt.on("click", this, this.onTxtClick);
			this.Main.box2D.addChild(this.txt);

			//实例一个小人，放到右上角，并相对布局
			var boy1: Image = new Image();
			boy1.skin = "res/cartoonCharacters/1.png";
			boy1.top = 0;
			boy1.right = 0;
			boy1.on("click", this, this.onBoyClick);
			this.Main.box2D.addChild(boy1);

			//实例一个小人，放到右下角，并相对布局
			var boy2: Image = new Image();
			boy2.skin = "res/cartoonCharacters/2.png";
			boy2.bottom = 0;
			boy2.right = 0;
			boy2.on("click", this, this.onBoyClick);
			this.Main.box2D.addChild(boy2);

			//侦听点击事件，输出坐标信息
			Laya.stage.on("click", this, this.onClick);
			Laya.stage.on("resize", this, this.onResize);
		});

	}

	private onBoyClick(e: Event): void {
		//点击后小人会放大缩小
		var boy: Sprite = e.target;
		if (boy.scaleX === 1) {
			boy.scale(1.2, 1.2);
		} else {
			boy.scale(1, 1);
		}
	}

	private onTxtClick(e: Event): void {
		//点击后切换适配模式
		e.stopPropagation();
		this.index++;
		if (this.index >= this.modes.length) this.index = 0;
		Laya.stage.scaleMode = this.modes[this.index];
		this.txt.text = "点击我切换适配模式" + "(" + this.modes[this.index] + ")";
	}

	private onClick(e: Event): void {
		//输出坐标信息
		console.log("mouse:", Laya.stage.mouseX, Laya.stage.mouseY);
	}

	private onResize(): void {
		//输出当前适配模式下的stage大小
		console.log("size:", Laya.stage.width, Laya.stage.height);
	}
}

