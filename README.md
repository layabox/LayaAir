# LayaAir3.0
欢迎使用LayaAir3.0引擎源代码 ！

Welcome to use LayaAir 3.0 Engine's source code! 

## 引擎背景

[Layabox](https://www.layabox.com/)旗下的[LayaAir](https://layaair.layabox.com/)引擎是支持全平台发布的3D引擎，底层基于WebGL\WebGPU图形API，拥有开放式的可编程的渲染管线、全平台的图形引擎架构、次世代PBR渲染流、ClusterLighting多光源技术，Forward+渲染管线等，功能成熟丰富，且集成了全功能的可视化编辑器环境。

LayaAir engine, under the Layabox brand, is a 3D engine that supports full-platform publishing. Its underlying technology is based on WebGL\WebGPU graphics APIs. The engine features an open programmable rendering pipeline, a full-platform graphics engine architecture, next-generation PBR rendering flow, ClusterLighting multi-light source technology, Forward+ rendering pipeline, and many other features. It also integrates a fully functional visual editor environment.

可应用于游戏、教育、广告、营销、数字孪生、元宇宙、AR导游、VR场景、建筑设计、工业设计等众多领域。除HTML5 版本的WEB版本发布外，还同时支持发布Native-APP（安卓与iOS）平台，小游戏平台（微信小游戏、字节跳动小游戏、支付宝小游戏、OPPO小游戏、vivo小游戏、小米快游戏等）。

It can be applied in various fields such as games, education, advertising, marketing, digital twins, metaverse, AR guides, VR scenes, architectural design, industrial design, etc. In addition to the HTML5 version for web publishing, it also supports publishing on native apps for both Android and iOS platforms, as well as various mini-game platforms (such as WeChat mini-games, ByteDance mini-games, Alipay mini-games, OPPO mini-games,vivo mini-games, and Xiaomi Quick Games).



## 如何使用源码
安装依赖(Install dependencies)
```diff
//执行npm install命令，如下所示

npm install
```
运行示例(Run the example)
```diff
npm run start
```
编译引擎(Compile)
```diff
npm run build

//执行之后会在根目录生成build文件夹，编译好的引擎都在其中
```
在IDE中使用源码引擎

```diff
如果需要使用自己编译的引擎代替IDE自带的引擎，可以将“build/libs”文件夹中的js文件拷贝到“你的项目文件夹/engine/libs"下。不需要拷贝全部js文件，可以只拷贝你需要覆盖的文件。

If you need to use a self-compiled engine instead of the engine that comes with the IDE, you can copy the JS files from the "build/libs" folder to the "libs" folder in your project directory. You do not need to copy all the JS files, only the files you want to overwrite.
```

## 如何贡献代码
从 github 官方开源项目 fork 一份到 自己仓储，git clone 到本地,将修改的代码提交后，PR到官方，我们会尽快为您回复，为您提供Approve和merge，欢迎大家来共同建设。

Fork an official open source project from github to your own repository, clone it to your local computer, make changes to the code, and submit a PR to the official repository. We will respond as soon as possible and provide Approve and merge for you. Welcome everyone to join us in building together.



## 相关链接

官网

> Official website: https://layaair.layabox.com/

论坛

> Forum: https://ask.layabox.com/

demo

> Demo: https://layaair.layabox.com/3.x/demo/

开发者文档

> Document: https://layaair.layabox.com/3.x/doc/

API

> API: https://layaair.layabox.com/3.x/api/

引擎案例

> Engine cases: https://layaair.layabox.com/#/enginedemo



## 更多资讯

该引擎使用[MIT](https://opensource.org/licenses/MIT)开源协议，请阅读 LICENSE文件

This engine uses the [MIT](https://opensource.org/licenses/MIT) open source license. Please read the LICENSE file.

