import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler"; 
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { PBRStandardMaterial, PBRMetallicSmoothnessSource } from "laya/d3/core/material/PBRStandardMaterial";
import { Texture2D } from "laya/resource/Texture2D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";


export class SceneLoad4 {
	monkeyRow: number = 10;
	monkeyCount: number = 0;
	modelRow:number = 40;
	_scene: Scene3D;
	particles: Array<Sprite3D>;
	skinmodels: Array<Sprite3D>;
	baseUrl:String = "http://10.10.20.200:8889/";
	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			var _this: SceneLoad4 = this;

			Scene3D.load(this.baseUrl+"res/threeDimen/scene/TerrainScene/XunLongShi.ls", Handler.create(this, function (scene: Scene3D): void {
				Laya.stage.addChild(scene);
				//开启雾化效果
				scene.enableFog = false;
				//设置雾化的颜色
				scene.fogColor = new Color(0, 0, 0.6);
				//设置雾化的起始位置，相对于相机的距离
				scene.fogStart = 10;
				//设置雾化最浓处的距离。
				scene.fogRange = 40;
				//设置场景环境光
				//scene.ambientColor = new Vector3(0.05, 0.15, 0.07);

				//添加相机
				var camera: Camera = new Camera();
				var rotSprite:Sprite3D= new Sprite3D();
				rotSprite.addChild(camera);
				scene.addChild(rotSprite);
				//调整相机的位置
				camera.transform.translate(new Vector3(0, 18, -50));
				camera.transform.rotate(new Vector3(-20, 180, 0), false, false);
				//设置相机横纵比
				camera.aspectRatio = 0;
				//设置相机近距裁剪
				camera.nearPlane = 0.1;
				//设置相机远距裁剪
				camera.farPlane = 1000;
				//相机设置清楚标记
				camera.clearFlag = CameraClearFlags.Sky;
				//设置摄像机视野范围（角度）
				camera.fieldOfView = 60;
				//设置背景颜色
				//camera.clearColor = new Vector4(0,0,0.6,1);    
				//加入摄像机移动控制脚本
				camera.addComponent(CameraMoveScript);

				/*
				//加载相机天空盒材质
				Material.load(this.baseUrl+"res/threeDimen/skyBox/skyBox2/SkyBox2.lmat", Handler.create(this, function (mat: Material): void {
					var skyRenderer: SkyRenderer = camera.skyRenderer;
					skyRenderer.mesh = SkyBox.instance;
					skyRenderer.material = mat;
				}));
				*/

				//创建方向光
				var light: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
				//移动灯光位置
				light.transform.translate(new Vector3(0, 2, 5));
				//调整灯光方向
				var mat: Matrix4x4 = light.transform.worldMatrix;
				mat.setForward(new Vector3(0, -5, 1));
				light.transform.worldMatrix = mat;
				//设置灯光漫反射颜色
				//light.diffuseColor = new Vector3(0.5, 0.5, 0.5);
				light.color = new Color(1.0, 1.0, 1.0, 1);

				//激活场景中的两个子节点
				((<MeshSprite3D>scene.getChildByName('Scenes').getChildByName('HeightMap'))).active = false;
				((<MeshSprite3D>scene.getChildByName('Scenes').getChildByName('Area'))).active = false;

				_this._scene = scene;
				_this.loadStaticModel();
				_this.loadParticle();
				this.camera1 = rotSprite;
				this.lights = light
				Laya.timer.frameLoop(1,this,this.rotateSprite);
			}));
		});
	}
	public camera1:Sprite3D;
	public lights:DirectionLight;

	rotateSprite()
	{
		this.camera1.transform.rotate(new Vector3(0,1,0),false,false);
		//this.lights.transform.rotate(new Vector3(0,1,0),false,false);
		var ve = this.lights.transform.rotationEuler;
		ve.setValue(ve.x+2,ve.y+2,ve.z+2);
		this.lights.transform.rotationEuler = ve;
		
	}
	loadParticle() {
		var _this: SceneLoad4 = this;
		this.particles = new Array<Sprite3D>();
		Sprite3D.load(this.baseUrl+"res/threeDimen/particle/lv_guangci.lh", Handler.create(null, function (lm: Sprite3D): void {
			_this.particles.push(lm);
			if (_this.particles.length >= 5) {
				_this.createParticle();
			}
		}));
		Sprite3D.load(this.baseUrl+"res/threeDimen/particle/lv_kuosan.lh", Handler.create(null, function (lm: Sprite3D): void {
			_this.particles.push(lm);
			if (_this.particles.length >= 5) {
				_this.createParticle();
			}
		}));
		Sprite3D.load(this.baseUrl+"res/threeDimen/particle/lv_qiu2.lh", Handler.create(null, function (lm: Sprite3D): void {
			_this.particles.push(lm);
			if (_this.particles.length >= 5) {
				_this.createParticle();
			}
		}));
		Sprite3D.load(this.baseUrl+"res/threeDimen/particle/lv_sd.lh", Handler.create(null, function (lm: Sprite3D): void {
			_this.particles.push(lm);
			if (_this.particles.length >= 5) {
				_this.createParticle();
			}
		}));
		Sprite3D.load(this.baseUrl+"res/threeDimen/particle/lv_kuosan1.lh", Handler.create(null, function (lm: Sprite3D): void {
			_this.particles.push(lm);
			if (_this.particles.length >= 5) {
				_this.createParticle();
			}
		}));
	}

	createParticle() {
		var nNum: number = this.monkeyRow * this.monkeyRow;
		for (let i: number = 0; i < nNum; i++) {
			var x: number = parseInt((i / this.monkeyRow).toString());
			var y: number = parseInt((i % this.monkeyRow).toString());
			var sp: Sprite3D = Sprite3D.instantiate(this.particles[i % 5], this._scene, false, new Vector3((-this.monkeyRow / 2 + x), 9, 20 + -y));
			this._scene.addChild(sp);
		}
	}

	loadStaticModel() {
		var _this: SceneLoad4 = this;
		this.skinmodels = new Array<Sprite3D>();

		Mesh.load("res/threeDimen/pbrtest/PBRAssets02/Sphere.lm", Handler.create(this, function (mesh: Mesh): void {

			var meshSprite3D:MeshSprite3D = new MeshSprite3D(mesh);
			_this.skinmodels.push(meshSprite3D);

			//实例PBR材质
			var sphereMat: PBRStandardMaterial = new PBRStandardMaterial();
			//albedoTexture:法线贴图：增强模型细节

			//反射贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets02/Materials/Textures/Barrel_AlbedoTransparency.png', Handler.create(this, function (texture: Texture2D): void {
				sphereMat.albedoTexture = texture;
			}));

			//法线贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets02/Materials/Textures/Barrel_Normal.png', Handler.create(this, function (texture: Texture2D): void {
				sphereMat.normalTexture = texture;
			}));

			//金属光滑度贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets02/Materials/Textures/Barrel_MetallicSmoothness.png', Handler.create(this, function (texture: Texture2D): void {
				sphereMat.metallicGlossTexture = texture;
			}));

			//遮挡贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets02/Materials/Textures/Barrel_Occlusion.png', Handler.create(this, function (texture: Texture2D): void {
				sphereMat.occlusionTexture = texture;
			}));

			//反射颜色
			sphereMat.albedoColor = new Color(1.1, 1.1, 1.1, 1.1);
			//光滑度缩放系数
			sphereMat.smoothnessTextureScale = 1.1;
			//遮挡贴图强度
			sphereMat.occlusionTextureStrength = 1.1;
			//法线贴图缩放系数
			//mat.normalScale = 1;
			//光滑度数据源:从金属度贴图/反射贴图获取。
			sphereMat.smoothnessSource = PBRMetallicSmoothnessSource.MetallicGlossTextureAlpha;

			meshSprite3D.meshRenderer.sharedMaterial = sphereMat;
			if( _this.skinmodels.length > 3)
			{
				_this.createSkinmodel();
			}
		}));

		//加载Mesh 水桶
		Mesh.load("res/threeDimen/pbrtest/PBRAssets01/Mesh/Wooden_Barrel-Barrel_Low[28772].lm", Handler.create(this, function (mesh: Mesh): void {

			var meshSprite3D:MeshSprite3D = new MeshSprite3D(mesh);
			_this.skinmodels.push(meshSprite3D);

			//实例PBR材质
			var barrelMat: PBRStandardMaterial = new PBRStandardMaterial();
			//albedoTexture:法线贴图：增强模型细节

			//反射贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets01/Materials/Textures/Barrel_AlbedoTransparency.png', Handler.create(this, function (texture: Texture2D): void {
				barrelMat.albedoTexture = texture;
			}));

			//法线贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets01/Materials/Textures/Barrel_Normal.png', Handler.create(this, function (texture: Texture2D): void {
				barrelMat.normalTexture = texture;
			}));

			//金属光滑度贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets01/Materials/Textures/Barrel_MetallicSmoothness.png', Handler.create(this, function (texture: Texture2D): void {
				barrelMat.metallicGlossTexture = texture;
			}));

			//遮挡贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets01/Materials/Textures/Barrel_Occlusion.png', Handler.create(this, function (texture: Texture2D): void {
				barrelMat.occlusionTexture = texture;
			}));

			//反射颜色
			barrelMat.albedoColor = new Color(1.2, 1.2, 1.2, 1.2);
			//光滑度缩放系数
			barrelMat.smoothnessTextureScale = 1.2;
			//遮挡贴图强度
			barrelMat.occlusionTextureStrength = 1.2;
			//法线贴图缩放系数
			//mat.normalScale = 1;
			//光滑度数据源:从金属度贴图/反射贴图获取。
			barrelMat.smoothnessSource = PBRMetallicSmoothnessSource.MetallicGlossTextureAlpha;

			meshSprite3D.meshRenderer.sharedMaterial = barrelMat;

			if( _this.skinmodels.length > 3)
			{
				_this.createSkinmodel();
			}
		}));

		//加载Mesh 猴子
        Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Handler.create(this, function (mesh: Mesh): void {

			var meshSprite3D:MeshSprite3D = new MeshSprite3D(mesh);
			meshSprite3D.transform.scale = new Vector3(0.3,0.3,0.3);
			meshSprite3D.transform.rotate(new Vector3(-90, 0, 0), true, false);
			_this.skinmodels.push(meshSprite3D);


            //实例PBR材质
            var layaMonkeyMat: PBRStandardMaterial = new PBRStandardMaterial();
            //albedoTexture:法线贴图：增强模型细节

            //反射贴图
            Texture2D.load('res/threeDimen/pbrtest/PBRAssets03/Materials/Textures/Barrel_AlbedoTransparency.png', Handler.create(this, function (texture: Texture2D): void {
                layaMonkeyMat.albedoTexture = texture;
            }));

            //法线贴图
            Texture2D.load('res/threeDimen/pbrtest/PBRAssets03/Materials/Textures/Barrel_Normal.png', Handler.create(this, function (texture: Texture2D): void {
                layaMonkeyMat.normalTexture = texture;
            }));

            //金属光滑度贴图
            Texture2D.load('res/threeDimen/pbrtest/PBRAssets03/Materials/Textures/Barrel_MetallicSmoothness.png', Handler.create(this, function (texture: Texture2D): void {
                layaMonkeyMat.metallicGlossTexture = texture;
            }));

            //遮挡贴图
            Texture2D.load('res/threeDimen/pbrtest/PBRAssets03/Materials/Textures/Barrel_Occlusion.png', Handler.create(this, function (texture: Texture2D): void {
                layaMonkeyMat.occlusionTexture = texture;
            }));

            //反射颜色
            layaMonkeyMat.albedoColor = new Color(1.3, 1.3, 1.3, 1.3);
            //光滑度缩放系数
            layaMonkeyMat.smoothnessTextureScale = 1.3;
            //遮挡贴图强度
            layaMonkeyMat.occlusionTextureStrength = 1.3;
            //法线贴图缩放系数
            //mat.normalScale = 1;
            //光滑度数据源:从金属度贴图/反射贴图获取。
            layaMonkeyMat.smoothnessSource = PBRMetallicSmoothnessSource.MetallicGlossTextureAlpha;

			meshSprite3D.meshRenderer.sharedMaterial = layaMonkeyMat;


			if( _this.skinmodels.length > 3)
			{
				_this.createSkinmodel();
			}
            
        }));

		//加载Mesh 茶壶
		Mesh.load("res/threeDimen/staticModel/teapot/teapot-Teapot001.lm", Handler.create(this, function (mesh: Mesh): void {

			var meshSprite3D:MeshSprite3D = new MeshSprite3D(mesh);
			meshSprite3D.transform.scale = new Vector3(2,2,2);
			_this.skinmodels.push(meshSprite3D);

				//实例PBR材质
			var teapotMat: PBRStandardMaterial = new PBRStandardMaterial();
			//albedoTexture:法线贴图：增强模型细节

			//反射贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets04/Materials/Textures/Barrel_AlbedoTransparency.png', Handler.create(this, function (texture: Texture2D): void {
				teapotMat.albedoTexture = texture;
			}));

			//法线贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets04/Materials/Textures/Barrel_Normal.png', Handler.create(this, function (texture: Texture2D): void {
				teapotMat.normalTexture = texture;
			}));

			//金属光滑度贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets04/Materials/Textures/Barrel_MetallicSmoothness.png', Handler.create(this, function (texture: Texture2D): void {
				teapotMat.metallicGlossTexture = texture;
			}));

			//遮挡贴图
			Texture2D.load('res/threeDimen/pbrtest/PBRAssets04/Materials/Textures/Barrel_Occlusion.png', Handler.create(this, function (texture: Texture2D): void {
				teapotMat.occlusionTexture = texture;
			}));

			//反射颜色
			teapotMat.albedoColor = new Color(1.4, 1.4, 1.4, 1.4);
			//光滑度缩放系数
			teapotMat.smoothnessTextureScale = 1.4;
			//遮挡贴图强度
			teapotMat.occlusionTextureStrength = 1.4;
			//法线贴图缩放系数
			//mat.normalScale = 1;
			//光滑度数据源:从金属度贴图/反射贴图获取。
			teapotMat.smoothnessSource = PBRMetallicSmoothnessSource.MetallicGlossTextureAlpha;

			meshSprite3D.meshRenderer.sharedMaterial = teapotMat;

			if( _this.skinmodels.length > 3)
			{
				_this.createSkinmodel();
			}
		}));
	}

	createSkinmodel() {
		var nNum: number = this.modelRow * this.modelRow;
		for (let i: number = 0; i < nNum; i++) {
			var x: number = parseInt((i / this.modelRow).toString());
			var y: number = parseInt((i % this.modelRow).toString());
			var sp: Sprite3D = Sprite3D.instantiate(this.skinmodels[i%4], this._scene, false, new Vector3((-this.modelRow / 2 + x), 9, 20 + -y));
			this._scene.addChild(sp);
		}
	}
}

