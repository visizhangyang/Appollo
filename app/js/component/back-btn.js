class BackBtnCtrl {
  constructor(StateService) {
    this.back = StateService.backFactory(this.state);
  }
}
BackBtnCtrl.$inject = ['StateService'];

const backBtn = {
  bindings: {
    state: '@',
  },
  template: `
      <button class="button back-button"
              ng-click="$ctrl.back()">
        <i class="icon ion-back"></i>
      </button>
  `,
  controller: BackBtnCtrl,
};

export default backBtn;

