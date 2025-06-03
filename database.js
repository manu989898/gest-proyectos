Ext.define('ISF.ECO_Mobile.util.ConnectionManager',
    {
        requires: [],

        singleton: true,
        alternateClassName: 'ConnectionManager',

        constructor: function (config) {
            this.initConfig(config);
        },

        callGet: function (url, request, successFunction, failureFunction, callbackFunction, view, scope, disableCacheControl = false) {
            var user = Ext.decode(Ext.util.LocalStorage.get('login').getItem('user'));

            if (view) {
                view.setMasked({
                    xtype: 'loadmask',
                    message: 'Cargando...'
                });
            }

            Ext.Ajax.request({
                url: url,
                method: 'GET',

                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'cnx': user.connectionId
                },
                params: request,

                disableCaching: disableCacheControl,
                cors: false,
                useDefaultXhrHeader: false,
                defaultCnxHeader: false,

                success: successFunction ? successFunction : function () { },

                failure: failureFunction ? failureFunction : function (responseContent) {
                    Ext.Msg.show({
                        title: Locale.global.message.error.title,
                        message: Locale.global.message.error.infoError + responseContent.responseText,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                },

                callback: callbackFunction ? callbackFunction : function () {
                    if (view) {
                        view.setMasked(false);
                    }
                },

                scope: scope
            });
        },

        callGetAzure: function (url, request, successFunction, failureFunction, callbackFunction, view, scope, cache = null) {
            var user = Ext.decode(Ext.util.LocalStorage.get('login').getItem('user'));
            var errorCode = Ext.manifest.azure.errorCode,
                errorText = Ext.manifest.azure.errorText,
                maxAttempts = Ext.manifest.azure.maxAttempts,
                current = 0;

            if (view) {
                view.setMasked({
                    xtype: 'loadmask',
                    message: 'Cargando...'
                });
            }

            var _request = {
                url: url,
                method: 'GET',

                headers: {
                    'Cache-Control': cache == false ? 'no-cache' : '',
                    'Content-Type': 'application/json',
                    'cnx': user.connectionId
                },
                params: request,

                disableCaching: !(cache == null || cache == true),
                cors: false,
                useDefaultXhrHeader: false,
                defaultCnxHeader: false,

                success: function (response) {
                    if (successFunction) {
                        successFunction.bind(scope)(response);
                    }

                    if (callbackFunction) {
                        callbackFunction.bind(scope)();
                    } else if (view) {
                        view.setMasked(false);
                    }
                },

                failure: function (content) {
                    if (content.status == errorCode && current < maxAttempts && content.responseText.includes(errorText)) {
                        current++;
                        Ext.Ajax.request(_request);
                        return null;
                    }

                    if (failureFunction) {
                        failureFunction.bind(scope)(content);
                    } else {
                        Ext.Msg.show({
                            title: Locale.global.message.error.title,
                            message: Locale.global.message.error.infoError + responseContent.responseText,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.ERROR
                        });
                    }

                    if (callbackFunction) {
                        callbackFunction.bind(scope)();
                    } else if (view) {
                        view.setMasked(false);
                    }
                }
            };

            Ext.Ajax.request(_request);
        },

        callPost: function (url, request, body, successFunction, failureFunction, callbackFunction, view, scope) {
            var user = Ext.decode(Ext.util.LocalStorage.get('login').getItem('user'));
            if (view) {
                view.setMasked({
                    xtype: 'loadmask',
                    message: 'Cargando...'
                });
            }

            Ext.Ajax.request({
                url: url,
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'cnx': user.connectionId
                },
                params: request,

                timeout: 180000,

                jsonData: Ext.encode(body),

                cors: true,
                useDefaultXhrHeader: false,
                defaultCnxHeader: false,

                success: successFunction ? successFunction : function () { },

                failure: failureFunction
                    ? failureFunction
                    : function (responseContent) {
                        Ext.Msg.show({
                            title: Locale.global.message.error.title,
                            message: Locale.global.message.error.infoError + responseContent.responseText,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.ERROR
                        });
                    },

                callback: callbackFunction
                    ? callbackFunction
                    : function () {
                        if (view) {
                            view.setMasked(false);
                        }
                    },

                scope: scope
            });
        }
    });