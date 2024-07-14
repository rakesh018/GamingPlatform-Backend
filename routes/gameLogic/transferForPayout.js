const activeBets=require('./activeBetsQueues');
const payouts=require('./payoutQueue');

const transferForPayout=async(gameName,roundDuration,GID,roundResult)=>{
    const queue=activeBets[gameName][roundDuration];
    const jobs=await queue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
    for(const job of jobs){
        //Enqueue details of this into payout queue to process further
        await payouts.add('payout',{
            gameId:GID,
            choice:job.data.mappedChoice,
            result:roundResult,
            gameName,
            roundDuration
        });
        await job.remove();
    }
}
module.exports=transferForPayout;
//above code will get a particular bullmq queue given and push all the jobs in this queue to payouts queue