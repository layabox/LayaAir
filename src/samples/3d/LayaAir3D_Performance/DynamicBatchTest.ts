/**
description
 动态批处理测试，创建具有多层圆形排列的3D小盒子场景
 */
import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { testUtil } from "./testUtil";
import { Material } from "laya/resource/Material";
import { Quaternion } from "laya/maths/Quaternion";
import { BaseRenderType } from "laya/RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { SkyDome } from "laya/d3/resource/models/SkyDome";
import { SkyBoxMaterial } from "laya/d3/core/material/SkyBoxMaterial";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { ShadowCascadesMode } from "laya/d3/core/light/ShadowCascadesMode";
import { ShadowMode } from "laya/d3/core/light/ShadowMode";


//2019.0.17 8.00PM

//PC:
//机型:Surface Pro 6     CPU:I5-8250U 	  GPU:Intel UHD Graphics 620    平台:chrome:75.0.3770.90     分辨率:外接1080P显示器 Chrome全屏    帧率：43-45

//Mobile
//机型:Mi note 3   		 CPU:骁龙660      GPU:CPU集成                    平台：chrome 71.0.3578.99    分辨率:横屏                         帧率： 16-17
//机型:Mi Mix3       	 CPU:骁龙845 	  GPU:CPU集成                    平台:chrome:72.0.3626.105    分辨率:横屏                         帧率：16-19 
//机型:Mi 9        		 CPU:骁龙855 	  GPU:CPU集成                    平台:chrome:75.0.3770.89     分辨率:横屏                         帧率：52-55          

