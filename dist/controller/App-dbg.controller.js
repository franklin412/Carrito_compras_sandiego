sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"

], function (BaseController, JSONModel, Filter, FilterOperator, Device, Fragment, MessageBox) {
	"use strict";

	return BaseController.extend("zsandiego.carritocompras.controller.App", {

		onInit: function () {
            this._oCart = this.getOwnerComponent().getModel("cartProducts");
            this.localmodel = this.getOwnerComponent().getModel("localmodel");
            sap.ui.getCore().getMessageManager().removeAllMessages();
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				layout: Device.system.phone ? "OneColumn" : "TwoColumnsMidExpanded",
				smallScreenMode: true
			});
			this.setModel(oViewModel, "appView");

			this.fnSetAppNotBusy = function () {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
            };
            var that = this
            this.localmodel = this.getOwnerComponent().getModel("localmodel");
            this.matchcode = this.getOwnerComponent().getModel("matchcode");            
            this.matchcode.read("/ZCDSALAYRI_ESART", {
                success: function(oData, response) {
                    that.localmodel.setProperty("/ZCDSALAYRI_ESART", response.data.results);
                    that.localmodel.firePropertyChange({
                        reason: sap.ui.model.ChangeReason.Change,
                        path: "/ZCDSALAYRI_ESART"
                    })
                }
            }); 

            this.matchcode.read("/ZCDSMM_WERKS_TXT", {
                success: function(oData, response) {
                    that.localmodel.setProperty("/ZCDSMM_WERKS_TXT", response.data.results);
                    that.localmodel.firePropertyChange({
                        reason: sap.ui.model.ChangeReason.Change,
                        path: "/ZCDSMM_WERKS_TXT"
                    })
                }
            });

            
            this.matchcode.read("/ZCDSMM_EKORG_TXT", {
                success: function(oData, response) {
                    that.localmodel.setProperty("/ZCDSMM_EKORG_TXT", response.data.results);
                    that.localmodel.firePropertyChange({
                        reason: sap.ui.model.ChangeReason.Change,
                        path: "/ZCDSMM_EKORG_TXT"
                    })
                }
            }); 
            this.matchcode.read("/ZCDSMM_EKGRP_TXT", {
                success: function(oData, response) {
                    that.localmodel.setProperty("/ZCDSMM_EKGRP_TXT", response.data.results);
                    that.localmodel.firePropertyChange({
                        reason: sap.ui.model.ChangeReason.Change,
                        path: "/ZCDSMM_EKGRP_TXT"
                    })
                }
            }); 
            this.matchcode.read("/ZCDSFI_SOCIEDAD_TXT", {
                success: function(oData, response) {
                    that.localmodel.setProperty("/ZCDSFI_SOCIEDAD_TXT", response.data.results);
                    that.localmodel.firePropertyChange({
                        reason: sap.ui.model.ChangeReason.Change,
                        path: "/ZCDSFI_SOCIEDAD_TXT"
                    })
                }
            }); 

            this.matchcode.read("/ZCDSMM_IDNLF_TXT", {
                success: function(oData, response) {
                    that.localmodel.setProperty("/ZCDSMM_IDNLF_TXT", response.data.results);
                    that.localmodel.firePropertyChange({
                        reason: sap.ui.model.ChangeReason.Change,
                        path: "/ZCDSMM_IDNLF_TXT"
                    })
                }
            }); 

			// since then() has no "reject"-path attach to the MetadataFailed-Event to disable the busy indicator in case of an error

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		onAfterRendering: function () {
		},
		onBeforeRendering: function () {
            
            this.cartProducts = this.getOwnerComponent().getModel("cartProducts");
            const bus = this.getOwnerComponent().getEventBus();
            bus.subscribe("app", "openDatosCabecera", this.openDatosCabeceraBus, this);            

			this.openDatosCabecera = sap.ui.xmlfragment("zsandiego.carritocompras.view.fragment.DatosCabecera", this);
            this.getView().addDependent(this.openDatosCabecera);
            
			// this.openDatosCabecera.open();
			this.openGrupoCompras = sap.ui.xmlfragment("zsandiego.carritocompras.view.fragment.GrupoCompras", this);
			this.getView().addDependent(this.openGrupoCompras);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        },
        openDatosCabeceraBus: function (oEvent){
            this.openDatosCabecera.open();
        },
		openFragOrgCompra: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueOrgx) {
				this._valueOrgx = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.OrgCompras",
					this
				);
				this.getView().addDependent(this._valueOrgx);
			}

			this._valueOrgx.open();
        },
		_handleValueHelpSearchOrg: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"ekorg",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
        },        
		_handleValueHelpCloseOrg: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
                var productInput1 = sap.ui.getCore().byId("idOrganizacionCompra");
                productInput1.setValue(oSelectedItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
		},        
		openFragGrupoCompra: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueCuentax) {
				this._valueCuentax = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.GrupoCompras",
					this
				);
				this.getView().addDependent(this._valueCuentax);
			}

			this._valueCuentax.open();
		},
		_handleValueHelpSearchGrupo: function (evt) {
			var sValue = evt.getParameter("value");
            var aFilter = [];
            aFilter.push(new Filter("ekgrp", FilterOperator.Contains, sValue));
            aFilter.push(new Filter("eknam", FilterOperator.Contains, sValue));
            
			evt.getSource().getBinding("items").filter(new Filter({filters: aFilter, and: false}));
		},
		_handleValueHelpCloseGrupo: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput1 = sap.ui.getCore().byId("idfragGrupoCompra");
				productInput1.setValue(oSelectedItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		openFragSociedad: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueSociedad) {
				this._valueSociedad = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.Sociedad",
					this
				);
				this.getView().addDependent(this._valueSociedad);
			}

			this._valueSociedad.open();
		},
		_handleValueHelpSearchSociedad: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"bukrs",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpCloseSociedad: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput1 = sap.ui.getCore().byId("idfragSociedad");
				productInput1.setValue(oSelectedItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		openFragAsignacion: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"zsandiego.carritocompras.view.fragment.asignacion",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open();
		},
		_handleValueHelpSearchAsignacion: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"batxt",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpCloseAsignacion: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = sap.ui.getCore().byId("idfragasignacion");
                productInput.setValue(oSelectedItem.getTitle());
			}
            evt.getSource().getBinding("items").filter([]);
            
            sap.ui.getCore().byId(this.inputId)._bSelectingItem = true;
			sap.ui.getCore().byId(this.inputId).fireChange();            
        },
        handleInputChange: function (oEvent) {
            var control = oEvent.getSource();
            var sPath = control.getBindingPath("value")
            
            var idSuggestion = control._bSelectingItem;
            if (idSuggestion) {
                control.setValueState("None");
            } else {
 
                this._oCart.setProperty(sPath, "")
                control.setValueState("Error");
            }
            control._bSelectingItem = undefined;
            if (sPath === "/lineaCabeceraDetalle/AsignacionDetalle"){
                var sValue = this._oCart.getProperty(sPath)
                var sBatxt = this.getModel("matchcode").getProperty("/ZCDSALAYRI_ESART('" + sValue + "')/batxt")
                this.cartProducts.setProperty("/Clasepedido", sBatxt);
            }
        },        
		onAceptarCabecera: function () {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var Clasepedido = sap.ui.getCore().byId("idfragasignacion").getValue();
			var organizacionCompra = sap.ui.getCore().byId("idOrganizacionCompra").getValue();
			var GrupoCompra = sap.ui.getCore().byId("idfragGrupoCompra").getValue();
			var sociedad = sap.ui.getCore().byId("idfragSociedad").getValue();
            var solicitante = sap.ui.getCore().byId("idfragSolicitante").getValue();
            if (Clasepedido.length == 0) {
				MessageBox.warning(
					"Ingresa una clase de pedido", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			} else if (organizacionCompra.length == 0) {
				MessageBox.warning(
					"Ingresa una organización de compras", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			} else if (GrupoCompra.length == 0) {
				MessageBox.warning(
					"Ingresa un grupo de compras", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			} else if (sociedad.length == 0) {
				MessageBox.warning(
					"Ingresa una sociedad", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
            } else if (solicitante.length == 0) {
				MessageBox.warning(
					"Ingresa un solicitante", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
            }
            
            this.fnSetAppNotBusy()
            this.openDatosCabecera.close();

        },
        onCloseCabecera: function(){
			this.fnSetAppNotBusy()
            this.openDatosCabecera.close();
        },
		onCancelarCabecera: function () {
            
            sap.ui.getCore().byId("idfragasignacion").setValue();
            sap.ui.getCore().byId("idOrganizacionCompra").setValue();
                        
			sap.ui.getCore().byId("idfragGrupoCompra").setValue();
            sap.ui.getCore().byId("idfragSociedad").setValue();
            sap.ui.getCore().byId("idfragSolicitante").setValue();
            this.cartProducts.setProperty("/Clasepedido", "");
			this.fnSetAppNotBusy()
            this.openDatosCabecera.close();
		}

	});
});