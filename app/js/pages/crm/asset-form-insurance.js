class AssetFormInsurance {
  static get $inject() {
    return [
      '$stateParams', '$scope',
      'StateService',
      'ClientKycModel',
    ];
  }

  constructor(
    $stateParams, $scope,
    StateService,
    ClientKycModel
  ) {
    this.clientId = $stateParams.id;
    this.$scope = $scope;
    this.ClientKycModel = ClientKycModel;
    this.StateService = StateService;

    this.setupHooks();

    this.onChangeRetirementAge = this.onChangeP('retirement_age');
    this.onChangeEdu = this.onChangeP('children_education_budget');
    this.onChangeRetireCost = this.onChangeP('annual_cost_after_retirement');
    this.onChangeHealth = this.onChangeP('health_insurance_coverage');
    this.onChangeLift = this.onChangeP('life_insurance_coverage');
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.data = {};
      this.ClientKycModel.getData(this.clientId).then(data => {
        this.data = data;
      });
    });
  }

  onChangeP(prop) {
    return (value) => {
      if (this.data) {
        this.submitError = null;
        this.data[prop] = value;
      }
    };
  }

  next() {
    return this.ClientKycModel.save(this.clientId, this.data)
      .then(() => {
        this.StateService.forward('asset', { id: this.clientId });
      })
      .catch((resp) => {
        const data = resp.data;
        if (data && data.error_code === 'serializer_validation_error') {
          this.submitError = '为保证资产配置分析的有效性，您需要返回填写一项资产信息';
        } else if (data && data.error_code === 'asset_allocation_invalid_assets_input') {
          this.submitError = '为保证资产配置分析的有效性，您至少需填写一项资产信息';
        } else {
          this.submitError = data.error_msg;
        }
      });
  }
}

const options = {
  controller: AssetFormInsurance,
  templateUrl: 'pages/crm/asset-form-insurance.html',
};

export default options;
