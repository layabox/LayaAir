# MRT 3D Sample

本目录是正式的 TypeScript Sample，与现有 3D 示例使用相同的引擎初始化、菜单和渲染后端。场景使用程序生成的几何体，不需要下载额外资源。

## 运行入口

启动项目原有的 3D Sample，进入 **Advance**，选择最后五项：

| 入口类 | 观察重点 |
| --- | --- |
| `MRT_Camera` | Camera 手动配置、整组池化、完整与稀疏附件布局 |
| `MRT_PostProcess` | 效果声明需求、自动申请和撤回、手动配置保留 |
| `MRT_CommandBuffer` | 绑定整组、绘制场景、仅写颜色 0、命令解绑 |
| `MRT_CustomLocation` | 开发者自定义 location 4，真实输出模型 UV 和世界高度 |
| `MRT_Sparse` | 初始只绑定主颜色 0 和材质参数 3，1、2 不分配纹理 |

也可以像其他 Sample 一样，在现有启动文件中选一个类作为 `Main` 的第三个参数：

```typescript
import { MRT_Camera } from "./3d/LayaAir3D_MRT/MRT_Camera";
import { MRT_PostProcess } from "./3d/LayaAir3D_MRT/MRT_PostProcess";
import { MRT_CommandBuffer } from "./3d/LayaAir3D_MRT/MRT_CommandBuffer";
import { MRT_CustomLocation } from "./3d/LayaAir3D_MRT/MRT_CustomLocation";
import { MRT_Sparse } from "./3d/LayaAir3D_MRT/MRT_Sparse";

new Main(true, false, MRT_Camera);
// 单独调试时，将第三个参数改为上表中需要测试的入口类。
```

渲染后端沿用原启动文件的 WebGL / WebGPU 配置，要求 MRT 支持；颜色格式沿用引擎的兼容映射。自定义 location 4 还要求至少五个颜色槽位，能力不足时显示提示。

按项目原有流程同时编译引擎和 Sample，确保运行库及类型声明包含当前 MRT 接口。五个示例不依赖临时 HTML、预览服务器或 `.codex` 目录。

## 每次测试的预期结果

- **Camera**：左侧显示正常 PBR 结果；右侧依次显示真实颜色 0、世界法线、线性底色、金属度/粗糙度/AO。切换“全部 / 仅材质数据”后，只创建并绑定 location 0、3 两张颜色纹理，1、2 显示空槽；颜色和材质数据仍正常。关闭 MRT 后右侧纹理清空，左侧继续正常绘制；重新开启后恢复所选布局。
- **后处理**：初始只设置后处理，自动获得 normal 附件并产生描边。关闭效果或整个后处理后，自动附件撤回；打开“手动保留法线”后，即使关闭效果，法线附件仍保留。
- **CommandBuffer**：左侧为普通 Camera 输出。右侧颜色 0 从所选辅助附件复制而来，其余三个附件仍显示各自数据；切换复制来源只改变颜色 0。暂停命令后右侧保留最后一次结果，左侧继续绘制。
- **自定义 location**：只创建 location 0、4 两张颜色纹理；1、2、3 为空槽。开发者 Shader 在 location 4 写入模型 UV（RG）、归一化世界高度（B）和几何覆盖标记（A），右侧第二格展示真实 location 4，不是 location 1。关闭 MRT 后主色仍正常，重新开启后自定义附件恢复。
- **中间空槽**：独立入口初始就是 `[颜色, null, null, 材质]`，实际颜色纹理数为 2。法线、底色预览为空，材质数据仍在 location 3；可切换到完整布局或关闭 MRT，再恢复所选布局。
- **菜单切换**：在五个示例之间反复切换，再切到其他 Sample，应无残留预览、旧相机或仍执行的命令。销毁时先解绑命令和纹理借用，再归还整组资源。

Camera、后处理、CommandBuffer 和中间空槽示例直接使用官方 `PBRStandardMaterial`。引擎标准 PBR 在开启 MRT 时调用通用的 `GBuffer.glsl`：颜色 0 保留原 PBR 结果，附件 1 为世界法线（RGB = normalWS × 0.5 + 0.5），附件 2 为线性底色，附件 3 为金属度/感知粗糙度/AO，辅助附件 A 为几何覆盖标记。位置固定，不因名称或数量重排。只绑定法线时只输出附件 1；未开启 MRT 时不增加辅助输出。MSAA 与 MRT 继续互斥。

自定义 location 示例使用独立的极简开发者 Shader，演示如何声明和写入 location 4；它复用引擎的顶点变换 include，不复制或重写 PBR 光照。自定义槽位、查询名和 Shader 标识在示例中使用枚举。

## 固定协议与开发者扩展

