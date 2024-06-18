// import { Laya } from "Laya";
// import { Animator } from "laya/d3/component/Animator/Animator";
// import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
// import { DirectionLight } from "laya/d3/core/light/DirectionLight";
// import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
// import { Scene3D } from "laya/d3/core/scene/Scene3D";
// import { Sprite3D } from "laya/d3/core/Sprite3D";
// import { Stage } from "laya/display/Stage";
// import { Color } from "laya/maths/Color";
// import { Matrix4x4 } from "laya/maths/Matrix4x4";
// import { Vector3 } from "laya/maths/Vector3";
// import { Handler } from "laya/utils/Handler";
// import { Stat } from "laya/utils/Stat";
// import { Laya3D } from "Laya3D";
// import { CameraMoveScript } from "../common/CameraMoveScript";


// export class SceneLoad3 {
// 	monkeyRow: number = 10;
// 	monkeyCount: number = 0;
// 	_scene: Scene3D;
// 	particles: Array<Sprite3D>;
// 	skinmodels: Array<Sprite3D>;
// 	baseUrl:String = "http://10.10.20.200:8889/";
// 	constructor() {
// 		Laya.init(0, 0).then(() => {
// 			Laya.stage.scaleMode = Stage.SCALE_FULL;
// 			Laya.stage.screenMode = Stage.SCREEN_NONE;
// 			Stat.show();
// 			var _this: SceneLoad3 = this;

// 			Scene3D.load(this.baseUrl+"res/threeDimen/scene/TerrainScene/XunLongShi.ls", Handler.create(this, function (scene: Scene3D): void {
// 				Laya.stage.addChild(scene);
// 				//开启雾化效果
// 				scene.enableFog = false;
// 				//设置雾化的颜色
// 				scene.fogColor = new Color(0, 0, 0.6);
// 				//设置雾化的起始位置，相对于相机的距离
// 				scene.fogStart = 10;
// 				//设置雾化最浓处的距离。
// 				scene.fogRange = 40;
// 				//设置场景环境光
// 				//scene.ambientColor = new Vector3(0.05, 0.15, 0.07);

// 				//添加相机
// 				var camera: Camera = new Camera();
// 				var rotSprite:Sprite3D= new Sprite3D();
// 				rotSprite.addChild(camera);
// 				scene.addChild(rotSprite);
// 				//调整相机的位置
// 				camera.transform.translate(new Vector3(0, 18, -50));
// 				camera.transform.rotate(new Vector3(-20, 180, 0), false, false);
// 				//设置相机横纵比
// 				camera.aspectRatio = 0;
// 				//设置相机近距裁剪
// 				camera.nearPlane = 0.1;
// 				//设置相机远距裁剪
// 				camera.farPlane = 1000;
// 				//相机设置清楚标记
// 				camera.clearFlag = CameraClearFlags.Sky;
// 				//设置摄像机视野范围（角度）
// 				camera.fieldOfView = 60;
// 				//设置背景颜色
// 				//camera.clearColor = new Vector4(0,0,0.6,1);    
// 				//加入摄像机移动控制脚本
// 				camera.addComponent(CameraMoveScript);

// 				/*
// 				//加载相机天空盒材质
// 				Material.load(this.baseUrl+"res/threeDimen/skyBox/skyBox2/SkyBox2.lmat", Handler.create(this, function (mat: Material): void {
// 					var skyRenderer: SkyRenderer = camera.skyRenderer;
// 					skyRenderer.mesh = SkyBox.instance;
// 					skyRenderer.material = mat;
// 				}));
// 				*/

// 				//创建方向光
// 				var light: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
// 				//移动灯光位置
// 				light.transform.translate(new Vector3(0, 2, 5));
// 				//调整灯光方向
// 				var mat: Matrix4x4 = light.transform.worldMatrix;
// 				mat.setForward(new Vector3(0, -5, 1));
// 				light.transform.worldMatrix = mat;
// 				//设置灯光漫反射颜色
// 				//light.diffuseColor = new Vector3(0.5, 0.5, 0.5);
// 				light.color = new Color(1.0, 1.0, 1.0, 1);

// 				//激活场景中的两个子节点
// 				((<MeshSprite3D>scene.getChildByName('Scenes').getChildByName('HeightMap'))).active = false;
// 				((<MeshSprite3D>scene.getChildByName('Scenes').getChildByName('Area'))).active = false;

// 				_this._scene = scene;
// 				_this.loadSkinmodels();
// 				_this.loadParticle();
// 				this.camera1 = rotSprite;
// 				this.lights = light
// 				Laya.timer.frameLoop(1,this,this.rotateSprite);
// 			}));
// 		});
// 	}
// 	public camera1:Sprite3D;
// 	public lights:DirectionLight;

// 	rotateSprite()
// 	{
// 		this.camera1.transform.rotate(new Vector3(0,1,0),false,false);
// 		//this.lights.transform.rotate(new Vector3(0,1,0),false,false);
// 		var ve = this.lights.transform.rotationEuler;
// 		ve.setValue(ve.x+2,ve.y+2,ve.z+2);
// 		this.lights.transform.rotationEuler = ve;
		
