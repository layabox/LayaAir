import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ui2/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";
import "laya/gltf/glTFLoader";
import "laya/navigation/common/ModuleDef";
import "laya/navigation/3D/ModuleDef";
import "laya/navigation/2D/ModuleDef";
import "laya/physics/ModuleDef";
import "laya/trail/trail2D/ModuleDef";
import "laya/trail/trail3D/ModuleDef";
import "laya/Light2D/ModuleDef";
import "laya/Line2D/ModuleDef";
import "laya/d3/postProcessEffect/ModuleDef";
import "laya/particle/common/ModuleDef";
import "laya/particle/d2/ModuleDef";
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
import { Browser } from "laya/utils/Browser";
import { Laya } from "Laya";
import { Bridge3DCamera } from "laya/bridge/Bridge3DCamera";
import { Scene } from "laya/display/Scene";
import { Config, PlayerConfig } from "Config";
import { SpineConst } from "laya/spine/SpineConst";
import { BatchManager } from "laya/RenderDriver/RenderModuleData/WebModuleData/2D/BatchManager";
import { BaseRender2DType } from "laya/display/SpriteConst";
import { JSSpineFactory } from "laya/spine/web/JSSpineFactory";
import { SpineAdapter } from "laya/spine/web/SpineAdapter";
import { SpineInstanceBatch } from "laya/spine/web/base/2d/batch/SpineInstanceBatch";
import { SpineNormalBatch } from "laya/spine/web/base/2d/batch/SpineNormalBatch";
import { SpineNormalRenderUpdater } from "laya/spine/web/base/optimize/SpineNormalRenderUpdater";
import { Bridge3DSceneInternal } from "laya/bridge/Bridge3DSceneInternal";
import { Config3D } from "Config3D";
import { regClass, property, runInEditor } from "Decorators";
import { LayaEnv } from "LayaEnv";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
import { Script } from "laya/components/Script";
import { Script3D } from "laya/d3/component/Script3D";
import { ReflectionProbe } from "laya/d3/component/Volume/reflectionProbe/ReflectionProbe";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera, CameraClearFlags, CameraEventFlags } from "laya/d3/core/Camera";
import { MeshFilter } from "laya/d3/core/MeshFilter";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { PostProcessEffect } from "laya/d3/core/render/postProcessBase/PostProcessEffect";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Scene3DShaderDeclaration } from "laya/d3/core/scene/Scene3DShaderDeclaration";
import { Cluster } from "laya/d3/graphics/renderPath/Cluster";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { InputManager } from "laya/events/InputManager";
import { LayaGL } from "laya/layagl/LayaGL";
import { MaterialParser } from "laya/loaders/MaterialParser";
import { Color } from "laya/maths/Color";
import { Matrix3x3 } from "laya/maths/Matrix3x3";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Quaternion } from "laya/maths/Quaternion";
import { Vector2 } from "laya/maths/Vector2";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { Loader } from "laya/net/Loader";
import { Prefab } from "laya/resource/HierarchyResource";
import { Material, MaterialRenderMode } from "laya/resource/Material";
import { RenderTexture, DepthTextureMode } from "laya/resource/RenderTexture";
import { Texture2D } from "laya/resource/Texture2D";
import { Texture2DArray } from "laya/resource/Texture2DArray";
import { UIConfig2 } from "laya/ui2/UIConfig";
import { ClassUtils } from "laya/utils/ClassUtils";
import { Stat } from "laya/utils/Stat";
import { Mouse } from "laya/utils/Mouse";
import { Sprite } from "laya/display/Sprite";
import { Box } from "laya/ui/Box";
import { AnimatorStateScript } from "laya/d3/animation/AnimatorStateScript";
import { Stage } from "laya/display/Stage";
import { Button } from "laya/ui/Button";
import { Text } from "laya/display/Text";
import { Handler } from "laya/utils/Handler";
import { Animator } from "laya/d3/component/Animator/Animator";
import { ProgressBar } from "laya/ui/ProgressBar";
import { Event } from "laya/events/Event";
import { ComboBox } from "laya/ui/ComboBox";
import { ScrollType } from "laya/ui/Styles";
import { SkyBox } from "laya/d3/resource/models/SkyBox";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Resource } from "laya/resource/Resource";

