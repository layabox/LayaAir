import { SpineSkeleton } from "laya/spine/SpineSkeleton";
import { Browser } from "laya/utils/Browser"
import { Event } from "laya/events/Event";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { SpineTemplet, SpineVersion} from "laya/spine/SpineTemplet";
import { Laya } from "Laya";

export class Skeleton_SpineAdapted {

	private aniPath = "res/spine/spineboy-pma.skel";
	private templet:SpineTemplet;
	private skeleton:SpineSkeleton;
	private index: number = -1;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init( Browser.width, Browser.height);
		Laya.stage.bgColor = "#ffffff";
		Stat.show();
		this.startFun();
	}

	private startFun(): void {
		this.templet = new SpineTemplet(SpineVersion.v3_8);
		this.templet.loadAni(this.aniPath);
		this.templet.on(Event.COMPLETE, this, this.parseComplete);
		this.templet.on(Event.ERROR, this, this.onError)
	}

	private parseComplete(): void {
		this.skeleton = this.templet.buildArmature();
		this.Main.box2D.addChild(this.skeleton);
		this.skeleton.pos(Browser.width / 2, Browser.height / 2 + 100);
		this.skeleton.scale(0.5, 0.5);
		this.skeleton.on(Event.STOPPED, this, this.play)
		this.play();
	}

	private onError(): void{
		console.log("parse error");
	}

	private play(): void {
		if(++this.index >= this.skeleton.getAnimNum()) {
			this.index = 0
		}
		this.skeleton.play(this.index, false, true)
	}
}


