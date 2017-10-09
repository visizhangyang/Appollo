
class AssetFormAllocation {
  static get $inject() {
    return [
      '$stateParams', '$scope', '$ionicPopup',
      'StateService',
      'ClientKycModel', 'ClientModel', 'UserModel',
    ];
  }

  constructor(
    $stateParams, $scope, $ionicPopup,
    StateService,
    ClientKycModel, ClientModel, UserModel
  ) {
    this.clientId = $stateParams.id;

    this.$ionicPopup = $ionicPopup;
    this.$scope = $scope;
    this.ClientKycModel = ClientKycModel;
    this.ClientModel = ClientModel;
    this.UserModel = UserModel;
    this.StateService = StateService;

    this.setupHooks();

    this.onChangeCash = this.onChangeP('cash_asset');
    this.onChangeFixed = this.onChangeP('fixed_income');
    this.onChangeStock = this.onChangeP('stock_asset');
    this.onChangeOthers = this.onChangeP('alternative_asset');

    this.keys = [
      'FIXED_INCOME', 'fixed_income',
      'STOCK', 'stock_asset',
      'ALTERNATIVE', 'alternative_asset',
      'CASH', 'cash_asset',
    ];
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.data = {};
      this.ClientKycModel.getData(this.clientId).then(data => {
        this.data = data;

        this.ClientModel.get(this.clientId)
          .then((resp) => {
            this.level = resp.data.risk_level;
            this.computeTarget();
          });
        this.UserModel.fetchTargets()
          .then((result) => {
            this.targets = result.data;
            this.computeTarget();
          });


      });

    });
  }

  computeTarget() {
    this.sum = _(this.keys).reduce((prev, current) => {
      if (this.data[current]) {
        return prev + this.data[current];
      }
      return prev;
    }, 0);

    if (this.level && this.targets) {
      const target = this.targets[this.level - 1];
      this.allocation = this.getAllocation(target);
    }
  }

  getAllocation(target) {
    return _(this.keys)
      .map((k) => (
        {
          percentage: target[k] ?
            target[k] * 100 :
            this.getPercent(k),
          code: k,
        }
      ))
      .value();
  }

  getPercent(code) {
    if (this.data[code]) {
      return this.data[code] / this.sum * 100;
    }
    return 0;
  }

  triggerSumChange() {
    this.computeTarget();
  }

  onChangeP(prop) {
    return (value) => {
      if (this.data) {
        this.data[prop] = value;
        this.triggerSumChange();
      }
    };
  }

  next(withConfirm) {
    this.ClientKycModel.data = this.data;
    return this.StateService.forward('assetFormInsurance', { id: this.clientId });
  }
}

const options = {
  controller: AssetFormAllocation,
  templateUrl: 'pages/crm/asset-form-allocation.html',
};

export default options;
