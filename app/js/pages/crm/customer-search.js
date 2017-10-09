const moduleName = 'unicorn.crm.customer-search';
const modalTemplateUrl = 'pages/crm/customer-search.html';

class CustomerSearchService {
  static get $inject() {
    return [
      '$q', '$log', '$rootScope', '$ionicModal',
      'RefresherFactory', 'ClientModel', 'StateService',
    ];
  }

  constructor(
    $q, $log, $rootScope, $ionicModal,
    RefresherFactory, ClientModel, StateService
  ) {
    this.$q = $q;
    this.$log = $log;
    this.$ionicModal = $ionicModal;
    this.ClientModel = ClientModel;
    this.StateService = StateService;

    const scope = $rootScope.$new(true);
    scope.vm = this;
    this.$scope = scope;


    this.reset(true);
    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $rootScope
    );
  }

  open() {
    return this.$q((resolve) => {
      this.$ionicModal.fromTemplateUrl(modalTemplateUrl, {
        animation: 'slide-in-left',
        scope: this.$scope,
      })
        .then((modal) => {
          this.modal = modal;
          modal.show();
          modal.scope.$on(
            '$stateChangeSuccess',
            () => {
              modal.remove();
            }
          );
          resolve(modal);
        });
    });
  }


  cancel() {
    this.reset(true);
    this.modal.remove();
  }

  query() {
    this.refresher.call();
  }

  reset(isSetup) {
    if (isSetup || this.mismatch || this.customerList.length > 0) {
      this.mismatch = false;
      this.customerList = [];
      this.searchQuery = '';
    } else {
      this.cancel();
    }
  }

  refreshFn() {
    if (!this.searchQuery) {
      return this.$q.resolve();
    }

    return this.ClientModel.fetchList({
      search: this.searchQuery,
    })
      .then((data) => {
        this.customerList = data;
        this.mismatch = !!(this.customerList && this.customerList.length === 0);
      });
  }

  forwardDetail(id) {
    this.StateService.forward('customerDetail', { id });
  }

}
angular.module(moduleName, ['ionic'])
  .service('CustomerSearchService', CustomerSearchService);

export default moduleName;
