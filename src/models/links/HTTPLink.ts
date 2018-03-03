import {Link} from "./Link";
import {Action, Event, Property} from "../interaction";
import {Operation} from "./Operation";
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
            timeout: 2000
        });
    }

    public async execute(data: any = null): Promise<any> {
        if (this.interaction instanceof Action) {
            return this.executeAction(data)
        }
        if (this.interaction instanceof Property) {
            return this.executeProperty(data);
        }
    }

    private async executeAction(data: any = null): Promise<any> {
        return this.http.post(this.toString()).catch(e => {
            console.log(e);
            return false;
        });
    }

    private async executeProperty(data: any = null): Promise<any> {
        if (data !== null) {
            // Write property
            if (this.mediaType === 'application/json') {
                return this.http.put(this.toString(), data).catch(e => {
                    console.log(e);
                    return false;
                });
            }
            // TODO: Support other mediaTypes
            return false;
        } else {
            // Read property
            return this.http.get(this.toString()).catch(e => {
                console.log(e);
                return false;
            });
        }
    }

}
