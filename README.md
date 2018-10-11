# **unified-queryparams**

Dependency-less http methods for pure nodejs. The motive for this project was for have a simple logger with elastic search without depending on any driver o special software.

**How to install**
----------
```shell
npm install --save unified-queryparams
```

# **QueryParams**

Abstract class meant to be used as a super class for specific queryparam implementations

**Options**
----------

- **skip:** Number. Used for pagination. Defines how many documents of the result query must be skipped before returing the objects.
- **limit:** Number. Used for pagination. Defines how many documents can fit in the result set.
- **fields:** String. Used for projection. Defines which fields of the objects must be returned. Useful for optimizing queries.
- **defaultOperator:** String. Elastic Search Exclusive. Defines how consecutive filters should be interpreted. Values: "AND", "OR". Default: "AND".
- **sort:** String. Used for sorting.
- **filter:** String. Used for filtering the query.

**fields Sintax**
----------
`<field> <field> ...`

**sort Sintax**
----------
`<field>:<direction> <field>:<direction>  <field>:<direction> ...`


**filter Sintax**
The sintax is very similar to elastic search. There are 3 types of filters:

- Text Search: `<field> <field>`
- Equality Search:  `<field>:value`
- Operator Search: `<field>:<operator><value>` (SUPPORTED OPERATORS: >, >=, <, <=, ==, !=)

**Examples:** 

- "foo fighter bar"
- "foo:fighter"
- "foo:>=fighter"


**Methods**
----------

- **get filterRegExp():** Obtains the Regular Expression used to parse the filter parameter.

- **get sortRegExp():** Obtains the Regular Expression used to parse the sort parameter.

- **get defaultOperatorRegExp():** Obtains the Regular Expression used to parse the defaultOperator parameter.

- **getSkip():** Obtains and parses the skip parameter into the appropiate query format.

- **getLimit():** Obtains and parses the limit parameter into the appropiate query format.

- **getFields():** Obtains and parses the fields parameter into the appropiate query format.

- **getDefaultOperator():** Obtains and parses the defaultOperator parameter into the appropiate query format.