# Paranoid
"Paranoid" is an open-source decentralized encrypted anonymous chat aimed at promoting free speech. Oppression of speech is on the rise and privacy no longer exists. Let this platform be used by all to communicate freely and privately.

### Paranoid Relay
- A relay is a server-node. Relays can be isolated or connect to other nodes. The job of the relay is to pass along messages. THE RELAYS DO NOT STORE MESSAGES, however using a "paranoid" mindset you should assume that someone is storing every message... that is why we have encryption. The other job of the relay is to verify the authenticity of a message before sending it along. Each relay stores a collection of usernames + public keys. Messages are verified via digital signatures.

### Paranoid Client
- The client is a single HTML page that connects to one or more Relays. Upon page-load a user can remain anonymous by using a randomly generated name + keys (auto-registered), "register" with the relay by picking a name and sending a public key along with a signed verification message, or "login" by loading existing keys into memory. Clients can post public and private messages.

### Encryption layers
- Connection with the Relay should utilize the strongest HTTPS encryption available for end-to-end protection
- All messages utilize digital signatures to ensure message integrity and to prevent spoofing user messages
- Private messages are additionally encrypted asymmetrically using the recipient's public key
- All messages can additionally be encrypted symetrically with a passsword and algorithm (AES, TwoFish, etc)
- "Rooms" can have additional symetric encryption for all messages with a password

### "Paranoid" mindset
- Store nothing
- Encrypt everything
- Assume everything is logged and public
- Key generation should take place offline in airplane mode
- Use burner accounts and change keys often
- Verify the integrity of all source code (Relay should expose read-only FTP soruce code)
- Desktop is safer than Mobile

## Install
```npm i -g gulp@3.9.1```
```npm i``

## Build
```npm run build```

## Run
```npm run start```
https://localhost:8888