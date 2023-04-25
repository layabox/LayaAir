import { Resource } from "../resource/Resource";
import { ClassUtils } from "../utils/ClassUtils";
import { Animation2DParm } from "./Animation2DParm";
import { Animator2D } from "./Animator2D";
import { AnimatorControllerLayer2D } from "./AnimatorControllerLayer2D";
import { AnimatorControllerParse, AniParmType, TypeAnimatorConditions, TypeAnimatorControllerData, TypeAnimatorParams, TypeAnimatorState, TypeAnimatorTransition } from "./AnimatorControllerParse";
import { AnimatorState2D } from "./AnimatorState2D";
import { AnimatorStateCondition, AnimatorStateBoolCondition, AnimatorStateNumberCondition, AnimatorStateTriggerCondition } from "./AnimatorStateCondition";
import { AnimatorTransition2D } from "./AnimatorTransition2D";

/**
 * <code>2D动画控制器<code/>
 */
export class AnimatorController2D extends Resource {
    /**
     * @internal
     */
    data: TypeAnimatorControllerData;

    /**
     * @internal
     */
    clipsID: string[];

    /**
     * 实例化2D动画控制器
     * @param data 
     */
    constructor(data: any) {
        super();
        let obj = AnimatorControllerParse.parse(data);
        this.data = obj.ret;
        this.clipsID = obj.clipsID;
    }

