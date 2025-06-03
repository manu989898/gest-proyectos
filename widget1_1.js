createPanelDescargos: function () {

        var me = this;
        me.createWidget('widgetDescargos', {
            title: "DESCARGOS",
            listeners: {
                'refresh': function () {
                    var connW = new isf.lib.Connection("GetWidgetDescargos");
                    connW.addParam('p_centcodi', me.app.centcodi);

                    var desde = me.down('#dtDesdeDescargos').getValue();
                    var hasta = me.down('#dtHastaDescargos').getValue();
                    if (desde) connW.addParam('p_fecdesde', Ext.Date.format(desde, 'Y-m-d'));
                    if (hasta) connW.addParam('p_fechasta', Ext.Date.format(hasta, 'Y-m-d'));

                    me.getData(connW);
                }
            },
            xtype: 'isfpanel',
            width: 430,
            height: 410,
            bodyPadding: '5 5 0 5',
            addRefreshButton: true,
            items: [
                { itemId: 'grdWidgetDescargos', xtype: 'isfgrid', height: 130, store: this.stoDescargosProcesar, summaryHeader: false,
                    showColumnFilters: false,
                    columns: [
                        { text: "", dataIndex: 'DESCR', width: 155, tooltip: myDesktopApp.appLocale.isf_eco_Widgets.lblcolAbrevMenosAyerFull + " " + myDesktopApp.appLocale.isf_eco_Widgets.lblcolPend, align: 'left' },
                        { text: "< A Pend.", dataIndex: 'ANTIGUO', width: 75, tooltip: myDesktopApp.appLocale.isf_eco_Widgets.lblcolAbrevMananaFull + " " + myDesktopApp.appLocale.isf_eco_Widgets.lblcolPend, align: 'right' },
                        { text: "A Pend.", dataIndex: 'AYER', width: 65, tooltip: myDesktopApp.appLocale.isf_eco_Widgets.lblcolAbrevAyerFull + " " + myDesktopApp.appLocale.isf_eco_Widgets.lblcolPend, align: 'right' },
                        { text: "H Pend.", dataIndex: 'HOY', width: 65, tooltip: myDesktopApp.appLocale.isf_eco_Widgets.lblcolAbrevHoyFull + " " + myDesktopApp.appLocale.isf_eco_Widgets.lblcolPend, align: 'right' }
                    ]
                },              
                { xtype: 'fieldset', title: "Procesado" + '<img src="./lib/isf/img/ISF_information.png"/>', defaultType: 'checkboxfield', hidden: false, collapsible: false, collapsed: false,
                    tip: "-<b>Procesar</b> crea los descargos en función de las ventas.</br></br>",
                    listeners: {
                        render: function (c) {
                            Ext.create('Ext.tip.ToolTip', {
                                target: c.getEl(),
                                html: c.tip
                            });
                        }
                    },
                    id: 'widgetDescargosCheckboxPro',
                    margin: '0 0 0 0',
                    items: [
                        { boxLabel: "Reprocesar Descargos", checked: false, id: 'reprocesarDescargos', disabled: false },
                        { xtype: 'container', layout: 'hbox',
                            items: [
                                { xtype: 'datefield', itemId: 'dtDesdeRep', fieldLabel: 'Desde', labelWidth: 50, width: 180, format: 'd/m/Y', value: new Date() },
                                { xtype: 'tbspacer', width: 10 },
                                { xtype: 'datefield', itemId: 'dtHastaRep', fieldLabel: 'Hasta', labelWidth: 45, width: 180, format: 'd/m/Y', value: new Date() }
                            ]
                        }
                    ]
                },
                { xtype: 'fieldset', title: "Reprocesado" + '<img src="./lib/isf/img/ISF_information.png"/>', defaultType: 'checkboxfield', hidden: false, collapsible: false, collapsed: false,
                    tip: "-<b>Reprocesar</b> solo intenta crear los descargos que por algún error no se pudieron crear.",
                    listeners: {
                        render: function (c) {
                            Ext.create('Ext.tip.ToolTip', {
                                target: c.getEl(),
                                html: c.tip
                            });
                        }
                    },
                    id: 'widgetDescargosCheckboxRep',
                    margin: '10px 0 0 0',
                    items: [
                        { boxLabel: "Reprocesar Lotes", checked: false, id: 'reprocesarLotes',  disabled: false },
                        { xtype: 'container', layout: 'hbox',
                            items: [
                                { xtype: 'datefield', itemId: 'dtDesdeProc', fieldLabel: 'Desde', labelWidth: 50, width: 180, format: 'd/m/Y', value: new Date() },
                                { xtype: 'tbspacer', width: 10 },
                                { xtype: 'datefield', itemId: 'dtHastaProc', fieldLabel: 'Hasta', labelWidth: 45, width: 180, format: 'd/m/Y', value: new Date() }
                            ]
                        }
                    ]
                }
,
                
                { xtype: 'button', buttonAlign: 'right', margin: '10px 0 0 0', id: 'widgetbtnRefresh', itemId: 'widgetbtnRefresh', name: 'widgetbtnRefresh', disabled: true, text: "Iniciar", handler: this.onClickIniciar, scope: this, icon: './lib/isf/img/ISF_actualizar.png' }
            ]
        }, 2);
    }
