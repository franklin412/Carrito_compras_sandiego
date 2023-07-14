sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/Device","sap/ui/core/Fragment","sap/m/MessageBox"],function(e,t,a,i,r,n,s){"use strict";return e.extend("zsandiego.crearreserva.controller.App",{onInit:function(){this._oCart=this.getOwnerComponent().getModel("cartProducts");this.localmodel=this.getOwnerComponent().getModel("localmodel");sap.ui.getCore().getMessageManager().removeAllMessages();var e,a,i=this.getView().getBusyIndicatorDelay();e=new t({busy:false,delay:0,layout:r.system.phone?"OneColumn":"TwoColumnsMidExpanded",smallScreenMode:true});this.setModel(e,"appView");this.fnSetAppNotBusy=function(){e.setProperty("/busy",false);e.setProperty("/delay",i)};var n=this;this.localmodel=this.getOwnerComponent().getModel("localmodel");this.matchcode=this.getOwnerComponent().getModel("matchcode");this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())},onAfterRendering:function(){},onBeforeRendering:function(){this.cartProducts=this.getOwnerComponent().getModel("cartProducts");const e=this.getOwnerComponent().getEventBus();e.subscribe("app","openDatosCabecera",this.openDatosCabeceraBus,this);this.openDatosCabecera=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.DatosCabecera",this);this.getView().addDependent(this.openDatosCabecera);this.openGrupoCompras=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.GrupoCompras",this);this.getView().addDependent(this.openGrupoCompras);this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())},openDatosCabeceraBus:function(e){this.openDatosCabecera.open()},openFragOrgCompra:function(e){var t=e.getSource().getValue();this.inputId=e.getSource().getId();if(!this._valueOrgx){this._valueOrgx=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.OrgCompras",this);this.getView().addDependent(this._valueOrgx)}this._valueOrgx.open()},_handleValueHelpSearchOrg:function(e){var t=e.getParameter("value");var r=new a("ekorg",i.Contains,t);e.getSource().getBinding("items").filter([r])},_handleValueHelpCloseOrg:function(e){var t=e.getParameter("selectedItem");if(t){var a=sap.ui.getCore().byId("idOrganizacionCompra");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([])},openFragGrupoCompra:function(e){var t=e.getSource().getValue();this.inputId=e.getSource().getId();if(!this._valueCuentax){this._valueCuentax=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.GrupoCompras",this);this.getView().addDependent(this._valueCuentax)}this._valueCuentax.open()},_handleValueHelpSearchGrupo:function(e){var t=e.getParameter("value");var r=[];r.push(new a("ekgrp",i.Contains,t));r.push(new a("eknam",i.Contains,t));e.getSource().getBinding("items").filter(new a({filters:r,and:false}))},_handleValueHelpCloseGrupo:function(e){var t=e.getParameter("selectedItem");if(t){var a=sap.ui.getCore().byId("idfragGrupoCompra");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([])},openFragSociedad:function(e){var t=e.getSource().getValue();this.inputId=e.getSource().getId();if(!this._valueSociedad){this._valueSociedad=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.Sociedad",this);this.getView().addDependent(this._valueSociedad)}this._valueSociedad.open()},_handleValueHelpSearchSociedad:function(e){var t=e.getParameter("value");var r=new a("bukrs",i.Contains,t);e.getSource().getBinding("items").filter([r])},_handleValueHelpCloseSociedad:function(e){var t=e.getParameter("selectedItem");if(t){var a=sap.ui.getCore().byId("idfragSociedad");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([])},openFragAsignacion:function(e){var t=e.getSource().getValue();this.inputId=e.getSource().getId();if(!this._valueHelpDialog){this._valueHelpDialog=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.asignacion",this);this.getView().addDependent(this._valueHelpDialog)}this._valueHelpDialog.open()},_handleValueHelpSearchAsignacion:function(e){var t=e.getParameter("value");var r=new a("batxt",i.Contains,t);e.getSource().getBinding("items").filter([r])},_handleValueHelpCloseAsignacion:function(e){var t=e.getParameter("selectedItem");if(t){var a=sap.ui.getCore().byId("idfragasignacion");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([]);sap.ui.getCore().byId(this.inputId)._bSelectingItem=true;sap.ui.getCore().byId(this.inputId).fireChange()},handleInputChange:function(e){var t=e.getSource();var a=t.getBindingPath("value");var i=t._bSelectingItem;if(i){t.setValueState("None")}else{this._oCart.setProperty(a,"");t.setValueState("Error")}t._bSelectingItem=undefined;if(a==="/lineaCabeceraDetalle/AsignacionDetalle"){var r=this._oCart.getProperty(a);var n=this.getModel("matchcode").getProperty("/ZCDSALAYRI_ESART('"+r+"')/batxt");this.cartProducts.setProperty("/Clasepedido",n)}},onAceptarCabecera:function(){var e=!!this.getView().$().closest(".sapUiSizeCompact").length;var t=sap.ui.getCore().byId("idfragasignacion").getValue();var a=sap.ui.getCore().byId("idOrganizacionCompra").getValue();var i=sap.ui.getCore().byId("idfragGrupoCompra").getValue();var r=sap.ui.getCore().byId("idfragSociedad").getValue();var n=sap.ui.getCore().byId("idfragSolicitante").getValue();if(t.length==0){s.warning("Ingresa una clase de pedido",{styleClass:e?"sapUiSizeCompact":""});return}else if(a.length==0){s.warning("Ingresa una organización de compras",{styleClass:e?"sapUiSizeCompact":""});return}else if(i.length==0){s.warning("Ingresa un grupo de compras",{styleClass:e?"sapUiSizeCompact":""});return}else if(r.length==0){s.warning("Ingresa una sociedad",{styleClass:e?"sapUiSizeCompact":""});return}else if(n.length==0){s.warning("Ingresa un solicitante",{styleClass:e?"sapUiSizeCompact":""});return}this.fnSetAppNotBusy();this.openDatosCabecera.close()},onCloseCabecera:function(){this.fnSetAppNotBusy();this.openDatosCabecera.close()},onCancelarCabecera:function(){sap.ui.getCore().byId("idfragasignacion").setValue();sap.ui.getCore().byId("idOrganizacionCompra").setValue();sap.ui.getCore().byId("idfragGrupoCompra").setValue();sap.ui.getCore().byId("idfragSociedad").setValue();sap.ui.getCore().byId("idfragSolicitante").setValue();this.cartProducts.setProperty("/Clasepedido","");this.fnSetAppNotBusy();this.openDatosCabecera.close()}})});