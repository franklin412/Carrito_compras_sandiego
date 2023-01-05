sap.ui.define([
	"./BaseController",
	"../model/cart",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/Device"
], function (BaseController, cart, JSONModel, Filter, FilterOperator, formatter, MessageToast, MessageBox, Device) {
	"use strict";

	return BaseController.extend("zsandiego.carritocompras.controller.Welcome", {

		_iCarouselTimeout: 0, // a pointer to the current timeout
		_iCarouselLoopTime: 6000, // loop to next picture after 8 seconds

		formatter: formatter,

		_mFilters: {
			Promoted: [new Filter("Type", "EQ", "Promoted")],
			Viewed: [new Filter("Type", "EQ", "Viewed")],
			Favorite: [new Filter("Type", "EQ", "Favorite")]
		},
		onInit: function () {
            
            var oViewModel = new JSONModel({
				welcomeCarouselSlider1: 'zsandiego/carritocompras/img/image2Main.png',
				welcomeCarouselSlider2: 'zsandiego/carritocompras/img/imageMain.png',
				Promoted: [],
				Viewed: [],
				Favorite: [],
				Currency: "USD"
			});
			this.getView().setModel(oViewModel, "view");
			this.getRouter().attachRouteMatched(this._onRouteMatched, this);

			// select random carousel page at start
			var oWelcomeCarousel = this.byId("welcomeCarousel");
			var iRandomIndex = Math.floor(Math.abs(Math.random()) * oWelcomeCarousel.getPages().length);
			oWelcomeCarousel.setActivePage(oWelcomeCarousel.getPages()[iRandomIndex]);

			this.cartProducts = this.getOwnerComponent().getModel("cartProducts");

            
			// FRAGMENT ABRIR COMPRAS SPOT
			this.comprasSPOT = sap.ui.xmlfragment("zsandiego.carritocompras.view.fragment.ComprasSPOT", this);
			this.getView().addDependent(this.comprasSPOT);

            if (Device.system.phone){
                this.onShowCategories();
            }
		},

		/**
		 * lifecycle hook that will initialize the welcome carousel
		 */
		onAfterRendering: function () {
			this.onCarouselPageChanged();
		},

		_onRouteMatched: function (oEvent) {
			var sRouteName = oEvent.getParameter("name");

			// always display two columns for home screen
			if (sRouteName === "home") {
				this._setLayout("Two");
			}

		},

		/**
		 * clear previous animation and initialize the loop animation of the welcome carousel
		 */
		onCarouselPageChanged: function () {
			clearTimeout(this._iCarouselTimeout);
			this._iCarouselTimeout = setTimeout(function () {
				var oWelcomeCarousel = this.byId("welcomeCarousel");
				if (oWelcomeCarousel) {
					oWelcomeCarousel.next();
					this.onCarouselPageChanged();
				}
			}.bind(this), this._iCarouselLoopTime);
		},

		/**
		 * Event handler to determine which link the user has clicked
		 * @param {sap.ui.base.Event} oEvent the press event of the link
		 */
		onSelectProduct: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("view");
			var sCategoryId = oContext.getProperty("Product/Category");
			var sProductId = oContext.getProperty("Product/ProductId");
			this.getRouter().navTo("product", {
				id: sCategoryId,
				productId: sProductId
			});
		},

		/**
		 * Navigates to the category overview on phones
		 */
		onShowCategories: function () {
			this.getRouter().navTo("categories");
		},

		/**
		 * Event handler to determine which button was clicked
		 * @param {sap.ui.base.Event} oEvent the button press event
		 */
		onAddToCart: function (oEvent) {
			
			var oProduct = oEvent.getSource().getBindingContext("view").getObject();
			if (!this.oDialogQuantity) {
				this.oDialogQuantity = sap.ui.xmlfragment("zsandiego.carritocompras.view.fragment.addQuantity", this);
				this.getView().addDependent(this.oDialogQuantity);
			}
			this.oDialogQuantity.data("oProduct", oProduct);
			this.oDialogQuantity.open();
			
		},
		onRegistrarCompraSPOT: function (oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var oResourceBundle = this.getModel("i18n").getResourceBundle();
			var Proveedor = sap.ui.getCore().byId("idComprasProv").getValue();
			var GrupoArticulo = sap.ui.getCore().byId("idGrupoArticulo").getValue();
			var nombreMaterial = sap.ui.getCore().byId("idNombreMaterial").getValue();
			var cantidad = sap.ui.getCore().byId("idCantidadSPOT").getValue();
			var unidadmedida = sap.ui.getCore().byId("idUnidadMedida").getValue();
			var precio = sap.ui.getCore().byId("idPrecio").getValue();

			if (Proveedor.length === 0) {
				MessageBox.warning(
					"Seleccione un proveedor", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			} else if (GrupoArticulo.length === 0) {
				MessageBox.warning(
					"Seleccione el grupo de artículo", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			} else if (nombreMaterial.length === 0) {
				MessageBox.warning(
					"Ingrese el nombre de material", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			} else if (cantidad.length === 0) {
				MessageBox.warning(
					"Ingrese la cantidad del material", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			} else if (cantidad == 0) {
				MessageBox.warning(
					"Ingresa una cantidad diferente a 0", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				sap.ui.getCore().byId("idCantidadSPOT").setValue();
				return;
			} else if (unidadmedida.length === 0) {
				MessageBox.warning(
					"Ingrese la unidad de medida", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			} else if (precio.length === 0) {
				MessageBox.warning(
					"Ingrese el precio unitario del material", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			} else if (precio == 0) {
				MessageBox.warning(
					"Ingresa un precio unitario diferente a 0", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				sap.ui.getCore().byId("idPrecio").setValue();
				return;
			}
			var oCartModel = this.getModel("cartProducts");
			/*var datosSPOT = {
				"ProductID": serieMaterial 
			};*/
			//this.cartProducts.getProperty("/cartEntries").push(datos);
			var cantidadMateriales = (oCartModel.getProperty("/cartEntries")).length;
			this.getView().getModel("localmodel").setProperty("/listaProductosCantidad/value", cantidadMateriales);
			var serieMaterial = cantidadMateriales + 1;
			var datos = {
				"SupplierName": Proveedor,
				"GrupoArticulo": GrupoArticulo,
				"Detalle": {},
				"Status": "A",
				"highlight": "Warning",
				"ProductId": serieMaterial,
				"CurrencyCode": "USD",
				"Name": nombreMaterial,
				"Price": precio,
				"Quantity": cantidad,
				"Unit": unidadmedida
			};
			this.addToCart(oResourceBundle, datos, oCartModel);
			this.comprasSPOT.close();
			this.limpiarComprasSPOT();
		},
		openFragProveedor: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var that = this;
			that.inputId = "idComprasProv";
			if (!that._valueHelpDialogProv) {
				that._valueHelpDialogProv = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.ProveedorSPOT.WelcomeComprasSPOT",
					that
				);
				that.getView().addDependent(that._valueHelpDialogProv);
			}
			that._valueHelpDialogProv.getBinding("items").filter([new Filter(
				"descripcionProv",
				FilterOperator.Contains, sInputValue
			)]);
			that._valueHelpDialogProv.open(sInputValue);
		},

		_handleValueHelpSearchProveedor: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"descripcionProv",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpCloseProv: function (evt) {

			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = sap.ui.getCore().byId("idComprasProv");
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);

		},
		openFragUM: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var that = this;
			that.inputId = "idUnidadMedida";
			// create value help dialog
			if (!that._valueHelpDialogUM) {
				that._valueHelpDialogUM = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.UnidadMedida.WelcomeUM",
					that
				);
				that.getView().addDependent(that._valueHelpDialogUM);
			}
			that._valueHelpDialogUM.getBinding("items").filter([new Filter(
				"unidad",
				FilterOperator.Contains, sInputValue
			)]);
			// open value help dialog filtered by the input value
			that._valueHelpDialogUM.open(sInputValue);
		},
		_handleValueHelpSearchUM: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"unidad",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpCloseUM: function (evt) {

			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = sap.ui.getCore().byId("idUnidadMedida");
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},

		onSalirComprasSPOT: function () {
			this.comprasSPOT.close();
			this.limpiarComprasSPOT();
		},
		limpiarComprasSPOT: function () {
			sap.ui.getCore().byId("idGrupoArticulo").setValue();
			sap.ui.getCore().byId("idUnidadMedida").setValue();
			sap.ui.getCore().byId("idComprasProv").setValue();
			sap.ui.getCore().byId("idNombreMaterial").setValue();
			sap.ui.getCore().byId("idCantidadSPOT").setValue();
			sap.ui.getCore().byId("idPrecio").setValue();
		},
		addToCart: function (oBundle, oProduct, oCartModel) {
			this._updateCartItem(oBundle, oProduct, oCartModel);
		},
		_updateCartItem: function (oBundle, oProductToBeAdded, oCartModel) {
			// find existing entry for product

			//var oCollectionEntries = Object.assign({});
			var cantidad = sap.ui.getCore().byId("idCantidadSPOT").getValue();
			var oCollectionEntries = Object.assign([], oCartModel.getData()["cartEntries"]);
			var oCartEntry = oCollectionEntries[oProductToBeAdded.ProductId];

			if (oCartEntry === undefined) {
				// create new entry
				oCartEntry = Object.assign({}, oProductToBeAdded);
				oCartEntry.Quantity = cantidad;
				oCollectionEntries[oProductToBeAdded.ProductId] = oCartEntry;
			} else {
				// update existing entry
				oCartEntry.Quantity = cantidad;
			}
			//update the cart model
			// oCartModel.setProperty("/cartEntries", Object.assign({}, oCollectionEntries));
			//oCartModel.getProperty("/cartEntries").push(oCollectionEntries);
			oCartModel.refresh(true);
			MessageToast.show(oBundle.getText("productMsgAddedToCart", [oProductToBeAdded.Name]));
		},

		/**
		 * Navigate to the generic cart view
		 * @param {sap.ui.base.Event} @param oEvent the button press event
		 */
		onToggleCart: function (oEvent) {
			var bPressed = oEvent.getParameter("pressed");

			this._setLayout(bPressed ? "Three" : "Two");
			this.getRouter().navTo(bPressed ? "cart" : "home");
		},

		/**
		 * Select two random elements from the promoted products array
		 * @private
		 */
		_selectPromotedItems: function () {
			var aPromotedItems = this.getView().getModel("view").getProperty("/Promoted");
			var iRandom1, iRandom2 = Math.floor(Math.random() * aPromotedItems.length);
			do {
				iRandom1 = Math.floor(Math.random() * aPromotedItems.length);
			} while (iRandom1 === iRandom2);
			this.getModel("view").setProperty("/Promoted", [aPromotedItems[iRandom1], aPromotedItems[iRandom2]]);
		},
		onAvatarPress: function () {
            const bus = this.getOwnerComponent().getEventBus();
            bus.publish("app", "openDatosCabecera", {  });
		},
		openFragAsignacion: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.Checkout.Clasepedido",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}
			this._valueHelpDialog.getBinding("items").filter([new Filter(
				"codigoclasepedido",
				FilterOperator.Contains, sInputValue
			)]);
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},
		_handleValueHelpSearchAsignacion: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"codigoclasepedido",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpCloseAsignacion: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = sap.ui.getCore().byId("idfragasignacionxx1_");
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
			var pathcentro = evt.getSource()._list._aSelectedPaths.concat().pop();
			var lineacentro = this.localmodel.getProperty(pathcentro);
			this.localmodel.setProperty("/lineaCabeceraDetalle/Clasepedido", lineacentro.descripcion);
			this.localmodel.setProperty("/lineacentrocosto", lineacentro);
			this.localmodel.setProperty("/localmodel/lineafragmento", {});

		},

		openFragGA: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var that = this;
			that.inputId = "idGrupoArticulo";
			// create value help dialog
			if (!that._valueHelpDialogGA) {
				that._valueHelpDialogGA = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.GrupoArticulo.WelcomeGrupoArt",
					that
				);
				that.getView().addDependent(that._valueHelpDialogGA);
			}
			that._valueHelpDialogGA.getBinding("items").filter([new Filter(
				"grupoArticulotext",
				FilterOperator.Contains, sInputValue
			)]);
			// open value help dialog filtered by the input value
			that._valueHelpDialogGA.open(sInputValue);
		},
		_handleValueHelpSearchGA: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"grupoArticulotext",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpCloseGA: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput1 = sap.ui.getCore().byId("idGrupoArticulo");
				productInput1.setValue(oSelectedItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		pressComprasSpot: function () {
			this.comprasSPOT.open();
		},
		onAddQuantity: function(oEvent){
			var oProduct = oEvent.getSource().getParent().data("oProduct");
			var iQuantity = sap.ui.getCore().byId("sInpQuantity").getValue() * 1;
			var oResourceBundle = this.getModel("i18n").getResourceBundle();
			var oCartModel = this.getModel("cartProducts");
			cart.addToCart(oResourceBundle, oProduct, oCartModel, iQuantity);
			this.cantidad_productos = oCartModel.getProperty("/cartEntries").length;
			this.getView().getModel("localmodel").setProperty("/listaProductosCantidad/value", this.cantidad_productos);
			this.onCancelQuantity();
		},
		onCancelQuantity: function(oEvent){
			if (this.oDialogQuantity){
				this.oDialogQuantity.close();
				this.oDialogQuantity.destroy();
				this.oDialogQuantity = null;
			}
		}
	});
});