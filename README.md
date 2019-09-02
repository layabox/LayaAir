# LayaAir is an open-source HTML5 engine

It provides Canvas and WebGL for rendering, if WebGL is not supported, it switch automatically into Canvas mode.
LayaAir Engine is designed for high performance games and support ActionScript 3.0, TypeScript, JavaScript programming language.
Develop once, publish for 3 target platform (flash, HTML5, mobile)

## LayaAir features

- High performance

Display render is set priority to WebGL mode. However, renderer fallback using Canvas for systems with missing/incompatible graphics cards.
LayaAir is design to be run without Plugin and on embedded system.

- Light weight and easy to use

LayaAir API architecture aim to be simple, easy to handle, concepted to require small size installation. It can run basic and complete need for HTML5 engine.

- Multi-language development support

Build your HTML5 application from ActionScript 3.0、TypeScript、JavaScript project.

- Complete feature

functionality for 2D, 3D, VR, Timeline animation controls, slow motion, UI system, particle animation, skeletal animation, physical systems, etc.

- Provide a visual assistance in the development and tool flow

[LayaAirIDE](http://ldc.layabox.com/index.php?m=content&c=index&a=lists&catid=27) offer code development tools and visual editor. Clear workflow make, ergonomic, designed development efficiency.

- Open-source and free

our official Layabox Github with complete engine source version, free of charge, including commercial usage.

## general features overview
- WebGL rendering
- Canvas rendering
- Vector renderer
- Atlas texture support
- Load Manager
- HTML text
- Bitmap fonts
- Mask
- Filter
- Animation timeline
- UI
- Particle system
- Bones animation
- Physical systems
- IDE viewer
- 3D (FBX Autodesk and Unity3D assets are supported)
- VR

## Beginner usage
#### JS version
```js
    Laya.init(550, 400);
    Laya.stage.scaleMode = "showall";

    var ape = new Laya.Sprite();
    //Loading our monkey
    ape.loadImage("res/apes/monkey2.png");

    Laya.stage.addChild(ape);
```

#### AS version
```as3
    package
    {
        import laya.display.Sprite;
        import laya.display.Stage;

        public class Sprite_DisplayImage
        {
            public function Sprite_DisplayImage()
            {
                Laya.init(550, 400);
      		    Laya.stage.scaleMode = "showall";

                var ape:Sprite = new Sprite();
                //Loading our monkey
                ape.loadImage("res/apes/monkey2.png");

                Laya.stage.addChild(ape);
            }
        }
    }
```

#### TS version
```ts
    /// <reference path="../../libs/LayaAir.d.ts" />
    class Sprite_DisplayImage{

        constructor(){
            Laya.init(550, 400);
            Laya.stage.scaleMode = "showall";

            var ape = new Laya.Sprite();
            //Loading our monkey
            ape.loadImage("res/apes/monkey2.png");

            Laya.stage.addChild(ape);
        }
    }
    new Sprite_DisplayImage();
```

## Samples Demo

- http://layaair.ldc.layabox.com/demo/
- http://layabox.github.io/layaair-examples/

## Games Demo

- http://game.layabox.com/265 (2D)
- http://layaair.ldc.layabox.com/test/ZhanPaiKeJi/ (3D)

## API Help

http://layaair.ldc.layabox.com/api/

## Documentation Tutorial

- http://ldc.layabox.com/index.php?m=content&c=index&a=show&catid=8&id=10
- https://github.com/layabox/layaair/wiki

## Developer Center

http://ldc.layabox.com/

## Community

http://ask.layabox.com/

## QQ Group

104144216

## Folder structure
- bin [Compiled librairy，divided for as，js，ts]
- samples [Example project]
- src [Source Code Library]
- utils [Automated compilation and other tools]

# LayaAir是HTML5开源引擎
提供Canvas和Webgl同时渲染，如果Webgl不可用，则可自动切换到Canvas模式。引擎为高性能游戏设计，支持AS,TS,JS三种语言开发，一套代码三端齐发（Flash，HTML5，APP）。

## LayaAir特点

- 极致性能

LayaAir优先使用webgl渲染，如果webgl不可用，自动无缝转为canvas渲染，引擎设计过程中处处以性能为优先原则，LayaAir是为裸跑而设计的HTML5引擎。

- 轻量易用

LayaAir API设计上追求精简，简单易用，上手容易，引擎本身非常注意自身大小，是目前同等功能最小的HTML5引擎。

- 支持多语言开发

LayaAir同时支持ActionScript3、TypeScript、JavaScript三种语言开发HTML5

- 功能齐全

同时支持2D，3D，VR、时间轴动画，缓动、UI系统、粒子动画、骨骼动画、物理系统等

- 提供可视化辅助开发及工具流

LayaAirIDE提供代码开发工具及可视化编辑器，清晰的工作流，让美术，策划，程序紧密配合，提高开发效率

- 开源免费

引擎全部开源并托管到github，并且全部免费使用，包括商用

## 当前功能
- Webgl渲染
- Canvas渲染
- 矢量图
- 图集支持
- 加载管理器
- HTML富文本
- 位图字体
- 遮罩
- 滤镜
- 时间轴动画
- UI
- 粒子
- 骨骼
- 物理系统
- 可视化IDE
- 3D
- VR

## 开始使用
#### JS版本
    Laya.init(550, 400);
    Laya.stage.scaleMode = "showall";

    var ape = new laya.Sprite();
    //加载猩猩图片
    ape.loadImage("res/apes/monkey2.png");

    Laya.stage.addChild(ape);

#### AS版本
    package
    {
        import laya.display.Sprite;
        import laya.display.Stage;

        public class Sprite_DisplayImage
        {
            public function Sprite_DisplayImage()
            {
                Laya.init(550, 400);
      		    Laya.stage.scaleMode = "showall";

                var ape:Sprite = new Sprite();
                //加载猩猩图片
                ape.loadImage("res/apes/monkey2.png");

                Laya.stage.addChild(ape);
            }
        }
    }
#### TS版本
    /// <reference path="../../libs/LayaAir.d.ts" />
    class Sprite_DisplayImage{

        constructor(){
            Laya.init(550, 400);
            Laya.stage.scaleMode = "showall";

            var ape = new Laya.Sprite();
            //加载猩猩图片
            ape.loadImage("res/apes/monkey2.png");

            Laya.stage.addChild(ape);
        }
    }
    new Sprite_DisplayImage();

## 演示Demo

- http://layaair.ldc.layabox.com/demo/
- http://layabox.github.io/layaair-examples/

## 游戏展示
http://game.layabox.com/265

## API帮助

http://layaair.ldc.layabox.com/api/

##文档教程
http://ldc.layabox.com/index.php?m=content&c=index&a=show&catid=8&id=10

## 开发者中心

http://ldc.layabox.com/

## 社区

http://ask.layabox.com/

## QQ群
104144216

## 目录结构
TODO