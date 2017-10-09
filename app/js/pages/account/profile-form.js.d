class AccountProfileForm {
  static get $inject() {
    return [
      '$log', '$scope',
      'UserModel', 'StateService', 'isRelease',
    ];
  }
  constructor(
    $log, $scope,
    UserModel, StateService, isRelease
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.UserModel = UserModel;
    this.StateService = StateService;

    this.submitError = null;
    if (isRelease) {
      this.user = {};
    } else {
      this.user = {
        company: 'Micai 投资咨询有限公司',
        email: 'yangbo@micai.asia',
        post_address: '北京市朝阳区三元桥第三置业A座2608',
      };
    }

    this.setHooks();
  }

  setHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.UserModel.fetchDetail()
        .then((resp) => {
          if (resp.data) {
            const user = _.pick(resp.data, [
              'company',
              'email',
              'post_address',
            ]);
            if (user.company || user.email || user.post_address) {
              this.user = user;
            }
          }
        });
    });
  }

  clearError() {
    this.submitError = null;
  }


  postDetail() {
    return this.UserModel.postDetail(
      _.omitBy(this.user, _.isNull)
    )
      .then((resp) => {
        this.StateService.back();
        return resp;
      }, (error) => {
        let errorMsg = null;

        if (error.data) {
          if (error.data.err_fields && error.data.err_fields.email) {
            errorMsg = error.data.err_fields.email[0];
          }
        }

        this.submitError = error.getDisplayError(errorMsg);
      });
  }
}

const state = {
  name: 'accountProfileForm',
  options: {
    url: '/account/profile/form',
    controller: AccountProfileForm,
    controllerAs: 'vm',
    templateUrl: 'pages/account/profile-form.html',
  },
};

export default state;
