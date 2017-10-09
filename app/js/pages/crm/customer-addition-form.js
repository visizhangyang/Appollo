
class CustomerAdditionFormCtrl {
  static get $inject() {
    return [
      '$q', '$log', '$scope',
      '$ionicHistory',
      'ClientModel', 'StateService',
    ];
  }

  constructor(
    $q, $log, $scope,
    $ionicHistory,
    ClientModle, StateService
  ) {
    this.$q = $q;
    this.$log = $log;
    this.$scope = $scope;
    this.$ionicHistory = $ionicHistory;

    this.ClientModel = ClientModle;
    this.StateService = StateService;
    this.initOptions();

    this.formUtil = ClientModle.additionFormUtil;
    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      if (!this.ClientModel.clientData.name) {
        this.$log.warn('The user skip createForm page to the addition form');
        this.StateService.replace('customerForm');
      }
    });

    this.$scope.$on('$ionicView.beforeLeave', () => {
      this.formUtil.submitError = null;
    });
  }

  goNext($event, isValid) {
    if (!isValid) {
      this.formUtil.submitError = '请填好表单';
      return this.$q.resolve();
    }

    return this.ClientModel.create(this.formUtil.data)
      .then(() => {
        const currentId = this.$ionicHistory.currentHistoryId();
        const histories = this.$ionicHistory.viewHistory().histories;
        const currentHistory = histories && histories[currentId];

        const selectIndex = _.findLastIndex(
          currentHistory.stack,
          (s) => s.stateName === 'selectClient'
        );
        if (selectIndex > -1) {
          const cursor = currentHistory.cursor;
          const backCount = cursor - selectIndex;
          if (backCount && backCount > 0) {
            return this.$ionicHistory.goBack(-backCount);
          }
          this.$log.warn('SelectClient create customer goback abnormal...', currentHistory);
        }
        return this.StateService.doneTo('tab.crm');
      }, (error) => {
        this.formUtil.submitError = error.getDisplayError();
      });
  }

  initOptions() {
    this.statusOptions = this.ClientModel.statusOptions;
    this.sourceOptions = this.ClientModel.sourceOptions;
  }
}

const options = {
  controller: CustomerAdditionFormCtrl,
  templateUrl: 'pages/crm/customer-addition-form.html',
};
export default options;
