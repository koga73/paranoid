(function(){
	Vue.component("accounts", {
		data:function(){
			return {
				accountNew:new Models.Account()
			};
		},
		props:[
			//Non-sync
			"ciphers",
			//Sync
			"_accounts"
		],
		computed:{
			accounts:{
                get:function(){
                    return this._accounts;
                },
                set:function(value){
                    this.$emit(Events.Sync.ACCOUNTS, value);
                }
			},
		},
		methods:{
			handler_account_remove:function(evt, account, index){
				evt.preventDefault();

				this.accounts.splice(index, 1);

				return false;
			},

			handler_account_export:function(evt){
				evt.preventDefault();

				console.log("accounts::handler_account_export");

				return false;
			},

			handler_account_change:function(evt){
				evt.preventDefault();

				console.log("accounts::handler_account_change");

				return false;
			},

			handler_account_add:function(evt){
				evt.preventDefault();

				//Validate form
                var form = this.$refs["frmAccounts"];
                if (!form.checkValidity()) {
                    try {
                        form.reportValidity();
                    } catch(error) {
                        //IE11 doesn't support
                    }
                    return false;
                }

				this.accounts.push(this.accountNew);
				this.accountNew = new Models.Account();

				return false;
			},

			handler_account_import:function(evt){
				evt.preventDefault();

				console.log("accounts::handler_account_import");

				return false;
			},

			handler_accounts_export:function(){
				console.log("accounts::handler_accounts_export");
			},

			handler_accounts_import:function(){
				console.log("accounts::handler_accounts_import");
			}
		}
	});
})();