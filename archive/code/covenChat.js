import { handleError, safeFunction } from './errorHandler.js';

/**
 * Coven Chat System - Manages coven communication and messaging
 * Simulated for single-player experience with bot responses
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id - Unique message identifier
 * @property {string} senderId - ID of message sender
 * @property {string} senderName - Name of message sender
 * @property {string} content - Message content
 * @property {number} timestamp - Message timestamp
 * @property {string} type - Message type ('user', 'system', 'bot', 'achievement', 'event')
 * @property {Object} metadata - Additional message metadata
 */

/**
 * @typedef {Object} ChatChannel
 * @property {string} id - Channel identifier
 * @property {string} name - Channel display name
 * @property {string} description - Channel description
 * @property {boolean} isDefault - Whether this is the default channel
 * @property {ChatMessage[]} messages - Channel messages
 * @property {number} lastActivity - Last activity timestamp
 */

/**
 * Coven Chat System class
 */
export class CovenChatSystem {
    /**
     * Create a new CovenChatSystem instance
     * @param {CovenSystem} covenSystem - Reference to coven system
     */
    constructor(covenSystem) {
        this.covenSystem = covenSystem;
        this.channels = new Map();
        this.currentChannelId = null;
        this.messageQueue = [];
        this.botResponses = [];
        this.typingUsers = new Set();
        
        // Callbacks for UI updates
        this.onMessageReceived = null;
        this.onChannelJoined = null;
        this.onChannelLeft = null;
        this.onTypingStarted = null;
        this.onTypingStopped = null;
        
        // Initialize chat system
        this.initializeChatSystem();
    }
    
    /**
     * Initialize the chat system with default channels
     * @private
     */
    initializeChatSystem() {
        // Create default channels
        this.createChannel('general', 'General', 'General coven discussion', true);
        this.createChannel('rituals', 'Rituals', 'Coordinate collaborative rituals', false);
        this.createChannel('achievements', 'Achievements', 'Share and celebrate achievements', false);
        this.createChannel('events', 'Events', 'Discuss special events and competitions', false);
        
        // Initialize bot responses
        this.initializeBotResponses();
        
        // Start bot activity simulation
        this.startBotActivity();
    }
    
    /**
     * Create a new chat channel
     * @param {string} id - Channel ID
     * @param {string} name - Channel display name
     * @param {string} description - Channel description
     * @param {boolean} isDefault - Whether this is the default channel
     * @private
     */
    createChannel(id, name, description, isDefault) {
        const channel = {
            id: id,
            name: name,
            description: description,
            isDefault: isDefault,
            messages: [],
            lastActivity: Date.now()
        };
        
        this.channels.set(id, channel);
        
        if (isDefault) {
            this.currentChannelId = id;
        }
        
        // Add welcome message
        this.addSystemMessage(id, `Welcome to the ${name} channel! ${description}`);
    }
    
    /**
     * Initialize bot responses for simulated chat activity
     * @private
     */
    initializeBotResponses() {
        this.botResponses = {
            general: [
                "Anyone else making good progress today?",
                "Just unlocked a new workstation! The production boost is amazing!",
                "Has anyone tried the new ritual yet? I'm curious about the rewards.",
                "Our coven is doing great! Keep up the good work everyone!",
                "I found a great strategy for AB production. Want to share tips?",
                "The new event looks interesting. Are we participating?",
                "Congratulations to everyone who contributed to our last ritual!",
                "I'm saving up for the next upgrade. Any recommendations?",
                "Our coven level is getting close to the next milestone!",
                "The production bonus from our last achievement is really helping!"
            ],
            rituals: [
                "We should coordinate our efforts for the next ritual.",
                "I can contribute more casting time if needed.",
                "The ritual progress is looking good! We might finish early.",
                "Does anyone know what rewards we get from this ritual?",
                "Let's try to complete this ritual before the deadline.",
                "Great teamwork everyone! The ritual is almost complete.",
                "I'll focus on production for the next ritual.",
                "Our coven synergy is really showing in these rituals.",
                "Should we prioritize production or casting for the next ritual?",
                "The ritual rewards will help us level up faster!"
            ],
            achievements: [
                "Congratulations on the new achievement!",
                "Just unlocked the 'Century of Spells' achievement!",
                "Our coven is racking up achievements quickly!",
                "The achievement rewards really help with progression.",
                "I'm so close to the next achievement milestone.",
                "Our combined achievements are making the coven stronger.",
                "The achievement celebration animations are amazing!",
                "Has anyone unlocked the secret achievements yet?",
                "The achievement points are adding up nicely!",
                "Great job everyone on reaching that achievement goal!"
            ],
            events: [
                "The current event is really exciting!",
                "I hope our coven does well in the competition.",
                "The event rewards look fantastic this time.",
                "We should coordinate our strategy for the event.",
                "Last event was great, I'm excited for this one!",
                "The seasonal events always have the best rewards.",
                "I wonder what the next event will be?",
                "Our coven placed really well in the last event!",
                "The event leaderboard is getting competitive!",
                "Let's give it our all for this event!"
            ]
        };
    }
    
