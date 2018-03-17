import * as Koa from "koa";
import * as request from "supertest";
import {App} from "../../App";
import {OpenAPIEncoder} from "../../tools";


const tdSample = `{
  "@context": ["https://w3c.github.io/wot/w3c-wot-td-context.jsonld",
               "https://w3c.github.io/wot/w3c-wot-common-context.jsonld"],
  "@type": ["Lamp"],
  "name": "myMasterLED",
  "interaction": [
    {
      "@type": ["Action", "Toggle"],
      "name": "myMasterOnOff",
      "inputSchema": {
        "@type": "OnOff",
        "type": "boolean"
      },
      "form": [
        {
          "href" : "coap://www.example.com:5683/master",
          "mediaType": "application/json"
        },
        {
          "href" : "http://www.example.com:80/master",
          "mediaType": "application/json"
        }
      ]
    }
  ]
}`;

const mozTDSample = `{
	"base": "http://localhost:8080",
	"authorization": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjU0YTc3YjE2LWJmZDQtNGE3YS1hYWVkLTgwYzA1YTQ4ZTg5ZCJ9.eyJyb2xlIjoidXNlcl90b2tlbiIsImlhdCI6MTUyMTEwODcwM30.qMq7KNSvLWC4oKYehGfj0_3Pt3tNDp18Xo_509194xDIghLUgVurfahAQb3I-Iv970C-ueiuTZNxnX0AUPAAeg",
	"td": {
		"name": "Virtual On/Off Color Light",
		"type": "onOffColorLight",
		"href": "/things/virtual-things-0",
		"properties": {
			"on": {
				"type": "boolean",
				"href": "/things/virtual-things-0/properties/on"
			},
			"color": {
				"type": "string",
				"href": "/things/virtual-things-0/properties/color"
			}
		},
		"actions": {},
		"events": {}
	}
}`;

// Create mocks
console.log = jest.fn();
jest.mock('fs');
jest.mock('../../tools/OpenAPIEncoder');


let app: Koa;

beforeEach(() => {
    app = App.run();
    jest.clearAllMocks();
});

describe('post td', () => {
    test('post empty td returns error', async () => {
        const response = await request(app.callback())
            .post('/td/add')
            .send(null)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.type).toBe('text/plain');
    });

    test('post td adds thing and encodes openapi file', async () => {
        const response = await request(app.callback())
            .post('/td/add')
            .send(tdSample)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');

        expect(App.instance.things.things).toHaveLength(1);
        expect(OpenAPIEncoder.encode).toHaveBeenCalled();
    });

    test('post td then get td returns encoded td', async () => {
        await request(app.callback())
            .post('/td/add')
            .send(tdSample)
            .set('Content-Type', 'application/json');

        const response = await request(app.callback())
            .get('/td/mymasterled');

        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        expect(response.body).toMatchSnapshot();
    });
});

describe('post mozilla td', () => {
    test('post empty mozilla td returns error', async () => {
        const response = await request(app.callback())
            .post('/td/moz/add')
            .send(null)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.type).toBe('text/plain');
    });

    test('post mozilla td adds thing and encodes openapi file', async () => {
        const response = await request(app.callback())
            .post('/td/moz/add')
            .send(mozTDSample)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');

        expect(App.instance.things.things).toHaveLength(1);
        expect(OpenAPIEncoder.encode).toHaveBeenCalled();
    });

    test('post mozilla td then get td returns encoded td', async () => {
        // TODO
        /*await request(app.callback())
            .post('/td/moz/add')
            .send(tdSample)
            .set('Content-Type', 'application/json');

        const response = await request(app.callback())
            .get('/td/mymasterled');

        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
        expect(response.body).toMatchSnapshot();*/
    });
});

describe('get td', () => {
    test('get td without adding a thing first returns error', async () => {
        const response = await request(app.callback())
            .get('/td/counter');

        expect(response.status).toBe(400);
        expect(response.type).toBe('text/plain');
    });
});

describe('get mozilla td', () => {
    test('get mozilla td without adding a thing first returns error', async () => {
        const response = await request(app.callback())
            .get('/td/moz/counter');

        expect(response.status).toBe(400);
        expect(response.type).toBe('text/plain');
    });
});
