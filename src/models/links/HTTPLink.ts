import {Link} from "./Link";
import {Action, Event, Property} from "../interaction";
import {TimeoutError} from "../../tools/errors";
import axios, {AxiosInstance} from 'axios';


export class HTTPLink extends Link {

    private http: AxiosInstance;

    constructor(href: string, host = '', mediaType = '') {
        super(href, host, mediaType);

        this.http = axios.create({
            headers: {
                'Accept': 'application/json',
                'Content-Type': this.mediaType
            },
            transformRequest: [(data: any, headers: any) => {
                return String(data);
            }],
            transformResponse: [(data: any) => {
                return String(data);
            }],
            timeout: 1000
        });
    }

    public async execute(data: any = null): Promise<any> {
        if (this.interaction instanceof Property) {
            return this.executeProperty(data);
        }
        if (this.interaction instanceof Action) {
            return this.executeAction(data)
        }
    }

    private async executeProperty(data: any): Promise<any> {
        if (data !== null) {
            // Write property
            if (this.mediaType === 'application/json') {
                return this.http.put(this.toString(), data).catch(e => {
                    this.handleError(e);
                });
            }
            // TODO: Support other mediaTypes
            return false;
        } else {
            // Read property
            return this.http.get(this.toString()).catch(e => {
                this.handleError(e);
            });
        }
    }

    private async executeAction(data: any): Promise<any> {
        return this.http.post(this.toString(), data).catch(e => {
            this.handleError(e);
        });
    }

    private handleError(error: any) {
        if (error.code === 'ECONNABORTED') {
            throw new TimeoutError('Remote thing did not respond.')
        } else {
            throw error;
        }
    }
}
