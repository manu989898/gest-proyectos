Ext.define('ISF.ECO_Mobile.view.intersectionsDetail.List',
    {
        extend: 'Ext.grid.Grid',
        alias: 'widget.intersectionsdetaillist',

        requires: [
            'ISF.ECO_Mobile.store.intersectionsDetail.Item',
            'Ext.grid.Grid',
            'Ext.grid.column.Date',
            'Ext.grid.column.Text',
            'Ext.grid.column.Number',
            'Ext.grid.plugin.ViewOptions'
        ],

        hidden: false,
        width: '100%',

        store: Ext.create('ISF.ECO_Mobile.store.intersectionsDetail.Item'),

        pinHeaders: false,
        columns: [
            {
                xtype: 'checkcolumn',
                dataIndex: 'MOLNVALIDADACHECK',
                reference: 'validar',
                headerCheckbox: true,
                width: 70,
                hideable: false,
                sortable: false,
                menuDisabled: true,
                listeners: {
                    beforecheckchange: function (scope, rowIndex, checked, record, e, eOpts) {
                        if (record.get('MOLNVALIDADA')) {
                            return false;
                        }
                    },
                    beforeheadercheckchange: function (scope, checked, e, eOpts) {
                        var store = scope.getGrid().getStore();
                        if (!checked) {
                            store.each(function (record) {
                                if (!record.get('MOLNVALIDADA')) {
                                    record.set('MOLNVALIDADACHECK', false);
                                }
                            });

                            return false;
                        }
                    }
                },
                renderer: function (value) {
                    return value == 1 ? true : false;
                },
                bind: {
                    hidden: '{isAcuse}'
                }
            },
            {
                xtype: 'gridcolumn',
                width: 80,
                dataIndex: 'ARTICODI',
                align: 'right',
                localized: {
                    text: '{intersections.detail.form.artCode}'
                },
                renderer: function (value, record, dataIndex, cell) {
                    if (cell) {
                        if (record.get('OFFLINE')) {
                            cell.row.setStyle('color: orange');
                        } else {
                            cell.row.setStyle('color: black');
                        }
                    }

                    return value;
                }
            },
            {
                xtype: 'gridcolumn',
                width: 80,
                dataIndex: 'ARTIDESC',
                localized: {
                    text: '{intersections.detail.form.article}'
                }
            },
            {
                xtype: 'gridcolumn',
                width: 80,
                dataIndex: 'CANT_STK',
                localized: {
                    text: '{intersections.detail.form.quantity}'
                },
                renderer: 'renderArticleColor',
                align: 'right',
                cell: {
                    encodeHtml: false
                }
            },
            {
                xtype: 'gridcolumn',
                width: 80,
                align: 'right',
                dataIndex: 'VALECODI',
                localized: {
                    text: '{intersections.detail.form.pendingQtt}'
                },
                renderer: 'renderPendingAmmount'
            },
            {
                xtype: 'gridcolumn',
                width: 80,
                dataIndex: 'FORMCODI',
                localized: {
                    text: '{intersections.detail.form.formatStk}'
                },
                renderer: function (value, record, dataIndex, cell) {
                    var store = Ext.getStore('itemFormats');
                    var index;

                    if (store) {
                        index = store.findExact('FORMCODI', value);
                        if (index !== -1) {
                            return store.getAt(index).get('FORMDESC');
                        }
                    }

                    return value;
                }
            },
            {
                xtype: 'gridcolumn',
                width: 80,
                align: 'right',
                dataIndex: 'VALECODI',
                localized: {
                    text: '{intersections.detail.form.requestedQtt}'
                },
                renderer: 'rendererAmmounted'
            },
            {
                xtype: 'gridcolumn',
                width: 80,
                align: 'right',
                dataIndex: 'STOCK',
                localized: {
                    text: '{intersections.detail.form.stock}'
                }
            },
            {
                xtype: 'gridcolumn',
                width: 80,
                align: 'right',
                dataIndex: 'MOLNIMPORTE',
                localized: {
                    text: '{intersections.detail.form.amount}'
                },
                renderer: 'renderImport'
            },
            {
                xtype: 'gridcolumn',
                width: 85,
                align: 'right',
                dataIndex: 'MOLNPRECIO',
                localized: {
                    text: '{intersections.detail.form.price}'
                },
                renderer: 'renderPrice'
            },
            {
                localized: {
                    text: '{intersections.detail.form.offline}'
                },
                align: 'center',
                dataIndex: 'OFFLINE',
                width: 80,
                sortable: false,
                menu: false,
                hidden: true,
                renderer: function (value, record, col, cell) {
                    if (record.get('OFFLINE')) {
                        cell.setTools({
                            play: {
                                iconCls: 'x-fa fa-eraser',
                                handler: function () {
                                    this.up('intersectionsdetail').getController().onClickRemoveOffline(record);
                                }
                            }
                        });
                    } else {
                        cell.setTools({
                            play: {
                                hidden: true
                            }
                        });
                    }
                }
            }
        ],
        listeners: {
            childtap: 'onChildTap'
        },
        plugins: [
            {
                type: 'gridviewoptions'
            }
        ]
    });