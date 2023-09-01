sap.ui.define(["./BaseController","../model/formatter","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/Device","sap/ui/core/Fragment","sap/m/MessageBox","../service/serviceSL"],function(e,t,o,a,r,n,s,i){"use strict";var l=null;var c=null;return e.extend("zsandiego.crearreserva.controller.Home",{formatter:t,onInit:async function(){try{sap.ui.core.BusyIndicator.show(0);var e=this.getOwnerComponent();this._router=e.getRouter();this._router.getRoute("categories").attachMatched(this._onRouteMatched,this);this._catalogo=this.getOwnerComponent().getModel("catalogo");this.localmodel=this.getOwnerComponent().getModel("localmodel");this.localmodel.setSizeLimit(1e4);var t=this;var r=new o("Status",a.EQ,"A");this.byId("categoryList").setBusy(true);await this.onGetItemServiceLayer();await this.consultaOrdenTrabajo();await this.consultaProjects();l=new sap.ushell.Container.getService("UserInfo").getUser().getEmail();c=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;var n=await i.onConsultaIAS(l,c);let s=await i.consultaGeneralB1SL(c,"/GLAccountAdvancedRules?$filter=Code eq 'PROYECTOS'");s.value.sort(function(e,t){return parseInt(t.PeriodName)-parseInt(e.PeriodName)});this.localmodel.setProperty("/AccountRules",s.value[0].DecreasingAccount);if(n.Resources){let e=null;if(n.Resources[0]["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"]){e=n.Resources[0]["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"].employeeNumber;await this.consultaIdentificador(e);let o=await i.consultaGeneralB1SL(c,"/Area('"+e+"')");if(o.AREADCollection){for await(const e of o.AREADCollection){let o=await i.consultaGeneralB1SL(c,"/ProfitCenters?$filter= U_Area eq '"+e.U_Area+"'");var u=t.localmodel.getProperty("/CentrosCosto").concat(o.value);t.localmodel.setProperty("/CentrosCosto",u);t.localmodel.refresh(true)}}let a=n.Resources[0].name.familyName+" "+n.Resources[0].name.givenName;this.localmodel.setProperty("/oDatosSolicitante/CampoSolicitanteValue",e?a:"Employee number vacío");this.localmodel.setProperty("/oDatosSolicitante/CampoSolicitanteKey",e);this.onGetUsuariosPorArea(e,c)}}var p="zsandiego.crearreserva";this.localmodel.setProperty("/localmodel/lineafragmento",{});this.localmodel.setProperty("/placeholder",jQuery.sap.getModulePath(p)+"/img/11030-200.png");sap.ui.core.BusyIndicator.hide()}catch(e){s.warning("Error al cargar datos maestros, comuncarse con el Administrador.");sap.ui.core.BusyIndicator.hide()}},onBeforeRendering:function(){},onGetUsuariosPorArea:async function(e,t){var o=this,a=[];let r=await i.consultaGeneralB1SL(t,"/EmployeesInfo?$filter=ExternalEmployeeNumber eq '"+e+"'");let n=await i.consultaGeneralB1SL(t,"/EmployeesInfo?$filter=U_Area eq '"+r.value[0].U_Area+"'");let l=await i.onConsultaIAS(r.value[0].U_Area,t,"Group");l.Resources.forEach(function(e){let t=n.value.find(t=>t.eMail===e.emails[0].value);t?a.push(t.eMail):null});if(a.length===0){s.warning("No se encontraron jefes de área para este solicitante, comuncarse con el Administrador.",{actions:[s.Action.OK],emphasizedAction:s.Action.OK,onClose:function(e){top.window.location.href="https://calidad-sandiego.launchpad.cfapps.us10.hana.ondemand.com/site?siteId=b5eb9010-3fff-43c8-afda-30f99941c637#Shell-home"}})}else{o.localmodel.setProperty("/oEmpleadoData",r.value[0]);o.localmodel.setProperty("/oUsuariosWorkflow/tUsuariosJefeArea",a.length>0?a.toString():"")}},getWFInstances:function(){var e=this;var t=e.getOwnerComponent().getManifestObject();var o=this.getOwnerComponent().getManifestEntry("/sap.app/id");var a=o.replaceAll(".","/");var r=jQuery.sap.getModulePath(a);var n=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;return new Promise(function(e,t){$.ajax({url:r+"/wfrest/v1/workflow-instances",method:"GET",async:false,headers:{"X-CSRF-Token":"Fetch"},success:function(t,o,a){e(t)}})})},onGetItemServiceLayer:function(e,t){var o=this;var a=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;return new Promise(function(r,n){var s=null;if(t){s=a+"sb1sl/Items?$filter=contains(ItemCode,'"+e+"')"}else if(e){s=a+"sb1sl/Items?$filter=contains(ItemName,'"+e+"')"}else{s=a+"sb1sl/Items?$skip=50000"}$.ajax({type:"GET",dataType:"json",headers:{"B1S-CaseInsensitive":true},url:s,success:function(t){if(!e||e){for(let e=0;e<t.value.length;e++){let o=t.value[e].ItemWarehouseInfoCollection;o.forEach(function(e){e.InStock2=e.InStock})}o.localmodel.setProperty("/catalogosSet",t.value)}else{t.ItemWarehouseInfoCollection.forEach(function(e){e.InStock2=e.InStock});o.localmodel.setProperty("/catalogosSet",[]);o.localmodel.getProperty("/catalogosSet").push(t)}o.byId("categoryList").setBusy(false);r(t.value)},error:function(e){n(e.responseJSON)}})})},consultaOrdenTrabajo:async function(){var e=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;var t=await i.consultaGeneralB1SL(e,"/U_ORDENESTRABAJO?$filter=U_Valido eq '1'");this.localmodel.setProperty("/OrdenTrabajo",t.value)},consultaActivoFijo:async function(){var e=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;var t=await i.consultaGeneralB1SL(e,"/Items?$filter=ItemType eq 'itFixedAssets' and Valid eq 'tYES'");this.localmodel.setProperty("/ActivoFijo",t.value)},consultaIdentificador:async function(e){var t=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;var o=await i.consultaGeneralB1SL(t,"/U_ACTIVOS");this.localmodel.setProperty("/Identificador",o.value)},consultaProjects:async function(){var e=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;var t=(new Date).getUTCFullYear()+"-"+((new Date).getUTCMonth()+1).toString().padStart(2,"0")+"-"+(new Date).getDate().toString().padStart(2,"0");var o=await i.consultaGeneralB1SL(e,"/Projects?$filter=ValidFrom lt '"+t+"' and ValidTo gt '"+t+"'");this.localmodel.setProperty("/Proyect",o.value)},onCentrosDeCosto:function(){var e=this;var t=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;return new Promise(function(o,a){var r=t+"sb1sl/ProfitCenters";$.ajax({type:"GET",dataType:"json",url:r,success:function(t){e.localmodel.setProperty("/CentrosCosto",t.value);o(t.value)},error:function(e){a(e.responseJSON)}})})},onAfterRendering:function(){var e="zsandiego.crearreserva"},_onRouteMatched:function(){var e=this.getModel("appView").getProperty("/smallScreenMode");if(e){this._setLayout("One")}},onSearch:function(){this._search()},onRefresh:function(){var e=this;var t=new o("Status",a.EQ,"A");this.byId("categoryList").setBusy(true);this.onGetItemServiceLayer();var r=e.byId("categoryList");var n=r.getBinding("items");n.filter(null);this.byId("searchField").setValue()},onBuscar:async function(e){var t=e.getSource().getValue();if(t){if(!!parseInt(t)){await this.onGetItemServiceLayer(t,true)}else{await this.onGetItemServiceLayer(t)}}else{await this.onGetItemServiceLayer()}this.localmodel.refresh(true)},_search:function(){var e=this.getView();var t=e.byId("categoryList");var r=[];var n=this.byId("searchField").getValue();if(n&&n.length>0){r.push(new o("Catnr",a.Contains,n.toUpperCase()));r.push(new o("Caktx",a.Contains,n.toUpperCase()))}var s=this.byId("categoryList");var i=s.getBinding("items");i.filter(new o({filters:r,and:false}));i.refresh()},onCategoryListItemPress:async function(e){var t=e.getParameter("listItem");var o=t.getBindingContext("localmodel").getObject();var a=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;for(let e=0;e<o.ItemWarehouseInfoCollection.length;e++){var r=o.ItemWarehouseInfoCollection[e];if(r.InStock>0){var n=await i.consultaGeneralB1SL(a,"/BTP_RESERVA?$filter=U_ItemCode eq '"+r.ItemCode+"' and U_WhsCode eq '"+r.WarehouseCode+"'");n.value.length>0?r.InStock=r.InStock2-n.value[0].U_CantReserva:null}}o.ItemWarehouseInfoCollection.sort(function(e,t){return parseInt(t.InStock)-parseInt(e.InStock)});var s=o.ItemCode;this._router.navTo("category",{id:s});this._unhideMiddlePage()},onProductListSelect:function(e){var t=e.getParameter("listItem");this._showProduct(t)},onProductListItemPress:function(e){var t=e.getSource();this._showProduct(t)},_showProduct:function(e){var t=e.getBindingContext().getObject();this._router.navTo("product",{id:t.Category,productId:t.ProductId},!r.system.phone)},onBack:function(){this.getRouter().navTo("home")}})});