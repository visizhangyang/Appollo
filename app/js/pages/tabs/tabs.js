// import HomeCtrl from './tab-home';
import ProductsCtrl from './tab-products';
import AccountCtrl from './tab-account';
import CrmCtrl from './tab-crm';

class TabCtrl {
  static get $inject() {
    return ['$log'];
  }
  constructor($log) {
    this.$log = $log;
  }
}

function tabConfig($stateProvider) {
  $stateProvider
    .state('tab', {
      url: '/tab',
      abstract: true,
      controller: TabCtrl,
      controllerAs: 'vm',
      templateUrl: 'pages/tabs/tabs.html',
    })
    // .state('tab.home', {
    //   url: '/home',
    //   views: {
    //     'tab-home': {
    //       templateUrl: 'pages/tabs/tab-home.html',
    //       controller: HomeCtrl,
    //       controllerAs: 'vm',
    //     },
    //   },
    // })
    .state('tab.products', {
      url: '/products',
      views: {
        'tab-products': {
          templateUrl: 'pages/tabs/tab-products.html',
          controller: ProductsCtrl,
          controllerAs: 'vm',
        },
      },
    })
    // .state('tab.messages', {
    //   url: '/messages',
    //   views: {
    //     'tab-messages': {
    //       templateUrl: 'pages/tabs/tab-messages.html',
    //       controller: MessagesCtrl,
    //       controllerAs: 'vm',
    //     },
    //   },
    // })
    .state('tab.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'pages/tabs/tab-account.html',
          controller: AccountCtrl,
          controllerAs: 'vm',
        },
      },
    })
    .state('tab.crm', {
      url: '/crm',
      views: {
        'tab-crm': {
          templateUrl: 'pages/tabs/tab-crm.html',
          controller: CrmCtrl,
          controllerAs: 'vm',
        },
      },
    });
}
tabConfig.$inject = ['$stateProvider'];


const moduleName = 'unicorn.tabs';
angular.module(moduleName, [])
  .config(tabConfig);

export default moduleName;
