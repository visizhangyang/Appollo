class ResetPasswordCtrl {
  static get $inject() {
    return ['$q', 'UserModel', 'StateService', 'isRelease', 'codeCounterFactory',
      'UserLoginService', 'LoadingService'];
  }

  constructor($q, UserModel, StateService, isRelease, codeCounterFactory,
              UserLoginService, LoadingService) {
    this.$q = $q;
    this.UserModel = UserModel;
    this.StateService = StateService;
    this.isRelease = isRelease;
    this.codeCounterFactory = codeCounterFactory;
    this.UserLoginService = UserLoginService;
    this.LoadingService = LoadingService;

    this.resetData();
  }

  clearError(form) {
    if (!this.form && form) {
      this.form = form;
    }
    this.submitError = null;
  }

  resetData() {
    if (!this.counter) {
      this.counter = this.codeCounterFactory();
    } else {
      this.counter.resetCount();
    }
    if (this.form) {
      this.form.$setPristine();
      this.form.$setUntouched();
      this.form = null;
    }

    this.user = {};
  }

  checkPassword(form) {
    this.clearError(form);
    form.cPassword.$setValidity('pwmatch', this.user.password === this.user.cPassword);
  }

  requestCode($event) {
    $event.preventDefault();
    this.counter.setCount();
    this.clearError();

    return this.UserModel.resetPassword()
      .then(() => {
        if (!this.isRelease) {
          this.user.code = '111111';
          this.user.password = '111111jb';
          this.user.cPassword = '111111jb';
        }
        this.counter.data.requested = true;
      }, (error) => {
        let errorMsg = null;

        if (error.data) {
          if (error.data.error_code === 'phone_verification_send_failed') {
            if (error.resp.status === 429) {
              this.counter.setCount();
              errorMsg = '该手机发送短信过于频繁，请60秒后重试';
            }
          }
        }

        this.submitError = error.getDisplayError(errorMsg);
      });
  }

  resetPassword($event, isValid) {
    if (!isValid) {
      this.submitError = '提交的数据有误';
      return this.$q.resolve();
    }

    $event.preventDefault();
    this.clearError();
    return this.UserModel.resetPassword(this.user.code, this.user.password)
      .then(() => {
        this.resetData();
        this.StateService.forward('tab.account').then(() => {
          this.LoadingService.showToast('密码修改成功。');
        });
      }, (error) => {
        let errorMsg = null;

        if (error.data.error_code === 'serializer_validation_error') {
          const data = error.data;
          if (data.err_fields && data.err_fields.invite_code) {
            errorMsg = '该邀请码不存在';
          } else if (data.err_fields && data.err_fields.password) {
            errorMsg = data.err_fields.password[0];
          }
        }
        this.submitError = error.getDisplayError(errorMsg);
      });
  }
}

const state = {
  name: 'resetPassword',
  options: {
    url: 'account/reset-word',
    controller: ResetPasswordCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/account/reset-password.html',
  },
};

export default state;
