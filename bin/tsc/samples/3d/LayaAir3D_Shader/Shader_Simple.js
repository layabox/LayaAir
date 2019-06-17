import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { SubShader } from "laya/d3/shader/SubShader";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { CustomMaterial } from "./customMaterials/CustomMaterial";
import SimpleShaderVS from "./customShader/simpleShader.vs";
import SimpleShaderFS from "./customShader/simpleShader.fs";
/**
 * ...
 * @author ...
 */
export class Shader_Simple {
    constructor() {
        this.rotation = new Vector3(0, 0.01, 0);
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        this.initShader();
        var scene = Laya.stage.addChild(new Scene3D());
        var camera = (scene.addChild(new Camera(0, 0.1, 100)));
        camera.transform.translate(new Vector3(0, 0.5, 1.5));
        camera.addComponent(CameraMoveScript);
        camera.clearColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Handler.create(this, function (mesh) {
            var layaMonkey = scene.addChild(new MeshSprite3D(mesh));
            layaMonkey.transform.localScale = new Vector3(0.3, 0.3, 0.3);
            layaMonkey.transform.rotation = new Quaternion(0.7071068, 0, 0, -0.7071067);
            var customMaterial = new CustomMaterial();
            layaMonkey.meshRenderer.sharedMaterial = customMaterial;
            Laya.timer.frameLoop(1, this, function () {
                layaMonkey.transform.rotate(this.rotation, false);
            });
        }));
    }
    initShader() {
        var attributeMap = { 'a_Position': VertexMesh.MESH_POSITION0, 'a_Normal': VertexMesh.MESH_NORMAL0 };
        var uniformMap = { 'u_MvpMatrix': Shader3D.PERIOD_SPRITE, 'u_WorldMat': Shader3D.PERIOD_SPRITE };
        var customShader = Shader3D.add("CustomShader");
        var subShader = new SubShader(attributeMap, uniformMap);
        customShader.addSubShader(subShader);
        subShader.addShaderPass(SimpleShaderVS, SimpleShaderFS);
    }
}
