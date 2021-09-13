# Structure for RDB schema declaration

## Top level entries

```json
{
  "entity": {},
  "package": {},
  "refs": {}
}
```

## `entity`

```json
{
  "entity": {
    "name": {
      "comment": "",
      "attr": {},
      "index": {},
      "relation": {}
    }
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

## `entity/attr`

```json
{
  "attr": {
    "name": {
      "comment": "",
      "type": "id|ref|string|text|number|datetime|boolean|binary|enum",
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


## `entity/index`

```json
{
  "index": {
    "name": {"type": "primary|unique", "attrs": ["attr1", "attr2"]}
  }
}
```

## `entity/relation`

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
