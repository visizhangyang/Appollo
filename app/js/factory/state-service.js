export default class StateService {
  constructor($log, $q, $ionicHistory, $ionicViewSwitcher, $state) {
    this.$log = $log;
    this.history = $ionicHistory;
    this.state = $state;
    this.viewSwitcher = $ionicViewSwitcher;
    this.q = $q;

    this.backTab = null;
  }

  forward(...args) {
    this.viewSwitcher.nextDirection('forward');
    return this.state.go(...args);
  }

  forwardToRoot(...args) {
    this.viewSwitcher.nextDirection('forward');
    return this.doneTo(...args);
  }

  go(...args) {
    return this.state.go(...args);
  }

  back(fallback) {
    return this.backFactory(fallback)();
  }

  replace(toState, stateParams) {
    this.history.currentView(this.history.backView());
    return this.state.go(toState, stateParams, { replace: true });
  }

  doneTo(...args) {
    this.history.nextViewOptions({
      historyRoot: true,
    });
    return this.state.go(...args)
      .then(() => {
        this.history.clearCache();
        this.history.clearHistory();
      });
  }

  selectTab(state) {
    this.backTab = state;
  }

  static get fallbackState() {
    return 'tab.crm';
  }

  backFactory(defaultState) {
    const self = this;
    const state = defaultState || StateService.fallbackState;

    return () => {
      const previous = self.history.backView();
      self.viewSwitcher.nextDirection('back');
      if (!previous) {
        if (self.backTab) {
          return self.backToTab();
        }

        self.history.nextViewOptions({
          historyRoot: true,
        });
        return self.state.go(state, {}, { replace: true });
      }
      return self.history.goBack();
    };
  }

  backToTab() {
    this.history.nextViewOptions({
      historyRoot: true,
    });
    return this.state.go(this.backTab, {}, { replace: true });
  }

}

StateService.$inject = [
  '$log', '$q', '$ionicHistory', '$ionicViewSwitcher', '$state',
];

