class AccountOrdersCtrl {
  static get $inject() {
    return [
      '$log', '$scope', '$ionicPopup',
      'OrderModel', 'RefresherFactory',
    ];
  }

  constructor(
    $log, $scope, $ionicPopup,
    OrderModel, RefresherFactory
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.$ionicPopup = $ionicPopup;
    this.OrderModel = OrderModel;

    this.orderList = [];

    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );
    this.setHooks();
  }

  setHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.refresher.call();
    });
  }

  refreshFn() {
    // get orders
    return this.OrderModel.fetchList()
      .then((resp) => {
        this.renderBody(resp.data);
        return resp;
      });
  }

  renderBody(orderList) {
    this.orderList = orderList;
  }

  onClickCancel(event, id) {
    event.stopPropagation();
    this.$ionicPopup.confirm({
      template: '你确定要取消预约吗',
      buttons: [
        { text: '放弃' },
        {
          text: '确定',
          type: 'button-positive',
          onTap: () => {
            this.cancelOrder(id);
          },
        },
      ],
    });
  }

  cancelOrder(id) {
    this.OrderModel.cancelDetail(id)
      .then(() => {
        this.refresher.call();
      });
  }

  pullRefresh() {
    const cb = () => this.$scope.$broadcast('scroll.refreshComplete');
    this.refresher.call(cb.bind(this));
  }
}

const state = {
  name: 'accountOrders',
  options: {
    url: '/account/orders',
    controller: AccountOrdersCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/account/account-orders.html',
  },
};

export default state;
