# Graphics 扩展与 Mesh2D 迁移

运行回归检查：`node tests/graphics-extension/test.cjs`。

测试执行真实的命令、编译器、命令流、矩阵运算和材质生命周期代码，隔离 GPU/浏览器依赖。
覆盖内置/自定义命令混排、状态恢复、顶点颜色、布局依赖、特殊命令分发、重复编译复用，
以及 A/B/A 子网格材质、引用释放、默认材质、无效输入和不重建几何。
还覆盖 Web/Native/NoRender 纹理句柄、Native JS 桥接、WebGPU 混合状态与管线失效、无效绑定缓存清理。
这些隔离测试不替代真实后端的画面验证。

真实浏览器测试（先运行 `npm run build`，需要本机 Chrome）：

```sh
node tests/graphics-extension/run-gpu.cjs webgl
node tests/graphics-extension/run-gpu.cjs webgpu
node --test tests/sprite-mask-destroy.test.cjs tests/norender/state.test.cjs
```

`CHROME` 可指定 Chrome 可执行文件。测试使用临时独立配置和本机回环服务；结束后关闭浏览器和服务。
每次运行会输出临时目录，保存像素检查结果、截图和浏览器日志；`--heap-snapshot` 可额外保存堆快照。

### 2026-11-03 评审与回归记录

评审修复了以下可复现问题，保留公共接口和作者迁移方案：

- Mesh2DRender 销毁时未释放网格、纹理和渲染元素；Web/Native 纹理句柄重复设置默认纹理会累加引用。
- Sprite 持有的 ShaderData 未销毁，Native ShaderData 的 JS 纹理引用也未释放。
- WebGPU 未使用 Graphics 单次绘制的混合状态，状态变化时未正确更新管线。
- WebGPU 已失效的绑定组仍滞留缓存；ShaderData 销毁时登记清理请求，在帧末合并淘汰无效项，保留有效绑定组和布局缓存。

资源引用与 UBO 的释放仍在销毁时执行；只有收到销毁请求的帧末才扫描绑定缓存，没有请求的帧只检查一个标志，不遍历缓存。
清理没有增加逐对象回调、临时数组或闭包。
材质更新沿用已有元素，重复设置同一材质直接返回。
运行时代码涉及主仓库和 `src/layaAir/laya/RenderDriver/WebGPUDriver` 子模块，提交时需包含两处修改。

完整构建及声明生成通过；隔离回归通过；Sprite/NoRender 既有回归共 27 项通过。
WebGL 32 项、WebGPU 41 项真实浏览器检查通过，包括绘制顺序、图片文字混排、重绘、混合、
自定义顶点数据、多材质、父节点变换/透明度、裁剪、离屏读取与 Scene 销毁。
各后端连续创建/渲染/销毁 1,500 次，包含 500 次预热和两个 500 次测量窗口：

| 后端 | 资源数量（前→后） | 共享纹理引用（前→后） | 后 1,000 次保留堆增长 | 第二个 500 次窗口增长 |
| --- | ---: | ---: | ---: | ---: |
| WebGL | 18→18 | 0→0 | 282,492 字节 | 113,412 字节 |
| WebGPU | 18→18 | 0→0 | 358,528 字节 | 137,920 字节 |

堆检查在等待 GPU 工作和事件循环后强制 GC，阈值分别为总增长 <2 MiB、第二窗口 <256 KiB。
以上结果说明本场景资源引用稳定、保留堆增长通过阈值，不表示运行中没有分配或堆增长为零。
Native 已验证生产 JS 包装层和资源生命周期，尚未进行真实 Native 应用的设备/模拟器画面测试。

### Sprite ShaderData 所有权专项复核

本机 `/Users/guzhu/Documents/LayaAir-3.3` 有完整 Git 历史；已确认历史提交
`faeadb9ab69653d954f7cb9a711b4ada1b505db4` 是当前 3.4 浅克隆边界 `ef53e9074` 的祖先。
2025-04-18 的该提交同时完成了以下变更：

- 在 Sprite 新增 `shaderData` 字段和 `_initShaderData()`，由 Sprite 创建并交给渲染结构使用。
- 注释 BaseRenderNode2D 原先创建 ShaderData 的代码及 `_onDestroy()` 中的 `this._spriteShaderData.destroy()`。
- Sprite.destroy 当时只清理旧资源、置空 `_struct`，未补上 ShaderData 的释放。

这说明历史上存在明确的所有权迁移：组件原本自己创建、自己销毁，迁移后组件借用 Sprite 的数据，旧释放位置被取消而新位置没有接上。
旧组件中的释放取消有合理原因：单独移除组件时 Sprite 仍可能需要同一份数据；代码记录不能证明当时开发者未补上新释放位置的主观原因。
完整提交差异保存在 [历史差异](results/shaderdata-ownership-migration.diff)。

