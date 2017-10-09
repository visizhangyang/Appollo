class UserLinkCtrl {
  constructor($q, UserModel, UserLoginService, StateService) {
    this.state = StateService;
    this.loginModal = UserLoginService;
    this.UserModel = UserModel;
    this.$q = $q;
  }

  onClick() {
    if (this.UserModel.isLogged()) {
      this.goNext(true);
    } else {
      this.loginModal.show(this.goNext.bind(this));
    }
  }

  goNext(logged) {
    if (this.linkState) {
      this.state.forward(this.linkState);
    } else if (this.callbackFn) {
      this.callbackFn({ logged });
    }
  }
}
UserLinkCtrl.$inject = ['$q', 'UserModel', 'UserLoginService', 'StateService'];


const UserLinkOptions = {
  template: `
    <div ng-transclude ng-click="$ctrl.onClick()"></div>
  `,
  transclude: true,
  bindings: {
    linkState: '@',
    callbackFn: '&onDone',
  },
  controller: UserLinkCtrl,
};

export default UserLinkOptions;
