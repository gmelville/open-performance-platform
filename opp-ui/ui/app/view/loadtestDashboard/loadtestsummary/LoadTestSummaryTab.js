
Ext.define('OppUI.view.loadtestDashboard.loadtestsummary.LoadTestSummaryTab',{
    extend: 'Ext.tab.Panel',
    alias: 'widget.loadtestsummarytab',
    cls: 'loadtest-summary-tab',

    requires: [
        'OppUI.view.loadtestDashboard.loadtestsummary.LoadTestSummaryTabController',
        'OppUI.view.loadtestDashboard.loadtestsummary.LoadTestSummaryTabModel',
        'Ext.ux.TabReorderer'
    ],

    controller: 'loadtestsummarytab',
    viewModel: {
        type: 'loadtestsummarytab'
    },

    plugins: 'tabreorderer',
    height: Ext.getBody().getViewSize().height,

    items: [{
        title: 'Load Tests',
        xtype: 'loadtestsummarygrid',
        iconCls: 'x-fa fa-table',
        reorderable: false,
        closable: false
    }]
});
