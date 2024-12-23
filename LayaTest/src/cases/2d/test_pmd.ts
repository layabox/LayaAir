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
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { CameraController1 } from "../../utils/CameraController1"
import { Animator } from "laya/d3/component/Animator/Animator";
import { AnimatorState } from "laya/d3/component/Animator/AnimatorState";
import { AnimatorControllerLayer } from "laya/d3/component/Animator/AnimatorControllerLayer";
import { Color } from "laya/maths/Color";
import { MeshFilter } from "laya/d3/core/MeshFilter";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Quaternion } from "laya/maths/Quaternion";
import { MMDSprite } from "laya/mmd/Loader/mmdToLaya";

MeshReader; //MeshLoader.v3d 赋值

function createYCylinder(length:number, color: Color) {
    let sp3 = new Sprite3D();
    let mf = sp3.addComponent(MeshFilter);
    mf.sharedMesh = PrimitiveMesh.createCylinder(0.1, length);
    let r = sp3.addComponent(MeshRenderer)
    let mtl = new BlinnPhongMaterial();
    r.material = mtl;
    mtl.albedoColor = color;
    return sp3;
}

function createBoneModel(length:number) {
    const ycylinder = createYCylinder(length, new Color(1, 1, 1, 1));
    let Rot = new Quaternion();
    Quaternion.createFromAxisAngle(new Vector3(1,0,0), Math.PI/2,Rot);
    ycylinder.transform.localRotation = Rot;
    ycylinder.transform.localPosition = new Vector3(0, 0, length * 0.5);
    let sp = new Sprite3D('bone Dummy');
    sp.addChild(ycylinder);
    return sp;
}

//HierarchyLoader和MaterialLoader等是通过前面的import完成的
let lm = './pmx/miku_v2/miku_v2.pmd'
async function test(){
    //初始化引擎
    await Laya.init(0,0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let scene =new Scene3D();
    Laya.stage.addChild(scene);

    

    // 创建相机
    let camera = scene.addChild(new Camera(0, 0.1, 100)) as Camera;
    camera.farPlane=200;
    camera.transform.translate(new Vector3(0, 0, 10));
    camera.transform.rotate(new Vector3(0, 0, 0), true, false);
    camera.addComponent(CameraController1);

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
    let mmdsp = await Laya.loader.load(lm) as MMDSprite;
    
    // 创建MeshSprite3D并应用加载的网格数据
    scene.addChild(mmdsp);

    //显示骨骼
    for (let sp of mmdsp.skeleton.sprites){
        let length = (sp as any).boneLength ||1;
        let bone = createBoneModel(length);
        sp.addChild(bone);
    }
    
    // 调整模型位置和缩放
    mmdsp.transform.position = new Vector3(0, 0, 0);
    mmdsp.transform.setWorldLossyScale(new Vector3(1, 1, 1));
    
    let mtl = new BlinnPhongMaterial();
    mmdsp.renderSprite.meshRenderer.sharedMaterial = mtl;
    //mmdsp.renderSprite.active=false;
    console.log("Mesh loaded and added to scene");

    let vmd = await Laya.loader.load('./pmx/miku_v2/wavefile_v2.vmd');
    let animator: Animator = mmdsp.addComponent(Animator);
    let animatorLayer: AnimatorControllerLayer = new AnimatorControllerLayer("AnimatorLayer");
    animator.addControllerLayer(animatorLayer);
    animatorLayer.defaultWeight = 1.0;    
    // 创建动画状态
    let state: AnimatorState = new AnimatorState();
    state.name = "move";
    state.clip = vmd;

    //这时候会查找对象
    animatorLayer.addState(state);

    // 播放动画
    animator.play("move");

}


test();