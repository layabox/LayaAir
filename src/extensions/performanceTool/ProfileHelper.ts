import { PerformanceDataTool } from "./PerformanceDataTool";

interface SocketManagerOptions {
    onMessage?: (ev: MessageEvent) => void;
    onOpen?: (ev: Event) => void;
    onError?: (ev: Event) => void;
    onClose?: (ev: Event) => void;
    // autoReconnect?: boolean;
    /**自动重连 */
    autoRetryConnnect?: boolean;
    /**重连次数 */
    retryConnnectCount?: number;
    /**重连延时 */
    retryConnnectDelay?: number;
}
const defaultOptions: SocketManagerOptions = { 
    // autoReconnect: true,
    autoRetryConnnect: true,
    retryConnnectCount: 0,
    retryConnnectDelay: 10000
}
let WebSocketCls: any = (window as any).WebSocket as any;
class SocketManager{ 
    private url:string; 
    public clientId: number = 0;
    private options: SocketManagerOptions;
    private socket: any = null as any;
    private isSupport:boolean = false;
    private status: number = 0; // 0关闭1链接2错误
    private retryConnnectCount : number = 0;
    constructor(host: string,port: string,name: string, type:string, options?: SocketManagerOptions) {
  
        this.url = 'ws://' + host + ":" + port + '?type=' + type + '&name=' + name; 
        if (options) {
             Object.assign(options, defaultOptions);
             this.options = options; 
        } else { 
            this.options = defaultOptions; 
        } 
        WebSocketCls  = (window as any).WebSocket as any;
        this.isSupport = (typeof WebSocketCls != 'undefined');
        if (this.isSupport) { 
            this.reConnect();
            
        } else {
            console.log('not support websocket');
        } 
    } 
    private closeConnect() {
        this.retryConnnectCount = 0;
        if (this.socket) { 
            let socket = this.socket; 
            socket.onclose = null;
            socket.onmessage = null;
            socket.onerror = null;
            socket.onopen = null;
            socket.close();
            this.socket = null as any;
        }
        this.status = 0;
    }
    private onClose = (ev: CloseEvent) => { 
        let {onClose, autoRetryConnnect, retryConnnectCount} = this.options;
        retryConnnectCount = retryConnnectCount || 0;
        if (onClose) {
            onClose(ev);
        }
        if (this.status === 0) {
            if (autoRetryConnnect && 
                (retryConnnectCount == 0 ||   this.retryConnnectCount < retryConnnectCount)) {
                this.delayRetryConnnect();
            }
        }
    }
    private _delayRetryConnnectTimer: any = 0;
    private delayRetryConnnect() {
        clearTimeout(this._delayRetryConnnectTimer);
        if (ProfileHelper.enable) { 
            this._delayRetryConnnectTimer = setTimeout(this._delayRetryConnnect, this.options.retryConnnectDelay);
        }
    }
    private _delayRetryConnnect = ()=> {
        clearTimeout(this._delayRetryConnnectTimer);  
        this.retryConnnectCount++;
        this.reConnect();
    }
    private onMessage = (ev: MessageEvent) => {
        const {onMessage} = this.options;
        if (onMessage) {
            onMessage(ev);
        }
    }
    private onError = (ev: Event) => { 
        const {onError} = this.options;
        if (onError) {
            onError(ev);
        }
    }
    private onOpen = (ev: Event) => {
        const {onOpen} = this.options;
        if (onOpen) {
            onOpen(ev);
        }
        this.retryConnnectCount = 0;
        clearTimeout(this._delayRetryConnnectTimer);  
    }
    private reConnect() { 

        let socket = new WebSocketCls(this.url);
        this.socket = socket; 
        socket.onclose = this.onClose;
        socket.onmessage = this.onMessage;
        socket.onerror = this.onError;
        socket.onopen = this.onOpen; 
    }
    public dispose() {
        this.closeConnect();
    }
    public send(msg: string) {
        if (this.socket && this.socket.readyState === 1) { 
            this.socket.send(msg);
            return true;
        }
        return false;
    }
}
const getParameterByName = function (name: string, url: string) { 
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}; 
const idIsInList = (id: any , list : any[]) => {
    for(let i = 0; i < list.length; i ++) {
        let info = list[i];
        if (info.id == id) {
            return true;
        }
    }
    return false;
} 
type MsgType = 'frameData' | 'initPerformance'  | 'selectPlayer' | 'start';
type InternalMsgType = MsgType | 'onSelectMe' | 'onSelectMe_back' | 'active' | 'heart' | 'getPerformanceConf'  | 'getPerformanceConf_back'| 'selectPlayer_back'| 'playerList' | 'onReady' | 'onChangePlayer'  | 'msgList'   | 'onSelectPlayer'; 
export default class ProfileHelper {
    private socketManager:SocketManager = null as any;
    private performanceDataTool: PerformanceDataTool  /** PerformanceDataTool*/; 
    public selectPlayerId: number = 0;
    private heartIntervalHandler: any;
    private active: number = 0;
    static Host: string;
    public selectPlayerStatus: number = 0;/**1pending,2resolve,3reject */
    private static instance: ProfileHelper;
    private static _enable: boolean 
    public static set enable(value:boolean){ 
        if (ProfileHelper._enable === value) {
            return;
        }
        ProfileHelper._enable = value;
        if (value) {
            const initOption = ProfileHelper.initOption;
            if (!initOption) {
                throw new Error('没有执行初始化init');
            }
            const {
                type,
                performanceDataTool,
                onOpen,
                onMessage,
                retryConnectCount,
                retryConnnectDelay
            } = initOption
            ProfileHelper.init(
                type,
                performanceDataTool,
                onOpen,
                onMessage,
                retryConnectCount,
                retryConnnectDelay);
        } else {
            ProfileHelper.dispose();
        }
    }

