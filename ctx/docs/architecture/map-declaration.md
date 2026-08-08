# Application Schema Map

- Path: `ctx/docs/architecture/map-declaration.md`
- Changed: `20260808`
- Legacy Source: `doc/map.md`

## Default Location

The root application may provide `etc/teqfw.schema.map.json`.

## Shape

```json
{
  "namespace": "teq",
  "ref": {},
  "deprecated": {}
}
```

## Namespace

`namespace` is the physical table prefix.
For example, `teq` produces table names beginning with `teq_`.

## External Reference Mapping

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

The first key identifies the package whose fragment declares the unresolved reference.
The second key is the declared external path.
`path` supplies the actual normalized entity path.
`attrs` optionally maps declared referenced attributes to actual attributes.
When attribute names match, omit `attrs`:

```json
{
  "ref": {
    "@vendor/package": {
      "/declared/entity": {
        "path": "/actual/entity"
      }
    }
  }
}
```

## Deprecated Entities

```json
{
  "deprecated": {
    "/app/email": ["/web/user"]
  }
}
```

Each key is the logical entity path to drop.
Its array lists entities that must be dropped first because of foreign-key dependencies.

## Migration Meaning

The map contributes to the target model.
It does not describe source-to-target history, rename intent, value conversion, or application cutover.

`deprecated` records explicit drop ordering for a destructive structure operation.
It does not independently authorize that operation and must not be interpreted as permission to discard durable data without the caller's preservation decision.