    /**
     * Start bot activity simulation
     * @private
     */
    startBotActivity() {
        // Simulate bot messages every 2-5 minutes
        setInterval(() => {
            if (this.covenSystem.isInCoven() && Math.random() < 0.3) {
                this.simulateBotMessage();
            }
        }, 180000); // 3 minutes
        
        // Simulate typing indicators
        setInterval(() => {
            if (this.covenSystem.isInCoven() && Math.random() < 0.2) {
                this.simulateTypingIndicator();
            }
        }, 30000); // 30 seconds
    }
    
    /**
     * Simulate a bot message
     * @private
     */
    simulateBotMessage() {
        const channelIds = Array.from(this.channels.keys());
        const channelId = channelIds[Math.floor(Math.random() * channelIds.length)];
        const responses = this.botResponses[channelId] || this.botResponses.general;
        const message = responses[Math.floor(Math.random() * responses.length)];
        
        const botNames = ['ArcaneBot', 'CrystalAssistant', 'HexHelper', 'RitualGuide', 'CovenCompanion'];
        const botName = botNames[Math.floor(Math.random() * botNames.length)];
        
        this.addBotMessage(channelId, message, botName);
    }
    
    /**
     * Simulate typing indicator
     * @private
     */
    simulateTypingIndicator() {
        const botNames = ['ArcaneBot', 'CrystalAssistant', 'HexHelper', 'RitualGuide', 'CovenCompanion'];
        const botName = botNames[Math.floor(Math.random() * botNames.length)];
        
        this.typingUsers.add(botName);
        
        if (this.onTypingStarted) {
            this.onTypingStarted(botName);
        }
        
        // Stop typing after 2-4 seconds
        setTimeout(() => {
            this.typingUsers.delete(botName);
            
            if (this.onTypingStopped) {
                this.onTypingStopped(botName);
            }
        }, 2000 + Math.random() * 2000);
    }
    
    /**
     * Send a user message
     * @param {string} content - Message content
     * @param {string} channelId - Channel ID (optional, uses current if not provided)
     * @returns {boolean} Whether message was sent successfully
     */
    sendMessage(content, channelId = null) {
        try {
            const targetChannelId = channelId || this.currentChannelId;
            if (!targetChannelId) {
                return false;
            }
            
            const channel = this.channels.get(targetChannelId);
            if (!channel) {
                return false;
            }
            
            // Validate message content
            if (!content || content.trim().length === 0) {
                return false;
            }
            
            if (content.length > 500) {
                return false; // Message too long
            }
            
            // Create message
            const message = {
                id: this.generateMessageId(),
                senderId: this.covenSystem.playerId,
                senderName: this.covenSystem.playerName,
                content: content.trim(),
                timestamp: Date.now(),
                type: 'user',
                metadata: {}
            };
            
            // Add message to channel
            channel.messages.push(message);
            channel.lastActivity = Date.now();
            
            // Limit message history (keep last 100 messages)
            if (channel.messages.length > 100) {
                channel.messages = channel.messages.slice(-100);
            }
            
            // Trigger bot response occasionally
            if (Math.random() < 0.4) {
                setTimeout(() => {
                    this.generateContextualBotResponse(targetChannelId, content);
                }, 1000 + Math.random() * 3000);
            }
            
            if (this.onMessageReceived) {
                this.onMessageReceived(targetChannelId, message);
            }
            
            return true;
        } catch (error) {
            handleError(error, 'chatSendMessage');
            return false;
        }
    }
    