    public static get enable():boolean {
        return ProfileHelper._enable;
    }
    /**初始化 */
    public init(
        type: 'player' | 'profiler' ,
        performanceDataTool?: any  /** PerformanceDataTool*/, 
        onOpen?: (event: any) => void  ,
        onMessage?: (event: {type: InternalMsgType, data: any}) => void  ,
        retryConnectCount?: number , 
        retryConnnectDelay?: number) {

        this.frameDataList = [];
        if (type === 'player' && !performanceDataTool) {
            throw new Error("type为player时，performanceDataTool不为空");
        }
        var host = '';
        var url = '';
        var href = '';  
        if (window && window.location && window.location.href) {
            href = window.location.href;
        }
        var name = getParameterByName('profileName', href) || '';
        var port = getParameterByName('profilePort', href) || '1050';
        if (ProfileHelper.Host || getParameterByName('profileHost', href)) { 
            host = ProfileHelper.Host || getParameterByName('profileHost', href);
        } else {
            // 解析服务器名
            if (href.startsWith('http')) {
                var index1 = href.indexOf('//');
                var index2 = href.indexOf('/', index1 + 3);
                if (index2 === -1) {
                    index2 = href.length;
                }
                url = href.substring(index1 + 2, index2); 
                index2 = url.indexOf(':');
                if (index2 >= 0) {
                    url = url.substring(0, index2); 
                }
                host = url;
            } else {
                host = 'localhost';
            }              
        }
        
        this.performanceDataTool = performanceDataTool;
        this.heartIntervalHandler = setInterval(() => {
            this.sendInternalMsg('heart', {})
        }, 1000 * 10);
        this.socketManager = new SocketManager(host,port,name, type, {
            retryConnectCount: retryConnectCount || defaultOptions.retryConnnectCount,
            retryConnnectDelay: retryConnnectDelay || defaultOptions.retryConnnectDelay,
            onMessage: (ev: MessageEvent) => {
                // console.log('socketManager onMessage', ev);

                if (!this.socketManager) {
                    return;
                }
                if (typeof ev.data == 'string') {
                    let data: {type: InternalMsgType, data: any, fromId?: any, id: number} = JSON.parse(ev.data) as any;   
                    let msgList = [data];
                    if (data.type === 'msgList') {
                        msgList = data.data;
                    }
                    msgList.forEach(
                        (eventData) => { 
                            switch(eventData.type) {
                                case 'onSelectMe': 
                                    this.sendInternalMsg(
                                        'onSelectMe_back', 
                                        eventData.data
                                    );
                                    break; 
                                
                                case 'getPerformanceConf':
                                    this.sendConfigData();
                                    break; 
                                case 'selectPlayer_back':   
                                    this.selectPlayerId = eventData.data.selectPlayer;
                                    this.selectPlayerStatus = 0;
                                    break;  

                                case 'onReady':  
                                    this.socketManager.clientId = eventData.data.id; 
                                    this.sendInternalMsg(
                                        'start', 
                                        {}); 
                                    break; 
                                case 'active':   
                                    this.active = eventData.data.active; 
                                    break;                                    
                                case 'playerList':   
                                    // 自动连接第一个player 
                                    // 检测当前链接的id是否还在列表里，不在说明已经离线
                                    if (this.selectPlayerId) {
                                        if(!idIsInList(this.selectPlayerId, eventData.data)) {
                                            this.selectPlayerId = 0; 
                                            this.selectPlayerStatus = 0;
                                        }
                                    } 
                                    if (this.selectPlayerId && eventData.data.length > 0 && this.selectPlayerStatus == 0) {  
                                        let playerId = eventData.data[0].id;
                                        this.selectPlayerStatus = 1;
                                        this.sendMsg('selectPlayer', 
                                        {id: playerId} );  
                                    }
                                break;  
                            }
                        }
                    );
                    if (onMessage) {
                        msgList.forEach((msgData) => { 
                            onMessage(msgData);
                        });
                    }
                }
            }, 
            onOpen: (ev: any) => { 
                if (onOpen) {
                    onOpen(ev);
                } 
            }, 
            onError: (ev: Event) => {

                // console.log('socketManager onError', ev);
            }, 
            onClose: (ev: Event) => {

                // console.log('socketManager onClose', ev);
            }

        } as SocketManagerOptions);
    }

