sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, DataService, Filter, FilterOperator) {
	"use strict";
	var oManifestObject;
	return {
		setManifestObject: function (that) {
			oManifestObject = that.getOwnerComponent().getManifestObject();
		},

        onAddDescuento: function(oDataAprobarSL,baseuri){
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl/BTP_RESERVA";
            var oDataPost = {
                  "Code": oDataAprobarSL.Code,
                  "U_ItemCode": oDataAprobarSL.ItemCode,
                  "U_WhsCode": oDataAprobarSL.WarehouseCode,
                  "U_CantReserva": oDataAprobarSL.Quantity
                };
            $.ajax({
              type: "POST",
              dataType: "json",
              url: uri,
              data: JSON.stringify(oDataPost),
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg);
              }
            });
          });
        },
        onObtenerDescuentoReserva: function(baseuri, aCollectItems){
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl/BTP_RESERVA?$filter=U_ItemCode eq '"+aCollectItems.ItemCode+"' and U_WhsCode eq '"+aCollectItems.WarehouseCode+"'";
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=1000"
              },
              // data: JSON.stringify(oDataPost),
              success: function (result) {
                resolve(result.value);
              },
              error: function (errMsg) {
                reject(errMsg);
              }
            });
          });
        },
        onEditDescuento: function(baseuri, aCollectItems){
          var oCambioDatos = {
            "U_ItemCode":aCollectItems.U_ItemCode,
            "U_WhsCode":aCollectItems.U_WhsCode,
            "U_CantReserva":aCollectItems.U_CantReserva
          };
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl/BTP_RESERVA('"+aCollectItems.Code+"')";
            $.ajax({
              type: "PATCH",
              dataType: "json",
              url: uri,
              data: JSON.stringify(oCambioDatos),
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg);
              }
            });
          });
        },
        onObtenerAlternativosDetalle: function(ItemCode,baseuri){
          var that = this;
          // var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
        
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl/Items('"+ItemCode+"')";
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=1000"
              },
              // data: JSON.stringify(loginInfo),
              success: function (result) {
                result.ItemWarehouseInfoCollection.forEach( function(e){
                  e.InStock2 = e.InStock;
                })
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg.responseJSON);
              }
            });
          });
        },

        onConsultaServiceLayer: function(baseuri, SLTable){
          var that = this;
          // var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
          return new Promise( function (resolve, reject) {
            // var uri = baseuri+"sb1sl/ProfitCenters";
            var uri = baseuri+"sb1sl/"+ SLTable;
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=1000"
              },
              success: function (result) {
                // that.localmodel.setProperty("/CentrosCosto", result.value);
                resolve(result.value);
              },
              error: function (errMsg) {
                reject(errMsg.responseJSON);
              }
            });
          });
        },
        onConsultaServiceLayerIdentificador: function(baseuri, SLTable, getAreasSolicitanteKey){
          var that = this;
          // var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
          return new Promise( function (resolve, reject) {
            // var uri = baseuri+"sb1sl/ProfitCenters";
            // var uri = baseuri+"sb1sl/U_ACTIVOS?$filter=U_Solicitante eq '"+getAreasSolicitanteKey+"'";
            var uri = baseuri+"sb1sl/U_ACTIVOS";
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=10000"
              },
              success: function (result) {
                // that.localmodel.setProperty("/CentrosCosto", result.value);
                resolve(result.value);
              },
              error: function (errMsg) {
                reject(errMsg.responseJSON);
              }
            });
          });
        },

        onConsultaIAS: function(sMail,baseuri, Options){
          var that = this,optionFilter;
          if(Options === "Group"){
            optionFilter = "groups.display"
            sMail = "Grp_Aprobar_Reserva"
          }else {
            optionFilter = "emails.value" ; 
          }
          return new Promise( function (resolve, reject) {
            var uri = baseuri+'iasscim/Users?filter='+optionFilter+' eq "' + sMail+ '"';
            $.ajax({
              type: "GET",
              contentType: "application/scim+json",
              url: uri,
              success: function (result) {
                // that.localmodel.setProperty("/CentrosCosto", result.value);
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg.responseJSON);
              }
            });
          });
        },
        onObtenerAreas: function(baseuri,getAreasSolicitanteKey){
          return new Promise( function (resolve, reject) {
						var uri = baseuri+"sb1sl/Area('"+ getAreasSolicitanteKey + "')";
						$.ajax({
							type: "GET",
							dataType: "json",
							url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=1000"
              },
							success: function (result) {
								// result.AREADCollection.forEach( function(instances){
								// 	that.getCentrosCosto(instances.U_Area);
								// })
                resolve(result);
								// that.hideBusyIndicator();
							},
							error: function (errMsg) {
								reject(errMsg.responseJSON);
							}
						});
					});
        },
        getCentrosCosto: function(baseuri, areaId){
          var that = this;
          // var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl/ProfitCenters?$filter= U_Area eq '"+areaId+"'";
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=1000"
              },
              success: function (data) {
                // var concatValues = that.localmodel.getProperty("/CentrosCosto").concat(data.value);
                // that.localmodel.setProperty("/CentrosCosto",concatValues);
                // that.localmodel.refresh(true);
                // that.hideBusyIndicator();
                resolve(data.value);
              },
              error: function (data) {
                resolve(data);
              }
            });
          });
        },
        consultaEmpleado: function (nArea, baseuri, query) {
          var that = this, option;
          // !EmpleadosArea ? EmpleadosArea = [] : null;
          // !skiptoken? skiptoken = 0 : null;
          return new Promise( function (resolve, reject) {
            // ListOption === "S" ? option = "ExternalEmployeeNumber" : option = "U_Area";
            // var uri = baseuri+"sb1sl/EmployeesInfo?$filter="+option+" eq '"+nArea+"'&$skip="+skiptoken;
            var uri = baseuri+"sb1sl/"+query;
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=1000"
              },
              success: function (result) {
                resolve(result.value);
              },
              error: function (errMsg) {
                reject(errMsg.responseJSON);
              }
            });
          });
        },
        consultaProjects: function (baseuri, newDate) {
          var that = this, option;
          var date = (newDate.getUTCFullYear()+"-"+(newDate.getUTCMonth()+1).toString().padStart(2, '0')+"-"+newDate.getDate().toString().padStart(2, '0'));
          return new Promise( function (resolve, reject) {
            var uri = baseuri+"sb1sl/Projects?$filter=ValidFrom lt '"+date+"' and ValidTo gt '"+date+"'";
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=1000"
              },
              success: function (result) {
                resolve(result.value);
              },
              error: function (errMsg) {
                reject(errMsg.responseJSON);
              }
            });
          });
        },
        onObtenerAlmacen: function (warehouse, baseuri) {
          var that = this, option;
          return new Promise( function (resolve, reject) {
            var uri = baseuri+"sb1sl/Warehouses('"+warehouse+"')";
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=1000"
              },
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg.responseJSON);
              }
            });
          });
        },
        onObtenerALMXTIPO: function (warehouse, baseuri,query) {
          var that = this, option;
          return new Promise( function (resolve, reject) {
            var uri = baseuri+"sb1sl/"+query;
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=1000"
              },
              success: function (result) {
                resolve(result.value);
              },
              error: function (errMsg) {
                reject(errMsg.responseJSON);
              }
            });
          });
        },
        onObtenerUsersIASxTipo: function(sTipo,baseuri){
          var that = this;
          return new Promise( function (resolve, reject) {
            var uri = baseuri+'iasscim/Users';
            $.ajax({
              type: "GET",
              contentType: "application/scim+json",
              url: uri,
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg.responseJSON);
              }
            });
          });
        },
        consultaAccountRulesProject: function (baseuri) {
          var that = this, option;
          return new Promise( function (resolve, reject) {
            var uri = baseuri+"sb1sl/GLAccountAdvancedRules?$filter=Code eq 'PROYECTOS'";
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=1000"
              },
              success: function (result) {
                result.value.sort(function (a, b) {
                  return parseInt(b.PeriodName) - parseInt(a.PeriodName);
                });
                resolve(result.value);
              },
              error: function (errMsg) {
                reject(errMsg.responseJSON);
              }
            });
          });
        },
        ///////////////////REFACTOR
        consultaGeneralB1SL: function (baseuri,sQuery, oData, Filters) {
          var that = this, option;
          return new Promise( function (resolve, reject) {
            var uri = baseuri+"sb1sl"+sQuery;
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: {
                "Prefer": "odata.maxpagesize=1000"
              },
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg);
              }
            });
          });
        },
        onPostGeneralDataServiceLayer: function(baseuri, sQuery, oData, Filters){
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl"+sQuery;
            $.ajax({
              type: "POST",
              dataType: "json",
              url: uri,
              data: oData ? JSON.stringify(oData) : null,
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg);
              }
            });
          });
        },
        onPatchGeneralDataServiceLayer: function(baseuri, sQuery, oData, Filters){
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl"+sQuery;
            $.ajax({
              type: "PATCH",
              dataType: "json",
              url: uri,
              data: oData ? JSON.stringify(oData) : null,
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg);
              }
            });
          });
        }

        


    };
});