const modalUrl = 'component/user-signup.html';

export default class UserSignUpService {
  constructor(
    $q, $log, $ionicModal,
    UserModel, codeCounterFactory, isRelease
  ) {
    this.$q = $q;
    this.$log = $log;
    this.modalService = $ionicModal;
    this.UserModel = UserModel;
    this.codeCounterFactory = codeCounterFactory;
    this.isRelease = isRelease;

    this.resetData();
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
    if (!this.isRelease) {
      this.user = {
        phone: `1800${Math.floor(Math.random() * 10000000)}`,
        invite_code: '111111',
      };
    }
    this.clearError();
  }

  clearError(form) {
    if (!this.form && form) {
      this.form = form;
    }
    this.submitError = null;
  }

  requestCode($event) {
    $event.preventDefault();
    this.counter.setCount();
    this.clearError();

    return this.UserModel.signup(this.user.phone)
      .then(() => {
        if (!this.isRelease) {
          this.user.code = '111111';
          this.user.password = '111111jb';
        }

        this.counter.data.requested = true;
      }, (error) => {
        this.counter.resetCount();
        let errorMsg = null;

        if (error.data) {
          if (error.data.error_code.error_code === 'phone_verification_send_failed') {
            if (error.resp.status === 429) {
              this.counter.setCount();
              errorMsg = '该手机发送短信过于频繁，请60秒后重试';
            } else if (error.data.error_msg.indexOf('INVALID_PHONE') > -1) {
              errorMsg = '手机号不正确';
            }
          }

          if (error.data.err_fields && error.data.err_fields.phone) {
            errorMsg = '未能发送验证码, 手机号码格式不正确';
          }
        }

        this.submitError = error.getDisplayError(errorMsg);
      });
  }

  signup($event, isValid) {
    if (!isValid) {
      this.submitError = '提交的数据有误';
      return this.$q.resolve();
    }
    $event.preventDefault();
    this.clearError();

    return this.UserModel.signup(
      this.user.phone,
      this.user.code,
      this.user.password,
      this.user.invite_code
    )
      .then(() => {
        this.goNext();
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

  goNext() {
    if (this.next) {
      this.next();
    }
    this.clean();
  }

  show(next) {
    this.next = next;
    this.getModal()
      .then(() => {
        this.modal.show();
      });
  }

  getModal() {
    let promise = null;
    if (this.modal) {
      promise = this.$q.resolve(this.modal);
    } else {
      promise = this.createModal();
    }
    return promise;
  }

  createModal() {
    return this.modalService.fromTemplateUrl(modalUrl, {
      animation: 'slide-in-left',
    })
    .then((modal) => {
      this.modal = modal;
      this.modal.scope.vm = this;
      this.modal.scope.$on('$stateChangeSuccess', this.clean.bind(this));
    });
  }

  // FIXME: when clean, make the animation as right-left;
  clean() {
    if (this.modal) {
      this.resetData();
      this.modal.remove();
      this.modal = null;
    }
  }

  back() {
    this.modal.hide();
    this.clean();
  }
}

UserSignUpService.$inject = [
  '$q', '$log', '$ionicModal',
  'UserModel', 'codeCounterFactory', 'isRelease',
];