// --- bundle.js 中使用的补充 imports ---
// Device
import { Accelerator } from "laya/device/motion/Accelerator";
import { Geolocation } from "laya/device/geolocation/Geolocation";
import { Gyroscope } from "laya/device/motion/Gyroscope";
import { Shake } from "laya/device/Shake";
// Display
import { Animation } from "laya/display/Animation";
import { Area2D } from "laya/display/Area2D";
import { Graphics } from "laya/display/Graphics";
import { Input } from "laya/display/Input";
import { Camera2D } from "laya/display/Scene2DSpecial/Camera2D";
import { Mesh2DRender } from "laya/display/Scene2DSpecial/Mesh2DRender";
import { CommandBuffer2D } from "laya/display/Scene2DSpecial/RenderCMD2D/CommandBuffer2D";
// Filters
import { BlurFilter } from "laya/filters/BlurFilter";
import { ColorFilter } from "laya/filters/ColorFilter";
import { GlowFilter } from "laya/filters/GlowFilter";
// UI
import { CheckBox } from "laya/ui/CheckBox";
import { Clip } from "laya/ui/Clip";
import { ColorPicker } from "laya/ui/ColorPicker";
import { Dialog } from "laya/ui/Dialog";
import { FontClip } from "laya/ui/FontClip";
import { HScrollBar } from "laya/ui/HScrollBar";
import { HSlider } from "laya/ui/HSlider";
import { Image } from "laya/ui/Image";
import { Label } from "laya/ui/Label";
import { List } from "laya/ui/List";
import { Panel } from "laya/ui/Panel";
import { RadioGroup } from "laya/ui/RadioGroup";
import { Tab } from "laya/ui/Tab";
import { TextArea } from "laya/ui/TextArea";
import { TextInput } from "laya/ui/TextInput";
import { Tree } from "laya/ui/Tree";
import { VScrollBar } from "laya/ui/VScrollBar";
import { VSlider } from "laya/ui/VSlider";
// 3D Core
import { AnimatorState } from "laya/d3/component/Animator/AnimatorState";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { PointLightCom } from "laya/d3/core/light/PointLightCom";
import { SpotLightCom } from "laya/d3/core/light/SpotLightCom";
import { ShadowCascadesMode } from "laya/d3/core/light/ShadowCascadesMode";
import { ShadowMode } from "laya/d3/core/light/ShadowMode";
import { SkinnedMeshRenderer } from "laya/d3/core/SkinnedMeshRenderer";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Lightmap } from "laya/d3/core/scene/Lightmap";
import { AmbientMode } from "laya/d3/core/scene/AmbientMode";
import { UI3D } from "laya/d3/core/UI3D/UI3D";
// 3D Materials
import { EffectMaterial } from "laya/d3/core/material/EffectMaterial";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { SkyProceduralMaterial } from "laya/d3/core/material/SkyProceduralMaterial";
// 3D Models
import { SkyDome } from "laya/d3/resource/models/SkyDome";
// 3D Math
import { BoundBox } from "laya/d3/math/BoundBox";
import { Ray } from "laya/d3/math/Ray";
// 3D Render Commands
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { DrawMeshInstancedCMD } from "laya/d3/core/render/command/DrawMeshInstancedCMD";
import { MaterialInstancePropertyBlock, InstanceLocation } from "laya/d3/core/render/command/MaterialInstancePropertyBlock";
// 3D PostProcess
import { PostProcess } from "laya/d3/core/render/postProcessBase/PostProcess";
// 3D Physics
import { CharacterController } from "laya/d3/physics/CharacterController";
import { HitResult } from "laya/d3/physics/HitResult";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { CapsuleColliderShape } from "laya/d3/physics/shape/CapsuleColliderShape";
import { ConeColliderShape } from "laya/d3/physics/shape/ConeColliderShape";
import { CylinderColliderShape } from "laya/d3/physics/shape/CylinderColliderShape";
import { MeshColliderShape } from "laya/d3/physics/shape/MeshColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { ConfigurableConstraint } from "laya/d3/physics/constraints/ConfigurableConstraint";
import { FixedConstraint } from "laya/d3/physics/constraints/FixedConstraint";
import { Physics3DUtils } from "laya/d3/utils/Physics3DUtils";
import { Utils3D } from "laya/d3/utils/Utils3D";
// Physics3D interface
import { D6Axis } from "laya/Physics3D/interface/Joint/ID6Joint";
// 2D Physics
import { RigidBody } from "laya/physics/RigidBody";
import { StaticCollider } from "laya/physics/StaticCollider";
import { Physics2DOption } from "laya/physics/Physics2DOption";
import { Physics2DWorldManager } from "laya/physics/Physics2DWorldManager";
import { BoxShape2D } from "laya/physics/Shape/BoxShape2D";
import { ChainShape2D } from "laya/physics/Shape/ChainShape2D";
import { CircleShape2D } from "laya/physics/Shape/CircleShape2D";
import { PolygonShape2D } from "laya/physics/Shape/PolygonShape2D";
import { DistanceJoint } from "laya/physics/joint/DistanceJoint";
import { MouseJoint } from "laya/physics/joint/MouseJoint";
import { RevoluteJoint } from "laya/physics/joint/RevoluteJoint";
import { FilterData, EPhycis2DBlit } from "laya/physics/factory/IPhysics2DFactory";
// Light2D
import { DirectionLight2D } from "laya/Light2D/DirectionLight2D";
import { FreeformLight2D } from "laya/Light2D/FreeformLight2D";
import { SpotLight2D } from "laya/Light2D/SpotLight2D";
import { SpriteLight2D } from "laya/Light2D/SpriteLight2D";
import { LightOccluder2D } from "laya/Light2D/LightOccluder2D";
import { PolygonPoint2D } from "laya/Light2D/PolygonPoint2D";
import { ShadowFilterType } from "laya/Light2D/BaseLight2D";
// Line2D
import { Line2DRender } from "laya/Line2D/Line2DRender";
// Trail
import { Trail2DRender } from "laya/trail/trail2D/Trail2DRender";
import { TrailRenderer } from "laya/trail/trail3D/TrailRenderer";
// Particle
import { ShurikenParticleMaterial } from "laya/particle/d3/ShurikenParticleMaterial";
import { ShurikenParticleRenderer } from "laya/particle/d3/ShurikenParticleRenderer";
// Navigation
import { NavAgent } from "laya/navigation/3D/component/NavAgent";
import { NavMeshSurface } from "laya/navigation/3D/component/NavMeshSurface";
// Tilemap
import { TiledMap } from "laya/legacy/tiledmap/TiledMap";
import { TileMapLayer } from "laya/tilemap/TileMapLayer";
import { TileSet } from "laya/tilemap/TileSet";
import { TileSetCellGroup } from "laya/tilemap/TileSetCellGroup";
import { TileAnimationMode } from "laya/tilemap/TileAlternativesData";
import { TileShape } from "laya/tilemap/TileMapEnum";
// Spine
import { Spine2DRenderNode } from "laya/spine/Spine2DRenderNode";
import { SpineTemplet } from "laya/spine/SpineTemplet";
// Render enums
import { IndexFormat } from "laya/RenderEngine/RenderEnum/IndexFormat";
import { RenderCapable } from "laya/RenderEngine/RenderEnum/RenderCapable";
import { TextureFormat } from "laya/RenderEngine/RenderEnum/TextureFormat";
import { WrapMode } from "laya/RenderEngine/RenderEnum/WrapMode";
import { ShaderVariantCollection } from "laya/RenderEngine/RenderShader/ShaderVariantCollection";
// Render driver
import { EDeviceBufferUsage } from "laya/RenderDriver/DriverDesign/RenderDevice/IDeviceBuffer";
import { ENodeCustomData } from "laya/RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
// Math
import { MathUtils3D } from "laya/maths/MathUtils3D";
import { Matrix } from "laya/maths/Matrix";
import { Point } from "laya/maths/Point";
import { Rectangle } from "laya/maths/Rectangle";
import { Viewport } from "laya/maths/Viewport";
// Resource
import { Texture } from "laya/resource/Texture";
import { Mesh2D, VertexMesh2D } from "laya/resource/Mesh2D";
// Media
import { SoundManager } from "laya/media/SoundManager";
import { VideoNode } from "laya/media/VideoNode";
import { VideoTexture } from "laya/media/VideoTexture";
// Net
import { HttpRequest } from "laya/net/HttpRequest";
import { Socket } from "laya/net/Socket";
// Tween
import { Ease } from "laya/tween/Ease";
import { TimeLine } from "laya/tween/TimeLine";
import { Tween } from "laya/tween/Tween";
// Utils
import { Byte } from "laya/utils/Byte";
import { HalfFloatUtils } from "laya/utils/HalfFloatUtils";
import { HitArea } from "laya/utils/HitArea";
import { SpriteUtils } from "laya/utils/SpriteUtils";
import { Utils } from "laya/utils/Utils";
// Events
import { Keyboard } from "laya/events/Keyboard";
// Ani
import { MovieClip } from "laya/ani/swf/MovieClip";
// HTML
import { XML } from "laya/html/XML";
// Renders
import { Render } from "laya/renders/Render";
import { SpineTempletLoader } from "laya/spine/SpineTempletLoader";
import { URL } from "laya/net/URL";
import { ShurikenParticle2DSystem } from "laya/particle/d2/ShurikenParticle2DSystem";
import { ShurikenParticle2DRenderer } from "laya/particle/d2/ShurikenParticle2DRenderer";







