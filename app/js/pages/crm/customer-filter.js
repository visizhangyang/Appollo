
class CustomerFilterCtrl {
  static get $inject() {
    return [
      '$q', '$log', '$ionicModal',
      'ClientModel', 'StateService',
    ];
  }

  constructor(
    $q, $log, $ionicModal,
    ClientModel, StateService
  ) {
    this.$q = $q;
    this.$log = $log;
    this.$ionicModal = $ionicModal;
    this.ClientModel = ClientModel;
    this.StateService = StateService;

    this.filter = {
      client_level: {},
      status: {},
      source: {},
    };
  }

  isValid() {
    this.getParams();
    return !_.isEmpty(this.result);
  }

  resetOptions() {
    this.filter = {
      client_level: {},
      status: {},
      source: {},
    };
  }

  getParams() {
    this.result = _(this.filter)
      .mapValues((d) => {
        const matchs = _.pickBy(d, (param) => param);
        let value = null;
        if (!_.isEmpty(matchs)) {
          value = _.keys(matchs).join(',');
        }
        return value;
      })
      .pickBy((p) => p)
      .value();
  }

  query() {
    return this.ClientModel.fetchList(this.result)
      .then((customerList) => {
        this.ClientModel.setFilters(customerList);
        this.StateService.forward('filter-result');
      });
  }
}

const options = {
  controller: CustomerFilterCtrl,
  templateUrl: 'pages/crm/customer-filter.html',
};

export default options;
