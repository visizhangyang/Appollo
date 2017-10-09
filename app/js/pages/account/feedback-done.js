class FeedbackDownCtrl {
  static get $inject() {
    return ['StateService'];
  }

  constructor(StateService) {
    this.StateService = StateService;
  }

  done() {
    this.StateService.doneTo('tab.account');
  }
}

const state = {
  name: 'feedbackDone',
  options: {
    url: '/account/feedback/done',
    controller: FeedbackDownCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/account/feedback-done.html',
  },
};

export default state;
