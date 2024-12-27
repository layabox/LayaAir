import "./engine";

import { Resource } from "laya/resource/Resource";
import { Main } from "./Main";
import { LayaGL } from "laya/layagl/LayaGL";
import { WebGLRenderEngineFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory";
import { Laya3D } from "Laya3D";
import { btPhysicsCreateUtil } from "laya/Physics3D/Bullet/btPhysicsCreateUtil";
import { Physics2D } from "laya/physics/Physics2D";
import { physics2DwasmFactory } from "laya/physics/factory/physics2DwasmFactory"

Resource.DEBUG = true;
LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
Physics2D.I._factory = new physics2DwasmFactory();
Laya3D.PhysicsCreateUtil = new btPhysicsCreateUtil();
new Main(true, false);