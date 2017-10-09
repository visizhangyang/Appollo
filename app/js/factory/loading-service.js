
const failedTemplateUrl = 'factory/loading-failed.html';
const toastTemplateUrl = 'factory/loading-toast.html';
const requestingTemplateUrl = 'factory/loading-requesting.html';

function isPromiseLike(obj) {
  return obj && angular.isFunction(obj.then);
}

export default class LoadingService {
  constructor($q, $log, $rootScope, $ionicLoading, $translate) {
    this.$rootScope = $rootScope;
    this.loading = $ionicLoading;
    this.$log = $log;
    this.q = $q;

    this.isRequesting = false;

    this.delayLoading = 1500;
    this.defaultFailedMsg = '网络不给力, 请稍后重试';

    this.failedLoadingScope = this.$rootScope.$new(true);
    this.toastScope = this.$rootScope.$new(true);
    this.requestingScope = this.$rootScope.$new(true);
    $translate('common_request_loading_message').then((res) => {
      this.requestingScope.msg = res;
    });
  }

  setupHook() {
    this.$rootScope.$on('unusable.service', (e, errorCode) => {
      this.$log.debug('LoadingService: on unusable-service', errorCode);
      this.clean();
      let message;
      if (errorCode === 504) {
        message = '服务器超时, 请稍后重试';
      } else if (errorCode === 0) {
        message = this.defaultFailedMsg;
      } else if (errorCode === 500) {
        message = '服务器发生了未知错误, 请稍后重试';
      }
      this.showFailedLoading(message);
    });
    this.$rootScope.$on('unusable.unauth', () => {
      this.$log.debug('LoadingService: on unusable-unauth');
      this.clean();
      this.showFailedLoading('您需要重新登录才能请求该页面');
    });
  }

  clean() {
    this.isRequesting = false;
    this.loading.hide();
  }

  showFailedLoading(msg, duration) {
    if (this.isRequesting) {
      this.$log.warn('LoadingService: intercept failed loading,' +
        ' due to requesting');
      return;
    }

    this.failedLoadingScope.msg = msg || this.defaultFailedMsg;
    this.loading.show({
      templateUrl: failedTemplateUrl,
      duration: duration || this.delayLoading,
      scope: this.failedLoadingScope,
      hideOnStateChange: true,
    });
  }

  showToast(msg) {
    if (this.isRequesting) {
      this.$log.warn('LoadingService: intercept toast loading,' +
        ' due to requesting');
      return;
    }

    this.toastScope.msg = msg;
    this.loading.show({
      templateUrl: toastTemplateUrl,
      duration: this.delayLoading,
      scope: this.toastScope,
      hideOnStateChange: true,
    });
  }

  // If in requesting already, don't show any other kind of loading
  requesting(promiseCall, preventNest) {
    if (preventNest && this.isRequesting) {
      return this.q.reject();
    }
    const promise = promiseCall();
    if (!isPromiseLike(promise)) {
      return this.q.resolve();
    }


    if (!this.isRequesting) {
      this.isRequesting = true;
      this.loading.show({
        templateUrl: requestingTemplateUrl,
        scope: this.requestingScope,
        hideOnStateChange: true,
      });
      promise.finally(() => {
        this.isRequesting = false;
        this.loading.hide();
      });
    } else {
      this.$log.warn('LoadingService: nested requesting, this is bad');
    }
    return promise;
  }
}
LoadingService.$inject = ['$q', '$log', '$rootScope', '$ionicLoading', '$translate'];
