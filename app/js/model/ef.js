export default class EFModel {
    static get $inject() {
        return ['ApiService', 'UserModel'];
    }

    constructor(ApiService, UserModel) {
        this.UserModel = UserModel;
        this.api = ApiService.authApi;
    }

    getEfficientFrontier(client_id, {planning_invest, product_count, expected_return_rate, product_pool}) {
        return this.UserModel.onSetupReady()
            .then(() => this.api.all('v1/ef/user').one('clients', client_id).customGET('efficient_frontier', { planning_invest, product_count, expected_return_rate, product_pool }));
    }

    createEfficientFrontier(client_id, {planning_invest, product_count, expected_return_rate, product_pool, investment_strategy}) {
        return this.UserModel.onSetupReady()
            .then(() => this.api.all('v1/ef/user').one('clients', client_id).all('efficient_frontier').customPOST({ planning_invest, product_count, expected_return_rate, product_pool, investment_strategy }));
    }

    getReturnRateRange({planning_invest, product_count, product_pool}) {
        return this.UserModel.onSetupReady()
            .then(() => this.api.all('v1/ef/user/clients').customGET('ef_return_rate_range', { planning_invest, product_count, product_pool }));
    }
}