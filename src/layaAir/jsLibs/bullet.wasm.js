var WASI_STDOUT_FILENO = 1;
var WASI_ESUCCESS = 0;
function locateFile(path) {
  return scriptDirectory + path;
}
let scriptDirectory = document.currentScript.src;
scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1)

if (window.conch) {
  window.Physics3D = function(initialMemory, interactive) {
    window.conch.setGetWorldTransformFunction(interactive.getWorldTransform);
    window.conch.setSetWorldTransformFunction(interactive.setWorldTransform);
    var conchBullet = window.layaConchBullet;
    conchBullet.then = (complete) => {
      complete();
    };
    window.Physics3D = conchBullet;
    return conchBullet;
  };
  }
  else{
window.Physics3D = function (initialMemory, interactive) {
  var mem;
  return new Promise((resolve) => {
    mem = new WebAssembly.Memory({ initial: initialMemory });
    fetch(locateFile("bullet.wasm")).then((response) => {
      response.arrayBuffer().then((buffer) => {
        WebAssembly.instantiate(buffer, {
          LayaAirInteractive: interactive,
          wasi_snapshot_preview1: {
            fd_close: () => { },
            fd_seek: () => { },
            fd_fdstat_get: (fd, bufPtr) => { },
            fd_prestat_get: () => { },
            fd_prestat_dir_name: (fd, bufPtr) => { },
            fd_write: (fd, iovs, iovsLen, nwritten) => {
              if (fd == 1) {//stdout
                var view = new DataView(mem.buffer);
                var ptr = iovs; //实际iovs是一个数组 [{ptr,len},{ptr,len}...]
                var buf = view.getUint32(ptr, true);
                var bufLen = view.getUint32(ptr + 4, true);
                let u8buff = new Uint8Array(mem.buffer, buf, bufLen);
                let txdec = new TextDecoder();
                let str = txdec.decode(u8buff);
                console.log(str);
                view.setUint32(nwritten, bufLen, true);
              }
              return WASI_ESUCCESS;
            },
            proc_exit: () => { },
            path_open: () => { },
            path_filestat_get: () => { },
            path_unlink_file: () => { },
            path_remove_directory: () => { },
            path_create_directory: () => { },
            fd_fdstat_set_flags: () => { },
            fd_read: () => { },
            clock_time_get: () => { },
            environ_sizes_get: () => { },
            environ_get: () => { },
            __wasm_lpad_context: () => { }
          },
          env: {
            memory: mem,
          }

        }).then((physics3D) => {
          let bt = window.Physics3D = physics3D.instance.exports;
          if (bt.main) {
            bt.main();
          }
          //Laya.addWasmModule('bullet', window.Physics3D, mem);
          resolve();
        });
      });
    });
  });
};
  }