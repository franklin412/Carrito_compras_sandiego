sap.ui.define(["./BaseController","../model/formatter","sap/m/MessageToast","sap/m/MessageBox","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(e,t,a,r,i,o){"use strict";return e.extend("zsandiego.carritocompras.controller.Comparison",{formatter:t,onInit:function(){this._oRouter=this.getRouter();this._oRouter.getRoute("comparison").attachPatternMatched(this._onRoutePatternMatched,this);this._oRouter.getRoute("comparisonCart").attachPatternMatched(this._onRoutePatternMatched,this);this.ComparisoncomprasSPOT=sap.ui.xmlfragment("zsandiego.carritocompras.view.fragment.ComparisonComprasSPOT",this);this.getView().addDependent(this.ComparisoncomprasSPOT)},_onRoutePatternMatched:function(e){var t=this.byId("comparisonContainer");var a=e.getParameter("arguments");var r=this.byId("placeholder");this.getModel("comparison").setProperty("/category",a.id);this.getModel("comparison").setProperty("/categoryType",a.category);this.getModel("comparison").setProperty("/item1",a.item1Id);this.getModel("comparison").setProperty("/item2",a.item2Id);r.setVisible(false);i(0,a.item1Id,a.id,a.category,this.getModel("catalogo"));i(1,a.item2Id,a.id,a.category,this.getModel("catalogo"));function i(e,a,i,o,s){var n=t.getItems()[e];if(a){var l="catalogo>/"+s.createKey("materialesSet",{Item:a,Catyp:o,Catnr:i});n.bindElement({path:l});n.setVisible(true)}else{n.unbindElement();n.setVisible(false);r.setVisible(true)}}},onRemoveComparison:function(e){var t=e.getSource().getBindingContext("catalogo");var a=this.getModel("comparison").getProperty("/categoryType");var r=this.getModel("comparison").getProperty("/item1");var i=r===t.getObject().Item;var o=this.getModel("comparison").getProperty("/item"+(i?2:1));var s=this.getModel("comparison").getProperty("/category");this.getRouter().navTo("comparison",{id:s,category:a,item1Id:o},true)},onToggleCart:function(e){var t=e.getParameter("pressed");var a=this.getView().getModel("comparison").getProperty("/item1");var r=this.getView().getModel("comparison").getProperty("/item2");var i=this.getView().getModel("comparison").getProperty("/category");var o=this.getView().getModel("comparison").getProperty("/categoryType");this._setLayout(t?"Three":"Two");this.getRouter().navTo(t?"comparisonCart":"comparison",{id:i,category:o,item1Id:a,item2Id:r})},pressComprasSpot:function(){this.ComparisoncomprasSPOT.open()},onRegistrarCompraSPOT:function(e){var t=!!this.getView().$().closest(".sapUiSizeCompact").length;var a=this.getModel("i18n").getResourceBundle();var i=sap.ui.getCore().byId("_idComprasProv").getValue();var o=sap.ui.getCore().byId("_idGrupoArticulo").getValue();var s=sap.ui.getCore().byId("_idNombreMaterial").getValue();var n=sap.ui.getCore().byId("_idCantidadSPOT").getValue();var l=sap.ui.getCore().byId("_idUnidadMedida").getValue();var d=sap.ui.getCore().byId("_idPrecio").getValue();if(i.length===0){r.warning("Seleccione un proveedor",{styleClass:t?"sapUiSizeCompact":""});return}else if(o.length===0){r.warning("Seleccione un grupo de artículo",{styleClass:t?"sapUiSizeCompact":""});return}else if(s.length===0){r.warning("Ingrese el nombre de material",{styleClass:t?"sapUiSizeCompact":""});return}else if(n.length===0){r.warning("Ingrese la cantidad del material",{styleClass:t?"sapUiSizeCompact":""});return}else if(n==0){r.warning("Ingresa una cantidad diferente a 0",{styleClass:t?"sapUiSizeCompact":""});sap.ui.getCore().byId("_idCantidadSPOT").setValue();return}else if(l.length===0){r.warning("Ingrese la unidad de medida",{styleClass:t?"sapUiSizeCompact":""});return}else if(d.length===0){r.warning("Ingrese el precio unitario del material",{styleClass:t?"sapUiSizeCompact":""});return}else if(d==0){r.warning("Ingresa un precio unitario diferente a 0",{styleClass:t?"sapUiSizeCompact":""});sap.ui.getCore().byId("_idPrecio").setValue();return}var g=this.getModel("cartProducts");var u=Object.keys(g.getProperty("/cartEntries")).length;this.getView().getModel("localmodel").setProperty("/listaProductosCantidad/value",u);var p=u+1;var c={SupplierName:i,Detalle:{},highlight:"Warning",GrupoArticulo:o,ProductId:p,Status:"A",CurrencyCode:"USD",Name:s,Price:d,Quantity:n,Unit:l};this.addToCart(a,c,g);this.ComparisoncomprasSPOT.close();this.limpiarComprasSPOT()},addToCart:function(e,t,a){this._updateCartItem(e,t,a)},_updateCartItem:function(e,t,r){var i=sap.ui.getCore().byId("_idCantidadSPOT").getValue();var o=Object.assign({},r.getData()["cartEntries"]);var s=o[t.ProductId];if(s===undefined){s=Object.assign({},t);s.Quantity=i;o[t.ProductId]=s}else{s.Quantity=i}r.setProperty("/cartEntries",Object.assign({},o));r.refresh(true);a.show(e.getText("productMsgAddedToCart",[t.Name]))},limpiarComprasSPOT:function(){sap.ui.getCore().byId("_idGrupoArticulo").setValue();sap.ui.getCore().byId("_idComprasProv").setValue();sap.ui.getCore().byId("_idUnidadMedida").setValue();sap.ui.getCore().byId("_idNombreMaterial").setValue();sap.ui.getCore().byId("_idCantidadSPOT").setValue();sap.ui.getCore().byId("_idPrecio").setValue()},onSalirComprasSPOT:function(){this.ComparisoncomprasSPOT.close();this.limpiarComprasSPOT()},openFragProveedor:function(e){var t=e.getSource().getValue();var a=this;a.inputId="_idComprasProv";if(!a._valueHelpDialog){a._valueHelpDialog=sap.ui.xmlfragment("zsandiego.carritocompras.view.fragment.ProveedorSPOT.ComparisonComprasSPOT",a);a.getView().addDependent(a._valueHelpDialog)}a._valueHelpDialog.getBinding("items").filter([new i("descripcionProv",o.Contains,t)]);a._valueHelpDialog.open(t)},_handleValueHelpSearchProveedor:function(e){var t=e.getParameter("value");var a=new i("descripcionProv",o.Contains,t);e.getSource().getBinding("items").filter([a])},_handleValueHelpCloseProv:function(e){var t=e.getParameter("selectedItem");if(t){var a=sap.ui.getCore().byId("_idComprasProv");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([])},openFragUM:function(e){var t=e.getSource().getValue();var a=this;a.inputId="_idUnidadMedida";if(!a._valueHelpDialogUMProduct){a._valueHelpDialogUMProduct=sap.ui.xmlfragment("zsandiego.carritocompras.view.fragment.UnidadMedida.ComparisonUM",a);a.getView().addDependent(a._valueHelpDialogUMProduct)}a._valueHelpDialogUMProduct.getBinding("items").filter([new i("unidad",o.Contains,t)]);a._valueHelpDialogUMProduct.open(t)},_handleValueHelpSearchUM:function(e){var t=e.getParameter("value");var a=new i("unidad",o.Contains,t);e.getSource().getBinding("items").filter([a])},_handleValueHelpCloseUM:function(e){var t=e.getParameter("selectedItem");if(t){var a=sap.ui.getCore().byId("_idUnidadMedida");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([])},openFragGA:function(e){var t=e.getSource().getValue();var a=this;a.inputId="_idGrupoArticulo";if(!a._valueHelpDialogGArt){a._valueHelpDialogGArt=sap.ui.xmlfragment("zsandiego.carritocompras.view.fragment.GrupoArticulo.WelcomeGrupoArt",a);a.getView().addDependent(a._valueHelpDialogGArt)}a._valueHelpDialogGArt.getBinding("items").filter([new i("grupoArticulotext",o.Contains,t)]);a._valueHelpDialogGArt.open(t)},_handleValueHelpSearchGA:function(e){var t=e.getParameter("value");var a=new i("grupoArticulotext",o.Contains,t);e.getSource().getBinding("items").filter([a])},_handleValueHelpCloseGA:function(e){var t=e.getParameter("selectedItem");if(t){var a=sap.ui.getCore().byId("_idGrupoArticulo");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([])}})});