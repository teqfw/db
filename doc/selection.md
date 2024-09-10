# The structure of selection DTO

See `TeqFw_Db_Shared_Dto_List_Selection` module.

```js
class Dto {
    /** @type {Object} */
    filter;
    /** @type {TeqFw_Db_Shared_Dto_Order.Dto[]} */
    orderBy;
    /** @type {number} */
    rowsLimit;
    /** @type {number} */
    rowsOffset;
}
```

## filter

The filter is a hierarchy of conditions and functions.

```js
const value = '[ string | number | bool ]'; // the value is a constant used in a function
```

```js
const alias = 'string'; // the alias is a "column" in a list query and also used in a function
```

```js
const func = {
    name: 'EQ', // name of the function from the acceptable functions set [ EQ | GTE | GT | LTE | LT | NEQ | LIKE | NOT_LIKE | ILIKE | NOT_ILIKE | IN | NOT_IN | ... ] 
    params: [{/*[alias|value|func]*/}, {/*[alias|value|func]*/}, /* ... */] // any number of arguments for the function
};
```

```js
const cond = {
    with: '[ OR | AND | XOR | NOT ]', // for "NOT" only one entry is acceptable in entries array
    items: [/* cond or func */],
};
```

```js
const filter = { /* "cond" or "func" */};
```

The sample:

```json
{
  "filter": {
    "with": "AND",
    "entries": [
      {
        "name": "GTE",
        "params": [{"alias": "user_id"}, {"value": 0}]
      },
      {
        "name": "LTE",
        "params": [{"alias": "user_id"}, {"value": 100}]
      },
      {
        "with": "OR",
        "entries": [
          {
            "name": "EQ",
            "params": [{"alias": "name"}, {"value": "user1"}]
          },
          {
            "name": "EQ",
            "params": [{"alias": "name"}, {"value": "user2"}]
          }
        ]
      }
    ]
  }
}
```

```sql
SELECT * FROM users WHERE (user_id >= 0) AND (user_id < 100) AND ((name = 'user1') OR (name = 'user2'));
```