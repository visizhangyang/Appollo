const OPTION_STATE = {
    SELECT_PERIOD: 1,
    SELECT_RISK_LEVEL: 2,
}

const TABS = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
}

function TransRiskLevelLabel(risk_level) {
    if (risk_level <= 20)
        return '保守型'
    if (risk_level <= 40)
        return '稳健型'
    if (risk_level <= 60)
        return '平衡型'
    if (risk_level <= 80)
        return '积极型'
    else
        return '激进型'
}

class KYCCtrl {
    static get $inject() {
        return [
            '$log', '$stateParams', '$scope', '$ionicPopup',
            'StateService', 'ClientModel',
            'KYCModel', 'TranslateFactory', '$timeout', 'CommonService'
        ];
    }

    constructor(
        $log, $stateParams, $scope, $ionicPopup,
        StateService, ClientModel,
        KYCModel, TranslateFactory, $timeout, CommonService
    ) {
        this.moneyUnit = CommonService.getMoneyUnit();
        this.$log = $log;
        this.clientId = $stateParams.clientId;
        this.$scope = $scope;
        this.$ionicPopup = $ionicPopup;
        if (!this.clientId) {
            StateService.back('tab.crm');
            return;
        }
        this.ClientModel = ClientModel;
        this.KYCModel = KYCModel;
        this.StateService = StateService;
        this.$timeout = $timeout;
        this.CommonService = CommonService;

        var translateFactory = new TranslateFactory();
        this.$tanslate = translateFactory.get$translate();
        this.language = this.$tanslate.preferredLanguage();

        this.displayPlanningInvest = null;

        this.setupHooks();
        // 收入与负债
        this.onChangeIncome = this.onChangeP('annual_income');
        this.onChangeMortgagePayment = this.onChangeP('annual_mortgage_payment');
        this.onChangeSchoolFees = this.onChangeP('school_fees');
        this.onChangeExpenditure = this.onChangeP('annual_expenditure');
        this.onChangeSpecialPurchases = this.onChangeP('special_purchases');
        // 已有资产配置
        this.onChangeCash = this.onChangeP('cash_asset');
        this.onChangeFixed = this.onChangeP('fixed_income');
        this.onChangeStock = this.onChangeP('stock_asset');
        this.onChangeOthers = this.onChangeP('alternative_asset');
        // 保险保障
        this.onChangeRetirementAge = this.onChangeP('retirement_age');
        this.onChangeRetireCost = this.onChangeP('annual_cost_after_retirement');
        this.onChangeHealth = this.onChangeP('health_insurance_coverage');
        this.onChangeLift = this.onChangeP('life_insurance_coverage');

    }

    setupHooks() {
        let oneYearText = this.$tanslate.instant('common_period_one_year');
        let threeYearsText = this.$tanslate.instant('common_period_three_years');
        let fiveYearsText = this.$tanslate.instant('common_period_five_years');
        this.period_list = [{ value: 'ONE_YEAR', name: oneYearText }, { value: 'THREE_YEARS', name: threeYearsText }, { value: 'FIVE_YEARS', name: fiveYearsText }];
        this.period_current = this.period_list[0];
        this.option_state = OPTION_STATE.SELECT_RISK_LEVEL;
        this.current_tab = TABS.ONE;
        this.data = null;
        this.client = null;
        this.allocation = null;


        this.$scope.$on('$ionicView.beforeEnter', () => {
            this.KYCModel.getData(this.clientId)
                .then(({ data }) => {
                    this.data = data;
                    this.displayPlanningInvest = this.data.planning_invest / this.moneyUnit;
                    this.allocation = this.KYCModel.getAssetAllocation();
                });

            this.ClientModel.get(this.clientId).then((res) => {
                this.client = res.data;
            })
        });

        this.annualIncomeLabel = this.$tanslate.instant('kyc_annual_income');
        this.annualMortgagePaymentLabel = this.$tanslate.instant('kyc_annual_mortgage_payment');
        this.schoolFeesLabel = this.$tanslate.instant('kyc_school_fees');
        this.annualExpenditureLabel = this.$tanslate.instant('kyc_annual_expenditure');
        this.specialPurchasesLabel = this.$tanslate.instant('kyc_special_purchases');

        this.fixedIncomeAssetLabel = this.$tanslate.instant('kyc_fixed_income_asset_label');
        this.fixedIncomeAssetNote = this.$tanslate.instant('kyc_fixed_income_asset_note');
        this.equityAssetLabel = this.$tanslate.instant('kyc_equity_asset_label');
        this.equityAssetNote = this.$tanslate.instant('kyc_equity_asset_note');
        this.alternativesAssetLabel = this.$tanslate.instant('kyc_alternatives_asset_label');
        this.alternativesAssetNote = this.$tanslate.instant('kyc_alternatives_asset_note');
        this.cashAssetLabel = this.$tanslate.instant('kyc_cash_asset_label');
        this.cashAssetNote = this.$tanslate.instant('kyc_cash_asset_note');

        this.retirementAgeLabel = this.$tanslate.instant('kyc_retirement_age');
        this.retirementAnnualCostLabel = this.$tanslate.instant('kyc_retirement_annual_cost');
        this.healthInsuranceLabel = this.$tanslate.instant('kyc_health_insurance');
        this.wholeLifeInsuranceLabel = this.$tanslate.instant('kyc_whole_life_insurance');
    }

