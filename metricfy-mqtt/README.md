# metricfy-mqtt

## `agent/connected`

```js

{
  agent: {
    uuid, //auto generar
    username, // definir por configuracion
    name, // definir por configuracion
    hostname, // obtener del sistema operativo
    pid // obtener el proceso
  }
}

```

## `agent/disconnected`
```js
{
  agent: {
    uuid
  }
}

```

## `agent/message`

```js
{
  agent,
  metrics: [
    {
      type,
      value
    }
  ],
  timestamp // generar cuando creamos el mensaje
}

```


## `ejemplo cliente mqtt`

```js
{
	"agent": {
		"uuid": "xxx",
		"name": "test name",
		"username": "testuser",
		"pid": 123,
		"hostname": "testhostname"
	},
	"metrics": [{
		"type": "memory",
		"value": "1024"
	}, {
		"type": "temp",
		"value": "34"
	}]
}
```

{"agent":{"uuid": "xxx-ede","name": "test name","username": "testuser","pid": 21233,"hostname": "testhostname"},"metrics": [{"type": "memory","value": "1024"}, {"type": "temp","value": "34"}]}