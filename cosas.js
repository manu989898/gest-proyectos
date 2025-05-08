Ext.define('isf.eco.MovDescargoLineas', {
    extend: 'isf.lib.Module',
    isElab: true,

    // ========== INIT ==========



    init: function (parametros) {


        this.stoSelectedDesc = Ext.create('Ext.data.Store', {
            id: 'SelectedDescargo',
            model: 'Descargos',
            proxy: {
                type: 'memory'
            }
        });

        this.stoDescargosLin = Ext.create("Ext.data.Store", {
            id: "stoDescargosLin",
            model: "DescargosLineas",
            proxy: {
                type: "memory"
            }
        });

        this.stoDescargosLinDet = Ext.create("Ext.data.Store", {
            id: "stoDescargosLinDet",
            model: "DescargoLinDet",
            proxy: {
                type: "memory"
            }
        });

        this.stoDescargosLinDetTMP = Ext.create("Ext.data.Store", {
            id: "stoDescargosLinDet",
            model: "DescargoLinDet",
            proxy: {
                type: "memory"
            }
        });

        this.stoElaboradosLin = Ext.create("Ext.data.Store", {
            id: "stoElaboradosLin",
            model: "ElaboradoLin",
            proxy: {
                type: "memory"
            }
        });

        this.stoReleves = Ext.create("Ext.data.Store", {
            id: "stoReleves",
            model: "Releve",
            proxy: {
                type: "memory"
            }
        });

        this.stoHistEventos = Ext.create('Ext.data.Store', {
            id: 'descHistEventos',
            model: 'DescHistEventos',
            proxy: {
                type: 'memory'
            }
        });

        this.stoUnidadesConv = Ext.create('Ext.data.Store', {
            id: 'stoUnidadesConv',
            model: 'DescUnidConv',
            proxy: {
                type: 'memory'
            }
        });

        this.stoTipoDescargo = Ext.create('Ext.data.Store', {
            id: 'stoTipoDescargo',
            model: 'TipoDescargo',
            proxy: {
                type: 'memory'
            }
        });

        this.stoCachedArticulosDescargos = Ext.create('Ext.data.Store', {
            id: 'descargosCachedArticulos',
            model: 'Articulo',
            sorters: ['GRUPABREV', 'FAMIDESC', 'ARTIDESC'],
            proxy: {
                type: 'memory'
            }
        });

        this.isElab = typeof (this.app.tipoDescargo) == "undefined" ? false : this.app.tipoDescargo == 1;
        this.descCodi = parametros.descCodi;
        this.parent = parametros.parent;

    },


    initWindows: function () {

        //instanciamos la store de tipo de movimientos
        this.createWindowDetalle();
    },

    getDefaultConnection: function () {
        this.dameDetalleDescargo();
    },

    // ========= FIN INIT ===============


    //#region ========= VENTANA DETALLE ==============

    createWindowDetalle: function () {
        var me = this;

        var editorCantidad = {
            xtype: 'numberfield', hideTrigger: true, keyNavEnabled: false, mouseWheelEnabled: false, minValue: 0, decimalPrecision: 0
        };

        var editorCantidad5d = {
            xtype: 'numberfield', hideTrigger: true, keyNavEnabled: false, mouseWheelEnabled: false, minValue: 0, decimalPrecision: 5
        };
        var editorCantidad2d = {
            xtype: 'numberfield', hideTrigger: true, keyNavEnabled: false, mouseWheelEnabled: false, minValue: 0, decimalPrecision: 2
        };

        var editorCantidad3d = {
            xtype: 'numberfield', hideTrigger: true, keyNavEnabled: false, mouseWheelEnabled: false, minValue: 0, decimalPrecision: 3
        };

        var descargosLinGrid = {
            xtype: "isflist",
            itemId: "descargosLinGrid",
            title: this.locale.label_platos_descargo,
            height: 260,
            gridConfig: {
                store: this.stoDescargosLin,
                summaryHeader: true,
                editable: true,
                showColumnFilters: true,
                columns: [
                    { id: "SERVCODI", text: this.locale.label_codFYB, tooltip: this.locale.label_codigo, dataIndex: "SERVCODI", width: 70, readonly: true },
                    { dataIndex: 'DESCTIPO', text: this.locale.tipo, width: 70, readonly: true, renderer: Ext.bind(Renderers.renderTipoDescargo, me) },
                    { id: "PLATDESC", text: this.locale.label_plato, width: 430, readonly: true, dataIndex: "SERVCODI", renderer: Ext.bind(Renderers.rendererDescargosLineas, me) },
                    { text: this.locale.label_rac, tooltip: this.locale.label_raciones, dataIndex: "DELNCANT", width: 80, align: "right", exportType: 'number', editor: editorCantidad5d, renderer: Renderers.cantidad5d, eventFunction: Ext.bind(this.onvaluecommitedCantidad, this), eventName: 'valuecommited', scope: this },
                    { text: this.locale.label_cantidad, tooltip: this.locale.label_cantidad, dataIndex: "DELNCANTSTK", width: 80, align: "right", exportType: 'number', editor: editorCantidad2d, renderer: Renderers.cantidad2d, eventFunction: Ext.bind(this.onvaluecommitedCantidad, this), eventName: 'valuecommited', scope: this },
                    { text: this.locale.label_unidad, tooltip: this.locale.label_unidad, dataIndex: 'DESCUNIDAD', width: 80, align: "left", readonly: true },
                    { text: this.locale.label_precio, dataIndex: "DELNPRECIO", width: 60, renderer: Renderers.rendImportes, exportType: "currency", align: "right", readonly: true },
                    { text: this.locale.label_importe, dataIndex: "DELNIMPORTE", width: 100, renderer: Renderers.rendImportes, exportType: "currency", align: "right", readonly: true, summaryType: 'sum' },
                    { text: this.locale.label_imp_eur, tooltip: this.locale.label_importe_eur, dataIndex: 'DELNIMPORTECONS', width: 100, summaryType: 'sum', renderer: Renderers.rendImportes, exportType: 'currency', align: 'right', readonly: true },
                    { text: this.locale.label_imp_usd, tooltip: this.locale.label_importe_usd, dataIndex: 'DELNIMPORTEUSD', width: 100, hidden: true, summaryType: 'sum', renderer: Renderers.rendImportes, exportType: 'currency', align: 'right', readonly: true },
                    { text: this.locale.label_imp + this.app.moneabrev, tooltip: this.locale.label_importe + " " + this.app.moneabrev, dataIndex: 'DELNIMPORTELOC', width: 100, hidden: true, summaryType: 'sum', renderer: Renderers.rendImportes, exportType: 'currency', align: 'right', readonly: true }
                ],
                contextMenu: {
                    enabled: true,
                    ordenar: true,
                    filtrar: true,
                    eliminar: false,
                    opciones: [
                        {
                            itemId: 'btnEliminar', text: this.locale.label_eliminar, handler: this.onclickContextMenuEliminar, scope: this
                        }
                    ]
                }
            },
            toolbar: [
                { xtype: "button", text: this.locale.label_anadir_plato, itemId: "btnNuevoP", handler: this.onclickAnadirLin, scope: this, icon: "./lib/isf/img/ISF_mas.png" },
                { xtype: "button", text: this.locale.label_anadir_releves, itemId: "btnReleves", handler: this.onclickAnadirReleves, scope: this, icon: "./lib/isf/img/ISF_mas.png" }
            ]
        };

        var elaboradosLinGrid = {
            xtype: "isflist",
            itemId: "elaboradosLinGrid",
            title: this.locale.label_platos_elaborado,
            hidden: !this.isElab,
            height: 200,
            gridConfig: {
                store: this.stoElaboradosLin,
                summaryHeader: true,
                editable: true,
                showColumnFilters: true,
                columns: [
                    { text: this.locale.label_grupo, dataIndex: 'GRUPABREV', width: 60, align: "left", readonly: true },
                    { text: this.locale.label_familia, dataIndex: 'FAMIDESC', width: 120, align: "left", readonly: true },
                    { text: this.locale.label_subfamilia, dataIndex: 'SBFMDESC', width: 80, align: "left", readonly: true },
                    { text: this.locale.label_cod, tooltip: this.locale.label_codigo, dataIndex: 'ARTICODI', width: 80, align: 'right', exportType: 'number', readonly: true },
                    { text: this.locale.label_articulo, dataIndex: 'ARTIDESC', width: 260, locked: true, align: "left", readonly: true },
                    { text: this.locale.label_tipo, dataIndex: 'TPGRCODI', width: 50, store: isf.eco.CachedMasters.tipoGrupos, displayCol: 'TPGRABREV', codeCol: 'TPGRCODI', renderer: Renderers.rendTipo, readonly: true },
                    { text: this.locale.label_cnt, tooltip: this.locale.label_cantidad, dataIndex: 'DELECANT', editor: editorCantidad3d, renderer: Renderers.rendCntStock, exportType: 'number', eventFunction: Ext.bind(this.onvaluecommitedCantidadLinElaborado, this), eventName: 'valuecommited', width: 80, align: 'right' },
                    { text: this.locale.label_frmstk, tooltip: this.locale.label_formato_stock, dataIndex: 'FORMCODI', store: isf.eco.CachedMasters.articuloFormatos, displayCol: 'FORMDESC', codeCol: 'FORMCODI', width: 80, align: "left", readonly: true },
                    { text: this.locale.label_precio, dataIndex: 'DELEPRECIO', width: 60, renderer: Renderers.rendImportes5d, exportType: 'currency', align: 'right', readonly: true },
                    { text: this.locale.label_importe, dataIndex: 'DELEIMPORTE', width: 100, renderer: Renderers.rendImportes, exportType: 'currency', align: 'right', summaryType: 'sum', readonly: true },
                    { text: this.locale.label_imp_eur, tooltip: this.locale.label_importe_eur, dataIndex: 'DELEIMPORTECONS', width: 100, summaryType: 'sum', renderer: Renderers.rendImportes, exportType: 'currency', align: 'right', readonly: true },
                    { text: this.locale.label_imp_usd, tooltip: this.locale.label_importe_usd, dataIndex: 'DELEIMPORTEUSD', width: 100, hidden: true, summaryType: 'sum', renderer: Renderers.rendImportes, exportType: 'currency', align: 'right', readonly: true },
                    { text: this.locale.label_imp + this.app.moneabrev, tooltip: this.locale.label_importe + " " + this.app.moneabrev, dataIndex: 'DELEIMPORTELOC', width: 100, hidden: true, summaryType: 'sum', renderer: Renderers.rendImportes, exportType: 'currency', align: 'right', readonly: true },
                    { text: this.locale.label_stock, width: 60, dataIndex: 'STOCK', renderer: Renderers.rendStock, exportType: 'numeric', align: 'left', readonly: true }
                ],
                contextMenu: {
                    enabled: true,
                    ordenar: true,
                    filtrar: true,
                    eliminar: false
                    //opciones: [
                    //    { itemId: 'btnEliminar', text: this.locale.label_eliminar, handler: this.onclickContextMenuEliminar, scope: this} 
                    //]
                }
            },
            toolbar: [
                { xtype: 'button', text: this.locale.label_solicitar_alta_art, itemId: 'btnSoliAltaArt', handler: this.onSoliAltaArt, scope: this, icon: './lib/isf/img/ISF_comentar.png', alias: 'BTN_LIST_SOL_ALTA_ART' }
                , { xtype: 'button', text: 'Crear Artículo', itemId: 'btnCrearArt', handler: this.onCrearArt, scope: this, icon: './lib/isf/img/ISF_mas.png', alias: 'BTN_ALTA_ART' }
                , { xtype: 'tbseparator' }
                , { xtype: 'button', text: this.locale.label_asignar_art, itemId: 'btnAsignar', handler: this.onAsignar, scope: this, icon: './lib/isf/img/ISF_mas.png', alias: 'BTN_LIST_ASIGNAR' }
                , { xtype: 'tbseparator' }
                , { xtype: 'button', itemId: 'btnAddA', text: this.locale.label_anadir_articulos, handler: this.abrirListaArticulos, scope: this, icon: './lib/isf/img/ISF_mas.png', alias: 'BTN_INT_ADDART', hidden: true }
            ]

        };

        var descargosLinDetGrid = {
            xtype: 'isflist',
            title: this.locale.label_articulos_plato,
            itemId: 'descargosLinDetGrid',
            gridConfig: {
                store: this.stoDescargosLinDet,
                showColumnFilters: true,
                summaryHeader: true,
                editable: true,
                columns: [
                    //{ dataIndex: 'SELECCION', selection: true, locked: true, readonly: true },
                    { text: this.locale.label_grupo, dataIndex: 'GRUPABREV', width: 60, align: "left", readonly: true, renderer: this.rendBlueBlackSegunArticodi },
                    { text: this.locale.label_familia, dataIndex: 'FAMIDESC', width: 120, align: "left", readonly: true, renderer: this.rendBlueBlackSegunArticodi },
                    { text: this.locale.label_subfamilia, dataIndex: 'SBFMDESC', width: 80, align: "left", readonly: true, renderer: this.rendBlueBlackSegunArticodi },
                    { text: this.locale.label_cod, tooltip: this.locale.label_codigo, dataIndex: 'ARTICODI', width: 80, align: 'right', exportType: 'number', readonly: true, renderer: this.rendBlueBlackSegunArticodi },
                    { text: this.locale.label_articulo, dataIndex: 'ARTIDESC', width: 260, locked: true, align: "left", readonly: true, renderer: this.rendBlueBlackSegunArticodi },
                    { text: this.locale.label_tipo, dataIndex: 'TPGRCODI', width: 50, store: isf.eco.CachedMasters.tipoGrupos, displayCol: 'TPGRABREV', codeCol: 'TPGRCODI', renderer: Renderers.rendTipoSegunArticodi, readonly: true },
                    { text: this.locale.label_cnt, tooltip: this.locale.label_cantidad, dataIndex: 'DELDCANT', editor: editorCantidad3d, renderer: Renderers.rendCntStock, exportType: 'number', eventFunction: Ext.bind(this.onvaluecommitedCantidadLinDet, this), eventName: 'valuecommited', width: 80, align: 'right' },
                    { text: this.locale.label_frmstk, tooltip: this.locale.label_formato_stock, dataIndex: 'FORMCODI', store: isf.eco.CachedMasters.articuloFormatos, displayCol: 'FORMDESC', codeCol: 'FORMCODI', width: 80, align: "left", readonly: true, renderer: this.rendBlueBlackSegunArticodi },
                    { text: this.locale.label_precio, dataIndex: 'DELDPRECIO', width: 60, renderer: Renderers.rendImportesSegunArticodi, exportType: 'currency', align: 'right', readonly: true },
                    { text: this.locale.label_importe, dataIndex: 'DELDIMPORTE', width: 100, renderer: Renderers.rendImportesSegunArticodi, exportType: 'currency', align: 'right', summaryType: 'sum', readonly: true },
                    { text: this.locale.label_imp_eur, tooltip: this.locale.label_importe_eur, dataIndex: 'DELDIMPORTECONS', width: 100, summaryType: 'sum', renderer: Renderers.rendImportesSegunArticodi, exportType: 'currency', align: 'right', readonly: true },
                    { text: this.locale.label_imp_usd, tooltip: this.locale.label_importe_usd, dataIndex: 'DELDIMPORTEUSD', width: 100, hidden: true, summaryType: 'sum', renderer: Renderers.rendImportesSegunArticodi, exportType: 'currency', align: 'right', readonly: true },
                    { text: this.locale.label_imp + this.app.moneabrev, tooltip: this.locale.label_importe + " " + this.app.moneabrev, dataIndex: 'DELDIMPORTELOC', width: 100, hidden: true, summaryType: 'sum', renderer: Renderers.rendImportesSegunArticodi, exportType: 'currency', align: 'right', readonly: true },
                    { text: this.locale.label_stock, width: 60, dataIndex: 'STOCK', renderer: Renderers.rendStock, exportType: 'numeric', align: 'left', readonly: true }
                ],
                contextMenu: {
                    enabled: true,
                    ordenar: true,
                    filtrar: false,
                    eliminar: false,
                    opciones: [
                        { itemId: 'btnEliminar', text: this.locale.label_eliminar, handler: this.onclickContextMenuEliminarLinDes, scope: this }
                    ]
                }
            },
            toolbar: [
                { xtype: 'button', itemId: 'btnAddA', text: this.locale.label_anadir_articulos, handler: this.abrirListaArticulos, scope: this, icon: './lib/isf/img/ISF_mas.png', alias: 'BTN_INT_ADDART' }
            ]
        };

        var headerFormConfig = [
            [
                { fieldLabel: this.locale.label_fecha, itemId: 'DESCFECHA', name: 'DESCFECHA', maxWidth: 80, renderer: Renderers.rendDate, readOnly: true },
                { fieldLabel: this.locale.label_descargo, itemId: 'DESCDESC', name: 'DESCDESC', readOnly: true },
                { fieldLabel: this.locale.label_tipo_desc, itemId: 'DESCTIPO', name: 'DESCTIPO', xtype: 'combobox', store: this.stoTipoDescargo, queryMode: 'local', displayField: "DESCTIPONOM", valueField: "DESCTIPO", readOnly: true, hideTrigger: true, allowBlank: false },
                { fieldLabel: this.locale.label_origen, itemId: 'DESCORIGEN', name: 'DESCORIGEN', maxWidth: 80, readOnly: true },
                { fieldLabel: this.locale.label_importe + " " + this.app.moneabrev, itemId: 'DESCTOTALLOC', name: 'DESCTOTALLOC', xtype: 'numberfield', maxWidth: 90, formatter: Renderers.rendImportes, decimalPrecision: 2, decimalSeparator: ",", readOnly: true, hideTrigger: true },
                { fieldLabel: this.locale.label_estado, itemId: "ESTACODI", name: "ESTACODI", maxWidth: 130, formatter: Renderers.rendHeadStatus, readOnly: true }
            ],
            [
                { fieldLabel: this.locale.label_codigo, itemId: 'DESCCODI', name: 'DESCCODI', xtype: 'isfgridnav', maxWidth: 80, grid: null, triggerEvent: 'itemdblclick', fieldStyle: 'text-align: right;' },
                { fieldLabel: this.locale.label_departamento_origen, itemId: 'DESCSBALORIG', name: 'DESCSBALORIG', xtype: 'combobox', store: Common.clonarStore(isf.eco.CachedMasters.subalmacenes, null, null, 'MovDescargosLineas_subalmacenes_1'), queryMode: 'local', displayField: 'SBALDESCR', valueField: 'SBALCODI', readOnly: true, hideTrigger: true },
                { fieldLabel: this.locale.label_departamento_destino, itemId: 'DESCSBALDEST', name: 'DESCSBALDEST', xtype: 'combobox', store: Common.clonarStore(isf.eco.CachedMasters.subalmacenes, null, null, 'MovDescargosLineas_subalmacenes_2'), queryMode: 'local', displayField: 'SBALDESCR', valueField: 'SBALCODI', readOnly: true, hideTrigger: true },
                { xtype: 'tbspacer', maxWidth: 80 },
                { fieldLabel: this.locale.label_importe + " " + this.app.moneabrev, itemId: 'DESCTOTALCONS', name: 'DESCTOTALCONS', xtype: 'numberfield', maxWidth: 90, formatter: Renderers.rendImportes, decimalPrecision: 2, decimalSeparator: ",", readOnly: true, hideTrigger: true },
                { fieldLabel: this.locale.label_moneda, itemId: 'MONECODI', xtype: 'combobox', store: isf.eco.CachedMasters.monedasFuertes, queryMode: 'local', displayField: 'MONEDESC', valueField: 'MONECODI', name: 'MONECODI', value: this.app.monecodicab ? this.app.monecodicab : this.app.monecodi, maxWidth: 130 }
            ]
        ];

        var histeventosGrid = {
            xtype: 'isflist'
            , itemId: 'histeventos'
            , title: this.locale.det_grid_histEventos_title
            , gridConfig: {
                store: this.stoHistEventos
                , columns: [
                    { text: this.locale.det_grid_histeventos_DESCEVENTOACCION, dataIndex: 'DESCEVENTOACCION', width: 150, renderer: Renderers.rendFactEventoAccion }
                    , { text: this.locale.det_grid_histeventos_DESCEVENTOMOTIVO, dataIndex: 'DESCEVENTOMOTIVO', width: 450 }
                    , { text: this.locale.det_grid_histeventos_USERCODI, dataIndex: 'USERCODI', width: 150 }
                    , { text: this.locale.det_grid_histeventos_DESCEVENTOFECHA, width: 135, dataIndex: 'DESCEVENTOFECHA', renderer: Ext.util.Format.dateRenderer('d/m/Y G:i:s'), align: 'right' }
                ]
            }
        };

        var descargoDetLinea = {
            xtype: 'isfncslayout',
            title: this.locale.label_detalle,
            border: 0,
            northItem: elaboradosLinGrid,
            centerItems: [descargosLinDetGrid, histeventosGrid],
            toolbar: [
                { xtype: "button", text: this.locale.label_procesar, itemId: "btnProces", handler: this.onclickProcesarDescargo, scope: this, icon: "./lib/isf/img/ISF_gear.png" },
                { xtype: 'tbseparator' },
                { xtype: "button", text: this.locale.label_actualizar_stock_y_precios, itemId: "btnActual", handler: this.onclickActualizarStockPrec, scope: this, icon: "./lib/isf/img/ISF_actualizar.png" },
                { xtype: 'tbseparator' },
                { xtype: "button", text: this.locale.label_guardar, itemId: "btnNueva", handler: this.onclickguardarLin, scope: this, icon: "./lib/isf/img/ISF_grabar.png" },
                { xtype: "button", text: this.locale.label_salir, itemId: "btnSalir", handler: function () { this.vtnDescargosLin.close(); }, scope: this, icon: "./lib/isf/img/ISF_Salir.png", readMode: true }
            ]
        };

        var descargoDet = {
            xtype: 'isfncslayout',
            border: 0,
            northItem: descargosLinGrid,
            centerItems: [descargoDetLinea]
        };

        var configVentana = {
            title: this.app.centabrev + ' - ' + this.locale.label_detalle_descargos,
            width: 1920,
            minWidth: 1920,
            height: 900,
            items: [descargoDet],
            headerFields: headerFormConfig
        };

        this.createWindow("vtnDescargosLin", configVentana, "vtnDescargos");
        this.vtnDescargosLin.on("beforeclose", this.onBeforeCloseWinDescargoLin, this);
        this.vtnDescargosLin.panels.headerForm.down("#MONECODI").on("change", this.onchangeMonecodi, this);
        this.vtnDescargosLin.panels.descargosLinGrid.listGrid.on("rowSelected", this.onrowSelectedTablaDescargosLin, this);
        this.vtnDescargosLin.panels.descargosLinDetGrid.listGrid.on("itemdblclick", this.onitemdblclickArtic, this);

        if (this.isElab)
            this.vtnDescargosLin.panels.elaboradosLinGrid.listGrid.on("itemdblclick", this.onitemdblclickArtic, this);
    },



    //#region  ========= EVENTOS DETALLE ==========
    onBeforeCloseWinDescargoLin: function () {
        var me = this;
        if (me.detalleTieneCambios()) {
            isf.lib.MsgBox.showConfirm(
                this,
                me.locale.msb_box_confirm_salir_detalle,
                function (btn) {
                    if (btn == 'yes') {
                        me.stoDescargosLin.rejectChanges();
                        me.stoDescargosLinDet.rejectChanges();
                        me.stoElaboradosLin.rejectChanges();
                        me.vtnDescargosLin.close();
                        me.parent.detalle = null;
                    }
                }
            );
            return false;
        }
        else {
            me.parent.detalle = null;
            return true;
        }
    },

    onchangeMonecodi: function (field, records) {
        var platosGrid = this.vtnDescargosLin.panels.descargosLinGrid.listGrid;
        var articulosGrid = this.vtnDescargosLin.panels.descargosLinDetGrid.listGrid;

        if (this.isElab) {
            var articulosElaboradosGrid = this.vtnDescargosLin.panels.elaboradosLinGrid.listGrid;
        }

        var importe = this.vtnDescargosLin.down("#DESCTOTALCONS");
        var monedesc = this.vtnDescargosLin.down("#MONECODI").getRawValue();
        var monecodi = this.vtnDescargosLin.down("#MONECODI").getValue();
        var columns = ["DELNIMPORTELOC", "DELNIMPORTECONS", "DELNIMPORTEUSD"]; // 0: Columna EUR // 1: Columna USD // 2: Columna LOC
        var columnsDet = ["DELDIMPORTELOC", "DELDIMPORTECONS", "DELDIMPORTEUSD"]; // 0: Columna EUR // 1: Columna USD // 2: Columna LOC
        var columnsElaborados = ["DELEIMPORTELOC", "DELEIMPORTECONS", "DELEIMPORTEUSD"]; // 0: Columna EUR // 1: Columna USD // 2: Columna LOC
        var colIndex = (monecodi === 1 || monecodi === 2) ? monecodi : 0; // en el caso de que sean euros o dolares entonces cogemos el valor, en cualquier otro caso cogemos  la moneda local


        importe.labelEl.update(this.locale.label_importe + " " + monedesc);

        importe.setValue(this.stoDescargosLin.sum(columns[colIndex]));
        this.cambiaMonedaDescargo(columns, platosGrid, monecodi);
        this.cambiaMonedaDescargo(columnsDet, articulosGrid, monecodi);

        if (this.isElab) {
            this.cambiaMonedaDescargo(columnsElaborados, articulosElaboradosGrid, monecodi);
        }
    },

    onclickAnadirLin: function () {
        this.createWindowSeleccionPlato();
    },

    onclickguardarLin: function () {
        this.guardaLineasDescargo();
    },

    onclickActualizarStockPrec: function () {
        var conn = new isf.lib.Connection("ActualizarStockPrecios");
        conn.addParam("p_centcodi", this.app.centcodi);
        conn.addParam("p_desccodi", this.descCodi);
        conn.addParamList(Ext.Array.pluck((this.stoDescargosLinDet.snapshot ? this.stoDescargosLinDet.snapshot : this.stoDescargosLinDet.data).items, "data"), "pl_lineasDetDescargo");
        this.getData(conn);
    },

    onclickAnadirReleves: function () {
        this.callGetReleves();
    },

    onclickProcesarDescargo: function () {
        var me = this;

        me.localCache.put("processing", true);
        me.guardaLineasDescargo();

        me.parent.validaDescargo(this.descCodi);
    },

    onrowSelectedTablaDescargosLin: function (plato) {
        this.filtraArticulosPorPlato(plato.get("SERVCODI"), plato.get("DESCTIPO"));
    },

    onvaluecommitedCantidad: function (field, newValue, oldValue, record) {

        if (record.get('DESCTIPO') !== 2) {

            var nuevoValor;

            if (field == 'DELNCANT') //al editar ración
            {
                nuevoValor = newValue;
                record.set("DELNCANTSTK", (newValue * record.get("DELNCANTSTK") / oldValue));
                nuevoValorElab = record.get("DELNCANTSTK");
            }
            if (field == 'DELNCANTSTK') //al editar cantidad
            {
                record.set("DELNCANT", (record.get("DELNCANT") * newValue / oldValue));
                nuevoValor = record.get("DELNCANT");
                nuevoValorElab = newValue;
            }

            this.stoDescargosLinDet.each(
                function (articulo, id) {
                    var cantporrac = articulo.get("DELDCANTRAC") * nuevoValor;
                    var cantfactor = articulo.get("DELDCANT") / articulo.get("DELDCANTUMB");
                    articulo.set("DELDCANT", cantporrac);
                    articulo.set("DELDCANTUMB", cantporrac / cantfactor);
                    articulo.set("DELDIMPORTE", Common.redondea(articulo.get("DELDPRECIO") * articulo.get("DELDCANT"), 2));
                    articulo.set("DELDIMPORTELOC", Common.redondea(articulo.get("DELDPRECIOLOC") * articulo.get("DELDCANTUMB"), 2));
                    articulo.set("DELDIMPORTECONS", Common.redondea(articulo.get("DELDPRECIOCONS") * articulo.get("DELDCANTUMB"), 2));
                    articulo.set("DELDIMPORTEUSD", Common.redondea(articulo.get("DELDPRECIOUSD") * articulo.get("DELDCANTUMB"), 2));
                }
            );

            this.stoElaboradosLin.each(
                function (articulo, id) {
                    var cantporrac = nuevoValorElab / articulo.get("DELECANTRAC");
                    var cantfactor = articulo.get("DELECANT") / articulo.get("DELECANTUMB");

                    articulo.set("DELECANT", cantporrac * cantfactor);
                    articulo.set("DELECANTUMB", cantporrac);
                }
            );

        }

        record.set("DELNIMPORTE", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTE"), 2));
        record.set("DELNIMPORTELOC", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTELOC"), 2));
        record.set("DELNIMPORTECONS", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTECONS"), 2));
        record.set("DELNIMPORTEUSD", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTEUSD"), 2));

        var descelab = this.stoElaboradosLin.findRecord("SERVCODI", record.get("SERVCODI"), null, null, null, false);

        if (descelab != null) {

            // Recalcula los importes del elaborado
            descelab.set("DELEIMPORTE", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTE"), 2));
            descelab.set("DELEIMPORTELOC", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTELOC"), 2));
            descelab.set("DELEIMPORTECONS", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTECONS"), 2));
            descelab.set("DELEIMPORTEUSD", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTEUSD"), 2));

            // Recalcula el precio del elaborado
            descelab.set("DELEPRECIO", Common.redondea(descelab.data.DELEIMPORTE / descelab.data.DELECANT, 2));
            descelab.set("DELEPRECIOUMB", Common.redondea(descelab.data.DELEIMPORTELOC / descelab.data.DELECANTUMB, 2));
            descelab.set("DELEPRECIOLOC", Common.redondea(descelab.data.DELEIMPORTELOC / descelab.data.DELECANTUMB, 2));
            descelab.set("DELEPRECIOCONS", Common.redondea(descelab.data.DELEIMPORTECONS / descelab.data.DELECANTUMB, 2));
            descelab.set("DELEPRECIOUSD", Common.redondea(descelab.data.DELEIMPORTEUSD / descelab.data.DELECANTUMB, 2));

        }

        this.actualizaPrecios();
    },

    onvaluecommitedCantidadLinDet: function (field, newValue, oldValue, record) {
        var cantporrac = newValue;
        record.set("DELDCANTUMB", newValue);
        record.set("DELDIMPORTE", Common.redondea(record.get("DELDPRECIO") * cantporrac, 2));
        record.set("DELDIMPORTELOC", Common.redondea(record.get("DELDPRECIOLOC") * cantporrac, 2));
        record.set("DELDIMPORTECONS", Common.redondea(record.get("DELDPRECIOCONS") * cantporrac, 2));
        record.set("DELDIMPORTEUSD", Common.redondea(record.get("DELDPRECIOUSD") * cantporrac, 2));

        var desclin = this.stoDescargosLin.findRecord("SERVCODI", record.get("SERVCODI"), null, null, null, false);

        // Recalcula los importes del descargo
        desclin.set("DELNIMPORTE", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTE"), 2));
        desclin.set("DELNIMPORTELOC", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTELOC"), 2));
        desclin.set("DELNIMPORTECONS", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTECONS"), 2));
        desclin.set("DELNIMPORTEUSD", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTEUSD"), 2));

        // Recalcula el precio del descargo
        desclin.set("DELNPRECIO", Common.redondea(desclin.data.DELNIMPORTE / desclin.data.DELNCANT, 5));
        desclin.set("DELNPRECIOUMB", Common.redondea(desclin.data.DELNIMPORTELOC / desclin.data.DELNCANTUMB, 5));
        desclin.set("DELNPRECIOLOC", Common.redondea(desclin.data.DELNIMPORTELOC / desclin.data.DELNCANTUMB, 5));
        desclin.set("DELNPRECIOCONS", Common.redondea(desclin.data.DELNIMPORTECONS / desclin.data.DELNCANTUMB, 5));
        desclin.set("DELNPRECIOUSD", Common.redondea(desclin.data.DELNIMPORTEUSD / desclin.data.DELNCANTUMB, 5));

        var descelab = this.stoElaboradosLin.findRecord("SERVCODI", record.get("SERVCODI"), null, null, null, false);

        if (descelab != null) {

            // Recalcula los importes del elaborado
            descelab.set("DELEIMPORTE", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTE"), 2));
            descelab.set("DELEIMPORTELOC", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTELOC"), 2));
            descelab.set("DELEIMPORTECONS", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTECONS"), 2));
            descelab.set("DELEIMPORTEUSD", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTEUSD"), 2));

            // Recalcula el precio del elaborado
            descelab.set("DELEPRECIO", Common.redondea(descelab.data.DELEIMPORTE / descelab.data.DELECANT, 5));
            descelab.set("DELEPRECIOUMB", Common.redondea(descelab.data.DELEIMPORTELOC / descelab.data.DELECANTUMB, 5));
            descelab.set("DELEPRECIOLOC", Common.redondea(descelab.data.DELEIMPORTELOC / descelab.data.DELECANTUMB, 5));
            descelab.set("DELEPRECIOCONS", Common.redondea(descelab.data.DELEIMPORTECONS / descelab.data.DELECANTUMB, 5));
            descelab.set("DELEPRECIOUSD", Common.redondea(descelab.data.DELEIMPORTEUSD / descelab.data.DELECANTUMB, 5));

        }

        this.actualizaPrecios();
    },

    onvaluecommitedCantidadLinElaborado: function (field, newValue, oldValue, record) {
        var cantporrac = newValue;
        var cantfactor = oldValue / record.get("DELECANTUMB");

        // Mantener los importes y recalcular el precio resultado de dividir el importe entre la cantidad.
        record.set("DELECANTUMB", newValue / cantfactor);
        record.set("DELEPRECIO", Common.redondea(record.get("DELEIMPORTE") / cantporrac, 5));
        record.set("DELEPRECIOUMB", Common.redondea(record.get("DELEIMPORTELOC") / cantporrac, 5));
        record.set("DELEPRECIOLOC", Common.redondea(record.get("DELEIMPORTELOC") / cantporrac, 5));
        record.set("DELEPRECIOCONS", Common.redondea(record.get("DELEIMPORTECONS") / cantporrac, 5));
        record.set("DELEPRECIOUSD", Common.redondea(record.get("DELEIMPORTEUSD") / cantporrac, 5));
    },

    onitemdblclickArtic: function (row) {
        this.seeDetailsArt(row.get("ARTICODI"));
    },

    onclickContextMenuEliminar: function () {
        var plato = this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection();
        var registros = this.stoDescargosLinDet.queryBy(function (record) { return record.get("SERVCODI") === plato.get("SERVCODI"); });
        this.stoDescargosLinDet.remove(
            registros.items ? registros.items : []
        );
        var registrosElab = this.stoElaboradosLin.queryBy(function (record) { return record.get("SERVCODI") === plato.get("SERVCODI"); });
        this.stoElaboradosLin.remove(
            registrosElab.items ? registrosElab.items : []
        );
        this.stoDescargosLin.remove(plato);
        this.actualizaPrecios();
    },

    onclickContextMenuEliminarLinDes: function () {
        var articulo = this.vtnDescargosLin.panels.descargosLinDetGrid.listGrid.getSelection();
        var desclin = this.stoDescargosLin.findRecord("SERVCODI", articulo.get("SERVCODI"), null, null, null, false);
        this.stoDescargosLinDet.remove(articulo);
        desclin.set("DELNIMPORTE", this.stoDescargosLinDet.sum("DELDIMPORTE"));
        desclin.set("DELNIMPORTELOC", this.stoDescargosLinDet.sum("DELDIMPORTELOC"));
        desclin.set("DELNIMPORTECONS", this.stoDescargosLinDet.sum("DELDIMPORTECONS"));
        desclin.set("DELNIMPORTEUSD", this.stoDescargosLinDet.sum("DELDIMPORTEUSD"));

        var recordIndex = this.stoDescargosLin.find('SERVCODI', articulo.get("SERVCODI"));
        this.vtnDescargosLin.panels.descargosLinGrid.listGrid.tablaHTML.desplazarCursorAbsoluto(recordIndex, 1);
        this.filtraArticulosPorPlato(this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.SERVCODI, this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.DESCTIPO);

        this.actualizaPrecios();
    },


    //#endregion  ========= EVENTOS DETALLE =======

    //#region  ========= CALLS DETALLE =======
    callGetReleves: function () {
        var conn = new isf.lib.Connection("GetReleves");
        conn.addParam("p_centcodi", parseInt(this.app.centcodi))
        this.getData(conn);
    },
    //#endregion  ========= CALLS DETALLE =======

    //#region =============== ACTUALIZAR MASTER CACHE ARTICULOS ========
    actualizarCachedMastersArticulos: function (data) {
        this.loadDataToStore(data, this.stoCachedArticulosDescargos, "ARICULOSDESCARGOCACHE");
        this.stoCachedArticulosDescargos.each(
            function (articulo) {
                var index = isf.eco.CachedMasters.articulos.findExact("ARTICODI", parseInt(articulo.get('ARTICODI')));
                if (!(index !== -1)) {
                    isf.eco.CachedMasters.articulos.add(articulo);
                }
            });
    },
    //#endregion  ========= ACTUALIZAR MASTER CACHE ARTICULOS =======

    //#region =============== LOADS DETALLE ========
    loadDameDetalleDescargo: function (data) {

        this.stoTipoDescargo.add({ DESCTIPO: 1, DESCTIPONOM: this.locale.sto_descTipo_elab });
        this.stoTipoDescargo.add({ DESCTIPO: 2, DESCTIPONOM: this.locale.sto_descTipo_venta });
        this.stoTipoDescargo.add({ DESCTIPO: 3, DESCTIPONOM: this.locale.sto_descTipo_releve });

        this.actualizarCachedMastersArticulos(data);

        this.loadDataToStore(data, this.stoSelectedDesc, "DESCARGOCAB");
        this.vtnDescargosLin.panels.headerForm.loadData(this.stoSelectedDesc.getAt(0).getData());
        //this.vtnDescargosLin.panels.headerForm.loadData(data, "DESCARGOCAB");

        this.loadDataToStore(data, this.stoDescargosLin, "DESCARGOLIN");
        this.stoDescargosLin.commitChanges();
        this.loadDataToStore(data, this.stoElaboradosLin, "ELABORADOLIN");
        this.stoElaboradosLin.commitChanges();

        this.loadDataToStore(data, this.stoUnidadesConv, "DESCUNIDCONV");
        this.stoElaboradosLin.commitChanges();

        //this.stoElaboradosLin.loadRawData(data.datos.ELABORADOLIN);

        this.loadDataToStore(data, this.stoHistEventos, "DESCHISTEVENTOS");
        this.stoHistEventos.commitChanges();
        this.vtnDescargosLin.query("#histeventos")[0].tab.on('activate', this.refrescarEventos, this);

        this.loadDataToStore(data, this.stoDescargosLinDet, "DESGLOSELINDESC");

        this.isElab = this.stoSelectedDesc.data.items[0].data.DESCTIPO == 1;

        // Ocultamos el botón si es venta o elaborado
        var esElaboVent = this.isElab || this.stoSelectedDesc.data.items[0].data.DESCTIPO == 2;
        this.vtnDescargosLin.buttons.btnReleves.setVisible(!esElaboVent);

        var descOrigen = this.stoSelectedDesc.data.items[0].data.DESCORIGEN === "TPV";
        var estadoPendiente = this.stoSelectedDesc.data.items[0].data.ESTACODI == 0;
       
        if (descOrigen) {
            var a = this.vtnDescargosLin.down('#descargosLinDetGrid');
            var opciones2 = this.vtnDescargosLin.down('#descargosLinGrid').gridConfig.contextMenu.opciones;
            for (var i = 0; i < opciones2.length; i++) {
                if (opciones2[i].itemId === 'btnEliminar') {
                    opciones2.splice(i, 1);
                    break;
                }
            }
        }
        
        this.vtnDescargosLin.down('#elaboradosLinGrid').setVisible(this.isElab);

        // Siempre deshabilitar si el estado no es pendiente
        var disabled = !estadoPendiente;

        // Control de botones generales
        this.vtnDescargosLin.buttons.btnProces.setDisabled(disabled);
        this.vtnDescargosLin.buttons.btnNueva.setDisabled(disabled);
        this.vtnDescargosLin.buttons.btnReleves.setDisabled(disabled);
        this.vtnDescargosLin.buttons.btnAsignar.setDisabled(disabled);
        this.vtnDescargosLin.buttons.btnSoliAltaArt.setDisabled(disabled);
        this.vtnDescargosLin.buttons.btnAddA.setDisabled(disabled);
        this.vtnDescargosLin.buttons.btnCrearArt.setDisabled(disabled); //probar
        this.vtnDescargosLin.down('#descargosLinGrid').listGrid.setEditable(!disabled);
        this.vtnDescargosLin.down('#elaboradosLinGrid').listGrid.setEditable(!disabled);
        this.vtnDescargosLin.down('#descargosLinDetGrid').listGrid.setEditable(!disabled);

        // Botones que deben estar deshabilitados si origen es TPV (aunque esté pendiente)
        var tpvRestrict = descOrigen && estadoPendiente;
        this.vtnDescargosLin.buttons.btnNuevoP.setDisabled(tpvRestrict || disabled);

        this.onchangeMonecodi(this.vtnDescargosLin.query("#MONECODI")[0], this.vtnDescargosLin.query("#MONECODI")[0].valueModels);

        this.stoDescargosLinDet.commitChanges();

        if (this.stoDescargosLin.count() > 0) {
            this.vtnDescargosLin.panels.descargosLinGrid.listGrid.tablaHTML.desplazarCursorAbsoluto(0, 1);
            this.filtraArticulosPorPlato(this.stoDescargosLin.first().get("SERVCODI"), this.stoDescargosLin.first().get("DESCTIPO"));

            for (var cont = 0; cont < this.stoDescargosLin.count(); cont++) {

                var servcodi = this.stoDescargosLin.data.items[cont].data.SERVCODI;

                var desclin = this.stoDescargosLin.findRecord("SERVCODI", servcodi, null, null, null, false);

                // Recalcula los importes del descargo
                desclin.set("DELNIMPORTE", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTE"), 2));
                desclin.set("DELNIMPORTELOC", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTELOC"), 2));
                desclin.set("DELNIMPORTECONS", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTECONS"), 2));
                desclin.set("DELNIMPORTEUSD", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTEUSD"), 2));

                // Recalcula el precio del descargo
                desclin.set("DELNPRECIO", Common.redondea(desclin.data.DELNIMPORTE / desclin.data.DELNCANT, 5));
                desclin.set("DELNPRECIOUMB", Common.redondea(desclin.data.DELNIMPORTELOC / desclin.data.DELNCANTUMB, 5));
                desclin.set("DELNPRECIOLOC", Common.redondea(desclin.data.DELNIMPORTELOC / desclin.data.DELNCANTUMB, 5));
                desclin.set("DELNPRECIOCONS", Common.redondea(desclin.data.DELNIMPORTECONS / desclin.data.DELNCANTUMB, 5));
                desclin.set("DELNPRECIOUSD", Common.redondea(desclin.data.DELNIMPORTEUSD / desclin.data.DELNCANTUMB, 5));

                var descelab = this.stoElaboradosLin.findRecord("SERVCODI", servcodi, null, null, null, false);

                if (descelab != null) {

                    // Recalcula los importes del elaborado
                    descelab.set("DELEIMPORTE", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTE"), 2));
                    descelab.set("DELEIMPORTELOC", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTELOC"), 2));
                    descelab.set("DELEIMPORTECONS", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTECONS"), 2));
                    descelab.set("DELEIMPORTEUSD", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTEUSD"), 2));

                    // Recalcula el precio del elaborado
                    descelab.set("DELEPRECIO", Common.redondea(descelab.data.DELEIMPORTE / descelab.data.DELECANT, 5));
                    descelab.set("DELEPRECIOUMB", Common.redondea(descelab.data.DELEIMPORTELOC / descelab.data.DELECANTUMB, 5));
                    descelab.set("DELEPRECIOLOC", Common.redondea(descelab.data.DELEIMPORTELOC / descelab.data.DELECANTUMB, 5));
                    descelab.set("DELEPRECIOCONS", Common.redondea(descelab.data.DELEIMPORTECONS / descelab.data.DELECANTUMB, 5));
                    descelab.set("DELEPRECIOUSD", Common.redondea(descelab.data.DELEIMPORTEUSD / descelab.data.DELECANTUMB, 5));

                }

            }

            this.actualizaPrecios();
        }
    },

    refrescarEventos: function () {
        this.vtnDescargosLin.panels.histeventos.listGrid.store.sort('DESCEVENTOFECHA', 'DESC');
    },

    loadGuardaLineasDescargo: function (data) {
        var stock = true;
        var me = this;

        //Validación de que solo tenga un elaborado por plato.
        var platosStore = Ext.getStore('stoDescargosLin');
        var elaboradosStore = Ext.getStore('stoElaboradosLin');
        var platosConError = [];
        // Validación: cada plato debe tener exactamente un elaborado
        platosStore.each(function (plato) {
            var servicio = plato.get('SERVICODI');

            var elaborados = elaboradosStore.queryBy(function (elab) {
                return elab.get('SERVICODI') === servicio;
            });

            if (elaborados.getCount() !== 1) {
                platosConError.push(servicio);
            }
        });

        if (platosConError.length > 0) {
            isf.lib.MsgBox.showError(this, "No es posible Guardar/Procesar. Cada plato debe tener exactamente 1 elaborado. ", null);
            return; 
        }
        //Fin validación

            if (data.datos.RESULT === "1") {
                isf.lib.MsgBox.showGhostMessage(this.locale.label_informacion, this.locale.msg_platos_guardados_ok, null);
                //recargamos la grid de descargos
                this.parent.dameDescargos(this.descCodi);
                this.stoDescargosLin.commitChanges();
                this.stoDescargosLinDet.commitChanges();
                this.stoElaboradosLin.commitChanges();
                this.loadDataToStore(data, this.stoHistEventos, "DESCHISTEVENTOS");
                this.stoHistEventos.commitChanges();

                if (this.stoDescargosLin.count() > 0) {
                    var recordIndex = this.stoDescargosLin.find('SERVCODI', this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.SERVCODI);
                    this.vtnDescargosLin.panels.descargosLinGrid.listGrid.tablaHTML.desplazarCursorAbsoluto(recordIndex, 1);
                    this.filtraArticulosPorPlato(this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.SERVCODI, this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.DESCTIPO)
                }
                this.actualizaPrecios();

                (this.stoDescargosLinDet.snapshot ? this.stoDescargosLinDet.snapshot : this.stoDescargosLinDet).each(function (record) {
                    if (record.get("STOCK") < record.get("DELDCANT")) {
                        stock = true;
                        isf.lib.MsgBox.showAlert(me, me.locale.msg_no_stock, null);
                        return;
                    }
                }, this);

                if (this.localCache.get("processing") === true && stock) {
                    this.parent.validaDescargo(this.descCodi);
                }
                this.localCache.put("processing", null);
            }
            else {
                isf.lib.MsgBox.showError(this, this.locale.msg_platos_guardados_error, null);
            }


            this.vtnDescargosLin.setLoading(false);
        
    },

    loadActualizarStockPrecios: function (data) {
        var plato = this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection();
        var desclin = {};
        var linStock = 0;
        var stock = 0;
        //Indicamos que todos tienen stock, en el caso de que no lo tengan se cambiará más adelante
        (this.stoDescargosLin.snapshot ? this.stoDescargosLin.snapshot : this.stoDescargosLin).each(function (plato, id) {
            plato.set("STOCK", 1);
            plato.set("DELNIMPORTE", 0);
            plato.set("DELNIMPORTECONS", 0);
            plato.set("DELNIMPORTEUSD", 0);
            plato.set("DELNIMPORTELOC", 0);
        });

        /*
        for (var i = 0; i < data.datos.STOCKS.length; i++) {
            stock = data.datos.STOCKS[i];
            records = this.stoArticulos.queryBy(function (r) {
                return r.data.ARTICODI == data.datos.STOCKS[i].ARTICODI
            });
            for (var x = 0; x < records.items.length; x++) {
                records.items[x].set("MOLNPRECIO", stock.PRECIOMEDIO);
                records.items[x].set("MOLNPRECIOCONS", stock.PRECIOMEDIOEUR);
                records.items[x].set("MOLNPRECIOUSD", stock.PRECIOMEDIOUSD);
                records.items[x].set("MOLNPRECIOLOC", stock.PRECIOMEDIOLOC);
                records.items[x].set("STOCK", stock.STOCK);

            }
        }
        */

        (this.stoDescargosLinDet.snapshot ? this.stoDescargosLinDet.snapshot : this.stoDescargosLinDet).each(function (articulo, id) {
            linStock = 1;
            //desclin = this.stoDescargosLin.findRecord("SERVCODI", articulo.get("SERVCODI"), null, null, null, false);

            for (var i = 0; i < data.datos.STOCK.length; i++) {
                stock = data.datos.STOCK[i];

                if (stock.ARTICODI === articulo.get("ARTICODI")) {

                    articulo.set("STOCK", stock.STOCK);
                    articulo.set("DELDPRECIO", stock.PRECIOMEDIO);
                    articulo.set("DELDPRECIOUMB", stock.PRECIOMEDIOUMB);
                    articulo.set("DELDPRECIOCONS", stock.PRECIOMEDIOEUR);
                    articulo.set("DELDPRECIOUSD", stock.PRECIOMEDIOUSD);
                    articulo.set("DELDPRECIOLOC", stock.PRECIOMEDIOLOC);
                    articulo.set("DELDIMPORTE", stock.PRECIOMEDIO * articulo.get("DELDCANT"));
                    articulo.set("DELDIMPORTECONS", stock.PRECIOMEDIOEUR * articulo.get("DELDCANTUMB"));
                    articulo.set("DELDIMPORTEUSD", stock.PRECIOMEDIOUSD * articulo.get("DELDCANTUMB"));
                    articulo.set("DELDIMPORTELOC", stock.PRECIOMEDIOLOC * articulo.get("DELDCANTUMB"));
                }
            }

            /*
            //actualizamos los valores del plato
            desclin.set("DELNIMPORTE", desclin.get("DELNIMPORTE") + articulo.get("DELDIMPORTE"));
            desclin.set("DELNIMPORTECONS", desclin.get("DELNIMPORTECONS") + articulo.get("DELDIMPORTECONS"));
            desclin.set("DELNIMPORTEUSD", desclin.get("DELNIMPORTEUSD") + articulo.get("DELDIMPORTEUSD"));
            desclin.set("DELNIMPORTELOC", desclin.get("DELNIMPORTELOC") + articulo.get("DELDIMPORTELOC"));
            */

            var desclin = this.stoDescargosLin.findRecord("SERVCODI", articulo.get("SERVCODI"), null, null, null, false);

            // Recalcula los importes del descargo
            desclin.set("DELNIMPORTE", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTE"), 2));
            desclin.set("DELNIMPORTELOC", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTELOC"), 2));
            desclin.set("DELNIMPORTECONS", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTECONS"), 2));
            desclin.set("DELNIMPORTEUSD", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTEUSD"), 2));

            // Recalcula el precio del descargo
            desclin.set("DELNPRECIO", Common.redondea(desclin.data.DELNIMPORTE / desclin.data.DELNCANT, 5));
            desclin.set("DELNPRECIOUMB", Common.redondea(desclin.data.DELNIMPORTELOC / desclin.data.DELNCANTUMB, 5));
            desclin.set("DELNPRECIOLOC", Common.redondea(desclin.data.DELNIMPORTELOC / desclin.data.DELNCANTUMB, 5));
            desclin.set("DELNPRECIOCONS", Common.redondea(desclin.data.DELNIMPORTECONS / desclin.data.DELNCANTUMB, 5));
            desclin.set("DELNPRECIOUSD", Common.redondea(desclin.data.DELNIMPORTEUSD / desclin.data.DELNCANTUMB, 5));

            var descelab = this.stoElaboradosLin.findRecord("SERVCODI", articulo.get("SERVCODI"), null, null, null, false);

            if (descelab != null) {

                // Recalcula los importes del elaborado
                descelab.set("DELEIMPORTE", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTE"), 2));
                descelab.set("DELEIMPORTELOC", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTELOC"), 2));
                descelab.set("DELEIMPORTECONS", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTECONS"), 2));
                descelab.set("DELEIMPORTEUSD", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTEUSD"), 2));

                // Recalcula el precio del elaborado
                descelab.set("DELEPRECIO", Common.redondea(descelab.data.DELEIMPORTE / descelab.data.DELECANT, 5));
                descelab.set("DELEPRECIOUMB", Common.redondea(descelab.data.DELEIMPORTELOC / descelab.data.DELECANTUMB, 5));
                descelab.set("DELEPRECIOLOC", Common.redondea(descelab.data.DELEIMPORTELOC / descelab.data.DELECANTUMB, 5));
                descelab.set("DELEPRECIOCONS", Common.redondea(descelab.data.DELEIMPORTECONS / descelab.data.DELECANTUMB, 5));
                descelab.set("DELEPRECIOUSD", Common.redondea(descelab.data.DELEIMPORTEUSD / descelab.data.DELECANTUMB, 5));

            }

            // comprobamos el stock
            if (articulo.get("STOCK") < articulo.get("DELDCANT")) {
                desclin.set("STOCK", -1);
            }
        }, this);

        this.actualizaPrecios();
    },

    loadGetReleves: function (data) {
        var me = this;
        me.stoReleves.loadData(data.datos.RELEVES);
        me.createWindowSeleccionReleve();
    },
    //#endregion =============== LOADS DETALLE ==========

    //#region ============ FUNCIONES DETALLE ==========
    detalleTieneCambios: function () {
        if (
            this.stoDescargosLin.getModifiedRecords().length > 0
            || this.stoDescargosLin.getRemovedRecords().length > 0
            || this.stoDescargosLinDet.getModifiedRecords().length > 0
            || this.stoDescargosLinDet.getRemovedRecords().length > 0
            || this.stoElaboradosLin.getModifiedRecords().length > 0
            || this.stoElaboradosLin.getRemovedRecords().length > 0
        ) {
            return true;
        }
        return false;
    },

    dameDetalleDescargo: function () {
        var conn = new isf.lib.Connection("DameDetalleDescargo");
        conn.addParam("p_centcodi", this.app.centcodi);
        conn.addParam("p_desccodi", this.descCodi);
        conn.addParam("p_idiocodi", this.app.lang);
        this.getData(conn);
    },

    guardaLineasDescargo: function () {
        if (this.detalleTieneCambios()) {
            this.vtnDescargosLin.setLoading(true);
            var conn = new isf.lib.Connection("GuardaLineasDescargo");
            conn.addParam("p_centcodi", this.app.centcodi);
            conn.addParam("p_desccodi", this.descCodi);
            conn.addParamList(Ext.Array.pluck((this.stoDescargosLin.snapshot ? this.stoDescargosLin.snapshot : this.stoDescargosLin.data).items, "data"), "pl_lineasDescargo");
            conn.addParamList(Ext.Array.pluck((this.stoDescargosLinDet.snapshot ? this.stoDescargosLinDet.snapshot : this.stoDescargosLinDet.data).items, "data"), "pl_lineasDetDescargo");
            conn.addParamList(Ext.Array.pluck((this.stoElaboradosLin.snapshot ? this.stoElaboradosLin.snapshot : this.stoElaboradosLin.data).items, "data"), "pl_lineasElabDescargo");
            this.getData(conn);
        }
        else {
            isf.lib.MsgBox.showGhostMessage(this.locale.label_informacion, this.locale.msg_descargo_sin_cambios);
        }
    },

    filtraArticulosPorPlato: function (platcodi, desctipo) {
        this.stoDescargosLinDet.clearFilter();
        this.stoDescargosLinDet.filterBy(
            function (articulo, id) {
                return (articulo.get("SERVCODI") === platcodi && articulo.get("DESCTIPO") === desctipo);
            }
        );

        this.stoElaboradosLin.clearFilter();
        this.stoElaboradosLin.filterBy(
            function (articulo, id) {
                return (articulo.get("SERVCODI") === platcodi && articulo.get("DESCTIPO") === desctipo);
            }
        );

    },

    cambiaMonedaDescargo: function (columnas, grid, monecodi) {
        for (var cont in grid.columns) {
            var col = grid.columns[cont];
            switch (col.dataIndex) {
                case columnas[1]:
                    (monecodi === 1) ? grid.showColumn(cont) : grid.hideColumn(cont);
                    break;
                case columnas[2]:
                    (monecodi === 2) ? grid.showColumn(cont) : grid.hideColumn(cont);
                    break;
                case columnas[0]:
                    (monecodi !== 1 && monecodi !== 2) ? grid.showColumn(cont) : grid.hideColumn(cont);
                    break;
            }
        }
    },

    actualizaPrecios: function () {
        var monecodi = this.vtnDescargosLin.down("#MONECODI").getValue();
        var colIndex = (monecodi === 1 || monecodi === 2) ? monecodi : 0;
        var columns = ["DELNIMPORTELOC", "DELNIMPORTECONS", "DELNIMPORTEUSD"];
        this.vtnDescargosLin.down("#DESCTOTALCONS").setValue(this.stoDescargosLin.sum(columns[colIndex]));
        this.vtnDescargosLin.down("#DESCTOTALLOC").setValue(this.stoDescargosLin.sum(columns[0]));//precio local
    },

    seeDetailsArt: function (articodi) {
        var modules = this.app.moduleRegister.getKeys();
        var detalleArticulo = {};
        var conn = {};
        for (var cont = 0; cont < modules.length; cont++) {
            if (modules[cont] == "isf.eco.ArtArticuloDet" && this.app.moduleRegister.get(modules[cont]).vtnDetalleArticulo.query("#headCod")[0].getValue() == articodi) {
                return;
            }
        }

        detalleArticulo = this.app.initModule('isf.eco.ArtArticuloDet', null, null, null, this);
        detalleArticulo.vtnDetalleArticulo.setLoading(detalleArticulo.locale.msg_loading);
        detalleArticulo.vtnDetalleArticulo.down("#headCod").changeGrid(this.vtnDescargosLin.panels.descargosLinDetGrid);

        conn = new isf.lib.Connection("GetArticuloInfo", false);
        conn.addParam('p_centcodi', this.app.centcodi);
        conn.addParam('p_articodi', articodi);
        conn.addParam('p_idiocodi', this.app.centlang);
        detalleArticulo.getData(conn);
    },

    //#endregion ============ FUNCIONES DETALLE ==========

    //#endregion ========= VENTANA DETALLE ==============

    //#region ========= VENTANA SELECCION PLATOS ==============
    createWindowSeleccionPlato: function () {
        var costeCol = "";
        var me = this;
        switch (this.app.monecodi) {
            case 1:
                costeCol = "PRCAVGEUR";
                break;
            case 2:
                costeCol = "PRCAVGUSD";
                break;
            default:
                costeCol = "PRCAVGLOC";
                break;
        }

        var selector = Ext.create('isf.lib.comp.ISFSelectorField', {
            itemId: 'selectorPlatos',
            scope: this,
            store: isf.lib.Common.clonarStore(isf.eco.CachedMasters.platosCentro, function (record) {
                var linea = me.stoDescargosLin.findExact("SERVCODI", record.get("FICHA_ID"));
                return linea === -1 || linea.DESCTIPO === 2;
            }),
            multiSelect: true,
            width: 1200,
            height: 480,
            showExitButton: true,
            title: this.app.centabrev + ' - ' + this.locale.label_selector_de_platos,
            valueField: "FICHA_ID",
            columns: [
                { text: this.locale.label_familia_menu, dataIndex: "FAMEN_NOM", width: 125 },
                { text: this.locale.label_familia, dataIndex: "FAMI_NOM", width: 125 },
                { text: this.locale.label_codigo, dataIndex: "FICHA_ID", width: 80 },
                { text: this.locale.label_nombre, dataIndex: "NOMBRE", width: 500 },
                { text: this.locale.label_raciones, dataIndex: "RACIONES", width: 80, align: "right" },
                { text: this.locale.label_cantidad, dataIndex: "CANTIDAD", width: 80, align: "right" },
                { text: this.locale.label_unidad, dataIndex: "DESCUNIDAD", width: 80 },
            ]
        });
        selector.on('select', this.onSelectSelectorPlatos, this);
        selector.fireEvent("expand");
    },

    //#region  ========= EVENTOS SELECCION PLATOS ==========
    onSelectSelectorPlatos: function (element) {
        var values = element.getSubmitValue();
        var precio = 0;
        var nuevosPlatos = [];
        if (values.length > 0) {
            for (var i in values) {
                nuevosPlatos.push({
                    CENTCODI: this.app.centcodi,
                    DESCCODI: this.descCodi,
                    SERVCODI: values[i].get("FICHA_ID"),
                    DESCTIPO: 1,
                    DELNCANT: values[i].get("RACIONES"),
                    DELNCANTSTK: values[i].get("CANTIDAD")
                });
            }
            conn = new isf.lib.Connection("AnadeLineasDescargo", false);
            conn.addParam("p_centcodi", this.app.centcodi);
            conn.addParam("p_desccodi", this.descCodi);
            conn.addParam("p_idiocodi", this.app.lang);
            conn.addParamList(nuevosPlatos, "pl_lineasDescargo");
            this.vtnDescargosLin.setLoading(true);
            this.getData(conn);
        }
        else {
            isf.lib.MsgBox.showAlert(this, this.locale.msg_sel_un_plato, null);
        }
    },

    onSelectSelectorReleves: function (element) {
        var values = element.getSubmitValue();
        var precio = 0;
        var nuevosReleves = [];
        if (values.length > 0) {
            for (var i in values) {
                nuevosReleves.push({
                    CENTCODI: this.app.centcodi,
                    DESCCODI: this.descCodi,
                    DESCTIPO: 2,
                    SERVCODI: values[i].get("RELEVE_ID"),
                    DELNCANT: values[i].get('NUMERO_PAX'),
                    DELNCANTSTK: null
                });
            }
            conn = new isf.lib.Connection("AnadeReleves", false);
            conn.addParam("p_centcodi", this.app.centcodi);
            conn.addParam("p_desccodi", this.descCodi);
            conn.addParam("p_idiocodi", this.app.lang);
            conn.addParamList(nuevosReleves, "pl_lineasDescargo");
            this.vtnDescargosLin.setLoading(true);
            this.getData(conn);
        }
        else {
            isf.lib.MsgBox.showAlert(this, this.locale.msg_sel_un_plato, null);
        }
    },

    onAsignar: function () {
        if (!this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection()) {
            isf.lib.MsgBox.showAlert(this, this.locale.msg_no_plates, null);
        } else {
            this.app.initModule('isf.eco.BusquedaAvanzadaArtPlato', null, {
                articodi: this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.SERVCODI,
                artidesc: Renderers.rendererDescargosLineas(this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.SERVCODI, null, this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection()),
                inlnform: this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.DESCUNIDAD,
                scope: this
            }, null, this);
        }
    },

    reloadAfterMapped: function () {
        var me = this;
        me.anadeElaborado();
    },

    anadeElaborado: function () {
        var conn = new isf.lib.Connection("AnadeElaborado");
        conn.addParam("p_centcodi", this.app.centcodi);
        conn.addParam("p_desccodi", this.descCodi);
        conn.addParam("p_servcodi", this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.SERVCODI);
        conn.addParam("p_desctipo", this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.DESCTIPO);
        this.vtnDescargosLin.setLoading(true);
        this.getData(conn);
    },

    loadAnadeElaborado: function (data) {
        var me = this;
        if (data.datos.RESULT === "1") {
            me.dameDetalleDescargo();
        }
        else {
            isf.lib.MsgBox.showError(this, this.locale.msg_elaborado_guardado_error, null);
        }
        this.vtnDescargosLin.setLoading(false);
    }

    , onSoliAltaArt: function () {
        var me = this;
        var selected = me.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection();

        if (typeof (selected) === "undefined" || selected.length === 0) {
            isf.lib.MsgBox.showAlert(me, this.locale.msg_sel_un_plato, null);
            return;
        }
        var categoria = me.app.tipoEconomato === 1 ? me.app.initialConfig.global.gsv.categorias.CONTROL_COMPRAS_GLOB : me.app.initialConfig.global.gsv.categorias.CONTROL_COMPRAS_GLOB;
        var producto = me.app.tipoEconomato === 1 ? me.app.initialConfig.global.gsv.productos_emea.ARTICULOS_ELAB : me.app.initialConfig.global.gsv.productos_ames.ARTICULOS_ELAB;
        var platosCentroFiltrado = Common.clonarStore(isf.eco.CachedMasters.platosCentro, function (r) {
            return (selected.get("SERVCODI") == r.get("FICHA_ID"))
        }, null, 'MovDescargoLineas_platos');
        var platdesc = platosCentroFiltrado.data.items[0].data.NOMBRE;

        var descripcion =
            selected.get("SERVCODI")
            + " " + Renderers.rendererDescargosLineas(selected.get("SERVCODI"), null, selected)
            /*+ " " + platdesc*/
            + " " + selected.get("DESCUNIDAD");

        // formateamos el Detalle.
        var detalle = "<b>" + me.locale.label_COMENTARIOS + ":</b>";
        var tablacodi = myDesktopApp.initialConfig.global.gsv.tablas.ARTICULOS;
        var tablapk = me.app.centcodi + ";" + selected.get("SERVCODI");

        var params = {
            centerId: me.app.centcodi,
            productId: producto,
            requestTitle: descripcion,
            requestDetail: detalle,
            categoryId: categoria,
            formatName: selected.get("DESCUNIDAD"),
            requestTypeId: "E",
            priorityId: 3, //prioridad media
            readOnlyFields: {
                requestor: true,
                center: false,
                priority: false,
                category: true,
                product: true,
                requestTitle: true
            },
            defaultAttachments: [],

            tablacodi: tablacodi,
            tablapk: tablapk,
            callback: function () {
                articulo.set("MAPEADO", 1);
            }
        };

        me.app.initModule('isf.gsv.components.ISFNuevaSolicitud', null, params);
    },




    onCrearArt: function () {
        var me = this;
        var selected = me.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection();

        if (!selected || selected.length === 0) {
            isf.lib.MsgBox.showAlert(me, this.locale.msg_sel_un_plato, null);
            return;
        }

        var articuloData = {
            centerId: me.app.centcodi,
            artCode: selected.get("SERVCODI"),
            artName: selected.get("SERVDESC"),
            artUnit: selected.get("DESCUNIDAD"),
            artDescription: selected.get("SERVDESC") || "",
            artTipo: selected.get("TIPOFICHA_ID")
        };

        var unidadesStore = Ext.getStore('stoUnidadesConv');
        var formatoStore = Ext.getStore('cachedFormArts');

        // Busca una coincidencia de unidad válida según tipo de ficha y abreviatura
        var unidadMatch = unidadesStore.findBy(function (rec) {
            return rec.get('TIPOFICHA_ID') === articuloData.artTipo &&
                rec.get('ABREVIATURA') === articuloData.artUnit;
        });

        // Variables para guardar datos de unidad y formato si se encuentra una coincidencia
        var selectedFormCodi = null, selectedUnidadId = null, selectedFactor = '';

        if (unidadMatch !== -1) {
            var unidadRecord = unidadesStore.getAt(unidadMatch);
            selectedFormCodi = unidadRecord.get('FORMCODI');
            selectedUnidadId = unidadRecord.get('UNIDAD_ID');
            selectedFactor = unidadRecord.get('FACTOR');
        }

        var formNuevoArticuloConfig = {
            xtype: "isfform",
            itemId: "nuevoArticulo",
            items: [
                { xtype: 'textfield', name: 'centcodi', hidden: true, value: articuloData.centerId },
                { xtype: 'textfield', name: 'artDesc', fieldLabel: this.locale.label_nombre, value: 'SUB REC ' + articuloData.artName, allowBlank: false },
                { xtype: 'fieldset', title: 'Compra', defaults: { anchor: '100%' },
                    items: [
                        { xtype: 'combobox',
                        itemId: 'formCompCompra',
                        name: 'formComp',
                        fieldLabel: this.locale.selectorArt_colum_formato,
                        displayField: 'FORMDESC',
                        valueField: 'FORMCODI',
                            store: Common.clonarStore(formatoStore, function (rec) {
                                return ['KILO', 'LITRO'].includes(rec.get('FORMDESC'));
                            }, 'FormArt')
,
                        value: selectedFormCodi,
                        queryMode: 'local',
                        forceSelection: true,
                        editable: false,
                        allowBlank: false,
                            listeners: {
                            // Cuando se selecciona un nuevo formato
                            select: function (combo, records) {
                                var newFormCodi = records[0].get('FORMCODI');
                                var unidadCombo = Ext.ComponentQuery.query('#formCompElab')[0];
                                var factorField = Ext.ComponentQuery.query('textfield[name=factor]')[0];
                                var globalStore = Ext.getStore('stoUnidadesConv');

                                // Filtra las unidades según el nuevo formato y tipo de ficha
                                var filteredData = globalStore.getRange().filter(function (rec) {
                                    return rec.get('FORMCODI') === newFormCodi &&
                                        rec.get('TIPOFICHA_ID') === articuloData.artTipo;
                                });

                                // Crea nuevo store temporal para el combo de unidades para no filtrar el global
                                unidadCombo.bindStore(Ext.create('Ext.data.Store', {
                                    model: globalStore.getModel ? globalStore.getModel() : 'UnidadConv',
                                    data: filteredData
                                }));

                                // Buscar si la unidad original sigue siendo válida
                                var matchUnidad = filteredData.find(function (rec) {
                                    return rec.get('ABREVIATURA') === articuloData.artUnit;
                                });

                                if (matchUnidad) {
                                    unidadCombo.setValue(matchUnidad.get('UNIDAD_ID'));
                                    factorField.setValue(matchUnidad.get('FACTOR'));
                                } else {
                                    unidadCombo.reset();
                                    factorField.setValue('');
                                }
                            }
                        }
                    }]
                },
                {
                    xtype: 'fieldset', title: this.locale.selector_col_formato +" " + this.locale.label_platos_elaborado, defaults: { anchor: '100%' },
                    items: [
                        {
                            xtype: 'combobox',
                            itemId: 'formCompElab',
                            name: 'unidadElab',
                            fieldLabel: this.locale.label_unidad,
                            displayField: 'NOMBRE',
                            valueField: 'UNIDAD_ID',
                            store: Common.clonarStore(unidadesStore, function (rec) {
                                return rec.get('TIPOFICHA_ID') === articuloData.artTipo &&
                                    rec.get('FORMCODI') === selectedFormCodi;
                            }, 'DescUnidConv'),
                            value: selectedUnidadId,
                            queryMode: 'local',
                            forceSelection: true,
                            editable: false,
                            allowBlank: false,
                            listeners: {
                                select: function (combo, records) {
                                    var factorField = Ext.ComponentQuery.query('textfield[name=factor]')[0];
                                    factorField.setValue(records[0].get('FACTOR'));
                                }
                            }
                        },
                        { xtype: 'textfield', name: 'factor', fieldLabel: this.locale.selector_col_formato, allowBlank: false, value: selectedFactor }
                    ]
                },
                { xtype: 'textfield', name: 'artCode', hidden: true, value: articuloData.artCode }
            ],
            toolbar: [
                { xtype: "button", text: this.locale.label_guardar, itemId: "btnGuardarDescargo", icon: "./lib/isf/img/ISF_grabar.png", handler: this.onClickGuardarNuevoArticulo, scope: this },
                { xtype: "button", text: this.locale.label_salir, itemId: "btnSalirDescargo", icon: "./lib/isf/img/ISF_Salir.png", handler: function () { this.vtnNuevoArticulo.close(); }, scope: this }
            ]
        };

        this.vtnNuevoArticulo = this.createWindow("vtnNuevoArticulo", {
            title: 'Nuevo Artículo',
            width: 400,
            height: 350,
            items: [formNuevoArticuloConfig]
        }, "descargosGrid");
    },

    onClickGuardarNuevoArticulo: function () {

        var form = this.vtnNuevoArticulo.panels.nuevoArticulo;
        var formValues = {};

        var platosStore = Ext.getStore('stoDescargosLin');
        var elaboradosStore = Ext.getStore('stoElaboradosLin');

        var platosConError = [];

        // Validación: cada plato debe tener exactamente un elaborado
        platosStore.each(function (plato) {
            var servicio = plato.get('SERVICODI');

            var elaborados = elaboradosStore.queryBy(function (elab) {
                return elab.get('SERVICODI') === servicio;
            });

            if (elaborados.getCount() !== 1) {
                platosConError.push(servicio);
            }
        });

        if (this.stoElaboradosLin.count() != 0) {
            isf.lib.MsgBox.showError(this, "No es posible Crear Artículo. Solo 1 elaborado por plato.", null);
            return; // No continuar si hay errores
        }

        // Si pasa la validación, continuamos con el guardado
        if (form.getForm().isValid()) {
            formValues = form.getValues();

            conn = new isf.lib.Connection("GuardarFichaArticulo");
            conn.addParam("p_artidesc", formValues.artDesc);
            conn.addParam("p_formcodi", formValues.formComp);
            conn.addParam("p_userid", this.app.userInfo.userId);
            conn.addParam("p_unidcodi", formValues.unidadElab);
            conn.addParam("p_unidfactor", formValues.factor);
            conn.addParam("p_centcodi", formValues.centcodi);
            conn.addParam("p_servcodi", formValues.artCode);

            this.getData(conn);
           
        } else {
            isf.lib.MsgBox.showAlert(this, this.locale.msg_campos_obligatorios, null);
        }
    },
  
    loadGuardarFichaArticulo: function (data) {
        if (data.datos && data.datos.RESULTADO) {
            const resultado = data.datos.RESULTADO;

            if (data.datos.RESULTADO === "1") {
                isf.lib.MsgBox.showGhostMessage(this.locale.label_informacion, "Artículo guardado correctamente", null);

            } else if (resultado.startsWith("0:")) {
                isf.lib.MsgBox.showError(this, "Error al guardar artículo:\n" + resultado.substring(2), null);
            } else {
                isf.lib.MsgBox.showError(this, "Respuesta inesperada del servidor:\n" + resultado, null);
            }

        } else {
            isf.lib.MsgBox.showError(this, "No se recibió respuesta válida del servidor", null);
            console.warn("Respuesta inesperada:", data);
        }
    },


    // Abre la pantalla de añadir artículos
    abrirListaArticulos: function () {
        var me = this;
        var selector = Ext.create('isf.lib.comp.ISFSelectorField', {
            itemId: 'selectorArticulos',
            scope: this,
            store: Common.clonarStore(isf.eco.CachedMasters.articulos, function (record) {
                return record.get("BAJA") == 0;
            }, null, 'MovDescargoLineas_articulos_4'),
            multiSelect: true,
            width: 800,
            showExitButton: true,
            fieldLabel: this.locale.fldLbl_articulos,
            emptyText: this.locale.fldLbl_articulos,
            columns: [
                { text: this.locale.selector_col_grupo, dataIndex: 'GRUPABREV', width: 50 }
                , { text: this.locale.selector_col_familia, dataIndex: 'FAMIDESC', width: 110 }
                , { text: this.locale.selector_col_subfamilia, dataIndex: 'SBFMDESC', width: 110 }
                , { text: this.locale.selector_col_codigo, dataIndex: 'ARTICODI', width: 60, renderer: Renderers.rendRightAlign, align: 'right' }
                , { text: this.locale.selector_col_articulo, dataIndex: 'ARTIDESC', width: 200 }
                , { text: this.locale.selector_col_tipo, dataIndex: 'TPGRCODI', width: 35, store: Common.clonarStore(isf.eco.CachedMasters.tipoGrupos, null, null, 'MovDescargoLineas_tipoGrupos_2'), displayCol: 'TPGRABREV', codeCol: 'TPGRCODI', renderer: Renderers.rendTipo }
                , { text: this.locale.selector_col_formato, dataIndex: 'FORMCODI', store: isf.eco.CachedMasters.articuloFormatos, displayCol: 'FORMDESC', codeCol: 'FORMCODI', width: 120 }
            ]
        });

        selector.on('select', this.addSelectedArticulos, this);
        selector.fireEvent("expand", this);

        //reseteamos la selección anterior
        selector.grid.marcarTodos(false);
    },

    addSelectedArticulos: function (selector) {
        this.vtnDescargosLin.setLoading(true);

        var articulosReg = selector.getSubmitValue(),
            articulosArray = articulosReg.length != 0 ? Ext.Array.pluck(articulosReg, 'data') : null;

        if (!articulosArray) return;
        var articulosArrayCloned = Ext.Array.clone(articulosArray);

        if (articulosArrayCloned.length == 0) return;

        this.stoDescargosLinDetTMP.loadData(articulosArrayCloned, true);

        let descargoSel = this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection(),
            centcodi = this.app.centcodi,
            desccodi = this.descCodi,
            desctipo = descargoSel ? descargoSel.data.DESCTIPO : null,
            servcodi = descargoSel ? descargoSel.data.SERVCODI : null;

        if (!servcodi || !desctipo) {
            isf.lib.MsgBox.showAlert(this, this.locale.msg_no_plates, null);
            this.vtnDescargosLin.setLoading(false);
            return;
        }

        var conn = new isf.lib.Connection("AnadeDescargosLinDetTMP");
        conn.addParam("p_centcodi", centcodi);
        conn.addParam("p_desccodi", desccodi);
        conn.addParam("p_servcodi", servcodi);
        conn.addParam("p_desctipo", desctipo);
        conn.addParam("p_idiocodi", this.app.lang);
        var lineasDescargosLinDetArray = Ext.Array.pluck((this.stoDescargosLinDetTMP.snapshot ? this.stoDescargosLinDetTMP.snapshot : this.stoDescargosLinDetTMP.data).items, "data");
        Ext.Array.each(lineasDescargosLinDetArray, function (name, index) {
            lineasDescargosLinDetArray[index].CENTCODI = centcodi;
            lineasDescargosLinDetArray[index].DESCCODI = desccodi;
            lineasDescargosLinDetArray[index].SERVCODI = servcodi;
            lineasDescargosLinDetArray[index].DESCTIPO = desctipo;
        });
        conn.addParamList(lineasDescargosLinDetArray, "pl_lineasDetDescargoNew");
        conn.addParamList(Ext.Array.pluck((this.stoDescargosLinDet.snapshot ? this.stoDescargosLinDet.snapshot : this.stoDescargosLinDet.data).items, "data"), "pl_lineasDetDescargo");

        this.stoDescargosLinDetTMP.removeAll();
        this.getData(conn);
    },

    loadAnadeDescargosLinDetTMP: function (data) {
        if (data.datos.RESULT === "1") {
            this.actualizarCachedMastersArticulos(data);
            this.loadDataToStore(data, this.stoDescargosLinDet, "DESGLOSELINDESC");
            this.stoDescargosLinDet.commitChanges();
            this.filtraArticulosPorPlato(this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.SERVCODI, this.vtnDescargosLin.panels.descargosLinGrid.listGrid.getSelection().data.DESCTIPO);
            this.actualizaPrecios();
        }
        else {
            isf.lib.MsgBox.showError(this, this.locale.msg_articulos_guardados_error, null);
        }
        this.vtnDescargosLin.setLoading(false);
    },


    //#endregion  ========= EVENTOS SELECCION PLATOS ==========


    loadAnadeLineasDescargo: function (data) {
        if (data.datos.RESULT === "1") {
            isf.lib.MsgBox.showGhostMessage(this.locale.label_informacion, this.locale.msg_platos_guardados_ok, null);
            this.actualizarCachedMastersArticulos(data);
            this.stoDescargosLin.add(data.datos.DESCARGOSLIN);
            this.stoDescargosLin.commitChanges();
            this.stoDescargosLinDet.add(data.datos.DESGLOSELINDESC);
            this.stoElaboradosLin.add(data.datos.ELABORADOLIN);
            this.loadDataToStore(data, this.stoHistEventos, "DESCHISTEVENTOS");
            this.stoHistEventos.commitChanges();

            this.vtnDescargosLin.panels.descargosLinGrid.listGrid.tablaHTML.desplazarCursorAbsoluto(0, 1);
            this.filtraArticulosPorPlato(this.stoDescargosLin.first().get("SERVCODI"), this.stoDescargosLin.first().get("DESCTIPO"));
            this.actualizaPrecios();
            //recargamos la grid de descargos
            this.parent.dameDescargos(this.descCodi);
        }
        else {
            isf.lib.MsgBox.showError(this, this.locale.msg_platos_guardados_error, null);
        }

        this.vtnDescargosLin.setLoading(false);
    },

    loadAnadeReleves: function (data) {
        if (data.datos.RESULT === "1") {
            isf.lib.MsgBox.showGhostMessage(this.locale.label_informacion, this.locale.msg_releves_guardados_ok, null);
            this.actualizarCachedMastersArticulos(data);
            this.stoDescargosLin.add(data.datos.DESCARGOSLIN);
            this.stoDescargosLin.commitChanges();
            this.stoDescargosLinDet.add(data.datos.DESGLOSELINDESC);
            this.loadDataToStore(data, this.stoHistEventos, "DESCHISTEVENTOS");
            this.stoHistEventos.commitChanges();

            this.vtnDescargosLin.panels.descargosLinGrid.listGrid.tablaHTML.desplazarCursorAbsoluto(0, 1);
            this.filtraArticulosPorPlato(this.stoDescargosLin.first().get("SERVCODI"), this.stoDescargosLin.first().get("DESCTIPO"));
            this.actualizaPrecios();
            //recargamos la grid de descargos
            this.parent.dameDescargos(this.descCodi);
        }
        else {
            isf.lib.MsgBox.showError(this, this.locale.msg_releves_guardados_error, null);
        }
        this.vtnDescargosLin.setLoading(false);
    },
    //#endregion ========= VENTANA SELECCION PLATOS ==============


    //#region ========= VENTANA SELECCION RELEVE ==============
    createWindowSeleccionReleve: function () {
        var selector = Ext.create('isf.lib.comp.ISFSelectorField', {
            itemId: 'selectorReleve',
            scope: this,
            store: this.stoReleves,
            multiSelect: true,
            width: 520,
            height: 480,
            showExitButton: true,
            title: this.app.centabrev + ' - ' + this.locale.label_selector_de_releve,
            valueField: "RELEVE_ID",
            columns: [
                { text: this.locale.grid_releves_nombre, dataIndex: "NOMBRE", width: 160 },
                { text: this.locale.grid_releves_fecha_servicio, width: 100, dataIndex: "FECHA_SERVICIO", align: 'right', renderer: Ext.util.Format.dateRenderer('d/m/Y') },
                { text: this.locale.grid_releves_servicio, width: 100, dataIndex: "SERVICIO" },
                { text: this.locale.grid_releves_pax, width: 60, dataIndex: "NUMERO_PAX", align: 'right', summaryType: 'sum' },
            ]
        });
        selector.on('select', this.onSelectSelectorReleves, this);
        selector.fireEvent("expand");
    },
    ////#endregion ========= VENTANA SELECCION RELEVE ==============

    rendBlueBlackSegunArticodi: function (value, metadata, record, rowIndex, colIndex) {
        return "<span style='color: " + (record.data.ARTICODI < 0 ? "blue" : "black") + "'>" + value + "</span>";
    }

});