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
        onAprobarServiceLayer: function(oDataAprobarSL,baseuri){
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl/DraftsService_SaveDraftToDocument";
            var oDataPost = {
                "Document": {
                    "DocDueDate": oDataAprobarSL.contextData.FechaRegistro,
                    "DocEntry": oDataAprobarSL.contextData.DocEntry
                }
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
        onAprobarServiceLayertask: function(oDataAprobarSL,baseuri,task1,usuarioLogeado,comentario,userTaskEstado){
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl/Drafts("+oDataAprobarSL.contextData.DocEntry+")";
            var oDataPostTask = {};
            oDataPostTask.ESTADO_RESERVA = userTaskEstado;
            if(userTaskEstado == "RESERVADO" || userTaskEstado == "POR ENTREGAR"){
              oDataPostTask.U_ESTADO_A1 = "A";
              oDataPostTask.U_ESTADO_A2 = "P";
              oDataPostTask.U_APROBADOR1 = 571;
              // oDataPostTask.U_COMENTARIO_A1 = "Aprobado nivel 1";
              oDataPostTask.U_COMENTARIO_A1 = comentario ? comentario : "Aprobado nivel 1 - 2";
            }else {
              oDataPostTask.U_ESTADO_A2 = "A"
              oDataPostTask.U_APROBADOR2 = 488;
              // oDataPostTask.U_COMENTARIO_A2 = "Aprobado nivel 2";
              oDataPostTask.U_COMENTARIO_A2 = comentario ? comentario : "Aprobado nivel 3";
            }

            $.ajax({
              type: "PATCH",
              dataType: "json",
              url: uri,
              data: JSON.stringify(oDataPostTask),
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg);
              }
            });
          });
        },
        onRechazarServiceLayertask: function(oDataAprobarSL,baseuri,task1,usuarioLogeado){
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl/Drafts("+oDataAprobarSL.contextData.DocEntry+")";
            var oDataPostTask = {};
            oDataPostTask.ESTADO_RESERVA = "CANCELADO";
            if(task1){
              oDataPostTask.U_ESTADO_A1 = "R";
              oDataPostTask.U_APROBADOR1 = 571;
              oDataPostTask.U_COMENTARIO_A1 = "Rechazado nivel 1 - 2";
            }else {
              oDataPostTask.U_ESTADO_A2 = "R"
              oDataPostTask.U_APROBADOR2 = 488;
              oDataPostTask.U_COMENTARIO_A2 = "Rechazado nivel 3";
            }

            $.ajax({
              type: "PATCH",
              dataType: "json",
              url: uri,
              data: JSON.stringify(oDataPostTask),
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg);
              }
            });
          });
        },
        onRechazarServiceLayer: function(oDataAprobarSL,baseuri){
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl/Drafts("+oDataAprobarSL.contextData.DocEntry+")/Cancel";
            $.ajax({
              type: "POST",
              dataType: "json",
              url: uri,
              // data: JSON.stringify(oDataPost),
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg);
              }
            });
          });
        },
        onAprobarWFInstance: function(oDataAprobarWFI,baseuri,task1,usuarioLogeado){
            var oContext = {
                "estadoAprob" : true
            }
            if(task1){
              oContext.AprobadorWF1 = usuarioLogeado;
            }else {
              oContext.AprobadorWF2 = usuarioLogeado;
            }
          return new Promise(function (resolve, reject) {
            $.ajax({
              url: baseuri+"/wfrest/v1/task-instances/" + oDataAprobarWFI.id,
              method: "PATCH",
              contentType: "application/json",
              dataType: "json",
              data: '{"status": "COMPLETED", "context": ' + JSON.stringify(oContext) + "}",
              headers: {
                  "X-CSRF-Token": "Fetch"
              },
              success: function (oData) {
                  resolve(oData);
              },
              error: function (errMsg) {
                  reject(errMsg);
              }
            });
          });
        },
        onRechazarWFInstance: function(oDataRechazarWFI,baseuri,task1,usuarioLogeado){
            var oContext = {};
            if(task1){
              oContext.AprobadorWF1 = usuarioLogeado;
            }else {
              oContext.AprobadorWF2 = usuarioLogeado;
            }
            return new Promise(function (resolve, reject) {
              $.ajax({
                url: baseuri+"/wfrest/v1/workflow-instances/" + oDataRechazarWFI.workflowInstanceId,
                method: "PATCH",
                contentType: "application/json",
                async: false,
                data: '{"status": "CANCELED", "context": ' + JSON.stringify(oContext) + "}",
                headers: {
                    "X-CSRF-Token": "Fetch"
                },
                success: function (oData) {
                    resolve(oData);
                },
                error: function (errMsg) {
                    reject(errMsg);
                }
              });
            });
        },
        onGetWorkflowInstances: function(mthis,baseuri,usuarioLogeado){
          var oThat = this, usertask, contador = 0;
          // if(usuarioLogeado === "frank.salcedo@hotmail.com"){
          //   usertask  = "&activityId=usertask1"
          // }else if(usuarioLogeado === "amatienzo.coder@gmail.com"){
          //   usertask  = "&activityId=usertask2"
          // }else{
            usertask  = ""
          // }
            return new Promise(function (resolve, reject) {
                $.ajax({
                    // url: baseuri+"/wfrest/v1/workflow-instances?$skip=0&$top=1000&$inlinecount=allpages&status=COMPLETED,RUNNING,CANCELED&workflowDefinitionId=MyWorkflowApproval",
                    url: baseuri+"/wfrest/v1/task-instances?$skip=0&$top=1000&$inlinecount=allpages&status=READY,CANCELED,COMPLETED"+usertask+"&workflowDefinitionId=workflowmodulev1.myworkflowapproval",
                    method: "GET",
                    async: false,
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    },
                    success: function (result, xhr, data) {
                      result.forEach( function(element){
                        element.fechaOrder = (new Date(element.createdAt)).getTime();
                        if(element.status === "READY"){
                          element.estadoTarea = "Pendiente";
                          element.visible     = true;
                          element.orden       = 1;
                        } else if(element.status === "COMPLETED"){
                          element.estadoTarea = "Aprobado"
                          element.visible     = false;
                          element.orden       = 2;
                        }else {
                          element.estadoTarea = "Rechazado"
                          element.visible     = false;
                          element.orden       = 3;
                        }
                      })
                      // result.sort(function (a, b) {
                      //   return a.orden - b.orden;
                      // });
                      result.sort(function (a, b) {
                        return b.fechaOrder - a.fechaOrder;
                      });
                      result.forEach( function(item){
                        contador++;
                        if(contador <= 20){
                          oThat.getInstancesContext(item,mthis,baseuri);
                        }else{
                          mthis.localModel.getProperty("/workflowitems").push(item);
                          mthis.localModel.refresh(true);
                        }
                      })
                    
                    }
                });
            });
        },
        getInstancesContext: function(instanceData, mthis, baseuri){
          // var baseuri = this.getURLmodule();
          return new Promise(function (resolve, reject) {
              $.ajax({
                url: baseuri+"/wfrest/v1/workflow-instances/"+instanceData.workflowInstanceId+"/context",
                method: "GET",
                async: false,
                headers: {
                    "X-CSRF-Token": "Fetch"
                },
                success: function (result, xhr, data) {
                  if(result.FechaRegistro){
                    var separarFecha = (result.FechaRegistro).split("-");
                    instanceData.FechaRegistroFilter = new Date(separarFecha[2]+"-"+separarFecha[1]+"-"+separarFecha[0]);
                  }
                  result.AprobadorWF2 ? result.AprobadorWorkflow = result.AprobadorWF2 : result.AprobadorWorkflow = result.AprobadorWF1;
                  instanceData.contextData = result;
                  mthis.localModel.getProperty("/workflowitems").push(instanceData);
                  mthis.localModel.refresh(true);
                  resolve(result);
                }
            });
          });
        },

        onGetCantidadCorrelativo: function(oDataAprobarSL,baseuri){
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl/RESERVAS_BTP/$count";
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              // data: JSON.stringify(oDataPost),
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                reject(errMsg);
              }
            });
          });
        },
        onAddDescuento: function(oDataAprobarSL,baseuri){
          return new Promise(function (resolve, reject) {
            var uri = baseuri+"sb1sl/RESERVAS_BTP";
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
            var uri = baseuri+"sb1sl/RESERVAS_BTP?$filter=U_ItemCode eq '"+aCollectItems.ItemCode+"' and U_WhsCode eq '"+aCollectItems.WarehouseCode+"'";
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
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
            var uri = baseuri+"sb1sl/RESERVAS_BTP('"+aCollectItems.Code+"')";
            $.ajax({
              type: "PATCH",
              dataType: "json",
              url: uri,
              data: JSON.stringify(oCambioDatos),
              success: function (result) {
                resolve(result.value);
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
        }


    };
});