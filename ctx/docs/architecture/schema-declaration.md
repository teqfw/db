# DEM Schema Declaration

- Path: `ctx/docs/architecture/schema-declaration.md`
- Changed: `20260726`
- Legacy Source: `doc/schema.md`

## Default Location

Each participating package may provide `etc/teqfw.schema.json`.

## Top-Level Shape

```json
{
  "entity": {},
  "package": {},
  "refs": {},
  "namespace": "teq"
}
```

`entity` contains entities at the current package level.
`package` contains recursively nested package declarations.
`refs` lists unresolved external entity paths and referenced attributes.
`namespace` is accepted in legacy fragments; the application map owns the normalized physical namespace.

## Entity

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

## Package

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

## External References

```json
{
  "refs": {
    "/ext/entity": ["id"]
  }
}
```

Every referenced path and attribute required by a relation must be resolved by the root map before physical conversion.

## Attributes

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
        "values": ["enum", "values"]
      }
    }
  }
}
```

Supported default function: `datetime.current`, meaning the current timestamp.
`id` describes an identifier column and `ref` a referenced identifier.
Text length, numeric precision/scale, integer tiny/unsigned, date-only, and enum values are expressed through `options`.

## Indexes

```json
{
  "index": {
    "name": {
      "type": "primary|unique|index",
      "attrs": ["attr1", "attr2"]
    }
  }
}
```

## Relations

```json
{
  "relation": {
    "name": {
      "attrs": ["attr1", "attr2"],
      "ref": {
        "path": "/pack1/sub/entity",
        "attrs": ["ref1", "ref2"]
      },
      "action": {
        "delete": "restrict|cascade",
        "update": "restrict|cascade"
      }
    }
  }
}
```

Local and referenced attribute arrays are positional and must have equal cardinality.
