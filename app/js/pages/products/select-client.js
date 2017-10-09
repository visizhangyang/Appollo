
class SelectClientCtrl {
  static get $inject() {
    return [
      '$q', '$log', '$scope',
      'ClientModel', 'ProductModel',
      'RefresherFactory', 'StateService',
      'UserModel',
    ];
  }

  constructor(
    $q, $log, $scope,
    ClientModel, ProductModel,
    RefresherFactory, StateService,
    UserModel
  ) {
    this.$q = $q;
    this.$log = $log;
    this.$scope = $scope;
    this.ClientModel = ClientModel;
    this.StateService = StateService;
    this.UserModel = UserModel;
    this.ProductModel = ProductModel;

    this.customerList = [];
    this.searchQuery = null;

    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );

    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      // if not form ...
      if (!this.ProductModel.orderForm) {
        this.StateService.doneTo('tab.crm');
      }
      this.userLogged = this.UserModel.isLogged();
      if (this.userLogged) {
        this.refresher.call();
      } else {
        this.StateService.replace('tab.crm');
      }
    });
  }

  refreshFn() {
    return this.ClientModel.fetchList()
      .then((data) => {
        this.customerList = data;
      });
  }

  select(client) {
    this.ProductModel.orderForm.data.client = client;
    this.StateService.back();
  }

  reset() {
    if (this.searchQuery) {
      this.searchQuery = null;
    } else {
      this.StateService.back();
    }
  }
}

const state = {
  name: 'selectClient',
  options: {
    url: '/product/select-client',
    controller: SelectClientCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/products/select-client.html',
  },
};

export default state;
