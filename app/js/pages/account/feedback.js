class UserFeedbackCtrl {
  static get $inject() {
    return ['$log', '$scope', 'UserModel', 'StateService'];
  }

  constructor($log, $scope, UserModel, StateService) {
    this.$log = $log;
    this.$scope = $scope;
    this.UserModel = UserModel;
    this.StateService = StateService;
    this.$scope.content_max_length = 400;
    this.$scope.images_max_number = 3;
    this.initData();
  }

  initData() {
    this.$scope.data = {
      content: '',
      images: [],
    };
  }

  onSelect(file, oldFile) {
    if (oldFile) {
      const index = this.$scope.data.images.indexOf(oldFile);
      if (file) {
        this.$scope.data.images[index] = file;
      } else {
        this.$scope.data.images.splice(index, 1);
      }
    } else {
      this.$scope.data.images.push(file);
    }
  }

  submitFeedback() {
    const promise = this.UserModel.postFeedback(this.$scope.data);
    promise.then(() => {
      this.initData();
      this.StateService.doneTo('feedbackDone');
    });
    return promise;
  }
}

const state = {
  name: 'userFeedback',
  options: {
    url: 'account/feedback',
    controller: UserFeedbackCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/account/feedback.html',
  },
};

export default state;
