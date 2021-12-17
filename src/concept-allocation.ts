const models = require('./model/index.ts');
import { calculateIndelingslijst } from './pakjekraam-api';
import { ConceptQueue } from './concept-queue';

const conceptQueue = new ConceptQueue();
const allocationQueue = conceptQueue.getQueueForWorker();
const client = conceptQueue.getClient();

async function run() {
    try {

        allocationQueue.process(function (job, done) {
            console.log(`Processing job ${job.id}`);
            console.log("calculate allocation offline");
            calculateIndelingslijst(job.data.marktId, job.data.marktDate, true).then( 
                (data) => { 
                    console.log("READY: ", job.data, "id: ",job.id);
                    client.on("error", function(error) {
                        console.error(error);
                    });
                    client.set("RESULT_"+job.id, JSON.stringify(data), conceptQueue.print);
                    return done(null, data)
                },
                (error) => { 
                    console.log(error);
                }
            );
        });


    } catch(e) {
        console.log(e);
    }
}

run();
