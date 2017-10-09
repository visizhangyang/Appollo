export default class IonicPage {

    constructor($scope) {
        this.$scope = $scope;
        this._bind();
        this._setupIonicHooks();
    }

    _bind() {
        this.willEnter = this.willEnter.bind(this);
        this.didEnter = this.didEnter.bind(this);
    }

    _setupIonicHooks() {
        this.$scope.$on('$ionicView.beforeEnter', this.willEnter);
        this.$scope.$on('$ionicView.afterEnter', this.didEnter);
    }

    willEnter() {
        //this.$log.info('willEnter');
    }

    didEnter() {
        //this.$log.info('didEnter');
    }

}