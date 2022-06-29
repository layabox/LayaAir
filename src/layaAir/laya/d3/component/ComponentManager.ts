
import { Component } from "../../components/Component";
import { BaseRender } from "../core/render/BaseRender";
import { Animator } from "./Animator";
import { Script3D } from "./Script3D";
import { SimpleSingletonList } from "./SimpleSingletonList";
import { SingletonList } from "../../d3/component/SingletonList";

export class ComponentManager {

  // Script call SingleList
  /**@internal update */
  private _onUpdateScripts: SingletonList<Script3D> = new SingletonList();
  /**@internal Late Update */
  private _onLateUpdateScripts: SingletonList<Script3D> = new SingletonList();
  /**@internal PreRender */
  private _onPreRenderScriptes: SingletonList<Script3D> = new SingletonList();
  /**@interanl PostRender */
  private _onPostRenderScriptes: SingletonList<Script3D> = new SingletonList();
  /**@internal Script3D Start */
  private _onStartScripts: Script3D[] = [];
  /**@internal Script3D destroy */
  private _destroyComponents: Script3D[] = [];

  //Animator
  private _animators: SimpleSingletonList = new SimpleSingletonList();

  //UpdateRender
  private _renderUpdateComponent: SingletonList<BaseRender> = new SingletonList();


  /**
   * @internal
   * add animator Com
   * @param animat 
   */
  addAnimator(animat: Animator) {
    const animators = this._animators;
    animators.add(animat);
  }

  /**
   * @internal
   * remove animator Com
   * @param animat 
   */
  removeAnimator(animat: Animator) {
    const animators = this._animators;
    animators.remove(animat);
  }

  /**
   * animators update
   * @param deltaTime 
   */
  callAnimatorUpdate(deltaTime: number) {
    const elements = this._animators.elements;
    for (let i = this._animators.length - 1; i >= 0; --i) {
      (elements[i] as Animator)._update();
    }
  }

  /**
   * @internal
   * add Render Update Com
   * @param render 
   */
  addUpdateRenderer(render: BaseRender) {
    this._renderUpdateComponent.add(render);
  }

  /**
   * @internal
   * remnove Render Update Com
   * @param render 
   */
  removeUpdateRenderer(render: BaseRender) {
    let length = this._renderUpdateComponent.length;
    let array = this._renderUpdateComponent.elements;
    let index = array.indexOf(render);
    array[index] = array[length-1];
    this._renderUpdateComponent.length-=1;
  }

  /**
   * @internal
   * call Render Update
   * @param deltaTime 
   */
  callRenderUpdate(deltaTime: number) {
    const elements = this._renderUpdateComponent.elements;
    for (let i = this._renderUpdateComponent.length - 1; i >= 0; --i) {
      (elements[i] as BaseRender).update(deltaTime);
    }
  }

  /**
   * @internal
   * add Start Com
   * @param script 
   */
  addOnStartScript(script: Script3D) {
    this._onStartScripts.push(script);
  }

  /**
   * @internal
   * Call Start fun
   */
  callScriptStart() {
    this._onStartScripts.forEach(element => {
      element.onStart();
      element._started = true;
    });
    this._onStartScripts.length = 0;
  }

  /**
   * @internal
   * add Update Com
   * @param script 
   */
  addOnUpdateScript(script: Script3D) {
    const updateScripts = this._onUpdateScripts;
    updateScripts.add(script);
  }

  /**
   * @internal
   * remove Update Com
   * @param script 
   */
  removeOnUpdateScript(script: Script3D): void {
    this._onUpdateScripts.remove(script);
  }

  /**
   * @internal
   * call update fun
   * @param deltaTime 
   */
  callScriptUpdate(deltaTime: number) {
    const updateScripts = this._onUpdateScripts.elements;
    for (let i = 0, n = this._onUpdateScripts.length; i < n; i++) {
      const scripte = updateScripts[i];
      (<Script3D>scripte).onUpdate(deltaTime);
    }
  }

