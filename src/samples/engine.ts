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
import "laya/particle/ModuleDef";
import "laya/Light2D/ModuleDef";
import "laya/Line2D/ModuleDef";
import "laya/d3/postProcessEffect/ModuleDef";
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

//or Use physX physics engine
//import "laya/Physics3D/PhysX/pxPhysicsCreateUtil";

(window as any).Laya = {};
(window as any).Laya.WasmAdapter = WasmAdapter;