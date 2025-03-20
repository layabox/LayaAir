/**
 * @en Define the bundles of the engine.
 * - name: the name of the bundle. It will be used as the output file name. e.g. the output file name of the `core` bundle is `laya.core.js`.
 * - input: the list of files that will be compiled into the bundle. The path is relative to the src/layaAir directory. Patterns are supported.
 * - copy: (Optional) the list of files that will be directly copied to the output directory. The path is relative to the src/layaAir directory.
 * - output: (Optional) If specified, the original output file will be merged with the specified files and re-output. The key is the output file name, and the value is the list of files that will be merged with the original output file. The path is relative to the src/layaAir directory.
 * @zh
 * 定义引擎的分包。
 * - name：包的名称。它将被用作输出文件名。例如 `core` 包的输出文件名称是 `laya.core.js`。
 * - input：将编译进包的文件列表。路径是相对于 src/layaAir 目录的。支持模式。
 * - copy：（可选）将直接复制到输出目录的文件列表。路径是相对于 src/layaAir 目录的。
 * - output：（可选）如果指定，原始输出文件将与指定的文件列表合并再输出。键是输出文件名，值是将与原始输出文件合并的文件列表。路径是相对于 src/layaAir 目录的。
 */
export const allBundles = [{
    name: 'core',
    input: [
        'Decorators.ts',
        'Config.ts',
        'laya/Const.ts',
        'laya/ModuleDef.ts',
        'ILaya.ts',
        'Laya.ts',
        'LayaEnv.ts',
        'laya/components/**/*.*',
        'laya/display/**/*.*',
        'laya/effect/**/*.*',
        'laya/events/**/*.*',
        'laya/filters/**/*.*',
        'laya/layagl/**/*.*',
        'laya/webgl/**/*.*',

        'laya/RenderDriver/DriverDesign/RenderDevice/**/*.*',

        'laya/RenderDriver/DriverDesign/2DRenderPass/**/*.*',

        'laya/RenderEngine/RenderEnum/**/*.*',
        'laya/RenderEngine/RenderInterface/**/*.*',
        'laya/RenderEngine/RenderShader/**/*.*',
        'laya/RenderEngine/*.*',

        'laya/RenderDriver/RenderModuleData/Design/IDefineDatas.ts',
        'laya/RenderDriver/RenderModuleData/Design/IUnitRenderModuleDataFactory.ts',
        'laya/RenderDriver/RenderModuleData/Design/RenderState.ts',
        'laya/RenderDriver/RenderModuleData/Design/ShaderDefine.ts',

        'laya/loaders/**/*.*',
        'laya/maths/**/*.*',
        'laya/media/**/*.*',
        'laya/net/**/*.*',
        'laya/NodeRender2D/**/*.*',

        'laya/renders/**/*.*',
        'laya/resource/**/*.*',
        'laya/system/**/*.*',
        'laya/utils/**/*.*',
        'laya/tween/**/*.*',
        'laya/tools/**/*.*',
        'laya/html/**/*.*',
        'Config3D.ts',
        "laya/bt/**/*.*",
        'laya/physics/IPhysiscs2DFactory.ts',
    ],
    copy: ['jsLibs/laya.workerloader.js']
},
{
    name: 'd3',
    input: [
        'laya/d3/animation/**/*.*',
        'laya/d3/component/**/*.*',
        'laya/d3/core/**/*.*',
        'laya/d3/depthMap/*.*',
        'laya/d3/graphics/**/*.*',
        'laya/d3/loaders/**/*.*',
        'laya/d3/math/**/*.*',
        'laya/d3/resource/**/*.*',
        'laya/d3/shader/**/*.*',
        'laya/d3/shadowMap/**/*.*',
        'laya/d3/text/**/*.*',
        'laya/d3/utils/**/*.*',
        'laya/d3/WebXR/**/*.*',
        'laya/d3/Input3D.ts',
        'laya/d3/MouseTouch.ts',
        'laya/d3/Touch.ts',
        'laya/d3/ModuleDef.ts',

        'laya/RenderDriver/DriverDesign/RenderDevice/**/*.*',
        'laya/RenderDriver/DriverDesign/3DRenderPass/**/*.*',
        'laya/RenderDriver/RenderModuleData/Design/**/*.*',

        'laya/d3/RenderObjs/NativeOBJ/*.*',
        'laya/d3/RenderObjs/RenderObj/*.*',
        'laya/d3/RenderObjs/IRenderEngine3DOBJFactory.ts',
        'laya/d3/RenderObjs/Laya3DRender.ts',
        'laya/d3/ModuleDef.ts',
        'ILaya3D.ts',
        'Laya3D.ts',
        // interface and enum
        'laya/Physics3D/interface/**/*.*',
        'laya/Physics3D/physicsEnum/**/*.*',
        'laya/d3/physics/HitResult.ts',
        'laya/d3/physics/PhysicsSettings.ts',
        'laya/d3/physics/Collision.ts',
        'laya/d3/physics/ContactPoint.ts',
    ],
},

{
    name: 'opengl_2D',
    input: [
        'laya/RenderDriver/OpenGLESDriver/RenderDevice/**/*.*',
        'laya/RenderDriver/OpenGLESDriver/2DRenderPass/**/*.*',
        'laya/RenderDriver/RenderModuleData/RuntimeModuleData/*.*',
    ],
},
{
    name: 'opengl_3D',
    input: [
        'laya/RenderDriver/OpenGLESDriver/3DRenderPass/**/*.*',
        'laya/RenderDriver/RenderModuleData/RuntimeModuleData/3D/*.*',
    ],
},
{
    name: 'webgl_2D',
    input: [
        'laya/RenderDriver/WebGLDriver/RenderDevice/**/*.*',
        'laya/RenderDriver/WebGLDriver/2DRenderPass/**/*.*',
        'laya/RenderDriver/RenderModuleData/WebModuleData/*.*',
    ],
},
{
    name: 'webgl_3D',
    input: [
        'laya/RenderDriver/DriverCommon/**/*.*',
        'laya/RenderDriver/WebGLDriver/3DRenderPass/**/*.*',
        'laya/RenderDriver/RenderModuleData/WebModuleData/3D/*.*',
    ],
},
{
    name: 'webgpu_2D',
    input: [
        'laya/RenderDriver/WebGPUDriver/RenderDevice/**/*.*',
        'laya/RenderDriver/WebGPUDriver/ShaderCompile/**/*.*',
        'laya/RenderDriver/WebGPUDriver/2DRenderPass/**/*.*',
        'laya/RenderDriver/RenderModuleData/WebModuleData/*.*',
    ],
    copy: ['jsLibs/naga_wasm_bg.wasm', 'jsLibs/naga_wasm.mjs']
},
{
    name: 'webgpu_3D',
    input: [
        'laya/RenderDriver/DriverCommon/**/*.*',
        'laya/RenderDriver/WebGPUDriver/ShaderCompile/**/*.*',
        'laya/RenderDriver/WebGPUDriver/3DRenderPass/**/*.*',
        'laya/RenderDriver/RenderModuleData/WebModuleData/3D/*.*',
    ],
},
{
    name: 'physics3D',
    input: [
        'laya/d3/physics/constraints/**/*.*',
        'laya/d3/physics/shape/**/*.*',
        'laya/d3/physics/ModuleDef.ts',
        'laya/d3/physics/CharacterController.ts',
        'laya/d3/physics/Constraint3D.ts',
        'laya/d3/physics/PhysicsCollider.ts',
        'laya/d3/physics/PhysicsColliderComponent.ts',
        'laya/d3/physics/PhysicsUpdateList.ts',
        'laya/d3/physics/RaycastVehicle.ts',
        'laya/d3/physics/RaycastWheel.ts',
        'laya/d3/physics/Rigidbody3D.ts',
    ],
},
{
    name: 'bullet',
    input: [
        'laya/Physics3D/Bullet/**/*.*',
    ],
    copy: ['jsLibs/bullet.wasm'],
    output: {
        'laya.bullet.js': ['jsLibs/bullet.js'],
        'laya.bullet.wasm.js': ['jsLibs/bullet.wasm.js'],
    }
},
{
    name: 'physX',
    input: [
        'laya/Physics3D/PhysX/**/*.*',
    ],
    copy: ['jsLibs/physx.release.wasm'],
    output: {
        'laya.physX.js': ['jsLibs/physx.release.js'],
        'laya.physX.wasm.js': ['jsLibs/physx.wasm.js'],
    }
},
{
    name: 'physics2D',
    input: [
        'laya/physics/Collider2D/*.*',
        'laya/physics/factory/*.*',
        'laya/physics/Shape/*.*',
        'laya/physics/joint/*.*',

        'laya/physics/ModuleDef.ts',
        'laya/physics/Physics2D.ts',
        'laya/physics/Physics2DOption.ts',
        'laya/physics/RigidBody.ts',
        'laya/physics/StaticCollider.ts',
        'laya/physics/Physics2DWorldManager.ts',
        'laya/physics/RigidBody2DInfo.ts',
        'laya/physics/Physics2DDebugDraw.ts',
    ],
},
{
    name: 'box2D',
    input: [
        'laya/physics/factory/physics2DwasmFactory.ts',
    ],
    output: {
        'laya.box2D.js': ['jsLibs/laya.Box2D.js'],
    }
},
{
    name: 'box2D.wasm',
    input: [
        'laya/physics/factory/physics2DwasmFactory.ts',
    ],
    copy: ['jsLibs/laya.Box2D.wasm.wasm'],
    output: {
        'laya.box2D.wasm.js': ['jsLibs/laya.Box2D.wasm.js'],
    }
},
{
    name: 'gltf',
    input: [
        'laya/gltf/**/*.*',
    ],
},
{
    name: 'device',
    input: [
        'laya/device/**/*.*'
    ],
},
{
    name: 'ui',
    input: [
        'laya/ui/**/*.*',
        'UIConfig.ts',
    ],
},
{
    name: 'spine',
    input: [
        'laya/spine/**/*.*'
    ],
    copy: ['jsLibs/spine-core-*.js']
},
{
    name: 'ani',
    input: [
        'laya/ani/**/*.*'
    ],
},
{
    name: 'navMeshCommon',
    input: [
        'laya/navigation/common/**/*.ts'
    ],
    copy: ['jsLibs/recast-navigation-wasm.wasm'],
    output: {
        'laya.navMeshCommon.js': ['jsLibs/recast-navigation.js'],
        'laya.navMeshCommon_wasm.js': ['jsLibs/recast-navigation-wasm.js'],
    }
},
{
    name: 'navMesh2d',
    input: [
        'laya/navigation/2D/**/*.ts'
    ]
},
{
    name: 'navMesh3d',
    input: [
        'laya/navigation/3D/**/*.ts'
    ]
},
{
    name: 'legacyParser',
    input: [
        'laya/legacy/*.ts'
    ],
},
{
    name: 'tiledmap_discarded',
    input: [
        'laya/legacy/tiledmap/**/*.ts'
    ],
},
{
    name: "trailCommon",
    input: [
        'laya/trail/trailCommon/**/*.*',
    ],
},
{
    name: "trail2D",
    input: [
        'laya/trail/trail2D/**/*.*',
    ],
},
{
    name: "trail3D",
    input: [
        'laya/trail/trail3D/**/*.*',
    ],
},
{
    name: "particle",
    input: [
        'laya/particle/d2/**/*.*',
        'laya/particle/common/**/*.*',
        'laya/particle/ModuleDef.ts'
    ]
},
{
    name: "particle3D",
    input: [
        'laya/particle/d3/**/*.*'
    ]
},
{
    name: 'ui2',
    input: [
        'laya/ui2/**/*.ts'
    ],
},
{
    name: 'tilemap',
    input: [
        'laya/tilemap/**/*.*'
    ],
},
{
    name: 'light2D',
    input: [
        'laya/Light2D/**/*.*'
    ],
},
{
    name: 'line2D',
    input: [
        'laya/Line2D/**/*.*'
    ],
},
{
    name: 'postProcess',
    input: [
        'laya/d3/postProcessEffect/**/*.*'
    ]
}
];