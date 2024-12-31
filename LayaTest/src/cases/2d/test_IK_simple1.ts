import "laya/ModuleDef";

import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshFilter } from "laya/d3/core/MeshFilter";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { IK_CCDSolver } from "laya/IK/IKSolver/IK_CCD_Solver";
import { IK_Chain } from "laya/IK/IK_Chain";
import { IK_ISolver } from "laya/IK/IK_ISolver";
import { IK_Joint } from "laya/IK/IK_Joint";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Quaternion } from "laya/maths/Quaternion";
import { Vector3 } from "laya/maths/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { IK_Target } from "laya/IK/IK_Pose1";
import { rotationTo } from "laya/IK/IK_Utils";
import { IK_FABRIK_Solver } from "laya/IK/IKSolver/IK_FABRIK_Solver";
import { IK_AngleLimit, IK_FixConstraint, IK_HingeConstraint } from "laya/IK/IK_Constraint";
import { IK_System } from "laya/IK/IK_System";
import { CameraController1 } from "../../utils/CameraController1";

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

class IKDemo {
    private scene: Scene3D;
    private camera: Camera;
    private iksys:IK_System;
    private chain:IK_Chain;
    private target: Sprite3D;
    private joints: Sprite3D[];
    private targetPose = new IK_Target(new Vector3(), new Quaternion())

    constructor(scene:Scene3D, camera:Camera) {
        this.scene = scene;
        this.iksys = new IK_System(scene);
        this.camera=camera;
        this.createIKChain();
        this.target = createMeshSprite(PrimitiveMesh.createSphere(0.1),new Color(1,0,0,1));
        scene.addChild(this.target);
        this.iksys.showDbg=true;

        // let O = createMeshSprite(PrimitiveMesh.createSphere(0.2),new Color(0,0,0,1));
        // scene.addChild(O);

        Laya.timer.frameLoop(1, this, this.onUpdate);
    }

    private createIKChain(): void {
        let chain =this.chain= new IK_Chain();
        this.iksys.addChain(chain);
        this.joints = [];

        const numJoints = 3;
        const jointLength = 1;

        let r1 = new Quaternion();
        rotationTo(new Vector3(0,1,0), new Vector3(0,0,1), r1);
        for (let i = 0; i < numJoints; i++) {
            const position = new Vector3(0, i * jointLength, 0);
            const joint = new IK_Joint();
            joint.angleLimit = new IK_AngleLimit( new Vector3(-Math.PI, 0,0), new Vector3(Math.PI, 0,0))
            chain.addJoint(joint, position, true);
            if(i==1){
                joint.angleLimit = new IK_HingeConstraint(new Vector3(1,0,0),null,-Math.PI/4, Math.PI/4, true);
            }else if(i==0){
                joint.angleLimit = new IK_FixConstraint();
            }
            

            const cylinderJoint = createMeshSprite(PrimitiveMesh.createCylinder(0.01, jointLength),new Color(1,1,1,1));
            cylinderJoint.transform.localRotation = r1;
            cylinderJoint.transform.localPosition = new Vector3(0,0,jointLength*0.5);
            let sp = new Sprite3D();
            sp.addChild(cylinderJoint);
            let b = createMeshSprite(PrimitiveMesh.createSphere(0.02),new Color(0,1,0,1));
            sp.addChild(b);
            sp.transform.position = position;
            this.scene.addChild(sp);
            this.joints.push(sp);
        }
        chain.setEndEffector(numJoints-1)
        //this.joints[numJoints-1].active=false;  //最后一个是个球

        //this.solver = new IK_CCDSolver();
        //this.solver = new IK_FABRIK_Solver();
    }

    private onUpdate(): void {
        // Move target
        const time = Laya.timer.currTimer * 0.0002;
        let targetPos = this.target.transform.position;
        targetPos.setValue(
            0,
            Math.sin(time) * 1,
            Math.cos(time) * 2 ,
        );
        //targetPos.setValue(-2,0,0);
        this.targetPose.pos = this.target.transform.position.clone();
        //DEBUG
        //this.targetPose.pos = new Vector3(0,2,-3);
        //targetPos.setValue(3,3,0)

        this.target.transform.position = targetPos;

        this.chain.target = this.targetPose;
        // Solve IK
        this.iksys.onUpdate();

        //this.solver.solve(this.chain, this.targetPose);

        // Update joint visuals
        for (let i = 0; i < this.chain.joints.length; i++) {
            const joint = this.chain.joints[i];
            const cylinderJoint = this.joints[i];

            cylinderJoint.transform.position = joint.position;
            cylinderJoint.transform.rotation = joint.rotationQuat;
        }
    }
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
    camera.transform.translate(new Vector3(-3, 3, 15));
    camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
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

    new IKDemo(scene,camera);
}


test();


