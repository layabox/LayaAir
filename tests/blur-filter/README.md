# 2D 模糊滤镜边缘回归

先运行 `npm run build`，再使用本机 Chrome 执行真实 GPU 像素检查：

```sh
node tests/blur-filter/run.cjs webgl
node tests/blur-filter/run.cjs webgl --webgl1
node tests/blur-filter/run.cjs webgl --fixture /absolute/path/to/reported.png
```

`--fixture` 可传入原复现图片；图片只通过本机回环服务器读取，不写入工程。
`CHROME` 可以指定 Chrome 可执行文件，`LAYA_TEST_LIBS` 可以指定另一版本的构建目录以执行对照。
每次执行会输出临时目录，保存 JSON 结果、浏览器日志和处理后的 PNG。

覆盖半透明预乘颜色、两次模糊串联、奇偶尺寸与 1×1 小纹理的左右/上下对称性，
以及经典 UI `Image.filters` 和 `Image.postProcess` 的对边颜色渗漏。
原图检查以源 alpha 的五像素邻域作为允许的模糊范围，超出范围的有色像素记为杂边，
不会把正常的模糊外扩当成问题。

## PR #2444 验证记录

在 PR 提交 `3ef989a9b0c7b101b22a6136be17775188a01bf0` 上，仅修改 `sampleBlurTex`：
保持输入 RT 的预乘颜色，按透明边界的双线性覆盖率采样，保留 Clamp 和输出外扩。

- 完整构建及声明生成通过。
- WebGL1、WebGL2 各 30 项通过，含用户提供的 784×446 复现图片。
- 原 PR 的同组检查有 16 项失败，覆盖半透明变暗和模糊边缘不对称。
- 原始模糊实现的原图检查检测出 2,346 个超出模糊范围的像素；原 PR 和修正版本均为 0。

以上结果覆盖本机 Chrome 的 WebGL1/2；未进行 Native 或 WebGPU 设备验证。
