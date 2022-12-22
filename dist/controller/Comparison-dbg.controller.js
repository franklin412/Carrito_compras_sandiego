sap.ui.define([
	'./BaseController',
	'../model/formatter',
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, formatter, MessageToast, MessageBox, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("zsandiego.carritocompras.controller.Comparison", {
		formatter: formatter,
		onInit: function () {
			this._oRouter = this.getRouter();
			this._oRouter.getRoute("comparison").attachPatternMatched(this._onRoutePatternMatched, this);
			this._oRouter.getRoute("comparisonCart").attachPatternMatched(this._onRoutePatternMatched, this);
			this.ComparisoncomprasSPOT = sap.ui.xmlfragment("zsandiego.carritocompras.view.fragment.ComparisonComprasSPOT", this);
			this.getView().addDependent(this.ComparisoncomprasSPOT);
		},

		_onRoutePatternMatched: function (oEvent) {
			var oContainer = this.byId("comparisonContainer");
			var oParameters = oEvent.getParameter("arguments");
			var oPlaceholder = this.byId("placeholder");

			// save category and current products
            this.getModel("comparison").setProperty("/category", oParameters.id);
            this.getModel("comparison").setProperty("/categoryType", oParameters.category);
			this.getModel("comparison").setProperty("/item1", oParameters.item1Id);
			this.getModel("comparison").setProperty("/item2", oParameters.item2Id);
            
			// update the comparison panels
			oPlaceholder.setVisible(false);
			updatePanel(0, oParameters.item1Id, oParameters.id, oParameters.category, this.getModel("catalogo"));
			updatePanel(1, oParameters.item2Id, oParameters.id, oParameters.category, this.getModel("catalogo"));

            // helper function to update the panel binding
			function updatePanel(iWhich, sId, sCategory, sCategoryType, model) {
				var oPanel = oContainer.getItems()[iWhich];
				if (sId) {
                    var sPath = "catalogo>/" + model.createKey("materialesSet", {
                        Item: sId,
                        Catyp: sCategoryType,
                        Catnr: sCategory
                    });                    
					oPanel.bindElement({
                        path: sPath
					});
					oPanel.setVisible(true);
				} else {
					oPanel.unbindElement();
					oPanel.setVisible(false);
					oPlaceholder.setVisible(true);
				}
			}
		},

		onRemoveComparison: function (oEvent) {
            var oBinding = oEvent.getSource().getBindingContext("catalogo");
            var sCategoryType = this.getModel("comparison").getProperty("/categoryType"); 
			var sItem1Id = this.getModel("comparison").getProperty("/item1");
			var bRemoveFirst = sItem1Id === oBinding.getObject().Item;
			var sRemainingItemId = this.getModel("comparison").getProperty("/item" + (bRemoveFirst ? 2 : 1));
			var sCategory = this.getModel("comparison").getProperty("/category");

			// navigate to comparison view without the removed product
			this.getRouter().navTo("comparison", {
                id: sCategory,
                category: sCategoryType,
				item1Id: sRemainingItemId
			}, true);
		},

		/**
		 * Navigate to the generic cart view
		 * @param {sap.ui.base.Event} @param oEvent the button press event
		 */
		onToggleCart: function (oEvent) {
			var bPressed = oEvent.getParameter("pressed");
			var sItem1Id = this.getView().getModel("comparison").getProperty("/item1");
			var sItem2Id = this.getView().getModel("comparison").getProperty("/item2");
			var sCategory = this.getView().getModel("comparison").getProperty("/category");
            var sCategoryType = this.getView().getModel("comparison").getProperty("/categoryType"); 

			this._setLayout(bPressed ? "Three" : "Two");
			this.getRouter().navTo(bPressed ? "comparisonCart" : "comparison", {
                id: sCategory,
                category: sCategoryType,
				item1Id: sItem1Id,
				item2Id: sItem2Id
			});
		},
		pressComprasSpot: function () {
			this.ComparisoncomprasSPOT.open();
		},
		onRegistrarCompraSPOT: function (oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var oResourceBundle = this.getModel("i18n").getResourceBundle();
			var Proveedor = sap.ui.getCore().byId("_idComprasProv").getValue();
			var GrupoArticulo = sap.ui.getCore().byId("_idGrupoArticulo").getValue();
			var nombreMaterial = sap.ui.getCore().byId("_idNombreMaterial").getValue();
			var cantidad = sap.ui.getCore().byId("_idCantidadSPOT").getValue();
			var unidadmedida = sap.ui.getCore().byId("_idUnidadMedida").getValue();
			var precio = sap.ui.getCore().byId("_idPrecio").getValue();

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
				sap.ui.getCore().byId("_idCantidadSPOT").setValue();
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
				sap.ui.getCore().byId("_idPrecio").setValue();
				return;
			}
			var oCartModel = this.getModel("cartProducts");
			/*var datosSPOT = {
				"ProductID": serieMaterial 
			};*/
			//this.cartProducts.getProperty("/cartEntries").push(datos);
			var cantidadMateriales = Object.keys(oCartModel.getProperty("/cartEntries")).length;
			this.getView().getModel("localmodel").setProperty("/listaProductosCantidad/value", cantidadMateriales);
			var serieMaterial = cantidadMateriales + 1;
			var datos = {
				"SupplierName": Proveedor,
				"Detalle": {},
				"highlight": "Warning",
				"GrupoArticulo": GrupoArticulo,
				"ProductId": serieMaterial,
				"Status": "A",
				"CurrencyCode": "USD",
				"Name": nombreMaterial,
				"Price": precio,
				"Quantity": cantidad,
				"Unit": unidadmedida
			};
			this.addToCart(oResourceBundle, datos, oCartModel);
			this.ComparisoncomprasSPOT.close();
			this.limpiarComprasSPOT();
		},
		addToCart: function (oBundle, oProduct, oCartModel) {
			this._updateCartItem(oBundle, oProduct, oCartModel);
		},
		_updateCartItem: function (oBundle, oProductToBeAdded, oCartModel) {
			// find existing entry for product

			//var oCollectionEntries = Object.assign({});
			var cantidad = sap.ui.getCore().byId("_idCantidadSPOT").getValue();
			var oCollectionEntries = Object.assign({}, oCartModel.getData()["cartEntries"]);
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
			oCartModel.setProperty("/cartEntries", Object.assign({}, oCollectionEntries));
			//oCartModel.getProperty("/cartEntries").push(oCollectionEntries);
			oCartModel.refresh(true);
			MessageToast.show(oBundle.getText("productMsgAddedToCart", [oProductToBeAdded.Name]));
		},
		limpiarComprasSPOT: function () {
			sap.ui.getCore().byId("_idGrupoArticulo").setValue();
			sap.ui.getCore().byId("_idComprasProv").setValue();
			sap.ui.getCore().byId("_idUnidadMedida").setValue();
			sap.ui.getCore().byId("_idNombreMaterial").setValue();
			sap.ui.getCore().byId("_idCantidadSPOT").setValue();
			sap.ui.getCore().byId("_idPrecio").setValue();
		},
		onSalirComprasSPOT: function () {
			this.ComparisoncomprasSPOT.close();
			this.limpiarComprasSPOT();
		},
		openFragProveedor: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var that = this;
			that.inputId = "_idComprasProv";
			// create value help dialog
			if (!that._valueHelpDialog) {
				that._valueHelpDialog = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.ProveedorSPOT.ComparisonComprasSPOT",
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
				var productInput = sap.ui.getCore().byId("_idComprasProv");
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);

		},
		openFragUM: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var that = this;
			that.inputId = "_idUnidadMedida";
			// create value help dialog
			if (!that._valueHelpDialogUMProduct) {
				that._valueHelpDialogUMProduct = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.UnidadMedida.ComparisonUM",
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
				var productInput = sap.ui.getCore().byId("_idUnidadMedida");
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		openFragGA: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var that = this;
			that.inputId = "_idGrupoArticulo";
			// create value help dialog
			if (!that._valueHelpDialogGArt) {
				that._valueHelpDialogGArt = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.GrupoArticulo.WelcomeGrupoArt",
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
				var productInput1 = sap.ui.getCore().byId("_idGrupoArticulo");
				productInput1.setValue(oSelectedItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
		}
	});
});