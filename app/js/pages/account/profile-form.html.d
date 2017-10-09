<ion-view view-title="完善资料"
          hide-back-button="true"
          class="account-profile-form-page">
  <ion-nav-buttons>
    <back-btn state="accountProfile"></back-btn>
  </ion-nav-buttons>

  <ion-content>
    <form novalidate name="form" class="m-form">
      <div class="list margin-top">
        <ion-input class="item item-input">
          <ion-label>工作单位</ion-label>
          <input type="text"
                 ng-model="vm.user.company"
                 placeholder="请输入工作单位"
                 ng-change="vm.clearError()"
                 name="company"
                 required>
        </ion-input>
        <ion-input class="item item-input">
          <ion-label>电子邮箱</ion-label>
          <input type="email"
                 ng-model="vm.user.email"
                 ng-change="vm.clearError()"
                 placeholder="请输入邮箱"
                 ng-pattern="/.*\..*/"
                 name="email"
                 required>
        </ion-input>
        <ion-input class="item item-input">
          <ion-label>合同邮寄地址</ion-label>
          <input type="text"
                 ng-change="vm.clearError()"
                 ng-model="vm.user.post_address"
                 placeholder="请输入合同邮寄地址"
                 name="post_address"
                 required>
        </ion-input>
      </div>

      <div class="error">
        <span ng-if="form.email.$dirty
                     && form.email.$invalid
                     && form.email.$touched">
          邮箱格式不正确
        </span>
        <div ng-if="vm.submitError">
            <span ng-bind="vm.submitError"></span>
        </div>
      </div>


      <button class="button button-full button-positive margin-top"
              on-request="vm.postDetail()"
              ng-disabled="form.$invalid">
        确认提交
      </button>
    </form>

  </ion-content>
</ion-view>
