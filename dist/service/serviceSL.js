sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(e,n,r,t){"use strict";var o;return{setManifestObject:function(e){o=e.getOwnerComponent().getManifestObject()},onAprobarServiceLayer:function(e,n){return new Promise(function(r,t){var o=n+"sb1sl/DraftsService_SaveDraftToDocument";var a={Document:{DocDueDate:e.contextData.FechaRegistro,DocEntry:e.contextData.DocEntry}};$.ajax({type:"POST",dataType:"json",url:o,data:JSON.stringify(a),success:function(e){r(e)},error:function(e){t(e)}})})},onAprobarServiceLayertask:function(e,n,r,t,o,a){return new Promise(function(r,t){var s=n+"sb1sl/Drafts("+e.contextData.DocEntry+")";var i={};i.ESTADO_RESERVA=a;if(a=="RESERVADO"||a=="POR ENTREGAR"){i.U_ESTADO_A1="A";i.U_ESTADO_A2="P";i.U_APROBADOR1=571;i.U_COMENTARIO_A1=o?o:"Aprobado nivel 1 - 2"}else{i.U_ESTADO_A2="A";i.U_APROBADOR2=488;i.U_COMENTARIO_A2=o?o:"Aprobado nivel 3"}$.ajax({type:"PATCH",dataType:"json",url:s,data:JSON.stringify(i),success:function(e){r(e)},error:function(e){t(e)}})})},onRechazarServiceLayertask:function(e,n,r,t){return new Promise(function(t,o){var a=n+"sb1sl/Drafts("+e.contextData.DocEntry+")";var s={};s.ESTADO_RESERVA="CANCELADO";if(r){s.U_ESTADO_A1="R";s.U_APROBADOR1=571;s.U_COMENTARIO_A1="Rechazado nivel 1 - 2"}else{s.U_ESTADO_A2="R";s.U_APROBADOR2=488;s.U_COMENTARIO_A2="Rechazado nivel 3"}$.ajax({type:"PATCH",dataType:"json",url:a,data:JSON.stringify(s),success:function(e){t(e)},error:function(e){o(e)}})})},onRechazarServiceLayer:function(e,n){return new Promise(function(r,t){var o=n+"sb1sl/Drafts("+e.contextData.DocEntry+")/Cancel";$.ajax({type:"POST",dataType:"json",url:o,success:function(e){r(e)},error:function(e){t(e)}})})},onAprobarWFInstance:function(e,n,r,t){var o={estadoAprob:true};if(r){o.AprobadorWF1=t}else{o.AprobadorWF2=t}return new Promise(function(r,t){$.ajax({url:n+"/wfrest/v1/task-instances/"+e.id,method:"PATCH",contentType:"application/json",dataType:"json",data:'{"status": "COMPLETED", "context": '+JSON.stringify(o)+"}",headers:{"X-CSRF-Token":"Fetch"},success:function(e){r(e)},error:function(e){t(e)}})})},onRechazarWFInstance:function(e,n,r,t){var o={};if(r){o.AprobadorWF1=t}else{o.AprobadorWF2=t}return new Promise(function(r,t){$.ajax({url:n+"/wfrest/v1/workflow-instances/"+e.workflowInstanceId,method:"PATCH",contentType:"application/json",async:false,data:'{"status": "CANCELED", "context": '+JSON.stringify(o)+"}",headers:{"X-CSRF-Token":"Fetch"},success:function(e){r(e)},error:function(e){t(e)}})})},onGetWorkflowInstances:function(e,n,r){var t=this,o,a=0;o="";return new Promise(function(r,s){$.ajax({url:n+"/wfrest/v1/task-instances?$skip=0&$top=1000&$inlinecount=allpages&status=READY,CANCELED,COMPLETED"+o+"&workflowDefinitionId=workflowmodulev1.myworkflowapproval",method:"GET",async:false,headers:{"X-CSRF-Token":"Fetch"},success:function(r,o,s){r.forEach(function(e){e.fechaOrder=new Date(e.createdAt).getTime();if(e.status==="READY"){e.estadoTarea="Pendiente";e.visible=true;e.orden=1}else if(e.status==="COMPLETED"){e.estadoTarea="Aprobado";e.visible=false;e.orden=2}else{e.estadoTarea="Rechazado";e.visible=false;e.orden=3}});r.sort(function(e,n){return n.fechaOrder-e.fechaOrder});r.forEach(function(r){a++;if(a<=20){t.getInstancesContext(r,e,n)}else{e.localModel.getProperty("/workflowitems").push(r);e.localModel.refresh(true)}})}})})},getInstancesContext:function(e,n,r){return new Promise(function(t,o){$.ajax({url:r+"/wfrest/v1/workflow-instances/"+e.workflowInstanceId+"/context",method:"GET",async:false,headers:{"X-CSRF-Token":"Fetch"},success:function(r,o,a){if(r.FechaRegistro){var s=r.FechaRegistro.split("-");e.FechaRegistroFilter=new Date(s[2]+"-"+s[1]+"-"+s[0])}r.AprobadorWF2?r.AprobadorWorkflow=r.AprobadorWF2:r.AprobadorWorkflow=r.AprobadorWF1;e.contextData=r;n.localModel.getProperty("/workflowitems").push(e);n.localModel.refresh(true);t(r)}})})},onGetCantidadCorrelativo:function(e,n){return new Promise(function(e,r){var t=n+"sb1sl/RESERVAS_BTP/$count";$.ajax({type:"GET",dataType:"json",url:t,headers:{Prefer:"odata.maxpagesize=1000"},success:function(n){e(n)},error:function(e){r(e)}})})},onAddDescuento:function(e,n){return new Promise(function(r,t){var o=n+"sb1sl/RESERVAS_BTP";var a={Code:e.Code,U_ItemCode:e.ItemCode,U_WhsCode:e.WarehouseCode,U_CantReserva:e.Quantity};$.ajax({type:"POST",dataType:"json",url:o,data:JSON.stringify(a),success:function(e){r(e)},error:function(e){t(e)}})})},onObtenerDescuentoReserva:function(e,n){return new Promise(function(r,t){var o=e+"sb1sl/RESERVAS_BTP?$filter=U_ItemCode eq '"+n.ItemCode+"' and U_WhsCode eq '"+n.WarehouseCode+"'";$.ajax({type:"GET",dataType:"json",url:o,headers:{Prefer:"odata.maxpagesize=1000"},success:function(e){r(e.value)},error:function(e){t(e)}})})},onEditDescuento:function(e,n){var r={U_ItemCode:n.U_ItemCode,U_WhsCode:n.U_WhsCode,U_CantReserva:n.U_CantReserva};return new Promise(function(t,o){var a=e+"sb1sl/RESERVAS_BTP('"+n.Code+"')";$.ajax({type:"PATCH",dataType:"json",url:a,data:JSON.stringify(r),success:function(e){t(e)},error:function(e){o(e)}})})},onObtenerAlternativosDetalle:function(e,n){var r=this;return new Promise(function(r,t){var o=n+"sb1sl/Items('"+e+"')";$.ajax({type:"GET",dataType:"json",url:o,headers:{Prefer:"odata.maxpagesize=1000"},success:function(e){e.ItemWarehouseInfoCollection.forEach(function(e){e.InStock2=e.InStock});r(e)},error:function(e){t(e.responseJSON)}})})},onConsultaServiceLayer:function(e,n){var r=this;return new Promise(function(r,t){var o=e+"sb1sl/"+n;$.ajax({type:"GET",dataType:"json",url:o,headers:{Prefer:"odata.maxpagesize=1000"},success:function(e){r(e.value)},error:function(e){t(e.responseJSON)}})})},onConsultaServiceLayerIdentificador:function(e,n,r){var t=this;return new Promise(function(n,t){var o=e+"sb1sl/U_ACTIVOS?$filter=U_Solicitante eq '"+r+"'";$.ajax({type:"GET",dataType:"json",url:o,headers:{Prefer:"odata.maxpagesize=1000"},success:function(e){n(e.value)},error:function(e){t(e.responseJSON)}})})},onConsultaIAS:function(e,n,r){var t=this,o;if(r==="Group"){o="groups.display";e="Grp_Aprobar_Reserva"}else{o="emails.value"}return new Promise(function(r,t){var a=n+"iasscim/Users?filter="+o+' eq "'+e+'"';$.ajax({type:"GET",contentType:"application/scim+json",url:a,success:function(e){r(e)},error:function(e){t(e.responseJSON)}})})},onObtenerAreas:function(e,n){return new Promise(function(r,t){var o=e+"sb1sl/Area('"+n+"')";$.ajax({type:"GET",dataType:"json",url:o,headers:{Prefer:"odata.maxpagesize=1000"},success:function(e){r(e)},error:function(e){t(e.responseJSON)}})})},getCentrosCosto:function(e,n){var r=this;return new Promise(function(r,t){var o=e+"sb1sl/ProfitCenters?$filter= U_Area eq '"+n+"'";$.ajax({type:"GET",dataType:"json",url:o,headers:{Prefer:"odata.maxpagesize=1000"},success:function(e){r(e.value)},error:function(e){r(e)}})})},consultaEmpleado:function(e,n,r){var t=this,o;return new Promise(function(e,t){var o=n+"sb1sl/"+r;$.ajax({type:"GET",dataType:"json",url:o,headers:{Prefer:"odata.maxpagesize=1000"},success:function(n){e(n.value)},error:function(e){t(e.responseJSON)}})})},consultaProjects:function(e,n){var r=this,t;var o=n.getUTCFullYear()+"-"+(n.getUTCMonth()+1).toString().padStart(2,"0")+"-"+n.getDate().toString().padStart(2,"0");return new Promise(function(n,r){var t=e+"sb1sl/Projects?$filter=ValidFrom lt '"+o+"' and ValidTo gt '"+o+"'";$.ajax({type:"GET",dataType:"json",url:t,headers:{Prefer:"odata.maxpagesize=1000"},success:function(e){n(e.value)},error:function(e){r(e.responseJSON)}})})},onObtenerAlmacen:function(e,n){var r=this,t;return new Promise(function(r,t){var o=n+"sb1sl/Warehouses('"+e+"')";$.ajax({type:"GET",dataType:"json",url:o,headers:{Prefer:"odata.maxpagesize=1000"},success:function(e){r(e)},error:function(e){t(e.responseJSON)}})})},onObtenerALMXTIPO:function(e,n,r){var t=this,o;return new Promise(function(e,t){var o=n+"sb1sl/"+r;$.ajax({type:"GET",dataType:"json",url:o,headers:{Prefer:"odata.maxpagesize=1000"},success:function(n){e(n.value)},error:function(e){t(e.responseJSON)}})})},onObtenerUsersIASxTipo:function(e,n){var r=this;return new Promise(function(e,r){var t=n+"iasscim/Users";$.ajax({type:"GET",contentType:"application/scim+json",url:t,success:function(n){e(n)},error:function(e){r(e.responseJSON)}})})},consultaAccountRulesProject:function(e){var n=this,r;return new Promise(function(n,r){var t=e+"sb1sl/GLAccountAdvancedRules?$filter=Code eq 'PROYECTOS'";$.ajax({type:"GET",dataType:"json",url:t,headers:{Prefer:"odata.maxpagesize=1000"},success:function(e){e.value.sort(function(e,n){return parseInt(n.PeriodName)-parseInt(e.PeriodName)});n(e.value)},error:function(e){r(e.responseJSON)}})})}}});