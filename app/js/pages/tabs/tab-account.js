
export default class AccountCtrl {
  static get $inject() {
    return [
      '$q', '$log', '$scope',
      'UserModel', 'StateService', 'UserLoginService', 'LoadingService',
      'AccountModel', 'RefresherFactory',
    ];
  }
  constructor(
    $q, $log, $scope,
    UserModel, StateService, UserLoginService, LoadingService,
    AccountModel, RefresherFactory
  ) {
    this.$q = $q;
    this.$log = $log;
    this.$scope = $scope;
    this.UserModel = UserModel;
    this.StateService = StateService;
    this.UserLoginService = UserLoginService;
    this.LoadingService = LoadingService;
    this.AccountModel = AccountModel;
    this.isLogged = false;

    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );

    this.user = {};

    this.setWatcher();
  }

  setWatcher() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.StateService.selectTab('tab.account');
      this.LoadingService.requesting(() => { return this.refresher.call() });
    });
  }

  refreshFn() {
    this.isLogged = this.UserModel.isLogged();
    if (this.isLogged) {
      return this.AccountModel.refreshUserDetail()
        .then((userDetail) => {
          this.renderBody(userDetail);
        });
    }
    return this.$q.resolve();
  }

  renderBody(user) {
    this.nameCardApproved = false;
    this.showCardText = false;
    if (this.isLogged) {
      this.user = user;
      if (!user.name_card) {
        this.showCardText = '（认证身份，更多特权）';
      } else if (user.name_card.status === 'AUDITING') {
        this.showCardText = '（审核中）';
      } else if (user.name_card.status === 'APPROVED') {
        this.nameCardApproved = true;
      } else if (user.name_card.status === 'REJECTED') {
        this.showCardText = '（认证未通过，请重新上传名片）';
      }
    }
  }

  onClickUserInfo() {
    if (!this.isLogged) {
      this.UserLoginService.show(this.refreshFn.bind(this));
    } else {
      this.StateService.forward('accountProfile');
    }
  }

  onClickUpload(logged) {
    // if user is already logged before click ..
    if (logged) {
      if (!this.refresher.loaded) {
        return null;
      }
      const verified = this.user.name_card && this.user.name_card.status === 'APPROVED';
      if (verified) {
        return this.StateService.forward('productNew', { next: 'accountProducts' });
      }
    }
    return this.StateService.forward('accountProfile')
      .then(() => {
        this.LoadingService.showFailedLoading('您需要验证名片成功后, 才能上传产品');
      });
  }

}

