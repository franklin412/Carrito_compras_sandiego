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
		addToCart: function (oBundle, oProduct, oCartModel, iQuantity, DatosCabecera,localmodel) {
			// Items to be added from the welcome view have it's content inside product object
			if (oProduct.Product !== undefined) {
				oProduct = oProduct.Product;
			}
			switch (oProduct.Status) {
			default:
				this._updateCartItem(oBundle, oProduct, oCartModel, iQuantity, DatosCabecera,localmodel);
				break;
			}
		},

		_updateCartItem: function (oBundle, oProductToBeAdded, oCartModel, iQuantity, DatosCabecera,localmodel) {
			// find existing entry for product
			var oCollectionEntries = Object.assign([], oCartModel.getData()["cartEntries"]);
			var solicitanteData = localmodel.getProperty("/oDatosSolicitante");
			var oCartEntry = oCollectionEntries.find(e=>e.WarehouseCode === oProductToBeAdded.WarehouseCode && e.ItemCode === oProductToBeAdded.ItemCode );
			// var oCartEntry = oCollectionEntries[oProductToBeAdded.WarehouseCode];

			// if (!oCartEntry) {
				// create new entry
				oCartEntry = Object.assign({}, oProductToBeAdded);
				oCartEntry.Quantity = iQuantity;
				oCartEntry.DatosCabeceraV2 = DatosCabecera;
				oCartEntry.ClaveLabor = [];
				oCartEntry.ClaveLaborSelected = "";
				oCartEntry.CampoObjeto = [];
				oCartEntry.visIdentificador = false;
				oCartEntry.CampoObjetoSelected = "";
				oCartEntry.CentroCostoSelected = "";

				oCartEntry.CampoSolicitanteValue = solicitanteData.CampoSolicitanteValue;
				oCartEntry.CampoSolicitanteKey = solicitanteData.CampoSolicitanteKey;

				// oCollectionEntries[oProductToBeAdded.ItemCode] = oCartEntry;
				oCartModel.getProperty("/cartEntries").push(oCartEntry);
			// } else {
				// update existing entry
				// oCartEntry.Quantity += iQuantity;
			// }
			//update the cart model
			// oCartModel.setProperty("/cartEntries", Object.assign({}, oCollectionEntries));
			oCartModel.refresh(true);
			MessageToast.show(oBundle.getText("productMsgAddedToCart", [oProductToBeAdded.ItemCode]));
		}
	};
});