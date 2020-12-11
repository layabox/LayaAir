import { Dragging } from "./laya/utils/Dragging";
import { GraphicsBounds } from "./laya/display/GraphicsBounds";
import { Sprite } from "./laya/display/Sprite";
import { TextRender } from "./laya/webgl/text/TextRender";
import { Timer } from "./laya/utils/Timer";
import { Loader } from "./laya/net/Loader";
import { TTFLoader } from "./laya/net/TTFLoader";
import { SoundManager } from "./laya/media/SoundManager";
import { WebAudioSound } from "./laya/media/webaudio/WebAudioSound";
import { ShaderCompile } from "./laya/webgl/utils/ShaderCompile";
import { TextAtlas } from "./laya/webgl/text/TextAtlas";
import { ClassUtils } from "./laya/utils/ClassUtils";
import { SceneUtils } from "./laya/utils/SceneUtils";
import { Stage } from "./laya/display/Stage";
import { Context } from "./laya/resource/Context";
import { Render } from "./laya/renders/Render";
import { LoaderManager } from "./laya/net/LoaderManager";
import { WorkerLoader} from "./laya/net/WorkerLoader";
import { MouseManager } from "./laya/events/MouseManager";
import { Text } from "./laya/display/Text";
import { Browser } from "./laya/utils/Browser";
import { WebGL } from "./laya/webgl/WebGL";
import { AudioSound } from "./laya/media/h5audio/AudioSound";
import { Pool } from "./laya/utils/Pool";
import { Utils } from "./laya/utils/Utils";
import { Graphics } from "./laya/display/Graphics";
import { Submit } from "./laya/webgl/submit/Submit";
import { Resource } from "./laya/resource/Resource";

/**
 * @internal
 * 使用全局类的时候，避免引用其他模块
 */
 export class ILaya{
     static Laya:any;
     //static classMap:Object;
     static Timer:typeof Timer ;
     static WorkerLoader:typeof WorkerLoader;
     static Dragging:typeof Dragging ;
     static GraphicsBounds:typeof GraphicsBounds ;
     static Sprite:typeof Sprite ;
     static TextRender:typeof TextRender ;
     static TextAtlas:typeof TextAtlas ;
     static timer:Timer;
     static systemTimer:Timer;
     static startTimer:Timer ;
     static updateTimer:Timer;
     static lateTimer:Timer;
     static physicsTimer:Timer ;
     static stage:Stage ;
     static Loader:typeof Loader;
     static loader:LoaderManager ;
     static TTFLoader:typeof TTFLoader ;
     static SoundManager:typeof SoundManager;
     static WebAudioSound:typeof WebAudioSound;
     static AudioSound:typeof AudioSound ;
     static ShaderCompile: typeof ShaderCompile;
     static ClassUtils:typeof ClassUtils;
     static SceneUtils:typeof SceneUtils;
     static Context:typeof Context ;
     static Render:typeof Render ;
     static MouseManager:typeof MouseManager;
     static Text:typeof Text ;
     static Browser:typeof Browser ;
     static WebGL:typeof WebGL ;
     static Pool:typeof Pool;
     static Utils:typeof Utils ;
     static Graphics:typeof Graphics ;
     static Submit:typeof Submit ;
     static Stage:typeof Stage;
     static Resource:typeof Resource;

     /**@internal */
     static __classMap:{[key:string]:Function} = {};
     static regClass(c:Function){
        ILaya.__classMap[c.name]=c;
     }
 }
 