Ext.define('OppUI.view.loadtestDashboard.loadtestsummary.LoadTestSummaryTabController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.loadtestsummarytab',

    createTabs: function(params) {
        var tabIndex, tabGroupIndex, i, j, k, key, value, both, queryParams, 
            loadTestIds, view, loadTestReport, groupReports, groupReport, groupFilters, 
            filters, filterList, existingGroupReport, duplicateEntries = {};

        view = this.getView();

        // check if both query params are set (tabs and groupTabs).
        both = params.indexOf('&') >= 0 ? true : false;

        if(both) {
            queryParams = params.split('&');

            for(i = 0; i < queryParams.length; i++) {
                if(queryParams[i].indexOf('tab=') >= 0) {
                    // ie, tab=1234,5678
                    // the first split will split on the '=', the second
                    // split will get the loadtestids.
                    loadTestIds = queryParams[i].split('=')[1].split(',');

                    for(j = 0; j < loadTestIds.length; j++) {
                        if(duplicateEntries[loadTestIds[j]]) {
                            // user tried loading the same report
                            // so just make that report tab active.
                            view.setActiveTab(view.down('#loadtestreport-'+loadTestIds[j]));
                        } else {
                            duplicateEntries[loadTestIds[j]] = 1;
                            
                            loadTestReport = view.down('#loadtestreport-'+loadTestIds[j]);

                            if(!loadTestReport) {
                                this.createLoadTestReport(loadTestIds[j])
                            }
                        }
                    }
                } else if (queryParams[i].indexOf('groupTab=') >= 0) {
                    // it must be a groupTab query param
                    groupReports = queryParams[i].split('=')[1].split('::');

                    for(j = 0; j < groupReports.length; j++) {
                        filters = {};
                        groupReport = groupReports[j].split(':');
                        groupFilters = groupReport[1].split(',');
                        existingGroupReport = view.down('#loadtestgroupreport-' + groupReport[0]);

                        if(!existingGroupReport) {
                            for(k = 0; k < groupFilters.length; k++) {
                                filtersList = groupFilters[k].split('+');
                                filters[filtersList[0]] = filtersList[1];
                            }
                            this.createGroupReportTab(groupReport[0], filters);
                        }
                    }
                }
            }
        } else {
            tabIndex = params.indexOf('tab=');
            tabGroupIndex = params.indexOf('groupTab=');

            if(tabIndex >= 0) {
                queryParams = params.split('=');
                loadTestIds = queryParams[1].split(',');

                for(j = 0; j < loadTestIds.length; j++) {
                    if(duplicateEntries[loadTestIds[j]]) {
                        // user tried loading the same report
                        // so just make that report tab active.
                        view.setActiveTab(view.down('#loadtestreport-'+loadTestIds[j]));     
                    } else {
                        duplicateEntries[loadTestIds[j]] = 1;
                        loadTestReport = view.down('#loadtestreport-'+loadTestIds[j]);

                        if(!loadTestReport) {
                            this.createLoadTestReport(loadTestIds[j])
                        }
                    }
                }                    
            }

            if(tabGroupIndex >= 0) {
                // it must be a groupTab query param
                groupReports = params.split('=')[1].split('::');
                
                for(j = 0; j < groupReports.length; j++) {
                    filters = {};
                    groupReport = groupReports[j].split(':');
                    groupFilters = groupReport[1].split(',');
                    existingGroupReport = view.down('#loadtestgroupreport-' + groupReport[0]);

                    if(!existingGroupReport) {
                        for(i = 0; i < groupFilters.length; i++) {
                            filtersList = groupFilters[i].split('+');
                            filters[filtersList[0]] = filtersList[1];
                        }

                        this.createGroupReportTab(groupReport[0], filters);
                    }
                }
            }
        }
    },

    processAdmin: function(params) {
        var view = this.getView();
        if(params.indexOf('user=admin') >= 0) {
            view.down('#btnDelete').show();
        }
    },

    createLoadTestReport: function(loadTestId) {
        var tab, view;

        view = this.getView();

        tab = view.add({
                closable: true,
                xtype: 'loadtestreport',
                itemId: 'loadtestreport-' + loadTestId,
                iconCls: 'x-fa fa-line-chart',
                loadTestId: loadTestId,
                title: 'Test Run #' + loadTestId,
                width: Ext.getBody().getViewSize().width
            }
        );

        view.setActiveTab(tab);
    },

    createGroupReportTab: function(groupReportName, filters) {
        var tab, reportLink, queryParam, view;

        view = this.getView();
        // build the query param
        queryParam = groupReportName + ':';
        for(var prop in filters) {
            if(filters.hasOwnProperty(prop)) {
                queryParam += (prop + '+' + filters[prop] + ',')
            }
        }
        // remove the last comma.
        queryParam = queryParam.slice(0, -1);
        reportLink = window.location.origin+'/#loadtest/?groupTab='+queryParam;

        tab = view.add({
            closable: true,
            xtype: 'loadtestgroupreport',
            itemId: 'loadtestgroupreport-'+ groupReportName,
            iconCls: 'x-fa fa-line-chart',
            title: groupReportName,
            filters: filters,
            reportLink: reportLink
        });

        view.setActiveTab(tab);
    },

    createGroupReport: function(groupReport) {
        this.getView().up('loadtest')
            .getController()
            .updateUrlGroupTabState(groupReport, true);
    },

    createTab: function(grid, record, item, index) {
        this.getView().up('loadtest')
            .getController()
            .updateUrlTabState(record.getData().loadTestId, true);
    }
});
