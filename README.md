# LayaAir3.0
欢迎使用LayaAir3.0引擎源代码 ！

Welcome to use LayaAir 3.0 Engine's source code! 

## 引擎背景 Engine Background

[Layabox](https://www.layabox.com/)旗下的[LayaAir](https://layaair.layabox.com/)引擎是支持全平台发布的3D引擎，底层基于WebGL\WebGPU图形API，拥有开放式的可编程的渲染管线、全平台的图形引擎架构、次世代PBR渲染流、ClusterLighting多光源技术，Forward+渲染管线等，功能成熟丰富，且集成了全功能的可视化编辑器环境。

LayaAir engine, under the Layabox brand, is a 3D engine that supports full-platform publishing. Its underlying technology is based on WebGL\WebGPU graphics APIs. The engine features an open programmable rendering pipeline, a full-platform graphics engine architecture, next-generation PBR rendering flow, ClusterLighting multi-light source technology, Forward+ rendering pipeline, and many other features. It also integrates a fully functional visual editor environment.

可应用于游戏、教育、广告、营销、数字孪生、元宇宙、AR导游、VR场景、建筑设计、工业设计等众多领域。除HTML5 版本的WEB版本发布外，还同时支持发布Native-APP（安卓与iOS）平台，小游戏平台（微信小游戏、字节跳动小游戏、支付宝小游戏、OPPO小游戏、vivo小游戏、小米快游戏等）。

It can be applied in various fields such as games, education, advertising, marketing, digital twins, metaverse, AR guides, VR scenes, architectural design, industrial design, etc. In addition to the HTML5 version for web publishing, it also supports publishing on native apps for both Android and iOS platforms, as well as various mini-game platforms (such as WeChat mini-games, ByteDance mini-games, Alipay mini-games, OPPO mini-games,vivo mini-games, and Xiaomi Quick Games).



## 如何选择分支 How to choose a branch

#### 1、版本号说明 Version number explanation

LayaAir3引擎的版本号由主版本号、次版本号和修订版本号组成。

The version number of LayaAir 3 engine consists of the major version number, minor version number, and revision version number.



**主版本号**，表示重大的功能改进、架构变更或整体重构。当主版本号增加时，表示会存在不兼容的升级内容。LayaAir3的3就是主版本号。

The major version number represents significant feature improvements, architectural changes, or overall restructuring. When the major version number increases, it indicates the presence of incompatible upgrade content. In LayaAir 3, '3' is the major version number.

需要提醒的是，LayaAir3主版本号**对应的Git源码是主干分支Master3.0**，该分支是引擎团队的开发分支，并未经过测试发布，可能存在非常多的不稳定因素，除非开发者对引擎的理解非常深刻，否则请不要拉取该分支的源码作为生产环境的代码。

It's important to note that the Git source code corresponding to the major version number of LayaAir3 is the Master3.0 main branch. This branch is the development branch of the engine team and has not been tested or released. There may be many unstable factors. Unless developers have a deep understanding of the engine, it is not recommended to pull the source code from this branch for production environment code.



**次版本号**增加，表示着在尽可能保持向后兼容性的前提下，做出的重要功能的更新与版本升级。当可以对外发布的时候，Git平台上也会出现对应着次版本号的源码分支。例如LayaAir3.0、LayaAir3.1，这里LayaAir3.x中x就是次版本号，**对应的源码分支名称为LayaAir_3.x**。

The increase in the minor version number indicates important feature updates and version upgrades made while striving to maintain backward compatibility as much as possible. When it can be released to the public, corresponding source code branches with the minor version number will also appear on the Git platform. For example, LayaAir 3.0, LayaAir 3.1, where 'x' in LayaAir 3.x is the minor version number, and the corresponding source code branch name is LayaAir_3.x.



**修订版本号**是指基于次版本引擎分支修复BUG、优化、非核心功能更新（物理、spine动画等）、细微改动（对象属性级的变动）等维护的发布批次，修订版本号肯定是完全兼容的，并且由于没有大块功能的更新，是以BUG修复与优化为主，所以修订版本号的增加是非常安全的，开发者可以放心升级。

The revision version number refers to maintenance releases based on the minor version engine branch, including bug fixes, optimizations, updates to non-core features (physics, Spine animation, etc.), and minor changes (changes at the object property level). The revision version number is always fully compatible, and since there are no major feature updates, it mainly focuses on bug fixes and optimizations. Therefore, increasing the revision version number is very safe, and developers can confidently upgrade.

从LayaAir3开始，修订版本号**不会在Git源码的分支上出现，仅仅出现在次版本的分支提交记录以及引擎官网更新日志与下载上**。表示为LayaAir3.x.x，例如3.0.8。

Starting from LayaAir3, the revision version number will not appear on Git source code branches; it will only be present in the commit records of the minor version branch and in the update log and downloads on the engine's official website. It is represented as LayaAir3.x.x, for example, 3.0.8.



#### 2、如何判断分支是否为稳定版本 How to determine if a branch is a stable version

由于Git源码的分支上，没有在分支的名称上有所体现，所以有两种方式去判断分支是否为稳定版本。

Since Git source code branches do not reflect stability in their branch names, there are two ways to determine whether a branch is a stable version.

第一种是，前往官网[https://layaair.com/#/engineDownload](https://layaair.com/#/engineDownload) 查看引擎下载的版本目录列表，当版本号名称上出现beta的字样标识，则表示该版本还处于测试阶段，否则就是稳定版本。此时，建议选择不含beta字样的最新版本分支。

The first method is to visit the official website https://layaair.com/#/engineDownload and check the version directory list for engine downloads. If the version number contains the word 'beta,' it indicates that the version is still in the testing phase; otherwise, it is a stable version. In this case, it is recommended to choose the latest version branch that does not contain the word 'beta.'

第二种是，Github平台上的[Releases](https://github.com/layabox/LayaAir/releases)与[Tags](https://github.com/layabox/LayaAir/tags)里进行了发布，说明该版本已处理稳定版本，否则就是测试版本。

The second method is to check the [Releases](https://github.com/layabox/LayaAir/releases) and [Tags](https://github.com/layabox/LayaAir/tags) on the Github platform. If a release has been made, it indicates that the version has been marked as stable. Otherwise, it is a testing version.



## 如何使用源码 How to use the source code
#### 安装依赖(Install dependencies)

在引擎根目录，用命令行执行`npm install`命令，如下所示：

In the engine's root directory, execute the 'npm install' command in the command line, as shown below：

```diff
npm install
```
#### 运行示例(Run the example)

在引擎根目录，用命令行执行`npm run start`命令，如下所示：

In the engine's root directory, execute the 'npm run start' command in the command line, as shown below：

```diff
npm run start
```
#### 编译引擎(Compile)

在引擎根目录，用命令行执行`npm run build`命令，如下所示：

In the engine's root directory, execute the 'npm run build' command in the command line, as shown below：

```diff
npm run build    //执行之后会在根目录生成build文件夹，编译好的引擎都在其中
```
#### 如何在IDE中使用源码编译后的引擎

如果需要使用自己编译的引擎代替IDE自带的引擎，可以将引擎“build/libs”文件夹中的js文件拷贝到“你的IDE项目根目录/engine/libs"下。不需要拷贝全部js文件，可以只拷贝你需要覆盖的文件。

If you want to use a self-compiled engine instead of the one provided by the IDE, you can copy the JS files from the 'build/libs' folder of the engine to the 'libs' folder under the root directory of your IDE project. You don't need to copy all JS files; you can just copy the files you want to override.





## 如何贡献代码 How to contribute code

从 github 官方开源项目 fork 一份到 自己仓储，git clone 到本地,将修改的代码提交后，PR到官方，我们会尽快为您回复，为您提供Approve和merge，欢迎大家来共同建设。

Fork an official open source project from github to your own repository, clone it to your local computer, make changes to the code, and submit a PR to the official repository. We will respond as soon as possible and provide Approve and merge for you. Welcome everyone to join us in building together.



## 相关链接 Related links

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



## 更多资讯 More informatio

该引擎使用[MIT](https://opensource.org/licenses/MIT)开源协议，请阅读 LICENSE文件

This engine uses the [MIT](https://opensource.org/licenses/MIT) open source license. Please read the LICENSE file.

