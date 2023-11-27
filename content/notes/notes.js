Notes = {
	init() {
		this.tableutils = Zotero_Preferences.ZNTable;
		this.body = document.getElementById("zn-body");
		this.infotags = ["id", "key", "title", "date", "journal", "author", "creators", "itemid", "filekey"];
		this.body.focus();
	},
	
	async savesettings(settings)
	{
		var usersettings = {};
		var c = Zotero.getActiveZoteroPane().getSelectedCollection();
		this.collection = "All documents";
		this.collectionid = "all-documents";
		if(c!=undefined && c.name!=undefined)
		{
			this.collection = c.name;
			this.collectionid = c.id;
		}
		return Zotero.ZeNotes.Database.updatesetting(Notes.collectionid, Notes.collection, JSON.stringify(settings));
	},
	
	async getsettings()
	{
		var usersettings = {};
		var c = Zotero.getActiveZoteroPane().getSelectedCollection();
		this.collection = "All documents";
		this.collectionid = "all-documents";
		if(c!=undefined && c.name!=undefined)
		{
			this.collection = c.name;
			this.collectionid = c.id;
		}
		
        try {
			var dbdata = await Zotero.ZeNotes.Database.getsetting(this.collectionid);
			usersettings = JSON.parse(dbdata);
		}
		catch(e){
			var dbdata = await Zotero.ZeNotes.Data.get();
			usersettings = {
				hidden: [],
				order: dbdata["info_columns"].concat(dbdata["selected_tags"]),
				sort: dbdata["info_columns"].concat(dbdata["selected_tags"]),
				reverse:[],
			}
		}
		return usersettings;
	},
	
	async insertcolumn(source, destination) {
		if(source.toLowerCase()==destination.toLowerCase())
		{
			return;
		}
		var settings = await Notes.getsettings();
		var order = settings["order"];
		order = Zotero.ZeNotes.Utils.array_move(order, source, destination);
		settings["order"] = order;
		Notes.savesettings(settings).then(r=>{
			Zotero.ZeNotes.Ui.reload();
		});
	},
	
	async loaddata ()
    {
		var notes = await Zotero.ZeNotes.Data.get();
		var usersettings = await this.getsettings();
		var columns = notes["info_columns"].concat(notes["selected_tags"]);
		columns = this.tableutils.removehiddenandsort(columns, usersettings);
		
		var width = Zotero.ZeNotes.Prefs.get("column-width");
		
		var widths = usersettings["width"];
				
		// Only "tagged_items" instead of "selected_items"
		var items = notes["tagged_items"];
		items = items.sort(this.tableutils.custommultiplesortfunc(usersettings));

		var table = document.createElement("table");
        var trh = document.createElement("tr");
        table.id = "notes-table"
        table.appendChild(trh);
		
		table.style.tableLayout = "fixed";

        columns.forEach(c=>{
            var tdh = document.createElement("th");
            Notes.innerHTML(tdh, c);
            tdh.className = "context-menu-header draggable-header";
			tdh.setAttribute("draggable", "true");
            tdh.dataset.column = c;
			tdh.style.minWidth = width+"px";
			tdh.style.userSelect = "none";
            trh.appendChild(tdh);
			
			tdh.addEventListener("dragstart", function(e){
				e.dataTransfer.setData('text/plain', e.target.dataset.column);
			})
			
			tdh.addEventListener("dragover", function(e){
				e.preventDefault();
			})
			
			tdh.addEventListener("drop", function(e){
				var source = e.dataTransfer.getData("text/plain");
				var destination = e.target.dataset.column;
				Notes.insertcolumn(source, destination);
			})
			
			if(Object.keys(widths).includes(c))
			{
				if(widths[c]!="")
				{
					tdh.style.minWidth = widths[c]+"px";
				}
			}
        });
				
        items.forEach(v=>{
            
			var tr = document.createElement("tr");
            table.appendChild(tr);
            columns.forEach(c=>{
                let td = document.createElement("td");
				tr.appendChild(td);
				
                if(c in v){
					
					try {
						Notes.innerHTML(td, v[c]);
					}
					catch(e)
					{
						alert(e+"=>"+c+": "+v[c]+" : ");
					}
                }
                
                if(Notes.infotags.includes(c))
                {
                    td.dataset.type = "info";
                    td.className = "context-menu-two info";
                }
                else
                {
                    td.dataset.type = "tag";
                    td.className = "context-menu-one tag";
                }
                
                var span = td.querySelector(".notekey");
                
                if(span)
                {
                    td.dataset.notekey = span.innerText;
                    span.parentNode.removeChild(span);
                }
                else
                {
                    td.dataset.notekey = "";
                }
                
                td.dataset.column = c;
                td.dataset.itemid = v.itemid;
                td.dataset.itemkey = v.key;
                td.dataset.filenames = JSON.stringify(v.filenames);
                td.dataset.filekey = v.filekey;

                td.querySelectorAll(".annotation").forEach(a=>{
                    a.addEventListener("mouseover", function(e){
                        e.target.parentNode.dataset.attachmentid = e.target.dataset.attachmentid;
                        e.target.parentNode.dataset.attachmentkey = e.target.dataset.attachmentkey;
                        e.target.parentNode.dataset.annotationpage = e.target.dataset.annotationpage;
                        e.target.parentNode.dataset.annotationkey = e.target.dataset.annotationkey;
                        e.target.parentNode.dataset.annotationdomid = e.target.id;
                    });
                });
				td.style.minWidth = width+"px";
				if(Object.keys(widths).includes(c))
				{
					if(widths[c]!="")
					{
						td.style.minWidth = widths[c]+"px";
					}
				}
                
            });
        }); 
        document.getElementById("zn-body").appendChild(table);
    },
	innerHTML(elt, txt)
	{
		if (Zotero.platformMajorVersion >= 102) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(txt, "text/html").body;
			html = new XMLSerializer().serializeToString(doc);
		}
		else {
			const parser = Components.classes['@mozilla.org/xmlextras/domparser;1'].createInstance(Components.interfaces.nsIDOMParser);
			var doc = parser.parseFromString(txt, 'text/html').documentElement;
			html = new XMLSerializer().serializeToString(doc);
		}
		elt.innerHTML = html;
	}
}

window.addEventListener("load", function(){
	Notes.init();
	Notes.loaddata();
})