    /**
     * Generate contextual bot response
     * @param {string} channelId - Channel ID
     * @param {string} userMessage - User message to respond to
     * @private
     */
    generateContextualBotResponse(channelId, userMessage) {
        const contextualResponses = {
            'production': [
                "That's a great production strategy!",
                "Your production numbers are impressive!",
                "Have you tried the new production upgrades?",
                "Production is really key to progression!"
            ],
            'ritual': [
                "Rituals are so important for coven progression!",
                "Great teamwork on the rituals!",
                "The ritual rewards are definitely worth it!",
                "Our coven synergy really shows in rituals!"
            ],
            'achievement': [
                "Congratulations on your achievement!",
                "Achievements really help with progression!",
                "The achievement rewards are fantastic!",
                "Keep up the great work!"
            ],
            'help': [
                "I can help you with game questions!",
                "Try checking the achievements tab for goals!",
                "The coven bonuses really help with production!",
                "Don't forget to participate in events!"
            ],
            'hello': [
                "Hello there! Welcome to the coven!",
                "Hi! How's your progress today?",
                "Greetings! Ready to cast some spells?",
                "Welcome! Great to have you in the coven!"
            ]
        };
        
        let response = null;
        const lowerMessage = userMessage.toLowerCase();
        
        for (const [keyword, responses] of Object.entries(contextualResponses)) {
            if (lowerMessage.includes(keyword)) {
                response = responses[Math.floor(Math.random() * responses.length)];
                break;
            }
        }
        
        if (!response) {
            const generalResponses = this.botResponses[channelId] || this.botResponses.general;
            response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
        }
        
        const botNames = ['ArcaneBot', 'CrystalAssistant', 'HexHelper', 'RitualGuide', 'CovenCompanion'];
        const botName = botNames[Math.floor(Math.random() * botNames.length)];
        
        this.addBotMessage(channelId, response, botName);
    }
    
