import { Laya } from "Laya";
import { Laya3D } from "Laya3D";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Resource } from "laya/resource/Resource";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Utils } from "laya/utils/Utils";

import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";

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
	private btype:any = "CommandBuffer_Outline";
	/**场景内按钮类型*/
	private stype:any = 0;
	private changeActionButton:Button;
	isMaster: any;

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

		this.isMaster = Utils.getQueryString("isMaster");
		this.initEvent();
	}
	
	initEvent()
	{
		Laya.stage.on("next",this,this.onNext);
	}

	/**
	 * 
	 * @param data {btype:""}
	 */
	onNext(data:any)
	{
		if(this.isMaster)return;//拒绝非主控制器推送消息
		if(data.btype == this.btype)
		{
			this.stypeFun(data.value);
		}
	}

	/**
	 * @private
	 */
	 loadUI(): void {
		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
			this.changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "释放显存")));
			this.changeActionButton.size(160, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(200, 200);
			this.changeActionButton.on(Event.CLICK, this, this.stypeFun);
		}));
	}

	stypeFun(label:string = "加载场景") {
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
		if(this.isMaster)
		Client.instance.send({"type":"next","btype":this.btype,"stype":0,"value":label});	

	}

	/**
	 * @private
	 */
	loadScene(): void {
		Scene3D.load("res/threeDimen/scene/ParticleScene/Example_01.ls", Handler.create(this, function (scene: Scene3D): void {
			this._scene = (<Scene3D>Laya.stage.addChildAt(scene, 0));
			var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.translate(new Vector3(0, 1, 0));
			camera.addComponent(CameraMoveScript);
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


