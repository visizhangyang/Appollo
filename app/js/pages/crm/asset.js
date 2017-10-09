class AssetCtrl {
  static get $inject() {
    return [
      '$log', '$stateParams', '$scope',
      'StateService',
      'ClientModel',
    ];
  }

  constructor(
    $log, $stateParams, $scope,
    StateService,
    ClientModel
  ) {
    this.$log = $log;
    this.clientId = $stateParams.id;
    this.$scope = $scope;
    if (!this.clientId) {
      StateService.back('tab.crm');
      return;
    }

    this.ClientModel = ClientModel;
    this.StateService = StateService;

    this.hasNext = true;

    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.ClientModel.fetchAsset(this.clientId)
        .then((resp) => {
          this.report = resp.data.report;
          this.healthy_status = this.report.healthy_status;
          this.analysis = this.report.analysis;
        });
    });
  }

}

const options = {
  controller: AssetCtrl,
  templateUrl: 'pages/crm/asset.html',
};

export default options;
