# LayaAir is an open-source 2D/3D engine

LayaAir use WebGL1.0/WebGL2.0 as graphic API and written by TypeScript. LayaAir is designed for high performance games and support TypeScript and JavaScript programming language. Develop once and publish for multi-target platform (HTML5, Android, iOS, Wechat Mini-Game,QQ Mini-Game,BaiDu Mini-Game,XiaoMi Mini-Game,OPPO Mini-Game,VIVO Mini-Game,Bilibili Mini-Game,Alibaba Mini-Game, Facebook Instant Game).

## LayaAir features

- High performance

LayaAir use GPU graphic API(WebGL1.0/WebGL2.0). 
LayaAir is design to performance first.

- Light weight and easy to use

Except performance,LayaAir architecture aim to be simple and easy to use, openness and small size. It's a 2D/3D engine can run very well for HTML5 platform.

- Multi language development support

You can build your game from TypeScript,JavaScript and ActionScript3.0(Will be discard in the future).

- Multi target platform support

LayaAir can directly build HTML5 and many "Mini-Game platform",LayaAir can also extend native platform app with LayaNative, a complete development solution for LayaAir engine to target native Apps, such as iOS or Android. LayaNative uses LayaPlayer as the core runtime and uses reflection function to provide developers with a secondary development. You also can use this function to handle docking market on your native applications. And it also provides developers with testApp and build tools to package and publish your project.

- Mature ecosystem for design development and tool flow

[LayaAirIDE](https://ldc2.layabox.com/layadownload/?type=layaairide-LayaAir) provides 2D development tools and visual editor. Clear workflow make, ergonomic, designed development efficiency.Support code development,UI and Scene Editor,Particle Editor,Animation Editor,Physical Editor,Presupposition,Build Platform Packaging,Code confusion, compression and so on.

[Unity Plugin](https://ldc2.layabox.com/layadownload/?type=layaairide-LayaAir) provides 3D resource and scene editor and export with Unity, Compatibility support for commonly used unity funtion such as : Animtor,MeshRender,MeshFilter,ParticleSystem,Light,TrailRender,Lightingmap,Physics. Can let Unity project easier migration to LayaAir or directly use Unity as the 3D Editor.

- Open-source and free

Our official Layabox Github with complete engine source version, free of charge, including commercial usage.

## general features overview

- 2D

  Vector Renderer, Atlas Texture, HTML Text, Bitmap Fonts, Mask, Filter, Animation, Timeline, UI, ParticleSystem, SkeletonAnimation, Physics, etc..
  
- 3D

  Camera, Mesh, ParticleSystem, Multiple Light, SkyRender ,Animation , PhysicBaseRendering, Shadow, Custom Shader, Trail effect, PixelLine, Physics, Fog, StaticBatch, DynamicBatch, PostProcess etc...

## Beginner usage

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

#### JS version

```js
    Laya.init(550, 400);
    Laya.stage.scaleMode = "showall";

    var ape = new Laya.Sprite();
    //Loading our monkey
    ape.loadImage("res/apes/monkey2.png");

    Laya.stage.addChild(ape);
```

## API Document

- https://layaair.ldc.layabox.com/api2

## Tutorial Document

- https://ldc2.layabox.com/doc/

## Samples Demo

- https://layaair2.ldc2.layabox.com/demo2/

## Business Case 

- https://www.layabox.com/gamelist/

## Offical Community

- http://ask.layabox.com/

## Build

LayaAir Engine is automatically built using [Gulp](https://gulpjs.com/).

The following command execution directories are the root directory of the LayaAir engine project.

### Environment Preparation

##### Install Gulp globally

```
npm install -g gulp
```

##### Install dependencies

```
npm install
```

### Build the project

#### windows:

- ##### Publishing Engine


```
npm run build
```

- ##### Publishing API documentation


```
npm run buildDoc
```

- ##### Compile sample

```
npm run compile
```

## Business Contact

![](wechatQRcode.jpg)