(window as any).Laya = Laya;
(window as any).Laya.WasmAdapter = WasmAdapter;

// Register engine classes for IDE published projects (accessed via Laya.XXX)
let W = (window as any).Laya;
// Resource & Rendering
W.Texture2D = Texture2D;
W.Sprite = Sprite;
W.Box = Box;
W.Stage = Stage;
W.SkyBox = SkyBox;
W.PrimitiveMesh = PrimitiveMesh;
W.Mouse = Mouse;
W.BlinnPhongMaterial = BlinnPhongMaterial;
W.Button = Button;
W.Text = Text;
W.Handler = Handler;
W.CameraEventFlags = CameraEventFlags;
W.Animator = Animator;
W.Event = Event;
W.ProgressBar = ProgressBar;
W.ComboBox = ComboBox;
W.ScrollType = ScrollType;
W.AnimatorStateScript = AnimatorStateScript;
W.Shader3D = Shader3D;
W.SubShader = SubShader;
W.ShaderDataType = ShaderDataType;
W.RenderState = RenderState;
W.VertexMesh = VertexMesh;
W.RenderTexture = RenderTexture;
W.Material = Material;
W.MaterialRenderMode = MaterialRenderMode;
W.MaterialParser = MaterialParser;
W.PostProcessEffect = PostProcessEffect;
W.RenderTargetFormat = RenderTargetFormat;
W.FilterMode = FilterMode;
W.Texture2DArray = Texture2DArray;
W.LayaGL = LayaGL;
W.PlayerConfig = PlayerConfig;
// Math
W.Vector2 = Vector2;
W.Vector3 = Vector3;
W.Vector4 = Vector4;
W.Quaternion = Quaternion;
W.Matrix3x3 = Matrix3x3;
W.Matrix4x4 = Matrix4x4;
W.Color = Color;
// 3D Scene & Components
W.Scene3D = Scene3D;
W.Scene3DShaderDeclaration = Scene3DShaderDeclaration;
W.Sprite3D = Sprite3D;
W.Camera = Camera;
W.BaseCamera = BaseCamera;
W.CameraClearFlags = CameraClearFlags;
W.MeshRenderer = MeshRenderer;
W.MeshFilter = MeshFilter;
W.Mesh = Mesh;
W.ReflectionProbe = ReflectionProbe;
W.Cluster = Cluster;
W.RenderContext3D = RenderContext3D;
W.DepthTextureMode = DepthTextureMode;
// Script & Components
W.Script = Script;
W.Script3D = Script3D;
W.Prefab = Prefab;
W.Resource = Resource;
// Utilities
W.ClassUtils = ClassUtils;
W.InputManager = InputManager;
W.Event = Event;
W.Loader = Loader;
W.Stat = Stat;
W.LayaEnv = LayaEnv;
W.Config3D = Config3D;
W.Config = Config;
W.Scene = Scene;
W.Browser = Browser;
W.UIConfig2 = UIConfig2;
W.URL = URL;
// Device
W.Accelerator = Accelerator;
W.Geolocation = Geolocation;
W.Gyroscope = Gyroscope;
W.Shake = Shake;
// Display
W.Animation = Animation;
W.Area2D = Area2D;
W.Graphics = Graphics;
W.Input = Input;
W.Camera2D = Camera2D;
W.Mesh2DRender = Mesh2DRender;
W.CommandBuffer2D = CommandBuffer2D;
// Filters
W.BlurFilter = BlurFilter;
W.ColorFilter = ColorFilter;
W.GlowFilter = GlowFilter;
// UI
W.CheckBox = CheckBox;
W.Clip = Clip;
W.ColorPicker = ColorPicker;
W.Dialog = Dialog;
W.FontClip = FontClip;
W.HScrollBar = HScrollBar;
W.HSlider = HSlider;
W.Image = Image;
W.Label = Label;
W.List = List;
W.Panel = Panel;
W.RadioGroup = RadioGroup;
W.Tab = Tab;
W.TextArea = TextArea;
W.TextInput = TextInput;
W.Tree = Tree;
W.VScrollBar = VScrollBar;
W.VSlider = VSlider;
W.ShurikenParticle2DSystem = ShurikenParticle2DSystem;
W.ShurikenParticle2DRenderer = ShurikenParticle2DRenderer;
// 3D Core
W.AnimatorState = AnimatorState;
W.DirectionLightCom = DirectionLightCom;
W.PointLightCom = PointLightCom;
W.SpotLightCom = SpotLightCom;
W.ShadowCascadesMode = ShadowCascadesMode;
W.ShadowMode = ShadowMode;
W.SkinnedMeshRenderer = SkinnedMeshRenderer;
W.PixelLineSprite3D = PixelLineSprite3D;
W.Lightmap = Lightmap;
W.AmbientMode = AmbientMode;
W.UI3D = UI3D;
// 3D Materials
W.EffectMaterial = EffectMaterial;
W.PBRStandardMaterial = PBRStandardMaterial;
W.UnlitMaterial = UnlitMaterial;
W.SkyProceduralMaterial = SkyProceduralMaterial;
W.ShurikenParticleMaterial = ShurikenParticleMaterial;
// 3D Models
W.SkyDome = SkyDome;
// 3D Math
W.BoundBox = BoundBox;
W.Ray = Ray;
// 3D Render Commands
W.CommandBuffer = CommandBuffer;
W.DrawMeshInstancedCMD = DrawMeshInstancedCMD;
W.MaterialInstancePropertyBlock = MaterialInstancePropertyBlock;
W.InstanceLocation = InstanceLocation;
W.PostProcess = PostProcess;
// 3D Physics
W.CharacterController = CharacterController;
W.HitResult = HitResult;
W.PhysicsCollider = PhysicsCollider;
W.Rigidbody3D = Rigidbody3D;
W.BoxColliderShape = BoxColliderShape;
W.CapsuleColliderShape = CapsuleColliderShape;
W.ConeColliderShape = ConeColliderShape;
W.CylinderColliderShape = CylinderColliderShape;
W.MeshColliderShape = MeshColliderShape;
W.SphereColliderShape = SphereColliderShape;
W.ConfigurableConstraint = ConfigurableConstraint;
W.FixedConstraint = FixedConstraint;
W.Physics3DUtils = Physics3DUtils;
W.Utils3D = Utils3D;
W.D6Axis = D6Axis;
// 2D Physics
W.RigidBody = RigidBody;
W.StaticCollider = StaticCollider;
W.Physics2DOption = Physics2DOption;
W.Physics2DWorldManager = Physics2DWorldManager;
W.BoxShape2D = BoxShape2D;
W.ChainShape2D = ChainShape2D;
W.CircleShape2D = CircleShape2D;
W.PolygonShape2D = PolygonShape2D;
W.DistanceJoint = DistanceJoint;
W.MouseJoint = MouseJoint;
W.RevoluteJoint = RevoluteJoint;
W.FilterData = FilterData;
W.EPhycis2DBlit = EPhycis2DBlit;
// Light2D
W.DirectionLight2D = DirectionLight2D;
W.FreeformLight2D = FreeformLight2D;
W.SpotLight2D = SpotLight2D;
W.SpriteLight2D = SpriteLight2D;
W.LightOccluder2D = LightOccluder2D;
W.PolygonPoint2D = PolygonPoint2D;
W.ShadowFilterType = ShadowFilterType;
// Line2D & Trail
W.Line2DRender = Line2DRender;
W.Trail2DRender = Trail2DRender;
W.TrailRenderer = TrailRenderer;
// Particle
W.ShurikenParticleRenderer = ShurikenParticleRenderer;
// Navigation
W.NavAgent = NavAgent;
W.NavMeshSurface = NavMeshSurface;
// Tilemap
W.TiledMap = TiledMap;
W.TileMapLayer = TileMapLayer;
W.TileSet = TileSet;
W.TileSetCellGroup = TileSetCellGroup;
W.TileAnimationMode = TileAnimationMode;
W.TileShape = TileShape;
// Spine
W.Spine2DRenderNode = Spine2DRenderNode;
W.SpineTempletLoader = SpineTempletLoader;
W.SpineTemplet = SpineTemplet;
// Render enums
W.IndexFormat = IndexFormat;
W.RenderCapable = RenderCapable;
W.TextureFormat = TextureFormat;
W.WrapMode = WrapMode;
W.ShaderVariantCollection = ShaderVariantCollection;
W.EDeviceBufferUsage = EDeviceBufferUsage;
W.ENodeCustomData = ENodeCustomData;
// Math
W.MathUtils3D = MathUtils3D;
W.Matrix = Matrix;
W.Point = Point;
W.Rectangle = Rectangle;
W.Viewport = Viewport;
// Resource
W.Texture = Texture;
W.Mesh2D = Mesh2D;
W.VertexMesh2D = VertexMesh2D;
// Media
W.SoundManager = SoundManager;
W.VideoNode = VideoNode;
W.VideoTexture = VideoTexture;
// Net
W.HttpRequest = HttpRequest;
W.Socket = Socket;
// Tween
W.Ease = Ease;
W.TimeLine = TimeLine;
W.Tween = Tween;
// Utils
W.Byte = Byte;
W.HalfFloatUtils = HalfFloatUtils;
W.HitArea = HitArea;
W.SpriteUtils = SpriteUtils;
W.Utils = Utils;
// Events
W.Keyboard = Keyboard;
// Ani
W.MovieClip = MovieClip;
// HTML
W.XML = XML;
// Renders
W.Render = Render;
// Decorators
W.regClass = regClass;
W.property = property;
W.runInEditor = runInEditor;














// Laya.addBeforeInitCallback(() => {
//     return Browser.loadLib("jsLibs/laya.Box2D.wasm.js");
// });

Scene.bridge3DInternalHandler = (scene) => new Bridge3DSceneInternal(scene);


Laya.addInitCallback(() => {
    Bridge3DCamera.__init__();
});

Laya.addAfterInitCallback(() => {
    if (PlayerConfig.spineVersion)
        SpineConst.VERSION = PlayerConfig.spineVersion;
    SpineConst.factory = new JSSpineFactory();
    SpineNormalRenderUpdater.__init__();
    SpineAdapter.adaptJS();
    if (SpineConst.ENABLE_WEB_BATCH) {
        BatchManager.registerProvider(BaseRender2DType.spineSimple, SpineInstanceBatch);
        BatchManager.registerProvider(BaseRender2DType.spinenormal, SpineNormalBatch);
    }
})