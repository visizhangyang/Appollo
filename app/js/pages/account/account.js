import accountVerifyState from './account-verify';
import accountVerifyDoneState from './account-verify-done';
import accountProfileState from './profile';
// import accountProfileFormState from './profile-form';
import ordersState from './account-orders';
import productsState from './account-products';
import orderDetailState from './order-detail';
import feedbackState from './feedback';
import feedbackDoneState from './feedback-done';
import resetPasswordState from './reset-password';
import accountCollection from './collection';

function accountConfig($stateProvider) {
  $stateProvider
    .state(ordersState.name, ordersState.options)
    .state(orderDetailState.name, orderDetailState.options)
    .state(productsState.name, productsState.options)
    .state(accountProfileState.name, accountProfileState.options)
    // .state(accountProfileFormState.name, accountProfileFormState.options)
    .state(accountVerifyState.name, accountVerifyState.options)
    .state(accountVerifyDoneState.name, accountVerifyDoneState.options)
    .state(feedbackState.name, feedbackState.options)
    .state(feedbackDoneState.name, feedbackDoneState.options)
    .state(accountCollection.name, accountCollection.options)
    .state(resetPasswordState.name, resetPasswordState.options);
}

accountConfig.$inject = ['$stateProvider'];

const moduleName = 'unicorn.account';

angular.module(moduleName, [])
  .config(accountConfig);

export default moduleName;
