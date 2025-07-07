/**
description
 三维纹理演示，加载箱子贴图并设置纹理属性
 */
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Material } from "laya/resource/Material";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "laya/RenderEngine/RenderEnum/WrapMode";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { Stat } from "laya/utils/Stat";
import { Event } from "laya/events/Event";

/**
 * ...
 * @author ...
 */
export class TextureDemo {
	private sprite3D: Sprite3D;
	private mat1: BlinnPhongMaterial;
	private mat2: PBRStandardMaterial;
	private mat3: UnlitMaterial;
	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//Stat.show();
			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.translate(new Vector3(0, 2, 5));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);
			camera.clearColor = new Color(0.2, 0.2, 0.2, 1.0);

			let directlightSprite = new Sprite3D();
			let dircom = directlightSprite.addComponent(DirectionLightCom);
			scene.addChild(directlightSprite);
			//设置平行光的方向
			var mat: Matrix4x4 = directlightSprite.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, -1.0));
			directlightSprite.transform.worldMatrix = mat;

			this.sprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));

			// //正方体
			// var box: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5))));
			// box.transform.position = new Vector3(0.0, 1.0, 2.5);
			// box.transform.rotate(new Vector3(0, 0, 0), false, false);
			this.mat1 = new BlinnPhongMaterial();
			this.mat2 = new PBRStandardMaterial();
			this.mat2.albedoColor = new Color(1, 0, 0, 1);
			this.mat3 = new UnlitMaterial();
			//漫反射贴图
			Texture2D.load("res/threeDimen/texture/layabox.png", Handler.create(this, function (texture: Texture2D): void {
				//在U方向上使用WRAPMODE_CLAMP
				texture.wrapModeU = WrapMode.Clamp;
				//在V方向使用WRAPMODE_REPEAT
				texture.wrapModeV = WrapMode.Repeat;
				//设置过滤方式
				texture.filterMode = FilterMode.Bilinear;
				//设置各向异性等级
				texture.anisoLevel = 2;

				this.mat1.albedoTexture = texture;
				//修改材质贴图的平铺和偏移
				var tilingOffset: Vector4 = this.mat1.tilingOffset;
				tilingOffset.setValue(3, 3, 0.0, 0.0);
				this.mat1.tilingOffset = tilingOffset;

				this.createMoreBox();
			}));
		});

	}
	createMoreBox() {
		let xLine = 10;
		let yLine = 10;
		let zLine = 10;
		let oriVec3 = new Vector3(-5, -10, -20);
		let mtls = [this.mat1, this.mat2, this.mat3]
		let mid = 0;
		let mesh = PrimitiveMesh.createBox(0.5, 0.5, 0.5);
		for (let x = 0; x < xLine; x++) {
			for (let y = 0; y < yLine; y++) {
				for (let z = 0; z < zLine; z++) {
					var box: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(mesh)));
					box.transform.position = new Vector3(x + oriVec3.x, y + oriVec3.y, z + oriVec3.z);
					box.transform.rotate(new Vector3(0, 0, 0), false, false);
					box.meshRenderer.sharedMaterial = mtls[(mid++)%3]
				}
			}
		}

	}
}


