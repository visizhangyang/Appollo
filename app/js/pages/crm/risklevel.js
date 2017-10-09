import moment from 'moment';

const orderDict = [
  'FIXED_INCOME',
  'STOCK',
  'ALTERNATIVE',
  'CASH',
];

class RisklevelCtrl {
  static get $inject() {
    return [
      '$log', '$stateParams', '$scope',
      'ClientModel', 'UserModel', 'StateService', 'ClientKycModel'
    ];
  }

  constructor(
    $log, $stateParams, $scope,
    ClientModel, UserModel, StateService, ClientKycModel
  ) {
    this.$log = $log;
    this.clientId = $stateParams.id;
    if (!this.clientId) {
      StateService.back('tab.crm');
      return;
    }
    this.$scope = $scope;
    this.ClientModel = ClientModel;
    this.ClientKycModel = ClientKycModel;

    this.risklevel = null;
    this.toAssetForm = true;

    UserModel.fetchTargets()
      .then((result) => {
        this.targets = result.data;
        if (!_.isUndefined(this.risklevel)) {
          const target = this.targets[this.risklevel - 1];
          this.allocation = this.getAllocation(target);
        }
      });
    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.ClientModel.get(this.clientId)
        .then((resp) => {
          this.risklevel = resp.data.risk_level;
          this.risk_level_ts = moment(resp.data.risk_level_ts).format('YYYY年MM月DD日');
          if (!_.isUndefined(this.targets)) {
            const target = this.targets[this.risklevel - 1];
            this.allocation = this.getAllocation(target);
          }
        });
    });
  }

  getAllocation(target) {
    return _(target).keys()
      .map((k) => (
        {
          percentage: target[k] * 100,
          code: k,
        }
      ))
      .sortBy((k) => orderDict.indexOf(k.code))
      .value();
  }
}

const options = {
  controller: RisklevelCtrl,
  templateUrl: 'pages/crm/risklevel.html',
};

export default options;
