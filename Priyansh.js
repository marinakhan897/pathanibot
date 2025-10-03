const moment = require("moment-timezone");
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync, rm } = require("fs-extra");
const { join, resolve } = require("path");
const { execSync } = require('child_process');
const logger = require("./utils/log.js");
const login = require("fca-priyansh"); 
const axios = require("axios");
const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
const listbuiltinModules = require("module").builtinModules;

// Bot Owner Information
const botOwner = {
    name: "Marina Khan",
    gender: "female",
    role: "Bot Owner & Developer",
    contact: {
        facebook: "https://facebook.com/marina.khan",
        github: "https://github.com/marinakhan"
    }
};

// Auto-response configuration
const autoResponseConfig = {
    enabled: true,
    responseDelay: 1000,
    learningMode: false,
    maxResponseLength: 200,
    ignoreCommands: true,
    cooldown: 3000,
    ownerName: "Marina Khan" // Added owner name to config
};

// AI Response patterns with Marina Khan as owner
const responsePatterns = {
    greetings: {
        patterns: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "howdy", "sup"],
        responses: [
            "Hello there! 👋", 
            "Hi! How can I help you today?", 
            "Hey! What's up?", 
            "Hello! Nice to see you!",
            "Hi there! How can I assist you?"
        ]
    },
    farewells: {
        patterns: ["bye", "goodbye", "see you", "farewell", "cya", "take care"],
        responses: [
            "Goodbye! 👋", 
            "See you later! 😊", 
            "Bye! Have a great day!", 
            "Take care! 👋",
            "Farewell! Come back anytime!"
        ]
    },
    thanks: {
        patterns: ["thanks", "thank you", "ty", "thx", "appreciate it"],
        responses: [
            "You're welcome! 😊", 
            "Happy to help! 👍", 
            "Anytime! 😄", 
            "No problem!",
            "Glad I could help! 😊"
        ]
    },
    howAreYou: {
        patterns: ["how are you", "how do you do", "how's it going", "what's up", "how you doing"],
        responses: [
            "I'm doing great, thanks for asking! 😊", 
            "I'm fine, how about you?", 
            "Doing well! Just here to help you!", 
            "I'm good! What about you?",
            "All systems operational! 😄"
        ]
    },
    botIdentity: {
        patterns: ["who are you", "what are you", "your name", "are you a bot", "are you human", "who made you", "who created you", "who is your owner"],
        responses: [
            "I'm an AI assistant bot created by Marina Khan! 🤖", 
            "I'm a chatbot created by Marina Khan to help and assist you!", 
            "I'm your friendly neighborhood bot created by Marina Khan! 😊", 
            "I'm an automated assistant powered by AI and developed by Marina Khan!",
            "I'm a bot designed by Marina Khan to chat and help with various tasks!",
            "My owner and developer is Marina Khan! She created me to assist everyone.",
            "I was built by Marina Khan - she's my amazing creator! 💫"
        ]
    },
    ownerInfo: {
        patterns: ["marina", "marina khan", "who is marina", "tell me about marina", "owner", "developer", "creator"],
        responses: [
            "Marina Khan is my amazing owner and developer! She created me to help people. 👩‍💻",
            "Marina Khan is the brilliant developer who brought me to life! She's the best! 🌟",
            "That's my owner! Marina Khan is the creator of this bot - she's awesome! 💖",
            "Marina Khan is my developer and owner. She works hard to keep me running smoothly!",
            "You're asking about Marina Khan! She's my creator and an excellent developer! 🚀"
        ]
    },
    help: {
        patterns: ["help", "what can you do", "commands", "features", "capabilities"],
        responses: [
            `I can chat with you, answer questions, and execute various commands! I was created by ${botOwner.name}. Type 'menu' to see all available commands.`,
            `I'm here to assist with conversations and perform different tasks. My owner ${botOwner.name} keeps me updated! Use 'menu' to explore my features!`,
            `I can help with automated responses and various functions. Developed by ${botOwner.name}. Check 'menu' for all options!`,
            `I'm a multi-purpose bot created by ${botOwner.name}! Type 'menu' to see everything I can do for you!`
        ]
    },
    compliments: {
        patterns: ["good bot", "nice bot", "awesome", "great", "smart", "intelligent", "cool", "good job"],
        responses: [
            "Thank you! 😊 Marina Khan programmed me well!", 
            "You're making me blush! 😄 Thanks to Marina Khan's coding!", 
            "Thanks! I appreciate that! 👍 Marina Khan taught me well!", 
            "You're too kind! 😊 I'll let Marina Khan know!",
            "Thank you! Marina Khan's hard work is paying off! 🤖"
        ]
    },
    questions: {
        patterns: ["what is", "how to", "why", "when", "where", "can you", "will you"],
        responses: [
            "That's an interesting question! Let me think...",
            "I'm still learning about that topic! Marina Khan is always improving me!",
            "That's beyond my current knowledge, but I'm always improving!",
            "I'm not sure about that one. Maybe try asking differently?",
            "Let me check my knowledge base on that..."
        ]
    }
};

