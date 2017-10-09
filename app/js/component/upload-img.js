function UploadLink($scope, $el) {
  const input = $el.find('input');
  $scope.bindInput(input);
}

class UploadImgCtrl {
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
  }

  select() {
    if (this.input) {
      this.input.click();
    }
  }

  onFiles(e) {
    const file = e.target && e.target.files && e.target.files[0];

    if (!file) {
      return;
    }
    this.$timeout(() => {
      this.src = this.window.URL.createObjectURL(file);
      this.scope.outputFn({ file });
    }, 0);
    this.logger.debug(this.src);
  }

}
UploadImgCtrl.$inject = ['$log', '$scope', '$window', '$timeout'];

const uploadImgComponentOptions = {
  templateUrl: 'component/upload-img.html',
  restrict: 'E',
  scope: {
    outputFn: '&imgOutput',
  },
  link: UploadLink,
  controller: UploadImgCtrl,
  controllerAs: 'vm',
};

export default function () {
  return uploadImgComponentOptions;
}

