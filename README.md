## DayZ Killfeed Compatible with Xbox & Playstation

# Installation

1) Upload files to server running node 18 then run `npm install`.
```
npm install
```
2) Edit config.json with your info

After adding your information run the commands below, first register then index.
```
node register.js  # Registers commands on discord
node index.js     # Runs the bot
```
Done, a free killbot. Stop buying them.  

**Commands**  

```shell
# Serverlist Commands 
/ac serverlist getlist ---------- Get gamertags from white/black or priority lists          
/ac serverlist priority ---------- Get gamertags from white/black or priority list
/ac serverlist banlist ---------- Get gamertags from white/black or priority lists
/ac serverlist resetlist ---------- Get gamertags from white/black or priority lists
```
```shell
# Killfeed Commands
/admin killfeed setup ---------- (Create Required Bot Channels)  
/admin killfeed start ---------- (Start Killfeed)  
/admin killfeed stop ---------- (kill Killfeed Project)  
/admin killfeed deathloc ---------- (Toggle on/off death locations)  
/admin killfeed map ---------- (Toggle Map Links Cherno/Livonia)  
/admin killfeed clear ---------- (Clear Messages From Discord Channel (limit 100))  
```
