function UploadLink($scope, $el) {
  const input = $el.find('input');
  $scope.bindInput(input);
}
class UploadImgCtrl {
  static get $inject() {
    return ['$log', '$scope', '$window', '$timeout'];
  }

  constructor($log, $scope, $window, $timeout) {
    this.input = null;
    this.scope = $scope;
    this.window = $window;
    this.logger = $log;
    this.$timeout = $timeout;
    this.scope.bindInput = (input) => {
      this.input = input[0];
      input.bind('change', (e) => {
        this.onFiles(e);
      });
    };
    if (this.scope.img) {
      this.src = this.window.URL.createObjectURL(this.scope.img);
    }
  }

  select() {
    if (this.input) {
      this.input.click();
    }
  }

  remove() {
    this.updateFile();
  }

  onFiles(e) {
    const file = e.target && e.target.files && e.target.files[0];

    if (!file) {
      return;
    }
    this.$timeout(() => {
      this.updateFile(file);
    }, 0);
    this.input.value = '';
  }

  updateFile(file) {
    const oldFile = this.scope.img;
    this.scope.outputFn({ file, oldFile });
  }

}


const feedbackImageOptions = {
  templateUrl: 'component/feedback-image.html',
  restrict: 'E',
  scope: {
    outputFn: '&imgOutput',
    img: '=',
  },
  link: UploadLink,
  controller: UploadImgCtrl,
  controllerAs: 'vm',
};

export default function () {
  return feedbackImageOptions;
}
