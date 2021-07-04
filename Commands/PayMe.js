const Discord = require(`discord.js`);
const Command = require(`./Command.js`);
const UserManager = require(`../lnbitsAPI/UserManager.js`);
const UserWallet = require(`../lnbitsAPI/User.js`);
const QRCode = require('qrcode');

/*
This command will create an invoice for a user. 
Provides an embed for 

TODO:
- Currently you can specify an optional user to create an invoice under
*/

class PayMe extends Command {
  constructor() {
    super();
    this.name = `payme`;
    this.description = `Creates an invoice for the users wallet`;
    this.options = [{
      name: `amount`,
      type: `INTEGER`,
      description: `The amount of satoshis payable in the invoice`,
      required: true,
    },{
      name: `description`,
      type: `STRING`,
      description: `The description of the invoice`,
      required: true,
    },{
      name: `user`,
      type: `USER`,
      description: `The user to show wallet balance of`,
      required: false,
    }];
  }

  async execute(Interaction) {
    await Interaction.defer();
    const target = Interaction.options.get(`user`) ? Interaction.options.get(`user`).user : Interaction.user;
    const amount = Interaction.options.get(`amount`);
    const description = Interaction.options.get(`description`);
    const member = await Interaction.guild.members.fetch(target.id);
    
    const um = new UserManager();
    const userWallet = await um.getUserWallet(member.toString());
    
    const uw = new UserWallet(userWallet.adminkey);
    const invoiceDetails = await uw.createInvote(amount.value, description.value);
 
    const qrData = await QRCode.toDataURL(invoiceDetails.payment_request);
    const buf = new Buffer.from(qrData.split(',')[1], 'base64');
    const file = new Discord.MessageAttachment(buf, 'img.jpeg');
    
    const embed = new Discord.MessageEmbed()
        .attachFiles(file)
        .setImage(`attachment://img.jpeg`)
        .addField(`Payment Request`, `${invoiceDetails.payment_request}`, true)

    Interaction.editReply(embed);
  }
}

module.exports = PayMe;