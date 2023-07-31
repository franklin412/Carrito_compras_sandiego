sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/MessageToast","sap/ui/core/UIComponent","sap/ui/core/routing/History","../model/cart","sap/m/MessageBox","sap/ui/model/Filter","sap/ui/model/FilterOperator","../service/serviceSL"],function(e,t,a,i,n,o,r,s,l){"use strict";var u;var d;return e.extend("zsandiego.crearreserva.controller.BaseController",{cart:n,getRouter:function(){return a.getRouterFor(this)},getModel:function(e){return this.getView().getModel(e)},setModel:function(e,t){return this.getView().setModel(e,t)},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},onStateChange:function(e){var t=e.getParameter("layout"),a=e.getParameter("maxColumnsCount");if(a===1){this.getModel("appView").setProperty("/smallScreenMode",true)}else{this.getModel("appView").setProperty("/smallScreenMode",false);if(t==="OneColumn"){this._setLayout("Two")}}},_setLayout:function(e){if(e){this.getModel("appView").setProperty("/layout",e+"Column"+(e==="One"?"":"sMidExpanded"))}},_unhideMiddlePage:function(){setTimeout(function(){this.getOwnerComponent().getRootControl().byId("layout").getCurrentMidColumnPage().removeStyleClass("sapMNavItemHidden")}.bind(this),0)},onBack:function(){this._unhideMiddlePage();var e=i.getInstance();var t=e.getPreviousHash();if(t!==undefined){window.history.go(-1)}else{this.getRouter().navTo("home")}},onAddToCart:function(){var e=this.getView().getModel("localmodel").getProperty("/ProductData");if(!this.oDialogQuantity){this.oDialogQuantity=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.addQuantity",this);this.getView().addDependent(this.oDialogQuantity)}sap.ui.getCore().byId("sInpQuantityLabel").setLabel("Cantidad ");sap.ui.getCore().byId("sInpQuantity").setMin(parseFloat(e.Cant_Min));sap.ui.getCore().byId("sInpQuantity").setValue(parseFloat(e.Cant_Min));this.oDialogQuantity.data("oProduct",e);this.oDialogQuantity.open()},onSelectAlmacenReserva:function(e){d=this.getView().getModel("localmodel").getProperty("/AlternativosItems");var t=e.getParameters().listItem.getBindingContext("localmodel").getObject();u=t;var a=this.getModel("cartProducts");var i=a.getProperty("/cartEntries").find(e=>e.ItemCode===u.ItemCode&&e.WarehouseCode===u.WarehouseCode);if(i){o.warning("El alternativo seleccionado ya existe en la lista de reservas.");this.onLimpiarCabeceraDetalle();return}if(t.InStock!==0){this.onAddToCart()}else{o.warning("Este item no tiene stock")}},onLimpiarCabeceraDetalle:function(){u=null;d=null},onAddQuantity:async function(e){try{sap.ui.core.BusyIndicator.show(0);var t=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;var a=this.getModel("cartProducts"),i;if(u&&d){i=u;var o=d}else{i=e.getSource().getParent().data("oProduct");var o=this.getView().getModel("localmodel").getData().itemSelected;i.NoexisteSeleccionado=false;this.getView().getModel("localmodel").refresh(true)}var r=await l.onObtenerALMXTIPO(i,t,"BTP_ALMXTIPO?$filter=U_WhsCode eq '"+i.WarehouseCode+"'");if(r.length>0){var s=r.reduce(function(e,t){if(e.indexOf(t.U_TipoAlmacen)===-1){e.push(t.U_TipoAlmacen)}return e},[]);i.arrayUsuariosAlmacen=[];let e=await l.onObtenerUsersIASxTipo(null,t);let a=e.Resources.filter(e=>e["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"]);for(let t=0;t<s.length;t++){let n=s[t];if(e.Resources.length>0){if(a){let e=a.filter(e=>e["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"].costCenter===n);if(e.length>0){e.forEach(function(e){if(e.groups){let t=e.groups.find(e=>e.display==="Grp_Aprobar_Despacho_Reserva");if(t){i.arrayUsuariosAlmacen.push(e.emails[0].value)}}})}}}}}var g=sap.ui.getCore().byId("sInpQuantity").getValue()*1;var c=this.getModel("i18n").getResourceBundle();n.addToCart(c,i,a,g,o,this.getView().getModel("localmodel"));this.cantidad_productos=a.getProperty("/cartEntries").length;this.getView().getModel("localmodel").setProperty("/listaProductosCantidad/value",this.cantidad_productos);this.onLimpiarCabeceraDetalle();this.onCancelQuantity();sap.ui.core.BusyIndicator.hide()}catch(e){sap.ui.core.BusyIndicator.hide()}},onChangeQuantity:function(e){var t=e.getSource();var a=e.getParameter("value");var i=t.getMin();if(u){var n=u.InStock}else{var n=this.getView().getModel("localmodel").getProperty("/ProductData").InStock}if(a>n){t.setValue(n);o.warning("La cantidad excede la cantidad de stock.")}if(a<i){o.warning("La cantidad mínima permitida es "+t.getMin()+".");t.setValue(i);var r=t.getBinding("value");if(r){setTimeout(function(){r.setValue(i)},1e3)}}},onChangeQuantityCart:function(e){var t=e.getSource();var a=e.getParameter("value");var i=t.getMin();var n=e.getSource().getBindingContext("cartProducts").getObject().InStock;if(a>n){t.setValue(n);o.warning("La cantidad excede la cantidad de stock.")}if(a<i){o.warning("La cantidad mínima permitida es "+t.getMin()+".");t.setValue(i);var r=t.getBinding("value");if(r){setTimeout(function(){r.setValue(i)},1e3)}}},onCancelQuantity:function(e){if(this.oDialogQuantity){this.oDialogQuantity.close();this.oDialogQuantity.destroy();this.oDialogQuantity=null}this.onLimpiarCabeceraDetalle()},_clearComparison:function(){var e=this.getOwnerComponent().getModel("comparison");e.setData({category:"",item1:"",item2:""})},handleSuggest:function(e){var t=e.getSource();var a=t.getBindingInfo("suggestionItems").template;var i=[];var n=e.getParameter("suggestValue");if(n){i.push(new r(a.getBindingPath("text"),s.Contains,n));i.push(new r(a.getBindingPath("additionalText"),s.Contains,n))}e.getSource().getBinding("suggestionItems").filter(new r({filters:i,and:false}));e.getSource().setFilterSuggests(false)}})});