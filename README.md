# toopac

Track changes to an API. 

Status: `alpha`. Uses [Deno](https://deno.land/).

Feature

✅ Get the data before and after change
✅ Track data schema and schema changes

## Quickstart

1. Clone Repo
2. Create a `toopac.config.yaml`
3. Add the following:
   
Track changes from a random fox API:

https://randomfox.ca/floof/

```yaml
request:
  host: https://randomfox.ca
  path: /floof/
  method: GET
polling: 5 # how oten to ping url
```
4. Run:

```
$ ./dist/toopac_yourbinary
```

5. Get API change events:

```json
{
  "schema": {
    "before": {
      # json schema 
    },
    "after": {
      # json schema
    }
  },
  "schemaChanges": [# changes to schema],
  "changes": [
    # changes from before to after
    {
      "kind": "E",
      "path": ["image"],
      "lhs": "https://randomfox.ca/images/119.jpg",
      "rhs": "https://randomfox.ca/images/86.jpg"
    },
    {
      "kind": "E",
      "path": ["link"],
      "lhs": "https://randomfox.ca/?i=119",
      "rhs": "https://randomfox.ca/?i=86"
    }
  ],
  "payload": {
    "before": {
      "image": "https://randomfox.ca/images/119.jpg",
      "link": "https://randomfox.ca/?i=119"
    },
    "after": {
      "image": "https://randomfox.ca/images/86.jpg",
      "link": "https://randomfox.ca/?i=86"
    }
  },
  "op": "u",
  "ts_ms": 1625154873698
}
```

## Config

toopac is powered by a config file

#### Advanced Example

```yaml
request:
  host: https://api.meroxa.io
  path: /v1/connectors
  method: GET
  auth: bearer
  token:
output:
  webhook:
    host: http://localhost:8080
    wait_for_reply: false
heartbeat: 60
polling: 5
persistance: './tupac.store'
```

## Outputs 

### Webhooks

```yaml
output:
  webhook:
    host: http://localhost:8080
    wait_for_reply: false
```

### Meroxa

```yaml
output:
  meroxa:
    endpiont: 
    username: 
    password:
```

# Building

To run locally:

```
make
```

To run and watch locally:

```
make watch
```

To build and cross-compile binaries:

```
make build
```
