import { Laya } from "Laya";
import { Animation } from "laya/display/Animation";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";

export class Loader_ClearTextureRes {
	private spBg: Sprite;
	private aniFly: Animation;
	private btn: Sprite;
	private txt: Text;
	private isDestroyed: boolean = false;
	private PathBg: string = "res/bg2.png";
	private PathFly: string = "res/fighter/fighter.atlas";

	/**
	 * Tips:
	 * 1. 引擎初始化后，会占用16M内存，用来存放文字图集资源，所以即便舞台没有任何对象，也会占用这部分内存；
	 * 2. 销毁 Texture 使用的图片资源后，会保留 Texture 壳，当下次渲染时，发现 Texture 使用的图片资源不存在，则自动恢复。
	 */
	constructor() {

		//初始化引擎
		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			this.init();

			//显示性能统计信息
			Stat.show();
		});

	}

	/**
	 * 初始化场景
	 */
	private init(): void {
		//创建背景
		this.spBg = Sprite.fromImage(this.PathBg);
		Laya.stage.addChild(this.spBg);

		//创建动画
		this.aniFly = new Animation();
		this.aniFly.loadAtlas(this.PathFly);
		this.aniFly.play();
		this.aniFly.pos(250, 100);
		Laya.stage.addChild(this.aniFly);

		//创建按钮
		this.btn = new Sprite().size(205, 55);
		this.btn.graphics.drawRect(0, 0, this.btn.width, this.btn.height, "#057AFB");
		this.txt = new Text();
		this.txt.text = "销毁";
		this.txt.pos(75, 15);
		this.txt.fontSize = 25;
		this.txt.color = "#FF0000";
		this.btn.addChild(this.txt);
		this.btn.pos(20, 160);
		this.btn.mouseEnabled = true;
		this.btn.name = "btnBg";
		Laya.stage.addChild(this.btn);

		//添加侦听
		this.btn.on(Event.MOUSE_UP, this, this.onMouseUp);
	}

	/**
	 * 鼠标事件响应函数
	 */
	private onMouseUp(evt: Event): void {
		if (this.isDestroyed) {
			//通过设置 visible=true ，来触发渲染，然后引擎会自动恢复资源
			this.spBg.visible = true;
			this.aniFly.visible = true;

			this.isDestroyed = false;
			this.txt.text = "销毁";
		} else {
			//通过设置 visible=false ，来停止渲染对象
			this.spBg.visible = false;
			this.aniFly.visible = false;

			//销毁 Texture 使用的图片资源
			Laya.loader.clearTextureRes(this.PathBg);
			Laya.loader.clearTextureRes(this.PathFly);

			this.isDestroyed = true;
			this.txt.text = "恢复";
		}
	}

	dispose(){
		this.btn.destroy();
		this.aniFly && this.aniFly.destroy();
		this.spBg && this.spBg.destroy();
	}
}

