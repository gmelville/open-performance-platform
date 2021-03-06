Ext.define('OppUI.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    listen: {
        controller: {
            '*': {
                // We delegate all changes of router history to this controller by firing
                // the "changeroute" event from other controllers.
                changeroute: 'changeRoute',

                unmatchedroute: 'onRouteChange'
            }
        }
    },

    routes: {
        ':node': 'onRouteChange',

        ':node/:params' : {
            action: 'onNavigateDeep',
            before: 'beforeNavigateDeep',
            conditions: {
                ':params': '([0-9a-zA-Z\%\.\+\:\_\,\?\&=\-]+)'
            }
        }
    },

    lastView: null,
    config: {
        views: ['dashboard', 'ux', 'loadtest', 'applicationmapping']
    },

    setCurrentView: function(hashTag) {
        var me = this,
            refs = me.getReferences(),
            mainCard = refs.mainCardPanel,
            mainLayout = mainCard.getLayout(),
            navigationList = refs.navigationTreeList,
            store = navigationList.getStore(),
            node = store.findNode('routeId', hashTag.split('/')[0]) ||
                    store.findNode('routeId', hashTag.split('?')[0]) ||
                    store.findNode('viewType', hashTag.split('/')[0]) ||
                    store.findNode('viewType', hashTag.split('?')[0]),
            view = (node && node.get('viewType')) || 'page404',
            lastView = me.lastView,
            existingItem = mainCard.child('component[routeId=' + view + ']'),
            newView,
            activeState,
            isNavigating = this.getViews().indexOf(hashTag) >= 0;

        // Kill any previously routed window
        if (lastView && lastView.isWindow) {
            lastView.destroy();
        }

        lastView = mainLayout.getActiveItem();

        if (!existingItem) {
            newView = Ext.create({
                xtype: view,
                routeId: view,
                hideMode: 'offsets'
            });
        }

        if (!newView || !newView.isWindow) {
            // !newView means we have an existing view, but if the newView isWindow
            // we don't add it to the card layout.
            if (existingItem) {
                // We don't have a newView, so activate the existing view.
                if (existingItem !== lastView) {
                    mainLayout.setActiveItem(existingItem);
                }
                newView = existingItem;
            } else {
                // newView is set (did not exist already), so add it and make it the
                // activeItem.
                Ext.suspendLayouts();
                mainLayout.setActiveItem(mainCard.add(newView));
                Ext.resumeLayouts(true);
            }
        }

        navigationList.setSelection(node);

        if (newView.isFocusable(true)) {
            newView.focus();
        }

        activeState = newView.getActiveState();

        if(isNavigating) {
            if(activeState) {
                this.redirectTo(activeState);
            } else {
                newView.setActiveState(hashTag);
            }
        } else {            
            newView.setActiveState(hashTag);
        }
        

        me.lastView = newView;
    },

    onNavigationTreeSelectionChange: function(tree, node) {
        var to = node && (node.get('routeId') || node.get('viewType'));

        if (to) {
            // if (to.substring(0, 1) !== '!') {
            //     to = '!' + to;
            // }
            this.redirectTo(to);
        }
    },

    onToggleNavigationSize: function() {
        var me = this,
            refs = me.getReferences(),
            navigationList = refs.navigationTreeList,
            wrapContainer = refs.mainContainerWrap,
            collapsing = !navigationList.getMicro(),
            new_width = collapsing ? 64 : 250;

        if (Ext.isIE9m || !Ext.os.is.Desktop) {
            Ext.suspendLayouts();

            refs.oppLogo.setWidth(new_width);

            navigationList.setWidth(new_width);
            navigationList.setMicro(collapsing);

            Ext.resumeLayouts(); // do not flush the layout here...

            // No animation for IE9 or lower...
            wrapContainer.layout.animatePolicy = wrapContainer.layout.animate = null;
            wrapContainer.updateLayout(); // ... since this will flush them
        } else {
            if (!collapsing) {
                // If we are leaving micro mode (expanding), we do that first so that the
                // text of the items in the navlist will be revealed by the animation.
                navigationList.setMicro(false);
            }

            // Start this layout first since it does not require a layout
            refs.oppLogo.animate({ dynamic: true, to: { width: new_width } });

            // Directly adjust the width config and then run the main wrap container layout
            // as the root layout (it and its chidren). This will cause the adjusted size to
            // be flushed to the element and animate to that new size.
            navigationList.width = new_width;
            wrapContainer.updateLayout({ isRoot: true });
            navigationList.el.addCls('nav-tree-animating');

            // We need to switch to micro mode on the navlist *after* the animation (this
            // allows the "sweep" to leave the item text in place until it is no longer
            // visible.
            if (collapsing) {
                navigationList.on({
                    afterlayoutanimation: function() {
                        navigationList.setMicro(true);
                        navigationList.el.removeCls('nav-tree-animating');
                    },
                    single: true
                });
            }
        }
    },

    onMainViewRender: function() {
        if (!window.location.hash) {
            this.redirectTo("dashboard");
        }
    },

    onRouteChange: function(id) {
        this.setCurrentView(id);
    },

    onSearchRouteChange: function() {
        this.setCurrentView('searchresults');
    },

    onSwitchToModern: function() {
        Ext.Msg.confirm('Switch to Modern', 'Are you sure you want to switch toolkits?',
            this.onSwitchToModernConfirmed, this);
    },

    onSwitchToModernConfirmed: function(choice) {
        if (choice === 'yes') {
            var s = location.search;

            // Strip "?classic" or "&classic" with optionally more "&foo" tokens
            // following and ensure we don't start with "?".
            s = s.replace(/(^\?|&)classic($|&)/, '').replace(/^\?/, '');

            // Add "?modern&" before the remaining tokens and strip & if there are
            // none.
            location.search = ('?modern&' + s).replace(/&$/, '');
        }
    },

    onEmailRouteChange: function() {
        this.setCurrentView('email');
    },

    changeRoute: function (controller, route) {
        this.redirectTo(route);
    },

    beforeNavigateDeep: function(node, queryParams, action) {
        this.setCurrentView(node+'/'+queryParams);

        action.resume();

    },

    onNavigateDeep: function(node, queryParams) {
        var me = this,
            refs = me.getReferences(),
            mainCard = refs.mainCardPanel,
            mainLayout = mainCard.getLayout(),
            activeView;

        activeView = mainLayout.getActiveItem();

        activeView.processQueryParams(queryParams.slice(1));
    }
});