(function (exports, Laya) {
  'use strict';

  const defaultOptions = {
      autoRetryConnnect: true,
      retryConnnectCount: 0,
      retryConnnectDelay: 10000
  };
  let WebSocketCls = window.WebSocket;
  class SocketManager {
      constructor(host, port, name, type, options) {
          this.clientId = 0;
          this.socket = null;
          this.isSupport = false;
          this.status = 0;
          this.retryConnnectCount = 0;
          this.onClose = (ev) => {
              let { onClose, autoRetryConnnect, retryConnnectCount } = this.options;
              retryConnnectCount = retryConnnectCount || 0;
              if (onClose) {
                  onClose(ev);
              }
              if (this.status === 0) {
                  if (autoRetryConnnect &&
                      (retryConnnectCount == 0 || this.retryConnnectCount < retryConnnectCount)) {
                      this.delayRetryConnnect();
                  }
              }
          };
          this._delayRetryConnnectTimer = 0;
          this._delayRetryConnnect = () => {
              clearTimeout(this._delayRetryConnnectTimer);
              this.retryConnnectCount++;
              this.reConnect();
          };
          this.onMessage = (ev) => {
              const { onMessage } = this.options;
              if (onMessage) {
                  onMessage(ev);
              }
          };
          this.onError = (ev) => {
              const { onError } = this.options;
              if (onError) {
                  onError(ev);
              }
          };
          this.onOpen = (ev) => {
              const { onOpen } = this.options;
              if (onOpen) {
                  onOpen(ev);
              }
              this.retryConnnectCount = 0;
              clearTimeout(this._delayRetryConnnectTimer);
          };
          this.url = 'ws://' + host + ":" + port + '?type=' + type + '&name=' + name;
          if (options) {
              Object.assign(options, defaultOptions);
              this.options = options;
          }
          else {
              this.options = defaultOptions;
          }
          WebSocketCls = window.WebSocket;
          this.isSupport = (typeof WebSocketCls != 'undefined');
          if (this.isSupport) {
              this.reConnect();
          }
          else {
              console.log('not support websocket');
          }
      }
      closeConnect() {
          this.retryConnnectCount = 0;
          if (this.socket) {
              let socket = this.socket;
              socket.onclose = null;
              socket.onmessage = null;
              socket.onerror = null;
              socket.onopen = null;
              socket.close();
              this.socket = null;
          }
          this.status = 0;
      }
      delayRetryConnnect() {
          clearTimeout(this._delayRetryConnnectTimer);
          if (ProfileHelper.enable) {
              this._delayRetryConnnectTimer = setTimeout(this._delayRetryConnnect, this.options.retryConnnectDelay);
          }
      }
      reConnect() {
          let socket = new WebSocketCls(this.url);
          this.socket = socket;
          socket.onclose = this.onClose;
          socket.onmessage = this.onMessage;
          socket.onerror = this.onError;
          socket.onopen = this.onOpen;
      }
      dispose() {
          this.closeConnect();
      }
      send(msg) {
          if (this.socket && this.socket.readyState === 1) {
              this.socket.send(msg);
              return true;
          }
          return false;
      }
  }
  const getParameterByName = function (name, url) {
      name = name.replace(/[\[\]]/g, '\\$&');
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
      if (!results)
          return null;
      if (!results[2])
          return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };
  const idIsInList = (id, list) => {
      for (let i = 0; i < list.length; i++) {
          let info = list[i];
          if (info.id == id) {
              return true;
          }
      }
      return false;
  };
  class ProfileHelper {
      constructor() {
          this.socketManager = null;
          this.selectPlayerId = 0;
          this.active = 0;
          this.selectPlayerStatus = 0;
          this.sendMsg = (type, data, toId = 0) => {
              this.socketManager.send(JSON.stringify({
                  type: type,
                  data: data,
                  toId: toId
              }));
          };
          this.sendInternalMsg = (type, data, toId = 0) => {
              this.socketManager.send(JSON.stringify({
                  type: type,
                  data: data,
                  toId: toId
              }));
          };
          this.frameDataList = [];
          this.sendFramData = (data) => {
              if (!this.active) {
                  return;
              }
              this.frameDataList.push(data);
              if (this.frameDataList.length >= 30) {
                  this.sendFramDataList(this.frameDataList);
                  this.frameDataList.length = 0;
              }
          };
          this.sendConfigData = (data = null) => {
              let configData = this.performanceDataTool.getPathInfo();
              this.sendInternalMsg('getPerformanceConf_back', configData);
          };
          this.sendFramDataList = (dataList) => {
              let list = dataList.map((data) => {
                  return {
                      type: "frameData",
                      data: data
                  };
              });
              this.sendInternalMsg("msgList", list);
          };
      }
      static set enable(value) {
          if (ProfileHelper._enable === value) {
              return;
          }
          ProfileHelper._enable = value;
          if (value) {
              const initOption = ProfileHelper.initOption;
              if (!initOption) {
                  throw new Error('没有执行初始化init');
              }
              const { type, performanceDataTool, onOpen, onMessage, retryConnectCount, retryConnnectDelay } = initOption;
              ProfileHelper.init(type, performanceDataTool, onOpen, onMessage, retryConnectCount, retryConnnectDelay);
          }
          else {
              ProfileHelper.dispose();
          }
      }
      static get enable() {
          return ProfileHelper._enable;
      }
      init(type, performanceDataTool, onOpen, onMessage, retryConnectCount, retryConnnectDelay) {
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
          }
          else {
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
              }
              else {
                  host = 'localhost';
              }
          }
          this.performanceDataTool = performanceDataTool;
          this.heartIntervalHandler = setInterval(() => {
              this.sendInternalMsg('heart', {});
          }, 1000 * 10);
          this.socketManager = new SocketManager(host, port, name, type, {
              retryConnectCount: retryConnectCount || defaultOptions.retryConnnectCount,
              retryConnnectDelay: retryConnnectDelay || defaultOptions.retryConnnectDelay,
              onMessage: (ev) => {
                  if (!this.socketManager) {
                      return;
                  }
                  if (typeof ev.data == 'string') {
                      let data = JSON.parse(ev.data);
                      let msgList = [data];
                      if (data.type === 'msgList') {
                          msgList = data.data;
                      }
                      msgList.forEach((eventData) => {
                          switch (eventData.type) {
                              case 'onSelectMe':
                                  this.sendInternalMsg('onSelectMe_back', eventData.data);
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
                                  this.sendInternalMsg('start', {});
                                  break;
                              case 'active':
                                  this.active = eventData.data.active;
                                  break;
                              case 'playerList':
                                  if (this.selectPlayerId) {
                                      if (!idIsInList(this.selectPlayerId, eventData.data)) {
                                          this.selectPlayerId = 0;
                                          this.selectPlayerStatus = 0;
                                      }
                                  }
                                  if (this.selectPlayerId && eventData.data.length > 0 && this.selectPlayerStatus == 0) {
                                      let playerId = eventData.data[0].id;
                                      this.selectPlayerStatus = 1;
                                      this.sendMsg('selectPlayer', { id: playerId });
                                  }
                                  break;
                          }
                      });
                      if (onMessage) {
                          msgList.forEach((msgData) => {
                              onMessage(msgData);
                          });
                      }
                  }
              },
              onOpen: (ev) => {
                  if (onOpen) {
                      onOpen(ev);
                  }
              },
              onError: (ev) => {
              },
              onClose: (ev) => {
              }
          });
      }
      dispose() {
          clearInterval(this.heartIntervalHandler);
          if (this.socketManager) {
              this.socketManager.dispose();
              this.socketManager = null;
          }
          this.performanceDataTool = null;
      }
      static init(type, performanceDataTool, onOpen, onMessage, retryConnectCount, retryConnnectDelay) {
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
  }
  ProfileHelper.sendFramData = (data) => {
      if (!ProfileHelper._enable) {
          return;
      }
      if (ProfileHelper.instance) {
          ProfileHelper.instance.sendFramData(data);
      }
  };
  ProfileHelper.sendConfigData = (data) => {
      if (!ProfileHelper._enable) {
          return;
      }
      if (ProfileHelper.instance) {
          ProfileHelper.instance.sendConfigData(data);
      }
  };
  ProfileHelper.dispose = () => {
      if (ProfileHelper.instance) {
          ProfileHelper.instance.dispose();
      }
      ProfileHelper.instance = null;
  };

  class PerformanceDataTool {
      constructor() {
          this._enable = false;
          this._AllPathMap = {};
          this._pathColor = {};
          this._pathCount = 0;
          this._runtimeShowPathIndex = -1;
          this._nodeList = [];
          this.samplerFramStep = 6;
          this._memoryDataMap = {};
          this.pointArray = [];
          this.fpsArray = [];
      }
      static InitLayaPerformanceInfo() {
          PerformanceDataTool.instance.InitLayaPerformanceInfo();
      }
      InitLayaPerformanceInfo() {
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_2D, [255, 128, 128, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D, [255, 255, 128, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER, [128, 255, 128, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_UPDATESCRIPT, [128, 255, 255, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS, [0, 128, 255, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_SIMULATE, [255, 0, 0, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_CHARACTORCOLLISION, [255, 128, 0, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_EVENTSCRIPTS, [128, 0, 0, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER, [64, 128, 128, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_SHADOWMAP, [192, 192, 192, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_CLUSTER, [128, 64, 64, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_CULLING, [0, 64, 128, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERDEPTHMDOE, [128, 0, 64, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDEROPAQUE, [128, 0, 255, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERCOMMANDBUFFER, [128, 128, 64, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERTRANSPARENT, [128, 0, 255, 255]);
          this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_POSTPROCESS, [0, 255, 0, 255]);
      }
      set enable(value) {
          if (value) {
              this._startFram = Laya.Stat.loopCount;
              this.resetReCordData();
              this._sp = new Laya.Sprite();
              this._sp.pos(0, 400).zOrder = 99;
              Laya.Laya.stage.addChild(this._sp);
          }
          else {
              Laya.Laya.stage.removeChild(this._sp);
          }
          this._enable = value;
      }
      get enable() {
          return this._enable;
      }
      get enableDataExport() {
          return this._enableDataExport;
      }
      set enableDataExport(value) {
          if (value) {
              ProfileHelper.init('player', this);
              ProfileHelper.enable = value;
              this.samplerFramStep = 1;
          }
          else {
              ProfileHelper.enable = value;
          }
          this._enableDataExport = value;
      }
      static setDataExportHost(host) {
          ProfileHelper.Host = host;
      }
      set runtimeShowPath(path) {
          let showPathIndex = this._AllPathMap[path];
          for (let i in this.pointArray) {
              delete this.pointArray[i];
              delete PerformanceDataTool.stepLengthArrayMap[i];
          }
          if (showPathIndex != null)
              this._runtimeShowPathIndex = showPathIndex;
          else
              this._runtimeShowPathIndex = -1;
      }
      getNodePathIndex(path) {
          var id;
          if (this._AllPathMap[path] != null)
              id = this._AllPathMap[path];
          else {
              id = this._pathCount++;
              this._AllPathMap[path] = id;
              ProfileHelper.sendConfigData(this.getPathInfo());
          }
          return id;
      }
      getPathInfo() {
          let pathInfo = {};
          if (Object.keys(this._pathColor).length == 0) {
              this.InitLayaPerformanceInfo();
          }
          pathInfo["_pathColor"] = this._pathColor;
          pathInfo["_AllPathMap"] = this._AllPathMap;
          return pathInfo;
      }
      exportPerformanceFile(fromProfiler = false) {
          PerformanceDataTool.InitLayaPerformanceInfo();
          if (!fromProfiler) {
              this.enable = false;
          }
          let blockstr = [];
          let blockStart = [];
          let blocklength = [];
          let tempNum = 0;
          let blockStartPos;
          let tempStartPos;
          let tempEndPos;
          let dataByte = new Laya.Byte();
          dataByte.pos = 0;
          dataByte.writeUTFString(PerformanceDataTool.VERSION);
          blockstr.push("DataInfo01", "Color", "NodeInfo");
          dataByte.writeUint16(blockstr.length);
          for (let i = 0; i < blockstr.length; i++) {
              dataByte.writeUTFString(blockstr[i]);
          }
          blockStart.length = blockstr.length;
          blocklength.length = blockstr.length;
          blockStartPos = dataByte.pos;
          for (let i = 0; i < blockstr.length; i++) {
              dataByte.writeInt32(0);
              dataByte.writeInt32(0);
          }
          blockStart[0] = dataByte.pos;
          dataByte.writeInt32(this._nodeList.length);
          dataByte.writeInt32(this.samplerFramStep);
          dataByte.writeInt32(this._pathCount);
          for (let j in this._AllPathMap) {
              dataByte.writeUTFString(j);
          }
          tempStartPos = dataByte.pos;
          dataByte.writeInt32(0);
          for (let k in this._memoryDataMap) {
              dataByte.writeUTFString(k);
              tempNum++;
          }
          tempEndPos = dataByte.pos;
          dataByte.pos = tempStartPos;
          dataByte.writeInt32(tempNum);
          dataByte.pos = tempEndPos;
          blocklength[0] = dataByte.pos - blockStart[0];
          blockStart[1] = dataByte.pos;
          tempStartPos = dataByte.pos;
          tempNum = 0;
          dataByte.writeInt32(0);
          for (let l in this._pathColor) {
              var vec4 = this._pathColor[l];
              dataByte.writeUTFString(l);
              dataByte.writeUint32(vec4[0]);
              dataByte.writeUint32(vec4[1]);
              dataByte.writeUint32(vec4[2]);
              dataByte.writeUint32(vec4[3]);
              tempNum++;
          }
          tempEndPos = dataByte.pos;
          dataByte.pos = tempStartPos;
          dataByte.writeInt32(tempNum);
          dataByte.pos = tempEndPos;
          blocklength[1] = dataByte.pos - blockStart[1];
          blockStart[2] = dataByte.pos;
          for (let n = 0; n < this._nodeList.length; n++) {
              let node = this._nodeList[n];
              dataByte.writeInt32(node.nodeNum);
              for (var ii = 0; ii < node.nodeNum; ii++) {
                  dataByte.writeFloat32(node.nodeDelty[ii] ? node.nodeDelty[ii] : 0);
              }
          }
          blocklength[2] = dataByte.pos - blockStart[2];
          dataByte.pos = blockStartPos;
          for (let v = 0; v < blockstr.length; v++) {
              dataByte.writeInt32(blockStart[v]);
              dataByte.writeInt32(blocklength[v]);
          }
          return dataByte;
      }
      BegainSample(samplePath) {
          if (!this.enable)
              return;
          this.update();
          this._runtimeNode.getFunStart(this.getNodePathIndex(samplePath));
      }
      EndSample(samplePath) {
          if (!this.enable)
              return 0;
          return this._runtimeNode.getFunEnd(this.getNodePathIndex(samplePath));
      }
      AddMemory(memoryPath, size) {
          this._memoryDataMap[memoryPath] = this._memoryDataMap[memoryPath] ? (this._memoryDataMap[memoryPath] + size) : size;
      }
      setPathDataColor(path, color) {
          this._pathColor[path] = color;
      }
      resetReCordData() {
          this._nodeList.forEach(element => {
              PerforManceNode.revert(element);
          });
          this._nodeList = [];
          this._runtimeNode = null;
          this._AllPathMap = {};
          this._memoryDataMap = {};
          this._pathColor = {};
          this._pathCount = 0;
      }
      exportFrontNode(ob, pathIndex) {
          if (!ob || !ob.nodeDelty || pathIndex == -1) {
              return;
          }
          const width = PerformanceDataTool.DrawWidth;
          const height = PerformanceDataTool.DrawHeight;
          const stepLength = PerformanceDataTool.StepLength;
          const fullStepTime = 33;
          const bgColor = "rgba(150, 150, 150, 0.8)";
          let array, value, percent;
          this._sp.graphics.clear();
          this._sp.graphics.drawRect(0, 0, width, height, bgColor);
          for (let i = 0, len = ob.nodeDelty.length; i < len; i++) {
              if (i != pathIndex && i != this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_DELTYTIME)) {
                  continue;
              }
              value = ob.nodeDelty[i];
              percent = value / fullStepTime;
              if (!this.pointArray[i]) {
                  this.pointArray[i] = [];
              }
              array = this.pointArray[i];
              if (array.length >= stepLength) {
                  array.shift();
              }
              array.push(percent);
              let color = i.toString(16);
              let fillColor = `#${color}${color}C4${color}${color}`;
              if (i == this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_DELTYTIME)) {
                  fillColor = "#FFFFFF";
              }
              if (!PerformanceDataTool.stepLengthArrayMap[i]) {
                  PerformanceDataTool.stepLengthArrayMap[i] = new Array(PerformanceDataTool.StepLength * 2);
              }
              this.updatelineChart(width, height, stepLength, array, fillColor, 1, PerformanceDataTool.stepLengthArrayMap[i]);
          }
          this._sp.graphics.drawLine(0, height / 2, width, height / 2, "green", 1);
          this._sp.graphics.drawLine(0, height / 4 * 3, width, height / 4 * 3, "red", 1);
      }
      updatelineChart(width, height, stepLength, array, fillColor, style, drawArray) {
          switch (style) {
              case 1:
                  let copy = drawArray;
                  for (let i = 0, len = array.length; i < len; i++) {
                      copy[i * 2] = width / stepLength * i;
                      copy[i * 2 + 1] = Math.max(height - array[i] * height / this.samplerFramStep, 0);
                  }
                  this._sp.graphics.drawLines(0, 0, copy, fillColor, 1);
                  break;
              case 2:
                  let widthStep = width / stepLength;
                  for (let i = 0, len = array.length; i < len; i++) {
                      this._sp.graphics.drawRect(width / stepLength * i, height, widthStep, -Math.min(array[i] * height, height), fillColor);
                  }
          }
      }
      update() {
          let currentFrame = Laya.Stat.loopCount;
          let nodelenth = ((currentFrame - this._startFram) / this.samplerFramStep) | 0;
          if (!nodelenth) {
              this._runtimeNode = PerforManceNode.create(this._pathCount);
              this._runtimeNode.nodeDelty[this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_STARTTIME)] = performance.now();
              return;
          }
          if (nodelenth != this._nodeList.length) {
              for (let i in this._memoryDataMap) {
                  this._runtimeNode.setMemory(this.getNodePathIndex(i), this._memoryDataMap[i]);
              }
              if (this._runtimeNode) {
                  this._runtimeNode.nodeDelty[this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_DELTYTIME)] = performance.now() - this._runtimeNode.nodeDelty[this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_STARTTIME)];
                  this.exportFrontNode(this._runtimeNode, this._runtimeShowPathIndex);
                  ProfileHelper.sendFramData(this._runtimeNode);
              }
              this._runtimeNode = PerforManceNode.create(this._pathCount);
              this._runtimeNode.nodeDelty[this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_STARTTIME)] = performance.now();
              this._nodeList.push(this._runtimeNode);
          }
      }
      static showMemoryData(memoryPath) {
      }
      static showFunSampleGroup(groupPath) {
      }
      showFunSampleFun(samplePath) {
          this.runtimeShowPath = samplePath;
      }
  }
  PerformanceDataTool.VERSION = "PERFORMANCEDATA:01";
  PerformanceDataTool.instance = new PerformanceDataTool();
  PerformanceDataTool.PERFORMANCE_DELTYTIME = "deltyTime";
  PerformanceDataTool.PERFORMANCE_STARTTIME = "startTime";
  PerformanceDataTool.PERFORMANCE_LAYA = "Laya";
  PerformanceDataTool.PERFORMANCE_LAYA_3D = "Laya/3D";
  PerformanceDataTool.PERFORMANCE_LAYA_2D = "Laya/2D";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_PRERENDER = "Laya/3D/PreRender";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_UPDATESCRIPT = "Laya/3D/UpdateScript";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS = "Laya/3D/Physics";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_SIMULATE = "Laya/3D/Physics/simulate";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_CHARACTORCOLLISION = "Laya/3D/Physics/updataCharacters&Collisions";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_EVENTSCRIPTS = "Laya/3D/Physics/eventScripts";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER = "Laya/3D/Render";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_SHADOWMAP = "Laya/3D/Render/ShadowMap";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_CLUSTER = "Laya/3D/Render/Cluster";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_CULLING = "Laya/3D/Render/Culling";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERDEPTHMDOE = "Laya/3D/Render/RenderDepthMode";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDEROPAQUE = "Laya/3D/Render/RenderOpaque";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERCOMMANDBUFFER = "Laya/3D/Render/RenderCommandBuffer";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERTRANSPARENT = "Laya/3D/Render/RenderTransparent";
  PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_POSTPROCESS = "Laya/3D/Render/PostProcess";
  PerformanceDataTool._surpport = false;
  PerformanceDataTool.DrawWidth = 250;
  PerformanceDataTool.DrawHeight = 250;
  PerformanceDataTool.StepLength = 250;
  PerformanceDataTool.stepLengthArrayMap = new Array();
  class PerforManceNode {
      constructor() {
          this.inPool = false;
          this.nodeNum = 0;
          this.nodeStart = [];
          this.nodeDelty = [];
          this.applyCount = 0;
      }
      static create(nodeNum) {
          let perNode;
          perNode = this._pool.length > 0 ? this._pool.pop() : new PerforManceNode();
          perNode.resetData(nodeNum);
          perNode.inPool = false;
          return perNode;
      }
      static revert(node) {
          node.inPool = true;
          this._pool.push(node);
          node.clearData();
      }
      clearData() {
          this.nodeStart.length = 0;
          this.nodeDelty.length = 0;
      }
      resetData(nodeNum) {
          this.nodeNum = nodeNum;
          this.nodeStart.length = nodeNum;
          this.nodeDelty.length = nodeNum;
      }
      getFunStart(index) {
          this.applyCount++;
          this.nodeStart[index] = performance.now();
      }
      getFunEnd(index) {
          if (this.nodeDelty[index])
              this.nodeDelty[index] += (this.nodeStart[index] != 0) ? (performance.now() - this.nodeStart[index]) : 0;
          else {
              this.nodeDelty[index] = (this.nodeStart[index] != 0) ? (performance.now() - this.nodeStart[index]) : 0;
              this.nodeNum = this.nodeDelty.length;
          }
          return this.nodeDelty[index];
      }
      setMemory(index, value) {
          this.nodeDelty[index] = value;
      }
      getPathData(index) {
          return this.nodeDelty[index];
      }
  }
  PerforManceNode._pool = [];

  class PerformanceNodeParse {
      static parsePerformanceFile(performance, outData) {
          performance.pos = 0;
          PerformanceNodeParse.performanceData = outData;
          PerformanceNodeParse._readData = performance;
          PerformanceNodeParse.READ_DATA();
          for (let i = 0, n = PerformanceNodeParse._blockStr.length; i < n; i++) {
              var blockName = PerformanceNodeParse._blockStr[i];
              var fn = PerformanceNodeParse["READ_" + blockName];
              if (fn == null)
                  throw new Error("model file err,no this function:" + blockName);
              else {
                  PerformanceNodeParse._readData.pos = PerformanceNodeParse._blockStart[i];
                  fn.call(null);
              }
          }
      }
      static READ_DATA() {
          let data = PerformanceNodeParse._readData;
          let version = data.readUTFString();
          if (version != "PERFORMANCEDATA:01") {
              throw version + "is not standard Version";
          }
          let blocklenth = PerformanceNodeParse._blockStr.length = data.readUint16();
          for (let i = 0; i < blocklenth; i++) {
              PerformanceNodeParse._blockStr[i] = data.readUTFString();
          }
          for (let j = 0; j < blocklenth; j++) {
              PerformanceNodeParse._blockStart[j] = data.readInt32();
              PerformanceNodeParse._blocklength[j] = data.readInt32();
          }
      }
      static READ_DataInfo01() {
          let data = PerformanceNodeParse._readData;
          let performanceData = PerformanceNodeParse.performanceData;
          PerformanceNodeParse._nodeNums = data.readInt32();
          performanceData.samplerFramStep = data.readInt32();
          let pathCount = data.readInt32();
          for (let i = 0; i < pathCount; i++) {
              performanceData.getNodePathIndex(data.readUTFString());
          }
          let memoryPath = data.readInt32();
          for (let j = 0; j < memoryPath; j++) {
              performanceData._memoryDataMap[data.readUTFString()] = 1;
          }
      }
      static READ_Color() {
          let data = PerformanceNodeParse._readData;
          let performanceData = PerformanceNodeParse.performanceData;
          let colorlength = data.readInt32();
          for (let i = 0; i < colorlength; i++)
              performanceData.setPathDataColor(data.readUTFString(), [data.readUint32(), data.readUint32(), data.readUint32(), data.readUint32()]);
      }
      static READ_NodeInfo() {
          let data = PerformanceNodeParse._readData;
          let performanceData = PerformanceNodeParse.performanceData;
          let perNode;
          let length;
          for (let i = 0; i < PerformanceNodeParse._nodeNums; i++) {
              length = data.readInt32();
              perNode = PerforManceNode.create(length);
              for (let l = 0, n = length; l < n; l++)
                  perNode.nodeDelty[l] = data.readFloat32();
              performanceData._nodeList[i] = perNode;
          }
      }
  }
  PerformanceNodeParse._blockStr = [];
  PerformanceNodeParse._blockStart = [];
  PerformanceNodeParse._blocklength = [];
  PerformanceNodeParse.performanceData = new PerformanceDataTool();

  exports.PerforManceNode = PerforManceNode;
  exports.PerformanceDataTool = PerformanceDataTool;
  exports.PerformanceNodeParse = PerformanceNodeParse;

}(window.Laya = window.Laya || {}, Laya));
