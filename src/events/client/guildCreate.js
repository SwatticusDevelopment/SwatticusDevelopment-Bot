const Discord = require('discord.js');

const Functions = require("../../database/models/functions");

module.exports = async (client, guild) => {
    const webhookClient = new Discord.WebhookClient({
        id: client.webhooks.serverLogs.id,
        token: client.webhooks.serverLogs.token,
    });

    if (guild == undefined) return;

    new Functions({
        Guild: guild.id,
        Prefix: client.config.discord.prefix
    }).save();

    try {
        const promises = [
            client.shard.broadcastEval(client => client.guilds.cache.size),
            client.shard.broadcastEval(client => client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
        ];
        Promise.all(promises)
            .then(async (results) => {
                const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
                const embed = new Discord.EmbedBuilder()
                    .setTitle("🟢・Added to a new server!")
                    .addFields(
                        { name: "Total servers:", value: `${totalGuilds}`, inline: true },
                        { name: "Server name", value: `${guild.name}`, inline: true },
                        { name: "Server ID", value: `${guild.id}`, inline: true },
                        { name: "Server members", value: `${guild.memberCount}`, inline: true },
                        { name: "Server owner", value: `<@!${guild.ownerId}> (${guild.ownerId})`, inline: true },
                    )
                    .setThumbnail("https://cdn.discordapp.com/attachments/843487478881976381/852419422392156210/BotPartyEmote.png")
                    .setColor(client.config.colors.normal)
                webhookClient.send({
                    username: 'Bot Logs',
                    avatarURL: client.user.avatarURL(),
                    embeds: [embed],
                });
            })

        let defaultChannel = "";
        guild.channels.cache.forEach((channel) => {
            if (channel.type == Discord.ChannelType.GuildText && defaultChannel == "") {
                if (channel.permissionsFor(guild.members.me).has(Discord.PermissionFlagsBits.SendMessages)) {
                    defaultChannel = channel;
                }
            }
        })

        let row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Invite")
                    .setURL(client.config.discord.botInvite)
                    .setStyle(Discord.ButtonStyle.Link),

                new Discord.ButtonBuilder()
                    .setLabel("Support server")
                    .setURL(client.config.discord.serverInvite)
                    .setStyle(Discord.ButtonStyle.Link),
            );

        client.embed({
            title: "SwatticusDevelopment Bot Created To Fuel Communities",
            fields: [{
                name: "☎️┆ Support",
                value: `There Is No Public Support For This Bot!`,
                inline: false,
            },
            {
                name: "💻┆ This Is An Ethical Hacker Project",
                value: 'I work with many organizations, companies, and communities. This branch will test some network security. Aswell as it does way to many things...`',
                inline: false,
            },
            ],
            components: [row], 
        }, defaultChannel)
    }
    catch (err) {
        console.log(err);
    }


};