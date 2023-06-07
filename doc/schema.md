# Structure for RDB schema declaration

Default name: `./etc/teqfw.schema.json`.

## Top level entries

```json
{
  "entity": {},
  "package": {},
  "refs": {},
  "namespace": "teq"
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
      "type": "binary|boolean|datetime|enum|id|integer|json|number|ref|string|text",
      "nullable": false,
      "default": "[value]|[function]",
      "options": {
        "dateOnly": true,
        "isTiny": true,
        "length": 32,
        "precision": 10,
        "scale": 2,
        "unsigned": true,
        "values": ["values", "for", "enum", "type"]
      }
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
    "name": {"type": "primary|unique|index", "attrs": ["attr1", "attr2"]}
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
        "attrs": ["ref1", "ref2"]
      },
      "action": {"delete": "restrict|cascade", "update": "..."}
    }
  }
}
```
