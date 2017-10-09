class AccountVerifyDoneCtrl {
  constructor($log, StateService) {
    $log.debug('accountverify-done: enter');
    this.StateService = StateService;
  }

  done() {
    this.StateService.doneTo('accountProfile');
  }
}

AccountVerifyDoneCtrl.$inject = ['$log', 'StateService'];

const state = {
  name: 'accountVerifyDone',
  options: {
    url: '/account/verify/done',
    controller: AccountVerifyDoneCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/account/account-verify-done.html',
  },
};

export default state;

