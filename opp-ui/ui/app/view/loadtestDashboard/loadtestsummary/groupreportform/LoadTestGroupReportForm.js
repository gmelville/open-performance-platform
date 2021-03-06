Ext.define('OppUI.view.loadtestDashboard.loadtestsummary.groupreportform.LoadTestGroupReportForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.loadtestgroupreportform',

    requires: [
        'OppUI.view.loadtestDashboard.loadtestsummary.groupreportform.LoadTestGroupReportFormController',
        'OppUI.view.loadtestDashboard.loadtestsummary.groupreportform.LoadTestGroupReportFormModel',
        'OppUI.store.loadtestDashboard.SampleGroupReportData'
    ],

    controller: 'loadtestgroupreportform',
    viewModel: {
        type: 'loadtestgroupreportform'
    },
    width: 600,
    bodyPadding: 5,
    resizable: true,
    fieldDefaults: { anchor: '100%' },
    layout: {
        type: 'vbox',
        align: 'stretch' // Child items are stretched to full width
    },
    items: [{
            xtype: 'container',
            items: [{
                xtype: 'textfield',
                itemId: 'groupReportName',
                fieldLabel: 'Name',
                labelWidth: 50,
                width: 400,
                name: 'report-name',
                padding: 10
            }]
        },
        {
            xtype: 'panel',
            header: false,
            items: [
                { xtype: 'groupreportfilter' }
            ]
        },
        {
            xtype: 'fieldcontainer',
            fieldDefaults: { padding: 5 },
            items: [{
                    xtype: 'button',
                    itemId: 'btnShowGroupedSampleData',
                    padding: 5,
                    text: 'Show Sample Data',
                    margin: '5 5 5 0',
                    listeners: {
                        click: 'showSampleData'
                    }
                },
                {
                    xtype: 'button',
                    text: 'Create Report',
                    itemId: "btnCreateGroupedReport",
                    padding: 5,
                    margin: '5 5 5 0',
                    listeners: {
                        click: 'createReport'
                    }
                }
            ]
        },
        {
            xtype: 'grid',
            height: 'auto',
            title: 'Sample Results',
            store: {
                type: 'samplegroupreportdata'
            },
            columnLines: true,
            columns: [
                { text: 'TestId', dataIndex: "loadTestId", hidden: true, flex: 1 },
                { text: 'Test Name', dataIndex: "testName", flex: 1 },
                { text: 'Sub Name', dataIndex: "testSubName", hidden: true, flex: 1 },
                { text: 'Application', dataIndex: "appUnderTest", flex: 1 },
                { text: 'App Version', dataIndex: "appUnderTestVersion", hidden: true, flex: 1 },
                { text: 'Comments', dataIndex: "comments", hidden: true, flex: 1 },
                { text: 'Description', dataIndex: "description", hidden: true, flex: 1 },
                { text: 'Environment', dataIndex: "environment", flex: 1 },
                {
                    text: 'Start Time',
                    dataIndex: "startTime",
                    renderer: function(v) {
                        return Ext.Date.format(new Date(v * 1000), 'm/d/Y H:i a')
                    },
                    flex: 1
                },
                { text: 'Test Tool', dataIndex: "testTool", hidden: true, flex: 1 },
                { text: 'Tool Version', dataIndex: "testToolVersion", hidden: true, flex: 1 },
                { text: '# Users', dataIndex: "vuserCount", flex: 1 }
            ],

            listeners: {
                afterrender: 'populateSampleGrid'
            }
        }
    ]
});