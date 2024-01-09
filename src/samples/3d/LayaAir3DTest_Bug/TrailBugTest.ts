// import { Laya3D } from "Laya3D";
// import { Laya } from "Laya";
// import { Camera, CameraClearFlags } from "laya/d3/core/Camera"
// import { Sprite3D } from "laya/d3/core/Sprite3D"
// import { DirectionLight } from "laya/d3/core/light/DirectionLight"
// import { Scene3D } from "laya/d3/core/scene/Scene3D"
// import { TrailSprite3D } from "laya/d3/core/trail/TrailSprite3D"
// import { Stage } from "laya/display/Stage"
// import { Event } from "laya/events/Event"
// import { Resource } from "laya/resource/Resource"
// import { Button } from "laya/ui/Button"
// import { Browser } from "laya/utils/Browser"
// import { Handler } from "laya/utils/Handler"
// import { Stat } from "laya/utils/Stat"

// /**
//  * ...
//  * @author ...
//  */
// export class TrailBugTest {
// 	private scene: Scene3D;
// 	private sprite: Sprite3D;
// 	private camera: Camera;
// 	private index: number = 0;
// 	constructor() {
// 		//初始化引擎
// 		Laya.init(1000, 500).then(() => {
// 			//适配模式
// 			Laya.stage.scaleMode = Stage.SCALE_FULL;
// 			Laya.stage.screenMode = Stage.SCREEN_NONE;
// 			//开启统计信息
// 			Stat.show();
// 			this.onPreLoadFinish();
// 		});
// 	}

// 	private onPreLoadFinish(): void {
// 		//创建场景
// 		this.scene = new Scene3D();
// 		Laya.stage.addChild(this.scene);

// 		//创建相机，构造函数的三个参数为相机横纵比，近距裁剪，远距裁剪
// 		this.camera = new Camera(0, 0.1, 100);


// 		//相机设置清楚标记,使用固定颜色
// 		this.camera.clearFlag = CameraClearFlags.SolidColor;
// 		//设置摄像机视野范围（角度）
// 		this.camera.fieldOfView = 60;
// 		//为相机添加视角控制组件(脚本)
// 		this.scene.addChild(this.camera);

// 		//添加平行光
// 		var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
// 		//设置平行光颜色
// 		directionLight.color.setValue(1, 1, 1, 1);
// 		//directionLight.transform.rotate(_rotation2);

// 		this.sprite = new Sprite3D;
// 		this.scene.addChild(this.sprite);



// 		this.loadUI();
// 	}



// 	private loadUI(): void {

// 		Laya.loader.load(["../../../../res/threeDimen/ui/button.png"], Handler.create(null, function (): void {

// 			var changeActionButton: Button = (<Button>Laya.stage.addChild(new Button("../../../../res/threeDimen/ui/button.png", "正透切换")));
// 			changeActionButton.size(160, 40);
// 			changeActionButton.labelBold = true;
// 			changeActionButton.labelSize = 30;
// 			changeActionButton.sizeGrid = "4,4,4,4";
// 			changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
// 			changeActionButton.pos(Laya.stage.width / 2 - changeActionButton.width * Browser.pixelRatio / 2 - 100, Laya.stage.height - 100 * Browser.pixelRatio);

// 			changeActionButton.on(Event.CLICK, this, function (): void {
// 				this.index++;
// 				if (this.index % 2 === 1) {
// 					var trail = new TrailSprite3D();
// 					this.sprite.addChild(trail);
// 				} else {
// 					this.sprite.destroy(true);
// 					Resource.destroyUnusedResources();
// 				}
// 			});

// 		}));
// 	}

// }


