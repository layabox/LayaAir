import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";
import "laya/gltf/glTFLoader";
import "laya/d3/RenderObjs/WebGLOBJ/WebGLRenderEngine3DFactory"

import { Resource } from "laya/resource/Resource";
import { Main } from "./Main";
import { LayaGL } from "laya/layagl/LayaGL";
import { WebGLRenderEngineFactory } from "laya/RenderEngine/RenderEngine/WebGLEngine/WebGLRenderEngineFactory"
import { MeshLoad } from "./3d/LayaAir3D_Mesh/MeshLoad";
import { SceneLoad1 } from "./3d/LayaAir3D_Scene3D/SceneLoad1";
Resource.DEBUG = true;
LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
//Physics2D.I._factory = new physics2DJSFactory();
// Laya3D.PhysicsCreateUtil = new pxPhysicsCreateUtil();
// new PhysicsWorld_BaseCollider();
new SceneLoad1();