    public sendMsg = (type: MsgType, data: any, toId: any = 0) => { 
        this.socketManager.send(
            JSON.stringify({
                type: type,
                data: data,
                toId: toId
            })
        );
    }

    private sendInternalMsg = (type: InternalMsgType, data: any, toId: any = 0) => { 
        this.socketManager.send(
            JSON.stringify({
                type: type,
                data: data,
                toId: toId
            })
        );
    } 
    private frameDataList: any [] = [];
    
    private sendFramData = (data: any /** PerforManceNode*/) => {
        if (!this.active) {
            return;
        }
        this.frameDataList.push(data);
        /**累计到30帧发一次 */
        if (this.frameDataList.length >= 30) { 
            this.sendFramDataList(this.frameDataList);
            this.frameDataList.length = 0;
        } 
        // ProfileHelper.sendMsg("frameData", data); 
    } 

    private sendConfigData = (data: any = null /** PerforManceNode*/) => {  
        let configData = this.performanceDataTool.getPathInfo();
        this.sendInternalMsg(
            'getPerformanceConf_back', 
            configData); 
    } 
    public sendFramDataList = (dataList: any [] ) => {
        let list =  dataList.map((data) => {
            return {
                type: "frameData",
                data: data
            };
        });;
        this.sendInternalMsg("msgList", list); 
    } 
    dispose() {

        clearInterval(this.heartIntervalHandler);
        if (this.socketManager) {
            this.socketManager.dispose();
            this.socketManager = null as any;
        }
        this.performanceDataTool = null;
    }
    private static initOption: any;
    /**初始化 */
    public static init(
        type: 'player' | 'profiler' ,
        performanceDataTool?: any  /** PerformanceDataTool*/, 
        onOpen?: (event: any) => void  ,
        onMessage?: (event: {type: InternalMsgType, data: any}) => void  ,
        retryConnectCount?: number , 
        retryConnnectDelay?: number) {

        if (ProfileHelper.instance) {
            ProfileHelper.instance.dispose();
        }
        ProfileHelper.initOption = {
            type,
            performanceDataTool,
            onOpen,
            onMessage,
            retryConnectCount,
            retryConnnectDelay
        };
        if (!ProfileHelper._enable) {
            return;
        }
        ProfileHelper.instance = new ProfileHelper();
        ProfileHelper.instance.init(type, performanceDataTool, onOpen, onMessage, retryConnectCount, retryConnnectDelay);
    }
    /**发送帧数据   */
    public static sendFramData = (data: any | any [] /** PerforManceNode*/) => {
        if (!ProfileHelper._enable) {
            return;
        }
        if (ProfileHelper.instance) { 
            ProfileHelper.instance.sendFramData(data);
        } 
    }   
    /**发送配置   */
    public static sendConfigData = (data: any | any [] /** PerforManceNode*/) => {
        if (!ProfileHelper._enable) {
            return;
        }
        if (ProfileHelper.instance) { 
            ProfileHelper.instance.sendConfigData(data);
        }  
    }      
    /**销毁   */
    public static dispose = () => {
        if (ProfileHelper.instance) { 
            ProfileHelper.instance.dispose();
        }
        ProfileHelper.instance = null  as any;
    }   
}

/**
 * player端使用方式
 
//初始化
ProfileHelper.init('player', performanceDataTool);

//发送帧数据
ProfileHelper.sendFramData( data | [data]);
// 开关
ProfileHelper.enable = false;
ProfileHelper.enable = true;

*/
 
