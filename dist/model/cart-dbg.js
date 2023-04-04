sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (
	MessageBox,
	MessageToast) {
	"use strict";

	return {

		/**
		 * Checks for the status of the product that is added to the cart.
		 * If the product is not available, a message dialog will open.
		 * @public
		 * @param {Object} oBundle i18n bundle
		 * @param {Object} oProduct Product that is added to the cart
		 * @param {Object} oCartModel Cart model
		 */
		addToCart: function (oBundle, oProduct, oCartModel, iQuantity, DatosCabecera) {
			// Items to be added from the welcome view have it's content inside product object
			if (oProduct.Product !== undefined) {
				oProduct = oProduct.Product;
			}
			switch (oProduct.Status) {
			case "D":
				//show message dialog
				MessageBox.show(
					oBundle.getText("productStatusDiscontinuedMsg"), {
						icon: MessageBox.Icon.ERROR,
						titles: oBundle.getText("productStatusDiscontinuedTitle"),
						actions: [MessageBox.Action.CLOSE]
					});
				break;
			case "O":
				// show message dialog
				MessageBox.show(
					oBundle.getText("productStatusOutOfStockMsg"), {
						icon: MessageBox.Icon.QUESTION,
						title: oBundle.getText("productStatusOutOfStockTitle"),
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						onClose: function (oAction) {
							// order
							if (MessageBox.Action.OK === oAction) {
								this._updateCartItem(oBundle, oProduct, oCartModel, iQuantity);
							}
						}.bind(this)
					});
				break;
			case "A":
			default:
				this._updateCartItem(oBundle, oProduct, oCartModel, iQuantity, DatosCabecera);
				break;
			}
		},

		_updateCartItem: function (oBundle, oProductToBeAdded, oCartModel, iQuantity, DatosCabecera) {
			// find existing entry for product
			var oCollectionEntries = Object.assign([], oCartModel.getData()["cartEntries"]);
			var oCartEntry = oCollectionEntries.find(e=>e.WarehouseCode === oProductToBeAdded.WarehouseCode && e.ItemCode === oProductToBeAdded.ItemCode );
			// var oCartEntry = oCollectionEntries[oProductToBeAdded.WarehouseCode];

			if (!oCartEntry) {
				// create new entry
				oCartEntry = Object.assign({}, oProductToBeAdded);
				oCartEntry.Quantity = iQuantity;
				oCartEntry.DatosCabeceraV2 = DatosCabecera;
				oCartEntry.ClaveLabor = [];
				oCartEntry.ClaveLaborSelected = "";
				oCartEntry.CampoObjeto = [];
				oCartEntry.CampoObjetoSelected = "";
				oCartEntry.CentroCostoSelected = "";
				// oCollectionEntries[oProductToBeAdded.ItemCode] = oCartEntry;
				oCartModel.getProperty("/cartEntries").push(oCartEntry);
			} else {
				// update existing entry
				oCartEntry.Quantity += iQuantity;
			}
			//update the cart model
			// oCartModel.setProperty("/cartEntries", Object.assign({}, oCollectionEntries));
			oCartModel.refresh(true);
			MessageToast.show(oBundle.getText("productMsgAddedToCart", [oProductToBeAdded.ItemCode]));
		}
	};
});