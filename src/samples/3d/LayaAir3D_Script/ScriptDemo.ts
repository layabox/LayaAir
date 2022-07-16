import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { PBRSpecularMaterial } from "laya/d3/core/material/PBRSpecularMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Color } from "laya/d3/math/Color";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";


export class ScriptDemo {
	private _translate: Vector3 = new Vector3(0, 3, 3);
	private _rotation: Vector3 = new Vector3(-30, 0, 0);
	private _rotation2: Vector3 = new Vector3(0, 45, 0);
	private _forward: Vector3 = new Vector3(1, -1, 0);

	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		//适配模式
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//开启统计信息
		Stat.show();
		//添加3D场景
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		//添加照相机
		var camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 100))));
		//移动摄影机位置
		camera.transform.translate(this._translate);
		//旋转摄影机方向
		camera.transform.rotate(this._rotation, true, false);
		//添加方向光
		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		//设置灯光漫反射颜色
		var lightColor: Color = directionLight.color;
		lightColor.setValue(0.6, 0.6, 0.6, 1);
		//设置平行光的方向
		var mat: Matrix4x4 = directionLight.transform.worldMatrix;
		mat.setForward(this._forward);
		directionLight.transform.worldMatrix = mat;
		//添加自定义模型
		var box: MeshSprite3D = (<MeshSprite3D>scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(1, 1, 1), "MOs")));
		//设置模型的旋转
		box.transform.rotate(this._rotation2, false, false);
		//创建材质
		var material: PBRSpecularMaterial = new PBRSpecularMaterial();
		//加载模型的材质贴图
		Texture2D.load("res/threeDimen/layabox.png", Handler.create(this, function (text: Texture2D): void {
			material.albedoTexture = text;
			//给模型添加材质
			box.meshRenderer.material = material;
			//给box添加自定义脚本组件
			box.addComponent(BoxControlScript);
		}));
		//4秒后删除自定义组件
		Laya.timer.once(4000, this, this.onLoop, [box]);
	}

	private onLoop(box: MeshSprite3D): void {
		console.log("移除组件");
		// 获取到组件
		var boxContro: BoxControlScript = box.getComponent(BoxControlScript);
		// 移除组件
		boxContro.destroy();
		//如不想移除组件，可设置为不启用能达到同样效果（组件_update方法将不会被更新）
		//boxContro.enabled = false;
	}
}








class BoxControlScript extends Script3D {
	private box: MeshSprite3D;
	private _albedoColor: Color = new Color(1, 0, 0, 1);
	private _rotation: Vector3 = new Vector3(0, 0.5, 0);

	constructor() {
		super();

	}

	/**
	 * 覆写3D对象组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
	 */
	/*override*/  onAwake(): void {
		//得到3D对象
		this.box = (<MeshSprite3D>this.owner);
	}

	/*override*/  onStart(): void {
		//得到3D对象的材质
		var material: PBRSpecularMaterial = (<PBRSpecularMaterial>this.box.meshRenderer.material);
		//更改3D对象的材质反射率 （偏红）
		material.albedoColor = this._albedoColor;
	}

	/**
	 * 覆写组件更新方法（相当于帧循环）
	 */
	/*override*/  onUpdate(): void {
		//所属脚本对象旋转更新
		this.box.transform.rotate(this._rotation, false, false)
	}

	/*override*/  onDisable() {
		console.log("组件设置为不可用");
	}
}
