<p align="center">
    <a href="https://layaair.layabox.com">
        <img src="https://github.com/layabox/LayaAir/assets/38777031/5519a795-c050-4612-8ee0-0907a946260b"
    </a>
</p>

# LayaAir 引擎

**[Layabox](https://www.layabox.com/) 旗下的 [LayaAir](https://layaair.layabox.com/) 引擎是支持全平台发布的3D引擎，应用于游戏、教育、广告、营销、数字孪生、元宇宙、AR导游、VR场景、建筑设计、工业设计等众多领域。**

![Screenshot of LayaAirIDE](https://github.com/layabox/LayaAir/assets/38777031/f520c762-98e4-41f0-8145-df6a6cb422d6)

LayaAir引擎已适配众多主流的图形API，如WebGL/WebGPU/OpenGL/Vulkan等，并支持开放式的可编程的渲染管线、次世代PBR渲染流、ClusterLighting多光源技术、Forward+渲染管线等，功能成熟丰富。

LayaAir引擎可一键发布到多个游戏平台，除HTML5 WEB外，还同时支持发布Native APP（安卓、iOS、Windows、Mac、Linux），小游戏（微信小游戏、字节跳动小游戏、支付宝小游戏、OPPO小游戏、vivo小游戏、小米快游戏、淘宝小游戏等）。

LayaAir引擎提供强大的IDE集成环境，包含3D场景编辑器、材质编辑器、粒子编辑器、蓝图编辑器、动画编辑器、物理编辑器、UI编辑器。IDE提供丰富的扩展能力给开发者自定义工作流，开发者更可更上传插件到资源商店分享和销售。

LayaAir引擎积极拥抱AI，已内置AIGC框架，提供AI创作生成、AI控制IDE、AI客服等产品。

## 获取LayaAir引擎

### 直接下载

从LayaAir官方网站直接下载LayaAirIDE， IDE内包含对应版本的引擎。

[LayaAir Engine Download](https://layaair.layabox.com/#/engineDownload).

### 从源码编译

#### 安装依赖

在引擎根目录，用命令行执行`npm install`命令，如下所示：

```bash
npm install
```

#### 运行示例

在引擎根目录，用命令行执行`npm run start`命令，如下所示：

```bash
npm run start
```

#### 编译引擎

在引擎根目录，用命令行执行`npm run build`命令，执行之后会在根目录生成build文件夹，编译好的引擎都在其中。如下所示：

```bash
npm run build
```

#### 如何在IDE中使用源码编译后的引擎

如果需要使用自己编译的引擎代替IDE自带的引擎，可以将引擎“build/libs”文件夹中的js文件拷贝到“你的IDE项目根目录/engine/libs"下。不需要拷贝全部js文件，可以只拷贝你需要覆盖的文件。

#### 如何选择分支

- LayaAir_3.x:  例如LayaAir_3.1等，是LayaAir3引擎稳定版本，**每一个次版本号对应一个分支**。

- LayaAir_2.x:  例如LayaAIr_2.13.3等，是LayaAir2引擎稳定版本。**每一个修订版本号对应一个分支**。

- Master3.0:  LayaAir3的活跃开发版本，请不要用于生成环境。

## 贡献代码

从 github 官方开源项目 fork 一份到 自己仓储，git clone 到本地,将修改的代码提交后，PR到官方，我们会尽快为您回复，为您提供Approve和merge，欢迎大家来共同建设。

## 相关链接

- 官网 https://layaair.layabox.com/

- 论坛 https://ask.layabox.com/

- 示例 https://layaair.layabox.com/3.x/demo/

- 开发者文档 https://layaair.layabox.com/3.x/doc/

- API参考 https://layaair.layabox.com/3.x/api/

- 引擎案例 https://layaair.layabox.com/#/enginedemo

## 授权协议

MIT

