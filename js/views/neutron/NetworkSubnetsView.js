var NetworkSubnetsView = Backbone.View.extend({

    _template: _.itemplate($('#networkSubnetsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        var self = this;
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.model.fetch({success: function() {
            self.renderFirst();
        }});
    },

    getMainButtons: function() {
        return [{
            label: "Create Subnet",
            action: "create"
        }];
    },

    getDropdownButtons: function() {
        var self = this;
        var oneSelected = function(size, id) {
            if (size === 1) {
                return true;
            }
        };
        var groupSelected = function(size, id) {
            if (size >= 1) {
                return true;
            }
        };
        return [{
            label: "Edit Subnet",
            action: "update",
            activatePattern: oneSelected
        }, {
            label: "Delete Subnets",
            action: "delete",
            warn: true,
            activatePattern: groupSelected
        }];
    },

    getHeaders: function() {
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "Name of the subnet",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Network Address",
            tooltip: "IP address of this subnet",
            size: "25%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "IP Version",
            tooltip: "IP protocol version (Ipv4 or IPv6)",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Gateway IP",
            tooltip: "IP address of the gateway",
            size: "15",
            hidden_phone: true,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var network_id = this.model.id;
        var subnets = this.options.subnets.models;       
        var entries = [];        
        for (var index in subnets) {
            var subnet = subnets[index];
            var subnet_id = subnet.get("id");
            var subnet_name = subnet_id.slice(0,8);
            if (network_id == subnet.attributes.network_id){
            var entry = {
                    id: subnet.get("id"),
                    cells: [{
                        value: subnet.attributes.name === "" ? "("+subnet_name+")" : subnet.attributes.name,
                        link: "#neutron/networks/subnets/" + subnet.id
                    }, {
                        value: subnet.attributes.cidr
                    }, {  
                        value: subnet.attributes.ip_version == "4" ? "IPv4" : "IPv6"  
                    },  {  
                        value: subnet.attributes.gateway_ip
                    }]
                };
                entries.push(entry);
            }
        }
        return entries;
    },

    onAction: function(action, subnetIDs) {
        var subnet, snet, subview;
        var self = this;
        if (subnetIDs.length === 1) {
            snet = subnetIDs[0];
            subnets = this.options.subnets.models;
            for (index in subnets) {
                if (subnets[index].id == snet) {
                    s_net = subnets[index];
                } 
            }
        }
        switch (action) {
            case 'create':
                subview = new CreateSubnetView({
                    el: 'body',
                    model: this.model
                });
                subview.render();
                break;
            case 'update':
                //subview = new EditSubnetView({
                //    el: 'body',
                //    model: s_net
                //});
                //subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Confirm Delete Subnet",
                    btn_message: "Delete Subnet",
                    onAccept: function() {
                        subnetIDs.forEach(function(subnet) {
                            cont = self.model.get(container);
                            if (sub.get("count") > 0) {
                                console.log(sub);
                                var subview2 = new MessagesView({   
                                    state: "Error",
                                    title: "Unable to delete subnet " + sub.get("id")
                                });
                                subview2.render();
                                return;
                            } else {
                                sub.destroy();

                                var subview3 = new MessagesView({
                                    state: "Success",
                                    title: "Subnet " + sub.get("id") + " deleted."
                                });
                                subview3.render();
                            }
                        });
                    }
                });
                subview.render();
                break;
        }
    },

    renderFirst: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template, {
            model: this.model, subnets: this.options.subnets
        });
        this.tableView = new TableView({
            model: this.model,
            subnets: this.options.subnets,
            el: '#subnets',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this
        });
        this.tableView.render();
    },

    render: function() {
        if ($(this.el).html() !== null  && this.tableView !== undefined) {
            this.tableView.render();
        }
        return this;
    }
});