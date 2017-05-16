/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * The primary role of this controller is to manage routing.
 */
Ext.define('OppUI.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    routes: {
        '!:id': {
            action: 'onNavigate',
            before: 'beforeNavigate'
        },

        '!:id/:state': {
            action: 'onNavigateDeep',
            before: 'beforeNavigateDeep'
        },
        '!:id/:state/:params': {
            action: 'onDeepLink',
            conditions: {
                // for some reason I can't get | to pass this regex
                ':params': '([0-9a-zA-Z\+\:\_\,\?\&=\-]+)'
                //':params': '(.*)'
            }
            //before: 'beforeNavigateDeep'
        }
    },

    listen: {
        controller: {
            '*': {
                // We delegate all changes of router history to this controller by firing
                // the "changeroute" event from other controllers.
                changeroute: 'changeRoute',

                unmatchedroute: 'onUnmatchedRoute'
            }
        }
    },

    destroy: function () {
        Ext.destroyMembers(this, 'menu');
        this.callParent();
    },

    beforeNavigate: function (id, action) {
        var view = this.getView();
        var tab = view.getComponent(id);

        if (tab) {
            action.resume();
        } else {
            this.onBadRoute();
        }
    },

    beforeNavigateDeep: function (id, state, action) {
        var view = this.getView();
        var tab = view.getComponent(id);
        var valid;

        console.log('Before Deep Navigation');
        console.log('id: ' + id);
        console.log('state: ' + state);
        console.log('action: ' + action);
        
        if (tab.isValidState) {
            valid = tab.isValidState(state);
        }

        if (valid) {
            action.resume();
        } else {
            this.onBadRoute();
        }
    },

    changeRoute: function (controller, route) {
        // Since we parse
        if (route.substring(0, 1) !== '!') {
            route = '!' + route;
        }

        console.log("changeRoute called: " + route);

        this.redirectTo(route);
    },

    getTabRoute: function (tab) {
        console.log('getTabRoute called')
        var route = tab.xtype;

        if (tab.getActiveState) {
            route += '/' + (tab.getActiveState() || tab.getDefaultActiveState());
        }

        return route;
    },

    onBadRoute: function () {
        var app = OppUI.app.getApplication();
        this.changeRoute(this, app.getDefaultToken());
    },

    onNavigate: function (id) {
        //Ext.log('navigate: ' + id);
        var tabs = this.getView();

        var tab = tabs.setActiveTab(id);
        if (tab) {
            // if we changed active tabs...
            var route = this.getTabRoute(tab);
            if (route && route !== id) {
                this.changeRoute(this, route);
            }
        }
    },

    onNavigateDeep: function (id, state) {
        //Ext.log('navigate: ' + id + ' / ' + state);
        var tabs = this.getView();
        var tab = tabs.setActiveTab(id) || tabs.getActiveTab();

        tab.setActiveState(state);
    },

    onDeepLink: function (id, state, params) {
        console.log('DEEP LINK ===> navigate: ' + id + ' / ' + state + '/ ' + params);
        var tabs = this.getView();
        var tab = tabs.setActiveTab(id) || tabs.getActiveTab();

        //tab.setActiveState(state);
        tab.processQueryParams(params.slice(1));
        tab.setActiveState(state+'/'+params);
    },

    onTabChange: function (mainView, newTab) {
        var route = this.getTabRoute(newTab);
        this.changeRoute(this, route);
    },

    onMenuClick: function (menu, item) {
        this.getView().setActiveTab(menu.items.indexOf(item) + 1); // +1 for invisible first tab
    },

    onSwitchTool: function (e) {
        var menu = this.menu;

        if (!menu) {
            menu = this.getView().assistiveMenu;
            this.menu = menu = new Ext.menu.Menu(menu);
        }

        menu.showAt(e.getXY());
    },

    onUnmatchedRoute: function(token) {
        console.log('onUnmatchedRoute called!');
        if (token) {
            this.onBadRoute();
        }
    }
});
