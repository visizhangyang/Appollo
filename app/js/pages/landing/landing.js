
class LandingCtrl {
  static get $inject() {
    return [
      '$log', '$scope', 'StateService',
      'UserLoginService', 'UserModel',
    ];
  }

  constructor(
    $log, $scope, StateService,
    UserLoginService, UserModel
  ) {
    $log.debug('entering landing page!!!!');
    this.$scope = $scope;
    this.UserModel = UserModel;

    this.StateService = StateService;
    this.UserLoginService = UserLoginService;

    this.setWatcher();
    this.ready = false;
  }

  setWatcher() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.UserModel.onSetupReady()
        .then(() => {
          if (this.UserModel.isLogged()) {
            this.onSuccess();
          } else {
            this.ready = true;
          }
        });
    });
  }

  onLogin() {
    this.UserLoginService.show(this.onSuccess.bind(this));
  }

  onSuccess() {
    this.StateService.replace('tab.crm')
      .then(() => {
        this.ready = true;
      });
  }
}

const options = {
  controller: LandingCtrl,
  templateUrl: 'pages/landing/landing.html',
};

export default options;
