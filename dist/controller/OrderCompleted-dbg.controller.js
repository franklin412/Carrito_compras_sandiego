sap.ui.define([
	"./BaseController",
	"sap/m/GroupHeaderListItem",
], function (BaseController, GroupHeaderListItem) {
	"use strict";

	return BaseController.extend("zsandiego.crearreserva.controller.OrderCompleted", {

		onInit: function () {
			this._oRouter = this.getRouter();
            this._oCart = this.getOwnerComponent().getModel("cartProducts");
            this.getRouter().attachRouteMatched(this._onRouteMatched, this);
            
        },
        
        _onRouteMatched: function(oEvent){

            var returnPo = this._oCart.getProperty("/returnpo");
            var cartEntries = this._oCart.getProperty("/cartResults");
            var aCartEntries = [];

            for (var key in cartEntries){
                aCartEntries.push(cartEntries[key]);
            }
            
            var orderSummary = [];
            returnPo.forEach(function(obj){
                var itemPo = {_Ebeln: obj.Ebeln, _Lifnr: obj.Lifnr, ver_imagen: false, data: []}
                var aLifnrEntries = aCartEntries.filter(e => e.Lifnr === obj.Lifnr);
                
                aLifnrEntries.forEach(function(objChild){
                    if (objChild.Url_imagen && objChild.Url_imagen !== ""){
                        objChild.ver_imagen = true
                    }
                    itemPo.data.push(objChild);
                })
                
                orderSummary.push(itemPo);
            })
            

            this._oCart.setProperty("/orderSummary", {data: orderSummary})
        },
		onReturnToShopButtonPress: function () {
			//navigates back to home screen
			this._setLayout("Two");
			this._oRouter.navTo("home");
			this.localmodel.setProperty("/textoRequisicion/value", "");

			//this.byId("idTextoRequisicion").setText("");
			this.localmodel.setProperty("/pruebav1", {});
		},
		groupFunction: function (oContext) {
			return {
				key: oContext.getProperty("SupplierName")
			};
		},
		getGroupHeader: function (oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.key,
				upperCase: false
			});
		}

	});
});