    changeInvestment(isIncrease) {
        const increase = isIncrease ? 1 : -1;
        const value = parseFloat((+this.displayPlanningInvest + increase).toFixed(2));
        if (value >= 1) this.displayPlanningInvest = value;
        else if (!isIncrease && this.displayPlanningInvest >= 1) this.displayPlanningInvest = 0.1;
    }

    changeOptionState(value) {
        this.option_state = this.option_state == value ? null : value
    }



    selectPeriod(item) {
        this.period_current = item;
        this.data['risk_investment_age'] = item.value;
        this.option_state = null

    }

    changeTab(v) {
        this.current_tab = v;
    }

    onChangeP(prop) {
        return (value) => {
            if (this.data == null || this.data[prop] == value) return;
            this.data[prop] = value;
            if (prop == 'cash_asset' || prop == 'fixed_income' || prop == 'stock_asset' || prop == 'alternative_asset') {
                this.allocation = this.KYCModel.getAssetAllocation();
            }
            // console.log(valuae);
        };
    }


    handleClick(para) {
        return this.check().then(this.save.bind(this)).then(() => {
            if(para){
                this.StateService.forward('proposal', { id: this.clientId });
            }
        }).catch((err) => {
            console.error('KYC保存失败', err)
        })
    }

    examination() {
        return this.check().then(this.save.bind(this)).then(() => {
            this.StateService.forward('asset-summary', { clientId: this.clientId });
        }).catch((err) => {
            console.error('KYC保存失败', err)
        })
    }

    check() {
        if (this.displayPlanningInvest * this.moneyUnit < 300 * 10 * 1000) {
            return new Promise((resolve, reject) => {
                this.$ionicPopup.confirm({
                    template: this.$tanslate.instant('kyc_less_than_min_investment'),
                    buttons: [
                        { text: this.$tanslate.instant('common_button_cancel'), onTap: () => reject('取消保存'), },
                        {
                            text: this.$tanslate.instant('common_button_ok'),
                            type: 'button-positive',
                            onTap: () => resolve(),
                        },
                    ],
                });
            })

        } else {
            return Promise.resolve()
        }
    }

    save() {
        this.data.planning_invest = this.displayPlanningInvest * this.moneyUnit;
        return this.KYCModel.save(this.clientId, this.data)
            .catch((resp) => {
                const data = resp.data;
                if (data && data.error_code === 'serializer_validation_error') {
                    this.submitError = '保存失败，请联系管理员';
                } else if (data && data.error_code === 'asset_allocation_invalid_assets_input') {
                    this.submitError = '保存失败，请联系管理员';
                } else {
                    this.submitError = data.error_msg;
                }
            });
    }

    planningInvestChange() {
      this.$timeout(() => {
        this.displayPlanningInvest = this.CommonService.roundMoney(this.displayPlanningInvest);
      }, 500);
    }
}

const options = {
    controller: KYCCtrl,
    templateUrl: 'pages/crm/kyc.html',
};

export default options;
