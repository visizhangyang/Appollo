
class ReminderCtrl {
  static get $inject() {
    return [
      '$log', '$scope',
      'ClientModel', 'RefresherFactory', 'StateService',
    ];
  }

  constructor(
    $log, $scope,
    ClientModel, RefresherFactory, StateService
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.ClientModel = ClientModel;
    this.StateService = StateService;

    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );
    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.refresher.call();
    });
  }

  forwardDetail(id) {
    this.StateService.forward('customerDetail', { id });
  }

  refreshFn() {
    return this.ClientModel.fetchBirthdays()
      .then((resp) => {
        this.reminderList = resp.data.map((item) => {
          const result = _.clone(item);
          result.daysDiff = this.getDaysDiff(item.birthday);
          return result;
        });
      });
  }

  getDaysDiff(birth) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const secondDate = new Date();
    const firstDate = new Date(birth);
    if (!_.isDate(firstDate)) {
      this.$log.warn('Get days diff wrong, the birth is ', birth);
    }
    firstDate.setFullYear(secondDate.getFullYear());

    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
  }
}

const options = {
  controller: ReminderCtrl,
  templateUrl: 'pages/crm/reminder.html',
};
export default options;
