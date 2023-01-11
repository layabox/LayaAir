import { Laya } from "Laya";
import { Laya3D } from "Laya3D";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Resource } from "laya/resource/Resource";
import { Button } from "laya/ui/Button";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Vector3 } from "laya/maths/Vector3";
import { Color } from "laya/maths/Color";
import { AssetDb } from "laya/resource/AssetDb";

/**
 * ...
 * @author LayaAir3D Team
 */
export class GarbageCollection {
	/**@private */
	private _scene: Scene3D;
	/**@private */
	private _castType: number = 0;

	/**实例类型*/
	private btype:any = "GarbageCollection";
	/**场景内按钮类型*/
	private stype:any = 0;
	private changeActionButton:Button;

	/**
	 * @private
	 */
	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		this.loadScene();
		this.loadUI();

	}
	
	/**
	 * @private
	 */
	 loadUI(): void {
		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
			this.changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "释放显存")));
			this.changeActionButton.zOrder = 10000;
			this.changeActionButton.size(160, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			//this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(200, 200);
			this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);
		}));
	}

	stypeFun0(label:string = "加载场景") {
		this._castType++;
		this._castType %= 2;
		switch (this._castType) {
			case 0:
				this.changeActionButton.label = "释放显存";
				this.loadScene();
				break;
			case 1:
				this.changeActionButton.label = "加载场景";
				if (this._scene)//_scene不为空表示场景已加载完成
					this.garbageCollection();
				break;
	    }
		label = this.changeActionButton.label;
		Client.instance.send({"type":"next","btype":this.btype,"stype":0,"value":label});	
	}

	/**
	 * @private
	 */
	loadScene(): void {
		AssetDb.inst.enableImageMetaFile = true;
		Scene3D.load("res/threeDimen/scene/ParticleScene/Scene.ls", Handler.create(this, function (sprite: Scene3D): void {
			this._scene = <Scene3D>Laya.stage.addChild(sprite);
			var camera: Camera = <Camera>this._scene.addChild(new Camera(0, 0.1, 100));
			camera.transform.translate(new Vector3(2, 2.7, 3));
			camera.transform.rotate(new Vector3(0, 43, 0), false, false);
			camera.clearFlag = CameraClearFlags.SolidColor;
			camera.clearColor = new Color(0, 0, 0, 1);
			camera.addComponent(CameraMoveScript);
			AssetDb.inst.enableImageMetaFile = false;
		}));
	}

	/**
	 * @private
	 */
	garbageCollection(): void {
		this._scene.destroy();//销毁场景
		this._scene = null;
		Resource.destroyUnusedResources();//销毁无用资源(没有被场景树引用,并且没有加资源锁的)
	}

}


