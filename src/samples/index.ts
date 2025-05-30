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

Resource.DEBUG = true;
Physics2D.I._factory = new physics2DwasmFactory();
Laya3D.PhysicsCreateUtil = new btPhysicsCreateUtil();
new Main(true, false);