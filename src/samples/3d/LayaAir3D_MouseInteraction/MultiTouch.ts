import { Laya } from "Laya";
import { Laya3D } from "Laya3D";
import { Camera } from "laya/d3/core/Camera"
import { Sprite3D } from "laya/d3/core/Sprite3D"
import { DirectionLight } from "laya/d3/core/light/DirectionLight"
import { Scene3D } from "laya/d3/core/scene/Scene3D"
import { Vector3 } from "laya/d3/math/Vector3"
import { Stage } from "laya/display/Stage"
import { Text } from "laya/display/Text"
import { Loader } from "laya/net/Loader"
import { Handler } from "laya/utils/Handler"

/**
 * ...
 * @author ...
 */
export class MultiTouch {

	private text: Text = new Text();
	private _upVector3: Vector3 = new Vector3(0, 1, 0);

	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;

		//预加载所有资源
		var resource: any[] = ["res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"];
		Laya.loader.create(resource, Handler.create(this, this.onComplete));
	}

	private onComplete(): void {
		//创建场景
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		//创建相机
		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
		//设置相机的名称
		camera.name = "camera";
		//相机平移位置
		camera.transform.translate(new Vector3(0, 0.8, 1.5));
		//旋转相机
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);

		//创建平行光
		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		//设置平行光颜色
		directionLight.color = new Vector3(0.6, 0.6, 0.6);

		//加载小猴子精灵
		var monkey: Sprite3D = Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh");
		//猴子精灵添加组件（脚本）
		monkey.addComponent(MonkeyScript);
		scene.addChild(monkey);
		//设置相机的观察目标为小猴子
		camera.transform.lookAt(monkey.transform.position, new Vector3(0, 1, 0));

		//设置文本显示框位置
		this.text.x = Laya.stage.width / 2 - 50;
		this.text.text = "触控点归零";
		//显示文本显示框
		this.text.name = "ceshi";
		this.text.overflow = Text.HIDDEN;
		this.text.color = "#FFFFFF";
		this.text.font = "Impact";
		this.text.fontSize = 20;
		this.text.borderColor = "#FFFF00";
		this.text.x = Laya.stage.width / 2;
		Laya.stage.addChild(this.text);
	}
}



import { Touch } from "laya/d3/Touch"
import { Script3D } from "laya/d3/component/Script3D"



import { Vector2 } from "laya/d3/math/Vector2"



class MonkeyScript extends Script3D {

	private _scene: Scene3D;
	private _text: Text;
	private _camera: Camera;
	private rotation: Vector3 = new Vector3(0, 0.01, 0);
	private lastPosition: Vector2 = new Vector2(0, 0);
	private distance: number = 0.0;
	private disVector1: Vector2 = new Vector2(0, 0);
	private disVector2: Vector2 = new Vector2(0, 0);
	private isTwoTouch: boolean = false;
	private first: boolean = true;
	private twoFirst: boolean = true;
	private tmpVector: Vector3 = new Vector3(0, 0, 0);

	/*override*/  onAwake(): void {
	}

	/*override*/  onStart(): void {
		this._scene = (<Scene3D>((<Sprite3D>this.owner)).parent);
		this._text = (this._scene.parent as Stage).getChildByName("ceshi") as Text;
		this._camera = (<Camera>this._scene.getChildByName("camera"));
	}

	/*override*/  onUpdate(): void {
		var touchCount: number = this._scene.input.touchCount();
		if (1 === touchCount) {
			//判断是否为两指触控，撤去一根手指后引发的touchCount===1
			if (this.isTwoTouch) {
				return;
			}
			this._text.text = "触控点为1";
			//获取当前的触控点，数量为1
			var touch: Touch = this._scene.input.getTouch(0);
			//是否为新一次触碰，并未发生移动
			if (this.first) {
				//获取触碰点的位置
				this.lastPosition.x = touch.position.x;
				this.lastPosition.y = touch.position.y;
				this.first = false;
			} else {
				//移动触碰点
				var deltaY: number = touch.position.y - this.lastPosition.y;
				var deltaX: number = touch.position.x - this.lastPosition.x;
				this.lastPosition.x = touch.position.x;
				this.lastPosition.y = touch.position.y;
				//根据移动的距离进行旋转
				this.tmpVector.setValue(1 * deltaY / 2, 1 * deltaX / 2, 0);
				((<Sprite3D>this.owner)).transform.rotate(this.tmpVector, true, false);
			}
		} else if (2 === touchCount) {
			this._text.text = "触控点为2";
			this.isTwoTouch = true;
			//获取两个触碰点
			var touch: Touch = this._scene.input.getTouch(0);
			var touch2: Touch = this._scene.input.getTouch(1);
			//是否为新一次触碰，并未发生移动
			if (this.twoFirst) {
				//获取触碰点的位置
				this.disVector1.x = touch.position.x - touch2.position.x;
				this.disVector1.y = touch.position.y - touch2.position.y;
				this.distance = Vector2.scalarLength(this.disVector1);
				this.twoFirst = false;
			} else {
				this.disVector2.x = touch.position.x - touch2.position.x;
				this.disVector2.y = touch.position.y - touch2.position.y;
				var distance2: number = Vector2.scalarLength(this.disVector2);
				//根据移动的距离进行缩放
				this.tmpVector.setValue(0, 0, -0.01 * (distance2 - this.distance));
				this._camera.transform.translate(this.tmpVector);
				this.distance = distance2;
			}
		} else if (0 === touchCount) {
			this._text.text = "触控点归零";
			this.first = true;
			this.twoFirst = true;
			this.lastPosition.x = 0;
			this.lastPosition.y = 0;
			this.isTwoTouch = false;
		}
	}

	/*override*/  onLateUpdate(): void {
	}

}


