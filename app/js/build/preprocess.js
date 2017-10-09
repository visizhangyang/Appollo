
const moduleName = 'unicorn.preprocess';

class SettingsService {
  static get $inject() {
    return [
      '$location',
    ];
  }
  constructor($location) {
    this.$location = $location;

    const isWebView = ionic.Platform.isWebView();
    this.API_BASE_URL = 'undefined';

    // if in cordova, get path from settings
    if (this.API_BASE_URL && isWebView) {
      //this.baseURL = this.API_BASE_URL.replace(/\/s/, '');
      this.baseURL = this.API_BASE_URL.replace(/\/$/, '');
    } else {
      this.baseURL = this.fallbackPath();
    }
  }

  fallbackPath() {
    const port = this.$location.port();
    const protocol = this.$location.protocol();
    const host = this.$location.host();
    const portPart = port ? `:${port}` : '';

    return `${protocol}://${host}${portPart}`;
  }

  url() {
    return `${this.baseURL}/api/`;
  }

}

angular.module(moduleName, [])
  .constant('isRelease', 'false' === 'true')
  .constant('ravenToken', 'undefined')
  .constant('sentryRelease', '274e95575f442ec1633f54427e9b22256c7cd8a0')
  .service('SettingsService', SettingsService);
