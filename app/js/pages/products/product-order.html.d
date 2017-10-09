
<ion-view view-title="预约"
          hide-back-button="true"
          class="product-order-page">
  <ion-nav-buttons>
    <button class="button back-button"
            ng-click="vm.onBack()">
      <i class="icon ion-back"></i>
    </button>
  </ion-nav-buttons>

  <form class="m-form" name="form" novalidate>

    <ion-content overflow-scroll="true">

      <div class="list margin-top">
        <div class="item item-icon-right select-client"
             ui-sref="selectClient"
             nav-direction="forward">
          <span class="label">客户</span>
          <span class="select">
            <span ng-if="!vm.order.client" class="placeholder">
              请选择客户
            </span>
              <span ng-if="vm.order.client">
              {{ vm.order.client.name }}
            </span>
          </span>
          <i class="icon unicon-forward accessory"></i>
        </div>
        <ion-input class="item item-input unit-input">
          <ion-label>认购金额</ion-label>
          <input type="number"
                 name="amount"
                 ng-change="vm.formUtil.onInputChange(form)"
                 ng-model="vm.order.amount"
                 placeholder="请输入认购金额"
                 pattern="[0-9]*"
                 required>
          <span class="unit">万</span>
        </ion-input>
        <ion-input class="item item-input ">
          <ion-label>备注信息</ion-label>
          <input type="text"
                 name="note"
                 ng-model="vm.order.note"
                 placeholder="备注信息">
        </ion-input>
      </div>


      <refresh-view refresher="vm.refresher">
        <div class="list product-order-list">
          <div class="item-group" ng-if="vm.benchmark">
            <div class="item item-divider">
              {{ vm.productType }}
            </div>
            <div class="item item-group-item item-fields-set-4">
              <div class="item-field">认购起点</div><!--
       --><div class="item-field">打款起点</div><!--
       --><div class="item-field">预期年化收益率</div><!--
       --><div class="item-field">返佣比例</div>
            </div>
            <div class="item item-group-item item-fields-set-4 biggerthanbigger">
              <div class="item-field">{{ vm.product.initial_deposit }}万</div><!--
       --><div class="item-field">{{ vm.product.payment_date | transPayDate }}</div><!--
       --><div class="item-field">{{ vm.benchmark | benchmarkReturn }}</div><!--
       --><div class="item-field">{{ vm.benchmark.commision_rate }}%</div>
            </div>
          </div>
        </div>
      </refresh-view>


      <div class="error">
        <span ng-if="vm.formUtil.submitError"
              ng-bind="vm.formUtil.submitError"></span>
        <span ng-if="form.amount.$dirty
                     && !vm.isAmountValid()">
          请确保你的数目在认购金额范围内 ({{ vm.amountRangeText }})
        </span>
      </div>
    </ion-content>


    <ion-footer-bar>
      <button class="button button-full button-positive"
              ng-if="vm.refresher.loaded"
              ng-disabled="form.$invalid || !vm.isValid()"
              on-request="vm.onNext()">
        提交预约
      </button>
    </ion-footer-bar>

  </form>
</ion-view>
