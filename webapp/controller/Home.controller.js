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
            
            var that = this;
            var filter = new Filter("Status", FilterOperator.EQ, "A");
            
            this.byId("categoryList").setBusy(true);

            this._catalogo.read("/catalogosSet", {
                filters: [filter],
                success: function(oData, response) {
                    that.byId("categoryList").setBusy(false);
                    that.localmodel.setProperty("/catalogosSet", response.data.results);
                }
            }); 

            var sAppModulePath = "zsandiego.carritocompras";    
            this.localmodel.setProperty("/localmodel/lineafragmento", {});
            this.localmodel.setProperty("/placeholder", jQuery.sap.getModulePath(sAppModulePath) + "/img/11030-200.png");
          
        },
		onBeforeRendering: function () {
            

		},        
		onAfterRendering: function () {
            var sAppModulePath = "zsandiego.carritocompras";            
            this.getView().byId("imgLogo").setSrc(jQuery.sap.getModulePath(sAppModulePath) + "/img/alayri-logo-04.png");
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
            this._catalogo.read("/catalogosSet", {
                filters: [filter],
                success: function(oData, response) {
                    var oList = that.byId("categoryList");
                    var oBinding = oList.getBinding("items");           
                    oBinding.filter(null);
                    that.localmodel.setProperty("/catalogosSet", response.data.results);
                    that.byId("categoryList").setBusy(false);
                }
            }); 
            this.byId("searchField").setValue()
		},
		onBuscar: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
                aFilters.push(new Filter("Catnr", FilterOperator.Contains, sQuery.toUpperCase()))
                aFilters.push(new Filter("Caktx", FilterOperator.Contains, sQuery.toUpperCase()));
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
			var sCategoryId = oCategory.Catnr;

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
