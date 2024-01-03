Utils = {
	tohex(d)
    {
        var hex = "0123456789ABCDEF";
        return hex.charAt((d - d % 16)/16) + hex.charAt(d % 16)
    },
	
	addopacity(v, opacity)
	{
		var r = v;
		var isrgb = v.includes("rgb(");
		var isrgba = v.includes("rgba(");
		var ishex = v.includes("#");
		if(isrgba)
		{
			r = v.substring(0, v.lastIndexOf(","))+", "+(opacity/255).toFixed(1)+")";
		}
		else if(ishex)
		{
			r = v.substring(0, 7)+""+Utils.tohex(opacity);
		}
		else if(isrgb)
		{
			r = v.replace(")", ", "+(opacity/255).toFixed(1)+")");
			r = r.replace("rgb(", "rgba(");
		}
		return r;
	},
	
	rgba2hex(rgba)
	{
		m = rgba.replace("rgba(", "").replace(")", "").replace(" ", "").split(",");
	},
	
	escapeXml(unsafe) 
	{
		return unsafe.replace(/[<>&'"]/g, function (c) {
			switch (c) {
				case '<': return '&lt;';
				case '>': return '&gt;';
				case '&': return '&amp;';
				case '\'': return '&apos;';
				case '"': return '&quot;';
			}
		});
	},
	
	array_index(arr, value)
	{
		var index = -1;
		arr.some(function(elt, i){
			if(value.toLowerCase()===elt.toLowerCase())
			{
				index=i;
				return true;
			}
		})
		return index;
	},
	
	array_move(arr, source, destination)
	{
		var sindex = Utils.array_index(arr, source);
		var dindex = Utils.array_index(arr, destination);
		
		if(dindex==-1)
		{
			if(sindex==-1)
			{
				arr.push(source);
			}
			arr.push(destination);
		}
		else
		{
			if(sindex==-1)
			{
				arr.push(source);
			}
			
			sindex = Utils.array_index(arr, source);
			dindex = Utils.array_index(arr, destination);
			
			if(dindex>=arr.length)
			{
				var k = dindex - arr.length + 1;
				while(k--)
				{
					arr.push(undefined);
				}
			}
			arr.splice(dindex, 0, arr.splice(sindex, 1)[0]);
		}
		return arr;
	},
	displayjson(json) {
		if (typeof json != 'string') {
			 json = JSON.stringify(json, undefined, 2);
		}
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			var cls = 'json-number';
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = 'json-key';
				} else {
					cls = 'json-string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'json-boolean';
			} else if (/null/.test(match)) {
				cls = 'json-null';
			}
			return '<span class="' + cls + '">' + match + '</span>';
		});
		
		json = json.split("\n").join("<br/>").split("  ").join("&#160;&#160;");
		return json;
	}
}