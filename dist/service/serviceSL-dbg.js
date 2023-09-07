sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"

], function (JSONModel, DataService, Filter, FilterOperator,MessageBox) {
	"use strict";
	var oManifestObject;
	return {
		setManifestObject: function (that) {
			oManifestObject = that.getOwnerComponent().getManifestObject();
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
                resolve(result);
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
        ///////////////////REFACTOR
        consultaGeneralB1SL: function (baseuri,sQuery, oData, Filters,Limit) {
          var that = this, option;
          var headerData = {
            "B1S-CaseInsensitive": true
          };
          Limit ? null : headerData.Prefer = "odata.maxpagesize=1000";
          return new Promise( function (resolve, reject) {
            var uri = baseuri+"sb1sl"+sQuery;
            $.ajax({
              type: "GET",
              dataType: "json",
              url: uri,
              headers: headerData,
              success: function (result) {
                resolve(result);
              },
              error: function (errMsg) {
                // if (errMsg.responseJSON) {
                //   errMsg.responseJSON.error ? MessageBox.error(errMsg.responseJSON.error.message.value) : MessageBox.error("Ha sucedido un error al realizar la reserva");;
                // }else {
                //   MessageBox.error("Ha sucedido un error al realizar la reserva");
                // }
				        // this.hideBusyIndicator();
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
                // if (errMsg.responseJSON) {
                //   errMsg.responseJSON.error ? MessageBox.error(errMsg.responseJSON.error.message.value) : MessageBox.error("Ha sucedido un error al realizar la reserva");;
                // }else {
                //   MessageBox.error("Ha sucedido un error al realizar la reserva");
                // }
				        // this.hideBusyIndicator();
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
                // if (errMsg.responseJSON) {
                //   errMsg.responseJSON.error ? MessageBox.error(errMsg.responseJSON.error.message.value) : MessageBox.error("Ha sucedido un error al realizar la reserva");;
                // }else {
                //   MessageBox.error("Ha sucedido un error al realizar la reserva");
                // }
				        // this.hideBusyIndicator();
                reject(errMsg);
              }
            });
          });
        },
        onPOSTWorkflowInstances: function(baseuri, sQuery, oData){
          return new Promise(function (resolve, reject) {
            $.ajax({
              url: baseuri + "/wfrest/v1"+sQuery,
              type: "POST",
              data: JSON.stringify(oData),
              contentType: "application/json",
              async: false,
              success: function (data) {
                resolve(data);
              },
              error: function (oError) {
                resolve(oError);
              }
            });
          });
        }

        


    };
});