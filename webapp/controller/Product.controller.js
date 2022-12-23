sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function (
	BaseController, formatter, MessageToast, MessageBox, Filter, FilterOperator,JSONModel) {
	"use strict";

	return BaseController.extend("zsandiego.carritocompras.controller.Product", {
		formatter: formatter,

		onInit: function () {
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			var oViewModel = new JSONModel({
				Url_Imagen: baseuri+'img/almacen02.png',
				welcomeCarouselSlider2: 'zsandiego/carritocompras/img/slider2.png',
				Promoted: [],
				Viewed: [],
				Favorite: [],
				Currency: "USD"
			});
			this.getView().setModel(oViewModel, "productImagen");
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("product").attachPatternMatched(this._routePatternMatched, this);

			this._router.getTarget("product").attachDisplay(function (oEvent) {
                // this.fnUpdateProduct(oEvent.getParameter("data").productId, oEvent.getParameter("data").productType, oEvent.getParameter("data").id); // update the binding based on products cart selection
			}, this);
			this.ProductcomprasSPOT = sap.ui.xmlfragment("zsandiego.carritocompras.view.fragment.ProductComprasSPOT", this);
            this.getView().addDependent(this.ProductcomprasSPOT);
            
            //this.openIngresarCabecera = sap.ui.xmlfragment("zsandiego.carritocompras.view.fragment.DatosCabecera", this);
			//this.getView().addDependent(this.openIngresarCabecera);

		},
		onAvatarPress: function () {
            const bus = this.getOwnerComponent().getEventBus();
            bus.publish("app", "openDatosCabecera", {  });
		},
		_routePatternMatched: function (oEvent) {
            
            var sId = oEvent.getParameter("arguments").productId,
                sType = oEvent.getParameter("arguments").productType,
                sCategoryId = oEvent.getParameter("arguments").id,
				oView = this.getView(),
                oModel = oView.getModel("catalogo");
                var that = this;
			// the binding should be done after insuring that the metadata is loaded successfully
			// oModel.metadataLoaded().then(function () {
			// 	var sPath = "catalogo>/" + that.getModel("catalogo").createKey("materialesSet", {
            //         Item: sId,
            //         Catyp: sType,
            //         Catnr: sCategoryId
			// 	});
			// 	oView.bindElement({
			// 		path: sPath,
			// 		events: {
			// 			dataRequested: function () {
			// 				oView.setBusy(true);
			// 			},
			// 			dataReceived: function () {
			// 				oView.setBusy(false);
			// 			}
			// 		}
			// 	});
			// 	var oData = oModel.getData(sPath);
			// 	//if there is no data the model has to request new data
			// 	if (!oData) {
			// 		oView.setBusyIndicatorDelay(0);
			// 		oView.getElementBinding().attachEventOnce("dataReceived", function () {
			// 			// reset to default
			// 			oView.setBusyIndicatorDelay(null);
			// 			this._checkIfProductAvailable(sPath);
			// 		}.bind(this));
			// 	}
			// }.bind(this));
		},

		fnUpdateProduct: function (productId, productType, categoryId) {
            var sPath = "localmodel>/" + this.getView().getModel("localmodel").createKey("materialesSet", {
                Item: productId,
                Catyp: productType,
                Catnr: categoryId
            });            
			var fnCheck = function () {
					this._checkIfProductAvailable(sPath);
				};

			this.getView().bindElement({
				path: sPath,
				events: {
					change: fnCheck.bind(this)
				}
			});
		},

		_checkIfProductAvailable: function (sPath) {
            var oModel = this.getModel("localmodel");
			var oData = oModel.getData(sPath.replace("localmodel>", ""));

			// show not found page
			if (!oData) {
				this._router.getTargets().display("notFound");
			}
		},

		/**
		 * Navigate to the generic cart view
		 * @param {sap.ui.base.Event} @param oEvent the button press event
		 */
		onToggleCart: function (oEvent) {
			var bPressed = oEvent.getParameter("pressed");
			var oEntry = this.getView().getModel("localmodel").getProperty("/ProductData");
            this._setLayout(bPressed ? "Three" : "Two");
			this.getRouter().navTo(bPressed ? "productCart" : "product", {
                id: oEntry.ItemCode,
                productType: oEntry.WarehouseCode,
				productId: oEntry.InStock
			});
		},
		pressComprasSpot: function () {
			this.ProductcomprasSPOT.open();
		},
		onRegistrarCompraSPOT: function (oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var oResourceBundle = this.getModel("i18n").getResourceBundle();
			var Proveedor = sap.ui.getCore().byId("idComprasProv_").getValue();
			var GrupoArticulo = sap.ui.getCore().byId("idGrupoArticulo_").getValue();
			var nombreMaterial = sap.ui.getCore().byId("idNombreMaterial_").getValue();
			var cantidad = sap.ui.getCore().byId("idCantidadSPOT_").getValue();
			var unidadmedida = sap.ui.getCore().byId("idUnidadMedida_").getValue();
			var precio = sap.ui.getCore().byId("idPrecio_").getValue();

			if (Proveedor.length === 0) {
				MessageBox.warning(
					"Seleccione un proveedor", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			} else if (GrupoArticulo.length === 0) {
				MessageBox.warning(
					"Seleccione un grupo de artículo", {
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
				sap.ui.getCore().byId("idCantidadSPOT_").setValue();
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
				sap.ui.getCore().byId("idPrecio_").setValue();
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
				"SupplierName": "Compras SPOT",
				"Detalle": {},
				"GrupoArticulo": GrupoArticulo,
				"highlight": "Warning",
				"Status": "A",
				"ProductId": serieMaterial,
				"CurrencyCode": "USD",
				"Name": nombreMaterial,
				"Price": precio,
				"Quantity": cantidad,
				"Unit": unidadmedida
			};
			this.addToCart(oResourceBundle, datos, oCartModel);
			this.ProductcomprasSPOT.close();
			this.limpiarComprasSPOT();
		},
		addToCart: function (oBundle, oProduct, oCartModel) {
			this._updateCartItem(oBundle, oProduct, oCartModel);
		},
		_updateCartItem: function (oBundle, oProductToBeAdded, oCartModel) {
			// find existing entry for product

			//var oCollectionEntries = Object.assign({});
			var cantidad = sap.ui.getCore().byId("idCantidadSPOT_").getValue();
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
		limpiarComprasSPOT: function () {
			sap.ui.getCore().byId("idGrupoArticulo_").setValue();
			sap.ui.getCore().byId("idUnidadMedida_").setValue();
			sap.ui.getCore().byId("idComprasProv_").setValue();
			sap.ui.getCore().byId("idNombreMaterial_").setValue();
			sap.ui.getCore().byId("idCantidadSPOT_").setValue();
			sap.ui.getCore().byId("idPrecio_").setValue();
		},
		onSalirComprasSPOT: function () {
			this.ProductcomprasSPOT.close();
			this.limpiarComprasSPOT();
		},
		openFragProveedor: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var that = this;
			that.inputId = "idComprasProv_";
			// create value help dialog
			if (!that._valueHelpDialog) {
				that._valueHelpDialog = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.ProveedorSPOT.WelcomeComprasSPOT",
					that
				);
				that.getView().addDependent(that._valueHelpDialog);
			}
			that._valueHelpDialog.getBinding("items").filter([new Filter(
				"descripcionProv",
				FilterOperator.Contains, sInputValue
			)]);
			// open value help dialog filtered by the input value
			that._valueHelpDialog.open(sInputValue);

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
				var productInput = sap.ui.getCore().byId("idComprasProv_");
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);

        },
		openFragUM: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var that = this;
			that.inputId = "idUnidadMedida_";
			// create value help dialog
			if (!that._valueHelpDialogUMProduct) {
				that._valueHelpDialogUMProduct = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.UnidadMedida.ProductUM",
					that
				);
				that.getView().addDependent(that._valueHelpDialogUMProduct);
			}
			that._valueHelpDialogUMProduct.getBinding("items").filter([new Filter(
				"unidad",
				FilterOperator.Contains, sInputValue
			)]);
			// open value help dialog filtered by the input value
			that._valueHelpDialogUMProduct.open(sInputValue);
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
				var productInput = sap.ui.getCore().byId("idUnidadMedida_");
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		openFragGA: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var that = this;
			that.inputId = "idGrupoArticulo_";
			// create value help dialog
			if (!that._valueHelpDialogGArt) {
				that._valueHelpDialogGArt = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.GrupoArticulo.ProductGrupoArt",
					that
				);
				that.getView().addDependent(that._valueHelpDialogGArt);
			}
			that._valueHelpDialogGArt.getBinding("items").filter([new Filter(
				"grupoArticulotext",
				FilterOperator.Contains, sInputValue
			)]);
			// open value help dialog filtered by the input value
			that._valueHelpDialogGArt.open(sInputValue);
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
				var productInput1 = sap.ui.getCore().byId("idGrupoArticulo_");
				productInput1.setValue(oSelectedItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
		}
	});
});