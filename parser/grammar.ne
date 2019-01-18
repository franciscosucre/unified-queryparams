EXPRESSION -> EXPRESSION _ CONNECTOR _ EXPRESSION {% function(d) { return { [d[2]] : [d[0], d[4]] } } %}
	| "(" _:? EXPRESSION _:? ")" {% function(d) {return d[2]} %}
	| KEY OPERATOR VALUE {% function(d) { 
	const [key, operator, value] = d
	if (operator != ':') {
		return { [key]: { [operator]: value } }
	}
	else if (typeof value !== 'string'){
		return { [key]: value  }
	} else {
		return { [key]: new RegExp(value, 'i')  }
	}
} %}
	| KEY {% function(d) {return {$text:{$search: d[0] }}} %}

CONNECTOR -> "OR" {% function() { return "$or" } %}
	| "AND" {% function() { return "$and" } %}

OPERATOR -> ":==" {% function() { return "$eq" } %}
	| ":!=" {% function() { return "$ne" } %}
    | ":>=" {% function() { return "$gte" } %}
    | ":<=" {% function() { return "$lte" } %}
    | ":>" {% function() { return "$gt" } %}
    | ":<" {% function() { return "$lt" } %}
    | ":"

KEY -> [0-9a-zA-Z_$\-.]:+ {% function(d) {return d[0].join("")} %}

VALUE -> QUOTE [a-zA-Z0-9@.\-:_]:+ QUOTE {% function(d) { return d[1].join("") } %}
	| QUOTE [0-9]:+ QUOTE {% function(d) { return d[1].join("") } %}
	| QUOTE DATETIME QUOTE {% function(d) { return d[0].join("") } %}
	| DATETIME {% function(d) { return d[0] } %}
	| [0-9]:+ {% function(d) { return parseFloat(d[0].join(""))} %}
	| [0-9]:+ [a-zA-Z@.\-:_]:+ {% function(d) { return d[0].join("") } %}
	| [a-zA-Z@.\-:_]:+ [0-9]:+ {% function(d) { return d[0].join("") } %}
	| [a-zA-Z@.\-:_]:+ {% function(d) { return d[0].join("") } %}

DATETIME -> DATE "T" TIME "Z" {% function(d) { return new Date(d.join("")) } %}
	| DATE "T" TIME {% function(d) { return new Date(d.join("")) } %}
	| DATE {% function(d) { return new Date(d.join("")) } %}

TIME -> HOURS ":" MINUTES ":" SECONDS {% function(d) { return d.join("") } %}

DATE -> YEAR "-" MONTH "-" DAY {% function(d) { return d.join("") } %}
	
YEAR -> [1-9] [0-9] [0-9] [0-9] {% function(d) { return d.join("") } %}

MONTH -> "1" [0-2] {% function(d) { return d.join("") } %}
	| "0" [1-9] {% function(d) { return d.join("") } %}
	| [1-9] {% function(d) { return d.join("") } %}

DAY -> "3" [0-1] {% function(d) { return d.join("") } %}
	| "0" [1-9] {% function(d) { return d.join("") } %}
	| [1-2] [0-9] {% function(d) { return d.join("") } %}
	| [1-9] {% function(d) { return d.join("") } %}

HOURS -> "2" [0-3] {% function(d) { return d.join("") } %}
	| [0-1] [0-9] {% function(d) { return d.join("") } %}
	| [0-9] {% function(d) { return d.join("") } %}

MINUTES -> [0-5] [0-9] {% function(d) { return d.join("") } %}
	| [0-9] {% function(d) { return d.join("") } %}

SECONDS -> [0-5] [0-9]  {% function(d) { return d.join("") } %}
	| [0-5] [0-9] "." MILLISECONDS  {% function(d) { return d.join("") } %}
	| [0-9] "." MILLISECONDS {% function(d) { return d.join("") } %}
	| [0-9] {% function(d) { return d.join("") } %}
	
MILLISECONDS -> [0-9] [0-9] [0-9] {% function(d) { return d.join("") } %}
	| [0-9] [0-9] {% function(d) { return d.join("") } %}
	| [0-9] {% function(d) { return d.join("") } %}

QUOTE -> "'"
	| "\""

_ -> " ":+