export class DynamicBatchTest {
	private _testUtil = new testUtil();
	constructor() {
		Laya.init(0, 0).then(() => {

			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();

			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
			scene.ambientColor = new Color(1, 1, 1);

			var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 1000)));
			camera.transform.translate(new Vector3(0, 6.2, 10.5));
			camera.transform.rotate(new Vector3(-40, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);


			camera.clearFlag = CameraClearFlags.Sky;

			//天空盒
			Material.load("res/threeDimen/skyBox/DawnDusk/SkyBox.lmat", Handler.create(this, function (mat: SkyBoxMaterial): void {
				//获取相机的天空渲染器
				var skyRenderer: SkyRenderer = camera.scene.skyRenderer;
				//创建天空盒的mesh
				skyRenderer.mesh = SkyDome.instance;
				// 设置曝光值
				var exposureNumber: number = 1.0;
				mat.exposure = exposureNumber;
				//设置天空盒材质
				skyRenderer.material = mat;


				//this.test1(scene, camera);
				//this.test2(scene, camera);
				//this.test3(scene, camera);
				//this.test4(scene, camera);
				//this.test5(scene, camera);
				//this.test6(scene, camera);
				//this.test7(scene, camera);
				//this.test8(scene, camera);
				//this.test9(scene, camera);
				//this.test10(scene, camera);
				this.test11(scene, camera);
			}));

		});
	}

	//测试一、大量单体数据
	test1(scene: Scene3D, camera: Camera): void {
		Texture2D.load("res/threeDimen/layabox.png", Handler.create(null, function (tex: Texture2D): void {
			var radius: Vector3 = new Vector3(0, 0, 1);
			var radMatrix: Matrix4x4 = new Matrix4x4();
			var circleCount: number = 50;

			var boxMesh: Mesh = PrimitiveMesh.createBox(0.02, 0.02, 0.02);
			var boxMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			boxMat.albedoTexture = tex;
			let count = 0;
			for (var i: number = 0; i < circleCount; i++) {
				radius.z = 1.0 + i * 0.15;
				radius.y = i * 0.03;
				var oneCircleCount: number = 100 + i * 15;
				for (var j: number = 0; j < oneCircleCount; j++) {
					count++

					var boxSprite: MeshSprite3D = new MeshSprite3D(boxMesh);
					boxSprite.meshRenderer.sharedMaterial = boxMat;
					var localPos: Vector3 = boxSprite.transform.localPosition;
					var rad: number = ((Math.PI * 2) / oneCircleCount) * j;
					Matrix4x4.createRotationY(rad, radMatrix);
					Vector3.transformCoordinate(radius, radMatrix, localPos);
					boxSprite.transform.localPosition = localPos;
					scene.addChild(boxSprite);
				}
			}
		}));
	}

	//测试二、单个数据移动
	test2(scene: Scene3D, camera: Camera): void {
		// 由于_testUtil没有meshes和materials属性，改为直接创建mesh和material
		let mesh: Mesh = PrimitiveMesh.createBox(0.5, 0.5, 0.5);
		let material: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/layabox.png", Handler.create(null, (tex: Texture2D): void => {
			material.albedoTexture = tex;
			let nodes: MeshSprite3D[] = [];
			for (let i = 0; i < 10; i++) {
				let node = new MeshSprite3D(mesh);
				node.meshRenderer.sharedMaterial = material;
				node.transform.localPosition = new Vector3(i * 1.5, 0, 0);
				scene.addChild(node);
				nodes.push(node);
			}
			// 让1、3、5、7、9号节点上下sin运动
			let time = 0;
			Laya.timer.frameLoop(1, this, () => {
				time += Laya.timer.delta / 1000;
				const movingIndices = [1, 3, 5, 7, 9];
				for (let idx of movingIndices) {
					let node = nodes[idx];
					let pos = node.transform.localPosition;
					pos.y = Math.sin(time + idx * 0.1) * 2.0;
					node.transform.localPosition = pos;
				}
			});
		}));
	}
	// 测试三、生成十种每种十个的渲染物体
	test3(scene: Scene3D, camera: Camera): void {
		let meshes: Mesh[] = this._testUtil.meshArray;
		let materials: Material[] = this._testUtil.materialArray;
		const meshCount = Math.min(meshes.length, materials.length);
		let Count = 10;
		let curCount = 0;
		let elementCount = 10;
		camera.transform.position = new Vector3(5.36, 15.04, 23.66);
		camera.transform.rotation = new Quaternion(-0.07, -0.07, -0.00, 0.99);
		for (let i = 0; i < meshes.length; i++) {
			for (let j = 0; j < materials.length; j++) {
				if (curCount >= Count) {
					return;
				}
				curCount++;
				// 根据你的逻辑，生成十个MeshSprite3D，并设置对应的mesh和material
				for (let k = 0; k < elementCount; k++) {
					let node = new MeshSprite3D(meshes[i]);
					node.meshRenderer.sharedMaterial = materials[j];
					node.transform.localPosition = new Vector3(k * 2, curCount * 2, 0);
					scene.addChild(node);
				}
			}

		}
	}

	// 测试四、生成20钟不同数量的InstanceDraw
	test4(scene: Scene3D, camera: Camera): void {
		let meshes: Mesh[] = this._testUtil.meshArray;
		let materials: Material[] = this._testUtil.materialArray;
		const meshCount = Math.min(meshes.length, materials.length);
		let Count = 20;
		let curCount = 0;
		let elementCount = 10;
		camera.transform.position = new Vector3(5.36, 15.04, 23.66);
		camera.transform.rotation = new Quaternion(-0.07, -0.07, -0.00, 0.99);
		for (let i = 0; i < meshes.length; i++) {
			for (let j = 0; j < materials.length; j++) {
				if (curCount >= Count) {
					return;
				}
				curCount++;
				// 根据你的逻辑，生成十个MeshSprite3D，并设置对应的mesh和material
				for (let k = 0; k < curCount; k++) {
					let node = new MeshSprite3D(meshes[i]);
					node.meshRenderer.sharedMaterial = materials[j];
					node.transform.localPosition = new Vector3(k * 2, curCount * 2, 0);
					scene.addChild(node);
				}
			}

		}
	}

	//测试五  测试扩张RenderNodeCount的流程
	test5(scene: Scene3D, camera: Camera) {
		//先改_maxRenderNodeCount 为400
		camera.transform.position = new Vector3(39.54820590529586, 14.969745756280817, 57.85090397492968);
		camera.transform.rotation = new Quaternion(0.04542888842020109, -0.0293354336761753, 0.0013346312567456974, 0.9985358617432548);
		Laya.timer.once(0, this, (scene, camera, offset) => {
			let meshes: Mesh[] = this._testUtil.meshArray;
			let materials: Material[] = this._testUtil.materialArray;
			for (let i = 0; i < 20; i++) {
				for (let j = 0; j < 10; j++) {
					let node = new MeshSprite3D(meshes[0]);
					node.meshRenderer.sharedMaterial = materials[0];
					node.transform.localPosition = new Vector3(i * 2 + offset, j * 2, 0);
					scene.addChild(node);
				}
			}
		}, [scene, camera, 0]);
		Laya.timer.once(5000, this, (scene, camera, offset) => {
			let meshes: Mesh[] = this._testUtil.meshArray;
			let materials: Material[] = this._testUtil.materialArray;
			let count = 0;
			for (let i = 0; i < 20; i++) {
				for (let j = 0; j < 20; j++) {
					count++;
					let node = new MeshSprite3D(meshes[0]);
					node.meshRenderer.sharedMaterial = materials[count % 4];
					node.transform.localPosition = new Vector3(i * 2 + offset, j * 2, 0);
					scene.addChild(node);
				}
			}
		}, [scene, camera, 50]);
	}

	//测试留 测试扩张RenderELementCOut的流程
	test6(scene: Scene3D, camera: Camera) {
		let batcucull = scene._sceneRenderManager._sceneManagerOBJ.batchAgentList.get(BaseRenderType.MeshRender) as any;
		//先改_maxRenderNodeCount 为400
		camera.transform.position = new Vector3(39.54820590529586, 14.969745756280817, 57.85090397492968);
		camera.transform.rotation = new Quaternion(0.04542888842020109, -0.0293354336761753, 0.0013346312567456974, 0.9985358617432548);
		Laya.timer.once(0, this, (scene, camera, offset) => {
			let meshes: Mesh[] = this._testUtil.meshArray;
			let materials: Material[] = this._testUtil.materialArray;
			let count = 0;
			for (let i = 0; i < 20; i++) {
				for (let j = 0; j < 10; j++) {
					//count++;
					let node = new MeshSprite3D(meshes[0]);
					node.meshRenderer.sharedMaterial = materials[count % 4];
					node.transform.localPosition = new Vector3(i * 2 + offset, j * 2, 0);
					scene.addChild(node);
				}
			}
		}, [scene, camera, 0]);
		Laya.timer.once(5000, this, (scene, camera, offset) => {
			let meshes: Mesh[] = this._testUtil.meshArray;
			let materials: Material[] = this._testUtil.materialArray;
			let count = 0;
			for (let i = 0; i < 20; i++) {
				for (let j = 0; j < 20; j++) {
					count++;
					let node = new MeshSprite3D(meshes[0]);
					node.meshRenderer.sharedMaterial = materials[(count % 4) + 4];
					node.transform.localPosition = new Vector3(i * 2 + offset, j * 2, 0);
					scene.addChild(node);
				}
			}
		}, [scene, camera, 50]);
	}

	//测试七 测试生成20种随机增加物体，再随机删除，再随机加回来
	test7(scene: Scene3D, camera: Camera) {
		let spriteArray: MeshSprite3D[] = [];
		let meshes: Mesh[] = this._testUtil.meshArray;
		let materials: Material[] = this._testUtil.materialArray;
		const meshCount = Math.min(meshes.length, materials.length);
		let Count = 20;
		let curCount = 0;
		let elementCount = 10;
		camera.transform.position = new Vector3(5.36, 15.04, 23.66);
		camera.transform.rotation = new Quaternion(-0.07, -0.07, -0.00, 0.99);
		for (let i = 0; i < meshes.length; i++) {
			for (let j = 0; j < materials.length; j++) {
				if (curCount >= Count) {
					break;
				}
				curCount++;
				// 根据你的逻辑，生成十个MeshSprite3D，并设置对应的mesh和material
				for (let k = 0; k < curCount + 1; k++) {
					let node = new MeshSprite3D(meshes[i]);
					node.meshRenderer.sharedMaterial = materials[j];
					node.transform.localPosition = new Vector3(k * 2, curCount * 2, 0);
					spriteArray.push(node);
				}
			}
		}
		// 每一秒随机从spriteArray中取若干个（不重复），加到场景，直到全部加完
		let remainSprites = spriteArray.slice(); // 拷贝一份用于操作
		let addPerTime = () => {
			if (remainSprites.length === 0) {
				return;
			}
			// 随机决定这次加多少个，1~5个
			let num = Math.min(remainSprites.length, Math.floor(Math.random() * 5) + 5);
			num = 1;
			for (let i = 0; i < num; i++) {
				// 随机选一个索引
				let idx = Math.floor(Math.random() * remainSprites.length);
				let node = remainSprites[idx];
				scene.addChild(node);
				// 从数组中移除已添加的
				remainSprites.splice(idx, 1);
			}
			if (remainSprites.length > 0) {
				Laya.timer.once(50, this, addPerTime);
			} else {
				// 全部加完后，开始移除逻辑
				let removeSprites = spriteArray.slice(); // 重新拷贝一份用于移除
				let removePerTime = () => {
					if (removeSprites.length === 0) {
						return;
					}
					let num = Math.min(removeSprites.length, Math.floor(Math.random() * 5) + 5);
					num = 1;
					// 修复：收集要删除的节点，然后统一删除，避免索引问题
					let nodesToRemove: any[] = [];
					for (let i = 0; i < num && removeSprites.length > 0; i++) {
						let idx = Math.floor(Math.random() * removeSprites.length);
						let node = removeSprites[idx];
						nodesToRemove.push(node);
						removeSprites.splice(idx, 1);
					}
					// 统一删除节点
					for (let node of nodesToRemove) {
						if (node.parent) {
							node.parent.removeChild(node);
						}
					}
					if (removeSprites.length > 0) {
						Laya.timer.once(50, this, removePerTime);
					}
				};
				removePerTime();
			}
		};
		addPerTime();
	}

	//测试阴影
	test8(scene: Scene3D, camera: Camera) {
		scene.ambientIntensity = 0;
		scene.reflectionIntensity = 0;
		let meshes: Mesh[] = this._testUtil.meshArray;
		let materials: Material[] = this._testUtil.materialArray;
		const meshCount = Math.min(meshes.length, materials.length);
		let Count = 20;
		let curCount = 0;
		let elementCount = 10;
		camera.transform.position = new Vector3(-2.4685432650148846, 13.560541376881313, 52.87579307546343);
		camera.transform.rotation = new Quaternion(-0.19076877031314224, -0.2504873641246638, -0.04553611704744473, 0.948045261963442);
		//light
		var directionLight: Sprite3D = new Sprite3D();
		var directionLightCom: DirectionLightCom = directionLight.addComponent(DirectionLightCom);

		directionLightCom.shadowCascadesMode = ShadowCascadesMode.NoCascades;
		directionLightCom.color = new Color(0.85, 0.85, 0.8, 1);
		directionLight.transform.rotate(new Vector3(-Math.PI / 3, 0, 0));
		scene.addChild(directionLight);
		directionLightCom.shadowDistance = 100;
		directionLightCom.shadowMode = ShadowMode.Hard;
		//plane
		let node = new MeshSprite3D(PrimitiveMesh.createPlane(Count * 3, Count * 3, Count * 3));
		node.meshRenderer.sharedMaterial = materials[0];
		node.meshRenderer.receiveShadow = true;
		node.transform.localPosition = new Vector3(Count, -1, Count);
		scene.addChild(node);

		for (let i = 0; i < meshes.length; i++) {
			for (let j = 0; j < materials.length; j++) {
				if (curCount >= Count) {
					return;
				}
				curCount++;
				// 根据你的逻辑，生成十个MeshSprite3D，并设置对应的mesh和material
				for (let k = 0; k < curCount; k++) {
					let node = new MeshSprite3D(meshes[i]);
					node.meshRenderer.sharedMaterial = materials[j];
					node.meshRenderer.castShadow = true;
					node.transform.localPosition = new Vector3(k * 2, 0, curCount * 2);
					scene.addChild(node);
				}
			}
		}
	}

	test9(scene: Scene3D, camera: Camera) {
		//Texture2D.load("res/threeDimen/layabox.png", Handler.create(null, function (tex: Texture2D): void {
		var radius: Vector3 = new Vector3(0, 0, 1);
		var radMatrix: Matrix4x4 = new Matrix4x4();
		var circleCount: number = 100;

		var boxMesh: Mesh = PrimitiveMesh.createBox(0.02, 0.02, 0.02);
		var boxMat: BlinnPhongMaterial = new BlinnPhongMaterial();

		let count = 0;
		let materialCOunt = 25;
		let meshCount = 25;
		let meshArray = this._testUtil.meshArray;
		let matArray = this._testUtil.materialArray;
		let spriteArray = [];
		let allCube = true;
		if (!allCube) {
			for (let i = 0; i < meshCount; i++) {
				for (let j = 0; j < materialCOunt; j++) {
					for (let k = 0; k < 10; k++) {
						var boxSprite: MeshSprite3D = new MeshSprite3D(meshArray[j]);
						boxSprite.meshRenderer.sharedMaterial = matArray[i];
						spriteArray.push(boxSprite);
					}
				}
			}
		} else {
			for (let i = 0; i < meshCount; i++) {
				let mesh = PrimitiveMesh.createBox(0.5, 0.5, 0.5);
				//let mesh = PrimitiveMesh.createSphere(0.5, 16, 16);
				for (let j = 0; j < materialCOunt; j++) {
					for (let k = 0; k < 10; k++) {
						var boxSprite: MeshSprite3D = new MeshSprite3D(mesh);
						boxSprite.meshRenderer.sharedMaterial = matArray[j];
						spriteArray.push(boxSprite);
					}
				}
			}
		}

		for (var i: number = 0; i < circleCount; i++) {
			radius.z = 1.0 + i * 0.15;
			radius.y = i * 0.03;
			var oneCircleCount: number = 100 + i * 15;
			for (var j: number = 0; j < oneCircleCount; j++) {

				if (count >= spriteArray.length)
					return;

				var boxSprite: MeshSprite3D = spriteArray[count];

				var localPos: Vector3 = boxSprite.transform.localPosition;
				var rad: number = ((Math.PI * 2) / oneCircleCount) * j;
				Matrix4x4.createRotationY(rad, radMatrix);
				Vector3.transformCoordinate(radius, radMatrix, localPos);
				boxSprite.transform.localPosition = localPos;
				let scalesss = 0.1;
				boxSprite.transform.localScale = new Vector3(scalesss, scalesss, scalesss);
				scene.addChild(boxSprite);
				count++
			}
		}
		//	}));
	}

	test10(scene: Scene3D, camera: Camera) {
		let meshes: Mesh[] = this._testUtil.meshArray;
		let materials: Material[] = this._testUtil.materialArray;
		const meshCount = Math.min(meshes.length, materials.length);
		let Count = 10;
		let curCount = 0;
		let elementCount = 10;
		camera.transform.position = new Vector3(5.36, 10.04, 23.66);
		camera.transform.rotation = new Quaternion(-0.07, -0.07, -0.00, 0.99);
		for (let i = 0; i < 1; i++) {
			for (let j = 0; j < 1; j++) {
				if (curCount >= Count) {
					return;
				}
				curCount++;
				// 根据你的逻辑，生成十个MeshSprite3D，并设置对应的mesh和material
				for (let k = 0; k < elementCount; k++) {
					let node = new MeshSprite3D(meshes[i]);
					node.meshRenderer.sharedMaterial = materials[j];
					node.transform.localPosition = new Vector3(k * 2, curCount * 2, 0);
					scene.addChild(node);
				}
			}

		}
	}

	test11(scene: Scene3D, camera: Camera) {
		//Texture2D.load("res/threeDimen/layabox.png", Handler.create(null, function (tex: Texture2D): void {
		var radius: Vector3 = new Vector3(0, 0, 1);
		var radMatrix: Matrix4x4 = new Matrix4x4();
		var circleCount: number = 100;

		var boxMesh: Mesh = PrimitiveMesh.createBox(0.02, 0.02, 0.02);
		var boxMat: BlinnPhongMaterial = new BlinnPhongMaterial();

		let count = 0;
		let materialCOunt = 40;
		let meshCount = 25;
		let meshArray = this._testUtil.meshArray;
		let matArray = this._testUtil.materialArray;
		let spriteArray = [];

		for (let i = 0; i < meshCount; i++) {
			for (let j = 0; j < materialCOunt * 4; j++) {
				for (let k = 0; k < 10; k++) {
					var boxSprite: MeshSprite3D = new MeshSprite3D(meshArray[j]);
					boxSprite.meshRenderer.sharedMaterial = matArray[i];
					spriteArray.push(boxSprite);
				}
			}
		}

		for (var i: number = 0; i < circleCount; i++) {
			radius.z = 1.0 + i * 0.15;
			radius.y = i * 0.03;
			var oneCircleCount: number = 100 + i * 15;
			for (var j: number = 0; j < oneCircleCount; j++) {

				if (count >= spriteArray.length)
					return;

				var boxSprite: MeshSprite3D = spriteArray[count];

				var localPos: Vector3 = boxSprite.transform.localPosition;
				var rad: number = ((Math.PI * 2) / oneCircleCount) * j;
				Matrix4x4.createRotationY(rad, radMatrix);
				Vector3.transformCoordinate(radius, radMatrix, localPos);
				boxSprite.transform.localPosition = localPos;
				let scalesss = 0.1;
				boxSprite.transform.localScale = new Vector3(scalesss, scalesss, scalesss);
				scene.addChild(boxSprite);
				count++
			}
		}
	}
}


