export default class AccountModel {
  static get $inject() {
    return [
      '$log', '$q',
      'ApiService', 'UserModel',
    ];
  }

  constructor(
    $log, $q,
    ApiService, UserModel
  ) {
    this.$log = $log;
    this.$q = $q;
    this.UserModel = UserModel;
    this.userApi = ApiService.authApi.all('user');
    this.errorCodeDict = {
      serializer_validation_error: '提交的数据有误',
      withdraw_amount_overflow: '余额不足',
    };
    this.errorCb = ApiService.errorMsgInterceptor(this.errorCodeDict);

    this.userDetail = {};
    this.transactionList = {};
    this.bankCard = {};
  }

  ready(fn) {
    return this.UserModel.onSetupReady().then(() => fn(this.userApi));
  }

  refreshUserDetail() {
    return this.UserModel.fetchDetail()
      .then((resp) => {
        this.userDetail = resp.data;
        return this.userDetail;
      });
  }
}

