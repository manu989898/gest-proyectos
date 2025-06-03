Ext.define('ISF.ECO_Mobile.view.intersectionsDetail.addItem.Form', {

    extend: 'Ext.form.Panel',
    alias: 'widget.additemintersectionform',

    requires: [
        'ISF.ECO_Mobile.view.intersectionsDetail.addItem.MainController',
        'ISF.ECO_Mobile.view.intersectionsDetail.addItem.MainViewModel',
        'ISF.ECO_Mobile.view.intersectionsDetail.addItem.Header',
        'ISF.ECO_Mobile.view.itemSelector.Main',

        'Ext.Toolbar',
        'Ext.Button',
        'Ext.Label',
        'Ext.field.Container',
        'Ext.field.Number',
        'Ext.Spacer',
        'Ext.field.ComboBox',
        'Ext.field.Checkbox'
    ],

    items: [
        {
            xtype: 'containerfield',
            items: [
                {
                    xtype: 'textfield',
                    reference: 'itemId',
                    width: '47%',
                    localized: {
                        label: '{intersections.detail.addItem.form.artCode}'
                    },
                    listeners: {
                        'focusleave': 'onItemIdFocusLeave',
                        'keyup': 'onKeyUpItemId',
                        'clearicontap': 'onClearIconTap'
                    },
                    hasFocus: true,
                    required: true
                }
            ]
        },
        {
            xtype: 'combobox',
            reference: 'items',
            localized: {
                label: '{intersections.detail.addItem.form.article}'
            },
            displayField: 'ARTIDESC',
            valueField: 'ARTICODI',
            store: Ext.create('ISF.ECO_Mobile.store.intersectionsDetail.Item'),
            anyMatch: true,
            forceSelection: true,
            queryMode: 'local',
            listeners: {
                focusleave: 'onItemsFocusLeave',
                change: 'onItemsChange'
            },
            required: true
        },
        {
            xtype: 'containerfield',
            items: [
                {
                    xtype: 'textfield',
                    reference: 'cantTotal',
                    localized: {
                        label: '{intersections.detail.addItem.form.quantity}'
                    },
                    width: '47%',
                    readOnly: true,
                    listeners: {
                        change: 'onCantTotalChange'
                    }
                },
                {
                    xtype: 'spacer'
                },
                {
                    xtype: 'textfield',
                    reference: 'cantPdte',
                    localized: {
                        label: '{intersections.detail.addItem.form.pendingQtt}'
                    },
                    width: '47%',
                    readOnly: true,
                    listeners: {
                        change: 'onCantPdteChange'
                    }
                }
            ]
        },
        {
            xtype: 'containerfield',
            items: [
                {
                    xtype: 'textfield',
                    reference: 'quantity',
                    decimals: 3,
                    width: '42.5%',
                    localized: {
                        label: '{intersections.detail.addItem.form.stockQtt}'
                    },
                    listeners: {
                        keyup: 'onKeyUpQuantity',
                        change: 'onQuantityChange',
                        initialize: function (sender, eOpts) {
                            sender.element.dom.querySelector("input").setAttribute("inputMode", "numeric");
                        }
                    },
                    required: true,
                    pattern: '[0-9]*'
                },
                {
                    xtype: 'spacer'
                },
                {
                    xtype: 'textfield',
                    reference: 'format',
                    localized: {
                        label: '{intersections.detail.addItem.form.formatStk}'
                    },
                    width: '42.5%',
                    readOnly: true
                }
            ]
        },
        {
            xtype: 'containerfield',
            items: [
                {
                    xtype: 'checkbox',
                    reference: 'continue',
                    localized: {
                        label: '{intersections.detail.addItem.form.continuousCreation}'
                    },
                    labelAlign: 'right',
                    width: '47%',
                    labelMinWidth: '85%',
                    checked: true,
                    bind: {
                        label: '{getContinueLabel}'
                    }
                },
                {
                    xtype: 'spacer'
                },
                {
                    xtype: 'checkbox',
                    reference: 'validado',
                    localized: {
                        label: '{intersections.detail.addItem.form.validated}'
                    },
                    labelAlign: 'right',
                    width: '47%',
                    labelMinWidth: '85%',
                    hidden: true,
                    listeners: {
                        change: 'onChangeCheckValue'
                    }
                }
            ]
        },
        {
            xtype: 'itemselector',
            reference: 'itemselector',
            floated: true,
            hideAnimation: {
                type: 'slideOut',
                direction: 'left'
            },
            showAnimation: {
                type: 'slide',
                direction: 'right'
            }
        }
    ]
});