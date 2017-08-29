const PlatformStats = require('./models/platform-stats');
const moment = require('moment');
const rp = require('request-promise');


class NicehashSync {
    constructor (walletAddress) {
        this.walletAddress = walletAddress;
    }

    start () {
        let totalRaisedBitcoin = 0;
        let stats = PlatformStats.findOne({}).exec()
        .then(stats => {
            if (!stats) {
                stats = new PlatformStats();
            }
            let end = moment(new Date());
            let duration = moment.duration(end.diff(moment(stats.lastRun)));
            let hours = duration.asHours();
            if (hours < 1) {
                return stats.save();
            }
            console.log('executing nice hash sync');
            return rp.get(`https://api.nicehash.com/api?method=stats.provider.workers&addr=${this.walletAddress}`)
            .then(response => {
                response = JSON.parse(response);
                let result = response.result;
                stats.workers = result.workers.length;
                console.dir(result);
                return rp.get(`https://api.nicehash.com/api?method=stats.provider&addr=${this.walletAddress}`);
            })
            .then(response => {
                response = JSON.parse(response);
                let result = response.result;
                result.stats.forEach(stat => {
                    totalRaisedBitcoin += parseFloat(stat.balance);
                });
                return rp.get(`https://blockchain.info/q/getreceivedbyaddress/${this.walletAddress}`);
            })
            .then(response => {
                let result = parseInt(response);
                totalRaisedBitcoin += (result / 100000000);
                return rp.get('https://blockchain.info/ticker');
            })
            .then(response => {
                response = JSON.parse(response);
                let totalRaisedDollars = totalRaisedBitcoin * response.USD.buy;
                console.log(`${stats.amountRaised}-${totalRaisedDollars}`);
                let rate = totalRaisedDollars - stats.amountRaised;
                stats.amountRaised = totalRaisedDollars;
                stats.rate = rate;
                stats.lastRun = new Date();
                console.dir(stats.toObject());
                return stats.save();
            });
        })
        .catch(err => {
            console.error(err);
        })
        .finally(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(this.start());
                }, 20000);
            });
        });
    }
}

module.exports = NicehashSync;
