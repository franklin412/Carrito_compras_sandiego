sap.ui.define(["./BaseController","../model/cart","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","../model/formatter","sap/m/MessageToast","sap/m/MessageBox","sap/ui/Device"],function(e,t,a,i,r,o,n,s,l){"use strict";return e.extend("zsandiego.crearreserva.controller.Welcome",{_iCarouselTimeout:0,_iCarouselLoopTime:6e3,formatter:o,_mFilters:{Promoted:[new i("Type","EQ","Promoted")],Viewed:[new i("Type","EQ","Viewed")],Favorite:[new i("Type","EQ","Favorite")]},onInit:function(){var e=new a({welcomeCarouselSlider1:"zsandiego/crearreserva/img/01.png",welcomeCarouselSlider2:"zsandiego/crearreserva/img/02.png",welcomeCarouselSlider3:"zsandiego/crearreserva/img/03.png",welcomeCarouselSlider4:"zsandiego/crearreserva/img/04.png",welcomeCarouselSlider5:"zsandiego/crearreserva/img/05.png",welcomeCarouselSlider6:"zsandiego/crearreserva/img/06.png",Promoted:[],Viewed:[],Favorite:[],Currency:"USD"});this.getView().setModel(e,"view");this.getRouter().attachRouteMatched(this._onRouteMatched,this);this.cartProducts=this.getOwnerComponent().getModel("cartProducts");this.comprasSPOT=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.ComprasSPOT",this);this.getView().addDependent(this.comprasSPOT);if(l.system.phone){this.onShowCategories()}},onAfterRendering:function(){this.onCarouselPageChanged()},_onRouteMatched:function(e){var t=e.getParameter("name");if(t==="home"){this._setLayout("Two")}},onCarouselPageChanged:function(){clearTimeout(this._iCarouselTimeout);this._iCarouselTimeout=setTimeout(function(){var e=this.byId("welcomeCarousel");if(e){e.next();this.onCarouselPageChanged()}}.bind(this),this._iCarouselLoopTime)},onSelectProduct:function(e){var t=e.getSource().getBindingContext("view");var a=t.getProperty("Product/Category");var i=t.getProperty("Product/ProductId");this.getRouter().navTo("product",{id:a,productId:i})},onShowCategories:function(){this.getRouter().navTo("categories")},onAddToCart:function(e){var t=e.getSource().getBindingContext("view").getObject();if(!this.oDialogQuantity){this.oDialogQuantity=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.addQuantity",this);this.getView().addDependent(this.oDialogQuantity)}this.oDialogQuantity.data("oProduct",t);this.oDialogQuantity.open()},onRegistrarCompraSPOT:function(e){var t=!!this.getView().$().closest(".sapUiSizeCompact").length;var a=this.getModel("i18n").getResourceBundle();var i=sap.ui.getCore().byId("idComprasProv").getValue();var r=sap.ui.getCore().byId("idGrupoArticulo").getValue();var o=sap.ui.getCore().byId("idNombreMaterial").getValue();var n=sap.ui.getCore().byId("idCantidadSPOT").getValue();var l=sap.ui.getCore().byId("idUnidadMedida").getValue();var d=sap.ui.getCore().byId("idPrecio").getValue();if(i.length===0){s.warning("Seleccione un proveedor",{styleClass:t?"sapUiSizeCompact":""});return}else if(r.length===0){s.warning("Seleccione el grupo de artículo",{styleClass:t?"sapUiSizeCompact":""});return}else if(o.length===0){s.warning("Ingrese el nombre de material",{styleClass:t?"sapUiSizeCompact":""});return}else if(n.length===0){s.warning("Ingrese la cantidad del material",{styleClass:t?"sapUiSizeCompact":""});return}else if(n==0){s.warning("Ingresa una cantidad diferente a 0",{styleClass:t?"sapUiSizeCompact":""});sap.ui.getCore().byId("idCantidadSPOT").setValue();return}else if(l.length===0){s.warning("Ingrese la unidad de medida",{styleClass:t?"sapUiSizeCompact":""});return}else if(d.length===0){s.warning("Ingrese el precio unitario del material",{styleClass:t?"sapUiSizeCompact":""});return}else if(d==0){s.warning("Ingresa un precio unitario diferente a 0",{styleClass:t?"sapUiSizeCompact":""});sap.ui.getCore().byId("idPrecio").setValue();return}var u=this.getModel("cartProducts");var g=u.getProperty("/cartEntries").length;this.getView().getModel("localmodel").setProperty("/listaProductosCantidad/value",g);var c=g+1;var p={SupplierName:i,GrupoArticulo:r,Detalle:{},Status:"A",highlight:"Warning",ProductId:c,CurrencyCode:"USD",Name:o,Price:d,Quantity:n,Unit:l};this.addToCart(a,p,u);this.comprasSPOT.close();this.limpiarComprasSPOT()},openFragProveedor:function(e){var t=e.getSource().getValue();var a=this;a.inputId="idComprasProv";if(!a._valueHelpDialogProv){a._valueHelpDialogProv=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.ProveedorSPOT.WelcomeComprasSPOT",a);a.getView().addDependent(a._valueHelpDialogProv)}a._valueHelpDialogProv.getBinding("items").filter([new i("descripcionProv",r.Contains,t)]);a._valueHelpDialogProv.open(t)},_handleValueHelpSearchProveedor:function(e){var t=e.getParameter("value");var a=new i("descripcionProv",r.Contains,t);e.getSource().getBinding("items").filter([a])},_handleValueHelpCloseProv:function(e){var t=e.getParameter("selectedItem");if(t){var a=sap.ui.getCore().byId("idComprasProv");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([])},openFragUM:function(e){var t=e.getSource().getValue();var a=this;a.inputId="idUnidadMedida";if(!a._valueHelpDialogUM){a._valueHelpDialogUM=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.UnidadMedida.WelcomeUM",a);a.getView().addDependent(a._valueHelpDialogUM)}a._valueHelpDialogUM.getBinding("items").filter([new i("unidad",r.Contains,t)]);a._valueHelpDialogUM.open(t)},_handleValueHelpSearchUM:function(e){var t=e.getParameter("value");var a=new i("unidad",r.Contains,t);e.getSource().getBinding("items").filter([a])},_handleValueHelpCloseUM:function(e){var t=e.getParameter("selectedItem");if(t){var a=sap.ui.getCore().byId("idUnidadMedida");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([])},onSalirComprasSPOT:function(){this.comprasSPOT.close();this.limpiarComprasSPOT()},limpiarComprasSPOT:function(){sap.ui.getCore().byId("idGrupoArticulo").setValue();sap.ui.getCore().byId("idUnidadMedida").setValue();sap.ui.getCore().byId("idComprasProv").setValue();sap.ui.getCore().byId("idNombreMaterial").setValue();sap.ui.getCore().byId("idCantidadSPOT").setValue();sap.ui.getCore().byId("idPrecio").setValue()},addToCart:function(e,t,a){this._updateCartItem(e,t,a)},_updateCartItem:function(e,t,a){var i=sap.ui.getCore().byId("idCantidadSPOT").getValue();var r=Object.assign([],a.getData()["cartEntries"]);var o=r[t.ProductId];if(o===undefined){o=Object.assign({},t);o.Quantity=i;r[t.ProductId]=o}else{o.Quantity=i}a.refresh(true);n.show(e.getText("productMsgAddedToCart",[t.Name]))},onToggleCart:function(e){var t=e.getParameter("pressed");this._setLayout(t?"Three":"Two");this.getRouter().navTo(t?"cart":"home")},_selectPromotedItems:function(){var e=this.getView().getModel("view").getProperty("/Promoted");var t,a=Math.floor(Math.random()*e.length);do{t=Math.floor(Math.random()*e.length)}while(t===a);this.getModel("view").setProperty("/Promoted",[e[t],e[a]])},onAvatarPress:function(){const e=this.getOwnerComponent().getEventBus();e.publish("app","openDatosCabecera",{})},openFragAsignacion:function(e){var t=e.getSource().getValue();this.inputId=e.getSource().getId();if(!this._valueHelpDialog){this._valueHelpDialog=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.Checkout.Clasepedido",this);this.getView().addDependent(this._valueHelpDialog)}this._valueHelpDialog.getBinding("items").filter([new i("codigoclasepedido",r.Contains,t)]);this._valueHelpDialog.open(t)},_handleValueHelpSearchAsignacion:function(e){var t=e.getParameter("value");var a=new i("codigoclasepedido",r.Contains,t);e.getSource().getBinding("items").filter([a])},_handleValueHelpCloseAsignacion:function(e){var t=e.getParameter("selectedItem");if(t){var a=sap.ui.getCore().byId("idfragasignacionxx1_");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([]);var i=e.getSource()._list._aSelectedPaths.concat().pop();var r=this.localmodel.getProperty(i);this.localmodel.setProperty("/lineaCabeceraDetalle/Clasepedido",r.descripcion);this.localmodel.setProperty("/lineacentrocosto",r);this.localmodel.setProperty("/localmodel/lineafragmento",{})},openFragGA:function(e){var t=e.getSource().getValue();var a=this;a.inputId="idGrupoArticulo";if(!a._valueHelpDialogGA){a._valueHelpDialogGA=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.GrupoArticulo.WelcomeGrupoArt",a);a.getView().addDependent(a._valueHelpDialogGA)}a._valueHelpDialogGA.getBinding("items").filter([new i("grupoArticulotext",r.Contains,t)]);a._valueHelpDialogGA.open(t)},_handleValueHelpSearchGA:function(e){var t=e.getParameter("value");var a=new i("grupoArticulotext",r.Contains,t);e.getSource().getBinding("items").filter([a])},_handleValueHelpCloseGA:function(e){var t=e.getParameter("selectedItem");if(t){var a=sap.ui.getCore().byId("idGrupoArticulo");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([])},pressComprasSpot:function(){this.comprasSPOT.open()},onAddQuantity:function(e){var a=e.getSource().getParent().data("oProduct");var i=sap.ui.getCore().byId("sInpQuantity").getValue()*1;var r=this.getModel("i18n").getResourceBundle();var o=this.getModel("cartProducts");t.addToCart(r,a,o,i);this.cantidad_productos=o.getProperty("/cartEntries").length;this.getView().getModel("localmodel").setProperty("/listaProductosCantidad/value",this.cantidad_productos);this.onCancelQuantity()},onCancelQuantity:function(e){if(this.oDialogQuantity){this.oDialogQuantity.close();this.oDialogQuantity.destroy();this.oDialogQuantity=null}}})});