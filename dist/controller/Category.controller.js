sap.ui.define(["./BaseController","../model/formatter","sap/ui/Device","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/m/MessageToast","sap/ui/model/json/JSONModel","sap/ui/core/Fragment"],function(t,e,o,i,r,a,s,n){"use strict";return t.extend("zsandiego.carritocompras.controller.Category",{formatter:e,_iLowFilterPreviousValue:0,_iHighFilterPreviousValue:5e3,onInit:function(){var t=new s({Suppliers:[]});this.getView().setModel(t,"view");var e=this.getOwnerComponent();this.localModel=this.getOwnerComponent().getModel("localmodel");this._catalogo=this.getOwnerComponent().getModel("catalogo");this._oRouter=e.getRouter();this._oRouter.getRoute("category").attachMatched(this._loadCategories2,this);this._oRouter.getRoute("productCart").attachMatched(this._loadCategories,this);this._oRouter.getRoute("product").attachMatched(this._loadCategories,this);this._oRouter.getRoute("comparison").attachMatched(this._loadCategories,this);this._oRouter.getRoute("comparisonCart").attachMatched(this._loadCategories,this)},onBuscarCategory:function(t){var e=[];var o=t.getSource().getValue();if(o&&o.length>0){e.push(new i("Itetx",r.Contains,o.toUpperCase()));e.push(new i("Item",r.Contains,o.toUpperCase()));e.push(new i("Razon_Social",r.Contains,o.toUpperCase()))}var a=this.byId("productList");var s=a.getBinding("items");if(e.length!==0){s.filter(new i({filters:e,and:false}))}else{s.filter(null)}},_loadCategories2:function(t){var e=this.byId("productList");e.removeSelections(true);this._loadCategories(t)},_loadCategories:function(t){var e=this.getModel("appView").getProperty("/smallScreenMode"),o=t.getParameter("name");this._setLayout(e&&o==="category"?"One":"Two");var i=this.getModel("catalogo");this._loadSuppliers();var r=this.byId("productList");var a=t.getParameter("arguments").id;var s=this.localModel.getProperty("/catalogosSet");var n=s.find(t=>t.ItemCode===a);this.localModel.setProperty("/itemSelected",n);this.localModel.setProperty("/detallecatalogos",n);this.localModel.refresh(true)},_loadSuppliers:function(){var t=this.getModel("matchcode");t.read("/ZCDSMM_LIFNR_TXT",{success:function(t){var e=[];t.results.forEach(function(t){e.push(t.name1)});this.getModel("view").setProperty("/Suppliers",e)}.bind(this)});this._clearComparison()},fnDataReceived:function(){var t=this.byId("productList");var e=t.getItems();e.some(function(e){if(e.getBindingContext().sPath==="/Products('"+this._sProductId+"')"){t.setSelectedItem(e);return true}}.bind(this))},onProductListSelect:function(t){this._showProduct(t)},onProductDetails:function(t){var e;if(o.system.phone){e=t.getSource().getBindingContext("localmodel")}else{e=t.getSource().getSelectedItem().getBindingContext("localmodel").getObject()}var i=this._catalogo;this.localModel.setProperty("/ProductData",e);var r=e.ItemCode;var a=e.WarehouseCode;var s=e.InStock;var n=this.getModel("appView").getProperty("/layout").startsWith("Three");this._setLayout("Two");this._oRouter.navTo(n?"productCart":"product",{id:r,productId:a,productType:s},!o.system.phone);this._unhideMiddlePage()},_applyFilter:function(t){var e=this.byId("productList"),o=e.getBinding("items"),a=t.getParameter("filterItems"),s=this.byId("categoryFilterDialog").getFilterItems()[0],n,l={},g=[],u=[],c=[];if(s.getCustomControl().getAggregation("content")[0].getValue()!==s.getCustomControl().getAggregation("content")[0].getMin()||s.getCustomControl().getAggregation("content")[0].getValue2()!==s.getCustomControl().getAggregation("content")[0].getMax()){a.push(s)}a.forEach(function(t){var e=t.getProperty("key"),o,a;switch(e){case"Price":o=t.getCustomControl().getAggregation("content")[0].getValue();a=t.getCustomControl().getAggregation("content")[0].getValue2();n=new i("Precio_Unit_Bukrs",r.BT,o,a);u.push(n);l["priceKey"]={Price:true};break;default:n=new i("Lifnr",r.EQ,e);c.push(n)}});if(u.length>0){g.push(new i({filters:u}))}if(c.length>0){g.push(new i({filters:c}))}n=new i({filters:g,and:true});if(g.length>0){o.filter(n);this.byId("categoryInfoToolbar").setVisible(true);var h=this.getResourceBundle().getText("filterByText")+" ";var d="";var p=t.getParameter("filterCompoundKeys");var m=Object.assign(p,l);for(var C in m){if(m.hasOwnProperty(C)){h=h+d+this.getResourceBundle().getText(C,[this._iLowFilterPreviousValue,this._iHighFilterPreviousValue]);d=", "}}this.byId("categoryInfoToolbarTitle").setText(h)}else{o.filter(null);this.byId("categoryInfoToolbar").setVisible(false);this.byId("categoryInfoToolbarTitle").setText("")}},onFilter:function(){if(!this.byId("categoryFilterDialog")){n.load({id:this.getView().getId(),name:"zsandiego.carritocompras.view.CategoryFilterDialog",controller:this}).then(function(t){this.getView().addDependent(t);t.addStyleClass(this.getOwnerComponent().getContentDensityClass());t.open()}.bind(this))}else{this.byId("categoryFilterDialog").open()}},handleConfirm:function(t){var e=this.byId("categoryFilterDialog").getFilterItems()[0];var o=e.getCustomControl().getAggregation("content")[0];this._iLowFilterPreviousValue=o.getValue();this._iHighFilterPreviousValue=o.getValue2();this._applyFilter(t)},handleCancel:function(){var t=this.byId("categoryFilterDialog").getFilterItems()[0];var e=t.getCustomControl().getAggregation("content")[0];e.setValue(this._iLowFilterPreviousValue).setValue2(this._iHighFilterPreviousValue);if(this._iLowFilterPreviousValue>e.getMin()||this._iHighFilterPreviousValue!==e.getMax()){t.setFilterCount(1)}else{t.setFilterCount(0)}},handleChange:function(t){var e=this.byId("categoryFilterDialog").getFilterItems()[0];var o=e.getCustomControl().getAggregation("content")[0];var i=t.getParameter("range")[0];var r=t.getParameter("range")[1];if(i!==o.getMin()||r!==o.getMax()){e.setFilterCount(1)}else{e.setFilterCount(0)}},handleResetFilters:function(){var t=this.byId("categoryFilterDialog").getFilterItems()[0];var e=t.getCustomControl().getAggregation("content")[0];e.setValue(e.getMin());e.setValue2(e.getMax());t.setFilterCount(0)},compareProducts:function(t){var e=t.getSource().getBindingContext("catalogo").getObject();var o=this.getModel("comparison").getProperty("/item1");var i=this.getModel("comparison").getProperty("/item2");this._oRouter.navTo("comparison",{id:e.Catnr,category:e.Catyp,item1Id:o?o:e.Item,item2Id:o&&o!=e.Item?e.Item:i},true)},onBack:function(t){this.byId("searchField1").clear(true);this.getRouter().navTo("categories");this.getView().getModel("view").refresh(true)}})});