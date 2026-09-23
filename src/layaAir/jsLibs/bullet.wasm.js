var WASI_STDOUT_FILENO = 1;
var WASI_ESUCCESS = 0;
var scriptDirectory = "";

if (typeof document !== "undefined") {
  scriptDirectory = document.currentScript && document.currentScript.src ? document.currentScript.src : "";
  if (scriptDirectory)
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
}

if (window.conch && window.layaConchBullet) {
  window.Physics3D = function(initialMemory, interactive) {
    window.conch.setGetWorldTransformFunction(interactive.getWorldTransform);
    window.conch.setSetWorldTransformFunction(interactive.setWorldTransform);
    var conchBullet = window.layaConchBullet;
    conchBullet.then = function(complete) {
      complete();
    };
    window.Physics3D = conchBullet;
    return conchBullet;
  };
} else {
  window.Physics3D = function(initialMemory, interactive) {
    var mem = new Laya.WasmAdapter.Memory({ initial: initialMemory });
    var imports = {
      LayaAirInteractive: interactive,
      wasi_snapshot_preview1: {
        fd_close: function() { return WASI_ESUCCESS; },
        fd_seek: function() { return WASI_ESUCCESS; },
        fd_fdstat_get: function() { return WASI_ESUCCESS; },
        fd_prestat_get: function() { return WASI_ESUCCESS; },
        fd_prestat_dir_name: function() { return WASI_ESUCCESS; },
        fd_write: function(fd, iovs, iovsLen, nwritten) {
          if (fd === WASI_STDOUT_FILENO) {
            var view = new DataView(mem.buffer);
            var bufferPointer = view.getUint32(iovs, true);
            var bufferLength = view.getUint32(iovs + 4, true);
            var bytes = new Uint8Array(mem.buffer, bufferPointer, bufferLength);
            console.log(new TextDecoder().decode(bytes));
            view.setUint32(nwritten, bufferLength, true);
          }
          return WASI_ESUCCESS;
        },
        proc_exit: function() { return WASI_ESUCCESS; },
        path_open: function() { return WASI_ESUCCESS; },
        path_filestat_get: function() { return WASI_ESUCCESS; },
        path_unlink_file: function() { return WASI_ESUCCESS; },
        path_remove_directory: function() { return WASI_ESUCCESS; },
        path_create_directory: function() { return WASI_ESUCCESS; },
        fd_fdstat_set_flags: function() { return WASI_ESUCCESS; },
        fd_read: function() { return WASI_ESUCCESS; },
        clock_time_get: function() { return WASI_ESUCCESS; },
        environ_sizes_get: function() { return WASI_ESUCCESS; },
        environ_get: function() { return WASI_ESUCCESS; },
        __wasm_lpad_context: function() { return WASI_ESUCCESS; }
      },
      env: { memory: mem }
    };

    var promise;
    if (Laya.WasmAdapter.instantiateWasm) {
      promise = Laya.WasmAdapter.instantiateWasm("bullet.wasm", imports);
    } else {
      var locate = Laya.WasmAdapter.locateFile || Laya.WasmAdapter.locateFileDefault;
      promise = fetch(locate("bullet.wasm", scriptDirectory))
        .then(function(response) { return response.arrayBuffer(); })
        .then(function(buffer) { return WebAssembly.instantiate(buffer, imports); });
    }

    return promise.then(function(physics3D) {
      var bt = window.Physics3D = physics3D.instance.exports;
      if (bt.main)
        bt.main();
      return bt;
    });
  };
}
