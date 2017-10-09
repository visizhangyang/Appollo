import cordovaPromiseFS from 'cordova-promise-fs';

const moduleName = 'unicorn.factory.filestorage';

class FileStorageService {
  static get $inject() {
    return [
      '$q', '$log',
    ];
  }

  constructor($q, $log) {
    this.$q = $q;
    this.$log = $log;

    this.isCordova = ionic.Platform.isWebView();
    this.fs = this.createFS();
    // FIXME: added an flag to check whether FS is supported ...
  }

  createFS() {
    return cordovaPromiseFS({
      persistent: this.isCordova,
      Promise: this.$q,
    });
  }

  setFileData(key, value) {
    return this.fs.write(key, value);
  }

  getFileData(key) {
    return this.fs.read(key);
  }
}

angular.module(moduleName, [])
  .service('FileStorageService', FileStorageService);

export default moduleName;
