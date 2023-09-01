sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"../model/formatter",
	"sap/m/MessageBox",
	"../service/serviceSL"
], function (
	BaseController,
	JSONModel,
	Device,
	formatter,
	MessageBox,
	serviceSL
) {
	"use strict";

	var sCartModelName = "cartProducts";
	var sSavedForLaterEntries = "savedForLaterEntries";
	var sCartEntries = "cartEntries";

	return BaseController.extend("zsandiego.crearreserva.controller.Cart", {
		formatter: formatter,

		onInit: function () {
			this._oRouter = this.getRouter();
			this._oRouter.getRoute("cart").attachPatternMatched(this._routePatternMatched, this);
			this._oRouter.getRoute("productCart").attachPatternMatched(this._routePatternMatched, this);
			this._oRouter.getRoute("comparisonCart").attachPatternMatched(this._routePatternMatched, this);
			// set initial ui configuration model
			var oCfgModel = new JSONModel({});
			this.getView().setModel(oCfgModel, "cfg");
			this._toggleCfgModel();

			var oEditButton = this.byId("editButton");
			oEditButton.addEventDelegate({
				onAfterRendering: function () {
					oEditButton.focus();
				}
			});
		},

		onExit: function () {
			if (this._orderDialog) {
				this._orderDialog.destroy();
			}
			if (this._orderBusyDialog) {
				this._orderBusyDialog.destroy();
			}
		},

		_routePatternMatched: function () {
			this._setLayout("Three");
			var oCartModel = this.getModel("cartProducts");
			var oCartEntries = oCartModel.getProperty("/cartEntries");
			//enables the proceed and edit buttons if the cart has entries
			if ((oCartEntries).length > 0) {
				oCartModel.setProperty("/showProceedButton", true);
				oCartModel.setProperty("/showEditButton", true);
			}
			//set selection of list back
			var oEntryList = this.byId("entryList");
			oEntryList.removeSelections();
		},

		onEditOrDoneButtonPress: function () {
            this._toggleCfgModel();
        },

		_toggleCfgModel: function () {
			let fCantidad = false;
			var oCfgModel = this.getView().getModel("cfg");
            var oCartModel = this.getOwnerComponent().getModel("cartProducts");
			oCartModel.getData().cartEntries.forEach( function(e){
				parseFloat(e.Quantity) === 0 ? fCantidad = true : null;
			})
			if(fCantidad){
				MessageBox.warning("Las cantidades registradas en las solicitudes deben ser mayores a 0.");
				return;
			}
			var oData = oCfgModel.getData();
			var oBundle = this.getResourceBundle();
			var bDataNoSetYet = !oData.hasOwnProperty("inDelete");
			var bInDelete = (bDataNoSetYet ? true : oData.inDelete);
			var sPhoneMode = (Device.system.phone ? "None" : "SingleSelectMaster");
			var sPhoneType = (Device.system.phone ? "Active" : "Inactive");

			oCfgModel.setData({
				inDelete: !bInDelete,
				notInDelete: bInDelete,
				listMode: (bInDelete ? sPhoneMode : "Delete"),
				listItemType: (bInDelete ? sPhoneType : "Inactive"),
				pageTitle: (bInDelete ? oBundle.getText("appTitle") : oBundle.getText("cartTitleEdit"))
            });
            oCartModel.refresh(true);
		},

		onEntryListPress: function (oEvent) {
			this._showProduct(oEvent.getSource());
		},

		onEntryListSelect: function (oEvent) {
			this._showProduct(oEvent.getParameter("listItem"));
		},

		/**
		 * Called when the "save for later" link of a product in the cart is pressed.
		 * @public
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onSaveForLater: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext(sCartModelName);
			this._changeList(sSavedForLaterEntries, sCartEntries, oBindingContext);
		},

		/**
		 * Called when the "Add back to basket" link of a product in the saved for later list is pressed.
		 * @public
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onAddBackToBasket: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext(sCartModelName);

			this._changeList(sCartEntries, sSavedForLaterEntries, oBindingContext);
		},

		/**
		 * Moves a product from one list to another.
		 * @private
		 * @param {string} sListToAddItem Name of list, where item should be moved to
		 * @param {string} sListToDeleteItem Name of list, where item should be removed from
		 * @param {Object} oBindingContext Binding context of product
		 */
		_changeList: function (sListToAddItem, sListToDeleteItem, oBindingContext) {
			var oCartModel = oBindingContext.getModel();
			var oProduct = oBindingContext.getObject();
			var oModelData = oCartModel.getData();
			// why are the items cloned? - the JSON model checks if the values in the object are changed.
			// if we do our modifications on the same reference, there will be no change detected.
			// so we modify after the clone.
			var oListToAddItem = Object.assign({}, oModelData[sListToAddItem]);
			var oListToDeleteItem = Object.assign({}, oModelData[sListToDeleteItem]);
			var sProductId = oProduct.Item;

			// find existing entry for product
			if (oListToAddItem[sProductId] === undefined) {
				// copy new entry
				oListToAddItem[sProductId] = Object.assign({}, oProduct);
			}

			//Delete the saved Product from cart
			delete oListToDeleteItem[sProductId];
			oCartModel.setProperty("/" + sListToAddItem, oListToAddItem);
			oCartModel.setProperty("/" + sListToDeleteItem, oListToDeleteItem);
		},

		_showProduct: function (oItem) {
			var oEntry = oItem.getBindingContext(sCartModelName).getObject();

			// close cart when showing a product on phone
			var bCartVisible = false;
			if (!Device.system.phone) {
				bCartVisible = this.getModel("appView").getProperty("/layout").startsWith("Three");
			} else {
				bCartVisible = false;
				this._setLayout("Two");
			}
			this._oRouter.navTo(bCartVisible ? "productCart" : "product", {
				id: oEntry.Category,
				productId: oEntry.ProductId
			}, !Device.system.phone);
		},

		onCartEntriesDelete: function (oEvent) {
			this._deleteProduct(sCartEntries, oEvent);
		},

		onSaveForLaterDelete: function (oEvent) {
			this._deleteProduct(sSavedForLaterEntries, oEvent);
		},

		/**
		 * Helper function for the deletion of items from <code>cart</code> or <code>savedForLater</code> list.
		 * If the delete button is pressed, a message dialog will open.
		 * @private
		 * @param {string} sCollection the collection name
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		_deleteProduct: function (sCollection, oEvent) {
            var oBindingContext = oEvent.getParameter("listItem").getBindingContext(sCartModelName);
			var sEntryId = oBindingContext.getObject().Item;
			var oBundle = this.getResourceBundle();

			// show confirmation dialog
			MessageBox.show(oBundle.getText("cartDeleteDialogMsg"), {
				title: oBundle.getText("cartDeleteDialogTitle"),
				actions: [
					MessageBox.Action.DELETE,
					MessageBox.Action.CANCEL
				],
				onClose: function (oAction) {
					if (oAction !== MessageBox.Action.DELETE) {
						return;
					}
					var oCartModel = oBindingContext.getModel();
					var oCollectionEntries = Object.assign({}, oCartModel.getData()[sCollection]);

					delete oCollectionEntries[sEntryId];

					// update model
					oCartModel.setProperty("/" + sCollection, Object.assign({}, oCollectionEntries));
				}
			});
		},

		/**
		 * Called when the proceed button in the cart is pressed.
		 * Navigates to the checkout wizard
		 * @public
		 */
		onProceedButtonPress: async function () {
			try{
				sap.ui.core.BusyIndicator.show(0);
				var oCartModel = this.getModel("cartProducts");
				// await this.consultaActivoFijoWizard();
				var cantidadMateriales = (oCartModel.getProperty("/cartEntries")).length;
				this.getView().getModel("localmodel").setProperty("/listaProductosCantidad/value", cantidadMateriales);
				this.getRouter().navTo("checkout");
				sap.ui.core.BusyIndicator.hide();
			} catch(e){
				MessageBox.warning("Error al cargar los datos maestros");
				sap.ui.core.BusyIndicator.hide();
			}
		},
		consultaActivoFijoWizard: async function(){
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			// var oDatosActivoFijo = await serviceSL.onConsultaServiceLayer(baseuri,"Items?$filter=ItemType eq 'itFixedAssets' and Valid eq 'tYES'");
			var oDatosActivoFijo = await serviceSL.consultaGeneralB1SL(baseuri,"/Items?$filter=ItemType eq 'itFixedAssets' and Valid eq 'tYES'");
			this.getView().getModel("localmodel").setProperty("/ActivoFijo",oDatosActivoFijo.value);
		},
	});
});