const ASSETS_CLASS = {
  ALTERNATIVE: '另类投资',
  STOCK: '股票类',
  FIXED_INCOME: '固收类',
  CASH: '现金类',
};

export default class ProductsCtrl {
  static get $inject() {
    return [
      '$q', '$scope', '$rootScope', '$ionicScrollDelegate',
      'ProductModel', 'UserLoginService', 'StateService',
      'RefresherFactory', 'ProductSearchService', 'LoadingService', 'TranslateFactory'
    ];
  }

  constructor(
    $q, $scope, $rootScope, $ionicScrollDelegate,
    ProductModel, UserLoginService, StateService,
    RefresherFactory, ProductSearchService, LoadingService, TranslateFactory
  ) {
    this.$q = $q;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$ionicScrollDelegate = $ionicScrollDelegate;
    this.ProductModel = ProductModel;
    this.UserModel = UserLoginService.UserModel;
    this.UserLoginService = UserLoginService;
    this.StateService = StateService;
    this.ProductSearchService = ProductSearchService;
    this.LoadingService = LoadingService;

    var translateFactory = new TranslateFactory();
    this.$tanslate = translateFactory.get$translate();
    this.language = this.$tanslate.preferredLanguage();

    // this.refresher = new RefresherFactory(
    //   this.loadProducts.bind(this),
    //   $scope
    // );

    this.tabs = [
      { asset: 'FIXED_INCOME', count: 0 },
      { asset: 'STOCK', count: 0 },
      { asset: 'ALTERNATIVE', count: 0 },
      { asset: 'CASH', count: 0 },
    ];
    this.currentTab = this.tabs[0];

    // this.setupUser();
    this.setupHooks();

  }

  // filterList() {
  //   this.LoadingService.requesting(this.doFilterList.bind(this));
  // }

  // doFilterList() {
  //   return this.refresher.call()
  //     .then(() => {
  //       // scroll to the topmost
  //       this.$ionicScrollDelegate.scrollTop();
  //     });
  // }

  setupHooks() {

    this.loadProducts();

    this.$scope.$on('$ionicView.beforeEnter', () => {
      // this.StateService.selectTab('tab.products');
      // this.filterList();
    });
    this.$rootScope.$on('searchProducts', () => {
      this.showSearch();
    });
  }

  // setupUser() {
  //   const self = this;

  //   this.user = {
  //     logged: this.UserModel.isLogged(),
  //     login($event) {
  //       $event.stopPropagation();
  //       self.UserLoginService.show(self.loginCb.bind(self));
  //     },
  //   };
  // }

  // loginCb() {
  //   this.refresher.call()
  //     .then(() => {
  //       this.user.logged = true;
  //     });
  // }

  showProducts(productList) {
    this.productList = productList || [];
    for (let tab of this.tabs) {
      tab.count = _.sumBy(this.productList, p => p.asset_class === tab.asset);
    }
    this.showTab(this.currentTab);
  }

  showTab(tab) {
    this.currentTab = tab;
    return this.$q.resolve().then(() => {
      this.$ionicScrollDelegate.scrollTop();
      this.currentProductList = _.filter(this.productList, p => p.asset_class === tab.asset);
    });
  }

  loadProducts() {
    // this.user.logged = this.UserModel.isLogged();
    return this.ProductModel.getList({ self_company: true })
      .then((resp) => {
        this.showProducts(resp.data);
        return resp;
      });
  }

  // pullRefresh() {
  //   const cb = () => this.$scope.$broadcast('scroll.refreshComplete');
  //   this.refresher.call(cb.bind(this));
  // }


  // loadMore() {
  //   if (!this.productList.next) {
  //     return;
  //   }
  //   const nextMatch = this.productList.next.match(/page=(\d+)/);
  //   if (!nextMatch || !nextMatch[1]) {
  //     return;
  //   }
  //   const nextPage = nextMatch[1];
  //   const payload = _.assign(
  //     {},
  //     { page: nextPage, self_company: true },
  //     this.filters.query
  //   );

  //   this.ProductModel.getList(payload)
  //     .then((resp) => {
  //       this.productList = this.productList.concat(resp.data);
  //       this.productList.next = resp.data.next;
  //       this.$scope.$broadcast('scroll.infiniteScrollComplete');
  //     });
  // }

  showSearch() {
    this.ProductSearchService.openSearch();
  }
}
