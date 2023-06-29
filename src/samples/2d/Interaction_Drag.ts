import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Rectangle } from "laya/maths/Rectangle";
import { Texture } from "laya/resource/Texture";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class Interaction_Drag {
	private ApePath: string = "res/apes/monkey2.png";

	private ape: Sprite;
	private dragRegion: Rectangle;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
			//
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			//
			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			Laya.loader.load(this.ApePath, Handler.create(this, this.setup));
		});
	}

	private setup(_e: any = null): void {
		this.createApe();
		this.showDragRegion();
	}

	private createApe(): void {
		this.ape = new Sprite();

		this.ape.loadImage(this.ApePath);
		this.Main.box2D.addChild(this.ape);

		var texture: Texture = Laya.loader.getRes(this.ApePath);
		this.ape.pivot(texture.width / 2, texture.height / 2);
		this.ape.x = Laya.stage.width / 2;
		this.ape.y = Laya.stage.height / 2;

		this.ape.on(Event.MOUSE_DOWN, this, this.onStartDrag);
	}

	private showDragRegion(): void {
		//拖动限制区域
		var dragWidthLimit: number = 350;
		var dragHeightLimit: number = 200;
		this.dragRegion = new Rectangle(Laya.stage.width - dragWidthLimit >> 1, Laya.stage.height - dragHeightLimit >> 1, dragWidthLimit, dragHeightLimit);

		//画出拖动限制区域
		Laya.stage.graphics.drawRect(
			this.dragRegion.x, this.dragRegion.y, this.dragRegion.width, this.dragRegion.height,
			null, "#FFFFFF", 2);
	}

	private onStartDrag(e: Event = null): void {
		//鼠标按下开始拖拽(设置了拖动区域和超界弹回的滑动效果)
		this.ape.startDrag(this.dragRegion, true, 100);
	}

	dispose(): void {
		if (this.ape) {
			this.ape.off(Event.MOUSE_DOWN, this, this.onStartDrag);
		}
	}
}