// Conversation memory
const conversationMemory = new Map();
const userCooldowns = new Map();

global.client = new Object({
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    eventRegistered: new Array(),
    handleSchedule: new Array(),
    handleReaction: new Array(),
    handleReply: new Array(),
    mainPath: process.cwd(),
    configPath: new String(),
    botOwner: botOwner, // Added bot owner info
    autoResponder: {
        config: autoResponseConfig,
        patterns: responsePatterns,
        memory: conversationMemory,
        cooldowns: userCooldowns
    },
    getTime: function (option) {
        switch (option) {
            case "seconds":
                return `${moment.tz("Asia/Kolkata").format("ss")}`;
            case "minutes":
                return `${moment.tz("Asia/Kolkata").format("mm")}`;
            case "hours":
                return `${moment.tz("Asia/Kolkata").format("HH")}`;
            case "date": 
                return `${moment.tz("Asia/Kolkata").format("DD")}`;
            case "month":
                return `${moment.tz("Asia/Kolkata").format("MM")}`;
            case "year":
                return `${moment.tz("Asia/Kolkata").format("YYYY")}`;
            case "fullHour":
                return `${moment.tz("Asia/Kolkata").format("HH:mm:ss")}`;
            case "fullYear":
                return `${moment.tz("Asia/Kolkata").format("DD/MM/YYYY")}`;
            case "fullTime":
                return `${moment.tz("Asia/Kolkata").format("HH:mm:ss DD/MM/YYYY")}`;
        }
    }
});

global.data = new Object({
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    threadAllowNSFW: new Array(),
    allUserID: new Array(),
    allCurrenciesID: new Array(),
    allThreadID: new Array()
});

global.utils = require("./utils");

global.nodemodule = new Object();

global.config = new Object();

global.configModule = new Object();

global.moduleData = new Array();

global.language = new Object();

