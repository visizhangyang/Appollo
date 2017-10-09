
/**
 * 这是配合 angularjs form directive 使用的 service
 *
 * 目的：
 * 1. reset form data到初始状态
 * 2. 集中处理 错误消息的模式
 * 3. 可以设置初始状态
 * 
 * canvas
 *   this is just an optional service, just for some convenient useaga
 *   only used in few palces.
 */
export default function FormFactory() {
  return class UnicornForm {
    constructor(data) {
      this.setInitData(data);
      this.data = _.cloneDeep(data);
    }

    setInitData(data) {
      this.initData = data;
      this.resetForm();
    }

    setForm(form) {
      if (!this.form && form) {
        this.form = form;
      }
    }

    onInputChange(form) {
      this.setForm(form);
      this.clearError();
    }

    clearError() {
      this.submitError = null;
    }

    resetForm() {
      this.data = _.cloneDeep(this.initData);
      this.clearError();
      if (this.form) {
        this.form.$setPristine();
        this.form.$setUntouched();
        this.form = null;
      }
    }

    setLeaveHooks($scope) {
      $scope.$on('$ionicView.beforeLeave', () => {
        this.resetForm();
      });
    }
  };
}
