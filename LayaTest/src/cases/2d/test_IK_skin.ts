import "laya/ModuleDef";

import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator/Animator";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshFilter } from "laya/d3/core/MeshFilter";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { SkinnedMeshRenderer } from "laya/d3/core/SkinnedMeshRenderer";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { IK_Comp } from "laya/IK/IK_Comp";
import { IK_Target } from "laya/IK/IK_Pose1";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { PrefabImpl } from "laya/resource/PrefabImpl";
import "laya/d3/ModuleDef"




function createMeshSprite(mesh:Mesh,color:Color){
    let sp3 = new Sprite3D();
    let mf = sp3.addComponent(MeshFilter);
    mf.sharedMesh = mesh;
    let r = sp3.addComponent(MeshRenderer)
    let mtl = new BlinnPhongMaterial();
    r.material = mtl;
    mtl.albedoColor = color;
    return sp3;
}

var ikcomp:IK_Comp;

class IKDemo {
    private scene: Scene3D;
    private camera: Camera;
    private target: Sprite3D;

    constructor(scene:Scene3D, camera:Camera) {
        this.scene = scene;
        this.camera=camera;
        //this.createIKChain();
        this.target = createMeshSprite(PrimitiveMesh.createSphere(0.4),new Color(1,0,0,1));
        scene.addChild(this.target);

        // let O = createMeshSprite(PrimitiveMesh.createSphere(0.2),new Color(0,0,0,1));
        // scene.addChild(O);

        Laya.timer.frameLoop(1, this, this.onUpdate);
    }

    private onUpdate(): void {
        // Move target
        const time = Laya.timer.currTimer * 0.001;
        let targetPos = this.target.transform.position;
        targetPos.setValue(
            Math.sin(time) * 4+10,
           6 ,
            Math.cos(time * 0.5) * 4+10
        );
        ikcomp && ikcomp.setTarget('ttt',new IK_Target(targetPos));
        this.target.transform.position = targetPos;


    }
}

function getChildByID(sp:Sprite3D, id:number){
    // 检查当前节点
    if (sp.id === id) {
        return sp;
    }

    // 获取子节点数量
    const childCount = sp.numChildren;

    // 递归查找所有子节点
    for (let i = 0; i < childCount; i++) {
        const child = sp.getChildAt(i) as Sprite3D;
        
        // 递归调用
        const result = getChildByID(child, id);
        if (result !== null) {
            return result;
        }
    }

    // 如果没有找到，返回null
    return null;    
}

async function test() {
    //初始化引擎
    await Laya.init(0, 0);
    Laya.stage.scaleMode = Stage.SCALE_FULL;
    Laya.stage.screenMode = Stage.SCREEN_NONE;

    let scene = new Scene3D();
    Laya.stage.addChild(scene);

    // 创建相机
    let camera = scene.addChild(new Camera(0, 0.1, 100)) as Camera;
    camera.transform.translate(new Vector3(0, 5, 25));
    //camera.transform.rotate(new Vector3(25, 0, 0), true, false);

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

    //加载模型
    let r1:PrefabImpl = await Laya.loader.load('IKRes/bones_for_ik@0.lh')
    if(r1){
        let skinSp3:Sprite3D = r1.create() as Sprite3D;
        scene.addChild(skinSp3);

        skinSp3.transform.position = new Vector3(10,0,10);

        let posNode = createMeshSprite(PrimitiveMesh.createBox(1,1,1),new Color(1,1,1,1));
        posNode.transform.position = skinSp3.transform.position;
        scene.addChild(posNode)

        //对于导入的gltf，动画是加在根节点上的
        let anim = skinSp3.getComponent(Animator)
        //anim.speed=0;

        ikcomp = skinSp3.addComponent(IK_Comp)
        //根据骨骼创建ik链。可以多个。
        let chain = ikcomp.addChainByBoneName('Bone.004',3,false);
        chain.appendEndEffector(new Vector3(0,1.5,0))
        chain.name='ttt';
        //设置ik目标
        ikcomp.setTarget('ttt', new IK_Target(new Vector3(10,10,10)));        
        ikcomp.showDbg=true;

        //加载材质
        let mtl = await Laya.loader.load('IKRes/Material.lmat')
        let skinsp = getChildByID(skinSp3,5);
        let compSkinn = skinsp.getComponent(SkinnedMeshRenderer);
        compSkinn.sharedMaterial = mtl;
    }
    new IKDemo(scene,camera);
}


test();


