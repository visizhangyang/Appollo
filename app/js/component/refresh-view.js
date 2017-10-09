
const insensitiveDuration = 1000;


class RefreshView {
  static get $inject() {
    return ['$timeout', '$scope'];
  }

  constructor($timeout, $scope) {
    this.$timeout = $timeout;
    this.requesting = false;
    this.timeoutTask = null;

    $scope.$watch(() => this.refresher.requesting, (requesting) => {
      if (this.timeoutTask) {
        this.$timeout.cancel(this.timeoutTask);
      }

      if (requesting) {
        this.delayToggleRequesting(true);
      } else {
        if (this.requesting) {
          this.delayToggleRequesting(false);
        } else {
          this.requesting = false;
        }
      }
    });
  }

  // e.g wait 400 ms to show loading, at least show it 400ms;
  delayToggleRequesting(requesting) {
    this.timeoutTask = this.$timeout(() => {
      this.requesting = requesting;
    }, insensitiveDuration);
  }

  retry(event) {
    event.stopPropagation();
    this.refresher.call();
  }
}


const refreshViewCmp = {
  templateUrl: 'component/refresh-view.html',
  controller: RefreshView,
  transclude: true,
  bindings: {
    refresher: '=',
  },
};

export default refreshViewCmp;
