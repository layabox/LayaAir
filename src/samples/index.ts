import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/particle/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";
import "laya/gltf/glTFLoader";

import { Resource } from "laya/resource/Resource";
import { LayaGL } from "laya/layagl/LayaGL";
import { RenderOBJCreateUtil } from "laya/d3/RenderObjs/RenderObj/RenderOBJCreateUtil";
import { SceneLoad1 } from "./3d/LayaAir3D_Scene3D/SceneLoad1";
import {btPhysicsCreateUtil} from "laya/Physics3D/Bullet/btPhysicsCreateUtil"
import {pxPhysicsCreateUtil} from "laya/Physics3D/PhysX/pxPhysicsCreateUtil"
import { Laya3D } from "Laya3D";
import { PostProcessBloom } from "./3d/LayaAir3D_PostProcess/PostProcessBloom";
import { PhysicsWorld_BaseCollider } from "./3d/LayaAir3D_Physics3D/PhysicsWorld_BaseCollider";
import { physics2DwasmFactory} from "laya/physics/factory/physics2DwasmFactory";
import { Main } from "./Main";
import { Physics } from "laya/physics/Physics";
import { physics2DJSFactory } from "laya/physics/factory/physics2DJSFactory";
Resource.DEBUG = true;
LayaGL.renderOBJCreate = new RenderOBJCreateUtil();
Physics.I._factory = new physics2DJSFactory()
// Physics.I._factory = new physics2DwasmFactory()
// Laya3D.PhysicsCreateUtil = new pxPhysicsCreateUtil();
// new PhysicsWorld_BaseCollider();
new Main(false);