    /**
     * Add a bot message
     * @param {string} channelId - Channel ID
     * @param {string} content - Message content
     * @param {string} botName - Bot name
     * @private
     */
    addBotMessage(channelId, content, botName) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            return;
        }
        
        const message = {
            id: this.generateMessageId(),
            senderId: 'bot_' + botName.toLowerCase().replace(' ', '_'),
            senderName: botName,
            content: content,
            timestamp: Date.now(),
            type: 'bot',
            metadata: {}
        };
        
        channel.messages.push(message);
        channel.lastActivity = Date.now();
        
        // Limit message history
        if (channel.messages.length > 100) {
            channel.messages = channel.messages.slice(-100);
        }
        
        if (this.onMessageReceived) {
            this.onMessageReceived(channelId, message);
        }
    }
    
    /**
     * Add a system message
     * @param {string} channelId - Channel ID
     * @param {string} content - Message content
     * @private
     */
    addSystemMessage(channelId, content) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            return;
        }
        
        const message = {
            id: this.generateMessageId(),
            senderId: 'system',
            senderName: 'System',
            content: content,
            timestamp: Date.now(),
            type: 'system',
            metadata: {}
        };
        
        channel.messages.push(message);
        channel.lastActivity = Date.now();
        
        if (this.onMessageReceived) {
            this.onMessageReceived(channelId, message);
        }
    }
    
    /**
     * Add an achievement notification message
     * @param {string} achievementName - Achievement name
     * @param {string} playerName - Player who unlocked it
     */
    addAchievementMessage(achievementName, playerName) {
        const content = `🏆 ${playerName} unlocked the "${achievementName}" achievement!`;
        const message = {
            id: this.generateMessageId(),
            senderId: 'system',
            senderName: 'System',
            content: content,
            timestamp: Date.now(),
            type: 'achievement',
            metadata: { achievementName: achievementName, playerName: playerName }
        };
        
        // Add to general channel
        const generalChannel = this.channels.get('general');
        if (generalChannel) {
            generalChannel.messages.push(message);
            generalChannel.lastActivity = Date.now();
            
            if (this.onMessageReceived) {
                this.onMessageReceived('general', message);
            }
        }
        
        // Also add to achievements channel
        const achievementsChannel = this.channels.get('achievements');
        if (achievementsChannel) {
            achievementsChannel.messages.push(message);
            achievementsChannel.lastActivity = Date.now();
            
            if (this.onMessageReceived) {
                this.onMessageReceived('achievements', message);
            }
        }
    }
    
    /**
     * Add an event notification message
     * @param {string} eventName - Event name
     * @param {string} eventType - Event type ('started', 'ended', 'completed')
     */
    addEventMessage(eventName, eventType) {
        let content = '';
        
        switch (eventType) {
            case 'started':
                content = `🎉 The "${eventName}" event has started!`;
                break;
            case 'ended':
                content = `⏰ The "${eventName}" event has ended.`;
                break;
            case 'completed':
                content = `✅ Your coven completed the "${eventName}" event!`;
                break;
        }
        
        const message = {
            id: this.generateMessageId(),
            senderId: 'system',
            senderName: 'System',
            content: content,
            timestamp: Date.now(),
            type: 'event',
            metadata: { eventName: eventName, eventType: eventType }
        };
        
        // Add to events channel
        const eventsChannel = this.channels.get('events');
        if (eventsChannel) {
            eventsChannel.messages.push(message);
            eventsChannel.lastActivity = Date.now();
            
            if (this.onMessageReceived) {
                this.onMessageReceived('events', message);
            }
        }
        
        // Also add to general channel for important events
        if (eventType === 'started' || eventType === 'completed') {
            const generalChannel = this.channels.get('general');
            if (generalChannel) {
                generalChannel.messages.push(message);
                generalChannel.lastActivity = Date.now();
                
                if (this.onMessageReceived) {
                    this.onMessageReceived('general', message);
                }
            }
        }
    }
    
    /**
     * Generate a unique message ID
     * @returns {string} Unique message ID
     * @private
     */
    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    }
    
    /**
     * Switch to a different channel
     * @param {string} channelId - Channel ID to switch to
     * @returns {boolean} Whether switch was successful
     */
    switchChannel(channelId) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            return false;
        }
        
        this.currentChannelId = channelId;
        return true;
    }
    
    /**
     * Get current channel
     * @returns {Object|null} Current channel or null
     */
    getCurrentChannel() {
        return this.channels.get(this.currentChannelId) || null;
    }
    
    /**
     * Get channel by ID
     * @param {string} channelId - Channel ID
     * @returns {Object|null} Channel or null
     */
    getChannel(channelId) {
        return this.channels.get(channelId) || null;
    }
    
    /**
     * Get all channels
     * @returns {Array} Array of channels
     */
    getAllChannels() {
        return Array.from(this.channels.values());
    }
    
    /**
     * Get messages from a channel
     * @param {string} channelId - Channel ID
     * @param {number} limit - Maximum number of messages to return
     * @returns {Array} Array of messages
     */
    getMessages(channelId, limit = 50) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            return [];
        }
        
        return channel.messages.slice(-limit);
    }
    
    /**
     * Get typing users
     * @returns {Array} Array of typing user names
     */
    getTypingUsers() {
        return Array.from(this.typingUsers);
    }
    
    /**
     * Start typing indicator for current user
     */
    startTyping() {
        // In a real multiplayer implementation, this would notify other users
        // For single-player, we just track it locally
    }
    
    /**
     * Stop typing indicator for current user
     */
    stopTyping() {
        // In a real multiplayer implementation, this would notify other users
        // For single-player, we just track it locally
    }
    
    /**
     * Save chat data
     * @returns {Object} Serializable chat data
     */
    saveChatData() {
        const data = {
            channels: {},
            currentChannelId: this.currentChannelId
        };
        
        for (const [channelId, channel] of this.channels) {
            data.channels[channelId] = {
                messages: channel.messages.slice(-50), // Keep last 50 messages
                lastActivity: channel.lastActivity
            };
        }
        
        return data;
    }
    
    /**
     * Load chat data
     * @param {Object} data - Saved chat data
     */
    loadChatData(data) {
        if (!data) {
            return;
        }
        
        this.currentChannelId = data.currentChannelId || 'general';
        
        if (data.channels) {
            for (const [channelId, channelData] of Object.entries(data.channels)) {
                const channel = this.channels.get(channelId);
                if (channel) {
                    channel.messages = channelData.messages || [];
                    channel.lastActivity = channelData.lastActivity || Date.now();
                }
            }
        }
        
        // Add welcome back message
        this.addSystemMessage(this.currentChannelId, 'Welcome back to the coven chat!');
    }
}