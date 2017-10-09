
class LoginCtrl {
    static get $inject() {
        return [
            '$q', '$log', 'StateService',
            '$ionicModal', 'UserSignUpService', 'UserModel', 'UserSMSLoginService',
        ];
    }

    constructor($q, $log, StateService,
        $ionicModal, UserSignUpService, UserModel,
        UserSMSLoginService) {
        this.q = $q;
        this.$log = $log;
        this.StateService = StateService;
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
        this.StateService.replace('tab.crm');
    }


    goSignup() {
        this.signupModal.show(() => {
            this.next();
        });
    }

    goSMSLogin() {
        this.SMSLoginModal.show(() => {
            this.next();
        });
    }
}

const options = {
    controller: LoginCtrl,
    templateUrl: 'pages/landing/login.html',
};

export default options;
