const moduleName = 'unicorn.products.product-search';
const modalTemplateUrl = 'pages/products/product-search-modal.html';

function ProductSearchModalFactory(
  $q, $rootScope, UserModel, ProductModel,
  UserLoginService, RefresherFactory
) {
  return class SearchModal {
    constructor(modal) {
      this.deferred = $q.defer();
      this.modal = modal;
      UserModel.onSetupReady().then(() => {
        this.setupUser();
      });

      this.modal.scope.vm = this;
      modal.show();
      modal.scope.$on(
        '$stateChangeSuccess',
        () => {
          modal.remove();
        }
      );

      this.searchQuery = '';
      this.mismatch = false;
      this.productList = [];
      this.refresher = new RefresherFactory(
        this.refreshFn.bind(this),
        $rootScope
      );
    }

    cancel() {
      this.modal.remove();
    }

    query() {
      this.refresher.call();
    }

    setupUser() {
      const self = this;

      this.user = {
        logged: UserModel.isLogged(),
        login($event) {
          $event.stopPropagation();
          UserLoginService.show(self.loginCb.bind(self));
        },
      };
    }

    loginCb() {
      this.refresher.call()
        .then(() => {
          this.user.logged = true;
        });
    }

    reset() {
      if (this.mismatch || this.productList.length > 0) {
        this.mismatch = false;
        this.productList = [];
        this.searchQuery = '';
      } else {
        this.cancel();
      }
    }

    refreshFn() {
      if (!this.searchQuery) {
        return $q.resolve();
      }

      return ProductModel.getList({
        q: this.searchQuery,
      })
        .then((resp) => {
          this.productList = resp.data;
          this.mismatch = !!(this.productList && this.productList.length === 0);
        });
    }
  };
}
ProductSearchModalFactory.$inject = [
  '$q', '$rootScope', 'UserModel', 'ProductModel',
  'UserLoginService', 'RefresherFactory',
];

class ProductSearchService {
  static get $inject() {
    return [
      '$q', '$log', '$ionicModal',
      'ProductSearchModal',
    ];
  }

  constructor(
    $q, $log, $ionicModal,
    ProductSearchModal
  ) {
    this.$q = $q;
    this.$log = $log;
    this.$ionicModal = $ionicModal;
    this.ProductSearchModal = ProductSearchModal;
  }

  openSearch() {
    return this.$q((resolve) => {
      this.$ionicModal.fromTemplateUrl(modalTemplateUrl, {
        animation: 'slide-in-left',
      })
        .then((modal) => {
          const searchModal = new this.ProductSearchModal(modal);
          resolve(searchModal);
        });
    });
  }
}
angular.module(moduleName, ['ionic'])
  .factory('ProductSearchModal', ProductSearchModalFactory)
  .service('ProductSearchService', ProductSearchService);

export default moduleName;

