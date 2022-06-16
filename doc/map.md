# Structure for project's map file

## Top level entries

```json
{
  "namespace": "teq",
  "ref": {}
}
```

## `namespace`

Prefix for tables in RDB ("teq" => `teq_`).

## `ref`

Map external references (see `refs` node in `teqfw.schema.json`) from DEM fragments to actual entities/ids:

```json
{
  "ref": {
    "@vendor/package": {
      "/declared/entity": {
        "path": "/actual/entity",
        "attrs": {
          "orig_id": "actual_id"
        }
      }
    }
  }
}
```

Short form when attributes are the same:

```json
{
  "ref": {
    "@vendor/package": {
      "/declared/entity": {"path": "/actual/entity"}
    }
  }
}
```
