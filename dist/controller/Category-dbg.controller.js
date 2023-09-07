sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator",
	"../service/serviceSL"
], function (
	BaseController,
	formatter,
	Device,
	Filter,
	FilterOperator,
	MessageToast,
	JSONModel,
	Fragment,
	MessageBox,
	BusyIndicator, serviceSL) {
	"use strict";

	var cantBusqueda = 0;
	return BaseController.extend("zsandiego.crearreserva.controller.Category", {
		formatter: formatter,
		// Define filterPreviousValues as global variables because they need to be accessed from different functions
		_iLowFilterPreviousValue: 0,
		_iHighFilterPreviousValue: 5000,

		onInit: function () {
			var oViewModel = new JSONModel({
				Suppliers: []
			});
			this.getView().setModel(oViewModel, "view");
			var oComponent = this.getOwnerComponent();
			this.localModel = this.getOwnerComponent().getModel("localmodel");
			this._catalogo = this.getOwnerComponent().getModel("catalogo");

			this._oRouter = oComponent.getRouter();
			this._oRouter.getRoute("category").attachMatched(this._loadCategories2, this);
			this._oRouter.getRoute("productCart").attachMatched(this._loadCategories, this);
			this._oRouter.getRoute("product").attachMatched(this._loadCategories, this);
			this._oRouter.getRoute("comparison").attachMatched(this._loadCategories, this);
			this._oRouter.getRoute("comparisonCart").attachMatched(this._loadCategories, this);
		},
		//Buscar Productos
		onBuscarCategory: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				aFilters.push(new Filter("ItemCode", FilterOperator.Contains, sQuery.toUpperCase()));
				aFilters.push(new Filter("WarehouseCode", FilterOperator.Contains, sQuery.toUpperCase()));
				// aFilters.push(new Filter("Razon_SociaonBuscarCategoryl", FilterOperator.Contains, sQuery.toUpperCase()));
			}
			// update list binding
			var oList = this.byId("productList");
			var oBinding = oList.getBinding("items");
			if (aFilters.length !== 0) {
				oBinding.filter(new Filter({ filters: aFilters, and: false }));
			} else {
				oBinding.filter(null);

			}
		},
		_loadCategories2: function (oEvent) {
			var oProductList = this.byId("productList");
			oProductList.removeSelections(true);
			this._loadCategories(oEvent);
		},
		_loadCategories: function (oEvent) {

			var bSmallScreen = this.getModel("appView").getProperty("/smallScreenMode"),
				sRouteName = oEvent.getParameter("name");

			// switch to first column in full screen mode for category route on small devices
			this._setLayout(bSmallScreen && sRouteName === "category" ? "One" : "Two");

			var oModel = this.getModel("catalogo");

			// this._loadSuppliers();
			var oProductList = this.byId("productList");

			// var oBinding = oProductList.getBinding("items");
			// oBinding.attachDataReceived(this.fnDataReceived, this);
			var sId = oEvent.getParameter("arguments").id;
			var catalogosSetData = this.localModel.getProperty("/catalogosSet");
			var catalogoSeleccionado = catalogosSetData.find(e => e.ItemCode === sId);
			this.localModel.setProperty("/itemSelected", catalogoSeleccionado);
			this.localModel.setProperty("/detallecatalogos", catalogoSeleccionado);
			this.localModel.refresh(true);
			// this._sProductId = oEvent.getParameter("arguments").productId;
			// the binding should be done after insuring that the metadata is loaded successfully
			// oModel.metadataLoaded().then(function () {
			// 	var oView = this.getView(),
			// 		sPath = "catalogo>/" + this.getModel("catalogo").createKey("catalogosSet", {
			// 			Catnr: sId
			//         });
			// 	oView.bindElement({
			// 		path: sPath,
			// 		parameters: {
			// 			expand: "detallecatalogos,proveedorescatalogos"
			// 		},
			// 		events: {
			// 			dataRequested: function () {
			// 				oView.setBusy(true);
			// 			},
			// 			dataReceived: function () {
			// 				oView.setBusy(false);
			// 			}
			// 		}
			// 	});
			// }.bind(this));
		},

		/**
		 * Create a unique array of suppliers to be used in the supplier flter option
		 * @private
		 */
		// _loadSuppliers: function () {
		// 	var oModel = this.getModel("matchcode");
		// 	oModel.read("/ZCDSMM_LIFNR_TXT", {
		// 		success: function (oData) {
		// 			var aSuppliers = [];

		// 			oData.results.forEach(function (oProduct) {
		// 				aSuppliers.push(oProduct.name1);
		// 			});

		// 			this.getModel("view").setProperty("/Suppliers", aSuppliers);
		// 		}.bind(this)
		// 	});

		// 	this._clearComparison();
		// },

		fnDataReceived: function () {
			var oList = this.byId("productList");
			var aListItems = oList.getItems();
			aListItems.some(function (oItem) {
				if (oItem.getBindingContext().sPath === "/Products('" + this._sProductId + "')") {
					oList.setSelectedItem(oItem);
					return true;
				}
			}.bind(this));
		},

		/**
		 * Event handler to determine which list item is selected
		 * @param {sap.ui.base.Event} oEvent the list select event
		 */
		onProductListSelect: function (oEvent) {
			this._showProduct(oEvent);
		},

		/**
		 * Event handler to determine which sap.m.ObjectListItem is pressed
		 * @param {sap.ui.base.Event} oEvent the sap.m.ObjectListItem press event
		 */

		onProductDetails: async function (oEvent) {
			try {
				this.onLimpiarCabeceraDetalle();
				var oBindContext;
				var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
				var oUserData = this.localModel.getProperty("/oEmpleadoData");
				if (Device.system.phone) {
					oBindContext = oEvent.getSource().getBindingContext("localmodel").getObject();
				} else {
					oBindContext = oEvent.getSource().getSelectedItem().getBindingContext("localmodel").getObject();
				}
				var oModel = this._catalogo;
				var oAreasUsuario = await serviceSL.consultaGeneralB1SL(baseuri, ("/Area('" + oUserData.U_Areas + "')"));
				if (oAreasUsuario.AREADCollection.length > 0) {
					var aAlmacenes = [];
					for (var i = 0; i < oAreasUsuario.AREADCollection.length; i++) {
						let oIndex = oAreasUsuario.AREADCollection[i];
						var oWarehouse = await serviceSL.consultaGeneralB1SL(baseuri, ("/BTP_ALMTIPO?$filter=U_AREA eq '" + oIndex.U_Area + "'"));
						aAlmacenes = aAlmacenes.concat(oWarehouse.value);
					}
					let aSearchWarehouse = aAlmacenes.filter(e => e.U_WhsCode === oBindContext.WarehouseCode);
					if (aSearchWarehouse.length === 0) {
						// MessageBox.warning("El área del usuario solicitante es diferente al área de almacén del item seleccionado.");
						MessageBox.warning("El área de almacén del item seleccionado no se encuentra configurado en las áreas del usuario solicitante.");
						return;
					}
				} else {
					MessageBox.warning("El usuario no cuenta con áreas configuradas, comunicarse con el administrador.");
					return;
				}
				var obtenerSeleccionados = this.getView().getModel("cartProducts").getProperty("/cartEntries").find(e => e.ItemCode === oBindContext.ItemCode && e.WarehouseCode === oBindContext.WarehouseCode);
				obtenerSeleccionados ? oBindContext.NoexisteSeleccionado = false : oBindContext.NoexisteSeleccionado = true;
				this.localModel.setProperty("/ProductData", oBindContext);
				// var sCategoryId = oModel.getData(oBindContext.getPath()).Catnr;
				// var sProductId = oModel.getData(oBindContext.getPath()).Item;
				// var sProductType = oModel.getData(oBindContext.getPath()).Catyp;
				var sCategoryId = oBindContext.ItemCode;
				var sProductId = oBindContext.WarehouseCode;
				var sProductType = oBindContext.InStock;

				// keep the cart context when showing a product
				var bCartVisible = this.getModel("appView").getProperty("/layout").startsWith("Three");
				this._setLayout("Two");
				this._oRouter.navTo(bCartVisible ? "productCart" : "product", {
					id: sCategoryId,
					productId: sProductId,
					productType: sProductType
				}, !Device.system.phone);

				this._unhideMiddlePage();
				if (oBindContext.InStock === 0) {
					BusyIndicator.show();
					this.getView().getModel("localmodel").setProperty("/Alternativos", []);
					await this.onObtenerAlternativos(oBindContext.ItemCode);
				} else {
					this.getView().getModel("localmodel").setProperty("/Alternativos", []);
				}
			} catch (e) {
				// MessageBox.error("Ha sucedido un error al obtener los alternativos");
				// this.hideBusyIndicator();
				BusyIndicator.hide();
			}
		},
		onObtenerAlternativos: async function (ItemCode) {
			try {
				var that = this;
				var sendData = {
					"OriginalItem": {
						"ItemCode": ItemCode
					}
				};
				var ord = 0;
				var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
				var aAlternativos = await serviceSL.onPostGeneralDataServiceLayer(baseuri, ("/AlternativeItemsService_GetItem"),sendData);
				if(aAlternativos){
					var cantTotal = aAlternativos.AlternativeItems.length;
					if(aAlternativos.AlternativeItems){
						aAlternativos.AlternativeItems.forEach(function (e) {
							// e.orden = ord++;
							that.onGetItemAlternativoServiceLayer(e, cantTotal);
						})
					}
				}
				// return new Promise(function (resolve, reject) {
				// 	var uri = baseuri + "sb1sl/AlternativeItemsService_GetItem";
				// 	$.ajax({
				// 		type: "POST",
				// 		dataType: "json",
				// 		url: uri,
				// 		data: JSON.stringify(sendData),
				// 		success: function (result) {
				// 			var cantTotal = result.AlternativeItems.length;
				// 			result.AlternativeItems.forEach(function (e) {
				// 				// e.orden = ord++;
				// 				that.onGetItemAlternativoServiceLayer(e, cantTotal);
				// 			})
				// 			// that.localModel.setProperty("/Alternativos",result.AlternativeItems);
				// 			// that.localModel.refresh(true);
				// 			// resolve(result);
				// 		},
				// 		error: function (errMsg) {
				// 			// MessageBox.error("Ha sucedido un error al obtener datos alternativos");
				// 			reject(errMsg.responseJSON);
				// 		}
				// 	});
				// });
			} catch (e) {
				sap.ui.core.BusyIndicator.hide();
			}
		},
		onGetItemAlternativoServiceLayer: async function (oAlternativo, cantTotal) {
			var that = this;
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			var aAlternativosItems = await serviceSL.consultaGeneralB1SL(baseuri, ("/Items('" + oAlternativo.AlternativeItemCode + "')"),sendData);
			cantBusqueda++;
			oAlternativo.itemObject = aAlternativosItems.ItemName;
			that.localModel.getProperty("/Alternativos").push(oAlternativo);
			that.localModel.refresh(true);
			that.closeBusy(cantBusqueda, cantTotal);
			// return new Promise(function (resolve, reject) {
			// 	var uri = baseuri + "sb1sl/Items('" + oAlternativo.AlternativeItemCode + "')";
			// 	// url: oManifestObject.resolveUri(uri),
			// 	$.ajax({
			// 		type: "GET",
			// 		dataType: "json",
			// 		url: uri,
			// 		// data: JSON.stringify(loginInfo),
			// 		success: function (result) {
			// 			cantBusqueda++;
			// 			oAlternativo.itemObject = result.ItemName;
			// 			that.localModel.getProperty("/Alternativos").push(oAlternativo);
			// 			that.localModel.refresh(true);
			// 			that.closeBusy(cantBusqueda, cantTotal);
			// 			resolve(result);
			// 		},
			// 		error: function (errMsg) {
			// 			cantBusqueda++;
			// 			reject(errMsg.responseJSON);
			// 			that.closeBusy(cantBusqueda, cantTotal);
			// 		}
			// 	});
			// });
		},
		closeBusy(cantBusquedaC, cantTotal) {
			if (cantBusquedaC === cantTotal) {
				BusyIndicator.hide();
				cantBusqueda = 0
			}
		},

		/** Apply selected filters to the category list and update text and visibility of the info toolbar
		 * @param oEvent {sap.ui.base.Event} the press event of the sap.m.Button
		 * @private
		 */
		_applyFilter: function (oEvent) {
			var oList = this.byId("productList"),
				oBinding = oList.getBinding("items"),
				aSelectedFilterItems = oEvent.getParameter("filterItems"),
				oCustomFilter = this.byId("categoryFilterDialog").getFilterItems()[0],
				oFilter,
				oCustomKeys = {},
				aFilters = [],
				aPriceFilters = [],
				aSupplierFilters = [];

			// Add the slider custom filter if the user selects some values
			if (oCustomFilter.getCustomControl().getAggregation("content")[0].getValue() !== oCustomFilter.getCustomControl().getAggregation(
				"content")[0].getMin() ||
				oCustomFilter.getCustomControl().getAggregation("content")[0].getValue2() !== oCustomFilter.getCustomControl().getAggregation(
					"content")[0].getMax()) {
				aSelectedFilterItems.push(oCustomFilter);
			}
			aSelectedFilterItems.forEach(function (oItem) {
				var sFilterKey = oItem.getProperty("key"),
					iValueLow,
					iValueHigh;
				switch (sFilterKey) {


					case "Price":
						iValueLow = oItem.getCustomControl().getAggregation("content")[0].getValue();
						iValueHigh = oItem.getCustomControl().getAggregation("content")[0].getValue2();
						oFilter = new Filter("Precio_Unit_Bukrs", FilterOperator.BT, iValueLow, iValueHigh);
						aPriceFilters.push(oFilter);
						oCustomKeys["priceKey"] = {
							Price: true
						};
						break;

					default:
						oFilter = new Filter("Lifnr", FilterOperator.EQ, sFilterKey);
						aSupplierFilters.push(oFilter);

				}
			});

			if (aPriceFilters.length > 0) {
				aFilters.push(new Filter({
					filters: aPriceFilters
				}));
			}
			if (aSupplierFilters.length > 0) {
				aFilters.push(new Filter({
					filters: aSupplierFilters
				}));
			}
			oFilter = new Filter({
				filters: aFilters,
				and: true
			});
			if (aFilters.length > 0) {
				oBinding.filter(oFilter);
				this.byId("categoryInfoToolbar").setVisible(true);
				var sText = this.getResourceBundle().getText("filterByText") + " ";
				var sSeparator = "";
				var oFilterKey = oEvent.getParameter("filterCompoundKeys");
				var oKeys = Object.assign(oFilterKey, oCustomKeys);
				for (var key in oKeys) {
					if (oKeys.hasOwnProperty(key)) {
						sText = sText + sSeparator + this.getResourceBundle().getText(key, [this._iLowFilterPreviousValue, this._iHighFilterPreviousValue]);
						sSeparator = ", ";
					}
				}
				this.byId("categoryInfoToolbarTitle").setText(sText);
			} else {
				oBinding.filter(null);
				this.byId("categoryInfoToolbar").setVisible(false);
				this.byId("categoryInfoToolbarTitle").setText("");
			}
		},

		/**
		 * Open the filter dialog
		 */
		onFilter: function () {
			// load asynchronous XML fragment
			if (!this.byId("categoryFilterDialog")) {
				Fragment.load({
					id: this.getView().getId(),
					name: "zsandiego.crearreserva.view.CategoryFilterDialog",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					this.getView().addDependent(oDialog);
					oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
					oDialog.open();
				}.bind(this));
			} else {
				this.byId("categoryFilterDialog").open();
			}
		},

		/**
		 * Updates the previous slider values
		 * @param {sap.ui.base.Event} oEvent the press event of the sap.m.Button
		 */
		handleConfirm: function (oEvent) {
			var oCustomFilter = this.byId("categoryFilterDialog").getFilterItems()[0];
			var oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			this._iLowFilterPreviousValue = oSlider.getValue();
			this._iHighFilterPreviousValue = oSlider.getValue2();
			this._applyFilter(oEvent);
		},

		/**
		 * Sets the slider values to the previous ones
		 * Updates the filter count
		 */
		handleCancel: function () {
			var oCustomFilter = this.byId("categoryFilterDialog").getFilterItems()[0];
			var oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			oSlider.setValue(this._iLowFilterPreviousValue).setValue2(this._iHighFilterPreviousValue);
			if (this._iLowFilterPreviousValue > oSlider.getMin() || this._iHighFilterPreviousValue !== oSlider.getMax()) {
				oCustomFilter.setFilterCount(1);
			} else {
				oCustomFilter.setFilterCount(0);
			}
		},

		/**
		 * Updates filter count if there is a change in one of the slider values
		 * @param {sap.ui.base.Event} oEvent the change event of the sap.m.RangeSlider
		 */
		handleChange: function (oEvent) {
			var oCustomFilter = this.byId("categoryFilterDialog").getFilterItems()[0];
			var oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			var iLowValue = oEvent.getParameter("range")[0];
			var iHighValue = oEvent.getParameter("range")[1];
			if (iLowValue !== oSlider.getMin() || iHighValue !== oSlider.getMax()) {
				oCustomFilter.setFilterCount(1);
			} else {
				oCustomFilter.setFilterCount(0);
			}
		},

		/**
		 * Reset the price custom filter
		 */
		handleResetFilters: function () {
			var oCustomFilter = this.byId("categoryFilterDialog").getFilterItems()[0];
			var oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			oSlider.setValue(oSlider.getMin());
			oSlider.setValue2(oSlider.getMax());
			oCustomFilter.setFilterCount(0);
		},

		/**
		 * Navigation to comparison view
		 * @param {sap.ui.base.Event} oEvent the press event of the link text in sap.m.ObjectListItem
		 */
		compareProducts: function (oEvent) {
			var oProduct = oEvent.getSource().getBindingContext("catalogo").getObject();
			var sItem1Id = this.getModel("comparison").getProperty("/item1");
			var sItem2Id = this.getModel("comparison").getProperty("/item2");

			this._oRouter.navTo("comparison", {
				id: oProduct.Catnr,
				category: oProduct.Catyp,
				item1Id: (sItem1Id ? sItem1Id : oProduct.Item),
				item2Id: (sItem1Id && sItem1Id != oProduct.Item ? oProduct.Item : sItem2Id)
			}, true);
		},
		/**
		 * Always navigates back to category overview
		 * @override
		 */
		onBack: function (ctx) {
			this.byId('searchField1').clear(true);
			this.getRouter().navTo("categories");
			this.getView().getModel("view").refresh(true);
		}
	});
});