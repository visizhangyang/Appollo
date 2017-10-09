const allowedState = ['accountProducts'];

class ProductNewDoneCtrl {
  constructor($stateParams, StateService) {
    this.StateService = StateService;
    this.next = $stateParams.next;
  }

  done() {
    if (allowedState.indexOf(this.next) > -1) {
      this.StateService.doneTo(this.next);
    } else {
      this.StateService.back();
    }
  }
}
ProductNewDoneCtrl.$inject = ['$stateParams', 'StateService'];

const state = {
  name: 'ProductNewDone',
  options: {
    url: '/new/product/done/:next?',
    controller: ProductNewDoneCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/products/product-new-done.html',
  },
};

export default state;
