# LayaAir is an open-source 2D/3D engine

LayaAir use WebGL1.0/WebGL2.0 as graphic API and written by TypeScript.
LayaAir is designed for high performance games and support TypeScript and JavaScript、ActionScript 3.0 programming language.
LayaAir can develop once, publish for multi target platform(HTML5、Android、Ios、MiniGame).

## LayaAir features

- High performance

LayaAir use GPU graphic API(WebGL1.0/WebGL2.0).
LayaAir is design to performance first.

- Light weight and easy to use

Except performance,LayaAir architecture aim to be simple and easy to use、openness、small size. It's a 2D/3D engine can run very well for HTML5 platform .

- Multi language development support

Build your HTML5 application from ActionScript 3.0、TypeScript、JavaScript project.

- Multi target platform support

LayaAir can directly bulid HTML5 and miniGame platform.LayaAir can also build native platform app with LayaNative.LayaNative is a complete development solution for LayaAir engine to native Apps, such as iOS or Android. LayaNative uses LayaPlayer as the core runtime and uses reflection function to provide developers with a secondary development. You also can use this function to handle docking market on your native applications.And it also provides developers with testApp and build tools to package and publish your project.

- Visual assistance in the development and tool flow

[LayaAirIDE](https://ldc2.layabox.com/layadownload/?type=layaairide-LayaAir) Offer base and 2D development tools and visual editor. Clear workflow make, ergonomic, designed development efficiency.Support Code development,UI and Scene Editor,Particle Editor,Animation Editor,Physical Editor,Presupposition,Build Platform Packaging,Code confusion and compression,etc.

[Unity Plugin](https://ldc2.layabox.com/layadownload/?type=layaairide-LayaAir) Offer 3D resource and scene edit and export with Unity,support most of commonly used unity funtion,for example Animtor,MeshRender,MeshFilter,ParticleSystem,Light,TrailRender,Lightingmap,Physics,etc.Can let unity project easier migration to LayaAir or directly use unity as the 3D Editer.

- Open-source and free

our official Layabox Github with complete engine source version, free of charge, including commercial usage.

## general features overview

- 2D

  Vector Renderer,Atlas Texture,Load Manager,HTML Text,Bitmap Fonts,Mask,Filter,Animation Timeline,UI,ParticleSystem,SkeletonAnimation,Physics,etc.
  
- 3D

  Camera,Mesh,ParticleSystem,Multi Light,SkyRender,Animation,PhysicBaseRendering,Shadow,Custom Shader,Trail,PixelLine,Physics,Fog,StaticBatch,DynamicBatch,PostProcess,etc.

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

## API Document

- https://layaair.ldc.layabox.com/api2

## Tutorial Document

- https://ldc2.layabox.com/doc/?nav=zh-ts-0-3-0

## Samples Demo

- https://layaair2.ldc2.layabox.com/demo2/

## Business Case 

- https://www.layabox.com/gamelist/

## Offical Community

- http://ask.layabox.com/
