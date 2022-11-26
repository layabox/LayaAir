import { Resource } from "../resource/Resource";
import { Animation2DNext } from "./Animation2DNext";
import { Animator2D } from "./Animator2D";
import { AnimatorControllerLayer2D } from "./AnimatorControllerLayer2D";
import { AnimatorControllerParse, TypeAnimatorControllerData, TypeAnimatorState } from "./AnimatorControllerParse";
import { AnimatorState2D } from "./AnimatorState2D";

export class AnimatorController2D extends Resource {
    data: TypeAnimatorControllerData;
    //controllerLayer: AnimatorControllerLayer2D[];
    clipsID: string[];
    constructor(data: any) {
        super();
        let obj = AnimatorControllerParse.parse(data);


        this.data = obj.ret;
        this.clipsID = obj.clipsID;
    }
    private getLayers() {
        let layers = this.data.controllerLayers;



        let lArr: AnimatorControllerLayer2D[] = [];

        for (let i = layers.length - 1; i >= 0; i--) {
            let l = layers[i];
            let acl = new AnimatorControllerLayer2D(l.name);
            lArr.unshift(acl);


            for (let k in l) {
                if ("name" == k || "states" == k || null == (l as any)[k]) {
                    continue;
                }
                try {
                    (acl as any)[k] = (l as any)[k];
                } catch (err: *) { }
            }
            this.getState(l.states, acl, this.data);

        }
        return lArr;
    }


    private getState(states: TypeAnimatorState[], acl: AnimatorControllerLayer2D, data: TypeAnimatorControllerData) {
        //let ret:
        if (states) {
            let idCatch: Record<string, AnimatorState2D> = {};
            for (let i = states.length - 1; i >= 0; i--) {
                let obj = states[i];
                if (0 > Number(obj.id)) {
                    continue;
                }
                let state = new AnimatorState2D();
                idCatch[obj.id] = state;

                for (let k in obj) {
                    try {
                        if ("soloTransitions" == k) {
                            continue;
                        } else if (null != (obj as any)[k]) {
                            (state as any)[k] = (obj as any)[k];
                        }
                    } catch (err: *) { }
                }

                acl.addState(state);
            }

            for (let i = states.length - 1; i >= 0; i--) {
                let obj = states[i];

                if ("-1" == obj.id) {
                    if (obj.soloTransitions && 0 < obj.soloTransitions.length) {
                        acl.defaultState = idCatch[obj.soloTransitions[0].id];
                        continue;
                    }
                }

                let soloTransitions = obj.soloTransitions;
                if (soloTransitions && idCatch[obj.id]) {

                    let nexts: Animation2DNext[] = [];


                    // let ats: AnimatorTransition2D[] = [];

                    for (let j = soloTransitions.length - 1; j >= 0; j--) {
                        let o = soloTransitions[j];
                        let ato = new Animation2DNext();

                        for (let k in o) {
                            if ("id" == k) {
                                if (idCatch[o.id]) {
                                    //ato.destState = idCatch[o.id];
                                    ato.name = idCatch[o.id].name;
                                }
                            } else if ("conditions" == k) {
                                if (o.conditions) {
                                    //this.addConditions(o.conditions, ato, data);
                                }
                            } else {
                                (ato as any)[k] = (o as any)[k];
                            }


                        }
                        nexts.unshift(ato);

                    }
                    idCatch[obj.id].nexts = nexts;
                }


            }








        }
    }

    updateTo(a: Animator2D) {
        let currLayer = (a as any)._controllerLayers;

        for (let i = 0, len = currLayer.length; i < len; i++) {
            currLayer[i].destroy();
        }
        currLayer.length = 0;

        let layers = this.getLayers();
        for (let i = 0, len = layers.length; i < len; i++) {
            a.addControllerLayer(layers[i]);
        }
    }
}