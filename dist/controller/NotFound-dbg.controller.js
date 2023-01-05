sap.ui.define([
	"./BaseController",
	"sap/ui/core/UIComponent"
], function(BaseController, UIComponent) {
	"use strict";

	return BaseController.extend("zsandiego.carritocompras.controller.NotFound", {
		onInit: function () {
			this._router = UIComponent.getRouterFor(this);
		}
	});
});
