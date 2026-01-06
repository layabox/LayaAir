import "./engine";

import { Resource } from "laya/resource/Resource";
import { Main } from "./Main";
import { Laya3D } from "Laya3D";
import { btPhysicsCreateUtil } from "laya/Physics3D/Bullet/btPhysicsCreateUtil";
import { Physics2D } from "laya/physics/Physics2D";
import { physics2DwasmFactory } from "laya/physics/factory/physics2DwasmFactory"
import "laya/platform/BrowserAdapter";
import "laya/platform/DeviceAdapter";
import "laya/platform/FontAdapter";
import "laya/platform/MediaAdapter";
import "laya/platform/PlatformAdapters";
import "laya/platform/StorageAdapter";
import "laya/platform/TextInputAdapter";
import "./importWebGL"

import { LengencyRenderEngine3DFactory } from "laya/RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory";
import { Web3DRenderModuleFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory";
import { WebUnitRenderModuleDataFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory";
import { Laya3DRender } from "laya/d3/RenderObjs/Laya3DRender";
import { LayaGL } from "laya/layagl/LayaGL";
import { Sprite_LargeTexManager_Simple } from "./2d/Sprite_LargeTexManager_Simple";
import { Entrance } from "./Entrance";

LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
// Resource.DEBUG = true;
Physics2D.I._factory = new physics2DwasmFactory();
// Laya3D.PhysicsCreateUtil = new btPhysicsCreateUtil();
// new Main(false, false, Sprite_LargeTexManager_Simple);

// new Sprite_DisplayImage(Main);

// new LoadGltfResource();
new Entrance();
