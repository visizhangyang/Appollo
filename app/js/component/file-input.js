
class FileInputCtrl {
  static get $inject() {
    return ['$scope', '$ionicPopup', '$timeout'];
  }

  constructor($scope, $ionicPopup, $timeout) {
    this.input = null;
    this.$scope = $scope;
    this.$ionicPopup = $ionicPopup;
    this.$timeout = $timeout;

    this.$scope.bindInput = (input) => {
      this.input = input[0];
      input.bind('change', (e) => {
        this.onFile(e);
      });
    };
  }

  static get maxsize() {
    // max to 10M
    return 10 * 1024 * 1024;
  }

  onFile(e) {
    const file = e.target && e.target.files && e.target.files[0];

    if (!file) {
      return;
    }

    this.$timeout(() => {
      const isValid = file.size <= FileInputCtrl.maxsize;
      if (isValid) {
        this.$scope.outputFn({ file });
      } else {
        this.$ionicPopup.alert({
          title: '上传失败',
          template: '请上传10M以内的附件',
        });
      }

      // reset change, clear the input value;
      this.input.value = '';
    }, 0);
  }

  select() {
    if (this.input) {
      this.input.click();
    }
  }
}

const fileInputOptions = {
  templateUrl: 'component/file-input.html',
  restrict: 'E',
  scope: {
    outputFn: '&outputFn',
  },
  link($scope, $el) {
    const input = $el.find('input');
    $scope.bindInput(input);
  },
  controller: FileInputCtrl,
  controllerAs: 'vm',
};

export default function () {
  return fileInputOptions;
}
