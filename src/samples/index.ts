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
import { UnlitMaterialDemo } from "./3d/LayaAir3D_Material/UnlitMaterialDemo";
import { LayaGL } from "laya/layagl/LayaGL";
import { WGPURenderOBJCreateUtil } from "laya/d3/RenderObjs/WebGPUOBJ/WGPURenderOBJCreateUtil";
import { RenderOBJCreateUtil } from "laya/d3/RenderObjs/RenderObj/RenderOBJCreateUtil";

Resource.DEBUG = true;
LayaGL.renderOBJCreate = new RenderOBJCreateUtil();//创建WebGLRenderOBJCreateUtil

new UnlitMaterialDemo();