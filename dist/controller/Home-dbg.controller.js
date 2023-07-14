sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"../service/serviceSL"
], function (BaseController, formatter, Filter, FilterOperator, Device, Fragment, MessageBox,serviceSL) {
	"use strict";
	var usuarioLogeado = null;
	var baseuri = null;

	return BaseController.extend("zsandiego.crearreserva.controller.Home", {
		formatter: formatter,

		onInit: async function () {
			sap.ui.core.BusyIndicator.show(0);
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("categories").attachMatched(this._onRouteMatched, this);
            this._catalogo = this.getOwnerComponent().getModel("catalogo");
            this.localmodel = this.getOwnerComponent().getModel("localmodel");
			// this.getWFInstances();
            
            var that = this;
            var filter = new Filter("Status", FilterOperator.EQ, "A");
            
            this.byId("categoryList").setBusy(true);

            // this._catalogo.read("/catalogosSet", {
            //     filters: [filter],
            //     success: function(oData, response) {
            //         that.byId("categoryList").setBusy(false);
            //         that.localmodel.setProperty("/catalogosSet", response.data.results);
            //     }
            // }); 

			await this.onGetItemServiceLayer();
			// await this.consultaEmpleados();
			await this.consultaOrdenTrabajo();
			await this.consultaActivoFijo();
			await this.consultaProjects();
			//CONSULTA USUARIO IAS
			usuarioLogeado = new sap.ushell.Container.getService("UserInfo").getUser().getEmail();
			baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			var oDatosOrdenTrabajo = await serviceSL.onConsultaIAS(usuarioLogeado, baseuri);
			if(oDatosOrdenTrabajo.Resources){
				let getAreasSolicitanteKey = null;
				if(oDatosOrdenTrabajo.Resources[0]["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"]){
					getAreasSolicitanteKey = oDatosOrdenTrabajo.Resources[0]["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"].employeeNumber; //employeenumber, es el area del usuario solicitante, ingresado desde el IAS.
					await this.consultaIdentificador(getAreasSolicitanteKey);
					let getAreasSolicitante = await serviceSL.onObtenerAreas(baseuri, getAreasSolicitanteKey);
					for await (const instances of getAreasSolicitante.AREADCollection) {
						let getCentros = await serviceSL.getCentrosCosto(baseuri, instances.U_Area);
						var concatValues = that.localmodel.getProperty("/CentrosCosto").concat(getCentros);
						that.localmodel.setProperty("/CentrosCosto",concatValues);
						that.localmodel.refresh(true);
					}
					let getAreasSolicitanteName = (oDatosOrdenTrabajo.Resources[0].name.familyName +" "+ oDatosOrdenTrabajo.Resources[0].name.givenName); //employeenumber, es el area del usuario solicitante, ingresado desde el IAS.
					this.localmodel.setProperty("/oDatosSolicitante/CampoSolicitanteValue", getAreasSolicitanteKey ? getAreasSolicitanteName : "Employee number vacío");
					this.localmodel.setProperty("/oDatosSolicitante/CampoSolicitanteKey", getAreasSolicitanteKey);
					this.onGetUsuariosPorArea(getAreasSolicitanteKey,baseuri);
				}
			}

            var sAppModulePath = "zsandiego.crearreserva";    
            this.localmodel.setProperty("/localmodel/lineafragmento", {});
            // this.localmodel.setProperty("/CentrosCosto", []);
            this.localmodel.setProperty("/placeholder", jQuery.sap.getModulePath(sAppModulePath) + "/img/11030-200.png");
			sap.ui.core.BusyIndicator.hide();
        },
		onBeforeRendering: function () {
            

		},       
		onGetUsuariosPorArea: async function(getAreasSolicitanteKey,baseuri){
			var that = this, aUserSAPExisteIAS = [];
			let getSAPUser =  await serviceSL.consultaEmpleado(getAreasSolicitanteKey, baseuri, "S");
			let getSAPUsuariosArea =  await serviceSL.consultaEmpleado(getSAPUser[0].U_Area, baseuri);
			if(getSAPUsuariosArea.length === 20){
				let contador = getSAPUsuariosArea.length;
				let skiptoken = 0;
				while(contador === 20){
						skiptoken = (skiptoken+20);
						let getUsuariosArea = await serviceSL.consultaEmpleado(getSAPUser[0].U_Area, baseuri,null,skiptoken);
						getSAPUsuariosArea = getSAPUsuariosArea.concat(getUsuariosArea);
						contador = getUsuariosArea.length;
				}
			}
			let getIASUsuariosAprobadores =  await serviceSL.onConsultaIAS(getSAPUser[0].U_Area, baseuri, "Group");
			getIASUsuariosAprobadores.Resources.forEach( function(data){
				// let oUsuarioJefe = {};
				let usuarioIASexiste = getSAPUsuariosArea.find(e=>e.eMail === data.emails[0].value);
				usuarioIASexiste ? aUserSAPExisteIAS.push(usuarioIASexiste.eMail) : null;
			})
			aUserSAPExisteIAS.push("amatienzo@plusap.pe");
			that.localmodel.setProperty("/oEmpleadoData", getSAPUser[0]);
			that.localmodel.setProperty("/oUsuariosWorkflow/tUsuariosJefeArea", aUserSAPExisteIAS.length>0 ? aUserSAPExisteIAS.toString() : "");
			that.localmodel.setProperty("/oUsuariosWorkflow/tAlmacen", "dgutierrez@plusap.pe");
		},
		getWFInstances: function () {
			var that = this;
			var oManifestObject = that.getOwnerComponent().getManifestObject();
			var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: appModulePath+"/wfrest/v1/workflow-instances",
                    method: "GET",
					async: false,
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    },
                    success: function (result, xhr, data) {
                        resolve(result);
                    
                    }
                });
            });
        },
		onGetItemServiceLayer: function(checkItem,ItemCode){
			var that = this;
			// let oManifestObject = this.getOwnerComponent().getManifestObject();
			// var loginInfo = {
			// 	"USRWS":"S4ND!3G0",
			// 	"PWDWS":"1NG.S4ND13G0",
			// 	"CompanyDB":"TEST_QA_102022",
			// 	"Password":"integra",
			// 	"UserName":"manager",
			// 	"Server":"172.31.49.151",
			// 	"ItemCode":"0026592"};
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
		
			return new Promise(function (resolve, reject) {
				var uri = null;
				if(ItemCode){
					uri = baseuri+"sb1sl/Items?$filter=contains(ItemCode,'"+checkItem+"')";
				}else if(checkItem){
					uri = baseuri+"sb1sl/Items?$filter=contains(ItemName,'"+checkItem+"')";
				}else {
					uri = baseuri+"sb1sl/Items?$skip=50000";
				}
				// url: oManifestObject.resolveUri(uri),
				$.ajax({
					type: "GET",
					dataType: "json",
					url: uri,
					// data: JSON.stringify(loginInfo),
					success: function (result) {
						if(!checkItem || checkItem){
							for (let i=0; i< result.value.length; i++) {
								let object = result.value[i].ItemWarehouseInfoCollection;
								object.forEach( function(e){
									e.InStock2 = e.InStock;
								})
							}
							that.localmodel.setProperty("/catalogosSet", result.value);
						}else{
							result.ItemWarehouseInfoCollection.forEach( function(e){
								e.InStock2 = e.InStock;
							})
							that.localmodel.setProperty("/catalogosSet", []);
							that.localmodel.getProperty("/catalogosSet").push(result);
						}
						that.byId("categoryList").setBusy(false);
						resolve(result.value);
					},
					error: function (errMsg) {
						reject(errMsg.responseJSON);
					}
				});
			});
		},
		consultaOrdenTrabajo: async function(){
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			var oDatosOrdenTrabajo = await serviceSL.onConsultaServiceLayer(baseuri,"U_ORDENESTRABAJO?$filter=U_Valido eq '1'");
			this.localmodel.setProperty("/OrdenTrabajo",oDatosOrdenTrabajo);
		},
		consultaActivoFijo: async function(){
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			var oDatosActivoFijo = await serviceSL.onConsultaServiceLayer(baseuri,"Items?$filter=ItemType eq 'itFixedAssets' and Valid eq 'tYES'");
			this.localmodel.setProperty("/ActivoFijo",oDatosActivoFijo);
		},
		consultaIdentificador: async function(getAreasSolicitanteKey){
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			var oDatosIdentificador = await serviceSL.onConsultaServiceLayerIdentificador(baseuri,"U_ACTIVOS",getAreasSolicitanteKey );
			this.localmodel.setProperty("/Identificador",oDatosIdentificador);
		},
		consultaProjects: async function(){
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			var oDatosProjects = await serviceSL.consultaProjects(baseuri,new Date() );
			this.localmodel.setProperty("/Proyect",oDatosProjects);
		},
		onCentrosDeCosto: function () {
			var that = this;
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			return new Promise( function (resolve, reject) {
				var uri = baseuri+"sb1sl/ProfitCenters";
				$.ajax({
					type: "GET",
					dataType: "json",
					url: uri,
					success: function (result) {
						that.localmodel.setProperty("/CentrosCosto", result.value);
						resolve(result.value);
					},
					error: function (errMsg) {
						reject(errMsg.responseJSON);
					}
				});
			});
		},
		onAfterRendering: function () {
            var sAppModulePath = "zsandiego.crearreserva";            
            // this.getView().byId("imgLogo").setSrc(jQuery.sap.getModulePath(sAppModulePath) + "/img/LogoImageSD.png");
		},
		_onRouteMatched: function () {
			var bSmallScreen = this.getModel("appView").getProperty("/smallScreenMode");
			if (bSmallScreen) {
				this._setLayout("One");
			}
		},

		onSearch: function () {
			this._search();
		},

		onRefresh: function () {
            var that = this;
            var filter = new Filter("Status", FilterOperator.EQ, "A")
            this.byId("categoryList").setBusy(true);
            // this._catalogo.read("/catalogosSet", {
            //     filters: [filter],
            //     success: function(oData, response) {
            //         var oList = that.byId("categoryList");
            //         var oBinding = oList.getBinding("items");           
            //         oBinding.filter(null);
            //         that.localmodel.setProperty("/catalogosSet", response.data.results);
            //         that.byId("categoryList").setBusy(false);
            //     }
            // }); 
			this.onGetItemServiceLayer();
			var oList = that.byId("categoryList");
			var oBinding = oList.getBinding("items");           
			oBinding.filter(null);

            this.byId("searchField").setValue()
		},
		onBuscar: async function (oEvent) {
			// add filter for search
			var sQuery = oEvent.getSource().getValue();
			if(sQuery){
				if(!!parseInt(sQuery)){
					await this.onGetItemServiceLayer(sQuery,true);
				}else{
					await this.onGetItemServiceLayer(sQuery);
				}
			}else {
				await this.onGetItemServiceLayer();
			}
			this.localmodel.refresh(true);
			// var aFilters = [];
			// var sQuery = oEvent.getSource().getValue();
			// if (sQuery && sQuery.length > 0) {
            //     aFilters.push(new Filter("ItemCode", FilterOperator.Contains, sQuery))
            //     aFilters.push(new Filter("ItemName", FilterOperator.Contains, sQuery));
            // }

            // var oList = this.byId("categoryList");
            // var oBinding = oList.getBinding("items");            
            // if (aFilters.length !== 0){
            //     oBinding.filter(new Filter({filters: aFilters, and: false}));
            // }else{
            //     oBinding.filter(null)
            // }

        },
		_search: function () {

			var oView = this.getView();
			var oCategoryList = oView.byId("categoryList");
			var aFilters = [];
			var sQuery = this.byId("searchField").getValue();
			if (sQuery && sQuery.length > 0) {
                aFilters.push(new Filter("Catnr", FilterOperator.Contains, sQuery.toUpperCase()))
                aFilters.push(new Filter("Caktx", FilterOperator.Contains, sQuery.toUpperCase()));
            }
            
			// update list binding
			var oList = this.byId("categoryList");
            var oBinding = oList.getBinding("items");
            
            oBinding.filter(new Filter({filters: aFilters, and: false}));
            oBinding.refresh();
		},

		onCategoryListItemPress: async function (oEvent) {
            var oBindContext = oEvent.getParameter("listItem");
            var oCategory = oBindContext.getBindingContext("localmodel").getObject();
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			for (let i=0; i< oCategory.ItemWarehouseInfoCollection.length; i++) {
				var aCollectItems = oCategory.ItemWarehouseInfoCollection[i];
				if(aCollectItems.InStock > 0){
					var oDatoReserva = await serviceSL.onObtenerDescuentoReserva(baseuri,aCollectItems);
					oDatoReserva.length > 0 ? aCollectItems.InStock = aCollectItems.InStock2 - oDatoReserva[0].U_CantReserva : null;
				}
			}
			var sCategoryId = oCategory.ItemCode;

			this._router.navTo("category", {
				id: sCategoryId
			});
			this._unhideMiddlePage();
			// this.getView().byId("searchField").clear("true");
		},

		onProductListSelect: function (oEvent) {
			var oItem = oEvent.getParameter("listItem");
			this._showProduct(oItem);
		},

		onProductListItemPress: function (oEvent) {
			var oItem = oEvent.getSource();
			this._showProduct(oItem);
		},

		_showProduct: function (oItem) {
			var oEntry = oItem.getBindingContext().getObject();

			this._router.navTo("product", {
				id: oEntry.Category,
				productId: oEntry.ProductId
			}, !Device.system.phone);
		},

		/**
		 * Always navigates back to home
		 * @override
		 */
		onBack: function () {
			this.getRouter().navTo("home");
		}
	});
});