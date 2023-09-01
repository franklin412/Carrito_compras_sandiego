sap.ui.define([
	"zsandiego/crearreserva/localService/mockserver"
], function (mockserver) {
	"use strict";

	mockserver.init().catch(function (oError) {
		sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
			MessageBox.error(oError.message);
		});
	}).finally(function () {
		sap.ui.require(["sap/ui/core/ComponentSupport"]);
	});
});