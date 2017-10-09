const ASSET_KEYS = [
  'deposit',
  'money_market_fund',
  'investment_real_estate_valuation',
  'bond',
  'bond_fund',
  'p2p',
  'trust',
  'stock',
  'equity_fund',
  'equity_linked_structured_product',
  'commodity_future',
  'commodity_linked_structured_product',
  'noble_metal',
  'hedge_fund',
  'vc_pe',
  'reit',
  'other_alternative',
  // 'personal_use_real_estate_valuation',
];

class AssetForm {
  static get $inject() {
    return [
      '$log', '$stateParams', '$scope',
      '$ionicPopup', '$ionicScrollDelegate',
      'FormFactory', 'StateService',
      'ClientModel', 'LoadingService',
      'ClientKycModel',
    ];
  }

  constructor(
    $log, $stateParams, $scope,
    $ionicPopup, $ionicScrollDelegate,
    FormFactory, StateService,
    ClientModel, LoadingService,
    ClientKycModel
  ) {
    this.$log = $log;
    this.clientId = $stateParams.id;
    this.clientRisklevel = $stateParams.risklevel;
    this.$scope = $scope;
    this.$ionicPopup = $ionicPopup;
    this.$ionicScrollDelegate = $ionicScrollDelegate;
    this.LoadingService = LoadingService;
    this.ClientKycModel = ClientKycModel;
    if (!this.clientId) {
      StateService.back('tab.crm');
      return;
    }

    this.FormFactory = FormFactory;
    this.ClientModel = ClientModel;
    this.StateService = StateService;

    this.formUtil = new FormFactory({});

    this.setupHooks();

    this.onChangeIncome = this.onChangeP('annual_income');
    this.onChangeExpenditure = this.onChangeP('annual_expenditure');
    this.onChangeLiability = this.onChangeP('liability');
    this.onChangeRepayment = this.onChangeP('yearly_repayment');
    this.onChangePlaningInvest = this.onChangeP('planning_invest');
  }

  onChangeP(prop) {
    return (value) => {
      this.data[prop] = value;
    };
  }

  isValid() {
    return this.data.annual_income > 0
      && this.data.annual_expenditure > 0
      && this.data.planning_invest > 0;
  }

  setupHooks() {

    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.data = {};
      this.ClientKycModel.getData(this.clientId)
        .then((data) => {
          this.data = data;
          this.ClientKycModel.setData(this.clientId, {
            client_risk_level: parseInt(this.clientRisklevel)
          });
        });
    });
  }

  next() {
    if (this.data.planning_invest < 300) {
      this.$ionicPopup.confirm({
        template: '客户计划投资金额小于300万，由于公司产品的起投金额限制，这将会影响资产配置的准确性',
        buttons: [
          { text: '取消' },
          {
            text: '确定',
            type: 'button-positive',
            onTap: this.toNext.bind(this),
          },
        ],
      });
    } else {
      this.toNext();
    }
  }

  toNext() {
    this.ClientKycModel.setData(this.clientId, this.data);
    this.StateService.forward('assetFormAllocation', { id: this.clientId });
  }

  getAssetValues(asset) {
    return _.keys(asset).reduce((prev, currentKey) => {
      let value = prev;
      if (ASSET_KEYS.indexOf(currentKey) > -1) {
        value += asset[currentKey];
      }
      return value;
    }, 0);
  }

  submit(isValid, withConfirm) {
    if (!isValid) {
      this.formUtil.submitError = '请认真填写资产信息';
      return null;
    }
    if (!this.formUtil.data.annual_income > 0 && !this.formUtil.data.annual_expenditure) {
      this.formUtil.submitError = '请填写好年收入与年支出';
      return null;
    }

    const asset = _.omitBy(_.assign({ client_id: this.clientId }, this.formUtil.data), _.isNil);
    if (withConfirm && this.getAssetValues(asset) < 300) {
      this.$ionicPopup.confirm({
        template: '客户可投总资产小于300万，由于公司产品的起投金额限制，这将会影响资产配置的准确性',
        buttons: [
          { text: '取消' },
          {
            text: '确定',
            type: 'button-positive',
            onTap: () => {
              this.submit(isValid, false);
            },
          },
        ],
      });
      return null;
    }
    return this.LoadingService.requesting(this.onSubmit.bind(this), true);
  }

  onSubmit() {
    const asset = _.omitBy(_.assign({ client_id: this.clientId }, this.formUtil.data), _.isNil);

    return this.ClientModel.postAsset(asset)
      .then(() => {
        this.StateService.forward('asset', { id: this.clientId })
          .then(() => {
            this.formUtil.setInitData(this.formUtil.data);
          });
      }, (resp) => {
        const data = resp.data;
        if (data && data.error_code === 'asset_allocation_invalid_assets_input') {
          this.formUtil.submitError = '为保证资产配置分析的有效性，您至少需填写一项资产信息';
        } else {
          this.formUtil.submitError = data.error_msg;
        }

        if (this.formUtil.submitError) {
          this.$ionicScrollDelegate.scrollBottom();
        }
      });
  }
}

const options = {
  controller: AssetForm,
  templateUrl: 'pages/crm/asset-form.html',
};

export default options;
