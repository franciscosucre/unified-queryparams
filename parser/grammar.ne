EXPRESSION -> EXPRESSION _ CONNECTOR _ EXPRESSION {% function(d) { return { [d[2]] : [d[0], d[4]] } } %}
	| "(" _:? EXPRESSION _:? ")" {% function(d) {return d[2]} %}
	| KEY OPERATOR VALUE {% function(d) { 
	const [key, operator, value] = d
	if (operator != ':') return { [key]: { [operator]: value } }
    else return { [key]: value }
} %}
	| KEY {% function(d) {return {$text:{$search: d[0] }}} %}

CONNECTOR -> "OR" {% function() { return "$or" } %}
	| "AND" {% function() { return "$and" } %}

OPERATOR -> ":==" {% function() { return "$eq" } %}
	| ":!=" {% function() { return "$neq" } %}
    | ":>=" {% function() { return "$gte" } %}
    | ":<=" {% function() { return "$lte" } %}
    | ":>" {% function() { return "$gt" } %}
    | ":<" {% function() { return "$lt" } %}
    | ":"

KEY -> [0-9a-zA-Z_$\-.]:+ {% function(d) {return d[0].join("")} %}

VALUE -> [a-zA-Z0-9@.\-:_]:+ {% function(d) {
	const value = d[0].join("")
	const isNumber = !isNaN(parseFloat(value)),
    isDate = isNaN(value) && !isNaN(Date.parse(new Date(value))),
    isBoolean = value == "true" || value == "false";
	
    if (isDate) {
    	return new Date(value);
    } else if (isNumber) {
    	return parseFloat(value);
    } else if (isBoolean) {
    	return value == "true" ? true : false;
    } else {
    	return new RegExp(value, "i");
    }
} %}

_ -> " ":+
