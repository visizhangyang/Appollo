
class CustomerFilterResultCtrl {
  static get $inject() {
    return [
      '$q', '$log', '$scope', '$ionicModal',
      'StateService', 'ClientModel',
    ];
  }

  constructor(
    $q, $log, $scope, $ionicModal,
    StateService, ClientModel
  ) {
    this.$q = $q;
    this.$log = $log;
    this.$ionicModal = $ionicModal;
    this.StateService = StateService;
    this.ClientModel = ClientModel;

    this.customers = [];

    $scope.$on('$ionicView.beforeEnter', () => {
      this.customers = ClientModel.filters;
    });
  }

  forwardDetail(id) {
    this.StateService.forward('customerDetail', { id });
  }
}


const options = {
  controller: CustomerFilterResultCtrl,
  templateUrl: 'pages/crm/filter-result.html',
};


export default options;
