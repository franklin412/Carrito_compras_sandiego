sap.ui.define([
	"./BaseController",
	"../model/cart",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"../model/formatter",
	"sap/m/MessageBox",
	"sap/m/Link",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"../model/EmailType",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/format/NumberFormat",
	"../service/serviceSL"
], function (BaseController, cart, JSONModel, Device, formatter, MessageBox, Link, MessagePopover, MessagePopoverItem, EmailType,
	Fragment, MessageToast, Filter, FilterOperator, BusyIndicator, NumberFormat, serviceSL) {
	"use strict";
	var sCartEntries = "cartEntries";
	var sMensajeError;
	var fErrorCampos;
	return BaseController.extend("zsandiego.crearreserva.controller.Checkout", {

		types: {
			email: new EmailType()
		},

		formatter: formatter,

		onInit: async function () {
			var oModel = new JSONModel({});

			this.setModel(oModel, "cartEntry");
			this.cartEntry = this.getModel("cartEntry")
			// previously selected entries in wizard
			this._oHistory = {
				prevPaymentSelect: null,
				prevDiffDeliverySelect: null
			};
			var that = this
			this.localmodel = this.getOwnerComponent().getModel("localmodel");
			this.matchcode = this.getOwnerComponent().getModel("matchcode");
			this.presupuesto = this.getOwnerComponent().getModel("presupuesto");
			// this.matchcode.read("/ZCDSMM_KNTTP_TXT", {
			//     success: function(oData, response) {
			//         that.localmodel.setProperty("/ZCDSMM_KNTTP_TXT", response.data.results);
			//     }
			// }); 



			// Assign the model object to the SAPUI5 core
			this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");

			// switch to single column view for checout process
			this.getRouter().getRoute("checkout").attachMatched(function () {
				this._setLayout("One");
				this._clearMessages();
				var oWizard = this.getView().byId("shoppingCartWizard")
				oWizard.discardProgress(oWizard.getSteps()[0]);

			}.bind(this));

			this.openIngresar = sap.ui.xmlfragment("zsandiego.crearreserva.view.fragment.IngresarCantidad", this);
			this.getView().addDependent(this.openIngresar);
			this._oCart = this.getOwnerComponent().getModel("cartProducts");
			var cantidadlista = (this._oCart.getProperty("/cartEntries")).length;
			this.localmodel.setProperty("/listaProductosCantidad/value", cantidadlista);
			var proveedores = this._oCart.getProperty("/cartEntries");
			var tday = new Date();
			// var dateCheckout = tday.getUTCFullYear()+"/"+ (tday.getUTCMonth()+1) +"/"+tday.getDate();
			var dateCheckout = tday.getDate() + "-" + (tday.getUTCMonth() + 1) + "-" + tday.getUTCFullYear();
			this._oCart.setProperty("/TodayDate", dateCheckout);

			this.localmodel.setProperty("/pruebav1", proveedores);

		},
		ContadorRequisiciones: function () {
			var proveedores = this._oCart.getProperty("/cartEntries");
			this.localmodel.setProperty("/pruebav1", proveedores);
			var entriesArray = [];
			var supplierArray = [];
			Object.values(proveedores).forEach(function (linea, index) {
				entriesArray.push(linea);
			});
			var result = entriesArray.reduce(function (r, a) {
				if (!r[a.SupplierName]) {
					r[a.SupplierName] = {};
					r[a.SupplierName].SupplierName = a.SupplierName;
					r[a.SupplierName].Productos = [];
				}
				var datos = {
					"descripcion": a.Name
				};
				r[a.SupplierName].Productos.push(datos);
				return r;
			}, Object.create(null));

			Object.values(result).forEach(function (linea, index) {
				supplierArray.push(linea);
			});
			this.localmodel.setProperty("/NumRequisicion", []);
			var contenedorProv = [];
			contenedorProv = supplierArray;
			this.localmodel.setProperty("/linearequisicion", contenedorProv.length);
			for (var i = 1; i <= contenedorProv.length; i++) {
				var datos = {
					"requisicion": 450000000 + i
				};
				this.localmodel.getProperty("/NumRequisicion").push(datos);
			}

			this.localmodel.refresh(true);
		},
		changeComboSucursal: function (oEvent) {
			var key = oEvent.getParameters().selectedItem.mProperties.key - 1;
			var datos = "/Sucursal/";
			var path = datos + key;
			var sobrino = this.localmodel.getProperty(path);
			this.localmodel.setProperty("/lineasucursal", sobrino);

		},
		changeComboFactura: function (oEvent) {
			var key = oEvent.getParameters().selectedItem.mProperties.key - 1;
			var datos = "/datosFacturacion/";
			var path = datos + key;
			var sobrino = this.localmodel.getProperty(path);
			this.localmodel.setProperty("/lineafactura", sobrino);

		},
		imputacionChange: function (oEvent) {
			this.cartEntry.setProperty("/entry/Kostl", "");
			this.cartEntry.setProperty("/entry/Saknr", "");
			this.cartEntry.setProperty("/entry/Aufk", "");
			this.cartEntry.setProperty("/entry/Anla", "");

			var sImputacion = this.cartEntry.getProperty("/entry/Knttp");

			if (sImputacion === "K") {
				var oCatalogo = this.getModel("catalogo");
				var oObj = this._oDialogDetalle.getBindingContext("cartEntry").getObject();
				var sMatnr = oObj.Catyp === "M" ? oObj.Item : "";
				var sWerks = oObj.Catyp === "M" ? oObj.Werks : "";
				var sBwtar = "";
				var sAsnum = oObj.Catyp === "S" ? oObj.Item : "";

				var sPath = "/" + oCatalogo.createKey("cuentaSet", {
					Matnr: sMatnr,
					Werks: sWerks,
					Bwtar: sBwtar,
					Asnum: sAsnum
				});
				var that = this;
				this.getView().byId("idfragcuenta").setBusy(true);
				oCatalogo.read(sPath, {
					success: function (oData, response) {
						that.getView().byId("idfragcuenta").setBusy(false);
						that.getModel("cartEntry").setProperty("/entry/Saknr", oData.Kstar);
					}, error: function () {
						that.getView().byId("idfragcuenta").setBusy(false);
						that.getModel("cartEntry").setProperty("/entry/Saknr", "");
					}
				});
			}


		},
		changeComboDireccion: function (oEvent) {
			var key = oEvent.getParameters().selectedItem.mProperties.key - 1;
			var datos = "/DireccionEnvio/";
			var path = datos + key;
			var sobrino = this.localmodel.getProperty(path);
			this.localmodel.setProperty("/lineadireccion", sobrino);
		},
		/**
		 * Only validation on client side, does not involve a back-end server.
		 * @param {sap.ui.base.Event} oEvent Press event of the button to display the MessagePopover
		 */
		onShowMessagePopoverPress: function (oEvent) {
			var oButton = oEvent.getSource();

			var oLink = new Link({
				text: "Show more information",
				href: "http://sap.com",
				target: "_blank"
			});

			/**
			 * Gather information that will be visible on the MessagePopover
			 */
			var oMessageTemplate = new MessagePopoverItem({
				type: '{message>type}',
				title: '{message>message}',
				subtitle: '{message>additionalText}',
				link: oLink
			});

			if (!this.byId("errorMessagePopover")) {
				var oMessagePopover = new MessagePopover(this.createId("messagePopover"), {
					items: {
						path: 'message>/',
						template: oMessageTemplate
					},
					afterClose: function () {
						oMessagePopover.destroy();
					}
				});
				this._addDependent(oMessagePopover);
			}

			oMessagePopover.openBy(oButton);
		},

		//To be able to stub the addDependent function in unit test, we added it in a separate function
		_addDependent: function (oMessagePopover) {
			this.getView().addDependent(oMessagePopover);
		},


		/**
		 * Called from <code>ordersummary</code>
		 * shows warning message and submits order if confirmed
		 */
		handleWizardSubmit: function () {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var oCabecera = this._oCart.getProperty("/lineaCabeceraDetalle");
			var oEntries = this._oCart.getProperty("/cartEntries");
			var aEntries = [];
			for (var key in oEntries) {
				aEntries.push(oEntries[key])
			}
			var that = this;
			if (oCabecera.AsignacionDetalle === "") {
				MessageBox.warning("Debes ingresar una clase de pedido.", {
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (oAction) {
						that.byId("idfragasignacion_").focus();
					}
				}
				);

				return;
			}

			if (oCabecera.Organizacion === "") {
				MessageBox.warning("Debes ingresar una Organizacion de Compras.", {
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (oAction) {
						that.byId("idfragOrgCompra").focus();
					}
				}
				);

				return;
			}

			if (oCabecera.GrupoCompra === "") {
				MessageBox.warning("Debes ingresar un Grupo de Compras.", {
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (oAction) {
						that.byId("idfragGrupoCompra").focus();
					}
				}
				);
				return;
			}

			if (oCabecera.Sociedad === "") {
				MessageBox.warning("Debes ingresar una Sociedad.", {
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (oAction) {
						that.byId("idfragSociedad").focus();
					}
				}
				);
				return;
			}

			if (oCabecera.Solicitante === "") {
				MessageBox.warning("Debes ingresar un Solicitante.", {
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (oAction) {
						that.byId("idfragSolicitante").focus();
					}
				}
				);
				return;
			}

			var sText = this.getResourceBundle().getText("checkoutControllerAreYouSureSubmit");
			this._handleSubmitOrCancel(sText, "confirm", "ordercompleted", oEntries);
		},

		/**
		 * Called from <code>_handleSubmitOrCancel</code>
		 * resets Wizard after submitting or canceling order
		 */
		backToWizardContent: function () {
			this.byId("wizardNavContainer").backToPage(this.byId("wizardContentPage").getId());
		},

		/**
		 * Removes validation error messages from the previous step
		 */
		_clearMessages: function () {
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},
		handleInputChange: function (oEvent) {

			var control = oEvent.getSource();
			var idSuggestion = control._bSelectingItem;
			if (idSuggestion) {
				control.setValueState("None");
			} else {
				var sPath = control.getBindingPath("value");
				this._oCart.setProperty(sPath, "")
				control.setValueState("Error");
			}
			control._bSelectingItem = undefined;

			if (sPath === "/lineaCabeceraDetalle/AsignacionDetalle") {
				var sValue = this._oCart.getProperty(sPath)
				var sBatxt = this.getModel("matchcode").getProperty("/ZCDSALAYRI_ESART('" + sValue + "')/batxt")
				this._oCart.setProperty("/Clasepedido", sBatxt);
			}

		},
		/*
		 * Checks if one or more of the inputs are empty
		 * @param {array} aInputIds - Input ids to be checked
		 * @returns {boolean}
		 * @private
		 */
		_checkInputFields: function (aInputIds) {
			var oView = this.getView();

			return aInputIds.some(function (sInputId) {
				var oInput = oView.byId(sInputId);
				var oBinding = oInput.getBinding("value");

				return oInput.getValue() === "";

			});
		},



		/**
		 * Called from  Wizard on <code>complete</code>
		 * Navigates to the summary page in case there are no errors
		 */
		checkCompleted: function () {

			this.handleWizardSubmit();



		},
		onClearCentroCosto: function (aArticulos) {
			var oThat = this;
			oThat.localmodel.setProperty("/CentrosCosto", []);
			// var aCentroCosto = oThat._oCart.getProperty("/cartEntries");
			aArticulos.forEach(function (element) {
				element.CentroCostoValue = null;
				element.CentroCostoSelected = null;
				element.SelectedKeyCentro = null;
			})
			oThat._oCart.refresh(true);
			oThat.localmodel.refresh(true);
		},
		onClearClaveLabor: function (aArticulos) {
			var oThat = this;
			// var aClvLabor = oThat._oCart.getProperty("/cartEntries");
			aArticulos.forEach(function (element) {
				element.ClaveLabor = [];
				element.ClaveLaborValue = null;
				element.ClaveLaborSelected = null;
				element.SelectedKeyClave = null;
			})
			oThat._oCart.refresh(true);
		},
		onClearCampoObjeto: function (aArticulos) {
			var oThat = this;
			// var aClvLabor = oThat._oCart.getProperty("/cartEntries");
			aArticulos.forEach(function (element) {
				element.CampoObjeto = [];
				element.CampoObjetoValue = null;
				element.CampoObjetoSelected = null;
				element.SelectedKeyCampoObj = null;
			})
			oThat._oCart.refresh(true);
		},
		onClearCampoSolicitante: function (aArticulos) {
			var oThat = this;
			// var aSolicitante = oThat._oCart.getProperty("/cartEntries");
			aArticulos.forEach(function (element) {
				// element.CampoSolicitante 			= [];
				element.CampoSolicitanteValue = null;
				element.CampoSolicitanteKey = null;
			})
			oThat._oCart.refresh(true);
		},
		onClearCampoIdentificador: function (aArticulos) {
			var oThat = this;
			// var aSolicitante = oThat._oCart.getProperty("/cartEntries");
			aArticulos.forEach(function (element) {
				element.IdentificadorValue = null;
				element.CampoIdentificadorSelected = null;
				element.visIdentificador = null;
			})
			oThat._oCart.refresh(true);
		},
		onSetSolicianteValues: function (oEmpleado, aArticulos) {
			var oThat = this;
			aArticulos.forEach(function (element) {
				// element.CampoSolicitante 			= [];
				element.CampoSolicitanteValue = oEmpleado.FirstName ? oEmpleado.FirstName + " " : "" + oEmpleado.MiddleName ? oEmpleado.MiddleName + " " : "" + oEmpleado.LastName ? oEmpleado.LastName : "";
				element.CampoSolicitanteKey = oEmpleado.ExternalEmployeeNumber; //enviar dato
			})
			oThat._oCart.refresh(true);
		},

		onSelectCentro: function (oEvent) {
			try {
				var that = this;
				this.showBusyIndicator();
				var selectedCentro = oEvent.getSource().getSelectedKey();
				var selectedObject = oEvent.getSource().getBindingContext("cartProducts");
				selectedObject.getObject().CentroCostoSelected = selectedCentro ? selectedCentro : null;
				selectedObject.getObject().ClaveLaborValue = null;
				selectedObject.getObject().ClaveLaborSelected = null;
				selectedObject.getObject().CampoObjetoValue = null;
				selectedObject.getObject().CampoObjetoSelected = null;
				selectedObject.getObject().SelectedKeyClave = null;
				selectedObject.getObject().SelectedKeyCampoObj = null;
				selectedObject.getObject().ClaveLabor = [];
				selectedObject.getObject().CampoObjeto = [];
				if (selectedCentro) {
					that.onObtenerClaveLabor(selectedObject, selectedCentro);
				} else {

				}
				// }
				this.hideBusyIndicator();
			} catch (e) {
				MessageBox.error("Ha sucedido un error al seleccionar el centro");
				this.hideBusyIndicator();
			}
		},
		onSearchExisteCentro: function (oEvent) {
			let oChange = oEvent;
		},
		onSelectOrdenTrabajo: function (oEvent) {
			try {
				var that = this;
				this.showBusyIndicator();
				var selectedOrdenTrabajo = oEvent.getSource().getSelectedKey();
				var selectedObject = oEvent.getSource().getBindingContext("cartProducts");
				selectedObject.getObject().OrdenTrabajoSelected = selectedOrdenTrabajo ? selectedOrdenTrabajo : null;
				// if(!selectedOrdenTrabajo){
				// 	selectedObject.getObject().OrdenTrabajoValue = null;
				// }
				this.hideBusyIndicator();
			} catch (e) {
				MessageBox.error("Ha sucedido un error al seleccionar la orden de trabajo");
				this.hideBusyIndicator();
			}
		},
		onSelectActivoFijo: function (oEvent) {
			try {
				var that = this;
				this.showBusyIndicator();
				var selectedActivoFijo = oEvent.getSource().getSelectedKey();
				var selectedObject = oEvent.getSource().getBindingContext("cartProducts");
				selectedObject.getObject().ActivoFijoSelected = selectedActivoFijo ? selectedActivoFijo : null;
				// if(!selectedActivoFijo){
				// 	selectedObject.getObject().ActivoFijoValue = null;
				// }
				this.hideBusyIndicator();
			} catch (e) {
				MessageBox.error("Ha sucedido un error al seleccionar la orden de trabajo");
				this.hideBusyIndicator();
			}
		},
		onSelectProyecto: function (oEvent) {
			try {
				var that = this;
				this.showBusyIndicator();
				var selectedProyecto = oEvent.getSource().getSelectedKey();
				var selectedObjectProyecto = oEvent.getSource().getBindingContext("cartProducts");
				selectedObjectProyecto.getObject().ProyectoSelected = selectedProyecto ? selectedProyecto : null;
				if (!selectedProyecto) {
					selectedObjectProyecto.getObject().visProyecto = false;
				} else {
					selectedObjectProyecto.getObject().CentroCostoValue = null;
					selectedObjectProyecto.getObject().CentroCostoSelected = null;
					selectedObjectProyecto.getObject().SelectedKeyCentro = null;
					selectedObjectProyecto.getObject().ClaveLabor = [];
					selectedObjectProyecto.getObject().ClaveLaborValue = null;
					selectedObjectProyecto.getObject().ClaveLaborSelected = null;
					selectedObjectProyecto.getObject().SelectedKeyClave = null;
					selectedObjectProyecto.getObject().CampoObjeto = [];
					selectedObjectProyecto.getObject().CampoObjetoValue = null;
					selectedObjectProyecto.getObject().CampoObjetoSelected = null;
					selectedObjectProyecto.getObject().SelectedKeyCampoObj = null;
					selectedObjectProyecto.getObject().IdentificadorValue = null;
					selectedObjectProyecto.getObject().CampoIdentificadorSelected = null;
					selectedObjectProyecto.getObject().visProyecto = true;
					selectedObjectProyecto.getObject().visIdentificador = false;
					// selectedObject.getObject().visIdentificador 			= null;
				}
				that.localmodel.refresh(true);
				this.hideBusyIndicator();
			} catch (e) {
				MessageBox.error("Ha sucedido un error al seleccionar un projecto");
				this.hideBusyIndicator();
			}
		},
		onChangeOrdenTrabajo: async function(oEvent){
			try {
				var that = this;
				var event = oEvent.getSource();
				this.showBusyIndicator();
				var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
				var oDatosOrdenTrabajo = await serviceSL.consultaGeneralB1SL(baseuri, "/U_ORDENESTRABAJO?$filter=U_Valido eq '1' and Name eq '"+event.getValue()+"'");
				if(oDatosOrdenTrabajo.value.length === 0){
					event.setValue("");
					MessageBox.warning("El nro. de orden no es válido o no se encuentra activo.");
				}
				this.hideBusyIndicator();
			} catch (e) {
				MessageBox.error("Ha sucedido un error al consultar la orden");
				this.hideBusyIndicator();
			}
		},
		onObtenerClaveLabor: async function (selectedObject, selectedCentro) {
			var that = this;
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			let aClaveLavor = await serviceSL.consultaGeneralB1SL(baseuri, ("/Mapeo?$filter=U_CeCo eq '" + selectedCentro + "'"));
			that._oCart.setProperty(selectedObject.getPath() + "/ClaveLabor", aClaveLavor.value);
			that._oCart.refresh(true);
			that.hideBusyIndicator();
		},
		onObtenerCampoObjeto: async function (selectedObjectClvLabor, selectedCentro) {
			var that = this;
			var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
			let oCampoObjeto = await serviceSL.consultaGeneralB1SL(baseuri, ("/Mapeo?$filter=U_CeCo eq '" + selectedCentro + "' and U_Clave eq '" + selectedObjectClvLabor.getObject().ClaveLaborSelected + "'"));
			if (oCampoObjeto.value.length > 0) {
				var oLineCart = that._oCart.getProperty(selectedObjectClvLabor.getPath());
				oLineCart.CampoObjetoValue = oCampoObjeto.value[0].U_ObjetoN;
				oLineCart.SelectedKeyCampoObj = oCampoObjeto.value[0].U_Objeto;
				oLineCart.CampoObjetoSelected = oCampoObjeto.value[0].U_Objeto;
				that._oCart.refresh(true);
				if (!oCampoObjeto.value[0].U_Objeto) {
					MessageBox.warning("No tiene el campo Objeto predefinido debe contactarse con el administrador de SAP B1");
				}
			}
			that.hideBusyIndicator();
		},
		onSelectClaveLabor: function (oEvent) {
			try {
				var that = this;
				var selectedClvLabor = oEvent.getSource().getSelectedKey();
				var selectedObjectClvLabor = oEvent.getSource().getBindingContext("cartProducts");
				selectedObjectClvLabor.getObject().ClaveLaborSelected = selectedClvLabor ? selectedClvLabor : null;
				// if(!selectedClvLabor){
				// 	selectedObjectClvLabor.getObject().ClaveLaborValue = null;
				// }
				selectedObjectClvLabor.getObject().CampoObjetoValue = null;
				selectedObjectClvLabor.getObject().CampoObjetoSelected = null;
				selectedObjectClvLabor.getObject().SelectedKeyCampoObj = null;
				that.onObtenerCampoObjeto(selectedObjectClvLabor, selectedObjectClvLabor.getObject().CentroCostoSelected);
			} catch (e) {
				MessageBox.error("Ha sucedido un error al seleccionar clave labor");
				this.hideBusyIndicator();
			}
		},
		onSelectIdentificador: function (oEvent) {
			try {
				var that = this;
				var selectedCampoIdentificador = oEvent.getSource().getSelectedKey();
				var selectedObjectCampoIdentificador = oEvent.getSource().getBindingContext("cartProducts");
				var Identificadores = that.localmodel.getProperty("/Identificador");
				var getIdentificador = Identificadores.find(e => e.U_Identificador === selectedCampoIdentificador);
				selectedObjectCampoIdentificador.getObject().CampoIdentificadorSelected = selectedCampoIdentificador;
				if (!selectedCampoIdentificador) {
					this.onClearCamposIdentificador(selectedObjectCampoIdentificador.getObject());
					selectedObjectCampoIdentificador.getObject().visIdentificador = false;
				} else {
					selectedObjectCampoIdentificador.getObject().CentroCostoSelected = getIdentificador.U_CentroCosto;
					selectedObjectCampoIdentificador.getObject().CentroCostoValue = getIdentificador.U_CentroCosto;
					selectedObjectCampoIdentificador.getObject().ClaveLaborSelected = getIdentificador.U_ClaveLabor;
					selectedObjectCampoIdentificador.getObject().ClaveLaborValue = getIdentificador.U_ClaveLabor;
					that.onObtenerCampoObjeto(selectedObjectCampoIdentificador, getIdentificador.U_CentroCosto);
					selectedObjectCampoIdentificador.getObject().visIdentificador = true;
				}
				that.localmodel.refresh(true);
				this.hideBusyIndicator();
			} catch (e) {
				MessageBox.error("Ha sucedido un error al seleccionar campo Identificador");
				this.hideBusyIndicator();
			}
		},
		onClearCamposIdentificador: function (oIdentificador) {
			oIdentificador.CentroCostoSelected = null;
			oIdentificador.CentroCostoValue = null;
			oIdentificador.ClaveLaborSelected = null;
			oIdentificador.ClaveLaborValue = null;
			oIdentificador.CampoObjetoValue = null;
			oIdentificador.SelectedKeyCampoObj = null;
			oIdentificador.CampoObjetoSelected = null;
			oIdentificador.IdentificadorValue = null;
		},

		/**
		 * navigates to "home" for further shopping
		 */
		onReturnToShopButtonPress: function () {
			this._setLayout("Two");
			this.getRouter().navTo("home");
		},

		// *** the following functions are private "helper" functions ***

		/**
		 * Called from both <code>setPaymentMethod</code> and <code>setDifferentDeliveryAddress</code> functions.
		 * Shows warning message if user changes previously selected choice
		 * @private
		 * @param {Object} oParams Object containing message text, model path and WizardSteps
		 */
		_setDiscardableProperty: function (oParams) {
			var oWizard = this.byId("shoppingCartWizard");
			if (oWizard.getProgressStep() !== oParams.discardStep) {
				MessageBox.warning(oParams.message, {
					actions: [MessageBox.Action.YES,
					MessageBox.Action.NO
					],
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.YES) {
							oWizard.discardProgress(oParams.discardStep);
							this._oHistory[oParams.historyPath] = this.getModel("catalogo").getProperty(oParams.modelPath);
						} else {
							this.getModel("catalogo").setProperty(oParams.modelPath, this._oHistory[oParams.historyPath]);
						}
					}.bind(this)
				});
			} else {
				this._oHistory[oParams.historyPath] = this.getModel("catalogo").getProperty(oParams.modelPath);
			}
		},

		/**
		 * Called from <code>handleWizardCancel</code> and <code>handleWizardSubmit</code> functions.
		 * Shows warning message, resets shopping cart and wizard if confirmed and navigates to given route
		 * @private
		 * @param {string} sMessage message text
		 * @param {string} sMessageBoxType message box type (e.g. warning)
		 * @param {string} sRoute route to navigate to
		 */
		hideBusyIndicator: function () {
			BusyIndicator.hide();
		},
		showBusyIndicator: function (iDuration, iDelay) {
			BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					clearTimeout(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = setTimeout(function () {
					this.hideBusyIndicator();
				}.bind(this), iDuration);
			}
		},
		show2000: function () {
			this.showBusyIndicator(2000);
		},
		_handleSubmitOrCancel: async function (sMessage, sMessageBoxType, sRoute, oEntries) {
			try {
				var oThat = this;
				MessageBox[sMessageBoxType](sMessage, {
					actions: [MessageBox.Action.YES,
					MessageBox.Action.NO
					],
					onClose: async function (oAction) {
						if (oAction === "YES") {
							try{
								oThat.showBusyIndicator();
								var comboselectedkey = oThat.localmodel.getProperty("/oDatosSolicitante");
								var oUsersWorkflow = oThat.localmodel.getProperty("/oUsuariosWorkflow");
								var oUserData = oThat.localmodel.getProperty("/oEmpleadoData");
								var accountRules = oThat.localmodel.getProperty("/AccountRules");
								var comentario = oThat._oCart.getProperty("/lineaCabeceraDetalle/Comentario");
								fErrorCampos = false;
								!comboselectedkey.CampoSolicitanteKey ? error = true : null;
								var aUsersAlm = [];
								if(oEntries.length === 0){
									MessageBox.warning("No existen datos en la lista de materiales para realizar la reserva.");
									oThat.hideBusyIndicator();
									return;
								}
								oEntries.forEach(function (item) {
									aUsersAlm = aUsersAlm.concat(item.arrayUsuariosAlmacen);
								})
								var aUsersAlmReduced = aUsersAlm.reduce(function (previousValue, currentValue) {
									if (previousValue.indexOf(currentValue) === -1) {
										previousValue.push(currentValue);
									}
									return previousValue;
								}, []);
								if (aUsersAlmReduced.length === 0) {
									MessageBox.warning("No existen usuarios aprobadores de almacén, comunicarse con el administrador.");
									oThat.hideBusyIndicator();
									return;
								}
								var dataDraft = {
									"Comments": comentario ? comentario : "Nueva reserva",
									"DocObjectCode": "oInventoryGenExit",
									"ESTADO_A1": "P",
									"U_SOLICITANTE": oUserData.EmployeeID, // se modifica, se cambia ell external por el employeeid
									"DocumentLines": []
								};
	
								var dataWorkflow = {
									"UsuarioJefeArea": oUsersWorkflow.tUsuariosJefeArea ? oUsersWorkflow.tUsuariosJefeArea : null,
									// "UsuarioAlmacen": oUsersWorkflow.tAlmacen ? oUsersWorkflow.tAlmacen : null,
									"UsuarioAlmacen": aUsersAlmReduced.length > 0 ? aUsersAlmReduced.toString() : "",
									"estadoAprob": false,
									"Comments": comentario ? comentario : "Nueva reserva",
									"DocObjectCode": "oInventoryGenExit",
									"U_SOLICITANTE": oUserData.EmployeeID,
									"DocumentLinesBatchNumbers": []
								};
	
								// oEntries.forEach(async function (product) {
								for (let i = 0; i < oEntries.length; i++) {
									var product = oEntries[i];
									var DocumentLines = {
										"ItemCode": product.ItemCode,
										"U_StockReserva": product.InStock,
										"Quantity": product.Quantity,
										"WarehouseCode": product.WarehouseCode,
										"CostingCode2": product.CentroCostoSelected,
										"CostingCode": product.CampoObjetoSelected,
										"U_ClaveLabor": product.ClaveLaborSelected,
										"U_Solicitante": product.CampoSolicitanteKey, // campo de ExternalEmployeeNumber
										"U_DescSolicitante": product.CampoSolicitanteValue, // Nombre concatenado
										"U_NoOT": product.OrdenTrabajoSelected, // Orden de trabajo -> Name o Code
										"U_Activo": product.ActivoFijoSelected, // Activo fijo (combo) ItemCode
										"U_Horometro": product.Horometro, // Activo fijo (combo) ItemCode
										"ProjectCode": product.ProyectoSelected, // Activo fijo (combo) ItemCode
										"U_Identificador": product.CampoIdentificadorSelected,//identificador (combo) U_Identificador
										"DocumentLinesBinAllocations": []
									}
									await oThat.onValidarCampos(product);
									if (product.ProyectoSelected) {
										DocumentLines.AccountCode = accountRules;
									}
									// if (product.ProyectoSelected) {
									// 	if(!product.CampoSolicitanteKey){
									// 		error = true
									// 	}
									// 	// !product.CampoSolicitanteKey ? error = true : null;
									// 	// DocumentLines.AccountCode = "_SYS00000013197";
									// 	DocumentLines.AccountCode = accountRules;
									// } else {
									// 	!product.CentroCostoSelected ||
									// 	!product.CampoObjetoSelected ||
									// 	!product.ClaveLaborSelected ||
									// 	// !product.CampoObjetoValue || 
									// 	// !product.OrdenTrabajoSelected || 
									// 	!product.CampoSolicitanteKey ? error = true : null;
									// }
	
									dataDraft.DocumentLines.push(DocumentLines);
									DocumentLines.ManageBatchNumbers = product.DatosCabeceraV2.ManageBatchNumbers;
									DocumentLines.InventoryUOM = product.DatosCabeceraV2.InventoryUOM;
									dataWorkflow.DocumentLinesBatchNumbers.push(DocumentLines);
								// })
								}
	
								if (fErrorCampos === true) {
									// MessageBox.error("Debe llenar los campos para poder realizar la reserva");
									MessageBox.error(sMensajeError);
									oThat.hideBusyIndicator();
									return;
								}
								var baseuri = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()))._oManifest._oBaseUri._parts.path;
								var result = await serviceSL.onPostGeneralDataServiceLayer(baseuri, ("/Drafts"), dataDraft);
	
								var comboselectedNombre = oThat.localmodel.getProperty("/oDatosSolicitante");
								//NRO DE RESERVA|| U_AREASOL || FECHA || USUARIO SOLICITANTE || Estado de Reserva (Al solicitante) || Estado de Aprobación ( al aprobador) || motivo
								dataWorkflow.DocEntry = (result.DocEntry.toString()
									+ "|" + oUserData.U_Area
									+ "|" + oThat._oCart.getProperty("/TodayDate")
									+ "|" + comboselectedNombre.CampoSolicitanteValue
									+ "|" + "CREADO"
									+ "|" + dataWorkflow.Comments);
								dataWorkflow.UsuarioRegistro = comboselectedNombre.CampoSolicitanteValue;
								dataWorkflow.FechaRegistro = oThat._oCart.getProperty("/TodayDate");
								await oThat.postWorkflowInstance(dataWorkflow);
								for (let i = 0; i < dataWorkflow.DocumentLinesBatchNumbers.length; i++) {
									var oItem = dataWorkflow.DocumentLinesBatchNumbers[i];
									var oDatoReserva = await serviceSL.consultaGeneralB1SL(baseuri, ("/BTP_RESERVA?$filter=U_ItemCode eq '" + oItem.ItemCode + "' and U_WhsCode eq '" + oItem.WarehouseCode + "'"));
									if (oDatoReserva.value.length == 0) {
										var onGetCantidadCorrelativo = await serviceSL.consultaGeneralB1SL(baseuri, ("/BTP_RESERVA/$count"));
										oItem.Code = parseInt(onGetCantidadCorrelativo) + 1;
										var oDataPost = {
											"Code": oItem.Code,
											"U_ItemCode": oItem.ItemCode,
											"U_WhsCode": oItem.WarehouseCode,
											"U_CantReserva": oItem.Quantity
										};
										await serviceSL.onPostGeneralDataServiceLayer(baseuri, ("/BTP_RESERVA"), oDataPost);
									} else {
										oDatoReserva.value[0].U_CantReserva = oItem.Quantity + oDatoReserva.value[0].U_CantReserva;
										var oCambioDatos = {
											"U_ItemCode": oDatoReserva.value[0].U_ItemCode,
											"U_WhsCode": oDatoReserva.value[0].U_WhsCode,
											"U_CantReserva": oDatoReserva.value[0].U_CantReserva
										};
										await serviceSL.onPatchGeneralDataServiceLayer(baseuri, ("/BTP_RESERVA('" + oDatoReserva.value[0].Code + "')"), oCambioDatos);
									}
								}
							} catch(e){
								if (e.responseJSON) {
									e.responseJSON.error ? MessageBox.error(e.responseJSON.error.message.value) : null;
								}else {
									MessageBox.error("Ha sucedido un error al realizar la reserva");
								}
								this.hideBusyIndicator();
							}
						}
					}.bind(this)
				});

			} catch (e) {
				if (e.responseJSON) {
					e.responseJSON.error ? MessageBox.error(e.responseJSON.error.message.value) : null;
				}else {
					MessageBox.error("Ha sucedido un error al realizar la reserva");
				}
				this.hideBusyIndicator();
			}
		},
		onValidarCampos: function(product){
			if (product.ProyectoSelected) {
				if(!product.CampoSolicitanteKey){
					fErrorCampos = true
					sMensajeError = "Falta agregar el campo Soliciante, verificar los datos ingresados en los items";
				}
				// !product.CampoSolicitanteKey ? error = true : null;
				// DocumentLines.AccountCode = "_SYS00000013197";
				// DocumentLines.AccountCode = accountRules;
			} else {
				// !product.CentroCostoSelected ||
				// !product.CampoObjetoSelected ||
				// !product.ClaveLaborSelected ||
				// // !product.CampoObjetoValue || 
				// // !product.OrdenTrabajoSelected || 
				// !product.CampoSolicitanteKey ? error = true : null;
				if(!product.CentroCostoSelected){
					fErrorCampos = true
					sMensajeError = "Falta agregar el campo Centro de Costo, verificar los datos ingresados en los items";
				}else if(!product.CampoObjetoSelected){
					fErrorCampos = true
					sMensajeError = "Falta agregar el campo Objeto, verificar los datos ingresados en los items";
				}else if(!product.ClaveLaborSelected){
					fErrorCampos = true
					sMensajeError = "Falta agregar el campo Clave labor, verificar los datos ingresados en los items";
				}else if(!product.CampoSolicitanteKey){
					fErrorCampos = true
					sMensajeError = "Falta agregar el campo Soliciante, verificar los datos ingresados en los items";
				}
			}
			return 
		},
		postWorkflowInstance: async function (dataDraft) {
			try {
				var that = this;
				var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
				var appPath = appId.replaceAll(".", "/");
				var appModulePath = jQuery.sap.getModulePath(appPath);
				var dataPost = {
					"definitionId": "workflowmodulev1.myworkflowapproval",
					"context": dataDraft
				};
				await serviceSL.onPOSTWorkflowInstances(appModulePath, ("/workflow-instances"), dataPost);
				MessageBox.success("La reserva se registro correctamente con el numero: " + dataDraft.DocEntry.split("|")[0], {
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function (sAction) {
						that._oCart.setProperty("/cartEntries", []);
						that._oCart.setProperty("/lineaCabeceraDetalle/Comentario", null);
						that.onReturnToShopButtonPress();
					}
				});
				that.hideBusyIndicator();

				// return new Promise(function (resolve, reject) {
				// 	$.ajax({
				// 		url: appModulePath + "/wfrest/v1/workflow-instances",
				// 		type: "POST",
				// 		data: JSON.stringify(dataPost),
				// 		contentType: "application/json",
				// 		async: false,
				// 		success: function (data) {
				// 			MessageBox.success("La reserva se registro correctamente con el numero: " + dataDraft.DocEntry.split("|")[0], {
				// 				actions: [MessageBox.Action.OK],
				// 				emphasizedAction: MessageBox.Action.OK,
				// 				onClose: function (sAction) {
				// 					that._oCart.setProperty("/cartEntries", []);
				// 					that._oCart.setProperty("/lineaCabeceraDetalle/Comentario", null);
				// 					that.onReturnToShopButtonPress();
				// 				}
				// 			});
				// 			that.hideBusyIndicator();
				// 			resolve(data);
				// 		},
				// 		error: function (data) {
				// 			resolve(data);
				// 		}
				// 	});
				// });
			} catch (e) {
				MessageBox.error("Ha sucedido un error al realizar la reserva");
				this.hideBusyIndicator();
			}
		},

		/**
		 * gets customData from ButtonEvent
		 * and navigates to WizardStep
		 * @private
		 * @param {sap.ui.base.Event} oEvent the press event of the button
		 */
		_navBackToStep: function (oEvent) {
			var sStep = oEvent.getSource().data("navBackTo");
			var oStep = this.byId(sStep);
			this._navToWizardStep(oStep);
		},

		/**
		 * navigates to WizardStep
		 * @private
		 * @param {Object} oStep WizardStep DOM element
		 */
		_navToWizardStep: function (oStep) {
			var oNavContainer = this.byId("wizardNavContainer");
			var _fnAfterNavigate = function () {
				this.byId("shoppingCartWizard").goToStep(oStep);
				// detaches itself after navigaton
				oNavContainer.detachAfterNavigate(_fnAfterNavigate);
			}.bind(this);

			oNavContainer.attachAfterNavigate(_fnAfterNavigate);
			oNavContainer.to(this.byId("wizardContentPage"));
		},
		onEntryListPress: function (oEvent) {

			this._currentObj = oEvent.getSource().getBindingContext("cartProducts").getObject();
			this._currentPath = oEvent.getSource().getBindingContextPath();
			this.getModel("cartEntry").setProperty("/entry", Object.assign({}, this._currentObj));
			this.getModel("cartEntry").refresh(true)
			var that = this
			if (!this._oDialogDetalle) {
				Fragment.load({
					id: this.getView().getId(),
					name: "zsandiego.crearreserva.view.DetalleArticulos",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					that.getView().addDependent(oDialog);
					var txtCuenta = that.getView().byId("idfragcuenta");
					txtCuenta.attachBeforeFilter(function (oEvt) {
						this.aFilters = [];
						var centro = that.getView().byId("idfragSociedad").getValue();
						var bukrsFilter = new Filter("bukrs", FilterOperator.EQ, centro)

						var sValue = oEvt ? oEvt.getParameter("value") : "";
						if (!sValue || sValue === "") {
							this.aFilters.push(bukrsFilter);
						} else {
							var _aFilters = [];
							_aFilters.push(new Filter(this.getHelpKeyField(), FilterOperator.Contains, sValue));
							if (this.getHelpDescriptionField() !== "") {
								_aFilters.push(new Filter(this.getHelpDescriptionField(), FilterOperator.Contains, sValue));
							}

							var defaultFilter = new Filter({
								filters: _aFilters,
								and: false
							});

							this.aFilters = new Filter({
								filters: [defaultFilter, bukrsFilter],
								and: true
							});
						}
					});

					oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
					oDialog.open();
					that._oDialogDetalle = oDialog;
					that._oDialogDetalle.bindElement({
						path: "cartEntry>/entry"
					});
				}.bind(this));
			} else {
				this._oDialogDetalle.open();
				this._oDialogDetalle.bindElement({
					path: "cartEntry>/entry"
				});
				this.getView().byId("idfragcentro").setValueState("None");
				this.getView().byId("idfragcentro2").setValueState("None");
				this.getView().byId("idfragcuenta").setValueState("None");
				this.getView().byId("idNumOrden").setValueState("None");
				this.getView().byId("idNumProyecto").setValueState("None");
			}

		},
		getInfoTablePresupuesto: function (oResultPresupuesto, oData, aEntries) {
			let oDetallePresupuesto = oData.detalle ? oData.detalle : [];
			let aPresupuestos = oResultPresupuesto;
			let oReturn = {};
			let bDisponibleGen = true;

			oReturn.aPresupuestos = [];

			aEntries.forEach(function (e) {
				var fechaActual = new Date();
				var fechaEntrega = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() + parseInt(e.Dias_Entrega, 10));
				e.Mes = fechaEntrega.getMonth() + 1;
				e.Año = fechaEntrega.getFullYear();
			});

			if (aPresupuestos.length !== 0) {
				for (let i = 0; i < aPresupuestos.length; i++) {
					let element = aPresupuestos[i];
					let aDetalleFilter = element.Kostl ? aEntries.filter(e => e.Kostl === element.Kostl && e.Saknr === element.Kstar && e.Mes === parseInt(element.Poper, 10)) : aEntries.filter(e => e.OrderNo === element.Aufk && e.Año === parseInt(element.Gjahr, 10));

					let iTotalDetalle = (parseFloat(oData.Precio_Unit) * parseFloat(oData.Kursf)) * oData.Quantity;
					aDetalleFilter.forEach(function (obj) {
						if (obj.Item !== element.Item) {
							iTotalDetalle += (parseFloat(obj.Precio_Unit) * parseFloat(obj.Kursf)) * obj.Quantity;
						}
					});


					let iTotalPresupuesto = element.PresActual || 0;
					let bDisponible = (iTotalDetalle <= iTotalPresupuesto);

					if (!bDisponible) bDisponibleGen = false;

					oReturn.aPresupuestos.push({
						"Imputacion": element.Kostl ? element.Kostl : element.Aufnr,
						"TipoImp": element.Kostl ? "Centro de coste " : "Orden ",
						"Presupuesto": iTotalPresupuesto,
						"Kstar": element.Kstar,
						"Waers": element.Waers,
						"ValorTotal": iTotalDetalle,
						"bDisponible": bDisponible,
						"oPresupuestoServ": element,
						"oDetalle": aDetalleFilter,
						"Comprometido": element.PresComp,
						"Mes": formatter.formatMes(parseInt(element.Poper, 10)),
						"Annio": element.Gjahr
					});
				}
			} else {
				bDisponibleGen = false;
			}


			oReturn.bDisponibleGen = bDisponibleGen;
			oReturn.sMessage = bDisponibleGen ? "Presupuesto actual disponible" : "No cuenta con presupuesto disponible";

			return oReturn;
		},

		pressDetalleAsignar: function () {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var _asigna = this.byId("idClasepedidoDetalle").getValue();
			var _centro = this.byId("idfragcentro").getValue();

			if (_asigna.length === 0) {
				MessageBox.warning(
					"Ingresa una clase de pedido en la interfaz principal", {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
				);
			} else {
				var oObj = this._oDialogDetalle.getBindingContext("cartEntry").getObject();
				var aCartEntries = this._oCart.getProperty("/cartEntries");
				var aEntries = [];
				for (var item in aCartEntries) {
					if (oObj.Item !== item) {
						aEntries.push(aCartEntries[item]);
					}
				}

				var bCalcularPresupuesto = false;
				if (oObj.Knttp === "F" && oObj.Aufk !== "") {
					var sAufnrPath = "/" + this.matchcode.createKey("ZCDSMM_AUFK_TXT", {
						aufnr: oObj.Aufk
					});

					var oAufnr = this.matchcode.getProperty(sAufnrPath)

					if (oAufnr.autyp === "01") {
						bCalcularPresupuesto = true;
					}
				} else {
					bCalcularPresupuesto = true;
				}

				if ((oObj.Knttp === "K" && oObj.Kostl !== "") || (oObj.Knttp === "F" && oObj.Aufk !== "" && bCalcularPresupuesto)) {



					var sWerks = oObj.Werks;
					var sBukrs = ""
					if (sWerks !== "") {
						var aWerks = this.localmodel.getProperty("/ZCDSMM_WERKS_TXT")
						var oWerks = aWerks.find(e => e.werks === sWerks);
						if (oWerks) {
							sBukrs = oWerks.bukrs;
						}
					}
					var sKostl = oObj.Kostl ? oObj.Kostl : "";
					var sAufnr = oObj.Aufk ? oObj.Aufk : "";

					if (sBukrs !== "") {
						var fechaActual = new Date();
						var fechaEntrega = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() + parseInt(oObj.Dias_Entrega, 10));
						var oCreatePresupuesto =
						{
							Bukrs: sBukrs,
							detallepre: [{
								"Kostl": sKostl,
								"Kstar": (oObj.Knttp === "K") ? oObj.Saknr : "",
								"Aufnr": sAufnr,
								"Lfdat": fechaEntrega,
								"mesEntrega": fechaEntrega.getMonth() + 1,
								"añoEntrega": fechaEntrega.getFullYear()
							}]
						}

						if (oCreatePresupuesto.detallepre[0].Aufnr !== "") {
							oCreatePresupuesto.detallepre = collect(oCreatePresupuesto.detallepre).unique(m => m.Kostl + m.Aufnr + m.Kstar + m.añoEntrega).all();
							oCreatePresupuesto.detallepre.forEach(function (e, index) {
								delete oCreatePresupuesto.detallepre[index]["mesEntrega"];
								delete oCreatePresupuesto.detallepre[index]["añoEntrega"];
							});
						} else {
							oCreatePresupuesto.detallepre = collect(oCreatePresupuesto.detallepre).unique(m => m.Kostl + m.Aufnr + m.Kstar + m.mesEntrega).all();
							oCreatePresupuesto.detallepre.forEach(function (e, index) {
								delete oCreatePresupuesto.detallepre[index]["mesEntrega"];
								delete oCreatePresupuesto.detallepre[index]["añoEntrega"];
							});
						}

						var that = this;
						BusyIndicator.show();
						this.presupuesto.create("/presupuestoSet", oCreatePresupuesto, {

							success: function (oData, oResponse) {
								BusyIndicator.hide();
								var oPresupuesto = that.getInfoTablePresupuesto(oData.detallepre.results, oObj, aEntries);
								that.localmodel.setProperty("/oPresupuesto", oPresupuesto);
								if (!that.oDialogPresupuesto) {
									Fragment.load({
										name: "zsandiego.crearreserva.view.fragment.Presupuesto",
										controller: that
									}).then(function (oDialog) {
										that.oDialogPresupuesto = oDialog;
										that.getView().addDependent(that.oDialogPresupuesto);
										that.oDialogPresupuesto.open();
									});
								} else {
									that.oDialogPresupuesto.open();
								}
							},
							error: function (oError) {
								that.hideBusyIndicator()
								console.log(oError)
							}
						});

					}
				} else {
					this.onSubmitAsignar();
				}

			}

		},
		onSubmitAsignar: function () {
			var entry = this.getModel("cartEntry").getProperty("/entry");
			this.getModel("cartProducts").setProperty(this._currentPath, entry);
			this.getModel("cartProducts").refresh(true)
			this._oDialogDetalle.close();
			this.oDialogPresupuesto.close();
			var msg1 = 'Asignado correctamente';
			MessageToast.show(msg1);
		},
		onCancelAsignar: function () {
			this.oDialogPresupuesto.close();
		},
		//Fragment boton Cancelar
		pressDetalleCancelar: function () {
			var that = this;
			sap.m.MessageBox.show("¿Desea cancelar el proceso?", {
				icon: sap.m.MessageBox.Icon.WARNING,
				title: "Confirmar",
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.YES) {

						that._oDialogDetalle.close();
					} else if (oAction === sap.m.MessageBox.Action.NO) {
						return;
					}
				}
			});
		},
		pressDetalleSalir: function () {
			this.byId("DetalleArticuloDialog").close();
		},
		openFragAsignacion: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			var that = this;
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!that._valueHelpDialog) {
				that._valueHelpDialog = sap.ui.xmlfragment(
					"zsandiego.crearreserva.view.fragment.asignacion",
					that
				);
				that.getView().addDependent(that._valueHelpDialog);
			}

			// open value help dialog filtered by the input value
			that._valueHelpDialog.open(sInputValue);

		},
		_handleValueHelpSearchAsignacion: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"batxt",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpCloseAsignacion: function (evt) {

			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.byId("idfragasignacion_");
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);

			this.byId(this.inputId)._bSelectingItem = true;
			this.byId(this.inputId).fireChange();
		},
		openFragNumOrden: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this._oDialogNumOrden) {
				Fragment.load({
					name: "zsandiego.crearreserva.view.fragment.NumOrden",
					controller: this
				}).then(function (oDialog_NumOrden) {
					this._oDialogNumOrden = oDialog_NumOrden;
					this.getView().addDependent(this._oDialogNumOrden);
					this._oDialogNumOrden.open();
				}.bind(this));
			} else {
				this._oDialogNumOrden.open();
			}
		},
		_handleValueHelpSearchNumOrden: function (evt) {
			var sValue = evt.getParameter("value");
			var aFilter = [];
			if (sValue) {
				aFilter.push(new Filter("aufnr", FilterOperator.Contains, sValue));
			}

			evt.getSource().getBinding("items").filter(new Filter({ filters: aFilter, and: false }));
		},
		_handleValueHelpCloseNumOrden: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.byId("idNumOrden");
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
			this.byId(this.inputId)._bSelectingItem = true;
			this.byId(this.inputId).fireChange();
		},
		_handleValueHelpSearchCuenta: function (evt) {
			var sValue = evt.getParameter("value");
			var aFilter = [];
			if (sValue) {
				aFilter.push(new Filter("saknr", FilterOperator.Contains, sValue));
				aFilter.push(new Filter("txt20", FilterOperator.Contains, sValue));
			}

			var oFilter = new Filter(
				"bukrs",
				FilterOperator.EQ, this.sBukrs
			);

			evt.getSource().getBinding("items").filter([new Filter({ filters: aFilter, and: false }), oFilter]);
		},
		_handleValueHelpSearchCentro: function (evt) {
			var sValue = evt.getParameter("value");
			var aFilter = [];
			if (sValue) {
				aFilter.push(new Filter("kostl", FilterOperator.Contains, sValue));
				aFilter.push(new Filter("ltext", FilterOperator.Contains, sValue));
			}

			evt.getSource().getBinding("items").filter(new Filter({ filters: aFilter, and: false }));
		},
		_handleValueHelpSearchWerks: function (evt) {
			var sValue = evt.getParameter("value");

			var aFilter = [];
			if (sValue) {
				aFilter.push(new Filter("werks", FilterOperator.Contains, sValue));
				aFilter.push(new Filter("name1", FilterOperator.Contains, sValue));
			}

			evt.getSource().getBinding("items").filter(new Filter({ filters: aFilter, and: false }));
		},
		_handleValueHelpCloseCuenta: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput1 = this.byId("idfragcuenta");
				productInput1.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
			this.byId(this.inputId)._bSelectingItem = true;
			this.byId(this.inputId).fireChange();
		},
		_handleValueHelpCloseWerks: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput1 = this.byId("idfragwerks");
				productInput1.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
			this.byId(this.inputId)._bSelectingItem = true;
			this.byId(this.inputId).fireChange();
		},
		_handleValueHelpCloseCentro: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput1 = this.byId("idfragcentro");
				productInput1.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
			this.byId(this.inputId)._bSelectingItem = true;
			this.byId(this.inputId).fireChange();
		},
		openFragCentro: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this._oDialogCentro) {
				Fragment.load({
					name: "zsandiego.crearreserva.view.fragment.centrocosto",
					controller: this
				}).then(function (oDialog) {
					this._oDialogCentro = oDialog;
					this.getView().addDependent(this._oDialogCentro);
					this._oDialogCentro.open();
				}.bind(this));
			} else {
				this._oDialogCentro.open();
			}
		},
		openFragWerks: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this._oDialogWerks) {
				Fragment.load({
					name: "zsandiego.crearreserva.view.fragment.centro",
					controller: this
				}).then(function (oDialog) {
					this._oDialogWerks = oDialog;
					this.getView().addDependent(this._oDialogWerks);
					this._oDialogWerks.open();
				}.bind(this));
			} else {
				this._oDialogWerks.open();
			}
		},
		openFragCuenta: function (oEvent) {

			var sWerks = this.byId("idfragcentro").getValue();
			var sBukrs = ""
			if (sWerks !== "") {
				var aWerks = this.localmodel.getProperty("/ZCDSMM_WERKS_TXT")
				var oWerks = aWerks.find(e => e.werks === sWerks);
				if (oWerks) {
					this.sBukrs = oWerks.bukrs;
				}
			}

			this.inputId = oEvent.getSource().getId();
			if (!this._oDialogCuenta) {
				Fragment.load({
					name: "zsandiego.crearreserva.view.fragment.Cuenta",
					controller: this
				}).then(function (_valueCuenta) {
					this._oDialogCuenta = _valueCuenta;
					this.getView().addDependent(this._oDialogCuenta);
					this._oDialogCuenta.open();

					var oFilter = new Filter(
						"bukrs",
						FilterOperator.EQ, this.sBukrs
					);
					this._oDialogCuenta.getBinding("items").filter([oFilter]);

				}.bind(this));
			} else {
				this._oDialogCuenta.open();
				var oFilter = new Filter(
					"bukrs",
					FilterOperator.Contains, sBukrs
				);
				this._oDialogCuenta.getBinding("items").filter([oFilter]);
			}
		},
		changecuenta: function (oEvent) {
			var num = oEvent.getSource().mAssociations.selectedItem.substring(57);
			var path = oEvent.getSource().mBindingInfos.suggestionItems.path;
			var pathcorrecto = path + "/" + num;
			var lineacentro = this.localmodel.getProperty(pathcorrecto);
			this.localmodel.setProperty("/lineacentrocosto", lineacentro);
			this.byId("idfragcentro").setValue();
			this.byId("idfragcentro").setEnabled(true);
		},
		pressActualizar: function () {

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var clasePedido = this.byId("idClasepedidoDetalle").getValue();
			var _centro = this.byId("idfragcentro").getValue();

			if (clasePedido.length === 0) {
				MessageBox.warning(
					"Ingresa una clase de pedido en datos de cabecera", {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
				);
			} else if (_centro.length === 0) {
				MessageBox.warning(
					"Ingrese un Centro de costo", {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
				);
			} else {
				var oDatos = {
					OrdenDetalle: this.byId("idNumOrden").getValue(),
					AsignacionDetalle: this.byId("idClasepedidoDetalle").getValue(),
					CentroDetalle: this.byId("idfragcentro").getValue(),
					CtaDetalle: this.byId("idfragcuenta").getValue(),
					ComenDetalle: this.byId("idfragcomentario").getValue(),

				};
				//this._oCart.setProperty(this._path + "/cuenta", clasePedido);
				this._oCart.setProperty(this._path + "/cuenta", _centro);
				this._oCart.setProperty(this._path + "/Detalle", oDatos);
				var msg = 'Actualizado correctamente';
				MessageToast.show(msg);
				this._oCart.setProperty(this._path + "/highlight", "Success");
				this.byId("DetalleArticuloDialog").close();
			}
		},
		onEliminarProducto: function (oEvent) {
			// var oCurrentObj = oEvent.getParameter("listItem").getBindingContext("cartProducts").getObject();
			var oCurrentObj = oEvent.getParameter("listItem").getBindingContext("cartProducts").getPath().split("/")[2];
			var that = this;

			MessageBox.show(this.getResourceBundle().getText("cartDeleteDialogMsg"), {
				title: this.getResourceBundle().getText("cartDeleteDialogTitle"),
				actions: [
					MessageBox.Action.DELETE,
					MessageBox.Action.CANCEL
				],
				onClose: function (oAction) {

					if (oAction !== MessageBox.Action.DELETE) {
						return;
					}
					var aCartEntries = that._oCart.getProperty("/cartEntries");
					// delete aCartEntries[parseInt(oCurrentObj)];
					aCartEntries.splice(oCurrentObj, 1)
					that._oCart.refresh(true);

					MessageToast.show("Eliminado correctamente");
				}
			});
		},

		onAgregarProducto: function (oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			//this._path = oEvent.getSource().getBindingContextPath();
			//this._oCart = this.getOwnerComponent().getModel("cartProducts");
			//var cantidad = this.byId("idCantidad").getValue();
			var cantidad = sap.ui.getCore().byId("idCantidad").getValue();
			var num = parseFloat(cantidad);
			if (cantidad.length === 0) {
				MessageBox.warning(
					"Ingresa una cantidad al material", {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
				);
				return;
			} else if (cantidad == 0) {
				MessageBox.warning(
					"Ingresa una cantidad diferente a 0", {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
				);
				return;
			} else {
				var oResourceBundle = this.getModel("i18n").getResourceBundle();
				var datosProducto = this._oCart.getProperty(this._path);
				//var oProduct = oEvent.getSource().getBindingContext("view").getObject();
				var oCartModel = this.getModel("cartProducts");
				this.addToCart1(oResourceBundle, datosProducto, oCartModel);
			}

			//this.cantidad_productos = Object.keys(oCartModel.getProperty("/cartEntries")).length;
			//this.getView().getModel("localmodel").setProperty("/listaProductosCantidad/value", this.cantidad_productos);
		},
		addToCart1: function (oBundle, datosProducto, oCartModel) {
			// Items to be added from the welcome view have it's content inside product object
			if (datosProducto.Product !== undefined) {
				datosProducto = datosProducto.Product;
			}
			switch (datosProducto.Status) {
				case "D":
					//show message dialog
					MessageBox.show(
						oBundle.getText("productStatusDiscontinuedMsg"), {
						icon: MessageBox.Icon.ERROR,
						titles: oBundle.getText("productStatusDiscontinuedTitle"),
						actions: [MessageBox.Action.CLOSE]
					});
					break;
				case "O":
					// show message dialog
					MessageBox.show(
						oBundle.getText("productStatusOutOfStockMsg"), {
						icon: MessageBox.Icon.QUESTION,
						title: oBundle.getText("productStatusOutOfStockTitle"),
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						onClose: function (oAction) {
							// order
							if (MessageBox.Action.OK === oAction) {
								this._updateCartItem1(oBundle, datosProducto, oCartModel);
							}
						}.bind(this)
					});
					break;
				case "A":
				default:
					this._updateCartItem1(oBundle, datosProducto, oCartModel);
					break;
			}
		},

		_updateCartItem1: function (oBundle, oProductToBeAdded, oCartModel) {
			var cantidad = sap.ui.getCore().byId("idCantidad").getValue();
			var num = parseFloat(cantidad);
			var sum = 0;
			// find existing entry for product
			var oCollectionEntries = Object.assign({}, oCartModel.getData()["cartEntries"]);

			var oCartEntry = oCollectionEntries[oProductToBeAdded.ProductId];

			if (oCartEntry === undefined) {
				// create new entry
				oCartEntry = Object.assign({}, oProductToBeAdded);
				oCartEntry.Quantity = num;
				oCollectionEntries[oProductToBeAdded.ProductId] = oCartEntry;
			} else {
				// update existing entry
				oCartEntry.Quantity = num;
			}
			//update the cart model
			Object.values(oCollectionEntries).forEach(function (linea, index) {
				var producto = parseFloat(linea.Price * linea.Quantity);
				//var obtenerPrice = parseFloat(linea.Price);
				sum = sum + producto;
			});
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var ccLimite = this.localmodel.getProperty("/centroCostoPrice/value");
			if (ccLimite < sum) {
				MessageBox.warning(
					"Centro de costo contiene un límite de 10,000", {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
				);
				this.closeIngresarCantidad();
				return;
			}
			// oCartModel.setProperty("/cartEntries", Object.assign({}, oCollectionEntries));
			oCartModel.refresh(true);
			this.closeIngresarCantidad();
			/*var datos = this.getOwnerComponent();
			var localmodel = datos.getModel("localmodel");*/
			var cantidadlista = (this._oCart.getProperty("/cartEntries")).length;
			this.localmodel.setProperty("/listaProductosCantidad/value", cantidadlista);

			MessageToast.show("Se actualizo la cantidad del material");
			//MessageToast.show(oBundle.getText("productMsgAddedToCart", [oProductToBeAdded.Name]));

		},
		openIngresaarCantidad: function (oEvent) {
			//this.CentroCosto();

			this._path = oEvent.getSource().getBindingContextPath();
			this._oCart = this.getOwnerComponent().getModel("cartProducts");
			var lineanombre = this._oCart.getProperty(this._path + "/Name");
			this.localmodel.setProperty("/lineafragmento/NombreProducto", lineanombre);
			this.openIngresar.open();
		},
		CentroCosto: function () {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var ccLimite = this.localmodel.getProperty("/centroCostoPrice/value");
			var ccTotal = this.localmodel.getProperty("/centroCostoPrice/acumulado");
			if (ccLimite < ccTotal) {
				MessageBox.warning(
					"Centro de costo contiene un límite de 10,000", {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
				);
			}
		},
		closeIngresarCantidad: function (oEvent) {
			this.openIngresar.close();
			sap.ui.getCore().byId("idCantidad").setValue();
		},
		openFragGrupoCompra: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this.oDialogGrupoCompra) {
				this.oDialogGrupoCompra = sap.ui.xmlfragment(
					"zsandiego.crearreserva.view.fragment.GrupoCompras",
					this
				);
				this.getView().addDependent(this.oDialogGrupoCompra);
			}

			this.oDialogGrupoCompra.open();

		},
		_handleValueHelpSearchGrupo: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"ekgrp",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpCloseGrupo: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput1 = this.byId("idfragGrupoCompra");
				productInput1.setValue(oSelectedItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.byId(this.inputId)._bSelectingItem = true;
			this.byId(this.inputId).fireChange();
		},
		openFragOrgCompra: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueCuentax) {
				this._valueCuentax = sap.ui.xmlfragment(
					"zsandiego.crearreserva.view.fragment.OrgCompras",
					this
				);
				this.getView().addDependent(this._valueCuentax);
			}

			this._valueCuentax.open(sInputValue);

		},
		_handleValueHelpSearchOrg: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"ekorg",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpCloseOrg: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput1 = this.byId("idfragOrgCompra");
				productInput1.setValue(oSelectedItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.byId(this.inputId)._bSelectingItem = true;
			this.byId(this.inputId).fireChange();
		},
		openFragSociedad: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueSociedad) {
				this._valueSociedad = sap.ui.xmlfragment(
					"zsandiego.crearreserva.view.fragment.Sociedad",
					this
				);
				this.getView().addDependent(this._valueSociedad);
			}

			this._valueSociedad.open();
		},
		_handleValueHelpSearchSociedad: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"bukrs",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpCloseSociedad: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput1 = this.byId("idfragSociedad");
				productInput1.setValue(oSelectedItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.byId(this.inputId)._bSelectingItem = true;
			this.byId(this.inputId).fireChange();
		},
		openFragNumProyecto: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this._oDialogNumProyecto) {
				Fragment.load({
					name: "zsandiego.crearreserva.view.fragment.NumProyecto",
					controller: this
				}).then(function (oDialog_NumProyecto) {
					this._oDialogNumProyecto = oDialog_NumProyecto;
					this.getView().addDependent(this._oDialogNumProyecto);
					this._oDialogNumProyecto.open();
				}.bind(this));
			} else {
				this._oDialogNumProyecto.open();
			}
		},
		_handleValueHelpSearchNumProyecto: function (evt) {
			var sValue = evt.getParameter("value");
			var aFilter = [];
			if (sValue) {
				aFilter.push(new Filter("mcoa1", FilterOperator.Contains, sValue));
				aFilter.push(new Filter("anln1", FilterOperator.Contains, sValue));
			}

			evt.getSource().getBinding("items").filter(new Filter({ filters: aFilter, and: false }));

		},
		_handleValueHelpCloseNumProyecto: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.byId("idNumProyecto");
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
			this.byId(this.inputId)._bSelectingItem = true;
			this.byId(this.inputId).fireChange();
		},
		handleSuggestAufk: function (oEvent) {
			var aFilters = [];
			var sTerm = oEvent.getParameter("suggestValue");
			if (sTerm) {
				aFilters.push(new Filter("aufnr", FilterOperator.Contains, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			oEvent.getSource().setFilterSuggests(false);
		},
		onEliminarTodo: function (oEvent) {
			MessageBox.warning("¿Desea eliminar todos los materiales / servicios?", {
				actions: [MessageBox.Action.YES,
				MessageBox.Action.NO
				],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						this._oCart.setProperty("/cartEntries", [])
						this._setLayout("Two");
						this.getRouter().navTo("home");
					}
				}.bind(this)
			});
		}
	});
});