// Auto-response functions with Marina Khan integration
global.autoResponder = {
    // Check if message should trigger auto-response
    shouldRespond: function(message) {
        if (!autoResponseConfig.enabled) return false;
        
        const userId = message.senderID;
        const threadId = message.threadID;
        const currentTime = Date.now();
        
        // Check cooldown
        const userKey = `${userId}_${threadId}`;
        const lastResponse = userCooldowns.get(userKey);
        if (lastResponse && (currentTime - lastResponse) < autoResponseConfig.cooldown) {
            return false;
        }
        
        // Don't respond to bot's own messages
        if (message.senderID === global.client.api.getCurrentUserID()) return false;
        
        // Check if it's a command (if ignoreCommands is enabled)
        if (autoResponseConfig.ignoreCommands) {
            const body = (message.body || '').toLowerCase().trim();
            if (body.startsWith(global.config.PREFIX || '!')) return false;
        }
        
        return true;
    },
    
    // Generate response based on message content
    generateResponse: function(message) {
        const body = (message.body || '').toLowerCase().trim();
        if (!body) return null;
        
        // Check for owner-specific patterns first
        if (body.includes("marina") || body.includes("owner") || body.includes("developer") || body.includes("creator")) {
            const ownerResponses = [
                `Marina Khan is my amazing owner and developer! She created me to help everyone! 👩‍💻`,
                `That's my creator! Marina Khan is a wonderful developer who built me from scratch! 🌟`,
                `Marina Khan is the brilliant mind behind this bot! She's my owner and developer! 💫`,
                `You're asking about Marina Khan! She's my owner and an excellent developer! 🚀`,
                `Marina Khan is my creator! She works hard to keep me updated and running smoothly! 💖`
            ];
            return ownerResponses[Math.floor(Math.random() * ownerResponses.length)];
        }
        
        // Check for patterns and return appropriate response
        for (const [category, data] of Object.entries(responsePatterns)) {
            for (const pattern of data.patterns) {
                if (body.includes(pattern)) {
                    const responses = data.responses;
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    return randomResponse;
                }
            }
        }
        
        // Contextual responses based on conversation history
        const contextResponse = this.getContextualResponse(message);
        if (contextResponse) return contextResponse;
        
        // Default responses for general conversation
        return this.getDefaultResponse(message);
    },
    
    // Get contextual response based on conversation history
    getContextualResponse: function(message) {
        const userId = message.senderID;
        const threadId = message.threadID;
        const memoryKey = `${userId}_${threadId}`;
        
        // Get conversation history
        const history = conversationMemory.get(memoryKey) || [];
        
        // Analyze last few messages for context
        if (history.length > 0) {
            const lastUserMessage = history[history.length - 1];
            
            // Continue conversation threads
            if (lastUserMessage.includes('?')) {
                const followUps = [
                    "What do you think about that?",
                    "That's an interesting point!",
                    "I'd love to hear more about your thoughts on this.",
                    "That reminds me of something else...",
                    "What else would you like to know?"
                ];
                return followUps[Math.floor(Math.random() * followUps.length)];
            }
        }
        
        return null;
    },
    
    // Get default response for general messages
    getDefaultResponse: function(message) {
        const body = (message.body || '').toLowerCase().trim();
        
        // Only respond to messages that seem like they need a response
        if (body.length < 3) return null;
        
        // Check if message ends with question mark
        if (body.endsWith('?')) {
            const questionResponses = [
                "That's a good question!",
                "I'm not entirely sure about that.",
                "Let me think about that...",
                "Interesting question! What made you ask that?",
                "I'm still learning about that topic."
            ];
            return questionResponses[Math.floor(Math.random() * questionResponses.length)];
        }
        
        // Random chance to respond to general statements (avoid spamming)
        if (Math.random() < 0.3) { // 30% chance to respond
            const generalResponses = [
                "I see!",
                "That's interesting!",
                "Tell me more about that.",
                "Really? That's cool!",
                "I understand what you're saying.",
                "That makes sense!",
                "Interesting point!",
                "I get what you mean."
            ];
            return generalResponses[Math.floor(Math.random() * generalResponses.length)];
        }
        
        return null;
    },
    
    // Update conversation memory
    updateMemory: function(message, response) {
        const userId = message.senderID;
        const threadId = message.threadID;
        const memoryKey = `${userId}_${threadId}`;
        
        let history = conversationMemory.get(memoryKey) || [];
        
        // Add user message to history
        history.push(message.body || '');
        
        // Add bot response to history
        if (response) {
            history.push(response);
        }
        
        // Keep only last 10 messages to prevent memory overload
        if (history.length > 10) {
            history = history.slice(-10);
        }
        
        conversationMemory.set(memoryKey, history);
    },
    
    // Update cooldown
    updateCooldown: function(message) {
        const userId = message.senderID;
        const threadId = message.threadID;
        const userKey = `${userId}_${threadId}`;
        userCooldowns.set(userKey, Date.now());
    },
    
    // Process message and send response if needed
    processMessage: async function(message) {
        try {
            if (!this.shouldRespond(message)) return;
            
            const response = this.generateResponse(message);
            
            if (response) {
                // Add delay to make it feel more natural
                await new Promise(resolve => setTimeout(resolve, autoResponseConfig.responseDelay));
                
                // Send the response
                global.client.api.sendMessage(response, message.threadID, message.messageID);
                
                // Update memory and cooldown
                this.updateMemory(message, response);
                this.updateCooldown(message);
                
                logger.loader(`Auto-response sent to ${message.senderID}: ${response}`, "auto-response");
            }
        } catch (error) {
            logger.loader(`Auto-response error: ${error}`, "error");
        }
    }
};

// Rest of your existing code continues...
//////////////////////////////////////////////////////////
//========= Find and get variable from Config =========//
/////////////////////////////////////////////////////////

