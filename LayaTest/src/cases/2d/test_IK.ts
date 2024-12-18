import "laya/ModuleDef";

import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Sprite } from "laya/display/Sprite";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { MeshReader } from "laya/d3/loaders/MeshReader";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Vector3 } from "laya/maths/Vector3";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Matrix4x4 } from "laya/maths/Matrix4x4";

MeshReader; //MeshLoader.v3d 赋值

//HierarchyLoader和MaterialLoader等是通过前面的import完成的
let lm = './sample-resource/res/threeDimen/scene/LayaScene_DUDEcompress/Conventional/Assets/dude/dude-him.lm'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let scene =new Scene3D();
    Laya.stage.addChild(scene);

    // 创建相机
    let camera = scene.addChild(new Camera(0, 0.1, 100)) as Camera;
    camera.transform.translate(new Vector3(0, 3, 25));
    camera.transform.rotate(new Vector3(-15, 0, 0), true, false);

    // 创建平行光
    let directlightSprite = new Sprite3D();
    let dircom = directlightSprite.addComponent(DirectionLightCom);
    scene.addChild(directlightSprite);
    //方向光的颜色
    dircom.color.setValue(1, 1, 1, 1);
    //设置平行光的方向
    var mat: Matrix4x4 = directlightSprite.transform.worldMatrix;
    mat.setForward(new Vector3(-1.0, -1.0, -1.0));
    directlightSprite.transform.worldMatrix = mat;

    // 加载模型
    let meshData = await Laya.loader.load(lm);

    // 创建MeshSprite3D并应用加载的网格数据
    let meshSprite = new MeshSprite3D(meshData);
    scene.addChild(meshSprite);

    // 调整模型位置和缩放
    meshSprite.transform.position = new Vector3(0, 0, 0);
    meshSprite.transform.setWorldLossyScale(new Vector3(1, 1, 1));

    console.log("Mesh loaded and added to scene");
}


test();