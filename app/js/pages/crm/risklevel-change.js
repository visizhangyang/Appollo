
class RisklevelChangeCtrl {
  static get $inject() {
    return [
      '$log', '$stateParams', '$scope',
      'ClientModel', 'ClientKycModel', 'UserModel', 'StateService'
    ];
  }

  constructor(
    $log, $stateParams, $scope,
    ClientModel, ClientKycModel, UserModel, StateService
  ) {
    this.$log = $log;
    this.clientId = $stateParams.id;
    this.form = {
      year: 'ONE_YEAR',
      level: 1,
      amount: 1000,
    };

    if (!this.clientId) {
      this.goBack();
      return;
    }
    this.$scope = $scope;
    this.ClientModel = ClientModel;
    this.ClientKycModel = ClientKycModel;
    this.StateService = StateService;

    this.risklevel = null;
    this.periodList = [{ value: 'ONE_YEAR', name: '1年' }, { value: 'THREE_YEARS', name: '3年' }, { value: 'FIVE_YEARS', name: '5年' }];
    this.periodCurrent = this.periodList[0];
    this.setPeriodCurrent();

    UserModel.fetchRiskalyzeSchema()
      .then((result) => {
        this.riskalyze = {
          'ONE_YEAR': result.data.data['1'],
          'THREE_YEARS': result.data.data['3'],
          'FIVE_YEARS': result.data.data['5'],
        };
      });
    this.setupHooks();
  }

  setPeriodCurrent() {
    this.periodList.forEach((period) => {
      if (period.value === this.form.year) {
        this.periodCurrent = period;
      }
    });
  }

  choosePeriod() {
    const state = 'choose-period';
    this.pageCompareState = this.pageCompareState === state ? null : state;

    // should encapsulate in directive in the future
    var baseTop = document.getElementsByClassName('period-input')[0].getBoundingClientRect().top;
    angular.element(document.getElementsByClassName('period-overlay')).css('top', (baseTop + 90) + 'px');
  }

  choosePeriodByValue(value) {
    this.hideCompareOverlay();
    this.form.year = value;
    this.setPeriodCurrent();
  }

  isPageCompareStateChoosePeriod() {
    return this.pageCompareState === 'choose-period';
  }

  hideCompareOverlay() {
    this.pageCompareState = null;
  }

  getWin() {
    if (this.riskalyze) {
      const data = this.riskalyze[this.form.year][this.form.level - 1].win;
      if (this.form.amount) {
        return {
          deltaPct: data[0],
          p: data[1] / 100,
          pXBase: 266,
          pXLen: data[1] / 100 * 120,
          delta: (data[0] / 100) * this.form.amount,
        };
      }
    }
    return {
      deltaPct: 0,
      p: 0,
      delta: 0,
    };
  }

  getLoss() {
    if (this.riskalyze) {
      const data = this.riskalyze[this.form.year][this.form.level - 1].loss;
      if (this.form.amount) {
        return {
          deltaPct: Math.abs(data[0]),
          p: data[1] / 100,
          pXBase: 130,
          pXLen: data[1] / 100 * 120,
          delta: Math.abs((data[0] / 100) * this.form.amount),
        };
      }
    }
    return {
      deltaPct: 0,
      p: 0,
      delta: 0,
    }
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.ClientKycModel.getData(this.clientId)
        .then((data) => {
          this.client = data;
          this.form.level = data.risk_level;
          this.form.amount = data.planning_invest;
          this.form.year = data.risk_investment_age;

          this.setPeriodCurrent();
        });
    });
  }

  goBack() {
    this.StateService.back('tab.crm');
  }

  isChanged() {
    if (!this.client) {
      return false;
    }
    return this.form.level !== this.client.risk_level || this.form.year !== this.client.risk_investment_age || this.form.amount !== this.client.risk_planning_invest;
  }

  postLevel() {
    this.ClientKycModel.setData(this.clientId, {
      planning_invest: this.form.amount,
      risk_level: this.form.level,
      risk_investment_age: this.form.year,
    });

    return this.ClientModel.postRiskLevel({
      client_id: this.clientId,
      risk_level: this.form.level,
    }).then(() => {
      this.StateService.replace('risklevel', { id: this.clientId });
    });

  }
}

const options = {
  controller: RisklevelChangeCtrl,
  templateUrl: 'pages/crm/risklevel-change.html',
};

export default options;
