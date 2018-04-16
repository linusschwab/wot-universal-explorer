import {Link} from "./Link";
import {Action, Event, Property} from "../interactions";
import {RequestError, TimeoutError} from "../../tools/errors";
import axios, {AxiosInstance} from 'axios';


export class HTTPLink extends Link {

    public http: AxiosInstance;

    constructor(href: string, host = '', mediaType = '') {
        super(href, host, mediaType);

        this.http = axios.create({
            headers: {
                'Accept': 'application/json',
                'Content-Type': this.mediaType
            },
            transformRequest: [(data: any, headers: any) => {
                return JSON.stringify(data);
            }],
            transformResponse: [(data: any) => {
                try {
                    return JSON.parse(data);
                } catch(e) {
                    return String(data);
                }
            }],
            timeout: 1000
        });
    }

    public async execute(data: any = null): Promise<any> {
        if (this.interaction instanceof Property) {
            return this.executeProperty(data);
        }
        else if (this.interaction instanceof Action) {
            return this.executeAction(data);
        }
        else if (this.interaction instanceof Event) {
            return this.executeEvent();
        }
    }

    protected async executeProperty(data: any): Promise<any> {
        let response;
        if (data !== null) {
            // Write property
            const config: any = {
                headers: {
                    'Content-Type': this.mediaType
                }
            };
            try {
                response = await this.http.put(this.toString(), data, config);
            } catch (e) {
                this.handleError(e);
            }
        } else {
            // Read property
            try {
                response = await this.http.get(this.toString());
            } catch (e) {
                this.handleError(e);
            }
        }
        return response.data;
    }

    protected async executeAction(data: any): Promise<any> {
        let response;
        try {
            response = await this.http.post(this.toString(), data);
        } catch (e) {
            // Try again as get request to support some legacy devices
            if (this.isEmpty(data) && e.response && e.response.status === 405) {
                try {
                    response = await this.http.get(this.toString());
                } catch (e) {
                    this.handleError(e);
                }
            } else {
                this.handleError(e);
            }
        }
        return response.data;
    }

    protected async executeEvent(): Promise<any> {
        let response;
        try {
            // Poll data
            response = await this.http.get(this.toString());
        } catch (e) {
            this.handleError(e);
        }
        return response.data;
    }

    private handleError(e: any) {
        if (e.code === 'ECONNABORTED' || e.code === 'EHOSTUNREACH') {
            throw new TimeoutError('Remote thing did not respond');
        } else if (e.response && e.response.status === 400) {
            throw new RequestError('Request data schema not correct');
        } else {
            throw e;
        }
    }
}
