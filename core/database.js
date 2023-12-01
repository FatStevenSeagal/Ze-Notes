Database = 
{
    async create(){
		var sql1 = "CREATE TABLE IF NOT EXISTS `default` (id INTEGER PRIMARY KEY, collectionid TEXT UNIQUE, label TEXT, contents TEXT)";
		var sql2 = "CREATE TABLE IF NOT EXISTS `settings` (id INTEGER PRIMARY KEY, collectionid TEXT UNIQUE, label TEXT, contents TEXT)";
		return this.exec(sql1).then(()=>{
			Promise.resolve(Database.exec(sql2));
		});
	},
	
	async execget(q, values){
		var DB = new Zotero.DBConnection("zenotes");
		return DB.queryAsync(q, values).then(r=>{
			DB.closeDatabase();
			var data = [];
			for(i in r){
				data.push({
					"label": r[i].label,
					"contents": r[i].contents,
					"collectionid": r[i].collectionid,
				});
			}
			return Promise.resolve(data);
		}).catch(e=>{DB.closeDatabase(); return Promise.resolve("error")});
	},
	
	async exec(q, values, columns=null){
		var DB = new Zotero.DBConnection("zenotes");
		return DB.queryAsync(q, values).then(r=>{
			DB.closeDatabase();
			return Promise.resolve(r[0].contents);
		}).catch(e=>{DB.closeDatabase()});
	},
	
    async addsetting(collectionid, label, contents)
    {
		var q = "INSERT OR IGNORE INTO `default`(collectionid, label, contents) VALUES(?, ?, ?)";
		var values = [collectionid, label, contents];
		return this.exec(q, values).then(()=>{
			Database.updatesetting(collectionid, label, contents);
		});
    },
	
    updatesetting(collectionid, label, contents)
    {
		var q = "UPDATE `default` SET label=?, contents=? WHERE collectionid=?";
		var values = [label, contents, collectionid];
		this.exec(q, values);
    },
	
    async updatesettingvalue(collectionid, field, value)
    {
		var q = "UPDATE `default` SET "+field+"=? WHERE collectionid=?";
		var values = [value, collectionid];
		this.exec(q, values);
    },
    
    deletesetting(collectionid)
    {
		var q = "DELETE FROM `default` WHERE collectionid=?";
		var values = [collectionid];
		this.exec(q, values);
    },

    async getsetting(collectionid, label="Default")
    {
		var q = "SELECT * FROM  `default` WHERE collectionid=?";
		var values = [collectionid];
        var r = await this.exec(q, values);
		
		if(typeof r=="undefined")
		{
			return this.adddefault(collectionid, label);
		}
		return r;
    },

    async getsettings()
    {
		var q = "SELECT * FROM  `default`";
        return this.execget(q, []);
    },
	
	async adddefault(collectionid, label)
	{
		var data = {
			hidden: [],
			order: [],
			sort: [],
			reverse: [],
			width: {},
		}
		await this.addsetting(collectionid, label, JSON.stringify(data));
		return JSON.stringify(data);
	},
	
	async hidecolumn(collectionid, label, column)
	{
		var data = await this.getsetting(collectionid);
		
		if(typeof data=="undefined")
		{
			data = await this.adddefault(collectionid, label);
		}
		
		try {
			var data = JSON.parse(data);
			data["hidden"].push(column);
			await this.updatesettingvalue(collectionid, "contents", JSON.stringify(data));
			return Promise.resolve();
		}
		catch(e)
		{
			return Promise.resolve();
		}
	},
	
	async copysettings(scollectionid, dcollectionid, label)
	{
		var q = "INSERT OR REPLACE INTO `default` (label, contents, collectionid) SELECT ?, contents, ? FROM `default` WHERE collectionid = ?"
		var values = [label, dcollectionid, scollectionid];
		return this.exec(q, values)
	}
}