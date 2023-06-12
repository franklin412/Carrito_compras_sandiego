sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device"
], function (BaseController, formatter, Filter, FilterOperator, Device) {
	"use strict";

	return BaseController.extend("zsandiego.crearreserva.controller.Master", {
		formatter: formatter,

		onInit: function () {
			/*var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("categories").attachMatched(this._onRouteMatched, this);*/
		}
	});
});