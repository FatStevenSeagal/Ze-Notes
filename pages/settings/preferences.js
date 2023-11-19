
Zotero_Preferences.ZeNotes = {
	init(){
		this.saveloadcomplete = false;
		this.savevalues = [];
		this.tableutils = Zotero_Preferences.ZNTable;
		this.defaulthiddentags = ["Id", "itemid", "key", "filekey"];
		var includes = document.getElementsByClassName("zn-include");
		
		for (include of includes)
		{
			Zotero_Preferences.ZeNotes.readxhtml(include, include.src);
		}
		
		if(!Zotero.getMainWindow())
		{
			window.close();
		}
		
		document.getElementById("zn-refresh").addEventListener("click", function(){
			Zotero.ZeNotes.Ui.reload();
		});
	},
	
	initcolumnwidth()
	{
		var sample = document.getElementById("zn-column-width-val");
		var value = Zotero.ZeNotes.Prefs.get("column-width");
		var el = document.getElementById("zn-column-width");
		if(el!=null)
		{
			sample.value = value;
			el.value = value;
		}
	},
	
	updatecolumnwidth(e)
	{
		var sample = document.getElementById("zn-column-width-val");
		sample.value = e.target.value;
	},
	
	setcolumnwidth(e)
	{
		Zotero.ZeNotes.Prefs.set("column-width", e.target.value);
		Zotero.ZeNotes.Ui.reload();
	},

	initopacity()
	{
		var sample = document.getElementById("zn-bg-sample");
		var value = Zotero.ZeNotes.Prefs.get("bg-opacity");
		var el = document.getElementById("zn-bg-slider");
		if(el!=null)
		{
			var color = Zotero.ZeNotes.Utils.addopacity(sample.style.backgroundColor, value);
			el.value = parseInt(value);
			sample.style.backgroundColor = color;
		}
	},
	
	updateopacity(e)
	{
		var sample = document.getElementById("zn-bg-sample");
		var color = Zotero.ZeNotes.Utils.addopacity(sample.style.backgroundColor, e.target.value);
		sample.style.backgroundColor = color;
	},
	
	setopacity(e)
	{
		Zotero.ZeNotes.Prefs.set("bg-opacity", e.target.value);
	},
	
	importpref(e)
	{
		var lsettings = document.getElementById("zn-load-settings");
		var collectionid = undefined;
		if (Zotero.platformMajorVersion < 102) {			
			collectionid = lsettings.options[lsettings.selectedIndex].value;
		}
		else
		{
			collectionid = lsettings.dataset.collectionid;
		}
		
		if(typeof collectionid=="undefined")
		{
			alert("Please choose a source collection first!");
			return;
		}
		
		if(!confirm("Do you really want to overwrite current collection settings?\nThis change is irreversible!"))
		{
			return;
		}
		Zotero.ZeNotes.Database.copysettings(collectionid, this.collectionid, this.collection).then(()=>{
			alert("Collection settings imported!");
		})
	},
	
	updateprefimport(e)
	{
		var lsettings = document.getElementById("zn-load-settings");
		lsettings.value = e.target.label;
		lsettings.dataset.collectionid = e.target.value;
	},
	
	loadpreferences()
	{
		var lsettings = document.getElementById("zn-load-settings");
		
		if (Zotero.platformMajorVersion < 102)
		{
			if(lsettings.tagName.toUpperCase()!="SELECT")
			{
				var p = lsettings.parentNode.parentNode;
				lsettings.parentNode.remove();
				var sel = document.createElement("select");
				p.insertBefore(sel, p.firstChild);
				sel.setAttribute("id", "zn-load-settings");
				lsettings = sel;
				
			}
			else
			{
				lsettings.innerHTML="";
			}
		}
		
		if(lsettings==undefined)
		{
			return;
		}
				
		if(this.saveloadcomplete==true)
		{
			return;
		}
		
		this.saveloadcomplete = true;
				
		Zotero.ZeNotes.Database.getsettings().then(settings=>{
			settings = settings.sort(function(a, b) {
			   return a.label.localeCompare(b.label);
			});
			
			for(s of settings)
			{
				if(Zotero_Preferences.ZeNotes.savevalues.includes(s.label))
				{
					continue;
				}
				
				if(s.collectionid==this.collectionid)
				{
					continue;
				}
				
				if (Zotero.platformMajorVersion < 102) {
					var opt = document.createElement("option");
					opt.innerHTML = s.label;
					opt.setAttribute("label", s.label);
					opt.setAttribute("value", s.collectionid);
					lsettings.appendChild(opt);
				}
				else
				{
					var opt = document.createXULElement("menuitem");
					opt.setAttribute("label", s.label);
					opt.setAttribute("value", s.collectionid);
					lsettings.appendChild(opt);
				}
				Zotero_Preferences.ZeNotes.savevalues.push(s.label);
			}
			
		})
	},
	
	async readxhtml(include, filename)
	{
		return fetch(Zotero.ZeNotes.rootURI+"pages/settings/"+filename)
		.then(response => response.text())
		.then(content => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(content, 'application/xhtml+xml');
			const importedNode = document.importNode(doc.documentElement, true);
			include.appendChild(importedNode);
			Zotero_Preferences.ZeNotes.loadtables();
			Zotero_Preferences.ZeNotes.loadpreferences();
			Zotero_Preferences.ZeNotes.initopacity();
			Zotero_Preferences.ZeNotes.initcolumnwidth();
		})
		.catch(error => {
			alert('Error loading content: ' + error);
		});
	},
	
	loadtables(){
		// get collection first
		var c = Zotero.getActiveZoteroPane().getSelectedCollection();
		this.collection = "All documents";
		this.collectionid = "all-documents";
		if(c!=undefined && c.name!=undefined)
		{
			this.collection = c.name;
			this.collectionid = c.id;
		}
		
		var titleel = document.getElementById("zn-settings-main-title");
		if(titleel!=null)
		{
			titleel.innerHTML = "Settings for 「"+this.collection+"」";
		}
		
		var table1 = document.getElementById("table-manage-tags-body");
		var table2 = document.getElementById("table-sort-tags-body");
				
		var buttonlist1 = ["up", "down", "first", "last", "visible"];
		var buttonlist2 = ["sort", "up", "down", "first", "last"];
		if(table1!=null)
		{
			Zotero_Preferences.ZeNotes.loadtagsfromdb(table1, ["value", "type", "status", "width", "actions"], buttonlist1);
		}
		if(table2!=null)
		{
			Zotero_Preferences.ZeNotes.loadtagsfromdb(table2, ["value", "actions"], buttonlist2);
		}
	},

	async saveusersettings()
	{
		var data = {
			"hidden": Zotero_Preferences.ZNTable.getuserhiddentags(),
			"order": Zotero_Preferences.ZNTable.getusertagorder(),
			"sort": Zotero_Preferences.ZNTable.getusersortorder(),
			"reverse": Zotero_Preferences.ZNTable.getuserreverseorder(),
			"width": Zotero_Preferences.ZNTable.getusercolumnwidth()
		}
		return Zotero.ZeNotes.Database.addsetting(this.collectionid, this.collection, JSON.stringify(data));
	},
	
	saveandreload()
	{
		this.saveusersettings().then(()=>{
		});
	},
		
	async loadtagsfromdb(table, columns, buttonlist)
	{
		var tags = [];
		var hiddentags = this.defaulthiddentags;
		
		var usersettings = {
			"hidden": [],
			"order": [],
			"sort": [],
			"reverse": [],
			"width": {},
		}
		
		try {
			var dbdata = await Zotero.ZeNotes.Database.getsetting(this.collectionid);
			usersettings = JSON.parse(dbdata);
		}
		catch(e){
			console.log(e);
		}
		
		if(!Object.keys(usersettings).includes("width"))
		{
			usersettings["width"] = {};
		}
		
		if(usersettings["hidden"].length>0)
		{
			hiddentags = usersettings["hidden"];
		}

		Zotero.ZeNotes.Data.get().then(data=> {
			var width = "";
			for(t of data["selected_tags"])
			{
				let status = "visible";
				let direction = "down";
				if(hiddentags.includes(t))
				{
					status = "hidden";
				}
				
				if(usersettings["reverse"].includes(t))
				{
					direction = "up";
				}
				
				if(Object.keys(usersettings["width"]).includes(t))
				{
					width = usersettings["width"][t];
				}
				
				tags.push({
					type: "tag",
					value: t,
					status: status,
					direction: direction,
					width: "<input onchange=\"Zotero_Preferences.ZeNotes.saveusersettings();\" value=\""+width+"\" class=\"tag-width\" data-tag=\""+t+"\"/>",
					actions: this.tableutils.actions(t, status, direction, buttonlist),
				});
			}
			
			for(t of data["info_columns"])
			{
				let status = "visible";
				let direction = "down";
				if(hiddentags.includes(t))
				{
					status = "hidden";
				}
				
				if(usersettings["reverse"].includes(t))
				{
					direction = "up";
				}
				
				if(Object.keys(usersettings["width"]).includes(t))
				{
					width = usersettings["width"][t];
				}
				
				tags.push({
					type: "info",
					value: t,
					status: status,
					direction: direction,
					width: "<input onchange=\"Zotero_Preferences.ZeNotes.saveandreload();\"  value=\""+width+"\" class=\"tag-width\" />",
					actions: this.tableutils.actions(t, status, direction, buttonlist),
				});
			}
			this.tableutils.rendertags(table, tags, columns, usersettings);
		});
	}
}

/**
Refresh after losing focus
*/

this.addEventListener("focus", function() 
{
	Zotero_Preferences.ZeNotes.loadtables();
});

this.addEventListener("blur", function() 
{
	Zotero.ZeNotes.Ui.reload();
});