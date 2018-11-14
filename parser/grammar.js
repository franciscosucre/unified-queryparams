// Generated automatically by nearley, version 2.15.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "EXPRESSION", "symbols": ["EXPRESSION", "_", "CONNECTOR", "_", "EXPRESSION"], "postprocess": function(d) { return { [d[2]] : [d[0], d[4]] } }},
    {"name": "EXPRESSION$ebnf$1", "symbols": ["_"], "postprocess": id},
    {"name": "EXPRESSION$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "EXPRESSION$ebnf$2", "symbols": ["_"], "postprocess": id},
    {"name": "EXPRESSION$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "EXPRESSION", "symbols": [{"literal":"("}, "EXPRESSION$ebnf$1", "EXPRESSION", "EXPRESSION$ebnf$2", {"literal":")"}], "postprocess": function(d) {return d[2]}},
    {"name": "EXPRESSION", "symbols": ["KEY", "OPERATOR", "VALUE"], "postprocess":  function(d) { 
        	const [key, operator, value] = d
        	if (operator != ':') return { [key]: { [operator]: value } }
            else return { [key]: value }
        } },
    {"name": "EXPRESSION", "symbols": ["KEY"], "postprocess": function(d) {return {$text:{$search: d[0] }}}},
    {"name": "CONNECTOR$string$1", "symbols": [{"literal":"O"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "CONNECTOR", "symbols": ["CONNECTOR$string$1"], "postprocess": function() { return "$or" }},
    {"name": "CONNECTOR$string$2", "symbols": [{"literal":"A"}, {"literal":"N"}, {"literal":"D"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "CONNECTOR", "symbols": ["CONNECTOR$string$2"], "postprocess": function() { return "$and" }},
    {"name": "OPERATOR$string$1", "symbols": [{"literal":":"}, {"literal":"="}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OPERATOR", "symbols": ["OPERATOR$string$1"], "postprocess": function() { return "$eq" }},
    {"name": "OPERATOR$string$2", "symbols": [{"literal":":"}, {"literal":"!"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OPERATOR", "symbols": ["OPERATOR$string$2"], "postprocess": function() { return "$neq" }},
    {"name": "OPERATOR$string$3", "symbols": [{"literal":":"}, {"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OPERATOR", "symbols": ["OPERATOR$string$3"], "postprocess": function() { return "$gte" }},
    {"name": "OPERATOR$string$4", "symbols": [{"literal":":"}, {"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OPERATOR", "symbols": ["OPERATOR$string$4"], "postprocess": function() { return "$lte" }},
    {"name": "OPERATOR$string$5", "symbols": [{"literal":":"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OPERATOR", "symbols": ["OPERATOR$string$5"], "postprocess": function() { return "$gt" }},
    {"name": "OPERATOR$string$6", "symbols": [{"literal":":"}, {"literal":"<"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "OPERATOR", "symbols": ["OPERATOR$string$6"], "postprocess": function() { return "$lt" }},
    {"name": "OPERATOR", "symbols": [{"literal":":"}]},
    {"name": "KEY$ebnf$1", "symbols": [/[0-9a-zA-Z_$\-.]/]},
    {"name": "KEY$ebnf$1", "symbols": ["KEY$ebnf$1", /[0-9a-zA-Z_$\-.]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "KEY", "symbols": ["KEY$ebnf$1"], "postprocess": function(d) {return d[0].join("")}},
    {"name": "VALUE$ebnf$1", "symbols": [/[a-zA-Z0-9@.\-:_]/]},
    {"name": "VALUE$ebnf$1", "symbols": ["VALUE$ebnf$1", /[a-zA-Z0-9@.\-:_]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "VALUE", "symbols": ["VALUE$ebnf$1"], "postprocess":  function(d) {
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
        } },
    {"name": "_$ebnf$1", "symbols": [{"literal":" "}]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", {"literal":" "}], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]}
]
  , ParserStart: "EXPRESSION"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
