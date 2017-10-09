class OrderDetailCtrl {
  static get $inject() {
    return [
      '$log', '$scope', '$stateParams', '$ionicPopup',
      'OrderModel', 'RefresherFactory', 'StateService',
    ];
  }

  constructor(
    $log, $scope, $stateParams, $ionicPopup,
    OrderModel, RefresherFactory, StateService
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.OrderModel = OrderModel;
    this.$ionicPopup = $ionicPopup;
    this.StateService = StateService;

    this.orderId = $stateParams.orderId;
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
    return this.OrderModel.fetchDetail(this.orderId)
      .then((resp) => {
        this.renderBody(resp.data);
        return resp;
      });
  }

  renderBody(orderDetail) {
    this.order = orderDetail;
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
        this.StateService.back('tab.account');
      });
  }

}

const state = {
  name: 'orderDetail',
  options: {
    url: '/account/orders/:orderId',
    controller: OrderDetailCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/account/order-detail.html',
  },
};

export default state;
