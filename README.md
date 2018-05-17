# Universal Explorer for the Web of Things
[![Build Status](https://travis-ci.org/linusschwab/wot-universal-explorer.svg?branch=master)](https://travis-ci.org/linusschwab/wot-universal-explorer)
[![Codecov](https://codecov.io/gh/linusschwab/wot-universal-explorer/branch/master/graph/badge.svg)](https://codecov.io/gh/linusschwab/wot-universal-explorer)
[![Dependencies](https://david-dm.org/linusschwab/wot-universal-explorer.svg)](https://david-dm.org/linusschwab/wot-universal-explorer)

## Configuration

To communicate with things from a Mozilla gateway, the following environment variables need to be set:
* MOZ_BASE: URL of the Mozilla gateway
* MOZ_AUTH: Mozilla gateway bearer token

## WebSocket API

### subscribe
Subscribe to all interactions of the thing.

```json
{
    "messageType": "subscribe",
    "data": {}
}
```

### unsubscribe
Unsubscribe from all interactions of the thing.

```json
{
    "messageType": "unsubscribe",
    "data": {}
}
```

### addSubscription
Subscribe to one or multiple interactions.

```json
{
  "messageType": "addSubscription",
  "data": {
    "property": "propertyName",
    "action": ["actionName", "actionName2"]
  }
}
```

### removeSubscription
Unsubscribe from one or multiple interactions.

```json
{
  "messageType": "removeSubscription",
  "data": {
    "property": ["propertyName", "propertyName2"],
    "event": "eventName"
  }
}
```

### getProperty
Request a property update for one or multiple properties.

```json
{
  "messageType": "getProperty",
  "data": {
    "propertyName": {},
    "propertyName2": {}
  }
}
```

### setProperty
Set a new value for one or multiple properties.

```json
{
  "messageType": "setProperty",
  "data": {
    "propertyName": "10",
    "propertyName2": "20"
  }
}
```

### requestAction
Invoke one or multiple actions.

```json
{
  "messageType": "requestAction",
  "data": {
    "actionName": {},
    "actionName2": "data"
  }
}
```
