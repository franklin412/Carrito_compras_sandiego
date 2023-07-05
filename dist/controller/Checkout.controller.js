sap.ui.define(["./BaseController","../model/cart","sap/ui/model/json/JSONModel","sap/ui/Device","../model/formatter","sap/m/MessageBox","sap/m/Link","sap/m/MessagePopover","sap/m/MessagePopoverItem","../model/EmailType","sap/ui/core/Fragment","sap/m/MessageToast","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/BusyIndicator","sap/ui/core/format/NumberFormat","../service/serviceSL"],function(e,t,a,r,o,i,n,s,l,c,u,d,g,h,p,f,m){"use strict";var C="cartEntries";return e.extend("zsandiego.crearreserva.controller.Checkout",{types:{email:new c},formatter:o,onInit:async function(){var e=new a({});this.setModel(e,"cartEntry");this.cartEntry=this.getModel("cartEntry");this._oHistory={prevPaymentSelect:null,prevDiffDeliverySelect:null};var t=this;this.localmodel=this.getOwnerComponent().getModel("localmodel");this.matchcode=this.getOwnerComponent().getModel("matchcode");this.presupuesto=this.getOwnerComponent().getModel("presupuesto");this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),"message");this.getRouter().getRoute("checkout").attachMatched(function(){this._setLayout("One");this._clearMessages();var e=this.getView().byId("shoppingCartWizard");e.discardProgress(e.getSteps()[0])}.bind(this));this.openIngresar=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.IngresarCantidad",this);this.getView().addDependent(this.openIngresar);this._oCart=this.getOwnerComponent().getModel("cartProducts");var r=this._oCart.getProperty("/cartEntries").length;this.localmodel.setProperty("/listaProductosCantidad/value",r);var o=this._oCart.getProperty("/cartEntries");var i=new Date;var n=i.getDate()+"-"+(i.getUTCMonth()+1)+"-"+i.getUTCFullYear();this._oCart.setProperty("/TodayDate",n);this.localmodel.setProperty("/pruebav1",o)},ContadorRequisiciones:function(){var e=this._oCart.getProperty("/cartEntries");this.localmodel.setProperty("/pruebav1",e);var t=[];var a=[];Object.values(e).forEach(function(e,a){t.push(e)});var r=t.reduce(function(e,t){if(!e[t.SupplierName]){e[t.SupplierName]={};e[t.SupplierName].SupplierName=t.SupplierName;e[t.SupplierName].Productos=[]}var a={descripcion:t.Name};e[t.SupplierName].Productos.push(a);return e},Object.create(null));Object.values(r).forEach(function(e,t){a.push(e)});this.localmodel.setProperty("/NumRequisicion",[]);var o=[];o=a;this.localmodel.setProperty("/linearequisicion",o.length);for(var i=1;i<=o.length;i++){var n={requisicion:45e7+i};this.localmodel.getProperty("/NumRequisicion").push(n)}this.localmodel.refresh(true)},changeComboSucursal:function(e){var t=e.getParameters().selectedItem.mProperties.key-1;var a="/Sucursal/";var r=a+t;var o=this.localmodel.getProperty(r);this.localmodel.setProperty("/lineasucursal",o)},changeComboFactura:function(e){var t=e.getParameters().selectedItem.mProperties.key-1;var a="/datosFacturacion/";var r=a+t;var o=this.localmodel.getProperty(r);this.localmodel.setProperty("/lineafactura",o)},imputacionChange:function(e){this.cartEntry.setProperty("/entry/Kostl","");this.cartEntry.setProperty("/entry/Saknr","");this.cartEntry.setProperty("/entry/Aufk","");this.cartEntry.setProperty("/entry/Anla","");var t=this.cartEntry.getProperty("/entry/Knttp");if(t==="K"){var a=this.getModel("catalogo");var r=this._oDialogDetalle.getBindingContext("cartEntry").getObject();var o=r.Catyp==="M"?r.Item:"";var i=r.Catyp==="M"?r.Werks:"";var n="";var s=r.Catyp==="S"?r.Item:"";var l="/"+a.createKey("cuentaSet",{Matnr:o,Werks:i,Bwtar:n,Asnum:s});var c=this;this.getView().byId("idfragcuenta").setBusy(true);a.read(l,{success:function(e,t){c.getView().byId("idfragcuenta").setBusy(false);c.getModel("cartEntry").setProperty("/entry/Saknr",e.Kstar)},error:function(){c.getView().byId("idfragcuenta").setBusy(false);c.getModel("cartEntry").setProperty("/entry/Saknr","")}})}},changeComboDireccion:function(e){var t=e.getParameters().selectedItem.mProperties.key-1;var a="/DireccionEnvio/";var r=a+t;var o=this.localmodel.getProperty(r);this.localmodel.setProperty("/lineadireccion",o)},onShowMessagePopoverPress:function(e){var t=e.getSource();var a=new n({text:"Show more information",href:"http://sap.com",target:"_blank"});var r=new l({type:"{message>type}",title:"{message>message}",subtitle:"{message>additionalText}",link:a});if(!this.byId("errorMessagePopover")){var o=new s(this.createId("messagePopover"),{items:{path:"message>/",template:r},afterClose:function(){o.destroy()}});this._addDependent(o)}o.openBy(t)},_addDependent:function(e){this.getView().addDependent(e)},handleWizardSubmit:function(){var e=!!this.getView().$().closest(".sapUiSizeCompact").length;var t=this._oCart.getProperty("/lineaCabeceraDetalle");var a=this._oCart.getProperty("/cartEntries");var r=[];for(var o in a){r.push(a[o])}var n=this;if(t.AsignacionDetalle===""){i.warning("Debes ingresar una clase de pedido.",{styleClass:e?"sapUiSizeCompact":"",onClose:function(e){n.byId("idfragasignacion_").focus()}});return}if(t.Organizacion===""){i.warning("Debes ingresar una Organizacion de Compras.",{styleClass:e?"sapUiSizeCompact":"",onClose:function(e){n.byId("idfragOrgCompra").focus()}});return}if(t.GrupoCompra===""){i.warning("Debes ingresar un Grupo de Compras.",{styleClass:e?"sapUiSizeCompact":"",onClose:function(e){n.byId("idfragGrupoCompra").focus()}});return}if(t.Sociedad===""){i.warning("Debes ingresar una Sociedad.",{styleClass:e?"sapUiSizeCompact":"",onClose:function(e){n.byId("idfragSociedad").focus()}});return}if(t.Solicitante===""){i.warning("Debes ingresar un Solicitante.",{styleClass:e?"sapUiSizeCompact":"",onClose:function(e){n.byId("idfragSolicitante").focus()}});return}var s=this.getResourceBundle().getText("checkoutControllerAreYouSureSubmit");this._handleSubmitOrCancel(s,"confirm","ordercompleted",a)},backToWizardContent:function(){this.byId("wizardNavContainer").backToPage(this.byId("wizardContentPage").getId())},_clearMessages:function(){sap.ui.getCore().getMessageManager().removeAllMessages()},handleInputChange:function(e){var t=e.getSource();var a=t._bSelectingItem;if(a){t.setValueState("None")}else{var r=t.getBindingPath("value");this._oCart.setProperty(r,"");t.setValueState("Error")}t._bSelectingItem=undefined;if(r==="/lineaCabeceraDetalle/AsignacionDetalle"){var o=this._oCart.getProperty(r);var i=this.getModel("matchcode").getProperty("/ZCDSALAYRI_ESART('"+o+"')/batxt");this._oCart.setProperty("/Clasepedido",i)}},_checkInputFields:function(e){var t=this.getView();return e.some(function(e){var a=t.byId(e);var r=a.getBinding("value");return a.getValue()===""})},checkCompleted:function(){this.handleWizardSubmit()},onClearCentroCosto:function(e){var t=this;t.localmodel.setProperty("/CentrosCosto",[]);e.forEach(function(e){e.CentroCostoValue=null;e.CentroCostoSelected=null;e.SelectedKeyCentro=null});t._oCart.refresh(true);t.localmodel.refresh(true)},onClearClaveLabor:function(e){var t=this;e.forEach(function(e){e.ClaveLabor=[];e.ClaveLaborValue=null;e.ClaveLaborSelected=null;e.SelectedKeyClave=null});t._oCart.refresh(true)},onClearCampoObjeto:function(e){var t=this;e.forEach(function(e){e.CampoObjeto=[];e.CampoObjetoValue=null;e.CampoObjetoSelected=null;e.SelectedKeyCampoObj=null});t._oCart.refresh(true)},onClearCampoSolicitante:function(e){var t=this;e.forEach(function(e){e.CampoSolicitanteValue=null;e.CampoSolicitanteKey=null});t._oCart.refresh(true)},onClearCampoIdentificador:function(e){var t=this;e.forEach(function(e){e.IdentificadorValue=null;e.CampoIdentificadorSelected=null;e.visIdentificador=null});t._oCart.refresh(true)},onSetSolicianteValues:function(e,t){var a=this;t.forEach(function(t){t.CampoSolicitanteValue=e.FirstName?e.FirstName+" ":""+e.MiddleName?e.MiddleName+" ":""+e.LastName?e.LastName:"";t.CampoSolicitanteKey=e.ExternalEmployeeNumber});a._oCart.refresh(true)},onSelectCentro:function(e){try{var t=this;this.showBusyIndicator();var a=e.getSource().getSelectedKey();var r=e.getSource().getBindingContext("cartProducts");r.getObject().CentroCostoSelected=a?a:null;r.getObject().ClaveLaborValue=null;r.getObject().ClaveLaborSelected=null;r.getObject().CampoObjetoValue=null;r.getObject().CampoObjetoSelected=null;r.getObject().SelectedKeyClave=null;r.getObject().SelectedKeyCampoObj=null;r.getObject().ClaveLabor=[];r.getObject().CampoObjeto=[];if(a){t.onObtenerClaveLabor(r,a)}else{}this.hideBusyIndicator()}catch(e){i.error("Ha sucedido un error al seleccionar el centro");this.hideBusyIndicator()}},onSearchExisteCentro:function(e){let t=e},onSelectOrdenTrabajo:function(e){try{var t=this;this.showBusyIndicator();var a=e.getSource().getSelectedKey();var r=e.getSource().getBindingContext("cartProducts");r.getObject().OrdenTrabajoSelected=a?a:null;this.hideBusyIndicator()}catch(e){i.error("Ha sucedido un error al seleccionar la orden de trabajo");this.hideBusyIndicator()}},onSelectActivoFijo:function(e){try{var t=this;this.showBusyIndicator();var a=e.getSource().getSelectedKey();var r=e.getSource().getBindingContext("cartProducts");r.getObject().ActivoFijoSelected=a?a:null;this.hideBusyIndicator()}catch(e){i.error("Ha sucedido un error al seleccionar la orden de trabajo");this.hideBusyIndicator()}},onSelectProyecto:function(e){try{var t=this;this.showBusyIndicator();var a=e.getSource().getSelectedKey();var r=e.getSource().getBindingContext("cartProducts");r.getObject().ProyectoSelected=a?a:null;if(!a){r.getObject().visProyecto=false}else{r.getObject().CentroCostoValue=null;r.getObject().CentroCostoSelected=null;r.getObject().SelectedKeyCentro=null;r.getObject().ClaveLabor=[];r.getObject().ClaveLaborValue=null;r.getObject().ClaveLaborSelected=null;r.getObject().SelectedKeyClave=null;r.getObject().CampoObjeto=[];r.getObject().CampoObjetoValue=null;r.getObject().CampoObjetoSelected=null;r.getObject().SelectedKeyCampoObj=null;r.getObject().IdentificadorValue=null;r.getObject().CampoIdentificadorSelected=null;r.getObject().visProyecto=true;r.getObject().visIdentificador=false}t.localmodel.refresh(true);this.hideBusyIndicator()}catch(e){i.error("Ha sucedido un error al seleccionar un projecto");this.hideBusyIndicator()}},onObtenerClaveLabor:function(e,t){var a=this;var r=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;return new Promise(function(o,i){var n=r+"sb1sl/Mapeo?$filter=U_CeCo eq '"+t+"'";$.ajax({type:"GET",dataType:"json",url:n,success:function(t){a._oCart.setProperty(e.getPath()+"/ClaveLabor",t.value);a._oCart.refresh(true);o(t);a.hideBusyIndicator()},error:function(e){i(e.responseJSON)}})})},onObtenerCampoObjeto:function(e,t){var a=this;var r=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;return new Promise(function(o,n){var s=r+"sb1sl/Mapeo?$filter=U_CeCo eq '"+t+"' and U_Clave eq '"+e.getObject().ClaveLaborSelected+"'";$.ajax({type:"GET",dataType:"json",url:s,success:function(t){if(t.value.length>0){var r=a._oCart.getProperty(e.getPath());r.CampoObjetoValue=t.value[0].U_ObjetoN;r.SelectedKeyCampoObj=t.value[0].U_Objeto;r.CampoObjetoSelected=t.value[0].U_Objeto;a._oCart.refresh(true);if(!t.value[0].U_Objeto){i.warning("No tiene el campo Objeto predefinido debe contactarse con el administrador de SAP B1")}}o(t);a.hideBusyIndicator()},error:function(e){n(e.responseJSON)}})})},onSelectClaveLabor:function(e){try{var t=this;var a=e.getSource().getSelectedKey();var r=e.getSource().getBindingContext("cartProducts");r.getObject().ClaveLaborSelected=a?a:null;r.getObject().CampoObjetoValue=null;r.getObject().CampoObjetoSelected=null;r.getObject().SelectedKeyCampoObj=null;t.onObtenerCampoObjeto(r,r.getObject().CentroCostoSelected)}catch(e){i.error("Ha sucedido un error al seleccionar clave labor");this.hideBusyIndicator()}},onSelectIdentificador:function(e){try{var t=this;var a=e.getSource().getSelectedKey();var r=e.getSource().getBindingContext("cartProducts");var o=t.localmodel.getProperty("/Identificador");var n=o.find(e=>e.U_Identificador===a);r.getObject().CampoIdentificadorSelected=a;if(!a){this.onClearCamposIdentificador(r.getObject());r.getObject().visIdentificador=false}else{r.getObject().CentroCostoSelected=n.U_CentroCosto;r.getObject().CentroCostoValue=n.U_CentroCosto;r.getObject().ClaveLaborSelected=n.U_ClaveLabor;r.getObject().ClaveLaborValue=n.U_ClaveLabor;t.onObtenerCampoObjeto(r,n.U_CentroCosto);r.getObject().visIdentificador=true}t.localmodel.refresh(true);this.hideBusyIndicator()}catch(e){i.error("Ha sucedido un error al seleccionar campo Identificador");this.hideBusyIndicator()}},onClearCamposIdentificador:function(e){e.CentroCostoSelected=null;e.CentroCostoValue=null;e.ClaveLaborSelected=null;e.ClaveLaborValue=null;e.CampoObjetoValue=null;e.SelectedKeyCampoObj=null;e.CampoObjetoSelected=null;e.IdentificadorValue=null},onReturnToShopButtonPress:function(){this._setLayout("Two");this.getRouter().navTo("home")},_setDiscardableProperty:function(e){var t=this.byId("shoppingCartWizard");if(t.getProgressStep()!==e.discardStep){i.warning(e.message,{actions:[i.Action.YES,i.Action.NO],onClose:function(a){if(a===i.Action.YES){t.discardProgress(e.discardStep);this._oHistory[e.historyPath]=this.getModel("catalogo").getProperty(e.modelPath)}else{this.getModel("catalogo").setProperty(e.modelPath,this._oHistory[e.historyPath])}}.bind(this)})}else{this._oHistory[e.historyPath]=this.getModel("catalogo").getProperty(e.modelPath)}},hideBusyIndicator:function(){p.hide()},showBusyIndicator:function(e,t){p.show(t);if(e&&e>0){if(this._sTimeoutId){clearTimeout(this._sTimeoutId);this._sTimeoutId=null}this._sTimeoutId=setTimeout(function(){this.hideBusyIndicator()}.bind(this),e)}},show2000:function(){this.showBusyIndicator(2e3)},_handleSubmitOrCancel:async function(e,t,a,r){try{var o=this;i[t](e,{actions:[i.Action.YES,i.Action.NO],onClose:function(e){if(e==="YES"){o.showBusyIndicator();var t=o.localmodel.getProperty("/oDatosSolicitante");var a=o.localmodel.getProperty("/oUsuariosWorkflow");var n=o._oCart.getProperty("/lineaCabeceraDetalle/Comentario");var s=false;!t.CampoSolicitanteKey?s=true:null;var l={Comments:n?n:"Nueva reserva",DocObjectCode:"oInventoryGenExit",ESTADO_A1:"P",U_SOLICITANTE:t.CampoSolicitanteKey,DocumentLines:[]};var c={UsuarioJefeArea:a.tUsuariosJefeArea?a.tUsuariosJefeArea:null,UsuarioAlmacen:a.tAlmacen?a.tAlmacen:null,estadoAprob:false,Comments:n?n:"Nueva reserva",DocObjectCode:"oInventoryGenExit",U_SOLICITANTE:t.CampoSolicitanteKey,DocumentLinesBatchNumbers:[]};r.forEach(function(e){var t={ItemCode:e.ItemCode,Quantity:e.Quantity,WarehouseCode:e.WarehouseCode,CostingCode2:e.CentroCostoSelected,CostingCode:e.CampoObjetoSelected,U_ClaveLabor:e.ClaveLaborSelected,U_Solicitante:e.CampoSolicitanteKey,U_DescSolicitante:e.CampoSolicitanteValue,U_NoOT:e.OrdenTrabajoSelected,U_Activo:e.ActivoFijoSelected,ProjectCode:e.ProyectoSelected,U_Identificador:e.CampoIdentificadorSelected,DocumentLinesBinAllocations:[]};if(e.ProyectoSelected){!e.CampoSolicitanteKey?s=true:null}else{!e.CentroCostoSelected||!e.CampoObjetoSelected||!e.ClaveLaborSelected||!e.CampoSolicitanteKey?s=true:null}l.DocumentLines.push(t);t.ManageBatchNumbers=e.DatosCabeceraV2.ManageBatchNumbers;t.InventoryUOM=e.DatosCabeceraV2.InventoryUOM;c.DocumentLinesBatchNumbers.push(t)});if(!a.tUsuariosJefeArea||!a.tAlmacen){i.error("No existe usuario Jefe de Área o usuario de almacén para el solicitante ingresado, comunicarse con el administrador.");o.hideBusyIndicator();return}if(s===true){i.error("Debe llenar los campos para poder realizar la reserva");o.hideBusyIndicator();return}var u=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;return new Promise(function(e,t){var a=u+"sb1sl/Drafts";$.ajax({type:"POST",dataType:"json",url:a,data:JSON.stringify(l),success:async function(t){var a=o.localmodel.getProperty("/oDatosSolicitante");c.DocEntry=t.DocEntry.toString()+"|"+o._oCart.getProperty("/TodayDate")+"|"+a.CampoSolicitanteValue+"|"+"CREADO"+"|"+c.Comments;c.UsuarioRegistro=a.CampoSolicitanteValue;c.FechaRegistro=o._oCart.getProperty("/TodayDate");await o.postWorkflowInstance(c);for(let e=0;e<c.DocumentLines.length;e++){var r=c.DocumentLines[e];var i=await m.onObtenerDescuentoReserva(u,r);if(i.length==0){var n=await m.onGetCantidadCorrelativo(r,u);r.Code=parseInt(n)+1;await m.onAddDescuento(r,u)}else{i[0].U_CantReserva=r.Quantity+i[0].U_CantReserva;await m.onEditDescuento(u,i[0])}}e(t.value)},error:function(e){if(e.responseJSON){e.responseJSON.error?i.error(e.responseJSON.error.message.value):null}o.hideBusyIndicator();t(e)}})})}}.bind(this)})}catch(e){i.error("Ha sucedido un error al realizar la reserva");this.hideBusyIndicator()}},postWorkflowInstance:function(e){try{var t=this;var a=this.getOwnerComponent().getManifestEntry("/sap.app/id");var r=a.replaceAll(".","/");var o=jQuery.sap.getModulePath(r);var n={definitionId:"workflowmodulev1.myworkflowapproval",context:e};return new Promise(function(a,r){$.ajax({url:o+"/wfrest/v1/workflow-instances",type:"POST",data:JSON.stringify(n),contentType:"application/json",async:false,success:function(r){i.success("La reserva se registro correctamente con el numero: "+e.DocEntry.split("|")[0],{actions:[i.Action.OK],emphasizedAction:i.Action.OK,onClose:function(e){t._oCart.setProperty("/cartEntries",[]);t.onReturnToShopButtonPress()}});t.hideBusyIndicator();a(r)},error:function(e){a(e)}})})}catch(e){i.error("Ha sucedido un error al realizar la reserva");this.hideBusyIndicator()}},_navBackToStep:function(e){var t=e.getSource().data("navBackTo");var a=this.byId(t);this._navToWizardStep(a)},_navToWizardStep:function(e){var t=this.byId("wizardNavContainer");var a=function(){this.byId("shoppingCartWizard").goToStep(e);t.detachAfterNavigate(a)}.bind(this);t.attachAfterNavigate(a);t.to(this.byId("wizardContentPage"))},onEntryListPress:function(e){this._currentObj=e.getSource().getBindingContext("cartProducts").getObject();this._currentPath=e.getSource().getBindingContextPath();this.getModel("cartEntry").setProperty("/entry",Object.assign({},this._currentObj));this.getModel("cartEntry").refresh(true);var t=this;if(!this._oDialogDetalle){u.load({id:this.getView().getId(),name:"zsandiego.crearreserva.view.DetalleArticulos",controller:this}).then(function(e){t.getView().addDependent(e);var a=t.getView().byId("idfragcuenta");a.attachBeforeFilter(function(e){this.aFilters=[];var a=t.getView().byId("idfragSociedad").getValue();var r=new g("bukrs",h.EQ,a);var o=e?e.getParameter("value"):"";if(!o||o===""){this.aFilters.push(r)}else{var i=[];i.push(new g(this.getHelpKeyField(),h.Contains,o));if(this.getHelpDescriptionField()!==""){i.push(new g(this.getHelpDescriptionField(),h.Contains,o))}var n=new g({filters:i,and:false});this.aFilters=new g({filters:[n,r],and:true})}});e.addStyleClass(this.getOwnerComponent().getContentDensityClass());e.open();t._oDialogDetalle=e;t._oDialogDetalle.bindElement({path:"cartEntry>/entry"})}.bind(this))}else{this._oDialogDetalle.open();this._oDialogDetalle.bindElement({path:"cartEntry>/entry"});this.getView().byId("idfragcentro").setValueState("None");this.getView().byId("idfragcentro2").setValueState("None");this.getView().byId("idfragcuenta").setValueState("None");this.getView().byId("idNumOrden").setValueState("None");this.getView().byId("idNumProyecto").setValueState("None")}},getInfoTablePresupuesto:function(e,t,a){let r=t.detalle?t.detalle:[];let i=e;let n={};let s=true;n.aPresupuestos=[];a.forEach(function(e){var t=new Date;var a=new Date(t.getFullYear(),t.getMonth(),t.getDate()+parseInt(e.Dias_Entrega,10));e.Mes=a.getMonth()+1;e.Año=a.getFullYear()});if(i.length!==0){for(let e=0;e<i.length;e++){let r=i[e];let l=r.Kostl?a.filter(e=>e.Kostl===r.Kostl&&e.Saknr===r.Kstar&&e.Mes===parseInt(r.Poper,10)):a.filter(e=>e.OrderNo===r.Aufk&&e.Año===parseInt(r.Gjahr,10));let c=parseFloat(t.Precio_Unit)*parseFloat(t.Kursf)*t.Quantity;l.forEach(function(e){if(e.Item!==r.Item){c+=parseFloat(e.Precio_Unit)*parseFloat(e.Kursf)*e.Quantity}});let u=r.PresActual||0;let d=c<=u;if(!d)s=false;n.aPresupuestos.push({Imputacion:r.Kostl?r.Kostl:r.Aufnr,TipoImp:r.Kostl?"Centro de coste ":"Orden ",Presupuesto:u,Kstar:r.Kstar,Waers:r.Waers,ValorTotal:c,bDisponible:d,oPresupuestoServ:r,oDetalle:l,Comprometido:r.PresComp,Mes:o.formatMes(parseInt(r.Poper,10)),Annio:r.Gjahr})}}else{s=false}n.bDisponibleGen=s;n.sMessage=s?"Presupuesto actual disponible":"No cuenta con presupuesto disponible";return n},pressDetalleAsignar:function(){var e=!!this.getView().$().closest(".sapUiSizeCompact").length;var t=this.byId("idClasepedidoDetalle").getValue();var a=this.byId("idfragcentro").getValue();if(t.length===0){i.warning("Ingresa una clase de pedido en la interfaz principal",{styleClass:e?"sapUiSizeCompact":""})}else{var r=this._oDialogDetalle.getBindingContext("cartEntry").getObject();var o=this._oCart.getProperty("/cartEntries");var n=[];for(var s in o){if(r.Item!==s){n.push(o[s])}}var l=false;if(r.Knttp==="F"&&r.Aufk!==""){var c="/"+this.matchcode.createKey("ZCDSMM_AUFK_TXT",{aufnr:r.Aufk});var d=this.matchcode.getProperty(c);if(d.autyp==="01"){l=true}}else{l=true}if(r.Knttp==="K"&&r.Kostl!==""||r.Knttp==="F"&&r.Aufk!==""&&l){var g=r.Werks;var h="";if(g!==""){var f=this.localmodel.getProperty("/ZCDSMM_WERKS_TXT");var m=f.find(e=>e.werks===g);if(m){h=m.bukrs}}var C=r.Kostl?r.Kostl:"";var v=r.Aufk?r.Aufk:"";if(h!==""){var y=new Date;var b=new Date(y.getFullYear(),y.getMonth(),y.getDate()+parseInt(r.Dias_Entrega,10));var S={Bukrs:h,detallepre:[{Kostl:C,Kstar:r.Knttp==="K"?r.Saknr:"",Aufnr:v,Lfdat:b,mesEntrega:b.getMonth()+1,"añoEntrega":b.getFullYear()}]};if(S.detallepre[0].Aufnr!==""){S.detallepre=collect(S.detallepre).unique(e=>e.Kostl+e.Aufnr+e.Kstar+e.añoEntrega).all();S.detallepre.forEach(function(e,t){delete S.detallepre[t]["mesEntrega"];delete S.detallepre[t]["añoEntrega"]})}else{S.detallepre=collect(S.detallepre).unique(e=>e.Kostl+e.Aufnr+e.Kstar+e.mesEntrega).all();S.detallepre.forEach(function(e,t){delete S.detallepre[t]["mesEntrega"];delete S.detallepre[t]["añoEntrega"]})}var I=this;p.show();this.presupuesto.create("/presupuestoSet",S,{success:function(e,t){p.hide();var a=I.getInfoTablePresupuesto(e.detallepre.results,r,n);I.localmodel.setProperty("/oPresupuesto",a);if(!I.oDialogPresupuesto){u.load({name:"zsandiego.crearreserva.view.fragment.Presupuesto",controller:I}).then(function(e){I.oDialogPresupuesto=e;I.getView().addDependent(I.oDialogPresupuesto);I.oDialogPresupuesto.open()})}else{I.oDialogPresupuesto.open()}},error:function(e){I.hideBusyIndicator();console.log(e)}})}}else{this.onSubmitAsignar()}}},onSubmitAsignar:function(){var e=this.getModel("cartEntry").getProperty("/entry");this.getModel("cartProducts").setProperty(this._currentPath,e);this.getModel("cartProducts").refresh(true);this._oDialogDetalle.close();this.oDialogPresupuesto.close();var t="Asignado correctamente";d.show(t)},onCancelAsignar:function(){this.oDialogPresupuesto.close()},pressDetalleCancelar:function(){var e=this;sap.m.MessageBox.show("¿Desea cancelar el proceso?",{icon:sap.m.MessageBox.Icon.WARNING,title:"Confirmar",actions:[sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],onClose:function(t){if(t===sap.m.MessageBox.Action.YES){e._oDialogDetalle.close()}else if(t===sap.m.MessageBox.Action.NO){return}}})},pressDetalleSalir:function(){this.byId("DetalleArticuloDialog").close()},openFragAsignacion:function(e){var t=e.getSource().getValue();var a=this;this.inputId=e.getSource().getId();if(!a._valueHelpDialog){a._valueHelpDialog=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.asignacion",a);a.getView().addDependent(a._valueHelpDialog)}a._valueHelpDialog.open(t)},_handleValueHelpSearchAsignacion:function(e){var t=e.getParameter("value");var a=new g("batxt",h.Contains,t);e.getSource().getBinding("items").filter([a])},_handleValueHelpCloseAsignacion:function(e){var t=e.getParameter("selectedItem");if(t){var a=this.byId("idfragasignacion_");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([]);this.byId(this.inputId)._bSelectingItem=true;this.byId(this.inputId).fireChange()},openFragNumOrden:function(e){this.inputId=e.getSource().getId();if(!this._oDialogNumOrden){u.load({name:"zsandiego.crearreserva.view.fragment.NumOrden",controller:this}).then(function(e){this._oDialogNumOrden=e;this.getView().addDependent(this._oDialogNumOrden);this._oDialogNumOrden.open()}.bind(this))}else{this._oDialogNumOrden.open()}},_handleValueHelpSearchNumOrden:function(e){var t=e.getParameter("value");var a=[];if(t){a.push(new g("aufnr",h.Contains,t))}e.getSource().getBinding("items").filter(new g({filters:a,and:false}))},_handleValueHelpCloseNumOrden:function(e){var t=e.getParameter("selectedItem");if(t){var a=this.byId("idNumOrden");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([]);this.byId(this.inputId)._bSelectingItem=true;this.byId(this.inputId).fireChange()},_handleValueHelpSearchCuenta:function(e){var t=e.getParameter("value");var a=[];if(t){a.push(new g("saknr",h.Contains,t));a.push(new g("txt20",h.Contains,t))}var r=new g("bukrs",h.EQ,this.sBukrs);e.getSource().getBinding("items").filter([new g({filters:a,and:false}),r])},_handleValueHelpSearchCentro:function(e){var t=e.getParameter("value");var a=[];if(t){a.push(new g("kostl",h.Contains,t));a.push(new g("ltext",h.Contains,t))}e.getSource().getBinding("items").filter(new g({filters:a,and:false}))},_handleValueHelpSearchWerks:function(e){var t=e.getParameter("value");var a=[];if(t){a.push(new g("werks",h.Contains,t));a.push(new g("name1",h.Contains,t))}e.getSource().getBinding("items").filter(new g({filters:a,and:false}))},_handleValueHelpCloseCuenta:function(e){var t=e.getParameter("selectedItem");if(t){var a=this.byId("idfragcuenta");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([]);this.byId(this.inputId)._bSelectingItem=true;this.byId(this.inputId).fireChange()},_handleValueHelpCloseWerks:function(e){var t=e.getParameter("selectedItem");if(t){var a=this.byId("idfragwerks");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([]);this.byId(this.inputId)._bSelectingItem=true;this.byId(this.inputId).fireChange()},_handleValueHelpCloseCentro:function(e){var t=e.getParameter("selectedItem");if(t){var a=this.byId("idfragcentro");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([]);this.byId(this.inputId)._bSelectingItem=true;this.byId(this.inputId).fireChange()},openFragCentro:function(e){this.inputId=e.getSource().getId();if(!this._oDialogCentro){u.load({name:"zsandiego.crearreserva.view.fragment.centrocosto",controller:this}).then(function(e){this._oDialogCentro=e;this.getView().addDependent(this._oDialogCentro);this._oDialogCentro.open()}.bind(this))}else{this._oDialogCentro.open()}},openFragWerks:function(e){this.inputId=e.getSource().getId();if(!this._oDialogWerks){u.load({name:"zsandiego.crearreserva.view.fragment.centro",controller:this}).then(function(e){this._oDialogWerks=e;this.getView().addDependent(this._oDialogWerks);this._oDialogWerks.open()}.bind(this))}else{this._oDialogWerks.open()}},openFragCuenta:function(e){var t=this.byId("idfragcentro").getValue();var a="";if(t!==""){var r=this.localmodel.getProperty("/ZCDSMM_WERKS_TXT");var o=r.find(e=>e.werks===t);if(o){this.sBukrs=o.bukrs}}this.inputId=e.getSource().getId();if(!this._oDialogCuenta){u.load({name:"zsandiego.crearreserva.view.fragment.Cuenta",controller:this}).then(function(e){this._oDialogCuenta=e;this.getView().addDependent(this._oDialogCuenta);this._oDialogCuenta.open();var t=new g("bukrs",h.EQ,this.sBukrs);this._oDialogCuenta.getBinding("items").filter([t])}.bind(this))}else{this._oDialogCuenta.open();var i=new g("bukrs",h.Contains,a);this._oDialogCuenta.getBinding("items").filter([i])}},changecuenta:function(e){var t=e.getSource().mAssociations.selectedItem.substring(57);var a=e.getSource().mBindingInfos.suggestionItems.path;var r=a+"/"+t;var o=this.localmodel.getProperty(r);this.localmodel.setProperty("/lineacentrocosto",o);this.byId("idfragcentro").setValue();this.byId("idfragcentro").setEnabled(true)},pressActualizar:function(){var e=!!this.getView().$().closest(".sapUiSizeCompact").length;var t=this.byId("idClasepedidoDetalle").getValue();var a=this.byId("idfragcentro").getValue();if(t.length===0){i.warning("Ingresa una clase de pedido en datos de cabecera",{styleClass:e?"sapUiSizeCompact":""})}else if(a.length===0){i.warning("Ingrese un Centro de costo",{styleClass:e?"sapUiSizeCompact":""})}else{var r={OrdenDetalle:this.byId("idNumOrden").getValue(),AsignacionDetalle:this.byId("idClasepedidoDetalle").getValue(),CentroDetalle:this.byId("idfragcentro").getValue(),CtaDetalle:this.byId("idfragcuenta").getValue(),ComenDetalle:this.byId("idfragcomentario").getValue()};this._oCart.setProperty(this._path+"/cuenta",a);this._oCart.setProperty(this._path+"/Detalle",r);var o="Actualizado correctamente";d.show(o);this._oCart.setProperty(this._path+"/highlight","Success");this.byId("DetalleArticuloDialog").close()}},onEliminarProducto:function(e){var t=e.getParameter("listItem").getBindingContext("cartProducts").getPath().split("/")[2];var a=this;i.show(this.getResourceBundle().getText("cartDeleteDialogMsg"),{title:this.getResourceBundle().getText("cartDeleteDialogTitle"),actions:[i.Action.DELETE,i.Action.CANCEL],onClose:function(e){if(e!==i.Action.DELETE){return}var r=a._oCart.getProperty("/cartEntries");r.splice(t,1);a._oCart.refresh(true);d.show("Eliminado correctamente")}})},onAgregarProducto:function(e){var t=!!this.getView().$().closest(".sapUiSizeCompact").length;var a=sap.ui.getCore().byId("idCantidad").getValue();var r=parseFloat(a);if(a.length===0){i.warning("Ingresa una cantidad al material",{styleClass:t?"sapUiSizeCompact":""});return}else if(a==0){i.warning("Ingresa una cantidad diferente a 0",{styleClass:t?"sapUiSizeCompact":""});return}else{var o=this.getModel("i18n").getResourceBundle();var n=this._oCart.getProperty(this._path);var s=this.getModel("cartProducts");this.addToCart1(o,n,s)}},addToCart1:function(e,t,a){if(t.Product!==undefined){t=t.Product}switch(t.Status){case"D":i.show(e.getText("productStatusDiscontinuedMsg"),{icon:i.Icon.ERROR,titles:e.getText("productStatusDiscontinuedTitle"),actions:[i.Action.CLOSE]});break;case"O":i.show(e.getText("productStatusOutOfStockMsg"),{icon:i.Icon.QUESTION,title:e.getText("productStatusOutOfStockTitle"),actions:[i.Action.OK,i.Action.CANCEL],onClose:function(r){if(i.Action.OK===r){this._updateCartItem1(e,t,a)}}.bind(this)});break;case"A":default:this._updateCartItem1(e,t,a);break}},_updateCartItem1:function(e,t,a){var r=sap.ui.getCore().byId("idCantidad").getValue();var o=parseFloat(r);var n=0;var s=Object.assign({},a.getData()["cartEntries"]);var l=s[t.ProductId];if(l===undefined){l=Object.assign({},t);l.Quantity=o;s[t.ProductId]=l}else{l.Quantity=o}Object.values(s).forEach(function(e,t){var a=parseFloat(e.Price*e.Quantity);n=n+a});var c=!!this.getView().$().closest(".sapUiSizeCompact").length;var u=this.localmodel.getProperty("/centroCostoPrice/value");if(u<n){i.warning("Centro de costo contiene un límite de 10,000",{styleClass:c?"sapUiSizeCompact":""});this.closeIngresarCantidad();return}a.refresh(true);this.closeIngresarCantidad();var g=this._oCart.getProperty("/cartEntries").length;this.localmodel.setProperty("/listaProductosCantidad/value",g);d.show("Se actualizo la cantidad del material")},openIngresaarCantidad:function(e){this._path=e.getSource().getBindingContextPath();this._oCart=this.getOwnerComponent().getModel("cartProducts");var t=this._oCart.getProperty(this._path+"/Name");this.localmodel.setProperty("/lineafragmento/NombreProducto",t);this.openIngresar.open()},CentroCosto:function(){var e=!!this.getView().$().closest(".sapUiSizeCompact").length;var t=this.localmodel.getProperty("/centroCostoPrice/value");var a=this.localmodel.getProperty("/centroCostoPrice/acumulado");if(t<a){i.warning("Centro de costo contiene un límite de 10,000",{styleClass:e?"sapUiSizeCompact":""})}},closeIngresarCantidad:function(e){this.openIngresar.close();sap.ui.getCore().byId("idCantidad").setValue()},openFragGrupoCompra:function(e){var t=e.getSource().getValue();this.inputId=e.getSource().getId();if(!this.oDialogGrupoCompra){this.oDialogGrupoCompra=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.GrupoCompras",this);this.getView().addDependent(this.oDialogGrupoCompra)}this.oDialogGrupoCompra.open()},_handleValueHelpSearchGrupo:function(e){var t=e.getParameter("value");var a=new g("ekgrp",h.Contains,t);e.getSource().getBinding("items").filter([a])},_handleValueHelpCloseGrupo:function(e){var t=e.getParameter("selectedItem");if(t){var a=this.byId("idfragGrupoCompra");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([]);this.byId(this.inputId)._bSelectingItem=true;this.byId(this.inputId).fireChange()},openFragOrgCompra:function(e){var t=e.getSource().getValue();this.inputId=e.getSource().getId();if(!this._valueCuentax){this._valueCuentax=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.OrgCompras",this);this.getView().addDependent(this._valueCuentax)}this._valueCuentax.open(t)},_handleValueHelpSearchOrg:function(e){var t=e.getParameter("value");var a=new g("ekorg",h.Contains,t);e.getSource().getBinding("items").filter([a])},_handleValueHelpCloseOrg:function(e){var t=e.getParameter("selectedItem");if(t){var a=this.byId("idfragOrgCompra");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([]);this.byId(this.inputId)._bSelectingItem=true;this.byId(this.inputId).fireChange()},openFragSociedad:function(e){var t=e.getSource().getValue();this.inputId=e.getSource().getId();if(!this._valueSociedad){this._valueSociedad=sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.Sociedad",this);this.getView().addDependent(this._valueSociedad)}this._valueSociedad.open()},_handleValueHelpSearchSociedad:function(e){var t=e.getParameter("value");var a=new g("bukrs",h.Contains,t);e.getSource().getBinding("items").filter([a])},_handleValueHelpCloseSociedad:function(e){var t=e.getParameter("selectedItem");if(t){var a=this.byId("idfragSociedad");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([]);this.byId(this.inputId)._bSelectingItem=true;this.byId(this.inputId).fireChange()},openFragNumProyecto:function(e){this.inputId=e.getSource().getId();if(!this._oDialogNumProyecto){u.load({name:"zsandiego.crearreserva.view.fragment.NumProyecto",controller:this}).then(function(e){this._oDialogNumProyecto=e;this.getView().addDependent(this._oDialogNumProyecto);this._oDialogNumProyecto.open()}.bind(this))}else{this._oDialogNumProyecto.open()}},_handleValueHelpSearchNumProyecto:function(e){var t=e.getParameter("value");var a=[];if(t){a.push(new g("mcoa1",h.Contains,t));a.push(new g("anln1",h.Contains,t))}e.getSource().getBinding("items").filter(new g({filters:a,and:false}))},_handleValueHelpCloseNumProyecto:function(e){var t=e.getParameter("selectedItem");if(t){var a=this.byId("idNumProyecto");a.setValue(t.getTitle())}e.getSource().getBinding("items").filter([]);this.byId(this.inputId)._bSelectingItem=true;this.byId(this.inputId).fireChange()},handleSuggestAufk:function(e){var t=[];var a=e.getParameter("suggestValue");if(a){t.push(new g("aufnr",h.Contains,a))}e.getSource().getBinding("suggestionItems").filter(t);e.getSource().setFilterSuggests(false)},onEliminarTodo:function(e){i.warning("¿Desea eliminar todos los materiales / servicios?",{actions:[i.Action.YES,i.Action.NO],onClose:function(e){if(e===i.Action.YES){this._oCart.setProperty("/cartEntries",[]);this._setLayout("Two");this.getRouter().navTo("home")}}.bind(this)})}})});