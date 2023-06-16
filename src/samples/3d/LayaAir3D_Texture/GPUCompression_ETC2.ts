import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { Browser } from "laya/utils/Browser";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";

export class GPUCompression_ETC2{

    private mat:UnlitMaterial;
    constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();

			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.translate(new Vector3(0, 2, 5));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);
			camera.clearColor = new Color(0.2, 0.2, 0.2, 1.0);

			let meshSprite = new MeshSprite3D(PrimitiveMesh.createBox());
			this.mat = new UnlitMaterial();
			scene.addChild(meshSprite);
			meshSprite.meshRenderer.sharedMaterial = this.mat;
			if(!Browser.onAndroid){
				console.log("只有安卓支持ETC");
				return;
			}

			Texture2D.load("res/threeDimen/texture/ETC2Test.ktx", Handler.create(this, function (texture: Texture2D): void {
				this.mat.albedoTexture = texture;
				//修改材质贴图的平铺和偏移
			}));
		});


    }
}