隔离复测命令（使用当前构建）：

```sh
node tests/graphics-extension/run-gpu.cjs webgl --shaderdata-lifecycle
node tests/graphics-extension/run-gpu.cjs webgpu --shaderdata-lifecycle
```

WebGL、WebGPU 各 14 项通过。对照组仅在 Sprite.destroy 期间将该 ShaderData 的 destroy 临时替换为空函数，
随后恢复原方法和旧版保留字段；其余纹理句柄、Mesh2D 和元素清理全部继续执行。
10 个绑定基础/法线纹理的 Sprite 在对照组残留 20 个纹理引用；保留释放的相同负载残留 0 个。
再手动销毁对照组遗留的 ShaderData，20 个引用全部释放。这隔离了 Sprite 清理本身的必要性。

专项测试还验证了：单独删除组件不销毁 Sprite ShaderData、重新添加组件仍能绘制、子节点不销毁 Scene 全局数据、Scene 只销毁共享数据一次。
结果保存在 [WebGL](results/shaderdata-lifecycle-webgl.json) 与 [WebGPU](results/shaderdata-lifecycle-webgpu.json)。
Native C++ 的 ShaderData 析构有 GPU 清理兜底，但不能据此认为 JS 层纹理引用会自动配平；Native 真机验证仍未完成。

复核另外发现 Mesh2D 组件单独销毁后未通知渲染缓存失效，WebGL 可能继续访问已销毁元素。
已在 Mesh2DRender._onDestroy 末尾补一处 `_notifyDataChange()`，只作用于销毁路径；普通绘制和材质设置路径未变。

### Mesh2DRender 子类销毁职责专项复核

Mesh2DRender 原先继承 BaseRenderNode2D._onDestroy，材质引用、材质 owner 注册和 render handle 原本就由基类清理。
基类不访问子类的 `_sharedMesh` / `_texture` 字段，也没有逐个销毁 `_renderElements`。
`sharedMesh` 设置时增加的 Mesh 引用、`texture` 设置时增加的 Texture 包装对象引用，只在替换属性时减掉，缺少组件销毁的对应操作。
Texture 包装对象引用是在 2026-01-30 的 `0b278493440182c55e5573154ac13e81b80327f9` 中增加的，
该提交已确认属于当前浅克隆边界的祖先；新增引用时未同步增加子类销毁钩子。
历史差异见 [Texture 引用历史](results/mesh-texture-reference-history.diff)。

```sh
node tests/graphics-extension/run-gpu.cjs webgl --mesh-lifecycle
node tests/graphics-extension/run-gpu.cjs webgpu --mesh-lifecycle
```

WebGL、WebGPU 各 15 项通过：对照组将组件 `_onDestroy` 指向真实的 BaseRenderNode2D._onDestroy，准确复现新增子类方法前的继承行为，
保留当前 Sprite ShaderData 和后端纹理句柄释放。两组材质引用均归零；对照组残留 Mesh 引用 1、Texture 包装引用 1，未调用元素销毁；
新方法使这些引用归零并销毁元素一次。手动补齐对照组遗漏的引用释放后，位图引用也恢复基线。

共享检查覆盖两个组件共用同一 Mesh/Texture：销毁第一个后引用为 1，另一个仍正确绘制；销毁最后一个后引用归零。
不直接调用共享 Mesh/Texture.destroy，不释放内置默认四边形和默认材质。
渲染元素销毁用于注销后端状态/缓存引用和释放后端对象，其影响不能一概描述为每个后端都有独立 GPU buffer 泄漏；
实际几何 buffer 仍由 Mesh 持有。清空数组和字段属于及时断开 JS 引用，不能替代引用计数释放。
结果见 [WebGL](results/mesh-lifecycle-webgl.json)、[WebGPU](results/mesh-lifecycle-webgpu.json)。

### WebGPU 最终评审修正

最终检查仍只涉及 WebGPU 子模块的三个运行时文件，修正了以下问题：

- 单次绘制的混合状态采用 primitive 数据；剔除、深度/模板仍跟踪实际管线使用的节点或材质数据。
  之前的实现把全部失效检查切到 primitive，可能漏掉节点剔除/深度变化。新增测试已在修复前复现，并验证了修复后正确失效和稳定状态复用。
- 原先每个 ShaderData.destroy 都扫描整个绑定缓存，批量销毁时会形成二次方级重复检查。
  改为登记一个标志，复用已有 endFrame 入口合并遍历；空闲帧不遍历。纹理引用和 UBO 释放没有延迟，仅缓存淘汰延至帧末。
- clearData 原先会清零借用 UBO 的共享视图并标脏；现在只处理自有块，借用块保留内容，clearUBO 只解除本借用者的观察登记。

