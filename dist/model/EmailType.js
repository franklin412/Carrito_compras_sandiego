sap.ui.define(["sap/ui/model/type/String","sap/ui/model/ValidateException","sap/ui/model/resource/ResourceModel"],function(e,a,i){"use strict";var o=new i({bundleName:"zsandiego.carritocompras.i18n.i18n"});return e.extend("zsandiego.carritocompras.model.EmailType",{validateValue:function(e){var i=/^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2}$/;if(!e.match(i)){throw new a(o.getResourceBundle().getText("checkoutCodEmailValueTypeMismatch",[e]))}}})});