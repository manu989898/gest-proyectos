Ext.require([
    'Ext.data.*',
    'Ext.util.*',
    'Ext.panel.*',
    'Ext.toolbar.*',
    'Ext.button.*',
    'Ext.state.*',
    'isf.lib.base.ISFList'

]);


Ext.define('isf.eco.widgetDescargos', {
    extend: 'isf.lib.Module',
    init: function () {
        Ext.define('PROCESDESC', {
            extend: 'Ext.data.Model',
            fields: [
                { name: "ABREV", type: "int" },
                { name: "DESCR", type: "string" },
                { name: "HOY", type: "int" },
                { name: "AYER", type: "int" },
                { name: "ANTIGUO", type: "int" }
            ]
        });

        this.stoDescargosProcesar = Ext.create('Ext.data.Store', {
            storeId: 'stoDescWidget',
            model: 'PROCESDESC',
            proxy: {
                type: 'memory'
            }
        });
/*
        this.stoTipoMov = Ext.create('Ext.data.Store', {
            id: 'sTipoMovimientoWidg',
            model: 'TipoMovimiento',
            proxy: {
                type: 'memory'
            }
        });
        this.localeW = myDesktopApp.appLocale.isf_eco_Widgets
        this.stoTipoMov.add({ MOVTIPO: 1, MOVDESC: this.localeW.sto_tipoMov_compra });
        this.stoTipoMov.add({ MOVTIPO: 2, MOVDESC: this.localeW.sto_tipoMov_venta });
        this.stoTipoMov.add({ MOVTIPO: 3, MOVDESC: this.localeW.sto_tipoMov_entrada });
        this.stoTipoMov.add({ MOVTIPO: 4, MOVDESC: this.localeW.sto_tipoMov_salida });
        this.stoTipoMov.add({ MOVTIPO: 5, MOVDESC: this.localeW.sto_tipoMov_pedido });
        this.stoTipoMov.add({ MOVTIPO: 6, MOVDESC: this.localeW.sto_tipoMov_factura });
        this.stoTipoMov.add({ MOVTIPO: 7, MOVDESC: this.localeW.sto_tipoMov_interseccion });
        this.stoTipoMov.add({ MOVTIPO: 8, MOVDESC: this.localeW.sto_tipoMov_devolucion });
        this.stoTipoMov.add({ MOVTIPO: 9, MOVDESC: this.localeW.sto_tipoMov_merma });
        this.stoTipoMov.add({ MOVTIPO: 10, MOVDESC: this.localeW.sto_tipoMov_regul });
        this.stoTipoMov.add({ MOVTIPO: 11, MOVDESC: this.localeW.sto_tipoMov_vale });
        this.stoTipoMov.add({ MOVTIPO: 12, MOVDESC: this.localeW.sto_tipoMov_facturaSal });
        this.stoTipoMov.add({ MOVTIPO: 13, MOVDESC: this.localeW.sto_tipoMov_inventario });
        this.stoTipoMov.add({ MOVTIPO: 14, MOVDESC: this.localeW.sto_tipoMov_expedientes });
        this.stoTipoMov.add({ MOVTIPO: 15, MOVDESC: this.localeW.sto_tipoMov_solicitudes });
        this.stoTipoMov.add({ MOVTIPO: 16, MOVDESC: this.localeW.sto_tipoMov_descargos });
        this.stoTipoMov.add({ MOVTIPO: 17, MOVDESC: this.localeW.sto_tipoMov_pedidoenv });  
        */
    },

    initPanels: function () {
        this.createPanelDescargos();
        var connW = new isf.lib.Connection("GetWidgetDescargos");
        connW.addParam('p_centcodi', this.app.centcodi);
        this.getData(connW);        
    },

    loadGetWidgetDescargos: function (data) {
        if (data.datos.DESCPROCESAR) {
            this.loadDataToStore(data, this.stoDescargosProcesar, "DESCPROCESAR");
        }
        var me = this;
        var conn = new isf.lib.Connection("GetEstadoProceso");
        conn.addParam("p_centcodi", this.app.centcodi);
        me.getData(conn);
    },

    loadGetEstadoProceso: function (data) {

        const resultado = data?.datos?.RESULTESTADO?.[0]?.PROCESANDO;
        var labelEstado = Ext.ComponentQuery.query('#estadoProceso')[0];
        var btnInic = Ext.ComponentQuery.query('#widgetbtnRefresh')[0];

        if (resultado === 0) {
            labelEstado.setText("Sin proceso en marcha");
            this.widgetDescargos.down("#imgMerP").setSrc('/lib/isf/img/ISF_Verde.png');
            btnInic.setDisabled(false);
        } else {
            labelEstado.setText("Proceso en marcha");
            this.widgetDescargos.down("#imgMerP").setSrc('/lib/isf/img/ISF_bRoja.png');
            btnInic.setDisabled(true);
        }
    },

    onClickIniciar: function () {
        var me = this;
        var tipoReproceso = Ext.ComponentQuery.query('#cmbTipoReproceso')[0].getValue();
        var desde = Ext.ComponentQuery.query('#dtDesdeUnificado')[0].getValue();
        var hasta = Ext.ComponentQuery.query('#dtHastaUnificado')[0].getValue();

        if (!tipoReproceso || !desde || !hasta) {
            isf.lib.MsgBox.showError(this, "Debe seleccionar un tipo de reproceso y ambas fechas.");
            return;
        }

        var conn = new isf.lib.Connection("ProcesarDescargosDesdeWidget");

        conn.addParam("p_cnx", this.app.userInfo.conx)
        conn.addParam("p_userid", this.app.userInfo.userId);
        conn.addParam("p_centcodi", this.app.centcodi);
        conn.addParam("p_reprocesar_descargos", tipoReproceso === 'descargos' ? 1 : 0);
        conn.addParam("p_reprocesar_lotes", tipoReproceso === 'lotes' ? 1 : 0);
        conn.addParam("p_fechdesde", desde);
        conn.addParam("p_fechasta", hasta);//, Ext.Date.format(hasta, 'Y-m-d')

        me.getData(conn);       
    },
    
    loadProcesarDescargosDesdeWidget: function () {
        isf.lib.MsgBox.showGhostMessage(this.locale.label_informacion, "Proceso iniciado con extio", null); //locale
        var connW = new isf.lib.Connection("GetWidgetDescargos");
        connW.addParam('p_centcodi', this.app.centcodi);
        this.getData(connW);

    },

    createPanelDescargos: function () {

        var me = this;
        me.widgetDescargosInstance = me.createWidget('widgetDescargos', {
            title: "DESCARGOS", //locale
            listeners: {
                'refresh': function () {
                    var connW = new isf.lib.Connection("GetWidgetDescargos");
                    connW.addParam('p_centcodi', me.app.centcodi);
                    me.getData(connW);
                }
            },
            xtype: 'isfpanel',
            width: 400,
            height: 380,
            bodyPadding: '5 5 0 5',
            addRefreshButton: true,
            items: [
                {
                    itemId: 'grdWidgetDescargos',
                    xtype: 'isfgrid',
                    height: 130,
                    store: this.stoDescargosProcesar,
                    summaryHeader: false,
                    showColumnFilters: false,
                    columns: [
                        { text: "", dataIndex: 'DESCR', width: 125, align: 'left' },
                        { text: "< A Pend.", dataIndex: 'ANTIGUO', width: 75, align: 'right' },
                        { text: "A Pend.", dataIndex: 'AYER', width: 65, align: 'right' },
                        { text: "H Pend.", dataIndex: 'HOY', width: 65, align: 'right' }
                    ]
                },
                { xtype: 'fieldset',
                    title: "Tipo de Proceso", //locale
                    collapsible: false,
                    items: [
                        { xtype: 'combo',
                            itemId: 'cmbTipoReproceso',
                            fieldLabel: 'Tipo', //locale
                            labelWidth: 50,
                            store: Ext.create('Ext.data.Store', {
                                fields: ['id', 'nombre'],
                                data: [
                                    { id: 'descargos', nombre: 'Reprocesar Descargos' },
                                    { id: 'lotes', nombre: 'Reprocesar Lotes' }
                                ]
                            }),
                            queryMode: 'local',
                            displayField: 'nombre', 
                            valueField: 'id',
                            editable: false,
                            forceSelection: true,
                            width: 350
                        },
                        { xtype: 'container',
                            layout: 'hbox',
                            margin: '0 0 0 0',
                            items: [
                                //LOCALES PARA LAS DECHAS DESDE Y HASTA
                                { xtype: 'datefield', itemId: 'dtDesdeUnificado', fieldLabel: 'Desde', labelWidth: 40, width: 180, format: 'd/m/Y', value: new Date() },
                                { xtype: 'tbspacer', width: 10 },
                                { xtype: 'datefield', itemId: 'dtHastaUnificado', fieldLabel: 'Hasta', labelWidth: 40, width: 170, format: 'd/m/Y', value: new Date() }
                            ]
                        }
                    ]
                },
                { xtype: 'fieldset', title: "Estado del proceso", //locale
                    items: [
                        { xtype: 'isfform', border: 0, bodyMargin: 0, bodyPadding: 0, style: 'margin: 0px;',
                            items: [
                                [
                                    { xtype: 'label', text: "Estado del proceso", style: 'font-weight: bold; margin-right: 10px;' }, //locale                              
                                    { itemId: 'imgMerP', xtype: 'image', height: 16, maxWidth: 16 },
                                    { xtype: 'label', itemId: 'estadoProceso', text: "estado", maxWidth: 80 }                                 
                                ]
                            ]
                        }
                    ]
                },
                { xtype: 'button', buttonAlign: 'right', margin: '10px 0 0 0', id: 'widgetbtnRefresh', itemId: 'widgetbtnRefresh', name: 'widgetbtnRefresh', disabled: false, text: "Iniciar", handler: this.onClickIniciar, scope: this, icon: './lib/isf/img/ISF_actualizar.png' } //locale
            ]
        }, 2);
    }
});