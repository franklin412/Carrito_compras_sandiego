sap.ui.define([
	"sap/ui/core/format/NumberFormat",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (NumberFormat, MessageToast, MessageBox) {
	"use strict";

	var mStatusState = {
		"A": "Success",
		"O": "Warning",
		"D": "Error"
	};

	var formatter = {

        highlight: function(Knttp, Werks, Kostl, Saknr, Aufk, Anla){
            if (!Werks || Werks === ""){
                return "Error"
            }

            if (Knttp === "A" && Anla === ""){
                return "Error"
            }

            if (Knttp === "F" && Saknr === ""){
                return "Error"
            }           

            if (Knttp === "F" && Aufk === ""){   
                return "Error"
            }  

            if (Knttp === "K" && Kostl === ""){
                return "Error"
            }

            return "Success"
        },
        priceTipoCambio: function (sValue, sTipoCambio){
			var numberFormat = NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				minFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ",",
				decimalSeparator: "."
            });
            
            if (sTipoCambio){
                sValue = parseFloat(sValue) * parseFloat(sTipoCambio);
            }else if(!sValue){
				sValue = 0;
			}

            return numberFormat.format(sValue);
        },
        /**
		 * Formats the price
		 * @param {string} sValue model price value
		 * @return {string} formatted price
		 */
		price: function (sValue, sCantidad) {
			var numberFormat = NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				minFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ",",
				decimalSeparator: "."
            });
            
            if (sCantidad){
                sValue = sValue * sCantidad;
            }

			return numberFormat.format(sValue);
		},
		cantidad: function (sValue) {
			var numberFormat = NumberFormat.getFloatInstance({
				maxFractionDigits: 0,
				minFractionDigits: 0,
				groupingEnabled: true,
				groupingSeparator: "."
            });
            
            sValue = sValue;
            

			return numberFormat.format(sValue);
		},
		/**
		 * Sums up the price for all products in the cart
		 * @param {object} oCartEntries current cart entries
		 * @return {string} string with the total value
		 */
		totalPrice: function (oCartEntries) {
			var localmodel = this.getOwnerComponent().getModel("localmodel");
			var oBundle = this.getResourceBundle(),
                fTotalPrice = 0;
			(oCartEntries).forEach(function (sProductId) {
				var oProduct = oCartEntries[sProductId];
				fTotalPrice += (parseFloat(oProduct.Precio_Unit) * parseFloat(oProduct.Kursf ? oProduct.Kursf : 1)) * oProduct.Quantity;
			});

			return formatter.price(fTotalPrice);
		},

		/**
		 * Returns the status text based on the product status
		 * @param {string} sStatus product status
		 * @return {string} the corresponding text if found or the original value
		 */
		statusText: function (sStatus) {
			var oBundle = this.getResourceBundle();

			var mStatusText = {
				"A": oBundle.getText("statusA"),
				"O": oBundle.getText("statusO"),
				"D": oBundle.getText("statusD")
			};

			return mStatusText[sStatus] || sStatus;
		},

		/**
		 * Returns the product state based on the status
		 * @param {string} sStatus product status
		 * @return {string} the state text
		 */
		statusState: function (sStatus) {
			return mStatusState[sStatus] || "None";
		},

		/**
		 * Returns the relative URL to a product picture
		 * @param {string} sUrl image URL
		 * @return {string} relative image URL
		 */
		pictureUrl: function (sUrl) {
			if (sUrl) {
				return sap.ui.require.toUrl(sUrl);
			} else {
				return undefined;
			}
		},

		/**
		 * Returns the footer text for the cart based on the amount of products
		 * @param {object} oSavedForLaterEntries the entries in the cart
		 * @return {string} "" for no products, the i18n text for >0 products
		 */
		footerTextForCart: function (oSavedForLaterEntries) {
			var oBundle = this.getResourceBundle();

			if ((oSavedForLaterEntries).length === 0) {
				return "";
			}
			return oBundle.getText("cartSavedForLaterFooterText");
		},

		/**
		 * Checks if one of the collections contains items.
		 * @param {object} oCollection1 First array or object to check
		 * @param {object} oCollection2 Second array or object to check
		 * @return {boolean} true if one of the collections is not empty, otherwise - false.
		 */
		hasItems: function (oCollection1, oCollection2) {
			var bCollection1Filled = !!(oCollection1 && Object.keys(oCollection1).length),
				bCollection2Filled = !!(oCollection2 && Object.keys(oCollection2).length);

			return bCollection1Filled || bCollection2Filled;
        },
        
        countItems: function (oCartEntries) {
            
            var count = 0;

            for(var prop in oCartEntries) {
                if(oCartEntries.hasOwnProperty(prop))
                    ++count;
            }

            return count;
        },

        formatMes: function(sValue){
            if(!sValue) return "";
            var output;
            switch (sValue) {
            case 1:
                output = "Enero";
                break;
            case 2:
                output = "Febrero";
                break;
            case 3:
                output = "Marzo";
                break;
            case 4:
                output = "Abril";
                break; 
            case 5:
                output = "Mayo";
                break; 
            case 6:
                output = "Junio";
                break; 
            case 7:
                output = "Julio";
                break;
            case 8:
                output = "Agosto";
                break;
            case 9:
                output = "Setiembre";
                break;
            case 10:
                output = "Octubre";
                break;
            case 11:
                output = "Noviembre";
                break;
            case 12:
                output = "Diciembre";
                break;
            default:
                output = "";
        }

        return output; 
        }
	};

	return formatter;
});