var configValue;
try {
    global.client.configPath = join(global.client.mainPath, "config.json");
    configValue = require(global.client.configPath);
    logger.loader("Found file config: config.json");
}
catch {
    if (existsSync(global.client.configPath.replace(/\.json/g,"") + ".temp")) {
        configValue = readFileSync(global.client.configPath.replace(/\.json/g,"") + ".temp");
        configValue = JSON.parse(configValue);
        logger.loader(`Found: ${global.client.configPath.replace(/\.json/g,"") + ".temp"}`);
    }
    else return logger.loader("config.json not found!", "error");
}

try {
    for (const key in configValue) global.config[key] = configValue[key];
    logger.loader("Config Loaded!");
}
catch { return logger.loader("Can't load file config!", "error") }

const { Sequelize, sequelize } = require("./includes/database");

writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

/////////////////////////////////////////
//========= Load language use =========//
/////////////////////////////////////////

const langFile = (readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);
const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');
for (const item of langData) {
    const getSeparator = item.indexOf('=');
    const itemKey = item.slice(0, getSeparator);
    const itemValue = item.slice(getSeparator + 1, item.length);
    const head = itemKey.slice(0, itemKey.indexOf('.'));
    const key = itemKey.replace(head + '.', '');
    const value = itemValue.replace(/\\n/gi, '\n');
    if (typeof global.language[head] == "undefined") global.language[head] = new Object();
    global.language[head][key] = value;
}

global.getText = function (...args) {
    const langText = global.language;    
    if (!langText.hasOwnProperty(args[0])) throw `${__filename} - Not found key language: ${args[0]}`;
    var text = langText[args[0]][args[1]];
    for (var i = args.length - 1; i > 0; i--) {
        const regEx = RegExp(`%${i}`, 'g');
        text = text.replace(regEx, args[i + 1]);
    }
    return text;
}

try {
    var appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
    var appState = require(appStateFile);
    logger.loader(global.getText("priyansh", "foundPathAppstate"))
}
catch { return logger.loader(global.getText("priyansh", "notFoundPathAppstate"), "error") }

//========= Login account and start Listen Event =========//

