import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderPass } from "laya/d3/shader/ShaderPass";
import { SubShader } from "laya/d3/shader/SubShader";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { CustomMaterial } from "./customMaterials/CustomMaterial";
import GlowingEdgeShaderFS from "./customShader/glowingEdgeShader.fs";
import GlowingEdgeShaderVS from "./customShader/glowingEdgeShader.vs";



/**
 * ...
 * @author
 */
export class Shader_GlowingEdge {
	private rotation: Vector3 = new Vector3(0, 0.01, 0);

	constructor() {
		//开启Shader调试模式
		Shader3D.debugMode = true;
		//初始化引擎
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();
		//初始化shader
		this.initShader();

		//创建场景
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		//创建相机
		var camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 1000))));
		camera.transform.translate(new Vector3(0, 0.85, 1.7));
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);

		//创建平行光
		var directionLight: DirectionLight = new DirectionLight();
		scene.addChild(directionLight);
		directionLight.color = new Vector3(1, 1, 1);

		//加载精灵
		Sprite3D.load("res/threeDimen/skinModel/dude/dude.lh", Handler.create(this, function (dude: Sprite3D): void {
			scene.addChild(dude);

			//使用自定义的材质
			var customMaterial1: CustomMaterial = new CustomMaterial();
			//加载纹理
			Texture2D.load("res/threeDimen/skinModel/dude/Assets/dude/head.png", Handler.create(this, function (tex: Texture2D): void {
				customMaterial1.diffuseTexture = tex;
			}));
			//设置边缘颜色
			customMaterial1.marginalColor = new Vector3(1, 0.7, 0);

			var customMaterial2: CustomMaterial = new CustomMaterial();
			Texture2D.load("res/threeDimen/skinModel/dude/Assets/dude/jacket.png", Handler.create(this, function (tex: Texture2D): void {
				customMaterial2.diffuseTexture = tex;
			}));
			customMaterial2.marginalColor = new Vector3(1, 0.7, 0);

			var customMaterial3: CustomMaterial = new CustomMaterial();
			Texture2D.load("res/threeDimen/skinModel/dude/Assets/dude/pants.png", Handler.create(this, function (tex: Texture2D): void {
				customMaterial3.diffuseTexture = tex;
			}));
			customMaterial3.marginalColor = new Vector3(1, 0.7, 0);

			var customMaterial4: CustomMaterial = new CustomMaterial();
			Texture2D.load("res/threeDimen/skinModel/dude/Assets/dude/upBodyC.png", Handler.create(this, function (tex: Texture2D): void {
				customMaterial4.diffuseTexture = tex;
			}))
			customMaterial4.marginalColor = new Vector3(1, 0.7, 0);

			var baseMaterials: BaseMaterial[] = [];
			baseMaterials[0] = customMaterial1;
			baseMaterials[1] = customMaterial2;
			baseMaterials[2] = customMaterial3;
			baseMaterials[3] = customMaterial4;

			((<SkinnedMeshSprite3D>dude.getChildAt(0).getChildAt(0))).skinnedMeshRenderer.sharedMaterials = baseMaterials;
			dude.transform.position = new Vector3(0, 0.5, 0);
			dude.transform.scale = new Vector3(0.2, 0.2, 0.2);
			dude.transform.rotate(new Vector3(0, 180, 0), false, false);
		}));

		//加载地球精灵
		var earth: MeshSprite3D = (<MeshSprite3D>scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(0.5, 128, 128))));

		var customMaterial: CustomMaterial = new CustomMaterial();
		Texture2D.load("res/threeDimen/texture/earth.png", Handler.create(this, function (tex: Texture2D): void {
			customMaterial.diffuseTexture = tex;
		}));
		customMaterial.marginalColor = new Vector3(0.0, 0.3, 1.0);
		earth.meshRenderer.sharedMaterial = customMaterial;

		Laya.timer.frameLoop(1, this, function (): void {
			earth.transform.rotate(this.rotation, true);
		});
	}

	//初始化shader
	private initShader(): void {
		var attributeMap: any = { 'a_Position': VertexMesh.MESH_POSITION0, 'a_Normal': VertexMesh.MESH_NORMAL0, 'a_Texcoord': VertexMesh.MESH_TEXTURECOORDINATE0, 'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0, 'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0 };
		var uniformMap: any = { 'u_Bones': Shader3D.PERIOD_CUSTOM, 'u_CameraPos': Shader3D.PERIOD_CAMERA, 'u_MvpMatrix': Shader3D.PERIOD_SPRITE, 'u_WorldMat': Shader3D.PERIOD_SPRITE, 'u_texture': Shader3D.PERIOD_MATERIAL, 'u_marginalColor': Shader3D.PERIOD_MATERIAL, 'u_DirectionLight.Direction': Shader3D.PERIOD_SCENE, 'u_DirectionLight.Color': Shader3D.PERIOD_SCENE };
		//创建自定义shader
		var customShader: Shader3D = Shader3D.add("CustomShader");
		//为当前自定义的shader添加SubShader
		var subShader: SubShader = new SubShader(attributeMap, uniformMap, SkinnedMeshSprite3D.shaderDefines);
		customShader.addSubShader(subShader);
		//SubShader添加ShaderPass
		(<ShaderPass>subShader.addShaderPass(GlowingEdgeShaderVS, GlowingEdgeShaderFS));
		//Shader3D.compileShader("CustomShader", 0, 0, 5, 0, 0);
	}
}

