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
		addToCart: function (oBundle, oProduct, oCartModel, iQuantity) {
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
				this._updateCartItem(oBundle, oProduct, oCartModel, iQuantity);
				break;
			}
		},

		_updateCartItem: function (oBundle, oProductToBeAdded, oCartModel, iQuantity) {
			// find existing entry for product
			var oCollectionEntries = Object.assign({}, oCartModel.getData()["cartEntries"]);
			var oCartEntry = oCollectionEntries[oProductToBeAdded.Item];

			if (oCartEntry === undefined) {
				// create new entry
				oCartEntry = Object.assign({}, oProductToBeAdded);
				oCartEntry.Quantity = iQuantity;
				oCollectionEntries[oProductToBeAdded.Item] = oCartEntry;
			} else {
				// update existing entry
				oCartEntry.Quantity += iQuantity;
			}
			//update the cart model
			oCartModel.setProperty("/cartEntries", Object.assign({}, oCollectionEntries));
			oCartModel.refresh(true);
			MessageToast.show(oBundle.getText("productMsgAddedToCart", [oProductToBeAdded.Itetx]));
		}
	};
});