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
     static Laya:any=null;
     //static classMap:Object=null;
     static Timer:typeof Timer = null;
     static WorkerLoader:typeof WorkerLoader=null;
     static Dragging:typeof Dragging =null;
     static GraphicsBounds:typeof GraphicsBounds =null;
     static Sprite:typeof Sprite = null;
     static TextRender:typeof TextRender = null;
     static TextAtlas:typeof TextAtlas = null;
     static timer:Timer=null;
     static systemTimer:Timer=null;
     static startTimer:Timer = null;
     static updateTimer:Timer=null;
     static lateTimer:Timer=null;
     static physicsTimer:Timer = null;
     static stage:Stage = null;
     static Loader:typeof Loader=null;
     static loader:LoaderManager = null;
     static TTFLoader:typeof TTFLoader = null;
     static SoundManager:typeof SoundManager=null;
     static WebAudioSound:typeof WebAudioSound=null;
     static AudioSound:typeof AudioSound = null;
     static ShaderCompile: typeof ShaderCompile=null;
     static ClassUtils:typeof ClassUtils=null;
     static SceneUtils:typeof SceneUtils=null;
     static Context:typeof Context = null;
     static Render:typeof Render = null;
     static MouseManager:typeof MouseManager=null;
     static Text:typeof Text = null;
     static Browser:typeof Browser = null;
     static WebGL:typeof WebGL = null;
     static Pool:typeof Pool=null;
     static Utils:typeof Utils = null;
     static Graphics:typeof Graphics = null;
     static Submit:typeof Submit = null;
     static Stage:typeof Stage=null;
     static Resource:typeof Resource=null;

     /**@internal */
     static __classMap:Object = {};
     static regClass(c:any){
        (ILaya.__classMap as any)[c.name]=c;
     }
 }
 