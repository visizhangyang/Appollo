export default class DeviceService {
  static get $inject() {
    return [
      '$q', '$log', '$window', '$http', '$localStorage',
      'FileStorageService',
    ];
  }

  constructor(
    $q, $log, $window, $http, $localStorage,
    FileStorageService
  ) {
    this.$log = $log;
    this.window = $window;
    this.local = $localStorage;
    this.$http = $http;
    this.$q = $q;
    this.FileStorageService = FileStorageService;

    this.isCordova = ionic.Platform.isWebView();

    // This might not safe .. perhaps to watching over localstorage ?
    // might be safer to use promise way
    this.token_key = 'devicetoken';
  }

  getToken() {
    if (!this.isCordova) {
      const deferred = this.$q.defer();
      const token = this.local[this.token_key];
      deferred.resolve(token);
      return deferred.promise;
    }

    return this.FileStorageService.getFileData(`fs_${this.token_key}`);
  }

  setToken(token) {
    if (!this.isCordova) {
      const deferred = this.$q.defer();
      this.local[this.token_key] = token;
      deferred.resolve();
      return deferred.promise;
    }
    return this.FileStorageService.setFileData(`fs_${this.token_key}`, token || '');
  }

  getInfo() {
    const info = {
      device_label: this.deviceName(),
    };

    return this.$q((resolve) => {
      this.getDeviceUUID()
        .then((uuid) => {
          info.device_uuid = uuid;
          resolve(info);
        });
    });
  }

  /**
   * Generate UUID
   *
   * @returns {string}
   */
  generateUUID() {
    // Source: http://jsfiddle.net/briguy37/2MVFd/
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
  }

  /**
   * Generate a new UUID for the device
   *
   * @returns {string}
   */
  generateDeviceUUID() {
    let uuid = null;
    if ('device' in this.window && this.window.device.uuid !== undefined) {
      uuid = this.window.device.uuid;
    } else {
      uuid = this.generateUUID();
    }
    return uuid;
  }

  /**
   * Device names are used by the user to identify the linked devices
   */
  deviceName() {
    let name = null;
    if ('device' in this.window
        && this.window.device.name !== undefined
        && this.window.device.name) {
      name = this.window.device.name;
    } else {
      // TODO: find better name for browsers, maybe detect WeChat
      name = this.local.deviceUUID;
    }
    return name;
  }

  getDeviceUUID() {
    const defer = this.$q.defer();
    let dev = this.local.deviceUUID;
    const window = this.window;
    // use objective C' IDFV by default.
    if (dev) {
      defer.resolve(dev);
    } else if (typeof window.plugin !== 'undefined' &&
      typeof window.plugin.deviceIdentifier !== 'undefined' &&
      typeof window.plugin.deviceIdentifier.uniqueIdentifier !== 'undefined') {
      // use plugin to Generate UUID
      window.plugin.deviceIdentifier.uniqueIdentifier(
        (idfvUUID) => {
          this.local.deviceUUID = idfvUUID;
          defer.resolve(idfvUUID);
        }
      );
    } else {
      dev = this.generateDeviceUUID();
      this.local.deviceUUID = dev;
      defer.resolve(dev);
    }
    return defer.promise;
  }
}

