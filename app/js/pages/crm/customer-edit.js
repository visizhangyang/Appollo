
class CustomerEditCtrl {
  static get $inject() {
    return [
      '$q', '$log', '$stateParams', '$scope',
      'FormFactory', 'StateService', 'ClientModel', 'TranslateFactory'
    ];
  }

  constructor(
    $q, $log, $stateParams, $scope,
    FormFactory, StateService, ClientModel, TranslateFactory
  ) {
    this.$q = $q;
    this.$log = $log;
    this.$scope = $scope;
    this.clientId = $stateParams.id;

    this.StateService = StateService;
    this.ClientModel = ClientModel;

    var translateFactory = new TranslateFactory();
    this.$translate = translateFactory.get$translate();

    this.statusOptions = ClientModel.statusOptions;
    this.sourceOptions = ClientModel.sourceOptions;

    this.formUtil = new FormFactory({});
    this.setHooks();
  }

  setHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.ClientModel.get(this.clientId)
        .then((resp) => {
          const data = _.omit(resp.data, ['birthday', 'client_level']);
          data.birthday = new Date(resp.data.birthday);
          data.important = resp.data.client_level === 'IMPORTANT';
          this.formUtil.data = data;
        }, () => {
          this.StateService.back('tab.crm');
        });
    });
  }

  goNext($event, isValid) {
    if (!isValid) {
      this.formUtil.submitError = '请填好表单';
      return this.$q.resolve();
    }

    return this.ClientModel.update(this.clientId, this.formUtil.data)
      .then(() => this.StateService.back('tab.crm'), (error) => {
        this.formUtil.submitError = error.getDisplayError();
      });
  }
}

const options = {
  controller: CustomerEditCtrl,
  templateUrl: 'pages/crm/customer-edit.html',
};
export default options;
