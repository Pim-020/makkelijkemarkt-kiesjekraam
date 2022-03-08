const Queue = require('bee-queue');
const redis = require('redis');
const util = require('util');


export const ALLOCATION_MODE_CONCEPT:string = "concept";
export const ALLOCATION_MODE_SCHEDULED:string = "scheduled";

export class ConceptQueue {
    client: any;
    worker_config: any;
    dispatcher_config: any;
    prefix: string = 'kjk-alloc';
    name: string = 'allocation';
    print: string;

    constructor() {
        const redis = require('redis');
        const redisHost: string = process.env.REDIS_HOST;
        const redisPort: string = process.env.REDIS_PORT;
        const redisPassword: string = process.env.REDIS_PASSWORD;
        let connected = false;
        this.client = redis.createClient({
            url: `redis://:${redisPassword}@${redisHost}:${redisPort}`,
            retry_strategy: function(options) {
                if (options.error && (options.error.code === 'ECONNREFUSED' || options.error.code === 'NR_CLOSED')) {
                    // Try reconnecting after 5 seconds
                    return 5000;
                }
                // reconnect after
                return 3000;
            },
        });
        this.client.get = util.promisify(this.client.get);

        this.client.on('connect', function() {
            console.log('Connected to Redis');
            connected = true;
        });
        this.client.on('error', function(err) {
            console.log('Redis error: ' + err);
        });
        this.client.on('reconnecting', function(err) {
            console.log('Redis try reconnecting..');
        });

        this.client.on('end', function() {
            // we had a redis connection
            // but redis is down now
            // exit the server, docker will restart the container
            // when booted again we will enter the retry strategy
            console.log('Redis end');
            if (connected) {
                process.exit(1);
            }
        });

        this.print = redis.print;

        this.dispatcher_config = {
            prefix: this.prefix,
            redis: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                password: process.env.REDIS_PASSWORD,
                db: 0,
                options: {},
            },
            isWorker: false,
        };
    }

    getClient(): any {
        return this.client;
    }

    getQueueForDispatcher(): any {
        return new Queue(this.name, this.dispatcher_config);
    }
}
