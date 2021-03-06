(function() {
	
	window.Repos = {
	
		/**
		 * Init
		 */
		init: function(){
			this.filter = new Filter("Repos");
		},
	
		/**
		 * Bind
		 */
		bind: {
	
			/**
			 * List
			 */
			list: function() {
				jQuery('.repo_list li.repo').each(function() {
					Repos.bind.item(jQuery(this));
				});
			},
	
			/**
			 * Item
			 * 
			 * @param DOM item to bind events to.
			 */
			item: function(item) {
				var about = item.find('.repo_about');
				var extras = item.find('.repo_extras');
				var links = extras.find('.links');
				var input = extras.find('input');
				var zip = extras.find('.zip');
				var copy = extras.find('.copy');
	
				// Bind click event to repo extras.
				about.on('click', function() {
					extras.slideToggle(225);
					about.toggleClass('opened');
				});
	
				// Bind click event to input box.
				input.on('click', function() {
					jQuery(this).select();
				});
	
				// Bind mouse events to zip button.
				zip.on('mousedown', function() {
					jQuery(this).addClass('down');
				});
				zip.on('mouseleave', function() {
					jQuery(this).removeClass('down');
				});
				zip.on('mouseup', function() {
					jQuery(this).removeClass('down');
				});
	
				// Bind click events to cloning link buttons.
				links.find('li').each(function() {
					var element = jQuery(this);
					if(element.attr('rel') != "input") {
						element.on('click', function(event) {
							element.siblings().removeClass('selected');
							element.addClass('selected');
	
							input.val(element.attr('data'));
							input.select();
							document.execCommand("copy");
							input.blur();
	
							copy.fadeIn(100).delay(500).fadeOut(100);
						});
					}
				});
			}
		},
	
		/**
		 * Display
		 */
		display: {
	
			/**
			 * Append 
			 * 
			 * @param contextId ID of context requestion display append.
			 * @param repo Repository to append to display.
			 */
			append: function(contextId, repo) {
				var list = jQuery('.repo_list');
	
				// If a list has not yet been created.
				if(list.length == 0) {
					Repos.display.list(contextId, [repo]);
				}
	
				// Append the list.
				else {
					if(repo) {
						Content.post(contextId, "Repos", function() {
							var old = list.find('li.repo[id="' + repo.id + '"]');
							var temp = list.find('li.repo:first-child');
							var html = Repos.html.item(repo);
	
							// Find insertion point.
							while(temp.length > 0 && temp.attr('pushed_at') > repo.pushed_at) {
								temp = temp.next();
							}
	
							// Insert repo.
							if(temp.length == 0 || repo.pushed_at == null) {
								list.append(html);
							}
							else {
								jQuery(html).insertBefore(temp);
							}
	
							repo = list.find('li.repo[id="' + repo.id + '"]');
	
							// Remove old DOM item if it exists.
							if(old.length > 0) {
								if(old.find('.repo_extras').is(':visible')) {
									repo.find('.repo_extras').show();
									repo.find('.repo_about').addClass('opened');
								}
								old.remove();
							}
	
							// Run item through filter and add bindings.
							Repos.filter.dom(repo);
							Repos.bind.item(repo);
						});
					}
				}
			},
			
			/**
			 * Clean
			 * 
			 * Remove deleted repositories on refresh.
			 * 
			 * @param contextId Context ID requesting clean.
			 * @param repos Full list of users repositories.
			 */
			clean: function(contextId, repos) {
				var list = jQuery('.repo_list');
				var remove = [];
				
				// Look for DOM items to remove.
				list.find('.item').each( function() {
					var item = jQuery(this);					
					for(var i = 0; i < repos.length; i++) {
						if(item.attr('id') == repos[i].id) {
							return;
						}
					}
					remove.push(item);
				});
				
				// Remove deleted repositories from the DOM.
				for(var i in remove) {
					remove[i].remove();
				}
			},
	
			/**
			 * List
			 * 
			 * @param contextId Context ID requesting display.
			 * @param repos Repositories to be displayed.
			 */
			list: function(contextId, repos) {
				Content.post(contextId, "Repos", function() {
					Content.display(Repos.html.list(repos));
					Repos.bind.list();
					Repos.filter.dom();
					Repos.filter.bind();
				});
			}
		},
	
		/**
		 * HTML
		 */
		html: {
	
			/**
			 * Item 
			 *
			 * @param repo Item to generate HTML for.
			 * @return Repo list item HTML.
			 */
			item: function(repo) {
	
				if(!repo) {
					return "";
				}
				return "<li class='item repo " + (repo['private'] ? "private" : "public") + (repo.fork ? " fork" : " source" ) + "' id='" + repo.id + "' pushed_at='" + repo.pushed_at + "' "
				     + "tags='" + repo.name + " " + repo.description + " " + (repo.fork ? repo.parent.owner.login + " " + repo.parent.name : "") + "'>"
					 + "<ul class='repo_stats'>"
					 + "<li>" + (repo.language ? repo.language : "") + "</li>"
					 + "<li class='watchers'>"
					 + "<a href='" + repo.html_url + "/watchers' target='_blank'>" + repo.watchers + "</a>"
					 + "</li>"
					 + "<li class='forks'>"
					 + "<a href='" + repo.html_url + "/network' target='_blank'>" + repo.forks + "</a>"
					 + "</li>"
					 + "</ul>"
					 + "<span class='repo_id'>"
					 + "<h3>"
					 + "<a href='" + repo.html_url + "' target='_blank'>" + repo.name + "</a>"
					 + "</h3>"
					 + (repo.fork ? "<p class='fork_flag'>"
					              + "Forked from <a href='https://github.com/" + repo.parent.owner.login + "/" + repo.parent.name + "' target='_blank'>"
					              + repo.parent.owner.login + "/" + repo.parent.name
					              + "</a></p>" : "")
					 + "</span>"
					 + "<div class='repo_extras'>"
					 + "<ul class='quick_links'>"
					 + "<li><a href='" + repo.html_url + "/branches' target='_blank'>Branches</a></li>"
					 + "<li><a href='" + repo.html_url + "/commits/master' target='_blank'>Commits</a></li>"
					 + "<li><a href='" + repo.html_url + "/issues?sort=created&direction=desc&state=open' target='_blank'>Issues</a></li>"
					 + "<li><a href='" + repo.html_url + "/pulls' target='_blank'>Pull Requests</a></li>"
					 + "<li><a href='" + repo.html_url + "/tags' target='_blank'>Tags</a></li>"
					 + ((repo.owner.id == User.logged.id) ? "<li><a href='" + repo.html_url + "/admin' target='_blank'>Admin</a></li>" : "")
					 + "</ul>"
					 + "<a class='zip' href='" + repo.html_url + "/zipball/" + ((repo.master_branch == null) ? "master" : repo.master_branch) + "' target='_blank'>ZIP</a>"
					 + "<ul class='links'>"
					 + "<li rel='ssh' data='" + repo.ssh_url + "'>SSH</li>"
					 + "<li rel='http' data='https://" + User.context.login + "@" + repo.clone_url.split("https://")[1] + "'>HTTP</li>"
					 + (repo['private'] == false ? "<li rel='git' data='" + repo.git_url + "'>Git Read-Only</li>" : "")
					 + "<li rel='input'>"
					 + "<input type='text' value='" + repo.ssh_url + "' />"
					 + "</li>"
					 + "</ul>"
					 + "<img class='copy' src='../img/clipboard.png' />"
					 + "</div>"
					 + "<div class='repo_about'>"
					 + "<p class='description'>" + repo.description + "</p>"
					 + "<p class='updated'>"
					 + ((repo.pushed_at != null) ? "Last updated <time>" + jQuery.timeago(repo.pushed_at) + "</time>" : "Never updated")
					 + "</p>"
					 + "</div>"
					 + "</li>";	
			},
	
			/**
			 * List 
			 *
			 * @param repos Repos to create HTML list for.
			 * @return Repo list in HTML.
			 */
			list: function(repos) {
				var html = Repos.filter.html();
				html += "<ul class='repo_list'>";
	
				if(repos) {
					for(var i in repos) {
						html += this.item(repos[i]);
					}
				}
	
				html += "</ul>";
				return html;
			}
		},
	
		/**
		 * Load
		 */
		load: {
	
			/**
			 * Cache 
			 *
			 * Load repos from cache.
			 * 
			 * @param context Context requesting load.
			 */
			cache: function(context) {
				var cache = Cache.load(context.id, "Repos");
	
				if(cache != null) {
					Repos.display.list(context.id, cache.data);
				}
	
				if(!cache || cache.expired) {
					Repos.load.refresh(context);
				}
			},
	
			/**
			 * GitHub 
			 *
			 * Load repos from GitHub (this will run in the background page).
			 * 
			 * @param context Context requesting repositories.
			 * @param token Users OAuth2 token.
			 */
			github: function(context, token) {
				if(context.type == "User") {
					getUserRepos([], 1);
				}
				else {
					getOrgRepos([], 1);
				}
	
				/* GitHub only returns 40 repositories per page - use recursion to retreive all
				 * repositories. When all user repositories have been retreived, GitHub returns
				 * and empty array. When all organization repositories have been retreived, GitHub
				 * returns last page again.
				 *  
				 */

				// Load repos for a user context.
				function getUserRepos(buffer, page) {
					jQuery.getJSON("https://api.github.com/user/repos", {access_token: token, page: page})
						.success(function(json) {
							if(json.length > 0) {
								getUserRepos(buffer.concat(json), ++page);
							}
							else {
								buffer = Repos.filter.data.recentlyPushed(buffer);
								getParents(buffer, 0);
							}
						});
				};
	
				// Load repos for an organization context.
				function getOrgRepos(buffer, page, last) {
					jQuery.getJSON("https://api.github.com/orgs/" + context.login + "/repos", {access_token: token, page: page})
						.success(function(json) {
							if(json.length == 0 || (last != null && json[json.length - 1].id == last.id)) {
								buffer = Repos.filter.data.recentlyPushed(buffer);
								getParents(buffer, 0);
							}
							else {
								buffer = buffer.concat(json);
								getOrgRepos(buffer, ++page, buffer[buffer.length - 1]);
							}
						});
				};
	
				// Load parent for each repo in repo set.
				function getParents(buffer, index) {
					if(index < buffer.length) {
						if(buffer[index].fork) {
							jQuery.getJSON("https://api.github.com/repos/" + context.login + "/" + buffer[index].name, {access_token: token})
								.success(function(json) {
									buffer[index] = json;
									
									Socket.postMessage({
										namespace: "Repos",
										literal: "display",
										method: "append",
										args: [context.id, json]
									});
									
									
									getParents(buffer, ++index);
								})
	
								/* 404 error is thrown when a forked org repo name has changed and 
								 * that org is trying to load its repos parents. GitHub does not
								 * show these repositories as the main org page so they will be 
								 * hidden. To display them uncomment the first block of code and
								 * comment out the second block of code below.
								 * 
								 */
								.error(function(json) {
	
									// Block 1:
									// jQuery.getJSON("https://api.github.com/repos" + buffer[index].owner.login + "/" + buffer[index].name, {access_token: token})
									//     .success(function(json) {
									//         buffer[index] = json;
									//
									//         Socket.postMessage({
									//			namespace: "Repos",
									//			literal: "display",
									//			method: "append",
									//			args: [context.id, json]
									//		});
									//
									//         getParents(buffer, ++index);
									//     });
	
									// Block 2:
									buffer.splice(index, 1);
									getParents(buffer, index);
								});	
						}
						else {
							Socket.postMessage({
								namespace: "Repos",
								literal: "display",
								method: "append",
								args: [context.id, buffer[index]]
							});
							
							getParents(buffer, ++index);
						}
					}
					else {
	
						// Account for user having no data.
						if(buffer.length == 0) {
							Socket.postMessage({
								namespace: "Repos",
								literal: "display",
								method: "append",
								args: [context.id, null]
							});
						}
						
						// Clean removed repos from display.
						Socket.postMessage({
							namespace: "Repos",
							literal: "display",
							method: "clean",
							args: [context.id, buffer]
						});
	
						Cache.save(context.id, "Repos", buffer);
						Socket.postTaskComplete();
					}
				};
			},
	
			/**
			 * Refresh 
			 *
			 * Post a task to the background page to begin loading data from GitHub.
			 *
			 * @param context Context requesting refresh.
			 */
			refresh: function(context) {
				Socket.postTask({
					namespace: "Repos",
					literal: "load",
					method: "github",
					args: [context, OAuth2.getToken()]
				});
			}
		}
	};
	
	Repos.init();
	
})();