
export default class CrmCtrl {
  static get $inject() {
    return [
      '$q', '$log', '$scope',
      'ClientModel', 'RefresherFactory', 'StateService',
      'UserModel', 'UserLoginService', 'CustomerSearchService', 'LoadingService'
    ];
  }

  constructor(
    $q, $log, $scope,
    ClientModel, RefresherFactory, StateService,
    UserModel, UserLoginService, CustomerSearchService, LoadingService
  ) {
    this.$q = $q;
    this.$log = $log;
    this.$scope = $scope;
    this.ClientModel = ClientModel;
    this.StateService = StateService;
    this.UserModel = UserModel;
    this.UserLoginService = UserLoginService;
    this.CustomerSearchService = CustomerSearchService;
    this.LoadingService = LoadingService;

    this.query = {};
    this.customerList = [];
    this.tab = 'all';

    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );

    this.setupHooks();
  }

  search() {
    this.CustomerSearchService.open();
  }

  filter() {
    this.StateService.forward('customer-filter');
  }

  forwardDetail(id) {
    this.StateService.forward('customerDetail', { id });
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.StateService.selectTab('tab.crm');
      this.UserModel.onSetupReady().then(() => {
        this.userLogged = this.UserModel.isLogged();
        if (this.userLogged) {
          this.LoadingService.requesting(() => { return this.refresher.call(); });
        }
      });
    });
  }

  loginUser() {
    this.UserLoginService.show(() => {
      this.userLogged = this.UserModel.isLogged();
      this.refresher.call();
    });
  }


  refreshFn() {
    const promiseList = [];
    if (!this.forgottenCount || this.tab === 'forgotten') {
      promiseList.push(
        this.ClientModel.fetchList({ forgotten: true })
          .then((data) => {
            if (this.tab === 'forgotten') {
              this.customerList = data;
            }
            this.forgottenCount = data.length;
          })
      );
    }

    if (this.tab !== 'forgotten' || !this.importantCount) {
      promiseList.push(
        this.ClientModel.fetchList(this.query)
          .then((data) => {
            if (this.tab !== 'forgotten') {
              this.customerList = data;
            }
            if (this.tab === 'all') {
              this.importantCount = _.filter(
                this.customerList,
                (item) => item.client_level === 'IMPORTANT'
              ).length;
              this.totalCount = this.customerList.length;
            }
          })
      );
    }

    return this.$q.all(promiseList);
  }

  switchList(tab) {
    const query = { };
    this.tab = tab;
    if (tab === 'forgotten') {
      query.forgotten = true;
    } else if (tab === 'important') {
      query.client_level = 'IMPORTANT';
    }
    this.query = query;
    return this.refresher.call();
  }
}
