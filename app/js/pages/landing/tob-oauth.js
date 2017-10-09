
class LoginCtrl {
    static get $inject() {
        return [
            '$q', '$log', 'StateService',
            'UserModel', '$stateParams',
        ];
    }

    constructor($q, $log, StateService, UserModel, $stateParams) {
        this.q = $q;
        this.$log = $log;
        this.StateService = StateService;
        this.UserModel = UserModel;
        this.partner = $stateParams.partner;
        this.accessToken = $stateParams.accessToken;
        this.error = null;
        const len = str => str == null ? 0 : str.length;
        if (len(this.partner) > 0 && len(this.accessToken) > 0) {
            this.login();
        } else {
            this.error = '非法请求';
        }
    }


    login() {
        this.UserModel.tobOAuthLogin(this.partner, this.accessToken)
            .then(() => {
                this.goNext();
            }, (error) => {
                this.error = error.getDisplayError();
            });
    }

    goNext() {
        this.StateService.replace('tab.crm');
    }
}

const options = {
    controller: LoginCtrl,
    templateUrl: 'pages/landing/tob-oauth.html',
};

export default options;
