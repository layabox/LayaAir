export interface TypeAnimatorControllerData {
    layerW: number,
    controllerLayers: TypeAnimatorLayer[];
    cullingMode?: number,
    enable?: boolean,
    animatorParams?: TypeAnimatorParams[],
}
export interface TypeAnimatorParams {
    id: number,
    name: string,
    type: AniParmType,
    val: number | boolean,
}
export interface TypeAnimatorLayer {
    defaultStateName?: string,
    name: string,
    blendingMode: number,
    states: TypeAnimatorState[],
    playOnWake: boolean,
    defaultWeight: number,
    avatarMask?: any,

    stageX?: number,
    stageY?: number,
    stageScale?: number,
}

export enum AniParmType {
    Float,
    Bool,
    Trigger,
}

/**
 * 动画状态条件类型
 */
export enum AniStateConditionType {
    Number,
    Bool,
    Trigger
}

export interface TypeAnimatorState {
    x: number,
    y: number,
    /**-1代表enter，-2代表exit，-3代表anyState */
    id: string,
    name: string,
    speed?: number,
    clipStart?: number,
    clipEnd?: number,
    loop?: number,
    yoyo?: boolean,
    soloTransitions?: TypeAnimatorTransition[],
    clip?: { _$uuid: string, },
    scripts?: string[],


    states?: TypeAnimatorState[],
    defaultStateName?: string,
    stageX?: number,
    stageY?: number,
    stageScale?: number,
}
export interface TypeAnimatorTransition {
    id: string,
    name?: string,
    mute?: boolean,
    solo?: boolean,
    exitTime?: number,
    transduration?: number,
    transstartoffset?: number,
    exitByTime?: boolean,
    conditions?: TypeAnimatorConditions[],
}
export interface TypeAnimatorConditions {
    id?: number,
    type?: AniStateConditionNumberCompressType,
    checkValue?: number | boolean,
    name?: string,
}

export enum AniStateConditionNumberCompressType {
    Less,
    Greater
}

export class AnimatorControllerParse {
    static parse(data: TypeAnimatorControllerData) {
        //let ret: TypeAnimatorControllerData = JSON.parse(JSON.stringify(data));
        let ret = data;
        let layers = ret.controllerLayers;
        if (null == layers) {
            layers = [];
        }

        let clipsID: string[] = [];


        for (let i = layers.length - 1; i >= 0; i--) {
            let l = layers[i];
            let states = l.states;
            if (!states) {
                states = [];
                l.states = states;
            }

            l.defaultStateName = null;
            let retobj = this.checkStates(states, clipsID, ret);
            if (retobj) {
                l.defaultStateName = retobj.enterName;
            } else {
                layers.splice(i, 1);
            }
        }
        return { ret: ret, clipsID: clipsID };
    }


    private static checkStates(states: TypeAnimatorState[], clipsID: string[], data: TypeAnimatorControllerData) {
        let clipState: TypeAnimatorState[] = null;
        let enterState: TypeAnimatorState = null;
        for (let j = states.length - 1; j >= 0; j--) {
            let state = states[j];
            if (state.states) {
                if (null == this.checkStates(state.states, clipsID, data)) {
                    states.splice(j, 1);
                } else {
                    if (null == clipState) {
                        clipState = [];
                    }
                    clipState.push(state);
                }
            } else if ("-1" == state.id) {
                enterState = state;
                // let defName = this.checkDefault(state, states);
                // if (null != defName) {
                //     l.defaultStateName = defName;
                // }
            } else if ("-2" == state.id) {
                //TODO any
            } else if ("-3" == state.id) {
                //TODO exit
            } else if (null == state.clip || null == state.clip._$uuid || "" == state.clip._$uuid) {
                states.splice(j, 1);
            } else {
                if (0 > clipsID.indexOf(state.clip._$uuid)) {
                    clipsID.push(state.clip._$uuid);
                }

                this.checkNext(state, states, data);
                if (null == clipState) {
                    clipState = [];
                }
                clipState.push(state);
            }
        }
        let ret: { states: TypeAnimatorState[], enterName: string } = null;
        if (clipState && enterState) {
            let defName = this.checkDefault(enterState, clipState);
            if (null != defName) {
                ret = { states: clipState, enterName: defName };
            }
        }


        return ret;
    }

    private static checkNext(state: TypeAnimatorState, states: TypeAnimatorState[], data: TypeAnimatorControllerData) {
        let nexts = state.soloTransitions;
        if (nexts) {
            for (let i = nexts.length - 1; i >= 0; i--) {
                let next = nexts[i];
                let nState = this.getStateByID(states, next.id);
                if (!nState || (null == nState.clip && "-3" != nState.id && null == nState.states)) {
                    nexts.splice(i, 1);
                } else {
                    next.name = nState.name;

                    next.conditions = this.checkConditions(next.conditions, data);


                }
            }
        }
    }


    private static checkConditions(conditions: TypeAnimatorConditions[], data: TypeAnimatorControllerData) {
        if (!conditions || 0 == conditions.length || null == data.animatorParams || 0 == data.animatorParams.length) {
            return [];
        }

        let parms = data.animatorParams;

        for (let i = conditions.length - 1; i >= 0; i--) {
            let o = conditions[i];
            let parm: TypeAnimatorParams = null;
            for (let j = parms.length - 1; j >= 0; j--) {
                if (parms[j].id == o.id) {
                    parm = parms[j];
                    break;
                }
            }
            if (null == parm) {
                conditions.splice(i, 1);
            } else {
                o.name = parm.name;
                if (parm.type == AniParmType.Float) {
                    let num = Number(o.checkValue);
                    if (isNaN(num)) {
                        o.checkValue = 0;
                    }
                    num = Number(o.type);
                    if (isNaN(num)) {
                        o.type = 0;
                    }
                }


            }


        }



        return conditions;


    }



    private static checkDefault(state: TypeAnimatorState, states: TypeAnimatorState[]) {
        let nexts = state.soloTransitions;
        let id: string = null;
        if (nexts && 0 < nexts.length) {
            id = nexts[0].id;
        }

        let defState: TypeAnimatorState = null;
        if (null != id) {
            defState = this.getStateByID(states, id);
        }
        if (null != defState && (null != defState.clip || null != defState.states)) {
            return defState.name;
        }

        for (let i = states.length - 1; i >= 0; i--) {
            if (states[i].clip) {
                return states[i].name;
            }
        }


        return null;

    }


    private static getStateByID(states: TypeAnimatorState[], id: string) {
        if (states) {
            for (let i = states.length - 1; i >= 0; i--) {
                if (states[i].id == id) {
                    return states[i];
                }
            }
        }
        return null;
    }

}