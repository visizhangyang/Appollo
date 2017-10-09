const modalUrl = 'component/user-login.html';

export default class UserLoginService {
  constructor($q, $log, $ionicModal, UserSignUpService, UserModel,
              UserSMSLoginService) {
    this.q = $q;
    this.$log = $log;
    this.modalService = $ionicModal;
    this.signupModal = UserSignUpService;
    this.SMSLoginModal = UserSMSLoginService;
    this.UserModel = UserModel;

    this.resetData();
  }

  resetData() {
    if (this.form) {
      this.form.$setPristine();
      this.form.$setUntouched();
      this.form = null;
    }
    this.user = {};
    this.clearError();
  }

  clearError(form) {
    if (!this.form && form) {
      this.form = form;
    }
    this.submitError = null;
  }

  login($event, isValid) {
    if (!isValid) {
      this.submitError = '提交的数据有误';
      return;
    }
    $event.preventDefault();
    this.clearError();

    this.UserModel.login(this.user)
      .then(() => {
        this.goNext();
      }, (error) => {
        this.submitError = error.getDisplayError();
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

  goSignup() {
    this.signupModal.show(() => {
      this.next();
      this.clean();
    });
  }

  goSMSLogin() {
    this.SMSLoginModal.show(() => {
      this.next();
      this.clean();
    });
  }

  getModal() {
    let promise = null;
    if (this.modal) {
      promise = this.q.resolve(this.modal);
    } else {
      promise = this.createModal();
    }
    return promise;
  }

  createModal() {
    return this.modalService.fromTemplateUrl(modalUrl, {
      animation: 'slide-in-up',
    })
      .then((modal) => {
        this.modal = modal;
        this.modal.scope.vm = this;
        this.modal.scope.$on('$stateChangeSuccess', this.clean.bind(this));
      });
  }

  clean() {
    if (this.modal) {
      this.resetData();
      this.modal.remove();
      this.modal = null;
    }
  }

  back() {
    this.resetData();
    this.modal.hide();
  }
}

UserLoginService.$inject = [
  '$q', '$log',
  '$ionicModal', 'UserSignUpService', 'UserModel', 'UserSMSLoginService',
];
