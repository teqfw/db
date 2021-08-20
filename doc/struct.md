# Structure for RDB schema declaration

## Top level entries

```json
{
  "package": {
    "name": {}
  },
  "refs": {
    "name": {}
  }
}
```

## `package`

```json
{
  "package": {
    "name": {
      "comment": "",
      "entity": {},
      "package": {}
    }
  }
}
```

## `package/entity`

```json
{
  "entity": {
    "name|.": {
      "comment": "",
      "attr": {},
      "index": {},
      "relation": {}
    }
  }
}
```

## `package/entity/attr`

```json
{
  "attr": {
    "name": {
      "comment": "",
      "type": "id|ref|string|text|integer|numeric|datetime|boolean|binary|option",
      "nullable": false,
      "default": "[value]|[function]"
    }
  }
}
```

### Attribute types

#### `id` & `ref`

```json
{
  "type": "id"
}
```

```json
{
  "type": "ref"
}
```

#### `text`

```json
{
  "type": {
    "text": {
      "length": 255
    }
  }
}
```

#### `numeric`

```json
{
  "type": {
    "numeric": {
      "precision": 16,
      "scale": 4
    }
  }
}
```


### Attribute default functions

Available functions:
* `datetime`: 
  * `current`: current timestamp


## `package/entity/index`

```json
{
  "index": {
    "name": {"type": "primary|unique", "attrs": ["attr1", "attr2"]}
  }
}
```

## `package/entity/relation`

```json
{
  "relation": {
    "name": {
      "attrs": ["attr1", "attr2"],
      "ref": {
        "path": "/pack1/sub/entity",
        "attrs": ["ref1", "ref2"],
        "action": {"delete": "restrict|cascade", "update": "..."}
      }
    }
  }
}
```
