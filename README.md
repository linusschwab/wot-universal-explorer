# Universal Explorer for the Web of Things
[![Build Status](https://travis-ci.org/linusschwab/wot-universal-explorer.svg?branch=master)](https://travis-ci.org/linusschwab/wot-universal-explorer)
[![Codecov](https://codecov.io/gh/linusschwab/wot-universal-explorer/branch/master/graph/badge.svg)](https://codecov.io/gh/linusschwab/wot-universal-explorer)
[![Dependencies](https://david-dm.org/linusschwab/wot-universal-explorer.svg)](https://david-dm.org/linusschwab/wot-universal-explorer)

The Universal Explorer for the Web of Things makes it possible to interact with smart things implementing a 
[W3C](https://w3c.github.io/wot-thing-description/) or [Mozilla](https://iot.mozilla.org/wot/) Thing Description. 
The gateway can parse the available interactions of a thing and provides a RESTful API with OpenAPI documentation, a 
WebSocket API and a JavaScript (TypeScript) API. It was developed as part of my master thesis.


## Prerequisites

The latest version of Node.js is required to run the application. If you don't have it installed on your computer, 
follow the directions on [nodejs.org](https://nodejs.org/en/) to install it on your platform.


## Installation
```
npm install
```

### Running Tests
```
npm test
```

## Configuration

To communicate with things from a [Mozilla Gateway](https://iot.mozilla.org/gateway/), the following environment 
variables need to be set:

* MOZ_BASE: URL of the Mozilla Gateway
* MOZ_AUTH: Mozilla Gateway bearer token

Until the Mozilla Gateway provides a way to generate access tokens for other applications, it is necessary to use the 
developer tools of a browser to get the bearer token. To do so, the network tools can be used to inspect a request sent 
to the web application of the Mozilla gateway, where the Authorization header can be found that includes the bearer token.


## Usage

To start the application, run the following command:

```
npm start
```

The web interface (Swagger UI) can then be accessed on ``http://localhost:5000``. After the installation, there are already
sample things provided. However, it is necessary to have real devices available to really use the application.

To add devices, the Thing Descriptions must be placed in the correct folder, the devices are then automatically added 
at the start of the application:

* ``public/td`` for W3C Thing Descriptions
* ``public/td-moz`` for Mozilla Thing Descriptions

Things connected to a [Mozilla Gateway](https://iot.mozilla.org/gateway/) can be added by getting the corresponding 
Thing Description by sending a GET request with a "Accept: application/json" header to the ``/things`` URL of the Gateway 
and copying the JSON Thing Description to the path above. The response received by the Gateway is an array, it is 
important to only put one thing per file. Alternatively it is also possible to script a new thing by using the 
[Mozilla Things Framework](https://iot.mozilla.org/things/).

To connect things using a W3C Thing Description, it is possible to manually write a Thing Description for devices that 
provide a HTTP REST API. For the [myStrom WiFi Switch](https://mystrom.ch/wifi-switch-ch/), a working one is already 
provided - it is just necessary to adapt the URL to the correct IP address in the local network. Otherwise, it is also 
possible to script things using the [Node-WoT](https://github.com/eclipse/thingweb.node-wot/) library, however the
Universal Explorer does only support the W3C Thing Description 1.0 JSON-LD serialization format.


## REST API
The REST API is automatically generated from the Thing Descriptions. Swagger UI that displays the OpenAPI documentation
is served at ``http://localhost:5000``.

Additionally, it is also possible to add new Thing Descriptions using the REST API. This is done by sending a POST
request with the Thing Description as payload to either ``/td`` or ``/td/moz`` for Mozilla Web Thing Descriptions.


## WebSocket API
The WebSocket API allows to get real-time interaction updates. There is one endpoint generated for each thing 
(for example ``/example-thing``) that allows to connect with the default WebSocket library.

### subscribe message
Subscribe to all interactions of the thing. By default, there are no active subscriptions for a new client.

```json
{
    "messageType": "subscribe",
    "data": ""
}
```

### unsubscribe message
Unsubscribe from all interactions of the thing.

```json
{
    "messageType": "unsubscribe",
    "data": ""
}
```

### addSubscription message
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

### removeSubscription message
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

### getProperty message
Request a property update for one or multiple properties.

```json
{
  "messageType": "getProperty",
  "data": {
    "propertyName": "",
    "propertyName2": ""
  }
}
```

### setProperty message
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

### requestAction message
Invoke one or multiple actions.

```json
{
  "messageType": "requestAction",
  "data": {
    "actionName": "",
    "actionName2": "data"
  }
}
```

## JavaScript API
After a Thing Description is parsed, a Thing object is generated from it. The Thing class provides various methods
to controll the corresponding real thing and allows to subscribe to its interactions.
