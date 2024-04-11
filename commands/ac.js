/* DayZero KillFeed (DZK) DIY Project 2.0
Copyright (c) 2023 TheCodeGang LLC.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. */

const fs = require('fs');
require('dotenv').config();
if (!fs.existsSync("./logs/ban.txt")) {fs.writeFileSync("./logs/ban.txt", "");}
if (!fs.existsSync("./logs/priority.txt")) {fs.writeFileSync("./logs/priority.txt", "");}
if (!fs.existsSync("./logs/whitelist.txt")) {fs.writeFileSync("./logs/whitelist.txt", "");}
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { GUILDID, ID1, NITRATOKEN } = require('../config.json');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
const ini = require('ini');
const axios = require('axios');
const path = require('path');
const FormData = require('form-data');
const concat = require('concat-stream');//Install Module "npm i concat-stream"
var ban = " ";
var whitelist = " ";
var priority = " ";

module.exports = {
	data: new SlashCommandBuilder()
	.setName('ac')
	.setDescription('Contains all Access Control commands')
	.addSubcommandGroup(subcommand =>
		subcommand
		.setName('serverlist')
		.setDescription('Edit Nitrado Server Access Lists')
		.addSubcommand(subcommand =>
			subcommand
			.setName('whitelist')
			.setDescription('Add or Remove GamerTag to Whitelist')
			.addStringOption(option =>
				option.setName('gamertag')
				.setDescription('Enter a GamerTag')
				.setRequired(true)
			)
			.addStringOption(option =>
				option.setName('action')
				.setDescription('Select desired whitelisting action: Add, Remove, Enable/Disable Whitelist on Link')
				.setRequired(true)
				.addChoices(
					{ name: 'ADD', value: 'add' },
					{ name: 'REMOVE', value: 'remove' },
				)
			)
		)
		.addSubcommand(subcommand =>
			subcommand.setName('banlist')
			.setDescription('Add or Remove GamerTag to Banlist')
			.addStringOption(option =>
				option.setName('gamertag')
				.setDescription('Enter a GamerTag')
				.setRequired(true)
			)
			.addStringOption(option =>
				option.setName('action')
				.setDescription('Select desired action')
				.setRequired(true)
				.addChoices(
					{ name: 'ADD', value: 'add' },
					{ name: 'REMOVE', value: 'remove' },
				)
			)
		)
		.addSubcommand(subcommand =>
			subcommand.setName('priority')
			.setDescription('Add or Remove GamerTag to Priority List')
			.addStringOption(option =>
				option.setName('gamertag')
				.setDescription('Enter a GamerTag')
				.setRequired(true)
			)
			.addStringOption(option =>
				option.setName('action')
				.setDescription('Select desired action')
				.setRequired(true)
				.addChoices(
					{ name: 'ADD', value: 'add' },
					{ name: 'REMOVE', value: 'remove' },
				)
			)
		)
		.addSubcommand(subcommand =>
			subcommand.setName('getlist')
			.setDescription('Download Current Specified Nitrado Server Access List')
			.addStringOption(option =>
				option.setName('action')
				.setDescription('Select desired list')
				.setRequired(true)
				.addChoices(
					{ name: 'Whitelist', value: 'wl' },
					{ name: 'Banlist', value: 'ban' },
					{ name: 'Priority', value: 'pl' },
				)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('resetlist')
			.setDescription('Reset Specified Nitrado Server Access List')
			.addStringOption(option =>
				option.setName('action')
				.setDescription('Select which list will be reset')
				.setRequired(true)
				.addChoices(
					{ name: 'Whitelist', value: 'wl' },
					{ name: 'Banlist', value: 'ban' },
					{ name: 'Priority', value: 'pl' },
				)
			)
		)
	),

	async execute(interaction) {
		const subCo = interaction.options.getSubcommand();
		
		if (subCo === "whitelist") {
			const guildId = interaction.guildId;
			if(guildId) {
				if (guildId != GUILDID) return;
				const target = interaction.options.getString('gamertag');
				const choice = interaction.options.getString('action');
				if(choice === "add") {
					addwl().catch(function (error) {console.log(error);})
					async function addwl() {
						//Create a readStream and writing new subscriber to local file.
						var oldList = fs.createWriteStream('./logs/whitelist.txt', {flags: 'a'}, 'utf8');
						oldList.write(`${target}`);
						oldList.end("\r\n");
						//Create Headers for Axios
						const formData = new FormData();
						const headers = {
							...formData.getHeaders(),
							"Content-Length": formData.getLengthSync(),
							"Authorization": `Bearer ${NITRATOKEN}`,
						};
						const url1 = 'https://api.nitrado.net/services/';
						const url2 = '/gameservers/settings';
						// Create a readable stream in order to parse local file for Post request body.
						let stream = fs.createReadStream("./logs/whitelist.txt", {flags: 'r'}, 'utf8');
						function streamToString (stream) {
							const chunks = []
							return new Promise((resolve, reject) => {
								stream.on('data', chunk => chunks.push(chunk))
								stream.on('error', reject)
								stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
							})
						}
						streamToString(stream).then(function(response) {
							whitelist = response;
							// console.log(whitelist);
							formData.append("category", "general");
							formData.append("key", "whitelist");
							formData.append("value", whitelist);
							formData.pipe(concat(data => {
								// console.log(data);
								async function sendList() {
									await axios.post(url1+`${ID1}`+url2, data, {headers}, {withCredentials: true})
									.then((res) => {
										if(res.status >= 200 && res.status < 300) {
											interaction.reply('request success!')
											.catch(function (error) {
												console.log(error);
											});
											console.log(res.data);
										}
									})
									.catch(function (error) {
										console.log(error);
										interaction.reply('Something went wrong!')
										.catch(function (error) {
											console.log(error);
										});
									});
								}
								sendList()
								.catch(function (error) {
									console.log(error);
								});
							}))
						})
					}
					return;
				}
				if(choice === "remove"){
					rmwl().catch(function (error) {console.log(error);})
					async function rmwl() {
						//REMOVE MEMBER FROM LOCAL FILE.
						let oldWL = fs.readFileSync("./logs/whitelist.txt", 'utf-8');
						let listMember = `${target}`;
						let newWL = oldWL.replace( `${listMember}\r\n`, '');
						fs.writeFileSync("./logs/whitelist.txt", newWL, 'utf-8');
						//Create Headers for Axios
						const formData = new FormData();
						const headers = {
							...formData.getHeaders(),
							"Content-Length": formData.getLengthSync(),
							"Authorization": `Bearer ${NITRATOKEN}`,
						};
						const url1 = 'https://api.nitrado.net/services/';
						const url2 = '/gameservers/settings';
						// Create a readable stream in order to parse local file for Post request body.
						let stream = fs.createReadStream("./logs/whitelist.txt", {flags: 'r'}, 'utf8');
						function streamToString (stream) {
							const chunks = []
							return new Promise((resolve, reject) => {
								stream.on('data', chunk => chunks.push(chunk))
								stream.on('error', reject)
								stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
							})
						}
						streamToString(stream).then(function(response) {
							whitelist = response;
							formData.append("category", "general");
							formData.append("key", "Whitelist");
							formData.append("value", whitelist);
							formData.pipe(concat(data => {
								// console.log(data);
								async function sendList() {
									await axios.post(url1+`${ID1}`+url2, data, {headers}, {withCredentials: true})
									.then((res) => {
										if(res.status >= 200 && res.status < 300) {
											interaction.reply('request success!')
											.catch(function (error) {
												console.log(error);
											});
											console.log(res.data);
										}
									})
									.catch(function (error) {
										console.log(error);
										interaction.reply('Something went wrong!')
										.catch(function (error) {
											console.log(error);
										});
									});
								}
								sendList()
								.catch(function (error) {
									console.log(error);
								});
							}))
						})      
					}
				}
			}
		}
		if (subCo === "banlist") {
			const guildId = interaction.guildId;
			if(guildId) {
				if (guildId != GUILDID) return;
				const target = interaction.options.getString('gamertag');
				const choice = interaction.options.getString('action');
				if(choice === "add") {
					async function addban() {
						//Create a readStream and writing new banned survivor to local file.
						var oldList = fs.createWriteStream('./logs/ban.txt', {flags: 'a'}, 'utf8');
						oldList.write(`${target}`);
						oldList.end("\r\n");
		
						//Create Headers for Axios
						const formData = new FormData();
						const headers = {
							...formData.getHeaders(),
							"Content-Length": formData.getLengthSync(),
							"Authorization": `Bearer ${NITRATOKEN}`,
						};
						const url1 = 'https://api.nitrado.net/services/';
						const url2 = '/gameservers/settings';
						// Create a readable stream in order to parse local file for Post request body.
						let stream = fs.createReadStream("./logs/ban.txt", {flags: 'r'}, 'utf8');
						function streamToString (stream) {
							const chunks = []
							return new Promise((resolve, reject) => {
							stream.on('data', chunk => chunks.push(chunk))
							stream.on('error', reject)
							stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
							})
						}
						streamToString(stream).then(function(response) {
							ban = response;
							// console.log(ban);
							formData.append("category", "general");
							formData.append("key", "bans");
							formData.append("value", ban);
							formData.pipe(concat(data => {
								// console.log(data);
								async function sendList() {
									await axios.post(url1+`${ID1}`+url2, data, {headers}, {withCredentials: true})
									.then((res) => {
										if(res.status >= 200 && res.status < 300) {
											interaction.reply('request success!')
											.catch(function (error) {
												console.log(error);
											});
											console.log(res.data);
										}
									})
									.catch(function (error) {
										console.log(error);
										interaction.reply('Something went wrong!')
										.catch(function (error) {
											console.log(error);
										});
									});
								}
								sendList()
								.catch(function (error) {
									console.log(error);
								});
							}))
						})
					}
					addban()
					.catch(function (error) {
						console.log(error);
					});
				}
				if(choice === "remove") {
					async function rmban() {
						//REMOVE MEMBER FROM LOCAL FILE.
						let oldBan = fs.readFileSync("./logs/ban.txt", 'utf-8');
						let listMember = `${target}`;
						let newBan = oldBan.replace( `${listMember}\r\n`, '');
						fs.writeFileSync("./logs/ban.txt", newBan, 'utf-8');
						// console.log(newBan);
		
						//Create Headers for Axios
						const formData = new FormData();
						const headers = {
							...formData.getHeaders(),
							"Content-Length": formData.getLengthSync(),
							"Authorization": `Bearer ${NITRATOKEN}`,
						};
						const url1 = 'https://api.nitrado.net/services/';
							const url2 = '/gameservers/settings';
						// Create a readable stream in order to parse local file for Post request body.
						let stream = fs.createReadStream("./logs/ban.txt", {flags: 'r'}, 'utf8');
						function streamToString (stream) {
							const chunks = []
							return new Promise((resolve, reject) => {
								stream.on('data', chunk => chunks.push(chunk))
								stream.on('error', reject)
								stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
							})
						}
						streamToString(stream).then(function(response) {
							ban = response;
							// console.log(ban);
							formData.append("category", "general");
							formData.append("key", "bans");
							formData.append("value", ban);
							formData.pipe(concat(data => {
								// console.log(data);
								async function sendList() {
									await axios.post(url1+`${ID1}`+url2, data, {headers}, {withCredentials: true})
									.then((res) => {
										if(res.status >= 200 && res.status < 300) {
											interaction.reply('request success!')
											.catch(function (error) {
												console.log(error);
											});
											console.log(res.data);
										}
									})
									.catch(function (error) {
										console.log(error);
										interaction.reply('Something went wrong!')
										.catch(function (error) {
											console.log(error);
										});
									});
								}
								sendList()
								.catch(function (error) {
									console.log(error);
								});
							}))
						})
					}
					rmban()
					.catch(function (error) {
						console.log(error);
					});
				}
			}
		}
		if (subCo === "priority") {
			const guildId = interaction.guildId;
			if(guildId) {
				if (guildId != GUILDID) return;
				const target = interaction.options.getString('gamertag');
				const choice = interaction.options.getString('action');
				if(choice === "add") {
					async function addpl() {
						//Create a readStream and writing new subscriber to local file.
						var oldList = fs.createWriteStream('./logs/priority.txt', {flags: 'a'}, 'utf8');
						oldList.write(`${target}`);
						oldList.end("\r\n");
		
						//Create Headers for Axios
						const formData = new FormData();
						const headers = {
							...formData.getHeaders(),
							"Content-Length": formData.getLengthSync(),
							"Authorization": `Bearer ${NITRATOKEN}`,
						};
						const url1 = 'https://api.nitrado.net/services/';
						const url2 = '/gameservers/settings';
						// Create a readable stream in order to parse local file for Post request body.
						let stream = fs.createReadStream("./logs/priority.txt", {flags: 'r'}, 'utf8');
						function streamToString (stream) {
							const chunks = []
							return new Promise((resolve, reject) => {
							  stream.on('data', chunk => chunks.push(chunk))
							  stream.on('error', reject)
							  stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
							})
						}
						streamToString(stream).then(function(response) {
							priority = response;
							// console.log(priority);
							formData.append("category", "general");
							formData.append("key", "priority");
							formData.append("value", priority);
							formData.pipe(concat(data => {
								// console.log(data);
								async function sendList() {
									await axios.post(url1+`${ID1}`+url2, data, {headers}, {withCredentials: true})
									.then((res) => {
										if(res.status >= 200 && res.status < 300) {
											interaction.reply('request success!')
											.catch(function (error) {
												console.log(error);
											});
											console.log(res.data);
										}
									})
									.catch(function (error) {
										console.log(error);
										interaction.reply('Something went wrong!')
										.catch(function (error) {
											console.log(error);
										});
									});
								}
								sendList()
								.catch(function (error) {
									console.log(error);
								});
							}))
						})
					}
					addpl()
					.catch(function (error) {
						console.log(error);
					});
				}
				if(choice === "remove") {
					async function rmpl() {
						//REMOVE MEMBER FROM LOCAL FILE.
						let oldPQ = fs.readFileSync("./logs/priority.txt", 'utf-8');
						let listMember = `${target}`;
						let newPQ = oldPQ.replace( `${listMember}\r\n`, '');
						fs.writeFileSync("./logs/priority.txt", newPQ, 'utf-8');
						//Create Headers for Axios
						const formData = new FormData();
						const headers = {
							...formData.getHeaders(),
							"Content-Length": formData.getLengthSync(),
							"Authorization": `Bearer ${NITRATOKEN}`,
						};
						const url1 = 'https://api.nitrado.net/services/';
						const url2 = '/gameservers/settings';
						// Create a readable stream in order to parse local file for Post request body.
						let stream = fs.createReadStream("./logs/priority.txt", {flags: 'r'}, 'utf8');
						function streamToString (stream) {
							const chunks = []
							return new Promise((resolve, reject) => {
								stream.on('data', chunk => chunks.push(chunk))
								stream.on('error', reject)
								stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
							})
						}
						streamToString(stream).then(function(response) {
							priority = response;
							// console.log(ban);
							formData.append("category", "general");
							formData.append("key", "priority");
							formData.append("value", priority);
							formData.pipe(concat(data => {
								// console.log(data);
								async function sendList() {
									await axios.post(url1+`${ID1}`+url2, data, {headers}, {withCredentials: true})
									.then((res) => {
										if(res.status >= 200 && res.status < 300) {
											interaction.reply('request success!')
											.catch(function (error) {
												console.log(error);
											});
											console.log(res.data);
										}
									})
									.catch(function (error) {
										console.log(error);
										interaction.reply('Something went wrong!')
										.catch(function (error) {
											console.log(error);
										});
									});
								}
								sendList()
								.catch(function (error) {
									console.log(error);
								});
							}))
						})
					}
					rmpl()
					.catch(function (error) {
						console.log(error);
					});
				}
			}
		}
		if (subCo === "getlist") {
			const guildId = interaction.guildId;
			if(guildId) {
				if (guildId != GUILDID) return;
				const choice = interaction.options.getString('action');
				if(choice === "wl") {
					interaction.channel.send(`Retrieving List....`)
					.catch(function (error) {
						console.log(error);
					});
					async function getwl() {
						let stream = fs.createReadStream("./logs/whitelist.txt", {flags: 'r'}, 'utf8');
						function streamToString (stream) {
							const chunks = []
							return new Promise((resolve, reject) => {
							stream.on('data', chunk => chunks.push(chunk))
							stream.on('error', reject)
							stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
							})
						}
						streamToString(stream).then(function(response) {
							getwhiteList = response;
							interaction.channel.send(getwhiteList)
							.catch(function (error) {
								console.log(error);
							});
							interaction.channel.send("**Done!**")
							.catch(function (error) {
								console.log(error);
							});
						})
					}    
					getwl()
					.catch(function (error) {
						console.log(error);
					})
					interaction.reply(`...`)
					.catch(function (error) {
						console.log(error);
					});
					interaction.deleteReply()
					.catch(function (error) {
						console.log(error);
					});
				}
				if(choice === "ban") {
					interaction.channel.send(`Retrieving List....`)
					.catch(function (error) {
						console.log(error);
					});
					async function getban() {
						let stream = fs.createReadStream("./logs/ban.txt", {flags: 'r'}, 'utf8');
						function streamToString (stream) {
							const chunks = []
							return new Promise((resolve, reject) => {
							stream.on('data', chunk => chunks.push(chunk))
							stream.on('error', reject)
							stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
							})
						}
						streamToString(stream).then(function(response) {
							getwhiteList = response;
							interaction.channel.send(getwhiteList)
							.catch(function (error) {
								console.log(error);
							});
							interaction.channel.send("**Done!**")
							.catch(function (error) {
								console.log(error);
							});
						})
					}    
					getban()
					.catch(function (error) {
						console.log(error);
					});
					interaction.reply(`...`)
					.catch(function (error) {
						console.log(error);
					});
					interaction.deleteReply()
					.catch(function (error) {
						console.log(error);
					});
				}
				if(choice === "pl") {
					async function getpl() {
						interaction.channel.send(`Retrieving List....`)
						.catch(function (error) {
							console.log(error);
						});
						let stream = fs.createReadStream("./logs/priority.txt", {flags: 'r'}, 'utf8');
						function streamToString (stream) {
							const chunks = []
							return new Promise((resolve, reject) => {
							stream.on('data', chunk => chunks.push(chunk))
							stream.on('error', reject)
							stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
							})
						}
						streamToString(stream).then(function(response) {
							getwhiteList = response;
							interaction.channel.send(getwhiteList)
							.catch(function (error) {
								console.log(error);
							});
							interaction.channel.send("**Done!**")
							.catch(function (error) {
								console.log(error);
							});
						})
					}    
					getpl()
					.catch(function (error) {
						console.log(error);
					});
					interaction.reply(`...`)
					.catch(function (error) {
						console.log(error);
					});
					interaction.deleteReply()
					.catch(function (error) {
						console.log(error);
					});
				}
			}
		}
		if (subCo === 'resetlist'){
			async function rl(){
				const guildId = interaction.guildId;
				if(guildId) {
					if (guildId != GUILDID) return;
					const choice = interaction.options.getString('action');
					if(choice === "wl") {
						fs.truncate("./logs/whitelist.txt", (err) => {
							if (err) {
								interaction.reply("Reset Failed!")
								.catch(function (error) {
									console.log(error);
								})
								return;
							}else {
								interaction.reply("Whitelist reset successfully!")
								.catch(function (error) {
									console.log(error);
								})
								return;
							}
						});
					}
					if(choice === "ban") {
						fs.truncate("./logs/ban.txt", (err) => {
							if (err) {
								interaction.reply("Reset Failed!")
								.catch(function (error) {
									console.log(error);
								})
								return;
							}else {
								interaction.reply("Banlist reset successfully!")
								.catch(function (error) {
									console.log(error);
								})
								return;
							}
						});
					}
					if(choice === "pl") {
						fs.truncate("./logs/priority.txt", (err) => {
							if (err) {
								interaction.reply("Reset Failed!")
								.catch(function (error) {
									console.log(error);
								})
								return;
							}else {
								interaction.reply("Priority List reset successfully!")
								.catch(function (error) {
									console.log(error);
								})
								return;
							}
						});
					}
				}
			}
			rl()
			.catch(function (error) {
				console.log(error);
			})
		}
	},
};