#!/bin/bash

# Deployment script for WhatsApp API Server
set -e

echo "🚀 Starting WhatsApp API Server deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="wwebjs-bot"
BACKUP_DIR="./backups"
SSL_DIR="./ssl"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_info "Docker and Docker Compose are available."
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    mkdir -p $BACKUP_DIR
    mkdir -p $SSL_DIR
    mkdir -p uploads
    mkdir -p logs
    touch uploads/.gitkeep
    touch logs/.gitkeep
}

# Generate self-signed SSL certificates if they don't exist
generate_ssl() {
    if [[ ! -f "$SSL_DIR/cert.pem" || ! -f "$SSL_DIR/key.pem" ]]; then
        log_info "Generating self-signed SSL certificates..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout $SSL_DIR/key.pem \
            -out $SSL_DIR/cert.pem \
            -subj "/C=EG/ST=Cairo/L=Cairo/O=WhatsApp API/OU=IT Department/CN=localhost"
        
        log_warn "Self-signed SSL certificates generated. For production, replace with real certificates."
    else
        log_info "SSL certificates already exist."
    fi
}

# Check environment file
check_env() {
    if [[ ! -f ".env" ]]; then
        log_warn ".env file not found. Creating from .env.example..."
        cp .env.example .env
        log_warn "Please edit .env file with your configuration before starting the server."
    else
        log_info ".env file exists."
    fi
}

# Backup existing data
backup_data() {
    if [[ -d ".wwebjs_auth" ]]; then
        log_info "Backing up WhatsApp session data..."
        timestamp=$(date +%Y%m%d_%H%M%S)
        cp -r .wwebjs_auth $BACKUP_DIR/wwebjs_auth_$timestamp
    fi
}

# Build and start services
deploy() {
    log_info "Building and starting services..."
    
    # Pull latest images
    docker-compose pull
    
    # Build the application
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    log_info "Services started successfully!"
}

# Check service health
check_health() {
    log_info "Checking service health..."
    
    # Wait for services to start
    sleep 10
    
    # Check WhatsApp API service
    if docker-compose ps whatsapp-api | grep -q "Up"; then
        log_info "WhatsApp API service is running."
    else
        log_error "WhatsApp API service failed to start."
        docker-compose logs whatsapp-api
        exit 1
    fi
    
    # Check Nginx service
    if docker-compose ps nginx | grep -q "Up"; then
        log_info "Nginx service is running."
    else
        log_warn "Nginx service failed to start. Check logs."
        docker-compose logs nginx
    fi
    
    # Test health endpoint
    sleep 5
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_info "Health check passed. Application is accessible."
    else
        log_warn "Health check failed. Application might not be fully ready yet."
    fi
}

# Show deployment information
show_info() {
    echo ""
    echo "🎉 Deployment completed!"
    echo ""
    echo "📊 Service Information:"
    echo "  • Web Interface: https://localhost (or http://localhost)"
    echo "  • API Documentation: https://localhost/api"
    echo "  • Health Check: https://localhost/health"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  • View logs: docker-compose logs -f"
    echo "  • Stop services: docker-compose down"
    echo "  • Restart services: docker-compose restart"
    echo "  • Update services: ./deploy.sh"
    echo ""
    echo "📁 Important Directories:"
    echo "  • Session data: Docker volume 'whatsapp_sessions'"
    echo "  • Uploaded files: ./uploads"
    echo "  • Logs: ./logs"
    echo "  • Backups: ./backups"
    echo ""
    echo "⚠️  Next Steps:"
    echo "  1. Edit .env file with your configuration"
    echo "  2. For production: Replace SSL certificates in ./ssl/"
    echo "  3. Configure your firewall to allow ports 80 and 443"
    echo "  4. Set up proper DNS if deploying to a domain"
    echo ""
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        check_docker
        create_directories
        generate_ssl
        check_env
        backup_data
        deploy
        check_health
        show_info
        ;;
    "dev")
        log_info "Starting development environment..."
        check_docker
        create_directories
        check_env
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    "stop")
        log_info "Stopping services..."
        docker-compose down
        log_info "Services stopped."
        ;;
    "restart")
        log_info "Restarting services..."
        docker-compose restart
        log_info "Services restarted."
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "clean")
        log_warn "This will remove all containers, images, and volumes. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            docker-compose down -v --rmi all --remove-orphans
            docker system prune -f
            log_info "Cleanup completed."
        else
            log_info "Cleanup cancelled."
        fi
        ;;
    "backup")
        log_info "Creating backup..."
        backup_data
        docker-compose exec whatsapp-api tar -czf /tmp/app_backup.tar.gz uploads logs
        docker cp $(docker-compose ps -q whatsapp-api):/tmp/app_backup.tar.gz $BACKUP_DIR/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz
        log_info "Backup created in $BACKUP_DIR"
        ;;
    "help")
        echo "WhatsApp API Server Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy    Deploy the application (default)"
        echo "  dev       Start development environment"
        echo "  stop      Stop all services"
        echo "  restart   Restart all services"
        echo "  logs      Show service logs"
        echo "  clean     Remove all containers and images"
        echo "  backup    Create a backup of application data"
        echo "  help      Show this help message"
        echo ""
        ;;
    *)
        log_error "Unknown command: $1"
        log_info "Run '$0 help' for usage information."
        exit 1
        ;;
esac