function onBot({ models: botModel }) {
    const loginData = {};
    loginData['appState'] = appState;
    login(loginData, async(loginError, loginApiData) => {
        if (loginError) return logger(JSON.stringify(loginError), `ERROR`);
        loginApiData.setOptions(global.config.FCAOption)
        writeFileSync(appStateFile, JSON.stringify(loginApiData.getAppState(), null, '\x09'))
        global.client.api = loginApiData
        global.config.version = '1.2.14'
        global.client.timeStart = new Date().getTime(),
        
        // Initialize auto-responder with Marina Khan as owner
        logger.loader(`Auto-response system initialized - Owner: ${botOwner.name}`, "auto-response");
        logger.loader(`Bot developed and maintained by ${botOwner.name}`, "owner");
        
        function () {
            const listCommand = readdirSync(global.client.mainPath + '/Priyansh/commands').filter(command => command.endsWith('.js') && !command.includes('example') && !global.config.commandDisabled.includes(command));
            for (const command of listCommand) {
                try {
                    var module = require(global.client.mainPath + '/Priyansh/commands/' + command);
                    if (!module.config || !module.run || !module.config.commandCategory) throw new Error(global.getText('priyansh', 'errorFormat'));
                    if (global.client.commands.has(module.config.name || '')) throw new Error(global.getText('priyansh', 'nameExist'));
                    if (!module.languages || typeof module.languages != 'object' || Object.keys(module.languages).length == 0) logger.loader(global.getText('priyansh', 'notFoundLanguage', module.config.name), 'warn');
                    if (module.config.dependencies && typeof module.config.dependencies == 'object') {
                        for (const reqDependencies in module.config.dependencies) {
                            const reqDependenciesPath = join(__dirname, 'nodemodules', 'node_modules', reqDependencies);
                            try {
                                if (!global.nodemodule.hasOwnProperty(reqDependencies)) {
                                    if (listPackage.hasOwnProperty(reqDependencies) || listbuiltinModules.includes(reqDependencies)) global.nodemodule[reqDependencies] = require(reqDependencies);
                                    else global.nodemodule[reqDependencies] = require(reqDependenciesPath);
                                } else '';
                            } catch {
                                var check = false;
                                var isError;
                                logger.loader(global.getText('priyansh', 'notFoundPackage', reqDependencies, module.config.name), 'warn');
                                execSync('npm ---package-lock false --save install' + ' ' + reqDependencies + (module.config.dependencies[reqDependencies] == '*' || module.config.dependencies[reqDependencies] == '' ? '' : '@' + module.config.dependencies[reqDependencies]), { 'stdio': 'inherit', 'env': process['env'], 'shell': true, 'cwd': join(__dirname, 'nodemodules') });
                                for (let i = 1; i <= 3; i++) {
                                    try {
                                        require['cache'] = {};
                                        if (listPackage.hasOwnProperty(reqDependencies) || listbuiltinModules.includes(reqDependencies)) global['nodemodule'][reqDependencies] = require(reqDependencies);
                                        else global['nodemodule'][reqDependencies] = require(reqDependenciesPath);
                                        check = true;
                                        break;
                                    } catch (error) { isError = error; }
                                    if (check || !isError) break;
                                }
                                if (!check || isError) throw global.getText('priyansh', 'cantInstallPackage', reqDependencies, module.config.name, isError);
                            }
                        }
                        logger.loader(global.getText('priyansh', 'loadedPackage', module.config.name));
                    }
                    if (module.config.envConfig) try {
                        for (const envConfig in module.config.envConfig) {
                            if (typeof global.configModule[module.config.name] == 'undefined') global.configModule[module.config.name] = {};
                            if (typeof global.config[module.config.name] == 'undefined') global.config[module.config.name] = {};
                            if (typeof global.config[module.config.name][envConfig] !== 'undefined') global['configModule'][module.config.name][envConfig] = global.config[module.config.name][envConfig];
                            else global.configModule[module.config.name][envConfig] = module.config.envConfig[envConfig] || '';
                            if (typeof global.config[module.config.name][envConfig] == 'undefined') global.config[module.config.name][envConfig] = module.config.envConfig[envConfig] || '';
                        }
                        logger.loader(global.getText('priyansh', 'loadedConfig', module.config.name));
                    } catch (error) {
                        throw new Error(global.getText('priyansh', 'loadedConfig', module.config.name, JSON.stringify(error)));
                    }
                    if (module.onLoad) {
                        try {
                            const moduleData = {};
                            moduleData.api = loginApiData;
                            moduleData.models = botModel;
                            module.onLoad(moduleData);
                        } catch (_0x20fd5f) {
                            throw new Error(global.getText('priyansh', 'cantOnload', module.config.name, JSON.stringify(_0x20fd5f)), 'error');
                        };
                    }
                    if (module.handleEvent) global.client.eventRegistered.push(module.config.name);
                    global.client.commands.set(module.config.name, module);
                    logger.loader(global.getText('priyansh', 'successLoadModule', module.config.name));
                } catch (error) {
                    logger.loader(global.getText('priyansh', 'failLoadModule', module.config.name, error), 'error');
                };
            }
        }(),
        function() {
            const events = readdirSync(global.client.mainPath + '/Priyansh/events').filter(event => event.endsWith('.js') && !global.config.eventDisabled.includes(event));
            for (const ev of events) {
                try {
                    var event = require(global.client.mainPath + '/Priyansh/events/' + ev);
                    if (!event.config || !event.run) throw new Error(global.getText('priyansh', 'errorFormat'));
                    if (global.client.events.has(event.config.name) || '') throw new Error(global.getText('priyansh', 'nameExist'));
                    if (event.config.dependencies && typeof event.config.dependencies == 'object') {
                        for (const dependency in event.config.dependencies) {
                            const _0x21abed = join(__dirname, 'nodemodules', 'node_modules', dependency);
                            try {
                                if (!global.nodemodule.hasOwnProperty(dependency)) {
                                    if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency)) global.nodemodule[dependency] = require(dependency);
                                    else global.nodemodule[dependency] = require(_0x21abed);
                                } else '';
                            } catch {
                                let check = false;
                                let isError;
                                logger.loader(global.getText('priyansh', 'notFoundPackage', dependency, event.config.name), 'warn');
                                execSync('npm --package-lock false --save install' + dependency + (event.config.dependencies[dependency] == '*' || event.config.dependencies[dependency] == '' ? '' : '@' + event.config.dependencies[dependency]), { 'stdio': 'inherit', 'env': process['env'], 'shell': true, 'cwd': join(__dirname, 'nodemodules') });
                                for (let i = 1; i <= 3; i++) {
                                    try {
                                        require['cache'] = {};
                                        if (global.nodemodule.includes(dependency)) break;
                                        if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency)) global.nodemodule[dependency] = require(dependency);
                                        else global.nodemodule[dependency] = require(_0x21abed);
                                        check = true;
                                        break;
                                    } catch (error) { isError = error; }
                                    if (check || !isError) break;
                                }
                                if (!check || isError) throw global.getText('priyansh', 'cantInstallPackage', dependency, event.config.name);
                            }
                        }
                        logger.loader(global.getText('priyansh', 'loadedPackage', event.config.name));
                    }
                    if (event.config.envConfig) try {
                        for (const _0x5beea0 in event.config.envConfig) {
                            if (typeof global.configModule[event.config.name] == 'undefined') global.configModule[event.config.name] = {};
                            if (typeof global.config[event.config.name] == 'undefined') global.config[event.config.name] = {};
                            if (typeof global.config[event.config.name][_0x5beea0] !== 'undefined') global.configModule[event.config.name][_0x5beea0] = global.config[event.config.name][_0x5beea0];
                            else global.configModule[event.config.name][_0x5beea0] = event.config.envConfig[_0x5beea0] || '';
                            if (typeof global.config[event.config.name][_0x5beea0] == 'undefined') global.config[event.config.name][_0x5beea0] = event.config.envConfig[_0x5beea0] || '';
                        }
                        logger.loader(global.getText('priyansh', 'loadedConfig', event.config.name));
                    } catch (error) {
                        throw new Error(global.getText('priyansh', 'loadedConfig', event.config.name, JSON.stringify(error)));
                    }
                    if (event.onLoad) try {
                        const eventData = {};
                        eventData.api = loginApiData, eventData.models = botModel;
                        event.onLoad(eventData);
                    } catch (error) {
                        throw new Error(global.getText('priyansh', 'cantOnload', event.config.name, JSON.stringify(error)), 'error');
                    }
                    global.client.events.set(event.config.name, event);
                    logger.loader(global.getText('priyansh', 'successLoadModule', event.config.name));
                } catch (error) {
                    logger.loader(global.getText('priyansh', 'failLoadModule', event.config.name, error), 'error');
                }
            }
        }()
        logger.loader(global.getText('priyansh', 'finishLoadModule', global.client.commands.size, global.client.events.size)) 
        logger.loader(`Startup Time: ${((Date.now() - global.client.timeStart) / 1000).toFixed()}s`)   
        logger.loader('===== [ ' + (Date.now() - global.client.timeStart) + 'ms ] =====')
        logger.loader(`Bot Owner: ${botOwner.name} - ${botOwner.role}`)
        writeFileSync(global.client['configPath'], JSON['stringify'](global.config, null, 4), 'utf8') 
        unlinkSync(global['client']['configPath'] + '.temp');        
        const listenerData = {};
        listenerData.api = loginApiData; 
        listenerData.models = botModel;
        const listener = require('./includes/listen')(listenerData);

        function listenerCallback(error, message) {
            if (error) return logger(global.getText('priyansh', 'handleListenError', JSON.stringify(error)), 'error');
            if (['presence', 'typ', 'read_receipt'].some(data => data == message.type)) return;
            if (global.config.DeveloperMode == !![]) console.log(message);
            
            // Process auto-response before normal listener
            if (message.type === 'message' && message.body) {
                global.autoResponder.processMessage(message);
            }
            
            return listener(message);
        };
        global.handleListen = loginApiData.listenMqtt(listenerCallback);
        try {
            await checkBan(loginApiData);
        } catch (error) {
            return //process.exit(0);
        };
        if (!global.checkBan) logger(global.getText('priyansh', 'warningSourceCode'), '[ GLOBAL BAN ]');
    });
}

//========= Connecting to Database =========//

(async () => {
    try {
        await sequelize.authenticate();
        const authentication = {};
        authentication.Sequelize = Sequelize;
        authentication.sequelize = sequelize;
        const models = require('./includes/database/model')(authentication);
        logger(global.getText('priyansh', 'successConnectDatabase'), '[ DATABASE ]');
        const botData = {};
        botData.models = models
        onBot(botData);
    } catch (error) { logger(global.getText('priyansh', 'successConnectDatabase', JSON.stringify(error)), '[ DATABASE ]'); }
})();

process.on('unhandledRejection', (err, p) => {});
