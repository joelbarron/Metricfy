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
   "agent":{
      "uuid":"xxx-xxx-xxx",
      "name":"test",
      "username":"test-user",
      "hostname":"test-hostname",
      "pid":10
   },
   "metrics":[
      {
         "type":"memory",
         "value":"1001"
      },
      {
         "type":"temp",
         "value":"33"
      }
   ]
}
```