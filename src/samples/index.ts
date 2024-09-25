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
import { Skeleton_SpineAdapted } from "./2d/Skeleton_SpineAdapted";

Resource.DEBUG = true;
LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
//Physics2D.I._factory = new physics2DJSFactory();
Laya3D.PhysicsCreateUtil = new btPhysicsCreateUtil();
new Main(true, false);