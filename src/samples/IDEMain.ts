
import { Laya } from "Laya";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Stage } from "laya/display/Stage";
import { Scene } from "laya/display/Scene";
import { URL } from "laya/net/URL";
import { Loader } from "laya/net/Loader";

export class IDEMain {
    constructor() {
        Laya3D.init(0, 0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Laya.stage.bgColor = "#ffffff";
        Stat.show();

        this.start();
    }

    private async start() {
        await connectIDE();

        let scene = await Scene.open("scene.ls");
    }
}

function connectIDE() {
    let host = "127.0.0.1:18090";
    URL.basePath = `http://${host}/assets`;

    return new Promise<void>((resolve) => {
        let ws = new WebSocket(`ws://${host}/`);
        ws.onopen = () => { console.log("client open"); };
        ws.onerror = () => { console.log("client error"); };
        ws.onclose = () => { console.log('client close'); };

        let requests = {};
        Loader.prototype.queryAssetDb = function (param, conversionType) {
            if (conversionType == 1)
                return null;

            return new Promise((resolve) => {
                let entry = requests[param];
                if (entry)
                    entry.push(resolve);
                else {
                    requests[param] = entry = [resolve];
                    ws.send(param);
                }
            });
        };

        ws.onmessage = event => {
            let msg = event.data;
            let i = msg.indexOf(":");
            let cmd = msg.substring(0, i);
            let param = msg.substring(i + 1);

            switch (cmd) {
                case 'init'://ignore
                    resolve();
                    break;

                default: {
                    let callbacks = requests[cmd];
                    delete requests[msg];
                    URL.uuidMap[cmd] = param;
                    for (let c of callbacks)
                        c(param);
                }
            }
        };
    });
}
