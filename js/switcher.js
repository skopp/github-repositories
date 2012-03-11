window.App.switcher = {

	/**
	 * Initialize
	 */
	init: function() {
		this.button = jQuery('.context_switcher .context_switcher_button');
		this.close = jQuery('.context_switcher .context_switcher_panel .close');
		this.list = jQuery('.context_switcher .context_switcher_panel .organizations');
		this.overlay = jQuery('.context_switcher .overlay');
		this.panel = jQuery('.context_switcher .context_switcher_panel');
	
		this.bind();
		this.update();
	},
	
	/**
	 * Bind
	 */
	bind: function(){
		this.button.on('mousedown', function() {
			App.switcher.button.addClass('down');
		});
		this.button.on('mouseup', function() {
			App.switcher.button.removeClass('down');
		});
		this.button.on('mouseleave', function() {
			App.switcher.button.removeClass('down');
		});
	
		this.button.on('click', App.switcher.toggle.bind(this));
		this.close.on('click', App.switcher.toggle.bind(this));
		this.overlay.on('click', App.switcher.toggle.bind(this));
	},

	/**
	 * Toggle
	 */
	toggle: function() {
		if(this.panel.is(':visible')) {
			this.button.removeClass('active');
			this.panel.hide();
			this.overlay.hide();
		}
		else {
			this.button.addClass('active');
			this.panel.show();
			this.overlay.show();
		}
	},

	/**
	 * Update
	 */
	update: function() {
	
		// Add image to context switcher button.
		var html = "<img src='" + User.context.avatar_url + "' /><span>" + User.context.login + "</span>";
		this.button.html(html);

		// Add orgs to context switcher panel.
		if(User.orgs.length > 0) {
			var array = [];

			array.push(User.context);
			if(User.context.id != User.logged.id) {
				array.push(User.logged);
			}
			for(var index in User.orgs) {
				if(User.context.id != User.orgs[index].id) {
					array.push(User.orgs[index]);
				}
			}

			html = "<ul>";
			for(var i = 0; i < array.length; i++) {
				html += "<li rel='" + array[i].id + "' class='" + (i == 0 ? "selected" : "") + "'>"
				     + "<img src='" + array[i].avatar_url + "' />"
					 + "<span>" + array[i].login + "</span>";
	
				// Add repository count to panel if available.
				if(i > 0) {
					var cache = Cache.load(array[i].id, "Repos");	
	
					if(cache) {	
						html += "<span class='count'>"
						      + cache.data.length
						      + ((cache.data.length > 1) ? " repositories" : " repository")
							  + "</span>";
					}
				}
	
				html += "</li>";
			}
			html += "</ul>";
	
			this.list.html(html);

			// Create bindings for new context panel.
			this.list.find('li').each(function() {
				var element = jQuery(this);
				element.on('click', function() {
					var newId = element.attr('rel');
					if(newId && newId != User.context.id) {
						User.update(newId);
						App.navigation.update("Repos", true);
						App.switcher.toggle();
						App.switcher.update();
					}
				});
			});
		}
	}
};