    /**
     * @internal
     * @returns 
     */
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
                } catch (err: any) { }
            }
            this.getState(l.states, acl, this.data);

        }
        return lArr;
    }

    /**
     * @internal
     * @param states 
     * @param idCatch 
     * @param acl 
     * @returns 
     */
    private createState(states: TypeAnimatorState[], idCatch: Record<string, AnimatorState2D>, acl: AnimatorControllerLayer2D) {
        if (!states) return null;
        let ret: Record<string, AnimatorState2D> = {};
        let defID: string = null;
        for (let i = states.length - 1; i >= 0; i--) {
            let obj = states[i];
            let childStates = obj.states;
            if (childStates) {
                let groupRet = this.createState(childStates, idCatch, acl);
                if (groupRet) {
                    idCatch[obj.id] = groupRet.states[groupRet.id];
                }
                continue;
            }

            if (0 > Number(obj.id)) {
                if ("-1" == obj.id) {
                    let transitions = obj.soloTransitions;
                    if (transitions && 0 < transitions.length) {
                        defID = transitions[0].id;
                    }
                }
                continue;
            }

            let state = new AnimatorState2D();
            idCatch[obj.id] = state;
            ret[obj.id] = state;
            for (let k in obj) {
                try {
                    if ("scripts" == k) {
                        let scripts: string[] = obj[k];
                        if (scripts && Array.isArray(scripts)) {
                            for (let k = scripts.length - 1; k >= 0; k--) {
                                let uuid = scripts[k];
                                if (uuid && 0 == uuid.indexOf("res://")) {
                                    uuid = uuid.substring(6);
                                }
                                let c = ClassUtils.getClass(uuid);
                                if (c) {
                                    state.addScript(c);
                                }
                            }
                        }
                        continue;
                    } else if ("soloTransitions" == k) {
                        continue;
                    } else if (null != (obj as any)[k]) {
                        (state as any)[k] = (obj as any)[k];
                    }
                } catch (err: any) { }
            }

            acl.addState(state);
        }
        return { id: defID, states: ret };
    }

    /**
     * @internal
     * @param states 
     * @param acl 
     * @param data 
     */
    private getState(states: TypeAnimatorState[], acl: AnimatorControllerLayer2D, data: TypeAnimatorControllerData) {
        //let ret:
        if (states) {
            let idCatch: Record<string, AnimatorState2D> = {};
            this.createState(states, idCatch, acl);
            this.setTransitions(states, idCatch, acl, data);
        }
    }

    /**
     * @internal
     * @param exitRet 
     * @param transitions 
     * @param idCatch 
     * @param data 
     * @param pExitRet 
     */
    private setExitTransition(exitRet: Record<string, TypeAnimatorTransition[]>, transitions: TypeAnimatorTransition[], idCatch: Record<string, AnimatorState2D>, data: TypeAnimatorControllerData, pExitRet: Record<string, TypeAnimatorTransition[]>) {
        for (let id in exitRet) {
            let state = idCatch[id];
            if (state) {

                let ats: AnimatorTransition2D[] = state.transitions;
                let sts: AnimatorTransition2D[] = state.soloTransitions;

                let linArr = exitRet[id];
                for (let i = transitions.length - 1; i >= 0; i--) {
                    let t = transitions[i];
                    if ("-3" == t.id) {
                        if (null == pExitRet[id]) {
                            pExitRet[id] = [];
                        }
                        pExitRet[id].push(t);
                        continue;
                    }


                    for (let j = linArr.length - 1; j >= 0; j--) {
                        let t2 = linArr[j];


                        let ato = new AnimatorTransition2D();
                        ato.destState = idCatch[t.id];

                        if (t.conditions) {
                            this.addConditions(t.conditions, ato, data);
                        }

                        if (t2.conditions) {
                            this.addConditions(t2.conditions, ato, data);
                        }


                        for (let k in t) {
                            if ("solo" == k || "id" == k || "conditions" == k) {
                                continue;
                            } else {
                                (ato as any)[k] = (t as any)[k];
                            }
                        }

                        if (t.solo) {
                            sts.unshift(ato);
                        } else {
                            ats.unshift(ato);
                        }
                    }
                }
            }
        }
    }

    private _getAnimatorTransition2D(o: TypeAnimatorTransition, idCatch: Record<string, AnimatorState2D>, data: TypeAnimatorControllerData) {
        let ato = new AnimatorTransition2D();

        if (idCatch[o.id]) {
            ato.destState = idCatch[o.id];
        }
        if (o.conditions) {
            this.addConditions(o.conditions, ato, data);
        }

        for (let k in o) {
            if ("solo" == k || "id" == k || "conditions" == k) {
                continue;
            } else {
                (ato as any)[k] = (o as any)[k];
            }
        }
        return ato;
    }

    /**
     * @internal
     * @param states 
     * @param idCatch 
     * @param acl 
     * @param data 
     * @param pState 
     * @returns 
     */
    private setTransitions(states: TypeAnimatorState[], idCatch: Record<string, AnimatorState2D>, acl: AnimatorControllerLayer2D, data: TypeAnimatorControllerData, pState?: TypeAnimatorState) {
        if (!states) return null;

        let exitRet: Record<string, TypeAnimatorTransition[]> = {};

        for (let i = states.length - 1; i >= 0; i--) {
            let obj = states[i];

            if (obj.states) {
                let exitTransition = this.setTransitions(obj.states, idCatch, acl, data, obj);
                if (exitTransition) {
                    let transitions = obj.soloTransitions;
                    if (transitions) {
                        this.setExitTransition(exitTransition, transitions, idCatch, data, exitRet);
                    }
                }
            }
        }


        for (let i = states.length - 1; i >= 0; i--) {
            let obj = states[i];

            if (obj.states) {
                continue;
            }
            if ("-1" == obj.id) {
                if (obj.soloTransitions && 0 < obj.soloTransitions.length) {
                    if (null == pState) {
                        acl.defaultState = idCatch[obj.soloTransitions[0].id];
                        acl._enterTransition = this._getAnimatorTransition2D(obj.soloTransitions[0], idCatch, data);
                    } else {
                        idCatch[pState.id] = idCatch[obj.soloTransitions[0].id];
                    }
                    continue;
                }
            } else if ("-2" == obj.id) {
                let transitions = obj.soloTransitions;
                if (transitions) {
                    for (let j = transitions.length - 1; j >= 0; j--) {
                        let o = transitions[j];
                        let destState = idCatch[o.id];
                        if (destState) {
                            for (let idk in idCatch) {
                                let state = idCatch[idk];
                                let ato = this._getAnimatorTransition2D(o, idCatch, data)
                                // let ato = new AnimatorTransition2D();
                                // ato.destState = destState;
                                // if (o.conditions) {
                                //     this.addConditions(o.conditions, ato, data);
                                // }

                                // for (let k in o) {
                                //     if ("solo" == k || "id" == k || "conditions" == k) {
                                //         continue;
                                //     } else {
                                //         (ato as any)[k] = (o as any)[k];
                                //     }
                                // }

                                if (o.solo) {
                                    state.soloTransitions.unshift(ato);
                                } else {
                                    state.transitions.unshift(ato);
                                }
                            }
                        }

                    }
                }
                continue;
            } else if ("-3" == obj.id) {
                continue;
            }

            let soloTransitions = obj.soloTransitions;
            if (soloTransitions && idCatch[obj.id]) {

                let ats: AnimatorTransition2D[] = idCatch[obj.id].transitions;
                let sts: AnimatorTransition2D[] = idCatch[obj.id].soloTransitions;
                for (let j = soloTransitions.length - 1; j >= 0; j--) {
                    let o = soloTransitions[j];
                    if ("-3" == o.id) {
                        if (null == exitRet[obj.id]) {
                            exitRet[obj.id] = [];
                        }
                        exitRet[obj.id].push(o);
                        continue;
                    }

                    let ato = this._getAnimatorTransition2D(o,idCatch,data);

                    if (o.solo) {
                        sts.unshift(ato);
                    } else {
                        ats.unshift(ato);
                    }
                }
            }
        }

        return exitRet;
    }

    /**
     * @internal
     * @param arr 
     * @param ato 
     * @param data 
     * @returns 
     */
    private addConditions(arr: TypeAnimatorConditions[], ato: AnimatorTransition2D, data: TypeAnimatorControllerData) {
        let parms = data.animatorParams;
        if (null == parms || 0 == parms.length) return;
        for (let i = 0, len = arr.length; i < len; i++) {
            let o = arr[i];
            let parm: TypeAnimatorParams = null;
            for (let j = parms.length - 1; j >= 0; j--) {
                if (parms[j].id == o.id) {
                    parm = parms[j];
                    break;
                }
            }
            if (null == parm) {
                return;
            }
            let c: AnimatorStateCondition;
            if (parm.type == AniParmType.Bool) {
                let b = new AnimatorStateBoolCondition(parm.name);
                b.compareFlag = Boolean(o.checkValue);
                c = b;
            } else if (parm.type == AniParmType.Float) {
                let n = new AnimatorStateNumberCondition(parm.name);
                n.numberValue = Number(o.checkValue);
                n.compareFlag = o.type;
                c = n;
            } else if (parm.type == AniParmType.Trigger) {
                let t = new AnimatorStateTriggerCondition(parm.name);
                c = t;
            }
            ato.addCondition(c);
        }
    }

    /**
     * @internal
     * @param a 
     */
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

        let parms = this.data.animatorParams;
        if (parms) {
            let setParm: Record<string, Animation2DParm> = {};
            for (let i = parms.length - 1; i >= 0; i--) {
                let p = parms[i];
                let sp = new Animation2DParm();
                sp.name = p.name;
                sp.type = p.type;
                sp.value = p.val;
                setParm[p.name] = sp;
            }
            a.parameters = setParm;
        }
    }
}