// WhatsApp API Client-side JavaScript
class WhatsAppClient {
    constructor() {
        this.socket = io();
        this.messagesSent = 0;
        this.messagesReceived = 0;
        this.isConnected = false;
        
        this.initializeSocketEvents();
        this.initializeFormEvents();
        this.initializeUIEvents();
    }

    initializeSocketEvents() {
        // Connection status
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.addLogEntry('Connected to server', 'info');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus('disconnected', 'Disconnected from server');
            this.addLogEntry('Disconnected from server', 'error');
        });

        // WhatsApp events
        this.socket.on('qr', (qrCode) => {
            console.log('QR code received');
            this.showQRCode(qrCode);
            this.updateConnectionStatus('connecting', 'Scan QR code with WhatsApp');
        });

        this.socket.on('ready', (clientInfo) => {
            console.log('WhatsApp client ready', clientInfo);
            this.hideQRCode();
            this.showConnectedInfo(clientInfo);
            this.updateConnectionStatus('connected', 'Connected and ready');
            this.isConnected = true;
            this.addLogEntry('WhatsApp client connected successfully', 'info');
        });

        this.socket.on('authenticated', () => {
            console.log('WhatsApp client authenticated');
            this.addLogEntry('WhatsApp client authenticated', 'info');
        });

        this.socket.on('auth_failure', (message) => {
            console.error('Authentication failed:', message);
            this.updateConnectionStatus('error', 'Authentication failed');
            this.addLogEntry(`Authentication failed: ${message}`, 'error');
        });

        this.socket.on('disconnected', (reason) => {
            console.log('WhatsApp client disconnected:', reason);
            this.updateConnectionStatus('disconnected', 'WhatsApp disconnected');
            this.hideConnectedInfo();
            this.isConnected = false;
            this.addLogEntry(`WhatsApp disconnected: ${reason}`, 'error');
        });

        this.socket.on('message_received', (message) => {
            console.log('Message received:', message);
            this.messagesReceived++;
            this.updateStats();
            this.addLogEntry(`Message from ${message.from}: ${message.body}`, 'received');
        });

        this.socket.on('error', (error) => {
            console.error('WhatsApp error:', error);
            this.showToast('Error: ' + error, 'error');
            this.addLogEntry(`Error: ${error}`, 'error');
        });

        this.socket.on('status', (status) => {
            console.log('Status update:', status);
            if (status.isReady) {
                this.isConnected = true;
                this.updateConnectionStatus('connected', 'Connected and ready');
            } else if (status.hasQR) {
                this.updateConnectionStatus('connecting', 'Scan QR code');
            } else {
                this.updateConnectionStatus('connecting', 'Initializing...');
            }
        });
    }

    initializeFormEvents() {
        // Single message form
        const singleForm = document.getElementById('singleMessageForm');
        singleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendSingleMessage();
        });

        // Bulk message form
        const bulkForm = document.getElementById('bulkMessageForm');
        bulkForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendBulkMessages();
        });

        // Media message form
        const mediaForm = document.getElementById('mediaMessageForm');
        mediaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMediaMessage();
        });

        // Character counter for message textarea
        const messageTextarea = document.getElementById('message');
        const charCountElement = document.getElementById('charCount');
        messageTextarea.addEventListener('input', () => {
            const length = messageTextarea.value.length;
            charCountElement.textContent = length;
            
            if (length > 3500) {
                charCountElement.className = 'char-counter danger';
            } else if (length > 3000) {
                charCountElement.className = 'char-counter warning';
            } else {
                charCountElement.className = 'char-counter';
            }
        });

        // JSON validation for bulk contacts
        const bulkContactsTextarea = document.getElementById('bulkContacts');
        bulkContactsTextarea.addEventListener('blur', () => {
            try {
                const contacts = JSON.parse(bulkContactsTextarea.value);
                if (!Array.isArray(contacts)) {
                    throw new Error('Must be an array');
                }
                bulkContactsTextarea.classList.remove('is-invalid');
                bulkContactsTextarea.classList.add('is-valid');
            } catch (error) {
                bulkContactsTextarea.classList.remove('is-valid');
                bulkContactsTextarea.classList.add('is-invalid');
            }
        });
    }

    initializeUIEvents() {
        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.socket.emit('restart-client');
            this.showToast('Restarting WhatsApp client...', 'info');
            this.addLogEntry('Restarting WhatsApp client...', 'info');
        });

        // Clear log button
        document.getElementById('clearLogBtn').addEventListener('click', () => {
            document.getElementById('messageLog').innerHTML = '';
        });

        // Tab switching
        const tabLinks = document.querySelectorAll('button[data-bs-toggle="tab"]');
        tabLinks.forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                // Reset forms when switching tabs
                const forms = document.querySelectorAll('form');
                forms.forEach(form => {
                    if (!form.contains(e.target)) {
                        form.reset();
                    }
                });
            });
        });
    }

    async sendSingleMessage() {
        if (!this.isConnected) {
            this.showToast('WhatsApp client is not connected', 'error');
            return;
        }

        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const message = document.getElementById('message').value.trim();
        const sendBtn = document.getElementById('sendBtn');

        if (!phoneNumber || !message) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        const originalText = sendBtn.innerHTML;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        sendBtn.disabled = true;

        try {
            const response = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    number: phoneNumber,
                    message: message
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('Message sent successfully!', 'success');
                this.addLogEntry(`Message sent to ${phoneNumber}: ${message}`, 'sent');
                this.messagesSent++;
                this.updateStats();
                document.getElementById('singleMessageForm').reset();
                document.getElementById('charCount').textContent = '0';
            } else {
                this.showToast('Failed to send message: ' + result.message, 'error');
                this.addLogEntry(`Failed to send message to ${phoneNumber}: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.showToast('Error sending message: ' + error.message, 'error');
            this.addLogEntry(`Error sending message: ${error.message}`, 'error');
        } finally {
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
        }
    }

    async sendBulkMessages() {
        if (!this.isConnected) {
            this.showToast('WhatsApp client is not connected', 'error');
            return;
        }

        const contactsText = document.getElementById('bulkContacts').value.trim();
        const message = document.getElementById('bulkMessage').value.trim();
        const delay = parseInt(document.getElementById('messageDelay').value) || 2000;
        const sendBtn = document.getElementById('sendBulkBtn');

        if (!contactsText || !message) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        let contacts;
        try {
            contacts = JSON.parse(contactsText);
            if (!Array.isArray(contacts) || contacts.length === 0) {
                throw new Error('Contacts must be a non-empty array');
            }
        } catch (error) {
            this.showToast('Invalid contacts JSON: ' + error.message, 'error');
            return;
        }

        // Show loading state
        const originalText = sendBtn.innerHTML;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        sendBtn.disabled = true;

        try {
            const response = await fetch('/api/whatsapp/send-bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contacts: contacts,
                    message: message,
                    options: { delay: delay }
                })
            });

            const result = await response.json();

            if (result.success) {
                const { summary } = result.data;
                this.showToast(`Bulk messages completed: ${summary.success} successful, ${summary.failed} failed`, 'success');
                this.addLogEntry(`Bulk messages sent to ${summary.total} contacts: ${summary.success} successful, ${summary.failed} failed`, 'info');
                this.messagesSent += summary.success;
                this.updateStats();

                // Show detailed results
                this.showBulkResults(result.data.results);
            } else {
                this.showToast('Failed to send bulk messages: ' + result.message, 'error');
                this.addLogEntry(`Failed to send bulk messages: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error sending bulk messages:', error);
            this.showToast('Error sending bulk messages: ' + error.message, 'error');
            this.addLogEntry(`Error sending bulk messages: ${error.message}`, 'error');
        } finally {
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
        }
    }

    async sendMediaMessage() {
        if (!this.isConnected) {
            this.showToast('WhatsApp client is not connected', 'error');
            return;
        }

        const phoneNumber = document.getElementById('mediaPhoneNumber').value.trim();
        const mediaFile = document.getElementById('mediaFile').files[0];
        const caption = document.getElementById('mediaCaption').value.trim();
        const sendBtn = document.getElementById('sendMediaBtn');

        if (!phoneNumber || !mediaFile) {
            this.showToast('Please fill in phone number and select a media file', 'error');
            return;
        }

        // Show loading state
        const originalText = sendBtn.innerHTML;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        sendBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('number', phoneNumber);
            formData.append('media', mediaFile);
            if (caption) {
                formData.append('message', caption);
            }

            const response = await fetch('/api/whatsapp/send-media', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('Media message sent successfully!', 'success');
                this.addLogEntry(`Media message sent to ${phoneNumber}${caption ? ': ' + caption : ''}`, 'sent');
                this.messagesSent++;
                this.updateStats();
                document.getElementById('mediaMessageForm').reset();
            } else {
                this.showToast('Failed to send media message: ' + result.message, 'error');
                this.addLogEntry(`Failed to send media message to ${phoneNumber}: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error sending media message:', error);
            this.showToast('Error sending media message: ' + error.message, 'error');
            this.addLogEntry(`Error sending media message: ${error.message}`, 'error');
        } finally {
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
        }
    }

    showQRCode(qrCodeData) {
        document.getElementById('qrCode').src = qrCodeData;
        document.getElementById('qrContainer').style.display = 'block';
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('statusMessage').textContent = 'Scan QR code with WhatsApp';
        document.getElementById('connectedInfo').style.display = 'none';
    }

    hideQRCode() {
        document.getElementById('qrContainer').style.display = 'none';
        document.getElementById('loadingSpinner').style.display = 'none';
    }

    showConnectedInfo(clientInfo) {
        document.getElementById('connectedInfo').style.display = 'block';
        if (clientInfo && clientInfo.user) {
            document.getElementById('userInfo').textContent = `Connected as: ${clientInfo.user.pushname || clientInfo.user.me}`;
        }
    }

    hideConnectedInfo() {
        document.getElementById('connectedInfo').style.display = 'none';
    }

    updateConnectionStatus(status, message) {
        const statusElement = document.getElementById('connectionStatus');
        const statusClasses = {
            'connecting': 'bg-warning',
            'connected': 'bg-success',
            'error': 'bg-danger',
            'disconnected': 'bg-secondary'
        };

        // Remove all status classes
        statusElement.className = 'badge me-3';
        statusElement.classList.add(statusClasses[status] || 'bg-secondary');

        statusElement.innerHTML = `<i class="fas fa-circle"></i> ${message}`;
    }

    updateStats() {
        document.getElementById('messagesSent').textContent = this.messagesSent;
        document.getElementById('messagesReceived').textContent = this.messagesReceived;
    }

    addLogEntry(message, type = 'info') {
        const logContainer = document.getElementById('messageLog');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `
            <div class="log-timestamp">${timestamp}</div>
            <div class="log-content">${this.escapeHtml(message)}</div>
        `;

        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;

        // Limit log entries to prevent memory issues
        const entries = logContainer.querySelectorAll('.log-entry');
        if (entries.length > 100) {
            entries[0].remove();
        }
    }

    showBulkResults(results) {
        let resultsHtml = '<div class="bulk-results"><h6>Bulk Message Results:</h6>';
        
        results.forEach((result, index) => {
            const contact = result.contact;
            const status = result.status;
            const statusClass = status === 'success' ? 'success' : 'error';
            const statusText = status === 'success' ? '✓ Sent' : '✗ Failed';
            const errorText = result.error ? ` - ${result.error}` : '';
            
            resultsHtml += `
                <div class="bulk-result-item ${statusClass}">
                    <strong>${contact.name || 'Unknown'}</strong> (${contact.number}) - ${statusText}${errorText}
                </div>
            `;
        });
        
        resultsHtml += '</div>';
        
        // Add to log
        this.addLogEntry(resultsHtml, 'info');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastBody = toast.querySelector('.toast-body');
        
        // Set message
        toastBody.textContent = message;
        
        // Set type-specific styling
        toast.className = 'toast align-items-center border-0';
        switch (type) {
            case 'success':
                toast.classList.add('bg-success', 'text-white');
                break;
            case 'error':
                toast.classList.add('bg-danger', 'text-white');
                break;
            case 'warning':
                toast.classList.add('bg-warning', 'text-dark');
                break;
            default:
                toast.classList.add('bg-info', 'text-white');
        }
        
        // Show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the client when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.whatsappClient = new WhatsAppClient();
});

// Add some utility functions for testing
window.testMessage = function(number, message) {
    fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            number: number,
            message: message
        })
    }).then(response => response.json())
    .then(data => console.log('Test message result:', data))
    .catch(error => console.error('Test message error:', error));
};

window.getStatus = function() {
    fetch('/api/whatsapp/status')
    .then(response => response.json())
    .then(data => console.log('Status:', data))
    .catch(error => console.error('Status error:', error));
};