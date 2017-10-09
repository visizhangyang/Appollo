export default class ApiService {
  static get $inject() {
    return [
      '$log', '$q', '$rootScope', 'Restangular',
      'SettingsService',
    ];
  }
  constructor(
    $log, $q, $rootScope, Restangular,
    SettingsService
  ) {
    this.$log = $log;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.SettingsService = SettingsService;

    this.baseApi = Restangular.withConfig((RestangularConfigurer) => {
      this.baseConfig(RestangularConfigurer);
    })
      .setErrorInterceptor(this.errorInterceptor.bind(this))
      .addResponseInterceptor(this.responseInterceptor.bind(this));

    // Originally the idea of seperate baseApi with authApi is to
    //   > make it clear that which api need token, which is not
    //   > and only set 401 error handle to those need token
    //   > and I find that sometimes one api could be need or not need
    //   > token at the same time... so it no much difference of base or auth API
    //   > keep it as old code depend on it ...
    this.authApi = this.baseApi.withConfig(() => {});
      // .setErrorInterceptor(this.unAuthErrorInterceptor.bind(this));
  }

  baseConfig(configurer) {
    return configurer.setBaseUrl(this.SettingsService.url())
      .setDefaultHttpFields({
        withCredentials: true,
        timeout: 30000,
      })
      .setFullResponse(true)
      .setRequestSuffix('/');
  }

  responseInterceptor(data, operation) {
    let extractedData = data;
    if (operation === 'getList' && !_.isArray(data) && data.results) {
      extractedData = data.results;
      extractedData.count = data.count;
      extractedData.previous = data.previous;
      extractedData.next = data.next;
    }
    return extractedData;
  }

  errorInterceptor(resp) {
    this.$log.debug('ApiService::errorInterceptor: config', resp.config, resp);

    if (
      resp.status === 504 // backend server done ?
      || resp.status === 0 // connection fails ?
      || resp.status === 502 // bad gateway
      || resp.status === -1 // no network to the server
      || resp.status === 500 // backend internal error
    ) {
      if (resp.status === 500) {
        this.$log.error('ApiService: got 500 error, please look backend server', resp);
      } else {
        // about -1
        // > https://xhr.spec.whatwg.org/#request-error-steps
        // > it might trigger when xhr onerror/onabort
        this.$log.error('ApiService: got connection error, please look backend server', resp);
      }
      this.$rootScope.$broadcast('unusable.service', resp.status);
      return false;
    }

    const interceptResult = this.unAuthErrorInterceptor(resp);
    return interceptResult;
  }

  unAuthErrorInterceptor(resp) {
    // Ideally this should never happens ...
    // cases might be:
    // - backend token database migration corruption
    // - someApi is exposed to window...
    // - in iOS platform, local storage will get clear when device in low memory
    if (resp.status === 401) {
      this.$log.error('ApiService: unAuth user calling authApi,' +
        ' logout the user & redirect it to account');
      this.$rootScope.$broadcast('unusable.unauth');
      return false;
    }
    return true;
  }

  errorMsgInterceptor(errorMsgDict) {
    const self = this;

    function fallbackUnknownError(resp) {
      self.$log.error('APiService::errorMsgInterceptor, encounter unknow error', resp);
      return `服务器发生了未知错误, 错误代码: ${resp.status}`;
    }

    return (resp) => {
      let errorMsg = null;
      let isErrorHandled = false;
      if (resp.status === 413) {
        errorMsg = '请求的内容太大了, 请精简附件如有必要';
      } else if (resp.data) {
        const errorCode = resp.data.error_code;
        errorMsg = errorMsgDict[errorCode];
      }

      if (errorMsg) {
        isErrorHandled = true;
      }

      const getDisplayError = function getDisplayError(customErr) {
        if (customErr) {
          return customErr;
        } else if (errorMsg) {
          return errorMsg;
        }
        return fallbackUnknownError(resp);
      };

      self.$log.debug('errorMsgInterceptor cb', errorMsg);
      return self.$q.reject({
        isErrorHandled,
        getDisplayError,
        data: resp.data,
        resp,
      });
    };
  }
}

