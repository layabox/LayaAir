<p align="center">
    <a href="https://layaair.com">
        <img src="https://github.com/layabox/LayaAir/assets/38777031/5519a795-c050-4612-8ee0-0907a946260b"
    </a>
</p>

# LayaAir Engine

**[LayaAir](https://layaair.com/) engine, under the [Layabox](https://www.layabox.com/) brand, is a 3D engine that supports full-platform publishing. It can be applied in various fields such as games, education, advertising, marketing, digital twins, metaverse, AR guides, VR scenes, architectural design, industrial design, etc.**

[中文](README.zh-CN.md)

![Screenshot of LayaAirIDE](https://github.com/layabox/LayaAir/assets/38777031/f520c762-98e4-41f0-8145-df6a6cb422d6)

LayaAir engine has adapted to many mainstream graphics APIs, such as WebGL/WebGPU/OpenGL/Vulkan, and supports programmable rendering pipelines, next-generation PBR rendering streams, ClusterLighting multi light technology, Forward+rendering pipelines, etc.

LayaAir engine can be released to multiple game platforms with one click. In addition to HTML5 WEB, it also supports the release of Native APP (Android、iOS、Mac、Windows、Linux), mini games (such as WeChat mini-games, ByteDance mini-games, Alipay mini-games, OPPO mini-games,vivo mini-games, and Xiaomi Quick Games).

LayaAir engine provides a powerful IDE, including a 3D scene editor, material editor, particle editor, blueprint editor, animation editor, physics editor, and UI editor. The IDE provides rich extension capabilities for developers to customize workflows, and developers can upload plugins to the resource store for sharing and sales.

LayaAir engine actively embraces AI and has built-in AIGC framework, providing AI creation generation, AI control IDE, AI customer service and other products.

## Getting the engine

### Binary downloads

Download LayaAir IDE directly from the official website of LayaAir, which includes the corresponding version of the engine.

[LayaAir Engine Download](https://layaair.com/#/engineDownload).

### Compiling from source

#### Install

Run the following command from the command line in the engine root directory, as shown below:

```bash
npm install
```

#### Run examples

Run the following command from the command line in the engine root directory, as shown below:

```bash
npm run start
```

#### Build

In the root directory of the engine, rrun the followingcommand from the command line. After that, a build folder will be generated in the root directory, where the compiled engine is located. As shown below:

```bash
npm run build
```

#### How to use compiled engine in LayaAirIDE

If you need to use your own compiled engine instead of the IDE's built-in engine, you can copy the JavaScript files from the "build/libs" folder of the engine to the "root directory of your IDE project/engine/libs". You don't need to copy all the JavaScript files, you can only copy the files you need to overwrite.

#### How to choose a branch

- LayaAir_3.x:  e.g. LayaAir_3.1. These are stable versions of the LayaAir3 engine, with each sub version number corresponding to a branch.

- LayaAir_2.x:  e.g. LayaAir_2.13.3. These are stable versions of the LayaAir2 engine, with each revision version number corresponding to a branch.

- Master3.0: The active development version of LayaAir3, please do not use it for production environments.

## How to contribute

Fork an official open source project from github to your own repository, clone it to your local computer, make changes to the code, and submit a PR to the official repository. We will respond as soon as possible and provide Approve and merge for you. Welcome everyone to join us in building together.

## Related links

- Official website https://LayaAir.com/

- Forum https://ask.LayaAir.com/

- Demo https://LayaAir.com/3.x/demo/

- Documents https://LayaAir.com/3.x/doc/

- API References https://LayaAir.com/3.x/api/

- Showcases https://LayaAir.com/#/enginedemo

## License

MIT

