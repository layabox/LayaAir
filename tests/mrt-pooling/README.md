MRT 整组池化资源回归

在主库根目录执行：

```powershell
node tests/mrt-pooling/run.cjs
node tests/mrt-pooling/requirements.cjs
node node_modules/typescript/bin/tsc -p src/layaAir/tsconfig.json --noEmit --incremental false --composite false
```

脚本加载实际的 `RenderTexture`、`RenderTextureMRT`、`BaseTexture` 和 `Resource`，以可记录分配和释放的设备替身验证：

- 同布局整组复用，连续取还不重新分配。
- 格式顺序、附件数量、尺寸、深度格式、深度采样和主色 sRGB 的池匹配隔离。
- 普通 RT 与 MRT 不会混取，共用现有显存预算和池清理条件。
- 颜色与深度借用视图的引用转发、统一失效和一次性释放。
- 分配失败清理和参数校验。
- 空槽不创建纹理或借用视图，只按实际附件计算显存；包含空槽位置的布局参与整组池匹配。

此脚本不代替真实 WebGL2/WebGPU 绘制或完整场景回归。

`requirements.cjs` 执行实际 Camera、PostProcess、Effect、DepthPass、CommandBuffer 和 Blit 方法，验证需求合并、相机分配顺序、普通效果启停时序、跨相机共享 PP、深度双组撤回和显式目标绑定；GPU 与无关场景对象使用替身。

后处理效果可以通过以下接口申请相机的不透明辅助数据：

```typescript
class NormalEffect extends PostProcessEffect {
    private readonly _requirements: readonly CameraOpaqueMRTRequirement[] = [
        GBuffer.Normal
    ];

    getCameraOpaqueMRTRequirements(): readonly CameraOpaqueMRTRequirement[] {
        return this._requirements;
    }

    render(context: PostProcessRenderContext): void {
        const normalTexture = context.camera.getOpaqueAuxiliaryTexture(GBufferAttachment.Normal);
        // 将 normalTexture 绑定给效果 Shader；数值索引 0 也可获取同一附件。
    }
}
```

- `index` 是辅助附件下标，固定对应 Shader 的 `location = index + 1`。`name` 仅作为查询别名，效果的增删和排序不会重排输出位置。
- 需求只安排资源。材质 Shader 仍须在对应位置写入约定的法线或其他数据；声明不会自动生成这些数据。
- 颜色附件允许中间空槽。例如仅声明 `GBuffer.Surface`，相机只创建 location 0 和 3 的纹理，1、2 保留 null，不分配或绑定占位纹理。
- 多个效果可共享同一声明；同槽位的名称、格式和清除值须兼容。手动槽位未指定名称时，可附加自动查询别名，手动配置本身不会被改写。
- `camera.opaqueMRT` 保存手动配置，在下一次相机准备目标时提交；`camera.effectiveOpaqueMRT` 表示最近一次准备的布局。自动需求消失后恢复手动布局，没有手动配置时恢复普通 RT。渲染回调中修改声明，不回收当前帧正在使用的目标。
- 每次相机渲染开始查询启用效果。效果关闭、移除，后处理关闭或全局后处理关闭，均会在下次相机准备目标时撤回相应自动需求。
- 需求查询应为可重复调用的纯函数；相机分配前和效果执行前都可能读取。影响布局的参数应在相机渲染开始前设置。
- 普通效果保持原有启停时序。中途开启的 MRT 效果或新替换的 PP，若当前附件的槽位、名称、格式和清除值已兼容，可本次执行；否则只跳过缺少附件的消费者，下次相机渲染重新收集需求。无名手动槽尚不能满足按名称查询，须先在下次合并时补入别名。
- 自动 MRT 仍遵守设备附件上限和现有单采样限制，不会自动关闭相机 MSAA；冲突会在分配前报错。

整组的典型用法：

```typescript
const mrt = RenderTextureMRT.createFromPool({
    width, height,
    colorFormats: [RenderTargetFormat.R8G8B8A8, RenderTargetFormat.R16G16B16A16],
    depthStencilFormat: RenderTargetFormat.DEPTH_32,
    depthTexture: true,
    sRGB: true
});
const normals = mrt.getColorTexture(1);
// 完成全部绘制与采样后，统一归还 owner；附件视图不能单独回池或销毁。
RenderTexture.recoverToPool(mrt);
```

相机直接持有池中的整组 MRT：通常跨帧复用同一组；缓存上一帧深度时交替使用两组，避免读写同一深度。配置或尺寸改变、关闭 MRT 或销毁相机时归还整组。不透明阶段绑定全部颜色，天空、透明和相机后处理写回只绑定颜色 0 与同一深度。

Blit 的附件选择由记录命令的上层明确指定。`CommandBuffer` 的三种 Blit 入口在目标为 `null` 时默认仅写相机颜色 0；显式传入 MRT 时默认写完整组，最后一个布尔参数可以覆盖选择：

```typescript
command.blitScreenTriangle(source, mrt); // 完整 MRT。
command.blitScreenTriangle(source, mrt, null, null, null, 0, true); // 仅颜色 0。
```

底层 `BlitScreenQuadCMD.create` 不推断相机配置，最后一个参数默认 `false`。相机预载和后处理写回会由上层显式传入 `true`。

本次保持 MRT 的单采样、无 mipmap 限制。启用相机 MRT 仍采用原 MRT 分支的内部目标再合成到外部 RT 的流程，以下原有限制没有在本次扩大处理：

- 外部 RT 的原深度不与内部 MRT 共享，深度不随颜色合成复制。
- 外部 RT 是浮点格式而相机未启用 HDR 时，内部主色仍按相机的 8 位格式创建。
- `DepthOnly` / `Nothing` 不会自动把外部 RT 的旧颜色预载到内部 MRT。
