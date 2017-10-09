const modalUrl = 'component/new-benchmark.html';

class BenchmarkModal {
  constructor(data, hasRate, modal, isRelease, $q) {
    this.deferred = $q.defer();
    this.promise = this.deferred.promise;

    this.modal = modal;
    this.modal.scope.vm = this;
    this.hasRate = hasRate;

    if (data) {
      this.data = data;
    } else {
      this.data = {};
      if (!isRelease) {
        this.data = {
          investment_amount: 1,
          investment_amount_max: 1,
          commision_rate: 1,
          expected_annual_return: 1,
        };
      }
    }
    this.modal.show();
  }

  add() {
    if (!this.isValid()) {
      return;
    }
    const data = _.pickBy(this.data, (value) => !_.isNull(value));
    this.deferred.resolve(data);
    this.cancel();
  }

  cancel() {
    this.modal.remove();
  }

  isValid() {
    if (this.data.investment_amount_max) {
      return this.data.investment_amount <= this.data.investment_amount_max;
    }
    return true;
  }
}


export default class NewBenchmarkService {
  static get $inject() {
    return ['$q', '$log', '$ionicModal', 'isRelease'];
  }
  constructor($q, $log, $ionicModal, isRelease) {
    this.$q = $q;
    this.$log = $log;
    this.$ionicModal = $ionicModal;
    this.isRelease = isRelease;
  }

  newForm(data, hasRate) {
    return this.$q((resolve) => {
      this.$ionicModal.fromTemplateUrl(modalUrl, {
        animation: 'slide-in-up',
      })
        .then((modal) => {
          const benchmark = new BenchmarkModal(
            data, hasRate, modal, this.isRelease, this.$q
          );
          resolve(benchmark);
        });
    });
  }
}

