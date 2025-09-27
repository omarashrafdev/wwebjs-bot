const { Client, Databases, Storage } = require('node-appwrite');

class AppwriteService {
    constructor() {
        this.client = null;
        this.databases = null;
        this.storage = null;
        this.databaseId = process.env.APPWRITE_DATABASE_ID;
        this.sessionsCollectionId = process.env.APPWRITE_SESSIONS_COLLECTION_ID;
        this.messagesCollectionId = process.env.APPWRITE_MESSAGES_COLLECTION_ID;
        this.contactsCollectionId = process.env.APPWRITE_CONTACTS_COLLECTION_ID;
        this.bucketId = process.env.APPWRITE_BUCKET_ID;
        this.initialized = false;
    }

    initialize() {
        try {
            this.client = new Client()
                .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
                .setProject(process.env.APPWRITE_PROJECT_ID)
                .setKey(process.env.APPWRITE_API_KEY);

            this.databases = new Databases(this.client);
            this.storage = new Storage(this.client);
            this.initialized = true;
            
            console.log('✅ Appwrite service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Appwrite service:', error);
            throw error;
        }
    }

    // Session Management
    async saveSession(sessionId, sessionData, status = 'connected') {
        if (!this.initialized) this.initialize();
        
        try {
            const document = {
                sessionId,
                sessionData: JSON.stringify(sessionData),
                status,
                lastActive: new Date().toISOString()
            };

            // Try to update existing session first
            try {
                const existing = await this.databases.listDocuments(
                    this.databaseId,
                    this.sessionsCollectionId,
                    [`sessionId=${sessionId}`]
                );

                if (existing.documents.length > 0) {
                    return await this.databases.updateDocument(
                        this.databaseId,
                        this.sessionsCollectionId,
                        existing.documents[0].$id,
                        document
                    );
                }
            } catch (error) {
                // Document doesn't exist, create new
            }

            return await this.databases.createDocument(
                this.databaseId,
                this.sessionsCollectionId,
                'unique()',
                document
            );
        } catch (error) {
            console.error('Failed to save session:', error);
            throw error;
        }
    }

    async getSession(sessionId) {
        if (!this.initialized) this.initialize();
        
        try {
            const result = await this.databases.listDocuments(
                this.databaseId,
                this.sessionsCollectionId,
                [`sessionId=${sessionId}`]
            );

            if (result.documents.length > 0) {
                const session = result.documents[0];
                return {
                    sessionId: session.sessionId,
                    sessionData: JSON.parse(session.sessionData),
                    status: session.status,
                    lastActive: session.lastActive
                };
            }
            return null;
        } catch (error) {
            console.error('Failed to get session:', error);
            return null;
        }
    }

    async deleteSession(sessionId) {
        if (!this.initialized) this.initialize();
        
        try {
            const result = await this.databases.listDocuments(
                this.databaseId,
                this.sessionsCollectionId,
                [`sessionId=${sessionId}`]
            );

            for (const doc of result.documents) {
                await this.databases.deleteDocument(
                    this.databaseId,
                    this.sessionsCollectionId,
                    doc.$id
                );
            }
            return true;
        } catch (error) {
            console.error('Failed to delete session:', error);
            return false;
        }
    }

    // Message Logging
    async logMessage(messageData) {
        if (!this.initialized) this.initialize();
        
        try {
            const document = {
                messageId: messageData.messageId || 'unique()',
                sessionId: messageData.sessionId,
                recipientNumber: messageData.recipientNumber,
                messageContent: messageData.messageContent,
                messageType: messageData.messageType || 'text',
                status: messageData.status || 'pending',
                sentAt: messageData.sentAt || null,
                errorMessage: messageData.errorMessage || null
            };

            return await this.databases.createDocument(
                this.databaseId,
                this.messagesCollectionId,
                'unique()',
                document
            );
        } catch (error) {
            console.error('Failed to log message:', error);
            throw error;
        }
    }

    async updateMessageStatus(messageId, status, errorMessage = null) {
        if (!this.initialized) this.initialize();
        
        try {
            const result = await this.databases.listDocuments(
                this.databaseId,
                this.messagesCollectionId,
                [`messageId=${messageId}`]
            );

            if (result.documents.length > 0) {
                const updateData = {
                    status,
                    sentAt: status === 'sent' ? new Date().toISOString() : null
                };
                
                if (errorMessage) {
                    updateData.errorMessage = errorMessage;
                }

                return await this.databases.updateDocument(
                    this.databaseId,
                    this.messagesCollectionId,
                    result.documents[0].$id,
                    updateData
                );
            }
        } catch (error) {
            console.error('Failed to update message status:', error);
            throw error;
        }
    }

