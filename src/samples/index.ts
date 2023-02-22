import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/particle/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";
import "laya/gltf/glTFLoader";
import "laya/html/ModuleDef";

import { Resource } from "laya/resource/Resource";
import { SceneLoad1 } from "./3d/LayaAir3D_Scene3D/SceneLoad1";
import { RealTimeShadow } from "./3d/LayaAir3D_Lighting/RealTimeShadow";
Resource.DEBUG = true;

new RealTimeShadow();