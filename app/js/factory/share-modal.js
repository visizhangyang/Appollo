const wechatReg = /MicroMessenger/i;

export default class ShareModal {
  static get $inject() {
    return ['$rootScope', '$window', '$ionicLoading'];
  }

  constructor($rootScope, $window, $ionicLoading) {
    const ua = $window.navigator.userAgent.toLowerCase();
    this.isWechatView = wechatReg.test(ua);

    this.loading = $ionicLoading;
    this.scope = $rootScope.$new(true);
    this.scope.hide = this.hide.bind(this);
  }

  show() {
    this.loading.show({
      templateUrl: 'factory/share-modal.html',
      hideOnStateChange: true,
      scope: this.scope,
    });
  }

  hide() {
    this.loading.hide();
  }
}
