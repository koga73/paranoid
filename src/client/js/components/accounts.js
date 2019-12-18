(function(){
	Vue.component("accounts", {
		data:function(){
			return {
				accounts:[],
				accountNew:new Models.Account()
			};
		},
		methods:{
			handler_account_remove:function(account, index){
				this.accounts.splice(index, 1);
			},

			handler_account_export:function(){
				console.log("accounts::handler_account_export");
			},

			handler_account_change:function(){
				console.log("accounts::handler_account_change");
			},

			handler_account_add:function(){
				this.accounts.push(this.accountNew);
				this.accountNew = new Models.Account();
			},

			handler_account_import:function(){
				console.log("accounts::handler_account_import");
			},

			handler_accounts_export:function(){
				console.log("accounts::handler_accounts_export");
			},

			handler_accounts_import:function(){
				console.log("accounts::handler_accounts_import");
			},

			handler_accounts_save:function(){
				console.log("accounts::handler_accounts_save");
			}
		}
	});
})();