隔离测试覆盖失效 buffer/texture 淘汰、有效布局和共享绑定保留、1,000 次销毁请求合并、空闲帧跳过遍历及自有/借用 UBO 清理。
真实 WebGPU 新增检查确认：借用者销毁后原属方的缓冲内容和绑定不变，画面仍正确；1,000 个 ShaderData 销毁只产生一次含 10 个条目的遍历。
完整 WebGPU 41 项、WebGL 32 项通过；两个后端各自的 ShaderData 14 项、Mesh2D 15 项专项也通过。
作者最终目录的 WebGPU 应用测试 107 项通过。完整构建、声明生成、隔离回归和 Sprite/NoRender 共 27 项既有回归通过。

缓存清理合成负载使用真实缓存类、版本 token 和固定 16 个存活绑定，对比此次评审前后的实现；每种负载预热后采样 9 次，交替顺序。
模拟 5,000 个失效 UBO：有效性检查由 12,582,500 次降为 5,016 次，CPU 清理耗时中位数从 284.00 ms 降至 0.28 ms。
这只衡量缓存遍历与淘汰，排除对象创建、GPU 工作及整帧耗时，不等同于游戏性能收益。
可使用 `node tests/graphics-extension/webgpu-cache-benchmark.cjs --before <评审前缓存源码>` 复测。

性能复测：`node tests/graphics-extension/benchmark.cjs`，默认将 HEAD 与工作区比较。
可用 `BENCH_BASE=<commit>` 指定修改前版本，`--output <path>` 保存全部原始样本。
基准使用 ES2017、独立进程和真实 Web Graphics 操作缓冲；覆盖三角形、矩形、图片、混合状态命令、材质设置，
以及 WebGPU 现有精灵/材质路径的生产 `_prepare` 方法与 ShaderData 的实际 getInt / 深度、混合缓存 getter（设备依赖隔离）。
默认执行 10 对修改前后对照、4 对原版与原版的空白对照，每个工作进程预热后采样 9 次，交替进程顺序。
样本迭代次数通过重复试跑的最短耗时校准，预热后再校准一次，避免单次进程暂停把后续样本压缩到一次迭代；正式样本不按耗时筛选。
报告包含按进程配对计算的耗时比及 bootstrap 95% 区间（比值小于 1 表示更快）；空白对照用于判断测试噪声。
本基准测量 CPU 命令编译、操作缓冲写入、材质更新与稳定管线准备，不测量 GPU、字体光栅化和整帧耗时。

### 2026-11-03 性能复测记录

环境：Apple M1 Pro / arm64、Node v22.12.0 / V8 12.4、ES2017。
修改前版本为 `4ee7c4f130dc8906367846b847b8d486c67d9b57`，修改后为本工作区。
按默认配置执行，比较 10 对独立进程，每个进程每项采样 9 次；另做 4 对原版/原版空白对照。
耗时变化使用每对进程样本中位数的比值，再计算几何平均；95% 区间按进程对重采样，避免把同进程样本当作独立实验。

| CPU 负载 | 耗时变化 | 95% 区间 |
| --- | ---: | ---: |
| 三角网格重编译 | -7.41% | -12.23% ～ -2.77% |
| 矩形重编译 | +2.16% | -0.94% ～ +5.20% |
| 图片重编译 | -2.97% | -7.98% ～ +0.59% |
| 混合状态/绘制命令 | -3.12% | -4.53% ～ -1.10% |
| 重复设置相同材质 | -97.49% | -97.54% ～ -97.43% |
| 切换材质 | -80.42% | -81.04% ～ -79.79% |
| WebGPU 普通精灵准备 | -1.11% | -2.52% ～ +0.24% |
| WebGPU 材质准备 | -0.55% | -1.76% ～ +0.62% |

此次原版/原版空白对照中，WebGPU 普通精灵为 +0.64%（95% 区间 -2.23%～+3.36%）、材质为 +1.19%（-0.45%～+3.49%）。
矩形对照为 -1.27%（-4.99%～+1.87%），命令编译的矩形比较区间仍较宽，不能排除小幅差异。
首轮简化属性基准中普通精灵出现 +1.73%；同时发现单次校准遭遇进程暂停，矩形曾只采到一次迭代。
改用生产 ShaderData getter、重复校准后，完整重跑 10 对比较及 4 对空白对照；未重现稳定的 WebGPU 准备退化。
没有通过筛除正式样本获得上述结果。临时分支写法仅在独立探针中比较，未替换运行时代码。
这些百分比仅适用于上述 CPU 负载，不能等同于整帧 FPS 收益或所有平台的性能保证。
最终原始报告保存于 `/tmp/laya-webgpu-final-review/performance-final.json`，包含每个样本、环境、主仓库/子模块基线和四处关键源码的 SHA-256。
最终 GPU 报告、缓存清理样本、性能摘要和三处 WebGPU 源码指纹汇总在 [最终评审记录](results/webgpu-final-review.json)。
最终复测期间未修改运行时代码。

