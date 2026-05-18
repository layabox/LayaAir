import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";
import "laya/gltf/glTFLoader";
import "laya/navigation/common/ModuleDef";
import "laya/navigation/3D/ModuleDef";
import "laya/navigation/2D/ModuleDef";
import "laya/trail/trail2D/ModuleDef";
import "laya/trail/trail3D/ModuleDef";
import "laya/Light2D/ModuleDef";
import "laya/Line2D/ModuleDef";
import "laya/d3/postProcessEffect/ModuleDef";
import "laya/particle/common/ModuleDef";
import "laya/particle/d2/ModuleDef";
import "laya/particle/d3/ModuleDef";
import "laya/utils/StatUI";

import "laya/legacy/Animator";
import "laya/legacy/BaseCamera";
import "laya/legacy/Camera";
import "laya/legacy/HierarchyParserV2";
import "laya/legacy/LegacyUIParser";
import "laya/legacy/Light";
import "laya/legacy/LightSprite";
import "laya/legacy/MeshSprite3D";
import "laya/legacy/PhysicsColliderComponent";
import "laya/legacy/PointLightCom";
import "laya/legacy/ShuriKenParticle3D";
import "laya/legacy/SimpleSkinnedMeshSprite3D";
import "laya/legacy/SkinnedMeshSprite3D";
import "laya/legacy/SpotLightCom";
import "laya/legacy/Sprite3D";
import "laya/legacy/TrailSprite3D";

import { WasmAdapter } from "laya/utils/WasmAdapter";

//Use Bullet physics engine
import "laya/Physics3D/Bullet/btPhysicsCreateUtil";
import { Browser } from "laya/utils/Browser";
import { Laya } from "Laya";
import { Bridge3DCamera } from "laya/bridge/Bridge3DCamera";
import { Scene } from "laya/display/Scene";
import { Config, PlayerConfig } from "Config";
import { SpineConst } from "laya/spine/SpineConst";
import { BatchManager } from "laya/RenderDriver/RenderModuleData/WebModuleData/2D/BatchManager";
import { BaseRender2DType } from "laya/display/SpriteConst";
import { JSSpineFactory } from "laya/spine/web/JSSpineFactory";
import { SpineAdapter } from "laya/spine/web/SpineAdapter";
import { SpineInstanceBatch } from "laya/spine/web/base/2d/batch/SpineInstanceBatch";
import { SpineNormalBatch } from "laya/spine/web/base/2d/batch/SpineNormalBatch";
import { SpineNormalRenderUpdater } from "laya/spine/web/base/optimize/SpineNormalRenderUpdater";
import { Bridge3DSceneInternal } from "laya/bridge/Bridge3DSceneInternal";
import { Config3D } from "Config3D";
import { regClass, property, runInEditor } from "Decorators";
import { LayaEnv } from "LayaEnv";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
import { Script } from "laya/components/Script";
import { Script3D } from "laya/d3/component/Script3D";
import { ReflectionProbe } from "laya/d3/component/Volume/reflectionProbe/ReflectionProbe";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { MeshFilter } from "laya/d3/core/MeshFilter";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { PostProcessEffect } from "laya/d3/core/render/postProcessBase/PostProcessEffect";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Scene3DShaderDeclaration } from "laya/d3/core/scene/Scene3DShaderDeclaration";
import { Cluster } from "laya/d3/graphics/renderPath/Cluster";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { InputManager } from "laya/events/InputManager";
import { LayaGL } from "laya/layagl/LayaGL";
import { MaterialParser } from "laya/loaders/MaterialParser";
import { Color } from "laya/maths/Color";
import { Matrix3x3 } from "laya/maths/Matrix3x3";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Quaternion } from "laya/maths/Quaternion";
import { Vector2 } from "laya/maths/Vector2";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { Loader } from "laya/net/Loader";
import { Prefab } from "laya/resource/HierarchyResource";
import { Material, MaterialRenderMode } from "laya/resource/Material";
import { RenderTexture, DepthTextureMode } from "laya/resource/RenderTexture";
import { Texture2D } from "laya/resource/Texture2D";
import { Texture2DArray } from "laya/resource/Texture2DArray";
import { UIConfig2 } from "laya/ui2/UIConfig";
import { ClassUtils } from "laya/utils/ClassUtils";
import { Stat } from "laya/utils/Stat";









(window as any).Laya = Laya;
(window as any).Laya.WasmAdapter = WasmAdapter;

// Register engine classes for IDE published projects (accessed via Laya.XXX)
let W = (window as any).Laya;
// Resource & Rendering
W.Texture2D = Texture2D;
W.Shader3D = Shader3D;
W.SubShader = SubShader;
W.ShaderDataType = ShaderDataType;
W.RenderState = RenderState;
W.VertexMesh = VertexMesh;
W.RenderTexture = RenderTexture;
W.Material = Material;
W.MaterialRenderMode = MaterialRenderMode;
W.MaterialParser = MaterialParser;
W.PostProcessEffect = PostProcessEffect;
W.RenderTargetFormat = RenderTargetFormat;
W.FilterMode = FilterMode;
W.Texture2DArray = Texture2DArray;
W.LayaGL = LayaGL;
W.PlayerConfig = PlayerConfig;
// Math
W.Vector2 = Vector2;
W.Vector3 = Vector3;
W.Vector4 = Vector4;
W.Quaternion = Quaternion;
W.Matrix3x3 = Matrix3x3;
W.Matrix4x4 = Matrix4x4;
W.Color = Color;
// 3D Scene & Components
W.Scene3D = Scene3D;
W.Scene3DShaderDeclaration = Scene3DShaderDeclaration;
W.Sprite3D = Sprite3D;
W.Camera = Camera;
W.BaseCamera = BaseCamera;
W.CameraClearFlags = CameraClearFlags;
W.MeshRenderer = MeshRenderer;
W.MeshFilter = MeshFilter;
W.Mesh = Mesh;
W.ReflectionProbe = ReflectionProbe;
W.Cluster = Cluster;
W.RenderContext3D = RenderContext3D;
W.DepthTextureMode = DepthTextureMode;
// Script & Components
W.Script = Script;
W.Script3D = Script3D;
W.Prefab = Prefab;
// Utilities
W.ClassUtils = ClassUtils;
W.InputManager = InputManager;
W.Event = Event;
W.Loader = Loader;
W.Stat = Stat;
W.LayaEnv = LayaEnv;
W.Config3D = Config3D;
W.Config = Config;
W.Scene = Scene;
W.Browser = Browser;
W.UIConfig2 = UIConfig2;
W.URL = URL;
// Decorators
W.regClass = regClass;
W.property = property;
W.runInEditor = runInEditor;














// Laya.addBeforeInitCallback(() => {
//     return Browser.loadLib("jsLibs/laya.Box2D.wasm.js");
// });

Scene.bridge3DInternalHandler = (scene) => new Bridge3DSceneInternal(scene);


Laya.addInitCallback(() => {
    Bridge3DCamera.__init__();
});

Laya.addAfterInitCallback(() => {
    if (PlayerConfig.spineVersion)
        SpineConst.VERSION = PlayerConfig.spineVersion;
    SpineConst.factory = new JSSpineFactory();
    SpineNormalRenderUpdater.__init__();
    SpineAdapter.adaptJS();
    if (SpineConst.ENABLE_WEB_BATCH) {
        BatchManager.registerProvider(BaseRender2DType.spineSimple, SpineInstanceBatch);
        BatchManager.registerProvider(BaseRender2DType.spinenormal, SpineNormalBatch);
    }
})