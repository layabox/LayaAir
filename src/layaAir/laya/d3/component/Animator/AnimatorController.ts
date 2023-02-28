import { AnimatorControllerParse, AniParmType, TypeAnimatorConditions, TypeAnimatorControllerData, TypeAnimatorParams, TypeAnimatorState, TypeAnimatorTransition } from "../../../components/AnimatorControllerParse";
import { AnimatorStateCondition, AnimatorStateBoolCondition, AnimatorStateNumberCondition, AnimatorStateTriggerCondition } from "../../../components/AnimatorStateCondition";
import { Resource } from "../../../resource/Resource";
import { ClassUtils } from "../../../utils/ClassUtils";
import { Animator } from "./Animator";
import { AnimatorControllerLayer } from "./AnimatorControllerLayer";
import { AnimatorState } from "./AnimatorState";
import { AnimatorTransition } from "./AnimatorTransition";
import { AvatarMask } from "./AvatarMask";

export class AnimatorController extends Resource {
    data: TypeAnimatorControllerData;
    clipsID: string[];
    constructor(data: any) {
        super();
        let obj = AnimatorControllerParse.parse(data);


        this.data = obj.ret;
        this.clipsID = obj.clipsID;
    }

    private getLayers() {
        let layers = this.data.controllerLayers;
        let lArr: AnimatorControllerLayer[] = [];

        for (let i = layers.length - 1; i >= 0; i--) {
            let l = layers[i];
            let acl = new AnimatorControllerLayer(l.name);
            if (l.avatarMask) {
                acl.avatarMask = new AvatarMask();
                for (let key in l.avatarMask) {
                    acl.avatarMask.setTransformActive(key, l.avatarMask[key]);
                }
            }
            lArr.unshift(acl);

            for (let k in l) {
                if ("avatarMask" == k || "name" == k || "states" == k || null == (l as any)[k]) {
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


    updateTo(a: Animator) {
        let currLayer = (a as any)._controllerLayers;

        for (let i = 0, len = currLayer.length; i < len; i++) {
            currLayer[i]._removeReference();
        }
        currLayer.length = 0;

        let layers = this.getLayers();

        for (let i = 0, len = layers.length; i < len; i++) {
            a.addControllerLayer(layers[i]);
        }
        let parms = this.data.animatorParams;
        if (parms) {
            for (let i = parms.length - 1; i >= 0; i--) {
                let p = parms[i];
                if (AniParmType.Bool == p.type) {
                    a.setParamsBool(p.name, Boolean(p.val));
                } else if (AniParmType.Float == p.type) {
                    let val = Number(p.val);
                    if (isNaN(val)) {
                        val = 0;
                    }
                    a.setParamsNumber(p.name, val);
                } else if (AniParmType.Trigger == p.type) {
                    if (p.val) {
                        a.setParamsTrigger(p.name);
                    }
                }
            }
        }

    }



    private createState(states: TypeAnimatorState[], idCatch: Record<string, AnimatorState>, acl: AnimatorControllerLayer) {
        if (!states) return null;
        let ret: Record<string, AnimatorState> = {};
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


            let state = new AnimatorState();
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


    private setExitTransition(exitRet: Record<string, TypeAnimatorTransition[]>, transitions: TypeAnimatorTransition[], idCatch: Record<string, AnimatorState>, data: TypeAnimatorControllerData, pExitRet: Record<string, TypeAnimatorTransition[]>) {
        for (let id in exitRet) {
            let state = idCatch[id];
            if (state) {

                let ats: AnimatorTransition[] = state.transitions;
                let sts: AnimatorTransition[] = state.soloTransitions;

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


                        let ato = new AnimatorTransition();
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


    private setTransitions(states: TypeAnimatorState[], idCatch: Record<string, AnimatorState>, acl: AnimatorControllerLayer, data: TypeAnimatorControllerData, pState?: TypeAnimatorState) {
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
                                let ato = new AnimatorTransition();
                                ato.destState = destState;
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

                let ats: AnimatorTransition[] = idCatch[obj.id].transitions;
                let sts: AnimatorTransition[] = idCatch[obj.id].soloTransitions;



                for (let j = soloTransitions.length - 1; j >= 0; j--) {
                    let o = soloTransitions[j];
                    if ("-3" == o.id) {
                        if (null == exitRet[obj.id]) {
                            exitRet[obj.id] = [];
                        }
                        exitRet[obj.id].push(o);
                        continue;
                    }

                    let ato = new AnimatorTransition();

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



    private getState(states: TypeAnimatorState[], acl: AnimatorControllerLayer, data: TypeAnimatorControllerData) {
        //let ret:
        if (states) {
            let idCatch: Record<string, AnimatorState> = {};

            this.createState(states, idCatch, acl);



            this.setTransitions(states, idCatch, acl, data);

            //acl.defaultState = 










        }
    }

    private addConditions(arr: TypeAnimatorConditions[], ato: AnimatorTransition, data: TypeAnimatorControllerData) {
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
                let b = new AnimatorStateBoolCondition(o.name);
                b.compareFlag = Boolean(o.checkValue);
                c = b;
            } else if (parm.type == AniParmType.Float) {
                let n = new AnimatorStateNumberCondition(o.name);
                n.numberValue = Number(o.checkValue);
                n.compareFlag = o.type;
                c = n;
            } else if (parm.type == AniParmType.Trigger) {
                let t = new AnimatorStateTriggerCondition(o.name);
                c = t;
            }


            ato.addCondition(c);
        }
    }



}