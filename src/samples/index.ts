import "laya/d3/core/scene/Scene3D";
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

import { Resource } from "laya/resource/Resource";
import { Main } from "./Main";
import { LayaGL } from "laya/layagl/LayaGL";
import { WebGLRenderEngineFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory";
import { Laya3D } from "Laya3D";
import { btPhysicsCreateUtil } from "laya/Physics3D/Bullet/btPhysicsCreateUtil";
import { Physics2D } from "laya/physics/Physics2D";
import { physics2DwasmFactory } from "laya/physics/factory/physics2DwasmFactory"
import { HierarchyLoader } from "laya/loaders/HierarchyLoader";
import { LegacyUIParser } from "laya/legacy/LegacyUIParser";
import { RenderCMD2DDemo } from "./2d/RenderCMD2DDemo";
import { SceneLoad1 } from "./3d/LayaAir3D_Scene3D/SceneLoad1";

Resource.DEBUG = true;
LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
Physics2D.I._factory = new physics2DwasmFactory();
Laya3D.PhysicsCreateUtil = new btPhysicsCreateUtil();
HierarchyLoader.legacySceneOrPrefab = LegacyUIParser;
new Main(true, false,SceneLoad1);