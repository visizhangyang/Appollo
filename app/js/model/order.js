
export default class OrderModel {
  static get $inject() {
    return ['ApiService', 'UserModel'];
  }
  constructor(ApiService, UserModel) {
    this.UserModel = UserModel;
    this.order = ApiService.authApi.all('orders');
  }

  fetchList() {
    return this.UserModel.onSetupReady().then(() => this.order.getList());
  }

  fetchDetail(id) {
    return this.UserModel.onSetupReady().then(() => this.order.one(id).get());
  }

  post(params) {
    return this.UserModel.onSetupReady().then(() => this.order.post(params));
  }

  cancelDetail(id) {
    return this.UserModel.onSetupReady().then(() => (
      this.order.one(`${id}`).customPUT({
        status: 'CANCELED',
      })
    ));
  }
}
