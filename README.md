# LayaAir is an open-source 2D/3D engine

LayaAir use WebGL1.0/WebGL2.0 as graphic API.
LayaAir is designed for high performance games and support TypeScript and JavaScript、ActionScript 3.0 programming language.
LayaAir can develop once, publish for multi target platform(HTML5、Android、Ios).

## LayaAir features

- High performance

LayaAir use GPU graphic API(WebGL1.0/WebGL2.0).
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

## API Document

- https://layaair.ldc.layabox.com/api2

## Tutorial Document

- https://ldc2.layabox.com/doc/?nav=zh-ts-0-3-0
- https://github.com/layabox/layaair-doc

## Samples Demo

- https://layaair2.ldc2.layabox.com/demo2/

## Business Case 

- https://www.layabox.com/gamelist/

## Offical Community

- http://ask.layabox.com/