  /**
   * @internal
   * add late Update com
   * @param script 
   */
  addOnLateUpdateScript(script: Script3D): void {
    const lateUpdateScripts = this._onLateUpdateScripts;
    lateUpdateScripts.add(script);
  }

  /**
   * @internal
   * remove late Update Com
   * @param script 
   */
  removeOnLateUpdateScript(script: Script3D): void {
    const lateUpdateScripts = this._onLateUpdateScripts;
    lateUpdateScripts.remove(script);
  }

  /**
   * call late Update
   * @param deltaTime 
   */
  callScriptLataUpdate(deltaTime: number) {
    const lateUpdateScripts = this._onLateUpdateScripts.elements;
    for (let i = 0, n = this._onLateUpdateScripts.length; i < n; i++) {
      const scripte = lateUpdateScripts[i];
      (<Script3D>scripte).onUpdate(deltaTime);
    }
  }

  /**
   * add pre Render Script
   * @param script 
   */
  addPreRenderScript(script: Script3D): void {
    const preRenderScripts = this._onPreRenderScriptes;
    preRenderScripts.add(script);
  }

  /**
   * remove Pre Render Script
   * @param script 
   */
  removePreRenderScript(script: Script3D): void {
    const preRenderScripts = this._onPreRenderScriptes;
    preRenderScripts.remove(script);
  }

  /**
   * @internal
   * call pre Render
   */
  callPreRenderScript() {
    const preRenderScripts = this._onPreRenderScriptes.elements;
    for (let i = 0, n = this._onPreRenderScriptes.length; i < n; i++) {
      const scripte = preRenderScripts[i];
      (<Script3D>scripte).onPreRender();
    }
  }

  /**
   * @internal
   * add post Render Script
   * @param script 
   */
  addPostRenderScript(script: Script3D) {
    const PostRenderScripts = this._onPostRenderScriptes;
    PostRenderScripts.add(script);
  }

  /**
   * @internal
   * Remove post Render Script
   * @param script 
   */
  removePostRenderScript(script: Script3D) {
    const PostRenderScripts = this._onPostRenderScriptes;
    PostRenderScripts.remove(script);
  }

  /**
   * call post Render Script
   */
  callPostRenderScript() {
    const PostRenderScripts = this._onPostRenderScriptes.elements;
    for (let i = 0, n = this._onPostRenderScriptes.length; i < n; i++) {
      const scripte = PostRenderScripts[i];
      (<Script3D>scripte).onPostRender();
    }
  }

  /**
   * @internal
   * add Script
   * @param script 
   */
  _addScript(script: Script3D) {
    if (script.onUpdate !== Script3D.prototype.onUpdate)
      this.addOnUpdateScript(script);
    if (script.onLateUpdate !== Script3D.prototype.onLateUpdate)
      this.addOnLateUpdateScript(script);
    if (script.onPreRender !== Script3D.prototype.onPreRender)
      this.addPreRenderScript(script);
    if (script.onPostRender !== Script3D.prototype.onPostRender)
      this.addPostRenderScript(script);
  }

  /**
   * @internal
   * remove Script
   * @param script 
   */
  _removeScript(script: Script3D) {
    if (script.onUpdate !== Script3D.prototype.onUpdate)
      this.removeOnUpdateScript(script);
    if (script.onLateUpdate !== Script3D.prototype.onLateUpdate)
      this.removeOnLateUpdateScript(script);
    if (script.onPreRender !== Script3D.prototype.onPreRender)
      this.removePreRenderScript(script);
    if (script.onPostRender !== Script3D.prototype.onPostRender)
      this.removePostRenderScript(script);
  }

  /**
   * @param component 
   */
  addComponentDestroy(component: Script3D): void {
    this._destroyComponents.push(component);
  }

  /**
   *  destroy
   */
  callComponentDestroy(): void {
    this._destroyComponents.forEach(element => {
      element.onDestroy();
    });
    this._destroyComponents.length = 0;
  }

  destroy() {
    //TODO:
  }





}