// 	}
// 	loadParticle() {
// 		var _this: SceneLoad3 = this;
// 		this.particles = new Array<Sprite3D>();
// 		Sprite3D.load(this.baseUrl+"res/threeDimen/particle/lv_guangci.lh", Handler.create(null, function (lm: Sprite3D): void {
// 			_this.particles.push(lm);
// 			if (_this.particles.length >= 5) {
// 				_this.createParticle();
// 			}
// 		}));
// 		Sprite3D.load(this.baseUrl+"res/threeDimen/particle/lv_kuosan.lh", Handler.create(null, function (lm: Sprite3D): void {
// 			_this.particles.push(lm);
// 			if (_this.particles.length >= 5) {
// 				_this.createParticle();
// 			}
// 		}));
// 		Sprite3D.load(this.baseUrl+"res/threeDimen/particle/lv_qiu2.lh", Handler.create(null, function (lm: Sprite3D): void {
// 			_this.particles.push(lm);
// 			if (_this.particles.length >= 5) {
// 				_this.createParticle();
// 			}
// 		}));
// 		Sprite3D.load(this.baseUrl+"res/threeDimen/particle/lv_sd.lh", Handler.create(null, function (lm: Sprite3D): void {
// 			_this.particles.push(lm);
// 			if (_this.particles.length >= 5) {
// 				_this.createParticle();
// 			}
// 		}));
// 		Sprite3D.load(this.baseUrl+"res/threeDimen/particle/lv_kuosan1.lh", Handler.create(null, function (lm: Sprite3D): void {
// 			_this.particles.push(lm);
// 			if (_this.particles.length >= 5) {
// 				_this.createParticle();
// 			}
// 		}));
// 	}

// 	createParticle() {
// 		var nNum: number = this.monkeyRow * this.monkeyRow;
// 		for (let i: number = 0; i < nNum; i++) {
// 			var x: number = parseInt((i / this.monkeyRow).toString());
// 			var y: number = parseInt((i % this.monkeyRow).toString());
// 			var sp: Sprite3D = Sprite3D.instantiate(this.particles[i % 5], this._scene, false, new Vector3((-this.monkeyRow / 2 + x) * 4, 9, -2 + -y * 2));
// 			this._scene.addChild(sp);
// 		}
// 	}

// 	loadSkinmodels() {
// 		var _this: SceneLoad3 = this;
// 		this.skinmodels = new Array<Sprite3D>();
// 		Sprite3D.load(this.baseUrl+"res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(null, function (lm: Sprite3D): void {
// 			_this.skinmodels.push(lm);
// 			var animator: Animator = (<Animator>((<Sprite3D>lm.getChildAt(0))).getComponent(Animator));
// 			animator.play();
// 			animator.getDefaultState(0).clip.islooping = true;
// 			lm.transform.rotate(new Vector3(0, 180, 0), true, false);
// 			lm.transform.scale=new Vector3(0.5,0.5,0.5);
// 			if (_this.skinmodels.length >= 4) {
// 				_this.createSkinmodel();
// 			}
// 		}));

// 		Sprite3D.load(this.baseUrl+"res/threeDimen/skinModel/npc/npc_001.lh", Handler.create(null, function (lm: Sprite3D): void {
// 			_this.skinmodels.push(lm);
// 			var animator: Animator = (<Animator>((<Sprite3D>lm.getChildAt(0))).getComponent(Animator));
// 			animator.play();
// 			animator.getDefaultState(0).clip.islooping = true;
// 			lm.transform.rotate(new Vector3(0, 180, 0), true, false);
// 			lm.transform.scale=new Vector3(1,1,1);
// 			if (_this.skinmodels.length >= 4) {
// 				_this.createSkinmodel();
// 			}
// 		}));

// 		Sprite3D.load(this.baseUrl+"res/threeDimen/skinModel/dude/dude.lh", Handler.create(null, function (lm: Sprite3D): void {
// 			_this.skinmodels.push(lm);
// 			var animator: Animator = (<Animator>((<Sprite3D>lm.getChildAt(0))).getComponent(Animator));
// 			animator.play();
// 			animator.getDefaultState(0).clip.islooping = true;
// 			lm.transform.scale=new Vector3(0.5,0.5,0.5);
// 			if (_this.skinmodels.length >= 4) {
// 				_this.createSkinmodel();
// 			}
// 		}));

// 		Sprite3D.load(this.baseUrl+"res/threeDimen/skinModel/BoneLinkScene/PangZi.lh", Handler.create(null, function (lm: Sprite3D): void {
// 			_this.skinmodels.push(lm);
// 			var animator: Animator = (<Animator>((<Sprite3D>lm.getChildAt(0))).getComponent(Animator));
// 			animator.play();
// 			animator.getDefaultState(0).clip.islooping = true;
// 			lm.transform.rotate(new Vector3(0, 180, 0), true, false);
// 			if (_this.skinmodels.length >= 4) {
// 				_this.createSkinmodel();
// 			}
// 		}));
// 	}

// 	createSkinmodel() {
// 		var nNum: number = this.monkeyRow * this.monkeyRow;
// 		for (let i: number = 0; i < nNum; i++) {
// 			var x: number = parseInt((i / this.monkeyRow).toString());
// 			var y: number = parseInt((i % this.monkeyRow).toString());
// 			var sp: Sprite3D = Sprite3D.instantiate(this.skinmodels[i % 4], this._scene, false, new Vector3((-this.monkeyRow / 2 + x) * 4, 9, -2 + -y * 2));
// 			this._scene.addChild(sp);
// 		}
// 	}
// }