## 普通自定义 Graphics 命令

`IGraphicsCmd.run` 接收公开的 `IGraphicsCommandExecutor`，可以调用已有的绘制方法。
上下文在编译期间同步记录操作，不能保存到命令外使用，也不保证每帧调用。
命令数据修改后，调用所属 `graphics.repaint()`；依赖节点尺寸的命令实现
`needsLayoutRepaint(): number { return 1; }`。
命令应使用与内置命令不同的 `cmdID`。

```ts
class CustomTriangles implements Laya.IGraphicsCmd {
    readonly cmdID = "CustomTriangles";
    lock = true; // 数据和生命周期由调用方管理。

    constructor(
        public texture: Laya.Texture,
        public vertices: Float32Array,
        public uvs: Float32Array,
        public indices: Uint16Array
    ) {}

    run(context: Laya.IGraphicsCommandExecutor, gx: number, gy: number): void {
        context.drawTriangles(this.texture, gx, gy, this.vertices, this.uvs, this.indices);
    }

    recover(): void {}
}
```

上下文不提供旧 runner 的 `_material`、`_global`、`breakNextMerge`，
Graphics 的 `drawTriangles` 也不接受私有的附加顶点参数。
普通命令使用现有布局和整个 Graphics 的材质；高级绘制迁移到 Mesh2D。

## 多材质和附加顶点数据

复用已有 `Mesh2D.createMesh2DByPrimitive` 和 `VertexDeclaration`，无需改变 Graphics 布局。
例如，每个顶点包含 position(vec3)、UV(vec2)、自定义数据(vec4)，步长为 36 字节：

```ts
const declaration = new Laya.VertexDeclaration(36, [
    new Laya.VertexElement(0, Laya.VertexElementFormat.Vector3, Laya.VertexMesh.MESH_POSITION0),
    new Laya.VertexElement(12, Laya.VertexElementFormat.Vector2, Laya.VertexMesh.MESH_TEXTURECOORDINATE0),
    new Laya.VertexElement(20, Laya.VertexElementFormat.Vector4, Laya.VertexMesh.MESH_CUSTOME0)
]);

// vertices: 每个顶点 9 个 float。此例 indices 包含按绘制顺序排列的 3 个三角形。
const mesh = Laya.Mesh2D.createMesh2DByPrimitive(
    [vertices], [declaration], indices, Laya.IndexFormat.UInt16,
    [
        {start: 0, length: 3},
        {start: 3 * Uint16Array.BYTES_PER_ELEMENT, length: 3},
        {start: 6 * Uint16Array.BYTES_PER_ELEMENT, length: 3}
    ]
);
const render = sprite.addComponent(Laya.Mesh2DRender);
render.sharedMesh = mesh;
render.setSharedMaterial(0, materialA);
render.setSharedMaterial(1, materialB);
render.setSharedMaterial(2, materialA);
```

材质要求 `shader.shaderType = Laya.ShaderFeatureType.D2_BaseRenderNode2D`。
自定义 shader 的属性映射与声明一致，例如：

```ts
const attributes = {
    a_position: [Laya.VertexMesh.MESH_POSITION0, Laya.ShaderDataType.Vector3],
    a_uv: [Laya.VertexMesh.MESH_TEXTURECOORDINATE0, Laya.ShaderDataType.Vector2],
    a_canvasData: [Laya.VertexMesh.MESH_CUSTOME0, Laya.ShaderDataType.Vector4]
};
```

`sharedMaterial` 等价于设置第 0 个子网格；`setSharedMaterial(index, null)` 恢复该槽的默认材质，
`getSharedMaterial(index)` 返回已设置的材质或 null。按子网格原顺序绘制，不按材质重新排序。
每个材质槽持有一份引用，替换、清空和销毁时释放；材质对象由调用方共享，接口不克隆材质。
各批次若使用不同纹理，应通过各自材质上的自定义 sampler 绑定纹理；`render.texture` 是整个组件共用的纹理。

作者需要改最终提交层和 shader：保留 Canvas 状态机、三角化、CPU 路径裁剪、画笔表和几何缓存。
将画笔索引/边缘数据写入自定义属性；沿用 2D shader 的节点变换与裁剪约定，
在 shader 中处理世界变换后的 AA 方向，不在编译时依赖旧 `_global`。
Canvas 自身复杂路径裁剪和离屏合成继续由 Canvas 层负责。

几何、顶点声明、缓冲和材质应复用，容量增长时再扩容。仅材质变化时调用 `setSharedMaterial`，
不重新创建 Mesh2D，也不重复设置 `sharedMesh`。顶点更新使用现有 `mesh.vertexBuffers` / `mesh.indexBuffer` 接口；
此改动未增加每帧队列、回调包装、材质快照或 Graphics 的额外顶点流。