    async getMessageHistory(sessionId, limit = 100) {
        if (!this.initialized) this.initialize();
        
        try {
            const result = await this.databases.listDocuments(
                this.databaseId,
                this.messagesCollectionId,
                [
                    `sessionId=${sessionId}`,
                    'orderDesc($createdAt)',
                    `limit(${limit})`
                ]
            );

            return result.documents.map(doc => ({
                messageId: doc.messageId,
                recipientNumber: doc.recipientNumber,
                messageContent: doc.messageContent,
                messageType: doc.messageType,
                status: doc.status,
                sentAt: doc.sentAt,
                errorMessage: doc.errorMessage,
                createdAt: doc.$createdAt
            }));
        } catch (error) {
            console.error('Failed to get message history:', error);
            return [];
        }
    }

    // Contact Management
    async saveContacts(sessionId, contacts) {
        if (!this.initialized) this.initialize();
        
        try {
            // Clear existing contacts for this session
            await this.clearContacts(sessionId);

            // Save new contacts
            const savePromises = contacts.map(contact => {
                return this.databases.createDocument(
                    this.databaseId,
                    this.contactsCollectionId,
                    'unique()',
                    {
                        sessionId,
                        contactId: contact.id._serialized,
                        phoneNumber: contact.id.user || contact.number,
                        contactName: contact.name || contact.pushname || null,
                        isGroup: contact.isGroup || false,
                        lastSeen: contact.lastSeen || null
                    }
                );
            });

            await Promise.all(savePromises);
            return true;
        } catch (error) {
            console.error('Failed to save contacts:', error);
            return false;
        }
    }

    async getContacts(sessionId) {
        if (!this.initialized) this.initialize();
        
        try {
            const result = await this.databases.listDocuments(
                this.databaseId,
                this.contactsCollectionId,
                [`sessionId=${sessionId}`]
            );

            return result.documents.map(doc => ({
                contactId: doc.contactId,
                phoneNumber: doc.phoneNumber,
                contactName: doc.contactName,
                isGroup: doc.isGroup,
                lastSeen: doc.lastSeen
            }));
        } catch (error) {
            console.error('Failed to get contacts:', error);
            return [];
        }
    }

    async clearContacts(sessionId) {
        if (!this.initialized) this.initialize();
        
        try {
            const result = await this.databases.listDocuments(
                this.databaseId,
                this.contactsCollectionId,
                [`sessionId=${sessionId}`]
            );

            const deletePromises = result.documents.map(doc =>
                this.databases.deleteDocument(
                    this.databaseId,
                    this.contactsCollectionId,
                    doc.$id
                )
            );

            await Promise.all(deletePromises);
            return true;
        } catch (error) {
            console.error('Failed to clear contacts:', error);
            return false;
        }
    }

    // File Storage
    async uploadFile(file, fileName) {
        if (!this.initialized) this.initialize();
        
        try {
            const result = await this.storage.createFile(
                this.bucketId,
                'unique()',
                file,
                fileName
            );

            return {
                fileId: result.$id,
                fileName: result.name,
                size: result.sizeOriginal,
                mimeType: result.mimeType,
                url: this.storage.getFileView(this.bucketId, result.$id)
            };
        } catch (error) {
            console.error('Failed to upload file:', error);
            throw error;
        }
    }

    async deleteFile(fileId) {
        if (!this.initialized) this.initialize();
        
        try {
            await this.storage.deleteFile(this.bucketId, fileId);
            return true;
        } catch (error) {
            console.error('Failed to delete file:', error);
            return false;
        }
    }

    // Analytics and Statistics
    async getStatistics(sessionId) {
        if (!this.initialized) this.initialize();
        
        try {
            const [messagesResult, contactsResult] = await Promise.all([
                this.databases.listDocuments(
                    this.databaseId,
                    this.messagesCollectionId,
                    [`sessionId=${sessionId}`, 'limit(1000)']
                ),
                this.databases.listDocuments(
                    this.databaseId,
                    this.contactsCollectionId,
                    [`sessionId=${sessionId}`, 'limit(1000)']
                )
            ]);

            const messages = messagesResult.documents;
            const totalMessages = messages.length;
            const sentMessages = messages.filter(m => m.status === 'sent').length;
            const failedMessages = messages.filter(m => m.status === 'failed').length;
            const pendingMessages = messages.filter(m => m.status === 'pending').length;

            return {
                totalMessages,
                sentMessages,
                failedMessages,
                pendingMessages,
                totalContacts: contactsResult.documents.length,
                successRate: totalMessages > 0 ? (sentMessages / totalMessages * 100).toFixed(2) : 0
            };
        } catch (error) {
            console.error('Failed to get statistics:', error);
            return null;
        }
    }
}

module.exports = AppwriteService;