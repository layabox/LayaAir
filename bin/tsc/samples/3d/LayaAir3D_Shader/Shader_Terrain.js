import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { SubShader } from "laya/d3/shader/SubShader";
import { Stage } from "laya/display/Stage";
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
        var scene = Laya.stage.addChild(new Scene3D);
        var camera = scene.addChild(new Camera(0, 0.1, 1000));
        camera.transform.rotate(new Vector3(-18, 180, 0), false, false);
        camera.transform.translate(new Vector3(-28, 20, -18), false);
        camera.addComponent(CameraMoveScript);
        Mesh.load("res/threeDimen/skinModel/Terrain/terrain_New-Part-01.lm", Handler.create(this, function (mesh) {
            var terrain = scene.addChild(new MeshSprite3D(mesh));
            var customMaterial = new CustomTerrainMaterial();
            Texture2D.load("res/threeDimen/skinModel/Terrain/splatAlphaTexture.png", Handler.create(this, function (tex) {
                customMaterial.splatAlphaTexture = tex;
            }));
            Texture2D.load("res/threeDimen/skinModel/Terrain/ground_01.jpg", Handler.create(this, function (tex) {
                customMaterial.diffuseTexture1 = tex;
            }));
            Texture2D.load("res/threeDimen/skinModel/Terrain/ground_02.jpg", Handler.create(this, function (tex) {
                customMaterial.diffuseTexture2 = tex;
            }));
            Texture2D.load("res/threeDimen/skinModel/Terrain/ground_03.jpg", Handler.create(this, function (tex) {
                customMaterial.diffuseTexture3 = tex;
            }));
            Texture2D.load("res/threeDimen/skinModel/Terrain/ground_04.jpg", Handler.create(this, function (tex) {
                customMaterial.diffuseTexture4 = tex;
            }));
            customMaterial.setDiffuseScale1(new Vector2(27.92727, 27.92727));
            customMaterial.setDiffuseScale2(new Vector2(13.96364, 13.96364));
            customMaterial.setDiffuseScale3(new Vector2(18.61818, 18.61818));
            customMaterial.setDiffuseScale4(new Vector2(13.96364, 13.96364));
            terrain.meshRenderer.sharedMaterial = customMaterial;
        }));
    }
    initShader() {
        CustomTerrainMaterial.__init__();
        var attributeMap = { 'a_Position': VertexMesh.MESH_POSITION0, 'a_Normal': VertexMesh.MESH_NORMAL0, 'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0 };
        var uniformMap = { 'u_MvpMatrix': Shader3D.PERIOD_SPRITE, 'u_WorldMat': Shader3D.PERIOD_SPRITE, 'u_CameraPos': Shader3D.PERIOD_CAMERA, 'u_SplatAlphaTexture': Shader3D.PERIOD_MATERIAL, 'u_DiffuseTexture1': Shader3D.PERIOD_MATERIAL, 'u_DiffuseTexture2': Shader3D.PERIOD_MATERIAL, 'u_DiffuseTexture3': Shader3D.PERIOD_MATERIAL, 'u_DiffuseTexture4': Shader3D.PERIOD_MATERIAL, 'u_DiffuseTexture5': Shader3D.PERIOD_MATERIAL, 'u_DiffuseScale1': Shader3D.PERIOD_MATERIAL, 'u_DiffuseScale2': Shader3D.PERIOD_MATERIAL, 'u_DiffuseScale3': Shader3D.PERIOD_MATERIAL, 'u_DiffuseScale4': Shader3D.PERIOD_MATERIAL, 'u_DiffuseScale5': Shader3D.PERIOD_MATERIAL };
        var customTerrianShader = Shader3D.add("CustomTerrainShader");
        var subShader = new SubShader(attributeMap, uniformMap, RenderableSprite3D.shaderDefines, CustomTerrainMaterial.shaderDefines);
        customTerrianShader.addSubShader(subShader);
        subShader.addShaderPass(TerrainShaderVS, TerrainShaderFS);
    }
}