`GBuffer` 是上层静态协议，统一位置、默认格式和清除值。`GBufferLocation` 表示 Shader 位置，`GBufferAttachment` 表示内置查询名称，`GBufferOutput` 表示需要的内置输出功能，`GBufferShaderDefine` 统一功能宏名称。Camera 中的 `name?: string` 仅用于查询，仍允许开发者给自定义附件命名；资源池和驱动不识别 GBuffer 数据含义。

```typescript
import { GBuffer, GBufferAttachment, GBufferLocation, GBufferOutput } from "laya/d3/core/render/GBuffer";

// 申请完整内置布局；追加附件固定从 location 4 开始。
camera.opaqueMRT = GBuffer.createCameraOptions(GBufferOutput.All, [
    { name: "custom", format: RenderTargetFormat.R8G8B8A8, clearColor: new Color(0, 0, 0, 0) }
]);

// 只拿主颜色和材质数据：真实布局为 [颜色, null, null, 材质]，不创建法线和底色纹理。
camera.opaqueMRT = GBuffer.createCameraOptions(GBufferOutput.Surface);
material.gBufferOutputs = GBufferOutput.Surface;
const surface = camera.getOpaqueAuxiliaryTexture(GBufferAttachment.Surface);
// 独立 RenderTextureMRT 的格式数组同样按需生成：
const formats = GBuffer.createColorFormats(RenderTargetFormat.R8G8B8A8, GBufferOutput.Surface);
// 对已创建的独立 MRT，使用 mrt.getColorTexture(GBufferLocation.Surface) 查询 location 3。

// 后处理声明法线需求时，直接复用 GBuffer.Normal；只绑定主色和法线。
camera.opaqueMRT = GBuffer.createCameraOptions(GBufferOutput.Normal);

// 不需要内置或自定义数据时，helper 返回 null，相机回到普通 RT；自动后处理需求仍可单独启用 MRT。
camera.opaqueMRT = GBuffer.createCameraOptions(GBufferOutput.None);

// 只要主色和自定义 location 4 时，保留中间空槽，不分配 1、2、3。
camera.opaqueMRT = GBuffer.createCameraOptions(GBufferOutput.None, [
    { name: "custom", format: RenderTargetFormat.R8G8B8A8 }
]);
```

`createCameraOptions(outputs = All, customAttachments = [])` 按功能选择实际附件；空槽使用 `null`，位置保留但不创建、不绑定纹理。`createColorFormats(mainFormat, outputs = All, customFormats = [])` 给独立 MRT 生成同样的稀疏格式数组，`None` 且无自定义数据时只返回主颜色格式。底层主颜色 0 必须存在，不能把 `[颜色, null, null, 材质]` 压缩成 `[颜色, 材质]`，后者会把材质数据错误地绑定到 location 1。`colorAttachmentCount` 表示最高槽位的跨度，实际纹理数量应统计 `colorFormats` 的非 `null` 项；空槽的 `getColorTexture` 返回 `null`。

`gBufferOutputs` 控制本材质的 Shader 功能，不替 Camera 修改附件布局。默认 `All` 的标准 PBR 仍可绘制到稀疏 MRT，空槽上的输出由后端丢弃；已绑定但未声明输出的附件由通用适配补零。MSAA 与 MRT 保持互斥。

`camera.opaqueMRT` 保存手动声明，在下一次 `Camera.render` 准备目标时与后处理需求合并；`effectiveOpaqueMRT` 表示最近一次准备的实际布局。渲染回调中修改声明或深度缓存开关，不会回收正在绘制的目标。

通过材质资源加载得到的通用 `Material`，只要使用标准 `PBR` Shader，同样缺省输出全部内置数据；可用 `GBuffer.applyShaderOutputs(material.shaderData, GBufferOutput.None)` 等调用显式选择输出。这个入口同时设置配置标记，区分缺省配置与显式关闭。

其他 Shader 可通过 `#include "GBuffer.glsl"`、`GBUFFER_NORMAL / GBUFFER_ALBEDO / GBUFFER_SURFACE` 功能宏和 `writeGBuffer` 复用编码。下面是自定义第五个颜色输出的写法，放在自定义片元 Shader 中；`writeCustom` 需要从该 Shader 的 `main` 调用。

```glsl
#include "GBuffer.glsl";

#if defined(GBUFFER_CUSTOM_OUTPUTS)
layout(location = GBUFFER_CUSTOM_START) out highp vec4 customColor;
#endif

void writeCustom(vec4 value)
{
#if defined(GBUFFER_CUSTOM_OUTPUTS)
    customColor = value;
#endif
}
```

普通官方 PBR 只负责内置 1～3，不会猜测 location 4 的自定义内容。扩展必须使用支持至少五个颜色附件的设备：WebGL2 查询 `Max_Color_Attachment_Count`；WebGPU 还受 `maxColorAttachmentBytesPerSample` 限制。WebGPU 默认设备申请会使用 adapter 支持的颜色附件数量和预算上限；用户显式提供 `requiredLimits` 时保留其配置。超出设备能力仍直接拒绝，不静默删附件或改槽位。
