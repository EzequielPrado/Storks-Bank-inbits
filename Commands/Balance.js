const Command = require(`./Command.js`);
const UserManager = require(`../lnbitsAPI/UserManager.js`);
const UserWallet = require(`../lnbitsAPI/User.js`);

/*
This command will show the balance of the mentioned user
*/

class Balance extends Command {
  constructor() {
    super();
    this.name = `balance`;
    this.description = `Returns the users wallet balance.`;
    this.options = [];
  }

  async execute(Interaction) {
    await Interaction.defer({ephemeral: true});
    const um = new UserManager();
    try {
      const userWallet = await um.getUserWallet(Interaction.user.id);

      if (userWallet.adminkey) {
        const uw = new UserWallet(userWallet.adminkey);
        try {
          const userWalletDetails = await uw.getWalletDetails();
        
          const walletUrl = `${process.env.LNBITS_HOST}/wallet?usr=${userWallet.user}`;
    
          const sats = userWalletDetails.balance/1000;
          const btc = (sats/100000000).toFixed(8).replace(/\.?0+$/,``);
          
          Interaction.editReply({
            content:`Balance: ${sats} Satoshis / ฿${btc} \nAccess wallet here: ${walletUrl}`,
            ephemeral: true,
          });
        } catch (err) {
          console.log(err);
        }
        
      }
      else {
        Interaction.editReply({
          content:`You do not currently have a wallet you can use /create`,
          ephemeral: true,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Balance;