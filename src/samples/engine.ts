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

//or Use physX physics engine
//import "laya/Physics3D/PhysX/pxPhysicsCreateUtil";

(window as any).Laya = (window as any).Laya || {};
(window as any).Laya.WasmAdapter = WasmAdapter;

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