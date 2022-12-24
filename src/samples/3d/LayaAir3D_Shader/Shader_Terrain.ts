import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { Stage } from "laya/display/Stage";
import { Vector2 } from "laya/maths/Vector2";
import { Vector3 } from "laya/maths/Vector3";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { CustomTerrainMaterial } from "./customMaterials/CustomTerrainMaterial";
import TerrainShaderFS from "./customShader/terrainShader.fs";
import TerrainShaderVS from "./customShader/terrainShader.vs";



/**
 * ...
 * @author
 */
export class Shader_Terrain {

	constructor() {

		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		this.initShader();

		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D));

		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 1000)));
		camera.transform.rotate(new Vector3(-18, 180, 0), false, false);
		camera.transform.translate(new Vector3(-28, 20, -18), false);
		camera.addComponent(CameraMoveScript);

		Mesh.load("res/threeDimen/skinModel/Terrain/terrain_New-Part-01.lm", Handler.create(this, function (mesh: Mesh): void {
			var terrain: MeshSprite3D = (<MeshSprite3D>scene.addChild(new MeshSprite3D(mesh)));
			var customMaterial: CustomTerrainMaterial = new CustomTerrainMaterial();
			Texture2D.load("res/threeDimen/skinModel/Terrain/splatAlphaTexture.png", Handler.create(this, function (tex: Texture2D): void {
				customMaterial.splatAlphaTexture = tex;
			}));
			Texture2D.load("res/threeDimen/skinModel/Terrain/ground_01.jpg", Handler.create(this, function (tex: Texture2D): void {
				customMaterial.diffuseTexture1 = tex;
			}));

			Texture2D.load("res/threeDimen/skinModel/Terrain/ground_02.jpg", Handler.create(this, function (tex: Texture2D): void {
				customMaterial.diffuseTexture2 = tex;
			}));

			Texture2D.load("res/threeDimen/skinModel/Terrain/ground_03.jpg", Handler.create(this, function (tex: Texture2D): void {
				customMaterial.diffuseTexture3 = tex;
			}));

			Texture2D.load("res/threeDimen/skinModel/Terrain/ground_04.jpg", Handler.create(this, function (tex: Texture2D): void {
				customMaterial.diffuseTexture4 = tex;
			}))
			customMaterial.setDiffuseScale1(new Vector2(27.92727, 27.92727));
			customMaterial.setDiffuseScale2(new Vector2(13.96364, 13.96364));
			customMaterial.setDiffuseScale3(new Vector2(18.61818, 18.61818));
			customMaterial.setDiffuseScale4(new Vector2(13.96364, 13.96364));
			terrain.meshRenderer.sharedMaterial = customMaterial;
		}))

	}

	private initShader(): void {

		CustomTerrainMaterial.__init__();
		var customTerrianShader: Shader3D = Shader3D.add("CustomTerrainShader");
		var subShader: SubShader = new SubShader();
		customTerrianShader.addSubShader(subShader);
		subShader.addShaderPass(TerrainShaderVS, TerrainShaderFS);
	}

}


