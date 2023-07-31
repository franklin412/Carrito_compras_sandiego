sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"../model/cart",
    "sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../service/serviceSL",
], function (Controller, MessageToast, UIComponent, History, cart, MessageBox, Filter, FilterOperator, serviceSL) {
	"use strict";
	var dataAlternativoDetalle;
	var dataAlternativoCabecera;
	return Controller.extend("zsandiego.crearreserva.controller.BaseController", {
		cart: cart,
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Handler for the Avatar button press event
		 * @public
		 */

		/**
		 * React to FlexibleColumnLayout resize events
		 * Hides navigation buttons and switches the layout as needed
		 * @param {sap.ui.base.Event} oEvent the change event
		 */
		onStateChange: function (oEvent) {
			var sLayout = oEvent.getParameter("layout"),
				iColumns = oEvent.getParameter("maxColumnsCount");

			if (iColumns === 1) {
				this.getModel("appView").setProperty("/smallScreenMode", true);
			} else {
				this.getModel("appView").setProperty("/smallScreenMode", false);
				// swich back to two column mode when device orientation is changed
				if (sLayout === "OneColumn") {
					this._setLayout("Two");
				}
			}
		},

		/**
		 * Sets the flexible column layout to one, two, or three columns for the different scenarios across the app
		 * @param {string} sColumns the target amount of columns
		 * @private
		 */
		_setLayout: function (sColumns) {
			if (sColumns) {
				this.getModel("appView").setProperty("/layout", sColumns + "Column" + (sColumns === "One" ? "" : "sMidExpanded"));
			}
		},

		/**
		 * Apparently, the middle page stays hidden on phone devices when it is navigated to a second time
		 * @private
		 */
		_unhideMiddlePage: function () {

			setTimeout(function () {
				this.getOwnerComponent().getRootControl().byId("layout").getCurrentMidColumnPage().removeStyleClass("sapMNavItemHidden");
			}.bind(this), 0);
		},

		/**
		 * Navigates back in browser history or to the home screen
		 */
		onBack: function () {
			this._unhideMiddlePage();
			var oHistory = History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("home");
			}
		},

		/**
		 * Called, when the add button of a product is pressed.
		 * Saves the product, the i18n bundle, and the cart model and hands them to the <code>addToCart</code> function
		 * @public
		 */
		onAddToCart: function () {
            // var oProduct = arguments[0].getSource().getBindingContext("catalogo").getObject();
            var oProduct = this.getView().getModel("localmodel").getProperty("/ProductData");
            //if (parseFloat(oProduct.Precio_Unit_Bukrs) === 0){
			//	MessageBox.warning("No se ha registrado una equivalencia para la moneda GTQ.");
            //    return
            //}
            
            if (!this.oDialogQuantity) {
				this.oDialogQuantity = sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.addQuantity", this);
				this.getView().addDependent(this.oDialogQuantity);
            }

            sap.ui.getCore().byId("sInpQuantityLabel").setLabel("Cantidad ");
            sap.ui.getCore().byId("sInpQuantity").setMin(parseFloat(oProduct.Cant_Min));
            sap.ui.getCore().byId("sInpQuantity").setValue(parseFloat(oProduct.Cant_Min));
            this.oDialogQuantity.data("oProduct", oProduct);
			this.oDialogQuantity.open();
		},
		onSelectAlmacenReserva: function(oEvent){
			// var selectedAlmacen = oEvent.getSource().getBindingContext("localmodel").getObject();
			dataAlternativoCabecera = this.getView().getModel("localmodel").getProperty("/AlternativosItems");
			var selectedAlmacen = oEvent.getParameters().listItem.getBindingContext("localmodel").getObject();
			dataAlternativoDetalle = selectedAlmacen;

			var oCartModel = this.getModel("cartProducts");
			var existeAlternativo = oCartModel.getProperty("/cartEntries").find(e=>e.ItemCode === dataAlternativoDetalle.ItemCode && e.WarehouseCode === dataAlternativoDetalle.WarehouseCode);
			if(existeAlternativo){
				MessageBox.warning("El alternativo seleccionado ya existe en la lista de reservas.");
				this.onLimpiarCabeceraDetalle();
				return;
			}
			// dataAlternativoCabecera = this.getView().getModel("localmodel").getProperty("/AlternativoSeleccionado");
			if(selectedAlmacen.InStock !== 0){
				this.onAddToCart();
			}else {
				MessageBox.warning("Este item no tiene stock");
			}
		},
		onLimpiarCabeceraDetalle: function(){
			dataAlternativoDetalle = null;
	 		dataAlternativoCabecera = null;
		},
		onAddQuantity: async function(oEvent){
			try{
				sap.ui.core.BusyIndicator.show(0);
				var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
				var oCartModel = this.getModel("cartProducts"), oProduct;
				if(dataAlternativoDetalle && dataAlternativoCabecera){
					oProduct = dataAlternativoDetalle;
					var DatosCabecera = dataAlternativoCabecera;
					// var existeAlternativo = oCartModel.getProperty("/cartEntries").find(e=>e.ItemCode === oProduct.ItemCode && e.WarehouseCode === oProduct.WarehouseCode);
					// if(existeAlternativo){
					// 	MessageBox.warning("El alternativo seleccionado ya existe en la lista de reservas.");
					// 	return;
					// }
				}else{
					oProduct = oEvent.getSource().getParent().data("oProduct");
					var DatosCabecera = this.getView().getModel("localmodel").getData().itemSelected;
					oProduct.NoexisteSeleccionado = false;
					this.getView().getModel("localmodel").refresh(true);
				}
				var aUserxAlm = await serviceSL.onObtenerALMXTIPO(oProduct,baseuri,"BTP_ALMXTIPO?$filter=U_WhsCode eq '"+oProduct.WarehouseCode+"'");
				if(aUserxAlm.length > 0){
					var aUsersAlmReduced = aUserxAlm.reduce(function (previousValue, currentValue) {
						if (previousValue.indexOf(currentValue.U_TipoAlmacen) === -1) {
							previousValue.push(currentValue.U_TipoAlmacen);
						}
						return previousValue;
					}, [] );
					oProduct.arrayUsuariosAlmacen = [];
					let uIASxTipo = await serviceSL.onObtenerUsersIASxTipo(null,baseuri);
					let filterCostCenter = uIASxTipo.Resources.filter(e=>e["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"]);
					for (let i=0; i<aUsersAlmReduced.length; i++) {
						let object = aUsersAlmReduced[i];
						if(uIASxTipo.Resources.length > 0){
							if(filterCostCenter){
								let aAprobadoresIASAlmacen = filterCostCenter.filter(e=>e["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"].costCenter === object);
								if(aAprobadoresIASAlmacen.length > 0){
									aAprobadoresIASAlmacen.forEach( function(iasData){
										if(iasData.groups){
											let findGroupDespacho = iasData.groups.find(e=>e.display === "Grp_Aprobar_Despacho_Reserva");
											if(findGroupDespacho){
												oProduct.arrayUsuariosAlmacen.push(iasData.emails[0].value);
											}
										}
									})
								}
							}
						}
					}
				}
				var iQuantity = sap.ui.getCore().byId("sInpQuantity").getValue() * 1;
				var oResourceBundle = this.getModel("i18n").getResourceBundle();
				// var DatosCabecera = this.getView().getModel("localmodel").getData().itemSelected;
				cart.addToCart(oResourceBundle, oProduct, oCartModel, iQuantity, DatosCabecera, this.getView().getModel("localmodel"));
				this.cantidad_productos = (oCartModel.getProperty("/cartEntries")).length;
				this.getView().getModel("localmodel").setProperty("/listaProductosCantidad/value", this.cantidad_productos);
				this.onLimpiarCabeceraDetalle();
				this.onCancelQuantity();
				sap.ui.core.BusyIndicator.hide();
			}catch(e){
				sap.ui.core.BusyIndicator.hide();
			}
        },
        onChangeQuantity: function(oEvent){
            var oControl = oEvent.getSource();
            var fValue = oEvent.getParameter("value")
            var iMin = oControl.getMin();
			if(dataAlternativoDetalle){
				var oStockDetalle = dataAlternativoDetalle.InStock;
			}else {
				var oStockDetalle = this.getView().getModel("localmodel").getProperty("/ProductData").InStock;
			}
			if(fValue > oStockDetalle){
				oControl.setValue(oStockDetalle);
				MessageBox.warning("La cantidad excede la cantidad de stock.");
			}
            if (fValue < iMin){
                MessageBox.warning("La cantidad m\u00EDnima permitida es " + oControl.getMin() + ".");
                oControl.setValue(iMin);
                var oBinding = oControl.getBinding("value");
                if (oBinding){
                    setTimeout(function(){
                        oBinding.setValue(iMin)
                    }, 1000)
                    
                }
            }
        },
		onChangeQuantityCart: function(oEvent){
            var oControl = oEvent.getSource();
            var fValue = oEvent.getParameter("value")
            var iMin = oControl.getMin()
			var cantidadReserva = oEvent.getSource().getBindingContext("cartProducts").getObject().InStock;
			if(fValue > cantidadReserva){
				oControl.setValue(cantidadReserva);
				MessageBox.warning("La cantidad excede la cantidad de stock.");
			}
            if (fValue < iMin){
                MessageBox.warning("La cantidad m\u00EDnima permitida es " + oControl.getMin() + ".");
                oControl.setValue(iMin);
                var oBinding = oControl.getBinding("value");
                if (oBinding){
                    setTimeout(function(){
                        oBinding.setValue(iMin)
                    }, 1000)
                    
                }
            }
        },
		onCancelQuantity: function(oEvent){
			if (this.oDialogQuantity){
				this.oDialogQuantity.close();
				this.oDialogQuantity.destroy();
				this.oDialogQuantity = null;
			}
			this.onLimpiarCabeceraDetalle();
		},
		/**
		 * Clear comparison model
		 * @protected
		 */
		_clearComparison: function () {
			var oModel = this.getOwnerComponent().getModel("comparison");
			oModel.setData({
				category: "",
				item1: "",
				item2: ""
			});
        },
        handleSuggest: function(oEvent){
            var oControl = oEvent.getSource();
            var oTemplate = oControl.getBindingInfo("suggestionItems").template;
            
            var aFilters = [];
            var sTerm = oEvent.getParameter("suggestValue");
            if (sTerm) {
                aFilters.push(new Filter(oTemplate.getBindingPath("text"), FilterOperator.Contains, sTerm));
                aFilters.push(new Filter(oTemplate.getBindingPath("additionalText"), FilterOperator.Contains, sTerm));
            }
            oEvent.getSource().getBinding("suggestionItems").filter(new Filter({filters: aFilters, and: false}));
            oEvent.getSource().setFilterSuggests(false);            
        }
	});
});