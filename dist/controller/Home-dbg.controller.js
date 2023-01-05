sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function (BaseController, formatter, Filter, FilterOperator, Device, Fragment, MessageBox) {
	"use strict";

	return BaseController.extend("zsandiego.carritocompras.controller.Home", {
		formatter: formatter,

		onInit: function () {
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("categories").attachMatched(this._onRouteMatched, this);
            this._catalogo = this.getOwnerComponent().getModel("catalogo");
            this.localmodel = this.getOwnerComponent().getModel("localmodel");
			this.getWFInstances();
            
            var that = this;
            var filter = new Filter("Status", FilterOperator.EQ, "A");
            
            this.byId("categoryList").setBusy(true);

            // this._catalogo.read("/catalogosSet", {
            //     filters: [filter],
            //     success: function(oData, response) {
            //         that.byId("categoryList").setBusy(false);
            //         that.localmodel.setProperty("/catalogosSet", response.data.results);
            //     }
            // }); 

			this.onGetItemServiceLayer();
			this.consultaEmpleados();
			// this.onCentrosDeCosto();

            var sAppModulePath = "zsandiego.carritocompras";    
            this.localmodel.setProperty("/localmodel/lineafragmento", {});
            this.localmodel.setProperty("/CentrosCosto", []);
            this.localmodel.setProperty("/placeholder", jQuery.sap.getModulePath(sAppModulePath) + "/img/11030-200.png");
          
        },
		onBeforeRendering: function () {
            

		},       
		getWFInstances: function () {
			var that = this;
			var oManifestObject = that.getOwnerComponent().getManifestObject();
			var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: appModulePath+"/wfrest/v1/workflow-instances",
                    method: "GET",
					async: false,
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    },
                    success: function (result, xhr, data) {
                        resolve(result);
                    
                    }
                });
            });
        },
		onGetItemServiceLayer: function(){
			var that = this;
			let oManifestObject = this.getOwnerComponent().getManifestObject();
			var loginInfo = {
				"USRWS":"S4ND!3G0",
				"PWDWS":"1NG.S4ND13G0",
				"CompanyDB":"TEST_QA_102022",
				"Password":"integra",
				"UserName":"manager",
				"Server":"172.31.49.151",
				"ItemCode":"0026592"};
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
		
			return new Promise(function (resolve, reject) {
				var uri = baseuri+"sb1sl/Items?$skip=50000";
				// url: oManifestObject.resolveUri(uri),
				$.ajax({
					type: "GET",
					dataType: "json",
					url: uri,
					// data: JSON.stringify(loginInfo),
					success: function (result) {
						that.localmodel.setProperty("/catalogosSet", result.value);
						that.byId("categoryList").setBusy(false);
						resolve(result.value);
					},
					error: function (errMsg) {
						reject(errMsg.responseJSON);
					}
				});
			});
		},
		consultaEmpleados: function () {
			var that = this;
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			return new Promise( function (resolve, reject) {
				var uri = baseuri+"sb1sl/EmployeesInfo";
				$.ajax({
					type: "GET",
					dataType: "json",
					url: uri,
					success: function (result) {
						that.localmodel.setProperty("/empleados", result.value);
						resolve(result.value);
					},
					error: function (errMsg) {
						reject(errMsg.responseJSON);
					}
				});
			});
		},
		onCentrosDeCosto: function () {
			var that = this;
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			return new Promise( function (resolve, reject) {
				var uri = baseuri+"sb1sl/ProfitCenters";
				$.ajax({
					type: "GET",
					dataType: "json",
					url: uri,
					success: function (result) {
						that.localmodel.setProperty("/CentrosCosto", result.value);
						resolve(result.value);
					},
					error: function (errMsg) {
						reject(errMsg.responseJSON);
					}
				});
			});
		},
		onAfterRendering: function () {
            var sAppModulePath = "zsandiego.carritocompras";            
            this.getView().byId("imgLogo").setSrc(jQuery.sap.getModulePath(sAppModulePath) + "/img/imageMain.png");
		},
		_onRouteMatched: function () {
			var bSmallScreen = this.getModel("appView").getProperty("/smallScreenMode");
			if (bSmallScreen) {
				this._setLayout("One");
			}
		},

		onSearch: function () {
			this._search();
		},

		onRefresh: function () {
            var that = this;
            var filter = new Filter("Status", FilterOperator.EQ, "A")
            this.byId("categoryList").setBusy(true);
            // this._catalogo.read("/catalogosSet", {
            //     filters: [filter],
            //     success: function(oData, response) {
            //         var oList = that.byId("categoryList");
            //         var oBinding = oList.getBinding("items");           
            //         oBinding.filter(null);
            //         that.localmodel.setProperty("/catalogosSet", response.data.results);
            //         that.byId("categoryList").setBusy(false);
            //     }
            // }); 
			this.onGetItemServiceLayer();
			var oList = that.byId("categoryList");
			var oBinding = oList.getBinding("items");           
			oBinding.filter(null);

            this.byId("searchField").setValue()
		},
		onBuscar: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
                aFilters.push(new Filter("ItemCode", FilterOperator.Contains, sQuery))
                aFilters.push(new Filter("ItemName", FilterOperator.Contains, sQuery));
            }

            var oList = this.byId("categoryList");
            var oBinding = oList.getBinding("items");            
            if (aFilters.length !== 0){
                oBinding.filter(new Filter({filters: aFilters, and: false}));
            }else{
                oBinding.filter(null)
            }

        },
		_search: function () {

			var oView = this.getView();
			var oCategoryList = oView.byId("categoryList");
			var aFilters = [];
			var sQuery = this.byId("searchField").getValue();
			if (sQuery && sQuery.length > 0) {
                aFilters.push(new Filter("Catnr", FilterOperator.Contains, sQuery.toUpperCase()))
                aFilters.push(new Filter("Caktx", FilterOperator.Contains, sQuery.toUpperCase()));
            }
            
			// update list binding
			var oList = this.byId("categoryList");
            var oBinding = oList.getBinding("items");
            
            oBinding.filter(new Filter({filters: aFilters, and: false}));
            oBinding.refresh();
		},

		onCategoryListItemPress: function (oEvent) {
            var oBindContext = oEvent.getParameter("listItem");
            var oCategory = oBindContext.getBindingContext("localmodel").getObject()
			var sCategoryId = oCategory.ItemCode;

			this._router.navTo("category", {
				id: sCategoryId
			});
			this._unhideMiddlePage();
			this.getView().byId("searchField").clear("true");
		},

		onProductListSelect: function (oEvent) {
			var oItem = oEvent.getParameter("listItem");
			this._showProduct(oItem);
		},

		onProductListItemPress: function (oEvent) {
			var oItem = oEvent.getSource();
			this._showProduct(oItem);
		},

		_showProduct: function (oItem) {
			var oEntry = oItem.getBindingContext().getObject();

			this._router.navTo("product", {
				id: oEntry.Category,
				productId: oEntry.ProductId
			}, !Device.system.phone);
		},

		/**
		 * Always navigates back to home
		 * @override
		 */
		onBack: function () {
			this.getRouter().navTo("home");
		}
	});
});
