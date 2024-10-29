var { OS } = ChromeUtils.importESModule("chrome://zotero/content/osfile.mjs");
var { FilePicker } = ChromeUtils.importESModule('chrome://zotero/content/modules/filePicker.mjs');

Io = {
	async savedialog(title, filter, extension, defaultstring, contents)
	{
		let fp = new FilePicker();
		fp.init(window, title, fp.modeSave);
		fp.appendFilter(filter, extension);
		fp.defaultString = defaultstring;
		var rv = await fp.show();
		if(rv == fp.returnOK || rv == fp.returnReplace) 
		{
			let outputFile = fp.file;
			Zotero.File.putContentsAsync(outputFile, contents);
		}
	},
	async loaddialog(title, filter, extension, defaultstring)
	{
		let fp = new FilePicker();
		fp.init(window, title, fp.modeOpen);
		fp.appendFilter(filter, extension);
		fp.defaultString = defaultstring;
		var rv = await fp.show();
		if(rv == fp.returnOK) 
		{
			let outputFile = fp.file;
			return await Zotero.File.getContentsAsync("file:///"+outputFile);
		}
	}
}