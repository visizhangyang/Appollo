<ion-view view-title="产品附件"
          class="product-attachments-page"
          hide-back-button="true">
  <ion-nav-buttons >
    <back-btn state="tab.crm"></back-btn>
  </ion-nav-buttons>

  <ion-content>
    <div class="card">
      <div class="item item-divider">
        产品附件
      </div>
      <div class="item" ng-if="vm.attachments.length === 0">
        没有产品附件哎
      </div>
      <div class="item item-icon-left" ng-repeat="file in vm.attachments">
        <i class="icon ion-safe-gurad"></i>
        <div>
          <h2>{{ file.filename }}</h2>
          <a ng-click="vm.openExternal(file.attachment)" target="_blank">点击预览</a>
        </div>
      </div>
    </div>
  </ion-content>
</ion-view>

